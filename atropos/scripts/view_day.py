#!/usr/bin/env python3
"""
View demo data for a specific date
Usage: python view_day.py 2025-06-15
"""

import json
import sys
from pathlib import Path
from datetime import datetime

OUTPUT_DIR = Path(__file__).parent.parent / "assets" / "demo_data"

def view_day(date_str):
    """View data for a specific date"""
    try:
        date = datetime.strptime(date_str, "%Y-%m-%d")
    except ValueError:
        print(f"❌ Invalid date format. Use YYYY-MM-DD (e.g., 2025-06-15)")
        return
    
    # Build path
    year = date.strftime("%Y")
    month = date.strftime("%m")
    day_dir = OUTPUT_DIR / year / month / date_str
    
    if not day_dir.exists():
        print(f"❌ No data found for {date_str}")
        print(f"   Looking in: {day_dir}")
        return
    
    telemetry_file = day_dir / "raw_telemetry.json"
    summary_file = day_dir / "daily_summary.md"
    
    if not telemetry_file.exists():
        print(f"❌ Telemetry file not found for {date_str}")
        return
    
    # Load telemetry
    with open(telemetry_file, 'r') as f:
        data = json.load(f)
    
    metrics = data.get("metrics", {})
    events = data.get("events", [])
    
    # Display
    print("=" * 70)
    print(f"📅 DATA FOR {date.strftime('%A, %B %d, %Y').upper()}")
    print("=" * 70)
    
    print(f"\n📊 METRICS")
    print("─" * 70)
    print(f"  Flow Score:        {metrics.get('flow_score_estimate', 0)}/100")
    print(f"  Total Keystrokes:  {metrics.get('total_keystrokes', 0):,}")
    print(f"  Mouse Distance:    {metrics.get('total_mouse_dist_pixels', 0):,} pixels")
    print(f"  Idle Time:         {metrics.get('idle_minutes', 0):,} minutes")
    print(f"  Active Time:       {1440 - metrics.get('idle_minutes', 0):,} minutes")
    print(f"  Top Application:   {metrics.get('top_window', 'Unknown')}")
    
    print(f"\n📝 EVENTS")
    print("─" * 70)
    print(f"  Total Events:      {len(events):,}")
    
    # Event breakdown
    event_types = {}
    for event in events:
        event_type = event.get("type", "unknown")
        event_types[event_type] = event_types.get(event_type, 0) + 1
    
    for event_type, count in sorted(event_types.items(), key=lambda x: x[1], reverse=True):
        percentage = (count / len(events)) * 100 if events else 0
        print(f"    - {event_type:15s} {count:6,} ({percentage:5.1f}%)")
    
    # App switching
    focus_changes = [e for e in events if e.get("type") == "focus_change"]
    unique_apps = set(e.get("title", "Unknown") for e in focus_changes)
    
    print(f"\n🔄 APPLICATION ACTIVITY")
    print("─" * 70)
    print(f"  Focus Changes:     {len(focus_changes):,}")
    print(f"  Unique Apps Used:  {len(unique_apps)}")
    
    if unique_apps:
        print(f"\n  Applications:")
        for app in sorted(unique_apps)[:15]:  # Show first 15
            print(f"    • {app}")
        if len(unique_apps) > 15:
            print(f"    ... and {len(unique_apps) - 15} more")
    
    # Time range
    if events:
        first_event = events[0].get("ts", "")
        last_event = events[-1].get("ts", "")
        
        try:
            first_time = datetime.fromisoformat(first_event.replace("Z", ""))
            last_time = datetime.fromisoformat(last_event.replace("Z", ""))
            duration = (last_time - first_time).total_seconds() / 3600
            
            print(f"\n⏰ TIME RANGE")
            print("─" * 70)
            print(f"  First Event:       {first_time.strftime('%I:%M:%S %p')}")
            print(f"  Last Event:        {last_time.strftime('%I:%M:%S %p')}")
            print(f"  Session Duration:  {duration:.1f} hours")
        except:
            pass
    
    # Summary
    if summary_file.exists():
        print(f"\n📄 DAILY SUMMARY")
        print("─" * 70)
        with open(summary_file, 'r') as f:
            summary = f.read()
        # Print first few lines
        lines = summary.split('\n')
        for line in lines[:15]:
            print(f"  {line}")
        if len(lines) > 15:
            print(f"\n  ... (view full summary in {summary_file})")
    
    print("\n" + "=" * 70)
    print(f"✓ Data loaded from: {day_dir}")
    print("=" * 70 + "\n")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python view_day.py YYYY-MM-DD")
        print("Example: python view_day.py 2025-06-15")
        sys.exit(1)
    
    view_day(sys.argv[1])
