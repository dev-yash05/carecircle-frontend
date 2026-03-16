import { create } from "zustand";
import type { User } from "@/lib/api/auth";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  clearUser: () => void;
  // Role helpers
  isFamilyAdmin: () => boolean;
  isSuperAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,

  setUser: (user) =>
    set({ user, isAuthenticated: user !== null }),

  clearUser: () =>
    set({ user: null, isAuthenticated: false }),

  isFamilyAdmin: () => {
    const role = get().user?.role;
    return role === "ADMIN" || role === "FAMILY_ADMIN" || role === "SUPER_ADMIN";
  },

  isSuperAdmin: () => get().user?.role === "SUPER_ADMIN",
}));
