import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { authApi } from "../api";
import type { LoginDto, RegisterDto } from "../types";

interface AuthContextType {
  isAuthenticated: boolean;
  email: string | null;
  role: string | null;
  isLoading: boolean;
  login: (dto: LoginDto) => Promise<void>;
  register: (dto: RegisterDto) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [email, setEmail] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On app load, restore auth state from localStorage if a token exists
  useEffect(() => {
    const storedEmail = localStorage.getItem("email");
    const storedRole = localStorage.getItem("role");
    const token = localStorage.getItem("token");

    if (token && storedEmail && storedRole) {
      setEmail(storedEmail);
      setRole(storedRole);
    }

    setIsLoading(false);
  }, []);

  const login = async (dto: LoginDto) => {
    const response = await authApi.login(dto);
    localStorage.setItem("token", response.token);
    localStorage.setItem("email", response.email);
    localStorage.setItem("role", response.role);
    setEmail(response.email);
    setRole(response.role);
  };

  const register = async (dto: RegisterDto) => {
    const response = await authApi.register(dto);
    localStorage.setItem("token", response.token);
    localStorage.setItem("email", response.email);
    localStorage.setItem("role", response.role);
    setEmail(response.email);
    setRole(response.role);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    setEmail(null);
    setRole(null);
  };

  const value: AuthContextType = {
    isAuthenticated: !!email,
    email,
    role,
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
