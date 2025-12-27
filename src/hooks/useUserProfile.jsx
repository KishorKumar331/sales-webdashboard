import { useEffect, useState } from "react";

export const useUserProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const data = localStorage.getItem("userProfile");

        if (data) {
          const parsed = JSON.parse(data);
          const userObj = Array.isArray(parsed) ? parsed[0] : parsed;
          setUser(userObj);
        }
      } catch (err) {
        console.error("Error loading user profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  return { user, loading };
};
