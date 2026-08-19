'use client';

import { createContext, useContext, useEffect, useState } from 'react';

export const ThemeContext = createContext({ theme: 'dark', setTheme: () => {} });
export const useTheme = () => useContext(ThemeContext);

export default function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('dark');

  /* Read stored / system preference on mount */
  useEffect(() => {
    const stored    = localStorage.getItem('medistore-theme');
    const preferred = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const initial   = stored || preferred;
    document.documentElement.setAttribute('data-theme', initial);
    const t = setTimeout(() => {
      setTheme(initial);
    }, 0);
    return () => clearTimeout(t);
  }, []);

  /* Sync every time theme changes */
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('medistore-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
