package capture

import (
	"image"
)

// CalculateAverageHash generates a 64-bit hash of the image for comparison.
// Low score = Similar, High score = Different.
func CalculateAverageHash(img image.Image) uint64 {
	// 1. Resize to 8x8 (Simplified by striding for performance)
	// We don't need a perfect resize, just a representative sample
	bounds := img.Bounds()
	width, height := bounds.Dx(), bounds.Dy()

	var graySums [64]float64
	counts := [64]int{}

	// Stride through the image to sample pixels
	// We divide the image into 8x8 grid
	for y := 0; y < height; y++ {
		for x := 0; x < width; x++ {
			// Map pixel to grid 0-7
			gridX := (x * 8) / width
			gridY := (y * 8) / height
			idx := gridY*8 + gridX

			r, g, b, _ := img.At(x, y).RGBA()
			// Convert to luminance (perceived brightness)
			// Using 0-1.0 range
			lum := (0.299*float64(r) + 0.587*float64(g) + 0.114*float64(b)) / 65535.0

			graySums[idx] += lum
			counts[idx]++
		}
	}

	// 2. Calculate Average
	var avg float64
	for i := 0; i < 64; i++ {
		if counts[i] > 0 {
			graySums[i] /= float64(counts[i])
		}
		avg += graySums[i]
	}
	avg /= 64.0

	// 3. Generate Hash (1 if above avg, 0 if below)
	var hash uint64
	for i := 0; i < 64; i++ {
		if graySums[i] > avg {
			hash |= (1 << uint(i))
		}
	}

	return hash
}

// HammingDistance calculates how many bits differ between two hashes.
// A distance of 0-3 usually means "visually identical" for our purposes.
func HammingDistance(hash1, hash2 uint64) int {
	xor := hash1 ^ hash2
	dist := 0
	for xor != 0 {
		dist++
		xor &= xor - 1
	}
	return dist
}
