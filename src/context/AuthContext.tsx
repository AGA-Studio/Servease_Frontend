import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { supabase } from "../lib/supabase";
import {
  getAccessTokenSync,
  setDevToken,
  clearDevToken,
} from "../lib/authToken";
import { fetchUserProfile, fetchUserProfileOrThrow } from "../api/userApi";
import type { UserProfile } from "../api/userApi";
import { apiPostPublic, apiPostFormPublic, ApiError } from "../api/apiClient";

const DEV_AUTH = import.meta.env.VITE_DEV_AUTH === "true";

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
  login: (email: string, password: string) => Promise<string | null>;
  loginWithGoogle: () => Promise<void>;
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
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    const userProfile = await fetchUserProfile();
    if (userProfile) {
      setProfile(userProfile);
      setUser({
        id: userProfile.id_usuario,
        email: userProfile.correo,
        firstName: userProfile.nombre,
        lastnameP: userProfile.apellido_paterno,
        lastnameM: userProfile.apellido_materno ?? undefined,
        role: userProfile.rol,
      });
    } else {
      setUser(null);
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      if (DEV_AUTH) {
        const token = getAccessTokenSync();
        if (token) {
          await loadProfile();
        }
      } else {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await loadProfile();
        }
      }
      if (!cancelled) setIsLoading(false);
    }

    init();

    if (!DEV_AUTH) {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session) {
          loadProfile().finally(() => {
            if (!cancelled) setIsLoading(false);
          });
        } else {
          setUser(null);
          setProfile(null);
          setIsLoading(false);
        }
      });

      return () => {
        cancelled = true;
        subscription.unsubscribe();
      };
    }

    return () => {
      cancelled = true;
    };
  }, [loadProfile]);

  const login = useCallback(
    async (email: string, password: string): Promise<string | null> => {
      if (DEV_AUTH) {
        try {
          const data = await apiPostPublic<{
            access_token: string;
            user: {
              id_usuario: string;
              nombre: string;
              apellido_pa: string;
              apellido_ma?: string;
              correo: string;
              rol: UserRole;
            };
          }>("/usuarios/dev-login/", { email, password });

          setDevToken(data.access_token);

          setUser({
            id: data.user.id_usuario,
            email: data.user.correo,
            firstName: data.user.nombre,
            lastnameP: data.user.apellido_pa,
            lastnameM: data.user.apellido_ma,
            role: data.user.rol,
          });

          try {
            const userProfile = await fetchUserProfileOrThrow();
            setProfile(userProfile);
          } catch {
            // profile load is best-effort after login
          }

          return null;
        } catch (err) {
          return err instanceof ApiError
            ? err.message
            : "No pudimos iniciar sesión. Intenta de nuevo.";
        }
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) return error.message;
      if (!data.session) return null;

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
        return null;
      } catch (err) {
        await supabase.auth.signOut();
        return err instanceof ApiError
          ? err.message
          : "No pudimos iniciar sesión. Intenta de nuevo.";
      }
    },
    [],
  );

  const loginWithGoogle = useCallback(async () => {
    if (DEV_AUTH) return;
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
      if (DEV_AUTH) {
        return "Registro no disponible en modo desarrollo. Usa credenciales seed: test123";
      }

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
    if (DEV_AUTH) {
      clearDevToken();
    } else {
      await supabase.auth.signOut();
    }
    setUser(null);
    setProfile(null);
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
