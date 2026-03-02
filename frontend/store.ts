import { create } from 'zustand';

interface User {
  id: number;
  name: string;
  email: string;
  tower: string;
  unit: string;
  profile_image_url?: string | null;
  is_verified: number;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user, isLoading: false }),
  logout: async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    set({ user: null });
  },
}));

interface FeatureFlags {
  enable_email_verification: boolean;
  enable_in_app_notifications: boolean;
  enable_email_notifications: boolean;
  enable_web_push_notifications: boolean;
  enable_messaging: boolean;
  enable_listing_photos: boolean;
  limit_listings_per_user: number;
}

interface ConfigState {
  flags: FeatureFlags | null;
  fetchFlags: () => Promise<void>;
}

export const useConfigStore = create<ConfigState>((set) => ({
  flags: null,
  fetchFlags: async () => {
    const apiBase = import.meta.env.VITE_API_URL || '';
    const res = await fetch(`${apiBase}/api/feature-flags`);
    const flags = await res.json();
    set({ flags });
  },
}));
