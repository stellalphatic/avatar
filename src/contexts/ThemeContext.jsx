// src/contexts/ThemeContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState('light'); // Renamed to setThemeState to avoid conflict with the function passed to value

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setThemeState(savedTheme); // Use setThemeState here
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  }, []);

  const toggleTheme = (newTheme) => { // Added newTheme parameter for direct setting
    const finalTheme = newTheme || (theme === 'light' ? 'dark' : 'light');
    setThemeState(finalTheme); // Use setThemeState here
    localStorage.setItem('theme', finalTheme);
    document.documentElement.classList.toggle('dark', finalTheme === 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
