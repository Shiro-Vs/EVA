import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthService } from "../services/AuthService";
import { User } from "../interfaces/User";

interface AuthContextType {
  user: User | null;
  isLoadingSession: boolean;
  login: (user: User) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// TODO(Sprint 3): reemplazar por Firebase Auth. Hoy solo persiste el uid de
// la última sesión iniciada — AuthService sigue corriendo sobre mock, así
// que esto es un puente mínimo para que la guardia de rutas y el logout
// tengan algo real que comprobar mientras tanto.
const SESSION_KEY = "eva.session_uid";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const storedUid = await AsyncStorage.getItem(SESSION_KEY);
        if (storedUid) {
          const profile = await AuthService.getUserProfile();
          setUser(profile);
        }
      } catch (error) {
        console.error("Error al restaurar la sesión", error);
      } finally {
        setIsLoadingSession(false);
      }
    })();
  }, []);

  const login = async (loggedInUser: User) => {
    await AsyncStorage.setItem(SESSION_KEY, loggedInUser.uid);
    setUser(loggedInUser);
  };

  const logout = async () => {
    await AsyncStorage.removeItem(SESSION_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoadingSession, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
