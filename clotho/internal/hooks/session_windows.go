package hooks

import (
	"log"
	"syscall"
	"time"
	"unsafe"
)

// SessionDetector listens for Windows session events.
type SessionDetector struct {
	locked chan bool
	stopCh chan struct{}
}

// NewSessionDetector creates a session detector.
func NewSessionDetector() *SessionDetector {
	sd := &SessionDetector{
		locked: make(chan bool, 1),
		stopCh: make(chan struct{}),
	}
	// Start the poller
	go sd.pollSessionState()
	return sd
}

// Locked returns a read-only channel.
func (sd *SessionDetector) Locked() <-chan bool {
	return sd.locked
}

// Stop halts the polling.
func (sd *SessionDetector) Stop() {
	close(sd.stopCh)
}

// pollSessionState is wrapped in a recover function to prevent the app from crashing
// if the OS environment (e.g., Sandbox/Security Software) blocks user32.dll calls.
func (sd *SessionDetector) pollSessionState() {
	// CRITICAL FIX: Recover from panic if the OS blocks the API
	defer func() {
		if r := recover(); r != nil {
			log.Printf("[Session] WARNING: Environment blocked session detection API (%v).", r)
			log.Println("[Session] The application will continue, but 'Pause on Lock' is disabled.")
		}
	}()

	user32 := syscall.NewLazyDLL("user32.dll")
	// We try the standard OpenDesktop.
	openDesktop := user32.NewProc("OpenDesktop")
	closeDesktop := user32.NewProc("CloseDesktop")

	wasLocked := false

	for {
		select {
		case <-sd.stopCh:
			return
		default:
		}

		// Attempt to open the default desktop
		desktopNamePtr, _ := syscall.UTF16PtrFromString("default")

		// Call returns (handle, errno, error).
		// In syscall.Call, the 2nd return is an integer (uintptr).
		hDesktop, errno, _ := openDesktop.Call(
			uintptr(unsafe.Pointer(desktopNamePtr)),
			0,
			0,
			0x0100, // DESKTOP_READOBJECTS
		)

		// FIX: Compare errno (integer) to 0, not assign to an error variable.
		// If handle is 0 or there is a non-zero errno, we assume locked/blocked.
		isLocked := (hDesktop == 0) || (errno != 0)

		if isLocked != wasLocked {
			wasLocked = isLocked
			select {
			case sd.locked <- isLocked:
				if isLocked {
					log.Println("[Session] Workstation LOCKED. Pausing recording.")
				} else {
					log.Println("[Session] Workstation UNLOCKED. Resuming recording.")
				}
			default:
			}
		}

		if hDesktop != 0 {
			closeDesktop.Call(hDesktop)
		}

		time.Sleep(2 * time.Second)
	}
}
