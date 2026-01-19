package config

import (
	"os"
	"path/filepath"
)

// Config holds the runtime configuration for Clotho.
type Config struct {
	// DataRoot is the base directory where all Moirai data lives.
	// Default: ~/Moirai_Data
	DataRoot string

	// ScreenshotInterval is the minimum seconds between event-based screenshots.
	ScreenshotInterval int

	// PHashThreshold is the difference (0-100) required to save a new screenshot.
	// Lower = stricter (saves less). Higher = looser.
	PHashThreshold int
}

// Load initializes the configuration with defaults or environment overrides.
func Load() (*Config, error) {
	homeDir, err := os.UserHomeDir()
	if err != nil {
		return nil, err
	}

	cfg := &Config{
		DataRoot:           filepath.Join(homeDir, "Moirai_Data"),
		ScreenshotInterval: 30, // 30 seconds minimum between shots
		PHashThreshold:     5,  // 5% difference threshold
	}

	// Allow override via environment variable
	if customRoot := os.Getenv("MOIRAI_ROOT"); customRoot != "" {
		cfg.DataRoot = customRoot
	}

	return cfg, nil
}
