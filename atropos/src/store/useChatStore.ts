import { create } from 'zustand';
import { groqService } from '../services/groqService';

export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
}

export interface ChatSession {
    id: string;
    title: string;
    messages: Message[];
}

interface ChatState {
    sessions: ChatSession[];
    activeSessionId: string | null;
    isOnline: boolean;

    // Actions
    createSession: () => void;
    deleteSession: (id: string) => void;
    selectSession: (id: string) => void;
    sendMessage: (content: string, contextData?: string) => Promise<void>;
    checkConnection: () => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
    sessions: [],
    activeSessionId: null,
    isOnline: false,

    createSession: () => {
        const newSession: ChatSession = {
            id: crypto.randomUUID(),
            title: 'New Inquiry',
            messages: []
        };

        // Set this new session as active immediately
        set((state) => ({
            sessions: [newSession, ...state.sessions],
            activeSessionId: newSession.id
        }));
    },

    deleteSession: (id) => {
        const state = get();
        const newSessions = state.sessions.filter(s => s.id !== id);

        // DETERMINE NEXT ACTIVE SESSION LOGIC
        let nextActive = state.activeSessionId;

        if (state.activeSessionId === id) {
            // If we deleted the active one, pick the first available, or null if none
            nextActive = newSessions.length > 0 ? newSessions[0].id : null;
        }

        // CRITICAL: If sessions become empty, create a fresh one automatically so we don't get stuck on "Initializing..."
        if (newSessions.length === 0) {
            const freshSession: ChatSession = {
                id: crypto.randomUUID(),
                title: 'New Inquiry',
                messages: []
            };
            set({
                sessions: [freshSession],
                activeSessionId: freshSession.id
            });
            return;
        }

        set({
            sessions: newSessions,
            activeSessionId: nextActive
        });
    },

    selectSession: (id) => set({ activeSessionId: id }),

    checkConnection: async () => {
        try {
            // Simple connectivity check
            await fetch('https://api.groq.com/openai/v1/models', {
                method: 'GET',
                headers: { 'Authorization': 'Bearer dummy' }
            });
            set({ isOnline: true });
        } catch {
            set({ isOnline: false });
        }
    },

    sendMessage: async (content, contextData) => {
        const { activeSessionId, sessions } = get();

        // SAFETY: If somehow no active session, create one
        if (!activeSessionId) {
            get().createSession();
            return;
        }

        const activeSession = sessions.find(s => s.id === activeSessionId);

        // SAFETY: If session ID is valid but object is missing (consistency error), reset
        if (!activeSession) {
            const fresh: ChatSession = { id: crypto.randomUUID(), title: 'Recovered Inquiry', messages: [] };
            set({ sessions: [fresh, ...sessions], activeSessionId: fresh.id });
            return;
        }

        const userMessage: Message = {
            id: crypto.randomUUID(),
            role: 'user',
            content,
            timestamp: Date.now()
        };

        // 1. Add User Message
        set((state) => ({
            sessions: state.sessions.map(s => {
                if (s.id === activeSessionId) {
                    const updated = [...s.messages, userMessage];
                    return {
                        ...s,
                        messages: updated,
                        // Update title on first message
                        title: s.messages.length === 0 ? content.slice(0, 25) + (content.length > 25 ? '...' : '') : s.title
                    };
                }
                return s;
            })
        }));

        // 2. Generate Title if 2nd user message
        if (activeSession.messages.length === 1) {
            groqService.generateTitle([...activeSession.messages, userMessage]).then(title => {
                set(state => ({
                    sessions: state.sessions.map(s => s.id === activeSessionId ? { ...s, title } : s)
                }));
            }).catch(e => console.warn("Title gen failed", e));
        }

        // 3. Call Groq
        try {
            const assistantContent = await groqService.chat([...activeSession.messages, userMessage], contextData);

            const aiMessage: Message = {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: assistantContent,
                timestamp: Date.now()
            };

            set((state) => ({
                sessions: state.sessions.map(s => s.id === activeSessionId ? { ...s, messages: [...s.messages, aiMessage] } : s)
            }));
        } catch (err) {
            console.error(err);
            const errorMsg: Message = {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: "I apologize, but I'm unable to connect to the Oracle. Please check your API Key in Settings.",
                timestamp: Date.now()
            };
            set((state) => {
                // Ensure the session still exists before appending error
                const exists = state.sessions.find(s => s.id === activeSessionId);
                if (exists) {
                    return {
                        sessions: state.sessions.map(s => s.id === activeSessionId ? { ...s, messages: [...s.messages, errorMsg] } : s)
                    };
                }
                return {};
            });
        }
    }
}));