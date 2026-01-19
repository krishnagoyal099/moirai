package storage

import (
	"fmt"
	"path/filepath"
	"time"
)

// Pathfinder handles the generation of the "Quadrant" file system paths.
type Pathfinder struct {
	root string
}

func NewPathfinder(root string) *Pathfinder {
	return &Pathfinder{root: root}
}

// GetDailyPath returns the full directory path for a specific date.
// Structure: <root>/YYYY/QX/Month_Name/Week_X/YYYY-MM-DD
func (p *Pathfinder) GetDailyPath(date time.Time) (string, error) {
	year := date.Year()
	quarter := getQuarter(date)
	monthName := date.Format("January")

	// FIX: ISOWeek returns (year, week). We want the second value (week).
	_, weekNum := date.ISOWeek()

	dateStr := date.Format("2006-01-02")

	// Construct the hierarchy
	path := filepath.Join(
		p.root,
		fmt.Sprintf("%d", year),
		fmt.Sprintf("Q%d", quarter),
		monthName,
		fmt.Sprintf("Week_%d", weekNum),
		dateStr,
	)

	return path, nil
}

// GetFilePath returns the full path for a specific file (e.g., raw_telemetry.json).
func (p *Pathfinder) GetFilePath(date time.Time, filename string) (string, error) {
	dailyPath, err := p.GetDailyPath(date)
	if err != nil {
		return "", err
	}
	return filepath.Join(dailyPath, filename), nil
}

// getQuarter returns the quarter (1-4) for a given date.
func getQuarter(date time.Time) int {
	month := int(date.Month())
	switch {
	case month >= 1 && month <= 3:
		return 1
	case month >= 4 && month <= 6:
		return 2
	case month >= 7 && month <= 9:
		return 3
	default:
		return 4
	}
}
