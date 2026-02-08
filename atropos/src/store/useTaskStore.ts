import { create } from 'zustand';

export interface Subtask {
    id: string;
    title: string;
    completed: boolean;
}

export interface Task {
    id: string;
    title: string;
    description: string;
    startDate: string;
    dueDate: string;
    priority: 'Low' | 'Medium' | 'High';
    groupId: string;
    subtasks: Subtask[];
    completed: boolean;
}

export interface Group {
    id: string;
    name: string;
}

interface TaskState {
    groups: Group[];
    tasks: Task[];
    loadTasks: () => Promise<void>;
    addTask: (task: Omit<Task, 'id'>) => void;
    updateTask: (id: string, updates: Partial<Task>) => void;
    deleteTask: (id: string) => void;
    moveTask: (taskId: string, newGroupId: string) => void;
    addGroup: (name: string) => void;
    updateGroup: (id: string, name: string) => void;
    deleteGroup: (id: string) => void;

    // ADDED TO INTERFACE
    saveToDisk: () => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
    groups: [{ id: 'general', name: 'General' }],
    tasks: [],

    // Defined saveToDisk first so other methods can call it via get()
    saveToDisk: async () => {
        const { groups, tasks } = get();
        if (window.electronAPI) {
            await window.electronAPI.saveTasks({ groups, tasks });
        }
    },

    loadTasks: async () => {
        if (window.electronAPI) {
            const data = await window.electronAPI.getTasks();
            if (data && !data.error) {
                set({ groups: data.groups || [{ id: 'general', name: 'General' }], tasks: data.tasks || [] });
            }
        }
    },

    addTask: (task) => {
        const newTask = { ...task, id: crypto.randomUUID() };
        set((state) => ({ tasks: [...state.tasks, newTask] }));
        get().saveToDisk();
    },

    updateTask: (id, updates) => {
        set((state) => ({
            tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t))
        }));
        get().saveToDisk();
    },

    deleteTask: (id) => {
        set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));
        get().saveToDisk();
    },

    moveTask: (taskId, newGroupId) => {
        get().updateTask(taskId, { groupId: newGroupId });
    },

    addGroup: (name) => {
        const newGroup = { id: crypto.randomUUID(), name };
        set((state) => ({ groups: [...state.groups, newGroup] }));
        get().saveToDisk();
    },

    updateGroup: (id, name) => {
        set((state) => ({
            groups: state.groups.map((g) => (g.id === id ? { ...g, name } : g))
        }));
        get().saveToDisk();
    },

    deleteGroup: (id) => {
        set((state) => ({
            tasks: state.tasks.map((t) => (t.groupId === id ? { ...t, groupId: 'general' } : t)),
            groups: state.groups.filter((g) => g.id !== id)
        }));
        get().saveToDisk();
    },
}));