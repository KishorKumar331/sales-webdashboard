import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      userEmail: null,
      userName: null,
      userPhone: null,
      userId: null,
      userData: null,
      isAuthenticated: null,
      hasProfile: null, // null = check pending, false = no profile, true = has profile
      isLoading: true,
      loginTimestamp: null,
      
      // Actions
      setUserEmail: (email) => set({ userEmail: email }),
      setUserName: (name) => set({ userName: name }),
      setUserPhone: (phone) => set({ userPhone: phone }),
      setUserId: (id) => set({ userId: id }),
      setUserData: (user) => set({ userData: user }),
      setIsAuthenticated: (status) => set({ isAuthenticated: status }),
      setHasProfile: (status) => set({ hasProfile: status }),
      setIsLoading: (status) => set({ isLoading: status }),
      setLoginTimestamp: (ts) => set({ loginTimestamp: ts }),
      
      clearAuth: () => set({ 
        userEmail: null, 
        userName: null,
        userPhone: null,
        userId: null,
        userData: null, 
        isAuthenticated: false,
        hasProfile: null,
        isLoading: false,
        loginTimestamp: null
      }),
    }),
    {
      name: 'auth-storage', // unique name for localStorage key
      partialize: (state) => Object.fromEntries(
        Object.entries(state).filter(([key]) => !['isLoading'].includes(key))
      ),
    }
  )
);
