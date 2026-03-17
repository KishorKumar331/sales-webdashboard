import { useState, useEffect, useCallback } from "react";
import { fetchAuthSession, getCurrentUser, signOut } from "aws-amplify/auth";
import { useAuthStore } from "../store/authStore";

const SESSION_API =
  "https://sg76vqy4vi.execute-api.ap-south-1.amazonaws.com/profile/session";

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(true);
  
  // Get state from zustand store
  const { 
    userEmail, 
    userData, 
    isAuthenticated,
    setUserEmail,
    setIsAuthenticated,
    clearAuth 
  } = useAuthStore();
  
  // Derive user from store data
  const user = userData;
console.log(user)
  /**
   * Check session using Amplify
   */
  const checkSession = useCallback(async (emailToRevalidate) => {
    setIsLoading(true);

    try {
      const session = await fetchAuthSession();
      if (session.tokens) {
        setIsAuthenticated(true);
        
        // Optionally fetch the current user to get their email
        const user = await getCurrentUser();
        if (user.signInDetails?.loginId) {
           setUserEmail(user.signInDetails.loginId);
        }

        // If we still need to load full user details from backend (since Cognito only has basic info)
        const emailToFetch = emailToRevalidate || userEmail || user.signInDetails?.loginId;
        
        if (emailToFetch && (!userData || Object.keys(userData).length === 0)) {
           // We can fetch full profile from the existing API if needed
           const url = `${SESSION_API}?email=${encodeURIComponent(emailToFetch)}`;
           const response = await fetch(url, { method: "GET" });
           if (response.ok) {
             const result = await response.json();
             // Just an example, assuming the context of Auth OnBoarding where we set userData
             if (result && Array.isArray(result) && result.length > 0) {
                 // The auth store might not have a direct `setUserData` exposed here based on original code, 
                 // but OnBoarding uses useAuthStore directly.
             }
           }
        }
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Session check error:", error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, [userEmail, userData, setIsAuthenticated, setUserEmail]);

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
    }
    
    // Revalidate with backend session, passing email from login response
    await checkSession(email);
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
    login,
    logout,
    checkSession,
  };
};
