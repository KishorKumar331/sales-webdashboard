import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      userEmail: null,
      userData: null,
      isAuthenticated: null,
      inspectedUser: null,
      
      // Actions
      setUserEmail: (email) => set({ userEmail: email }),
      setUserData: (user) => set({ userData: user }),
      setIsAuthenticated: (status) => set({ isAuthenticated: status }),
      setInspectedUser: (user) => set({ inspectedUser: user }),
      clearInspectedUser: () => set({ inspectedUser: null }),
      
      clearAuth: () => set({ 
        userEmail: null, 
        userData: null, 
        isAuthenticated: false,
        inspectedUser: null
      }),
    }),
    {
      name: 'auth-storage', // unique name for localStorage key
    }
  )
);
