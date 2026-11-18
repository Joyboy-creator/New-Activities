
import React, { createContext, useState } from 'react';

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('Light');
  const [isSaving, setIsSaving] = useState(false);

  const toggleTheme = (newTheme) => {
    setIsSaving(true);

    setTimeout(() => {
      setTheme(newTheme);
      setIsSaving(false);
    }, 1000);
  };

  return (
    <ThemeContext.Provider
      value={{ theme, toggleTheme, isSaving }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
