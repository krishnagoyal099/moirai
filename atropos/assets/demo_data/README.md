# 🎭 Moirai Atropos Demo Data System

A comprehensive demo data generator for the Atropos telemetry viewer, providing **406 days** of realistic user activity data from **January 1, 2025** to **February 10, 2026**.

## What's Included

### Generated Data
- **406 days** of complete telemetry data
- **2.6+ million events** simulating real user activity
- **30.7+ million keystrokes** across all days
- **312+ million pixels** of mouse movement
- **261.5 MB** of structured JSON and Markdown files

### Data Types
Each day includes:
1. **`raw_telemetry.json`** - Complete event log with metrics
2. **`daily_summary.md`** - AI-generated narrative summary

## Quick Start

### Generate Demo Data
```bash
# Generate all 406 days of data (takes ~30 seconds)
python scripts/generate_demo_data.py
```

### View Statistics
```bash
# See overall statistics and insights
python scripts/analyze_demo_data.py
```

### View Specific Day
```bash
# View detailed data for any date
python scripts/view_day.py 2025-06-15
```

## Directory Structure

```
assets/demo_data/
├── user.json                    # Demo user profile
├── 2025/
│   ├── 01/
│   │   ├── 2025-01-01/
│   │   │   ├── raw_telemetry.json
│   │   │   └── daily_summary.md
│   │   ├── 2025-01-02/
│   │   └── ...
│   ├── 02/ ... 12/
└── 2026/
    ├── 01/
    └── 02/
        └── 2026-02-10/
```

## Data Characteristics

### Realistic Patterns
- **Weekday vs Weekend**: Different activity levels and timing
- **Time-of-Day**: Peak productivity 10am-1pm, 2pm-6pm
- **Flow States**: 97.5% of days achieve exceptional flow (90-100)
- **Natural Variation**: Gaussian distributions for realistic randomness

### Application Categories
The generator simulates 5 categories of applications:

1. **Coding** (50% of high-productivity time)
   - VS Code, Cursor, PyCharm, IntelliJ IDEA, etc.

2. **Browsing** (20-30% of time)
   - Chrome, Firefox, Safari with dev resources

3. **Communication** (10-25% of time)
   - Slack, Discord, Teams, Email

4. **Design** (5-15% of time)
   - Figma, Photoshop, Blender

5. **Productivity** (15-20% of time)
   - Notion, Obsidian, Spotify, Docs

### Event Types
Each day contains thousands of events:
- **Focus Changes**: App switching (10-15% of events)
- **Keystrokes**: Typing activity (30-40%)
- **Mouse Movements**: Cursor tracking (20-30%)
- **Mouse Clicks**: Click events (15-20%)
- **Scroll Events**: Page scrolling (5-10%)

## Top Applications (by primary usage)

| Rank | Application          | Days | Percentage |
|------|---------------------|------|------------|
| 1    | Cursor              | 42   | 10.3%      |
| 2    | GitHub Desktop      | 39   | 9.6%       |
| 3    | IntelliJ IDEA       | 34   | 8.4%       |
| 4    | iTerm2              | 33   | 8.1%       |
| 5    | Sublime Text        | 33   | 8.1%       |
| 6    | Visual Studio Code  | 31   | 7.6%       |
| 7    | Windows Terminal    | 31   | 7.6%       |
| 8    | Terminal            | 31   | 7.6%       |
| 9    | PyCharm             | 25   | 6.2%       |
| 10   | WebStorm            | 18   | 4.4%       |

## Average Daily Metrics

- **Events**: ~6,476 events/day
- **Keystrokes**: ~75,649 keystrokes/day
- **Mouse Distance**: ~770,700 pixels/day
- **Active Time**: ~700 minutes/day (~11.7 hours)
- **Flow Score**: 99.5/100 average

## Using Demo Mode in Atropos

1. **Enable Demo Mode** in Settings
2. Application will automatically load from `assets/demo_data/`
3. Navigate through dates using the calendar/heatmap
4. View stats, summaries, and activity patterns

## Data Format

### raw_telemetry.json
```json
{
  "meta": {
    "date": "2025-01-15",
    "generated_at": "2026-02-12T13:55:31Z",
    "version": "1.0.0"
  },
  "metrics": {
    "total_keystrokes": 99891,
    "total_mouse_dist_pixels": 1023003,
    "idle_minutes": 734,
    "flow_score_estimate": 100,
    "top_window": "Cursor"
  },
  "events": [
    {
      "ts": "2025-01-15T08:20:00Z",
      "type": "focus_change",
      "title": "Visual Studio Code",
      "process": "visual"
    },
    {
      "ts": "2025-01-15T08:20:05Z",
      "type": "keystroke",
      "count": 42
    }
    // ... thousands more events
  ]
}
```

### daily_summary.md
```markdown
# Daily Summary — January 15, 2025

## Overview
Productive coding day. Primary focus on Cursor with consistent 
keyboard activity. Flow score of 100 indicates strong concentration.

## Context
Weekday work pattern observed. High flow state achieved. 
Optimal conditions for deep work.

## Key Metrics
- **Flow Score**: 100/100
- **Total Keystrokes**: 99,891
- **Mouse Distance**: 1,023,003 pixels
...
```

## Customization

Edit `generate_demo_data.py` to customize:

```python
# Date range
START_DATE = datetime(2025, 1, 1)
END_DATE = datetime(2026, 2, 10)

# Application pools
CODING_APPS = ["VS Code", "PyCharm", ...]
BROWSER_APPS = ["Chrome - Docs", ...]

# Work patterns
def get_work_intensity(hour, is_weekday):
    # Customize time-of-day patterns
    ...
```

## Scripts Overview

| Script | Purpose | Usage |
|--------|---------|-------|
| `generate_demo_data.py` | Generate all demo data | `python scripts/generate_demo_data.py` |
| `analyze_demo_data.py` | View statistics | `python scripts/analyze_demo_data.py` |
| `view_day.py` | View specific date | `python scripts/view_day.py 2025-06-15` |

## Features

-  **Realistic Activity Patterns**: Mimics actual work behavior
-  **Time-Based Intensity**: Different patterns for different hours
-  **Weekday/Weekend Variation**: Lighter weekend activity
-  **Natural Randomness**: Gaussian distributions for variation
-  **Flow Score Calculation**: Based on sustained activity
-  **AI-Style Summaries**: Contextual daily narratives
-  **Comprehensive Events**: All event types covered
-  **Large Dataset**: Over a year of continuous data

## Use Cases

1. **Development**: Test Atropos features with realistic data
2. **Demos**: Showcase the application with compelling data
3. **UI Testing**: Verify charts, graphs, and visualizations
4. **Performance**: Test with large datasets (2.6M+ events)
5. **Documentation**: Create screenshots and tutorials

## Data Quality

- **Consistency**: All dates have complete data
- **Realism**: Patterns match actual user behavior
- **Variety**: Different apps, times, and activity levels
- **Completeness**: All required fields populated
- **Validation**: Timestamps are sequential and valid

## Tips

- **Demo Mode**: Toggle in Settings to switch between real/demo data
- **Date Navigation**: Use heatmap to jump to specific dates
- **Performance**: Data loads quickly despite large size
- **Customization**: Regenerate with different parameters anytime
- **Backup**: Original data preserved when demo mode enabled

## Next Steps

1. Enable demo mode in Atropos
2. Explore the heatmap visualization
3. View different days and patterns
4. Check the Stats page for aggregated insights
5. Test the Chat feature with telemetry context

---

**Generated**: February 12, 2026  
**Total Size**: 261.5 MB  
**Total Days**: 406  
**Total Events**: 2,629,092  

*Part of the Moirai Narrative OS Project* 
