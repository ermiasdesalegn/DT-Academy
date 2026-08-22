import { create } from 'zustand';
import type { IAuthUser } from '@dt-academy/types';
import { api } from '../services/api';

interface AuthState {
  token: string | null;
  user: IAuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: localStorage.getItem('dt-token'),
  user: null,

  login: async (email, password) => {
    const { data } = await api.post<{ token: string; user: IAuthUser }>('/auth/login', {
      email,
      password,
    });
    localStorage.setItem('dt-token', data.token);
    set({ token: data.token, user: data.user });
  },

  logout: () => {
    localStorage.removeItem('dt-token');
    set({ token: null, user: null });
  },

  hydrate: async () => {
    const token = get().token;
    if (!token) return;
    try {
      const { data } = await api.get<{ user: IAuthUser }>('/auth/me');
      set({ user: data.user });
    } catch {
      get().logout();
    }
  },
}));
