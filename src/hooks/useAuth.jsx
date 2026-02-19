import { useState, useEffect, useCallback } from "react";

const SESSION_API =
  "https://sg76vqy4vi.execute-api.ap-south-1.amazonaws.com/salesapp/session";

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  /**
   * Check session using secure cookie
   */
  const checkSession = useCallback(async (email) => {
  
    setIsLoading(true);

    try {
      const url = email ? `${SESSION_API}?email=${encodeURIComponent(email)}` : SESSION_API;
      const response = await fetch(url, {
        method: "GET",
        credentials: "include", // 🔥 IMPORTANT for cookies
      });

      if (!response.ok) {
        throw new Error("Session API failed");
      }

      const result = await response.json();

      if (result?.valid || result === true) {
        setIsAuthenticated(true);
        setUser({ email: result.email || email });
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error("Session check error:", error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

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
    
    if (userData) {
      // Extract email from userData
      const userObj = Array.isArray(userData) ? userData[0] : userData;
      email = userObj?.Email || userObj?.email;
      
      // Set user from provided data first (for immediate UI update)
      setUser(userObj);
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
          credentials: "include",
        }
      );
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setIsAuthenticated(false);
      setUser(null);
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
