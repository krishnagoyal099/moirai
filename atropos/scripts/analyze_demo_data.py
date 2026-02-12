#!/usr/bin/env python3
"""
Quick stats viewer for generated demo data
"""

import json
import os
from pathlib import Path
from datetime import datetime
from collections import defaultdict

OUTPUT_DIR = Path(__file__).parent.parent / "assets" / "demo_data"

def analyze_data():
    """Analyze generated demo data"""
    print("=" * 70)
    print("MOIRAI ATROPOS DEMO DATA ANALYSIS")
    print("=" * 70)
    
    total_days = 0
    total_events = 0
    total_keystrokes = 0
    total_mouse_dist = 0
    flow_scores = []
    app_usage = defaultdict(int)
    
    # Walk through all date directories
    for year_dir in sorted(OUTPUT_DIR.glob("*")):
        if not year_dir.is_dir() or year_dir.name == "user.json":
            continue
            
        for month_dir in sorted(year_dir.glob("*")):
            if not month_dir.is_dir():
                continue
                
            for day_dir in sorted(month_dir.glob("*")):
                if not day_dir.is_dir():
                    continue
                    
                telemetry_file = day_dir / "raw_telemetry.json"
                if not telemetry_file.exists():
                    continue
                
                try:
                    with open(telemetry_file, 'r') as f:
                        data = json.load(f)
                    
                    total_days += 1
                    total_events += len(data.get("events", []))
                    
                    metrics = data.get("metrics", {})
                    total_keystrokes += metrics.get("total_keystrokes", 0)
                    total_mouse_dist += metrics.get("total_mouse_dist_pixels", 0)
                    flow_scores.append(metrics.get("flow_score_estimate", 0))
                    
                    top_app = metrics.get("top_window", "Unknown")
                    app_usage[top_app] += 1
                    
                except Exception as e:
                    print(f"Error reading {telemetry_file}: {e}")
    
    # Calculate stats
    avg_flow = sum(flow_scores) / len(flow_scores) if flow_scores else 0
    avg_keystrokes = total_keystrokes / total_days if total_days else 0
    avg_events = total_events / total_days if total_days else 0
    
    # Top apps
    top_apps = sorted(app_usage.items(), key=lambda x: x[1], reverse=True)[:10]
    
    print(f"\n📊 OVERALL STATISTICS")
    print(f"{'─' * 70}")
    print(f"  Total Days Generated:     {total_days:,}")
    print(f"  Total Events:             {total_events:,}")
    print(f"  Total Keystrokes:         {total_keystrokes:,}")
    print(f"  Total Mouse Distance:     {total_mouse_dist:,} pixels")
    print(f"  Average Flow Score:       {avg_flow:.1f}/100")
    print(f"  Average Events/Day:       {avg_events:.0f}")
    print(f"  Average Keystrokes/Day:   {avg_keystrokes:,.0f}")
    
    print(f"\n🏆 TOP 10 APPLICATIONS (by days as primary)")
    print(f"{'─' * 70}")
    for i, (app, count) in enumerate(top_apps, 1):
        percentage = (count / total_days) * 100
        print(f"  {i:2d}. {app:30s} {count:3d} days ({percentage:5.1f}%)")
    
    # Flow score distribution
    print(f"\n📈 FLOW SCORE DISTRIBUTION")
    print(f"{'─' * 70}")
    ranges = {
        "90-100 (Exceptional)": sum(1 for s in flow_scores if 90 <= s <= 100),
        "75-89  (High)":        sum(1 for s in flow_scores if 75 <= s < 90),
        "60-74  (Good)":        sum(1 for s in flow_scores if 60 <= s < 75),
        "45-59  (Moderate)":    sum(1 for s in flow_scores if 45 <= s < 60),
        "0-44   (Low)":         sum(1 for s in flow_scores if s < 45),
    }
    
    for range_name, count in ranges.items():
        percentage = (count / total_days) * 100 if total_days else 0
        bar = "█" * int(percentage / 2)
        print(f"  {range_name:20s} {count:3d} days ({percentage:5.1f}%) {bar}")
    
    # Data size
    total_size = sum(f.stat().st_size for f in OUTPUT_DIR.rglob("*") if f.is_file())
    print(f"\n💾 STORAGE")
    print(f"{'─' * 70}")
    print(f"  Total Size:               {total_size / (1024*1024):.1f} MB")
    print(f"  Average per Day:          {(total_size / total_days) / 1024:.1f} KB")
    
    print(f"\n{'=' * 70}")
    print(f"✓ Analysis Complete!")
    print(f"{'=' * 70}\n")

if __name__ == "__main__":
    analyze_data()
