import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      userEmail: null,
      userData: null,
      isAuthenticated: null,
      
      // Actions
      setUserEmail: (email) => set({ userEmail: email }),
      setUserData: (user) => set({ userData: user }),
      setIsAuthenticated: (status) => set({ isAuthenticated: status }),
      
      clearAuth: () => set({ 
        userEmail: null, 
        userData: null, 
        isAuthenticated: false 
      }),
    }),
    {
      name: 'auth-storage', // unique name for localStorage key
    }
  )
);
