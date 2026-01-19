package telemetry

import "time"

// DailyPayload is the root object that will be serialized to raw_telemetry.json
type DailyPayload struct {
	Meta     MetaInfo       `json:"meta"`
	Metrics  SessionMetrics `json:"metrics"`
	Events   []Event        `json:"events"`
	LastSync time.Time      `json:"last_sync"`
}

// MetaInfo provides high-level context for the day.
type MetaInfo struct {
	Date      string `json:"date"`       // YYYY-MM-DD
	DeviceID  string `json:"device_id"`  // Unique ID for this machine
	OS        string `json:"os"`         // go/runtime.GOOS
	Timezone  string `json:"timezone"`   // e.g., America/New_York
	ClothoVer string `json:"clotho_ver"` // Version of the daemon
}

// SessionMetrics represents aggregated calculations for the day.
type SessionMetrics struct {
	TotalKeystrokes int     `json:"total_keystrokes"`
	TotalMouseDist  float64 `json:"total_mouse_dist_pixels"`
	IdleMinutes     int     `json:"idle_minutes"`
	FlowScoreEst    float64 `json:"flow_score_estimate"`
	TopWindow       string  `json:"top_window"`
}

// Event represents a single atomic action or state change.
type Event struct {
	Timestamp   time.Time `json:"ts"`
	EventType   string    `json:"type"` // "focus_change", "screenshot", "idle_start", "idle_end"
	Application string    `json:"app,omitempty"`
	Title       string    `json:"title,omitempty"`
	Details     string    `json:"details,omitempty"` // e.g. filename of screenshot
}

// ScreenshotMetadata stores data about the images saved (Internal use mainly).
type ScreenshotMetadata struct {
	Filename string    `json:"filename"`
	TakenAt  time.Time `json:"taken_at"`
	Trigger  string    `json:"trigger"` // "window_change", "high_intensity", "manual"
	Hash     string    `json:"phash"`   // Perceptual hash string
}
