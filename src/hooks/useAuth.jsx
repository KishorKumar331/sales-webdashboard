import { useState, useEffect, useCallback } from "react";
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
   * Check session using secure cookie
   */
  const checkSession = useCallback(async (email) => {
    setIsLoading(true);
    
    // Get email from zustand store if not provided
    const storedEmail = email || userEmail;
    
    if (!storedEmail) {
      setIsLoading(false);
      setIsAuthenticated(false);
      return;
    }

    try {
      const url = storedEmail ? `${SESSION_API}?email=${encodeURIComponent(storedEmail)}` : SESSION_API;
      const response = await fetch(url, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Session API failed");
      }

      const result = await response.json();

      if (result?.valid || result === true) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Session check error:", error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, [userEmail, setIsAuthenticated]);

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
   * Logout API should clear cookie server-side
   */
  const logout = async () => {
    try {
      await fetch(
        "https://sg76vqy4vi.execute-api.ap-south-1.amazonaws.com/salesapp/logout",
        {
          method: "POST",
          // credentials: "include",
        }
      );
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
