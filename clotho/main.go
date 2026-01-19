package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"moirai/clotho/internal/capture"
	"moirai/clotho/internal/config"
	"moirai/clotho/internal/hooks"
	"moirai/clotho/internal/storage"
	"moirai/clotho/internal/telemetry"
	"moirai/clotho/internal/worker"
)

func main() {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// FIX: Don't ignore config errors
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("FATAL: Could not load config: %v", err)
	}

	pathfinder := storage.NewPathfinder(cfg.DataRoot)

	todayPath, err := pathfinder.GetDailyPath(time.Now())
	if err != nil {
		log.Fatalf("FATAL: Path generation failed: %v", err)
	}

	if err := os.MkdirAll(todayPath, 0755); err != nil {
		log.Fatalf("FATAL: Directory creation failed: %v", err)
	}

	jsonPath, err := pathfinder.GetFilePath(time.Now(), "raw_telemetry.json")
	if err != nil {
		log.Fatalf("FATAL: File path generation failed: %v", err)
	}

	meta := telemetry.MetaInfo{
		Date:      time.Now().Format("2006-01-02"),
		DeviceID:  "dev-001",
		OS:        "windows",
		Timezone:  "Local",
		ClothoVer: "1.0",
	}

	store := telemetry.NewStore(jsonPath)
	if err := store.Load(meta); err != nil {
		log.Printf("WARN: Data load issue (recovering): %v", err)
	}

	capturer, err := capture.NewScreenCapturer(todayPath)
	if err != nil {
		log.Fatalf("FATAL: Could not initialize capturer: %v", err)
	}

	lister := hooks.NewListener()
	processor := worker.NewProcessor(lister, store, capturer)

	doneChan := make(chan struct{})
	go processor.Start(ctx, doneChan)

	log.Printf("SUCCESS: Clotho (Smart Mode) running. Data: %s", jsonPath)

	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
	<-sigChan

	log.Println("INFO: Shutting down...")
	cancel()
	<-doneChan
	log.Println("INFO: Done.")
}
