import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { supabase } from "../lib/supabase";
import type { Session } from "@supabase/supabase-js";
import { fetchUserProfile, fetchUserProfileOrThrow, type UserProfile } from "../api/userApi";
import { apiPostFormPublic, ApiError } from "../api/apiClient";

export type UserRole = "client" | "provider" | "admin";

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastnameP: string;
  lastnameM?: string;
  role: UserRole;
}

interface AuthContextValue {
  user: AuthUser | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  mfaPending: boolean;
  login: (
    email: string,
    password: string,
  ) => Promise<{ error: string | null; mfaPending: boolean }>;
  loginWithGoogle: () => Promise<void>;
  completeMfaLogin: () => Promise<string | null>;
  cancelMfaLogin: () => Promise<void>;
  signup: (data: {
    email: string;
    password: string;
    firstName: string;
    secondName?: string;
    lastNameP: string;
    lastNameM?: string;
    photo?: File | null;
  }) => Promise<string | null>;
  logout: () => Promise<void>;
  updateProfile: (updated: UserProfile) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const sessionToUser = (session: Session): AuthUser => ({
  id: session.user.id,
  email: session.user.email ?? "",
  firstName: session.user.user_metadata?.first_name ?? "",
  lastnameP: session.user.user_metadata?.last_name_p ?? "",
  lastnameM: session.user.user_metadata?.last_name_m ?? "",

  role: "client",
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mfaPending, setMfaPending] = useState(false);

  const needsMfaChallenge = useCallback(async (): Promise<boolean> => {
    const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    return !!data && data.nextLevel === "aal2" && data.currentLevel !== data.nextLevel;
  }, []);

  const loadProfile = useCallback(async (session: Session) => {
    const userProfile = await fetchUserProfile();
    if (userProfile) {
      setProfile(userProfile);
      setUser({
        id: session.user.id,
        email: session.user.email ?? "",
        firstName: userProfile.nombre,
        lastnameP: userProfile.apellido_paterno,
        lastnameM: userProfile.apellido_materno ?? undefined,
        role: userProfile.rol,
      });
    } else {
      // Profile fetch failed (network blip, backend restart, etc). Keep whatever
      // user/profile we already had rather than downgrading to a fallback with
      // role "client" — that fallback previously bounced providers/admins out
      // of their own screens on transient failures during a background token
      // refresh, which looked like a random logout.
      setUser((prev) => prev ?? sessionToUser(session));
    }
  }, []);

  useEffect(() => {
    const resolveSession = async (session: Session) => {
      if (await needsMfaChallenge()) {
        setMfaPending(true);
        setUser(null);
        setProfile(null);
        return;
      }
      setMfaPending(false);
      await loadProfile(session);
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        resolveSession(session).finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // The access token renews itself silently every ~hour (or on tab focus)
      // and every API call fetches a fresh session anyway — there's no need
      // to re-run the MFA gate or refetch the whole profile on every renewal.
      // Doing so here previously caused spurious "logouts": any transient
      // failure of that refetch reset the signed-in user's role/profile.
      if (event === "TOKEN_REFRESHED") return;

      if (session) {
        resolveSession(session).finally(() => setIsLoading(false));
      } else {
        setUser(null);
        setProfile(null);
        setMfaPending(false);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadProfile, needsMfaChallenge]);

  const login = useCallback(
    async (
      email: string,
      password: string,
    ): Promise<{ error: string | null; mfaPending: boolean }> => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) return { error: error.message, mfaPending: false };
      if (!data.session) return { error: null, mfaPending: false };

      if (await needsMfaChallenge()) {
        setMfaPending(true);
        return { error: null, mfaPending: true };
      }

      try {
        const userProfile = await fetchUserProfileOrThrow();
        setProfile(userProfile);
        setUser({
          id: data.session.user.id,
          email: data.session.user.email ?? "",
          firstName: userProfile.nombre,
          lastnameP: userProfile.apellido_paterno,
          lastnameM: userProfile.apellido_materno ?? undefined,
          role: userProfile.rol,
        });
        return { error: null, mfaPending: false };
      } catch (err) {
        await supabase.auth.signOut();
        return {
          error:
            err instanceof ApiError
              ? err.message
              : "No pudimos iniciar sesión. Intenta de nuevo.",
          mfaPending: false,
        };
      }
    },
    [needsMfaChallenge],
  );

  const completeMfaLogin = useCallback(async (): Promise<string | null> => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return "No hay sesión activa.";

    try {
      const userProfile = await fetchUserProfileOrThrow();
      setProfile(userProfile);
      setUser({
        id: session.user.id,
        email: session.user.email ?? "",
        firstName: userProfile.nombre,
        lastnameP: userProfile.apellido_paterno,
        lastnameM: userProfile.apellido_materno ?? undefined,
        role: userProfile.rol,
      });
      setMfaPending(false);
      return null;
    } catch (err) {
      await supabase.auth.signOut();
      setMfaPending(false);
      return err instanceof ApiError
        ? err.message
        : "No pudimos iniciar sesión. Intenta de nuevo.";
    }
  }, []);

  const cancelMfaLogin = useCallback(async () => {
    await supabase.auth.signOut();
    setMfaPending(false);
  }, []);

  const loginWithGoogle = useCallback(async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/` },
    });
  }, []);

  const signup = useCallback(
    async ({
      email,
      password,
      firstName,
      secondName,
      lastNameP,
      lastNameM,
      photo,
    }: {
      email: string;
      password: string;
      firstName: string;
      secondName?: string;
      lastNameP: string;
      lastNameM?: string;
      photo?: File | null;
    }): Promise<string | null> => {

      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);
      formData.append("nombre", firstName);
      formData.append("segundo_nombre", secondName ?? "");
      formData.append("apellido_pa", lastNameP);
      formData.append("apellido_ma", lastNameM ?? "");
      if (photo) formData.append("photo", photo);

      try {
        await apiPostFormPublic("/api/usuarios/signup/", formData);
        return null;
      } catch (err) {
        return err instanceof ApiError
          ? err.message
          : "No pudimos crear tu cuenta. Intenta de nuevo.";
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const updateProfile = useCallback((updated: UserProfile) => {
    setProfile(updated);
    setUser((prev) =>
      prev
        ? {
            ...prev,
            firstName: updated.nombre,
            lastnameP: updated.apellido_paterno,
            lastnameM: updated.apellido_materno ?? undefined,
            role: updated.rol,
          }
        : prev,
    );
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAuthenticated: !!user,
        isLoading,
        mfaPending,
        login,
        loginWithGoogle,
        completeMfaLogin,
        cancelMfaLogin,
        signup,
        logout,
        updateProfile,
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
