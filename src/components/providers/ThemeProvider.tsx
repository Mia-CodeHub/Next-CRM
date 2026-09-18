'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

interface ThemeCtx {
  isDark: boolean;
  toggle: () => void;
}

const Ctx = createContext<ThemeCtx>({ isDark: true, toggle: () => {} });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved) setIsDark(saved === 'dark');
  }, []);

  const toggle = useCallback(() => {
    setIsDark((prev) => {
      localStorage.setItem('theme', prev ? 'light' : 'dark');
      return !prev;
    });
  }, []);

  return <Ctx.Provider value={{ isDark, toggle }}>{children}</Ctx.Provider>;
}

export const useTheme = () => useContext(Ctx);
