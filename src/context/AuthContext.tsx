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

const sessionToUser = (session: Session): AuthUser => ({
  id: session.user.id,
  email: session.user.email ?? "",
  firstName: session.user.user_metadata?.first_name ?? "",
  lastnameP: session.user.user_metadata?.last_name_p ?? "",
  lastnameM: session.user.user_metadata?.last_name_m ?? "",
  // El rol nunca debe salir de user_metadata: el usuario puede editarlo.
  // Fallback siempre al menor privilegio; el rol real lo entrega el backend.
  role: "client",
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
      setUser(sessionToUser(session));
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        loadProfile(session).finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        loadProfile(session).finally(() => setIsLoading(false));
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
        // Backend rejected the session (e.g. unconfirmed account): don't
        // leave a half-authenticated Supabase session lying around.
        await supabase.auth.signOut();
        return err instanceof ApiError
          ? err.message
          : "No pudimos iniciar sesión. Intenta de nuevo.";
      }
    },
    [],
  );

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
      // La cuenta queda sin confirmar (estado=false) hasta que el usuario da
      // clic en el link del correo, así que no hay sesión que iniciar aquí.
      // La foto se manda al backend, que la sube al bucket con su propio
      // acceso admin (no depende de que el usuario tenga sesión).
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
