# Moirai Atropos Demo Data Generator

This script generates realistic demo telemetry data for the Atropos application covering the entire year 2025 and up to February 10, 2026.

## Features

- **Realistic Activity Patterns**: Simulates actual work behavior with:
  - Weekday vs weekend patterns
  - Time-of-day intensity variations
  - Natural app switching behavior
  - Realistic keystroke and mouse activity

- **Comprehensive Data**: Generates for each day:
  - `raw_telemetry.json` - Complete event log with metrics
  - `daily_summary.md` - AI-generated narrative summary

- **Smart Event Generation**:
  - Focus change events (app switching)
  - Keystroke events with realistic counts
  - Mouse movement and click tracking
  - Scroll events
  - Flow score calculation (0-100)

## Application Categories

The generator simulates usage across 5 categories:

1. **Coding**: VS Code, PyCharm, Terminal, etc.
2. **Browsing**: Chrome, Firefox with dev resources
3. **Communication**: Slack, Discord, Teams, Email
4. **Design**: Figma, Photoshop, Blender
5. **Productivity**: Notion, Obsidian, Spotify

## Usage

```bash
# Run the generator
python scripts/generate_demo_data.py
```

The script will:
1. Create directory structure: `assets/demo_data/YYYY/MM/YYYY-MM-DD/`
2. Generate ~407 days of data (2025-01-01 to 2026-02-10)
3. Create telemetry JSON and summary markdown for each day

## Output Structure

```
assets/demo_data/
├── user.json
├── 2025/
│   ├── 01/
│   │   ├── 2025-01-01/
│   │   │   ├── raw_telemetry.json
│   │   │   └── daily_summary.md
│   │   ├── 2025-01-02/
│   │   │   ├── raw_telemetry.json
│   │   │   └── daily_summary.md
│   │   └── ...
│   ├── 02/
│   └── ...
└── 2026/
    ├── 01/
    └── 02/
        └── 2026-02-10/
            ├── raw_telemetry.json
            └── daily_summary.md
```

## Data Format

### raw_telemetry.json
```json
{
  "meta": {
    "date": "2025-01-01",
    "generated_at": "2026-02-12T08:21:44Z",
    "version": "1.0.0"
  },
  "metrics": {
    "total_keystrokes": 12543,
    "total_mouse_dist_pixels": 456789,
    "idle_minutes": 720,
    "flow_score_estimate": 78,
    "top_window": "Visual Studio Code"
  },
  "events": [
    {
      "ts": "2025-01-01T09:23:15Z",
      "type": "focus_change",
      "title": "Visual Studio Code",
      "process": "visual"
    },
    {
      "ts": "2025-01-01T09:23:18Z",
      "type": "keystroke",
      "count": 42
    }
    // ... more events
  ]
}
```

## Configuration

Edit the script to customize:

- `START_DATE` / `END_DATE`: Date range
- `CODING_APPS`, `BROWSER_APPS`, etc.: Application pools
- `get_work_intensity()`: Time-of-day patterns
- `select_app_for_time()`: App selection weights

## Performance

- Generates ~407 days in under 2 minutes
- Each day contains 200-800 events depending on intensity
- Total output: ~150MB of JSON + markdown files

## Notes

- Flow scores are calculated based on keystroke volume, mouse activity, and session duration
- Weekend patterns are lighter and start later than weekdays
- Peak productivity hours are 10am-1pm and 2pm-6pm on weekdays
- The generator uses Gaussian distributions for natural variation
