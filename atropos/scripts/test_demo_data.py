#!/usr/bin/env python3
"""
Quick demo data test - View a random sample day
"""

import json
import random
from pathlib import Path
from datetime import datetime, timedelta

OUTPUT_DIR = Path(__file__).parent.parent / "assets" / "demo_data"

def get_random_day():
    """Get a random day from the dataset"""
    # Get all date directories
    all_dates = []
    
    for year_dir in OUTPUT_DIR.glob("*"):
        if not year_dir.is_dir() or year_dir.name == "user.json":
            continue
        for month_dir in year_dir.glob("*"):
            if not month_dir.is_dir():
                continue
            for day_dir in month_dir.glob("*"):
                if day_dir.is_dir() and (day_dir / "raw_telemetry.json").exists():
                    all_dates.append(day_dir.name)
    
    if not all_dates:
        print("❌ No demo data found!")
        return None
    
    return random.choice(all_dates)

def quick_view(date_str):
    """Quick view of a day's data"""
    date = datetime.strptime(date_str, "%Y-%m-%d")
    year = date.strftime("%Y")
    month = date.strftime("%m")
    day_dir = OUTPUT_DIR / year / month / date_str
    
    telemetry_file = day_dir / "raw_telemetry.json"
    summary_file = day_dir / "daily_summary.md"
    
    with open(telemetry_file, 'r') as f:
        data = json.load(f)
    
    metrics = data.get("metrics", {})
    events = data.get("events", [])
    
    print("\n" + "=" * 70)
    print(f"🎲 RANDOM DAY: {date.strftime('%A, %B %d, %Y').upper()}")
    print("=" * 70)
    
    print(f"\n⚡ Quick Stats:")
    print(f"  • Flow Score: {metrics.get('flow_score_estimate', 0)}/100")
    print(f"  • Keystrokes: {metrics.get('total_keystrokes', 0):,}")
    print(f"  • Events: {len(events):,}")
    print(f"  • Top App: {metrics.get('top_window', 'Unknown')}")
    print(f"  • Active Time: {1440 - metrics.get('idle_minutes', 0):,} minutes")
    
    # Show first few events
    print(f"\n📋 Sample Events (first 5):")
    for i, event in enumerate(events[:5], 1):
        event_type = event.get("type", "unknown")
        ts = event.get("ts", "")
        try:
            time = datetime.fromisoformat(ts.replace("Z", "")).strftime("%I:%M:%S %p")
        except:
            time = ts
        
        if event_type == "focus_change":
            print(f"  {i}. [{time}] Switched to: {event.get('title', 'Unknown')}")
        elif event_type == "keystroke":
            print(f"  {i}. [{time}] Typed {event.get('count', 0)} keys")
        elif event_type == "mouse_move":
            print(f"  {i}. [{time}] Moved mouse {event.get('distance_px', 0)} pixels")
        else:
            print(f"  {i}. [{time}] {event_type}")
    
    # Show summary excerpt
    if summary_file.exists():
        with open(summary_file, 'r') as f:
            summary = f.read()
        
        # Extract overview
        lines = summary.split('\n')
        overview_start = False
        print(f"\n💬 AI Summary:")
        for line in lines:
            if line.startswith("## Overview"):
                overview_start = True
                continue
            if overview_start:
                if line.startswith("##"):
                    break
                if line.strip():
                    print(f"  {line.strip()}")
    
    print("\n" + "=" * 70)
    print(f"✨ Try another? Run: python scripts/test_demo_data.py")
    print("=" * 70 + "\n")

if __name__ == "__main__":
    random_date = get_random_day()
    if random_date:
        quick_view(random_date)
    else:
        print("\n⚠️  No demo data found. Run: python scripts/generate_demo_data.py\n")
