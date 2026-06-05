import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user has a saved token
    const token = localStorage.getItem("hts_token");
    if (token) {
      api.setToken(token);
      api.getProfile()
        .then((data) => {
          setUser(data.user);
          setProfile(data.user);
        })
        .catch(() => {
          // Token expired or invalid
          api.logout();
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const signUp = useCallback(async (email, password, fullName, phone) => {
    const data = await api.register(email, password, fullName, phone);
    if (data.token) {
      setUser(data.user);
      setProfile(data.user);
    }
    return data;
  }, []);

  const signIn = useCallback(async (email, password) => {
    const data = await api.login(email, password);
    setUser(data.user);
    setProfile(data.user);
    return data;
  }, []);

  const signInWithGoogle = useCallback(async () => {
    // Google OAuth will redirect to backend
    // For now, we use a simulated Google auth
    const googleUser = {
      email: "google-user@gmail.com",
      googleId: "google_" + Date.now(),
      fullName: "Google User",
    };

    const data = await api.googleAuth(
      googleUser.email,
      googleUser.googleId,
      googleUser.fullName,
      null
    );

    setUser(data.user);
    setProfile(data.user);
    return data;
  }, []);

  const signOut = useCallback(async () => {
    api.logout();
    setUser(null);
    setProfile(null);
  }, []);

  const isAdmin = profile?.role === "admin";

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
