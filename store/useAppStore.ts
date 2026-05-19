import { create } from 'zustand';
import { User, Theme } from '../types';
import { getUser, updateUser } from '../db/queries/users';
import * as SecureStore from 'expo-secure-store';

interface AppState {
  user: User | null;
  isLocked: boolean;
  isLoading: boolean;
  dbReady: boolean;

  loadUser: () => Promise<void>;
  setUser: (user: User) => void;
  updateUserSettings: (data: Partial<Omit<User, 'id' | 'createdAt'>>) => Promise<void>;
  setLocked: (locked: boolean) => void;
  setDbReady: (ready: boolean) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  isLocked: false,
  isLoading: true,
  dbReady: false,

  loadUser: async () => {
    set({ isLoading: true });
    try {
      const user = await getUser();
      set({ user, isLoading: false });
    } catch (e) {
      set({ isLoading: false });
    }
  },

  setUser: (user) => set({ user }),

  updateUserSettings: async (data) => {
    await updateUser(data);
    const current = get().user;
    if (current) {
      set({ user: { ...current, ...data } });
    }
  },

  setLocked: (locked) => set({ isLocked: locked }),
  setDbReady: (ready) => set({ dbReady: ready }),
}));
