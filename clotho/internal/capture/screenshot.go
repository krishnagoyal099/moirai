package capture

import (
	"bytes"
	"fmt"
	"image/png"
	"os"
	"path/filepath"
	"time"

	"github.com/go-vgo/robotgo"
)

const (
	// SimilarityThreshold: Max Hamming distance to consider images "duplicates"
	SimilarityThreshold = 10
)

type ScreenCapturer struct {
	lastHash    uint64
	snapCounter int
	outputDir   string
}

func NewScreenCapturer(baseDir string) (*ScreenCapturer, error) {
	snapDir := filepath.Join(baseDir, "visual_snaps")
	if err := os.MkdirAll(snapDir, 0755); err != nil {
		return nil, err
	}

	return &ScreenCapturer{
		outputDir: snapDir,
		lastHash:  0,
	}, nil
}

// CaptureEvent attempts to take a screenshot.
func (sc *ScreenCapturer) CaptureEvent(triggerType string) (string, error) {
	// 1. Capture Screen
	// In your version, CaptureScreen returns *robotgo.CBitmap
	bitmap := robotgo.CaptureScreen()
	if bitmap == nil {
		return "", fmt.Errorf("robotgo capture failed")
	}

	// 2. FIX: Convert CBitmap to Go image.Image
	// The standard library (png.Encode) and your hash function expect the Go interface.
	// robotgo.ToImage() bridges the C struct to the Go interface.
	img := robotgo.ToImage(bitmap)

	// 3. Calculate Hash
	currentHash := CalculateAverageHash(img)

	// 4. Compare with previous
	if sc.lastHash != 0 {
		dist := HammingDistance(sc.lastHash, currentHash)
		if dist < SimilarityThreshold {
			// Discard: Visual change is too small
			return "", nil
		}
	}

	// 5. Save Image
	sc.lastHash = currentHash
	sc.snapCounter++

	timestamp := time.Now().Format("150405")
	filename := fmt.Sprintf("snap_%s_%s.png", timestamp, triggerType)
	fullPath := filepath.Join(sc.outputDir, filename)

	// Encode to PNG
	var buf bytes.Buffer
	// This line (Line 68 in your error) will now work because 'img' is image.Image
	if err := png.Encode(&buf, img); err != nil {
		return "", err
	}

	if err := os.WriteFile(fullPath, buf.Bytes(), 0644); err != nil {
		return "", err
	}

	return filename, nil
}
