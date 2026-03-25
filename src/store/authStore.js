import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      userEmail: null,
      userName: null,
      userPhone: null,
      userData: null,
      isAuthenticated: null,
      hasProfile: false,
      loginTimestamp: null,
      
      // Actions
      setUserEmail: (email) => set({ userEmail: email }),
      setUserName: (name) => set({ userName: name }),
      setUserPhone: (phone) => set({ userPhone: phone }),
      setUserData: (user) => set({ userData: user }),
      setIsAuthenticated: (status) => set({ isAuthenticated: status }),
      setHasProfile: (status) => set({ hasProfile: status }),
      setLoginTimestamp: (ts) => set({ loginTimestamp: ts }),
      
      clearAuth: () => set({ 
        userEmail: null, 
        userName: null,
        userPhone: null,
        userData: null, 
        isAuthenticated: false,
        hasProfile: false,
        loginTimestamp: null
      }),
    }),
    {
      name: 'auth-storage', // unique name for localStorage key
    }
  )
);
