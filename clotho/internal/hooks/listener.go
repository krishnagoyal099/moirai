package hooks

import (
	"sync"
	"sync/atomic"
	"syscall"
	"time"

	"github.com/go-vgo/robotgo"
)

// State represents the current snapshot of the user's environment.
type State struct {
	MouseX     int
	MouseY     int
	Title      string
	Process    string
	Timestamp  int64
	KeysPerSec float64
}

// Listener tracks the previous state.
type Listener struct {
	prevX     int
	prevY     int
	prevTitle string

	// Keyboard tracking
	keyCount    int64     // Raw atomic counter (never resets to 0 automatically)
	lastKPS     float64   // The calculated KPS value from the last second
	lastCheck   time.Time // When we last calculated KPS
	kpsLock     sync.Mutex
	hookStarted bool
}

func NewListener() *Listener {
	l := &Listener{
		prevX:     -1,
		prevY:     -1,
		prevTitle: "",
		lastCheck: time.Now(),
	}

	// Start keyboard hook in background
	go l.startKeyboardHook()

	return l
}

// GetState polls the OS for current metrics.
// IMPORTANT: We calculate KPS HERE, right before returning the state.
func (l *Listener) GetState() (State, float64) {
	x, y := robotgo.GetMousePos()
	title := robotgo.GetTitle()

	// Calculate Mouse Odometry (Euclidean distance squared)
	distance := 0.0
	if l.prevX != -1 && l.prevY != -1 {
		dx := float64(x - l.prevX)
		dy := float64(y - l.prevY)
		distance = (dx*dx + dy*dy)
	}

	// Update state
	l.prevX = x
	l.prevY = y
	l.prevTitle = title

	// FIX: Calculate KPS at the moment of request (Snapshot)
	kps := l.calculateKPS()

	// Fallback for Process name
	processName := "active_window"
	if title != "" {
		processName = "user_session"
	}

	return State{
		MouseX:     x,
		MouseY:     y,
		Title:      title,
		Process:    processName,
		KeysPerSec: kps,
	}, distance
}

// startKeyboardHook uses Win32 GetAsyncKeyState polling.
func (l *Listener) startKeyboardHook() {
	if l.hookStarted {
		return
	}
	l.hookStarted = true

	user32 := syscall.NewLazyDLL("user32.dll")
	getAsyncKeyState := user32.NewProc("GetAsyncKeyState")

	for {
		// Scan range 1 to 255
		for vk := 0x01; vk <= 0xFF; vk++ {
			ret, _, _ := getAsyncKeyState.Call(uintptr(vk))
			// Bit 0 indicates the key was pressed since last check
			if ret&1 != 0 {
				// We just increment. We do NOT reset here.
				atomic.AddInt64(&l.keyCount, 1)
			}
		}
		time.Sleep(20 * time.Millisecond)
	}
}

// calculateKPS calculates the rate since the last time this function was called.
func (l *Listener) calculateKPS() float64 {
	l.kpsLock.Lock()
	defer l.kpsLock.Unlock()

	now := time.Now()
	elapsed := now.Sub(l.lastCheck).Seconds()

	// We enforce a minimum check time of 0.5 seconds.
	// Why? If we check too fast (e.g. 0.1s), 1 keypress = 10 KPS, which looks like noise.
	// We wait until at least 0.5s has passed to calculate a stable rate.
	if elapsed < 0.5 {
		return l.lastKPS // Return the old value until enough time passes
	}

	// Read the current count and reset it to 0 (Snapshot)
	count := atomic.SwapInt64(&l.keyCount, 0)

	// Calculate Rate
	kps := float64(count) / elapsed

	// Update State
	l.lastKPS = kps
	l.lastCheck = now

	return kps
}
