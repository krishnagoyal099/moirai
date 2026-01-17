**Moirai: The Narrative OS for Windows**
*Weaving the thread of daily action into the narrative of life intent.*

---

## I. The Philosophy

Moirai is a **local-first, cloud-augmented resident agent** for Windows that transforms passive digital behavior into an actionable life narrative. Unlike productivity tools that demand manual input, Moirai operates as a **background chronicler**—observing, compressing, and narrating your digital life through the metaphor of the Three Fates.

**Core Paradigm:**  
**Clotho** captures the raw moment. **Lachesis** (PuterJS) weaves meaning. **Atropos** grants you the final cut.

---

## II. System Architecture

### The Trinity

| Component | Role | Technology | Residence |
|-----------|------|------------|-----------|
| **Clotho** (The Spinner) | System capture & spooling | Rust (Tokio, windows-rs, WebSocket) | Background Windows Process |
| **Lachesis** (The Measurer) | AI narrative generation | PuterJS (Mistral OCR, Claude API) | Cloud via Tauri Bridge |
| **Atropos** (The Cutter) | User interface & control | Tauri (Rust core + React/Vue) | Desktop Application |

### The Capture Stack (Windows-Native)

**Clotho** integrates deeply with Windows APIs:
- **UI Automation** (not hooks): Tracks window titles and process switches without antivirus triggers
- **Raw Input API**: Measures input velocity (keys/minute, scroll deltas)—never content
- **Windows Graphics Capture**: Smart screenshots only during high-intent activities (IDEs, documentation)
- **WebSocket IPC**: Exposes `127.0.0.1:random_port` for Atropos connection/disconnection without data loss

---

## III. The Data Lifecycle

### 1. The Gasp (Real-Time)
Every 30 seconds, Clotho writes to local SQLite:
```rust
timestamp | process | window_hash | kps | scroll_vel | thread_id
```
**Storage:** Hierarchical folder structure  
`%LOCALAPPDATA%\Moirai\chronicle\2024\Q1\Week03\2024-01-15.db`

### 2. The Visual Gasp (Smart Capture)
Triggered only when `process == code.exe` OR velocity > threshold:
- JPEG screenshot (quality 0.7) → `%CAPTURES%\2024\Q1\Week03\[timestamp].jpg`
- **The Redaction Layer**: Blurs/sanitizes sensitive regions before any transmission

### 3. The Weaving (Batch Processing)
Every 5-10 minutes (configurable), Atropos brokers a PuterJS request:
1. **Mistral OCR** extracts text from recent screenshots
2. **Claude/Sonnet** receives: `{metadata + OCR + historical context}`
3. **Returns:** Narrative summary + Intent classification (Deep Work/Communication/Consumption)

### 4. The Chronicle (Storage)
- **Hot Data:** Last 7 days (raw spool + screenshots)
- **Compressed:** Daily summaries after 7 days (narrative text only)
- **Archived:** Quarterly compression to cold storage

---

## IV. Privacy & Security Manifesto

**The Local-First Promise:**
- Raw keystrokes never stored (only velocity metrics)
- Screenshots processed locally before cloud OCR (The Redaction Layer strips emails/PII using regex + window class detection)
- **The Inflexible Kill Switch:** `Ctrl+Shift+End` terminates Clotho and wipes unprocessed spool instantly

**The Cloud Cut:**
PuterJS only receives:
- Redacted screenshots (optional, user-toggleable)
- Process names (e.g., "code.exe")
- Window title hashes (not raw titles for sensitive apps)
- Velocity vectors

**Permission Model:**
- Windows UI Access (for cross-window title reading)
- Graphics Capture consent (one-time system dialog)
- Mirror Mode: Live UI showing exactly what Clotho observes

---

## V. User Experience: The Dual Stream

### Resident Mode (System Tray)
- **Activity Pulse:** Minimalist indicator (green=productive, amber=scattered, red=afk)
- **Thread Notifications:** "You've been spinning the Rust bridge for 45 minutes"

### Dashboard Mode (Tauri Window)
**The Chronicle Tree:**
```
2024/
└── Q1/
    └── Week 3/
        └── 15th (Monday)/
            └── [Morning Thread] Deep Work (92%)
                └── "2 hours on Anchor Project API integration..."
```
**Environmental Reshaping:**
- **Resume Thread:** Reopens exact window states (apps, files, URLs) from any historical point
- **Cut Noise:** Minimize all windows unrelated to current intent
- **Verification Handoff:** One-click correction when Lachesis misidentifies intent

---

## VI. Technical Specifications

| Feature | Implementation |
|---------|---------------|
| **Platform** | Windows 10/11 (Win32 API) |
| **Clotho** | Rust binary (standalone, ~20MB RAM) |
| **Atropos** | Tauri app (WebView2, system tray integration) |
| **AI Backend** | PuterJS API (Mistral OCR + Claude 3.5 Sonnet) |
| **Database** | SQLite 3 (WAL mode, daily rotation) |
| **IPC** | WebSocket (localhost, JSON protocol) |
| **Image Format** | JPEG (adjustable quality), stored in hierarchical folders |
| **Security** | Regex redaction, perceptual hashing for deduplication |

---

## VII. The Narrative Delay (UX Innovation)

Moirai avoids the "uncanny valley" of instant AI by embracing **epistolary latency**. Rather than interrupting you with real-time suggestions, Lachesis observes for 5-10 minutes before weaving a narrative summary. This transforms the AI from an intrusive assistant into a perceptive diarist—someone who reflects rather than reacts.

**Result:** If the narrative feels wrong, you simply **Cut** it. No damage done.

---

## VIII. Current Scope (MVP Definition)

**In Scope:**
- Windows process monitoring and velocity tracking
- Smart screenshot capture (IDE/dev tools focus)
- PuterJS integration for OCR and narrative generation
- Hierarchical Chronicle storage (Year/Quarter/Week/Day)
- Environmental reshaping (resume/cut threads)
- Tauri-based system tray interface

**Out of Scope (V2):**
- Cross-device sync
- Local LLM inference (current cloud-only via PuterJS)
- Mobile integration
- Collaborative/shared narratives

---

## IX. The Value Proposition

For the **Deep Worker**: Automatic context resurrection—never lose your place when interrupted.  
For the **Distracted Mind**: Gentle narrative friction that makes unconscious scrolling visible.  
For the **Privacy Conscious**: Complete local custody of raw data; cloud only sees what you permit.

**Moirai** does not manage your time. It **reveals the story** of how you spend it.

---

**Implementation Status:** Architecture locked. Clotho (Rust) and Atropos (Tauri) ready for development. PuterJS API keys required for Lachesis activation.