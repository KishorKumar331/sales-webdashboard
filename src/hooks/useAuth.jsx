import { useState, useEffect, useCallback } from "react";
import { fetchAuthSession, getCurrentUser, signOut } from "aws-amplify/auth";
import { useAuthStore } from "../store/authStore";

const SESSION_API =
  "https://sg76vqy4vi.execute-api.ap-south-1.amazonaws.com/profile/session";

const PROFILE_API = 'https://sg76vqy4vi.execute-api.ap-south-1.amazonaws.com/profile/Auth?';

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(true);

  // Get state from zustand store
  const {
    userData,
    isAuthenticated,
    inspectedUser,
    setUserEmail,
    setIsAuthenticated,
    setInspectedUser,
    clearInspectedUser,
    clearAuth
  } = useAuthStore();

  // Derive user from store data - prioritize inspected user
  const user = inspectedUser || userData;
  const realUser = userData;
  const isInspecting = !!inspectedUser;

  console.log('Effective User:', user);
  if (isInspecting) console.log('INSPECT MODE ACTIVE: Viewing as', user.Email);
  /**
   * Check session using Amplify
   */
  const checkSession = useCallback(async (emailToRevalidate) => {
    setIsLoading(true);

    try {
      const session = await fetchAuthSession();
      if (session.tokens) {
        setIsAuthenticated(true);

        // Get current user from Cognito
        const user = await getCurrentUser();
        const userEmail = user.signInDetails?.loginId || emailToRevalidate;
        
        if (userEmail) {
          setUserEmail(userEmail);
          
          // Make API call to profile API with user email
          try {
            const profileUrl = `${PROFILE_API}Email=${encodeURIComponent(userEmail)}`;
            console.log('🔥 Calling profile API:', profileUrl);
            
            const response = await fetch(profileUrl, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
            });
            
            if (response.ok) {
              const profileData = await response.json();
              console.log('🔥 Profile API response:', profileData);
              
              // Set user data in store
              const userData = Array.isArray(profileData) ? profileData[0] : profileData;
              if (userData && Object.keys(userData).length > 0) {
                useAuthStore.getState().setUserData(userData);
                console.log('🔥 User data set in store:', userData);
                setIsAuthenticated(true);
                return userData;
              }
            } else {
              console.log('🔥 Profile API failed:', response.status);
            }
          } catch (apiError) {
            console.error('🔥 Profile API error:', apiError);
          }
        }
      } else {
        setIsAuthenticated(false);
        useAuthStore.getState().setHasProfile(false);
      }
    } catch (error) {
      console.error("Session check error:", error);
      setIsAuthenticated(false);
      useAuthStore.getState().setHasProfile(false);
    } finally {
      setIsLoading(false);
    }
  }, [setUserEmail, setIsAuthenticated]);

  /**
   * Run on app mount
   */
  useEffect(() => {
    checkSession();
  }, [checkSession]);

  /**
   * Login → set user data and revalidate session from backend (cookie-based)
   */
  const login = async (userData) => {
    let email = null;
    let fullUserData = null;

    if (userData) {
      // Extract email and full user data
      const userObj = Array.isArray(userData) ? userData[0] : userData;
      email = userObj?.Email || userObj?.email;
      fullUserData = userObj;

      // Store email and full user data in zustand store
      if (email) {
        setUserEmail(email);
      }

      // Store complete user data from login API
      setIsAuthenticated(true);
      
      // Set user data in store if available from login
      if (fullUserData) {
        useAuthStore.getState().setUserData(fullUserData);
        console.log('🔥 User data set from login:', fullUserData);
      }
    }

    // Revalidate with backend session, passing email from login response
    const profile = await checkSession(email);
    console.log('🔥 login hook profile result:', profile);
    return { success: true, hasProfile: !!profile };
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
    isLoading,
    user,
    realUser,
    isInspecting,
    setInspectedUser,
    clearInspectedUser,
    login,
    logout,
    checkSession,
  };
};
