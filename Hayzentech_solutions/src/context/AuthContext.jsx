import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabase/client";

const AuthContext = createContext(null);

const assertSupabaseConfigured = () => {
  if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
    throw new Error(
      "Authentication is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file."
    );
  }
};

// Defer Supabase calls out of onAuthStateChange to avoid auth deadlocks.
const scheduleProfileFetch = (fetchProfile, userId) => {
  queueMicrotask(() => {
    void fetchProfile(userId);
  });
};

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
    // Check active session
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      }
      setLoading(false);
    };

    getSession();

    // Listen for auth changes (must not await Supabase calls here — causes sign-in deadlock)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) {
        if (event === "SIGNED_IN") {
          // For OAuth sign-ins, ensure profile exists
          queueMicrotask(async () => {
            const existing = await fetchProfile(session.user.id);
            if (!existing) {
              const { error: insertErr } = await supabase
                .from("profiles")
                .insert([
                  {
                    id: session.user.id,
                    full_name:
                      session.user.user_metadata?.full_name ||
                      session.user.user_metadata?.name ||
                      "",
                    role: "client",
                  },
                ]);
              if (!insertErr) {
                await fetchProfile(session.user.id);
              }
            }
          });
        } else {
          scheduleProfileFetch(fetchProfile, session.user.id);
        }
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.warn("Error fetching profile:", error.message);
        setProfile(null);
        return null;
      }

      setProfile(data);
      return data;
    } catch (err) {
      console.warn("Failed to fetch profile:", err);
      setProfile(null);
      return null;
    }
  };

  const signUp = async (email, password, fullName, phone) => {
    assertSupabaseConfigured();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone,
        },
      },
    });

    if (error) throw error;

    // Create profile in profiles table
    if (data.user) {
      const { error: profileError } = await supabase.from("profiles").insert([
        {
          id: data.user.id,
          full_name: fullName,
          phone,
          role: "client",
        },
      ]);
      if (profileError) throw profileError;
    }

    return data;
  };

  const signIn = async (email, password) => {
    assertSupabaseConfigured();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    let profileData = null;
    if (data.session?.user) {
      setUser(data.session.user);
      profileData = await fetchProfile(data.session.user.id);
    }

    return { ...data, profile: profileData };
  };

  const signInWithGoogle = async () => {
    assertSupabaseConfigured();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/dashboard",
      },
    });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

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
