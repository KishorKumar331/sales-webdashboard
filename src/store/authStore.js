import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      userEmail: null,
      userPhone: null,
      userData: null,
      isAuthenticated: null,
      hasProfile: false,
      
      // Actions
      setUserEmail: (email) => set({ userEmail: email }),
      setUserPhone: (phone) => set({ userPhone: phone }),
      setUserData: (user) => set({ userData: user }),
      setIsAuthenticated: (status) => set({ isAuthenticated: status }),
      setHasProfile: (status) => set({ hasProfile: status }),
      
      clearAuth: () => set({ 
        userEmail: null, 
        userPhone: null,
        userData: null, 
        isAuthenticated: false,
        hasProfile: false
      }),
    }),
    {
      name: 'auth-storage', // unique name for localStorage key
    }
  )
);
