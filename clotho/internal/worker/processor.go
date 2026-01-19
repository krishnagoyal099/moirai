package worker

import (
	"context"
	"log"
	"moirai/clotho/internal/capture"
	"moirai/clotho/internal/hooks"
	"moirai/clotho/internal/telemetry"
	"time"
)

const (
	IdleThresholdSeconds  = 60
	TimerSnapshotInterval = 5 * time.Minute
	FocusCooldownDuration = 15 * time.Minute
	TickRate              = 1 * time.Second

	// Flow State Constants
	FlowKPSMultiplier = 15.0   // 1 Key/Sec = 15 Points (Typing is king)
	FlowMouseDivider  = 2000.0 // 2000 Pixels = 1 Point (Mouse is secondary)
	FlowSwitchPenalty = 25.0   // Instant -25 points for changing windows
	FlowDecay         = 0.8    // Smoothing: 80% history, 20% new input
)

type Processor struct {
	lister        *hooks.Listener
	store         *telemetry.Store
	capturer      *capture.ScreenCapturer
	session       *hooks.SessionDetector
	lastFlowScore float64

	// State for Logic
	lastTitle        string
	lastSnapshotTime time.Time
	idleTimer        int
	isIdle           bool
	isLocked         bool
}

func NewProcessor(l *hooks.Listener, s *telemetry.Store, c *capture.ScreenCapturer) *Processor {
	return &Processor{
		lister:           l,
		store:            s,
		capturer:         c,
		session:          hooks.NewSessionDetector(),
		lastTitle:        "",
		lastSnapshotTime: time.Now().Add(-TimerSnapshotInterval), // Allow immediate snap if needed
		idleTimer:        0,
		isIdle:           false,
		isLocked:         false,
		lastFlowScore:    0.0,
	}
}

func (p *Processor) Start(ctx context.Context, done chan struct{}) {
	ticker := time.NewTicker(TickRate)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			log.Println("INFO: Processor stopping...")
			p.session.Stop()
			p.finalizeSession()
			close(done)
			return
		case locked := <-p.session.Locked():
			p.isLocked = locked
			if locked {
				log.Println("INFO: Screen locked. Recording paused.")
			} else {
				log.Println("INFO: Screen unlocked. Recording resumed.")
			}
		case <-ticker.C:
			if p.isLocked {
				continue
			}
			p.tick()
		}
	}
}

func (p *Processor) tick() {
	// 1. Senses
	state, distSq := p.lister.GetState()

	// DEBUG: Uncomment to see raw stream every 5 seconds
	// if time.Now().Second()%5 == 0 {
	// 	log.Printf("[DEBUG] Mouse: %.0f | KPS: %.2f | Idle: %v", distSq, state.KeysPerSec, p.isIdle)
	// }

	hasMouseActivity := distSq > 0 || (state.Title != p.lastTitle && state.Title != "")
	hasKeyboardActivity := state.KeysPerSec > 0.1
	isActive := hasMouseActivity || hasKeyboardActivity

	// Flag for Flow Calculation
	didSwitchFocus := false

	// 2. Activity Logic (Idle Detection)
	if isActive {
		p.idleTimer = 0
		if p.isIdle {
			// Transition: Idle -> Active
			p.isIdle = false
			p.store.AddEvent(telemetry.Event{
				Timestamp: time.Now(),
				EventType: "idle_end",
				Details:   "User returned",
			})
			log.Println("EVENT: User returned from idle")
		}
	} else {
		p.idleTimer++
		if !p.isIdle && p.idleTimer > IdleThresholdSeconds {
			// Transition: Active -> Idle
			p.isIdle = true
			p.store.AddEvent(telemetry.Event{
				Timestamp: time.Now(),
				EventType: "idle_start",
				Details:   "User went idle",
			})
			log.Println("EVENT: User went idle")
		}
	}

	// 3. Smart Periodic Snapshot
	// Time-based trigger: ensures we get data at regular intervals
	if time.Since(p.lastSnapshotTime) > TimerSnapshotInterval && !p.isIdle {
		p.tryCapture("timer")
	}

	// 4. Smart Focus Change Logic
	// Only capture if we haven't captured recently (Cooldown).
	if state.Title != "" && state.Title != p.lastTitle {
		evt := telemetry.Event{
			Timestamp:   time.Now(),
			EventType:   "focus_change",
			Application: state.Process,
			Title:       state.Title,
			Details:     "Window activated",
		}
		p.store.AddEvent(evt)
		p.lastTitle = state.Title
		log.Printf("EVENT: Focus Changed -> %s", state.Title)

		// Mark that we switched focus (for Flow Penalty)
		didSwitchFocus = true

		// Check Cooldown: Only snap if it's been a while
		if time.Since(p.lastSnapshotTime) > FocusCooldownDuration {
			p.tryCapture("focus_change")
		} else {
			log.Printf("CAPTURE: Skipped (Focus change too soon, respecting cooldown)")
		}
	}

	// 5. Update Metrics (Raw Data)
	if distSq > 0 {
		p.store.UpdateMetrics(distSq)
	}

	// Update Keystrokes (If KPS > 0, add it to total)
	if state.KeysPerSec > 0 {
		p.store.UpdateKeystrokes(int64(state.KeysPerSec))
	}

	// 6. Calculate and Update Flow Score
	// We pass KPS, Mouse Distance, and whether the user switched windows.
	currentFlow := p.calculateFlowScore(state.KeysPerSec, distSq, didSwitchFocus, p.isIdle)
	p.store.UpdateFlowScore(currentFlow)

	// 7. Periodic Flush
	if time.Now().Second()%10 == 0 {
		if err := p.store.Flush(); err != nil {
			log.Printf("ERROR: Flush failed: %v", err)
		}
	}
}

// calculateFlowScore implements the "Deep Work" logic
func (p *Processor) calculateFlowScore(kps float64, mouseDist float64, switched bool, isIdle bool) float64 {
	// Get previous score from store (defaults to 0 if fresh)
	previousScore := p.lastFlowScore

	// 1. Calculate Raw Score for this second
	// Points for Typing (Primary)
	points := kps * FlowKPSMultiplier

	// Points for Mouse (Secondary)
	points += (mouseDist / FlowMouseDivider)

	// Penalty for switching focus (The "Context Switch" tax)
	if switched {
		points -= FlowSwitchPenalty
	}

	// Penalty for being idle
	if isIdle {
		points = 0
	}

	// 2. Clamp Raw Score (0 to 100)
	if points < 0 {
		points = 0
	}
	if points > 100 {
		points = 100
	}

	// 3. Smooth the score (Weighted Moving Average)
	// Formula: (Old * 0.8) + (New * 0.2)
	newScore := (previousScore * FlowDecay) + (points * (1.0 - FlowDecay))

	return newScore
}

// tryCapture centralizes the capture logic
func (p *Processor) tryCapture(trigger string) {
	state, _ := p.lister.GetState()
	filename, err := p.capturer.CaptureEvent(trigger)
	if err != nil {
		log.Printf("WARN: Screenshot failed: %v", err)
	} else if filename != "" {
		p.lastSnapshotTime = time.Now()
		p.store.AddEvent(telemetry.Event{
			Timestamp: time.Now(),
			EventType: "screenshot",
			Title:     state.Title,
			Details:   filename,
		})
		log.Printf("CAPTURE: Saved %s (trigger: %s)", filename, trigger)
	} else {
		log.Printf("CAPTURE: Skipped (Duplicate image)")
	}
}

func (p *Processor) finalizeSession() {
	if err := p.store.Flush(); err != nil {
		log.Printf("ERROR: Final flush failed: %v", err)
	}
}
