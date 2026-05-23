import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { supabase } from "../lib/supabase";
import type { Session } from "@supabase/supabase-js";
import { fetchUserProfile, type UserProfile } from "../api/userApi";

export type UserRole = "client" | "provider" | "admin";

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  role: UserRole;
}

interface AuthContextValue {
  user: AuthUser | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  loginWithGoogle: () => Promise<void>;
  signup: (data: {
    email: string;
    password: string;
    firstName: string;
    lastNameP: string;
    lastNameM?: string;
  }) => Promise<string | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const sessionToUser = (session: Session): AuthUser => ({
  id: session.user.id,
  email: session.user.email ?? "",
  firstName: session.user.user_metadata?.first_name ?? "",
  role: (session.user.user_metadata?.role as UserRole) ?? "client",
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadProfile = useCallback(async (session: Session) => {
    const userProfile = await fetchUserProfile(session.user.id);
    if (userProfile) {
      setProfile(userProfile);
      setUser({
        id: session.user.id,
        email: session.user.email ?? "",
        firstName: userProfile.nombre,
        role: userProfile.rol,
      });
    } else {
      setUser(sessionToUser(session));
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) loadProfile(session);
      else setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        loadProfile(session).then(() => setIsLoading(false));
      } else {
        setUser(null);
        setProfile(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadProfile]);

  const login = useCallback(
    async (email: string, password: string): Promise<string | null> => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return error ? error.message : null;
    },
    [],
  );

  const loginWithGoogle = useCallback(async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/app/home` },
    });
  }, []);

  const signup = useCallback(
    async ({
      email,
      password,
      firstName,
      lastNameP,
      lastNameM,
    }: {
      email: string;
      password: string;
      firstName: string;
      lastNameP: string;
      lastNameM?: string;
    }): Promise<string | null> => {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name_p: lastNameP,
            last_name_m: lastNameM ?? "",
            role: "client",
          },
        },
      });
      return error ? error.message : null;
    },
    [],
  );

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginWithGoogle,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
