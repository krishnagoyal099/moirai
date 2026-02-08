interface ElectronAPI {
    // ── Calendar ──
    getCalendarData: () => Promise<Array<{ date: string; flow: number; keystrokes: number }>>;

    // ── Telemetry ──
    readLatestTelemetry: () => Promise<unknown>;
    readDailySummary: () => Promise<{ content?: string; error?: string }>;

    // ── User Profile ──
    getUserProfile: () => Promise<unknown>;
    saveUserProfile: (data: unknown) => Promise<{ success: boolean; error?: string }>;

    // ── Tasks ──
    getTasks: () => Promise<unknown>;
    saveTasks: (data: unknown) => Promise<{ success: boolean; error?: string }>;

    // ── Real-time Data Watcher ──
    onDataChange: (callback: (data: { path: string; type: string }) => void) => () => void;

    // ── Tracking Pause State ──
    onTrackingPaused: (callback: (isPaused: boolean) => void) => () => void;

    // ── Auto-Launch ──
    getAutoLaunch: () => Promise<boolean>;
    setAutoLaunch: (enabled: boolean) => Promise<{ success: boolean; error?: string }>;

    // ── Notifications ──
    sendNotification: (title: string, body: string) => Promise<{ success: boolean; error?: string }>;

    // ── Demo Mode ──
    setDemoMode: (enabled: boolean) => Promise<{ success: boolean }>;
    getDemoMode: () => Promise<boolean>;

    // ── API Key Storage ──
    setApiKey: (key: string) => Promise<{ success: boolean; error?: string }>;
    getApiKey: () => Promise<{ hasKey: boolean; masked: string }>;
    deleteApiKey: () => Promise<{ success: boolean }>;

    // ── Data Backup & Export ──
    exportData: () => Promise<{ success: boolean; path?: string; size?: number; error?: string }>;
    importData: () => Promise<{ success: boolean; error?: string }>;

    // ── Deep Linking ──
    onDeepLink: (callback: (url: string) => void) => () => void;

    // ── Auto-Updater ──
    checkForUpdates: () => Promise<{ available: boolean; version?: string; error?: string }>;
    downloadUpdate: () => Promise<{ success: boolean; error?: string }>;
    installUpdate: () => void;
    onUpdateAvailable: (callback: (info: { version: string; releaseNotes?: string }) => void) => () => void;
    onUpdateDownloaded: (callback: () => void) => () => void;
}

interface Window {
    electronAPI: ElectronAPI;
}