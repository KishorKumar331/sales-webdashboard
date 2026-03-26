import { useState, useEffect, useCallback } from "react";
import { fetchAuthSession, getCurrentUser, signOut, resetPassword, confirmResetPassword } from "aws-amplify/auth";
import { useAuthStore } from "../store/authStore";

const SESSION_API =
  "https://sg76vqy4vi.execute-api.ap-south-1.amazonaws.com/profile/session";

const PROFILE_API = 'https://sg76vqy4vi.execute-api.ap-south-1.amazonaws.com/profile/Auth?';

export const useAuth = () => {

  // Get state from zustand store
  const {
    userEmail,
    userData,
    isAuthenticated,
    hasProfile,
    setUserEmail,
    setUserData,
    setIsAuthenticated,
    setHasProfile,
    setIsLoading,
    setUserPhone,
    setUserName,
    setUserId,
    isLoading,
    loginTimestamp,
    setLoginTimestamp,
    clearAuth
  } = useAuthStore();

  // Derive user from store data
  const user = userData;
  console.log(user)
  /**
   * Check session using Amplify
   */
  const checkSession = useCallback(async () => {
    setIsLoading(true);

    try {
      // Enforce 12-hour session limit
      const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;
      if (loginTimestamp && (Date.now() - loginTimestamp > TWELVE_HOURS_MS)) {
        console.log('⏰ Session expired (12h limit). Force logout.');
        await signOut();
        clearAuth();
        return;
      }

      const session = await fetchAuthSession();
      if (session.tokens) {
        setIsAuthenticated(true);
        const userId = session.userSub;
        setUserId(userId);

        // Fetch user attributes for pre-filling/sync
        const { fetchUserAttributes } = await import('aws-amplify/auth');
        const attributes = await fetchUserAttributes();
        setUserEmail(attributes.email || "");
        setUserName(attributes.name || "");
        setUserPhone(attributes.phone_number || "");

        // Check profile using Email: GET /profile/Auth?Email=<email>
        try {
          const profileUrl = `${PROFILE_API}Email=${encodeURIComponent(attributes.email || "")}`;
          const response = await fetch(profileUrl);
          
          if (response.ok) {
            const profileData = await response.json();
            const data = Array.isArray(profileData) ? profileData[0] : profileData;
            
            if (data && Object.keys(data).length > 0) {
              setUserData(data);
              setHasProfile(true);
              if (data.phone) setUserPhone(data.phone);
              if (data.fullname) setUserName(data.fullname);
            } else {
              setHasProfile(false);
              setUserData(null);
            }
          } else {
            setHasProfile(false);
          }
        } catch (apiError) {
          console.error('🔥 Profile API error:', apiError);
          setHasProfile(false);
        }
      } else {
        setIsAuthenticated(false);
        setHasProfile(false);
      }
    } catch (error) {
      console.error("Session check error:", error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, [setUserEmail, setUserData, setIsAuthenticated]);

  /**
   * Run on app mount
   */

  /**
   * Login → set user data and revalidate session from backend (cookie-based)
   */
  const login = async (profileFromCaller = null) => {
    setIsLoading(true);
    try {
      const { fetchAuthSession, fetchUserAttributes } = await import('aws-amplify/auth');
      const session = await fetchAuthSession();
      
      if (session.tokens) {
        setIsAuthenticated(true);
        const userId = session.userSub;
        setUserId(userId);

        const attributes = await fetchUserAttributes();
        setUserEmail(attributes.email || "");
        setUserName(attributes.name || "");
        setUserPhone(attributes.phone_number || "");

        // If caller provided profile data, use it; otherwise fetch from API
        if (profileFromCaller && Object.keys(profileFromCaller).length > 0) {
          setUserData(profileFromCaller);
          setHasProfile(true);
          if (profileFromCaller.phone) setUserPhone(profileFromCaller.phone);
          if (profileFromCaller.fullname) setUserName(profileFromCaller.fullname);
        } else {
          // Check profile using Email spec: GET /profile/Auth?Email=<email>
          try {
            const profileUrl = `${PROFILE_API}Email=${encodeURIComponent(attributes.email || "")}`;
            const response = await fetch(profileUrl);
            const profileData = response.ok ? await response.json() : null;
            const data = Array.isArray(profileData) ? profileData[0] : profileData;
            
            if (data && Object.keys(data).length > 0) {
              setUserData(data);
              setHasProfile(true);
              if (data.phone) setUserPhone(data.phone);
              if (data.fullname) setUserName(data.fullname);
            } else {
              setHasProfile(false);
              setUserData(null);
            }
          } catch (e) {
            setHasProfile(false);
          }
        }
        
        setLoginTimestamp(Date.now());
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      console.error("Login process error:", error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout API should clear session from Cognito and zustand
   */
  const logout = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      // Clear zustand store on logout
      clearAuth();
    }
  };

  return {
    isAuthenticated,
    hasProfile,
    isLoading,
    user,
    login,
    logout,
    checkSession,
    resetPassword,
    confirmResetPassword,
  };
};
