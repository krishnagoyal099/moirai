package telemetry

import (
	"encoding/json"
	"os"
	"sync"
	"time"
)

// Store manages the daily telemetry file operations.
type Store struct {
	filePath string
	mu       sync.Mutex
	data     *DailyPayload
}

func (s *Store) UpdateKeystrokes(count int64) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.data.Metrics.TotalKeystrokes += int(count)
}

func NewStore(filePath string) *Store {
	return &Store{
		filePath: filePath,
	}
}

// Load initializes the store from disk or creates a new payload.
// It is now resilient to empty or corrupted files.
func (s *Store) Load(meta MetaInfo) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	// Check if file exists
	if _, err := os.Stat(s.filePath); os.IsNotExist(err) {
		// File doesn't exist, create new payload
		s.data = &DailyPayload{
			Meta:     meta,
			Metrics:  SessionMetrics{},
			Events:   []Event{},
			LastSync: time.Now(),
		}
		return nil
	}

	// Read existing file
	content, err := os.ReadFile(s.filePath)
	if err != nil {
		return err
	}

	// Handle Empty File Case
	// If the file exists but is empty (0 bytes), Initialize fresh to prevent panic.
	if len(content) == 0 {
		s.data = &DailyPayload{
			Meta:     meta,
			Metrics:  SessionMetrics{},
			Events:   []Event{},
			LastSync: time.Now(),
		}
		return nil
	}

	// Try to parse JSON
	if err := json.Unmarshal(content, &s.data); err != nil {
		// Handle Corrupted JSON Case
		s.data = &DailyPayload{
			Meta:     meta,
			Metrics:  SessionMetrics{},
			Events:   []Event{},
			LastSync: time.Now(),
		}
		return err // Return error so main logs the warning, but s.data is safe.
	}

	return nil
}

func (s *Store) AddEvent(e Event) {
	s.mu.Lock()
	defer s.mu.Unlock()
	// This line will no longer panic because s.data is guaranteed to be initialized
	s.data.Events = append(s.data.Events, e)
}

func (s *Store) UpdateMetrics(mouseDistance float64) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.data.Metrics.TotalMouseDist += mouseDistance
}

func (s *Store) Flush() error {
	s.mu.Lock()
	defer s.mu.Unlock()

	data, err := json.MarshalIndent(s.data, "", "  ")
	if err != nil {
		return err
	}

	// Atomic Write: write to temp file, then rename to actual file.
	// This prevents corruption if the app crashes mid-write.
	tmpPath := s.filePath + ".tmp"
	if err := os.WriteFile(tmpPath, data, 0644); err != nil {
		return err
	}
	return os.Rename(tmpPath, s.filePath)
}

func (s *Store) GetData() DailyPayload {
	s.mu.Lock()
	defer s.mu.Unlock()
	return *s.data
}

// UpdateFlowScore updates the flow score metric.
func (s *Store) UpdateFlowScore(score float64) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.data.Metrics.FlowScoreEst = score
}
