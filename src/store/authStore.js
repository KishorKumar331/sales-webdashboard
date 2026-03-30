import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      // State
      userEmail: null,
      userData: null,
      isAuthenticated: null,
      hasProfile: null,
      inspectedUser: null,

      // Actions
      setUserEmail: (email) => set({ userEmail: email }),
      setUserData: (user) => {
        const profile = user?.user || user;
        set({
          userData: user,
          hasProfile: !!(profile && (profile.companyname || profile.CompanyName || profile.BusinessName))
        });
      },
      setHasProfile: (status) => set({ hasProfile: status }),
      setIsAuthenticated: (status) => set({ isAuthenticated: status }),
      setInspectedUser: (user) => set({ inspectedUser: user }),
      clearInspectedUser: () => set({ inspectedUser: null }),

      clearAuth: () => set({
        userEmail: null,
        userData: null,
        isAuthenticated: false,
        hasProfile: false,
        inspectedUser: null
      }),
    }),
    {
      name: 'auth-storage', // unique name for localStorage key
    }
  )
);
