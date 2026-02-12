#!/usr/bin/env python3
"""
Moirai Atropos Demo Data Generator
Generates realistic telemetry data for 2025-01-01 to 2026-02-10
"""

import json
import random
import os
from datetime import datetime, timedelta
from pathlib import Path
import math

# ─────────────────────────────────────────────
#  Configuration
# ─────────────────────────────────────────────
START_DATE = datetime(2025, 1, 1)
END_DATE = datetime(2026, 2, 10)
OUTPUT_DIR = Path(__file__).parent.parent / "assets" / "demo_data"

# Application pools for realistic usage patterns
CODING_APPS = [
    "Visual Studio Code",
    "PyCharm",
    "IntelliJ IDEA",
    "Sublime Text",
    "WebStorm",
    "Cursor",
    "GitHub Desktop",
    "Terminal",
    "iTerm2",
    "Windows Terminal"
]

BROWSER_APPS = [
    "Google Chrome - Stack Overflow",
    "Firefox - GitHub",
    "Chrome - Documentation",
    "Safari - MDN Web Docs",
    "Chrome - YouTube Tutorial",
    "Firefox - Reddit Programming",
    "Chrome - Dev.to",
    "Edge - Microsoft Docs"
]

COMMUNICATION_APPS = [
    "Slack",
    "Discord",
    "Microsoft Teams",
    "Zoom",
    "Telegram",
    "WhatsApp",
    "Gmail",
    "Outlook"
]

DESIGN_APPS = [
    "Figma",
    "Adobe Photoshop",
    "Sketch",
    "Canva",
    "Blender",
    "Adobe Illustrator"
]

PRODUCTIVITY_APPS = [
    "Notion",
    "Obsidian",
    "Todoist",
    "Trello",
    "Jira",
    "Confluence",
    "Google Docs",
    "Microsoft Word",
    "Excel",
    "Spotify"
]

ALL_APPS = CODING_APPS + BROWSER_APPS + COMMUNICATION_APPS + DESIGN_APPS + PRODUCTIVITY_APPS

# Event types
EVENT_TYPES = ["focus_change", "keystroke", "mouse_move", "mouse_click", "scroll"]

# ─────────────────────────────────────────────
#  Helper Functions
# ─────────────────────────────────────────────

def is_weekday(date):
    """Check if date is a weekday (Mon-Fri)"""
    return date.weekday() < 5

def get_work_intensity(hour, is_weekday_flag):
    """
    Returns intensity multiplier based on time of day
    Simulates realistic work patterns
    """
    if not is_weekday_flag:
        # Weekend pattern - lighter, later start
        if 10 <= hour < 13:
            return 0.4
        elif 13 <= hour < 18:
            return 0.6
        elif 18 <= hour < 22:
            return 0.5
        else:
            return 0.1
    else:
        # Weekday pattern - professional hours
        if 8 <= hour < 10:
            return 0.7  # Morning warmup
        elif 10 <= hour < 13:
            return 1.0  # Peak morning productivity
        elif 13 <= hour < 14:
            return 0.3  # Lunch break
        elif 14 <= hour < 18:
            return 0.9  # Afternoon focus
        elif 18 <= hour < 20:
            return 0.6  # Evening wind-down
        elif 20 <= hour < 23:
            return 0.4  # Late night coding
        else:
            return 0.05  # Night/early morning

def select_app_for_time(hour, is_weekday_flag):
    """Select appropriate app based on time and day"""
    intensity = get_work_intensity(hour, is_weekday_flag)
    
    if intensity > 0.7:
        # High productivity - mostly coding
        weights = [0.5, 0.2, 0.1, 0.05, 0.15]
    elif intensity > 0.4:
        # Medium productivity - mixed
        weights = [0.3, 0.3, 0.15, 0.1, 0.15]
    else:
        # Low productivity - browsing/communication
        weights = [0.1, 0.3, 0.25, 0.15, 0.2]
    
    app_pool = random.choices(
        [CODING_APPS, BROWSER_APPS, COMMUNICATION_APPS, DESIGN_APPS, PRODUCTIVITY_APPS],
        weights=weights
    )[0]
    
    return random.choice(app_pool)

def generate_events_for_day(date):
    """Generate realistic events for a single day"""
    events = []
    is_weekday_flag = is_weekday(date)
    
    # Determine work hours for this day
    if is_weekday_flag:
        start_hour = random.randint(8, 10)
        end_hour = random.randint(18, 23)
    else:
        start_hour = random.randint(10, 12)
        end_hour = random.randint(16, 22)
    
    current_time = date.replace(hour=start_hour, minute=random.randint(0, 59))
    end_time = date.replace(hour=end_hour, minute=random.randint(0, 59))
    
    current_app = select_app_for_time(current_time.hour, is_weekday_flag)
    
    while current_time < end_time:
        hour = current_time.hour
        intensity = get_work_intensity(hour, is_weekday_flag)
        
        # Focus change events (switching apps)
        if random.random() < 0.15 * intensity:
            new_app = select_app_for_time(hour, is_weekday_flag)
            if new_app != current_app:
                events.append({
                    "ts": current_time.isoformat() + "Z",
                    "type": "focus_change",
                    "title": new_app,
                    "process": new_app.split()[0].lower()
                })
                current_app = new_app
        
        # Keystroke events
        keystroke_count = int(random.gauss(30, 10) * intensity)
        if keystroke_count > 0:
            events.append({
                "ts": current_time.isoformat() + "Z",
                "type": "keystroke",
                "count": max(1, keystroke_count)
            })
        
        # Mouse events
        if random.random() < 0.6 * intensity:
            events.append({
                "ts": current_time.isoformat() + "Z",
                "type": "mouse_move",
                "distance_px": int(random.gauss(500, 200))
            })
        
        if random.random() < 0.3 * intensity:
            events.append({
                "ts": current_time.isoformat() + "Z",
                "type": "mouse_click",
                "button": random.choice(["left", "left", "left", "right"])
            })
        
        # Scroll events
        if random.random() < 0.2 * intensity:
            events.append({
                "ts": current_time.isoformat() + "Z",
                "type": "scroll",
                "delta": random.randint(-300, 300)
            })
        
        # Time increment (2-15 seconds based on intensity)
        increment = random.randint(2, int(15 / max(intensity, 0.1)))
        current_time += timedelta(seconds=increment)
    
    # Sort events by timestamp
    events.sort(key=lambda x: x["ts"])
    
    return events

def should_skip_day(date):
    """Determine if this day should be skipped (vacation, sick day, etc.)"""
    # Skip some random days for realism (vacations, sick days)
    if random.random() < 0.03:  # 3% chance of skipping any day
        return True
    
    # Christmas break (Dec 24-26)
    if date.month == 12 and date.day in [24, 25, 26]:
        return True
    
    # New Year's Day
    if date.month == 1 and date.day == 1:
        return True
    
    # Random vacation week in summer (pick one week in July/August)
    if date.year == 2025 and date.month == 7 and 15 <= date.day <= 21:
        return True
    
    return False

def calculate_metrics(events, date):
    """Calculate daily metrics from events"""
    total_keystrokes = sum(e.get("count", 1) for e in events if e["type"] == "keystroke")
    total_mouse_dist = sum(e.get("distance_px", 0) for e in events if e["type"] == "mouse_move")
    
    # Calculate active time (time between first and last event)
    if events:
        first_time = datetime.fromisoformat(events[0]["ts"].replace("Z", ""))
        last_time = datetime.fromisoformat(events[-1]["ts"].replace("Z", ""))
        active_minutes = (last_time - first_time).total_seconds() / 60
        idle_minutes = max(0, 1440 - active_minutes)  # 1440 = 24 hours
    else:
        active_minutes = 0
        idle_minutes = 1440
    
    # Calculate flow score (0-100) with MORE REALISTIC variation
    # Base score from activity
    base_score = min(100, int(
        (total_keystrokes / 100) * 0.4 +
        (total_mouse_dist / 10000) * 0.2 +
        (active_minutes / 10) * 0.4
    ))
    
    # Add natural daily variation (-15 to +5)
    variation = random.randint(-15, 5)
    flow_score = max(0, min(100, base_score + variation))
    
    # Weekends tend to be lower
    if not is_weekday(date):
        flow_score = int(flow_score * 0.7)
    
    # Some days are just off (10% chance of significantly lower score)
    if random.random() < 0.1:
        flow_score = int(flow_score * random.uniform(0.5, 0.8))
    
    # Find most used app
    app_usage = {}
    for event in events:
        if event["type"] == "focus_change":
            app = event.get("title", "Unknown")
            app_usage[app] = app_usage.get(app, 0) + 1
    
    top_window = max(app_usage.items(), key=lambda x: x[1])[0] if app_usage else "Unknown"
    
    return {
        "total_keystrokes": total_keystrokes,
        "total_mouse_dist_pixels": total_mouse_dist,
        "idle_minutes": int(idle_minutes),
        "flow_score_estimate": flow_score,
        "top_window": top_window
    }

def generate_summary(date, metrics, events):
    """Generate AI-style daily summary"""
    flow_score = metrics["flow_score_estimate"]
    keystrokes = metrics["total_keystrokes"]
    top_app = metrics["top_window"]
    
    # Determine dominant activity
    app_types = {
        "coding": 0,
        "browsing": 0,
        "communication": 0,
        "design": 0,
        "productivity": 0
    }
    
    for event in events:
        if event["type"] == "focus_change":
            app = event.get("title", "")
            if any(coding_app in app for coding_app in CODING_APPS):
                app_types["coding"] += 1
            elif any(browser in app for browser in BROWSER_APPS):
                app_types["browsing"] += 1
            elif any(comm in app for comm in COMMUNICATION_APPS):
                app_types["communication"] += 1
            elif any(design in app for design in DESIGN_APPS):
                app_types["design"] += 1
            else:
                app_types["productivity"] += 1
    
    dominant_activity = max(app_types.items(), key=lambda x: x[1])[0]
    
    # Generate narrative summary
    day_name = date.strftime("%A")
    date_str = date.strftime("%B %d, %Y")
    
    summaries = {
        "coding": [
            f"Deep work session on {day_name}. Sustained focus in development environments with {keystrokes:,} keystrokes logged. Flow state achieved during afternoon sprint.",
            f"Productive coding day. Primary focus on {top_app} with consistent keyboard activity. Flow score of {flow_score} indicates strong concentration.",
            f"Development-heavy day with extended IDE sessions. {keystrokes:,} keystrokes suggest active implementation work. Minimal context switching observed."
        ],
        "browsing": [
            f"Research-oriented session. Extensive documentation review and learning activities. Flow score of {flow_score} reflects exploratory work pattern.",
            f"Knowledge acquisition day. Browser-based research dominated with {keystrokes:,} interactions. Balanced between reading and note-taking.",
            f"Investigation and learning focus. Multiple documentation sources consulted. Lower keystroke count suggests more reading than writing."
        ],
        "communication": [
            f"Collaborative day with high communication activity. Frequent context switches between {top_app} and other tools. Team coordination evident.",
            f"Meeting-heavy schedule. Communication tools dominated screen time. Flow score of {flow_score} reflects fragmented attention.",
            f"Synchronous work pattern. Active participation in team discussions and planning. Balanced keyboard and mouse activity."
        ],
        "design": [
            f"Creative work session in {top_app}. Mouse activity dominated with {metrics['total_mouse_dist_pixels']:,} pixels traveled. Visual design focus.",
            f"Design iteration day. Extensive use of creative tools with high mouse-to-keyboard ratio. Flow state during afternoon session.",
            f"Visual development work. Sustained focus in design applications. Flow score of {flow_score} indicates productive creative session."
        ],
        "productivity": [
            f"Planning and organization focus. Time spent in productivity tools structuring work. {keystrokes:,} keystrokes across documentation.",
            f"Administrative and planning day. Balanced activity across productivity suite. Moderate flow score reflects task management work.",
            f"Documentation and planning session. Steady keyboard activity in note-taking and organization tools. Structured work pattern."
        ]
    }
    
    summary_text = random.choice(summaries[dominant_activity])
    
    # Add contextual notes
    if is_weekday(date):
        context = "Weekday work pattern observed."
    else:
        context = "Weekend session - lighter, self-directed work."
    
    if flow_score > 75:
        mood = "High flow state achieved. Optimal conditions for deep work."
    elif flow_score > 50:
        mood = "Moderate productivity. Some interruptions noted."
    else:
        mood = "Fragmented attention. Multiple context switches."
    
    return f"""# Daily Summary — {date_str}

## Overview
{summary_text}

## Context
{context} {mood}

## Key Metrics
- **Flow Score**: {flow_score}/100
- **Total Keystrokes**: {keystrokes:,}
- **Mouse Distance**: {metrics['total_mouse_dist_pixels']:,} pixels
- **Active Time**: {1440 - metrics['idle_minutes']:.0f} minutes
- **Primary Application**: {top_app}

## Activity Breakdown
- **Coding**: {app_types['coding']} sessions
- **Research**: {app_types['browsing']} sessions
- **Communication**: {app_types['communication']} sessions
- **Design**: {app_types['design']} sessions
- **Productivity**: {app_types['productivity']} sessions

## Insights
The day's pattern suggests a focus on {dominant_activity} with {'sustained' if flow_score > 60 else 'intermittent'} concentration. {'Deep work conditions were favorable.' if flow_score > 70 else 'Consider blocking time for focused work.'}

---
*Generated by Lachesis AI Engine*
"""

def generate_data_for_date(date):
    """Generate complete data package for a single date"""
    print(f"Generating data for {date.strftime('%Y-%m-%d')}...")
    
    # Create directory structure
    date_dir = OUTPUT_DIR / date.strftime("%Y") / date.strftime("%m") / date.strftime("%Y-%m-%d")
    date_dir.mkdir(parents=True, exist_ok=True)
    
    # Generate events
    events = generate_events_for_day(date)
    
    # Calculate metrics
    metrics = calculate_metrics(events, date)
    
    # Create telemetry JSON
    telemetry = {
        "meta": {
            "date": date.strftime("%Y-%m-%d"),
            "generated_at": datetime.now().isoformat() + "Z",
            "version": "1.0.0"
        },
        "metrics": metrics,
        "events": events
    }
    
    # Write telemetry file
    telemetry_path = date_dir / "raw_telemetry.json"
    with open(telemetry_path, 'w', encoding='utf-8') as f:
        json.dump(telemetry, f, indent=2)
    
    # Generate and write summary
    summary = generate_summary(date, metrics, events)
    summary_path = date_dir / "daily_summary.md"
    with open(summary_path, 'w', encoding='utf-8') as f:
        f.write(summary)
    
    return telemetry, summary

def generate_tasks():
    """Generate realistic tasks for the demo user"""
    tasks = [
        {
            "id": "task-1",
            "title": "Refactor authentication module",
            "description": "Update the auth system to use JWT tokens instead of session-based auth. Includes updating middleware and adding refresh token logic.",
            "status": "in-progress",
            "priority": "high",
            "group": "development",
            "createdAt": "2025-01-15T09:00:00Z",
            "dueDate": "2025-02-01T17:00:00Z",
            "tags": ["backend", "security", "refactoring"]
        },
        {
            "id": "task-2",
            "title": "Design new dashboard UI",
            "description": "Create mockups for the analytics dashboard redesign. Focus on data visualization and user experience improvements.",
            "status": "completed",
            "priority": "medium",
            "group": "design",
            "createdAt": "2025-01-10T10:30:00Z",
            "completedAt": "2025-01-28T16:45:00Z",
            "tags": ["ui", "design", "figma"]
        },
        {
            "id": "task-3",
            "title": "Write API documentation",
            "description": "Document all REST API endpoints with examples, request/response schemas, and authentication requirements.",
            "status": "in-progress",
            "priority": "medium",
            "group": "documentation",
            "createdAt": "2025-01-20T14:00:00Z",
            "dueDate": "2025-02-15T17:00:00Z",
            "tags": ["docs", "api", "technical-writing"]
        },
        {
            "id": "task-4",
            "title": "Fix mobile responsiveness issues",
            "description": "Address layout breaking on mobile devices, particularly on screens smaller than 375px. Test on iOS and Android.",
            "status": "todo",
            "priority": "high",
            "group": "development",
            "createdAt": "2025-02-01T11:15:00Z",
            "dueDate": "2025-02-10T17:00:00Z",
            "tags": ["frontend", "mobile", "css", "bug"]
        },
        {
            "id": "task-5",
            "title": "Optimize database queries",
            "description": "Identify and optimize slow queries. Add proper indexes and consider implementing query caching for frequently accessed data.",
            "status": "in-progress",
            "priority": "high",
            "group": "development",
            "createdAt": "2025-01-25T08:30:00Z",
            "dueDate": "2025-02-08T17:00:00Z",
            "tags": ["backend", "database", "performance"]
        },
        {
            "id": "task-6",
            "title": "Set up CI/CD pipeline",
            "description": "Configure GitHub Actions for automated testing and deployment. Include linting, unit tests, and staging deployment.",
            "status": "completed",
            "priority": "medium",
            "group": "devops",
            "createdAt": "2025-01-05T09:00:00Z",
            "completedAt": "2025-01-18T15:30:00Z",
            "tags": ["devops", "automation", "github-actions"]
        }
    ]
    
    # Randomly add 1-2 more tasks
    extra_tasks = [
        {
            "id": "task-7",
            "title": "Implement dark mode",
            "description": "Add system-wide dark mode support with smooth transitions and user preference persistence.",
            "status": "todo",
            "priority": "low",
            "group": "development",
            "createdAt": "2025-02-05T10:00:00Z",
            "tags": ["frontend", "ui", "feature"]
        },
        {
            "id": "task-8",
            "title": "Code review: Payment integration",
            "description": "Review the new Stripe payment integration PR. Check error handling, security, and test coverage.",
            "status": "in-progress",
            "priority": "high",
            "group": "development",
            "createdAt": "2025-02-08T13:00:00Z",
            "dueDate": "2025-02-12T17:00:00Z",
            "tags": ["review", "payments", "security"]
        }
    ]
    
    # Add 0-2 extra tasks randomly
    num_extra = random.randint(0, 2)
    tasks.extend(random.sample(extra_tasks, num_extra))
    
    return {
        "groups": [
            {"id": "development", "name": "Development"},
            {"id": "design", "name": "Design"},
            {"id": "documentation", "name": "Documentation"},
            {"id": "devops", "name": "DevOps"}
        ],
        "tasks": tasks
    }

def main():
    """Main generation function"""
    print("=" * 60)
    print("Moirai Atropos Demo Data Generator")
    print("=" * 60)
    print(f"Start Date: {START_DATE.strftime('%Y-%m-%d')}")
    print(f"End Date: {END_DATE.strftime('%Y-%m-%d')}")
    print(f"Output Directory: {OUTPUT_DIR}")
    print("=" * 60)
    
    # Ensure output directory exists
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    # Generate tasks.json
    print("\nGenerating tasks.json...")
    tasks_data = generate_tasks()
    tasks_path = OUTPUT_DIR / "tasks.json"
    with open(tasks_path, 'w', encoding='utf-8') as f:
        json.dump(tasks_data, f, indent=2)
    print(f"✓ Created {len(tasks_data['tasks'])} tasks")
    
    # Generate data for each day
    current_date = START_DATE
    total_days = (END_DATE - START_DATE).days + 1
    generated = 0
    skipped = 0
    
    print("\nGenerating daily data...")
    while current_date <= END_DATE:
        try:
            # Skip certain days for realism
            if should_skip_day(current_date):
                print(f"Skipping {current_date.strftime('%Y-%m-%d')} (vacation/holiday)")
                skipped += 1
            else:
                generate_data_for_date(current_date)
                generated += 1
        except Exception as e:
            print(f"ERROR generating data for {current_date}: {e}")
        
        current_date += timedelta(days=1)
    
    print("=" * 60)
    print(f"✓ Generation Complete!")
    print(f"  Total Days in Range: {total_days}")
    print(f"  Successfully Generated: {generated}")
    print(f"  Skipped (holidays/vacation): {skipped}")
    print(f"  Tasks Created: {len(tasks_data['tasks'])}")
    print(f"  Output: {OUTPUT_DIR}")
    print("=" * 60)

if __name__ == "__main__":
    main()

