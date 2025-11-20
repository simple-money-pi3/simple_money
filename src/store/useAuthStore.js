import { create } from "zustand";

export const useAuthStore = create((set) => ({
  user: { id: "1", name: "João Silva", email: "joao@email.com" },
  setUser: (user) => set({ user }),
}));
