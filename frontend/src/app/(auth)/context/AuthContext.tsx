'use client';

import { createContext, useContext, useEffect, useState } from "react";
import { checkToken } from "../lib/fetch";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";



type AuthContextType = {
  isAuthenticated: boolean | null;
  login: (token: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);



export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        checkToken(setIsAuthenticated);
    }, [])

    const login = (token: string) => {
        localStorage.setItem('token', token);
        setIsAuthenticated(true);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return ctx;
}

export const checkAuthenticated = (
    router: AppRouterInstance,
    isAuthenticated: boolean | null
) => {
    if (isAuthenticated === false) {
        router.push("/login");
        return false;
    }

    if (isAuthenticated === null) {
        return false;
    }
    return true;
}