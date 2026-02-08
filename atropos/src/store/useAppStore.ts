import { create } from 'zustand';
import dayjs from 'dayjs';

interface User {
    name: string;
    dob: string;
    profession: string;
    interests: string;
}

export interface TelemetryData {
    meta: {
        date: string;
    };
    metrics: {
        total_keystrokes: number;
        total_mouse_dist_pixels: number;
        idle_minutes: number;
        flow_score_estimate: number;
        top_window: string;
    };
    events: any[];
}

export interface AppState {
    // User
    user: User | null;
    setUser: (user: User) => void;
    loadUser: () => Promise<void>;

    // LIVE DATA
    telemetry: TelemetryData | null;
    summary: any;
    loadData: () => Promise<void>;

    // API Key
    apiKey: string;
    setGroqKey: (key: string) => void;

    // Navigation
    currentPage: 'onboarding' | 'home' | 'tasks' | 'stats' | 'chat' | 'settings';
    navigate: (page: AppState['currentPage']) => void;

    // UI State
    isMenuOpen: boolean;
    toggleMenu: () => void;
    isMenuVisible: boolean;
    setMenuVisible: (visible: boolean) => void;
    demoMode: boolean;
    toggleDemoMode: () => void;
    updateUserProfile: (data: User) => Promise<void>
}

export const useAppStore = create<AppState>((set, get) => ({
    user: null,
    telemetry: null,
    summary: null,
    apiKey: '',
    currentPage: 'onboarding',
    isMenuOpen: false,
    isMenuVisible: true,
    demoMode: false,

    setUser: (user) => set({ user }),

    loadUser: async () => {
        if (window.electronAPI) {
            const user = await window.electronAPI.getUserProfile() as User;
            if (user) {
                set({ user, currentPage: 'home' });
                get().loadData();
            } else {
                set({ currentPage: 'onboarding' });
            }
        }
    },

    loadData: async () => {
        if (!window.electronAPI) return;

        // 1. Check Demo Mode
        const isDemo = await window.electronAPI.getDemoMode();
        set({ demoMode: isDemo });

        // 2. Load Telemetry
        const telResult = await window.electronAPI.readLatestTelemetry() as any;
        if (!telResult.error) {
            set({ telemetry: telResult });
        }

        // 3. Load AI Summary
        const sumResult = await window.electronAPI.readDailySummary() as any;
        if (!sumResult.error && sumResult.content) {
            set({
                summary: {
                    date: telResult?.meta?.date || dayjs().format('YYYY-MM-DD'),
                    flow_score: telResult?.metrics?.flow_score_estimate || 0,
                    dominant_emotion: "Unknown",
                    tags: [],
                    summary_text: sumResult.content.substring(0, 200) + "...",
                    top_activities: []
                }
            });
        }
    },

    setGroqKey: (key: string) => {
        set({ apiKey: key });
    },

    navigate: (page) => set({ currentPage: page, isMenuOpen: false }),

    toggleMenu: () => set((state) => ({ isMenuOpen: !state.isMenuOpen })),

    setMenuVisible: (visible) => set({ isMenuVisible: visible }),

    updateUserProfile: async (data) => {
        if (window.electronAPI) {
            const res = await window.electronAPI.saveUserProfile(data);
            if (res.success) set({ user: data });
        }
    },

    toggleDemoMode: async () => {
        const current = get().demoMode;
        const newState = !current;
        if (window.electronAPI) {
            await window.electronAPI.setDemoMode(newState);
        }
        set({ demoMode: newState });
        get().loadData();
    },
}));

export const getGreeting = () => {
    const hour = dayjs().hour();
    if (hour < 12) return "Morning";
    if (hour < 18) return "Afternoon";
    return "Evening";
};