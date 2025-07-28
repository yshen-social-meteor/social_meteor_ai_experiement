import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Theme {
  // Primary and core colors
  primary: string;
  secondary: string;
  accent: string;
  
  // States
  success: string;
  warning: string;
  error: string;
  
  // Neutrals
  text: string;
  darkGray: string;
  gray: string;
  lightGray: string;
  border: string;
  background: string;
  white: string;
  
  // Shadows
  shadow: string;
  
  // Overlays
  overlay: string;
  
  // Card backgrounds
  cardBackground: string;
  
  // Input backgrounds
  inputBackground: string;
}

export const lightTheme: Theme = {
  primary: '#4CAF50',
  secondary: '#2196F3',
  accent: '#9C27B0',
  
  success: '#43A047',
  warning: '#FFA000',
  error: '#D32F2F',
  
  text: '#212121',
  darkGray: '#757575',
  gray: '#9E9E9E',
  lightGray: '#F5F5F5',
  border: '#E0E0E0',
  background: '#FAFAFA',
  white: '#FFFFFF',
  
  shadow: '#000000',
  overlay: 'rgba(0, 0, 0, 0.5)',
  
  cardBackground: '#FFFFFF',
  inputBackground: '#FFFFFF',
};

export const darkTheme: Theme = {
  primary: '#66BB6A',
  secondary: '#42A5F5',
  accent: '#AB47BC',
  
  success: '#66BB6A',
  warning: '#FFB74D',
  error: '#EF5350',
  
  text: '#FFFFFF',
  darkGray: '#B0B0B0',
  gray: '#808080',
  lightGray: '#2C2C2C',
  border: '#404040',
  background: '#121212',
  white: '#1E1E1E',
  
  shadow: '#000000',
  overlay: 'rgba(0, 0, 0, 0.7)',
  
  cardBackground: '#1E1E1E',
  inputBackground: '#2C2C2C',
};

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@split_app_theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemColorScheme === 'dark');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved theme preference on app start
  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme !== null) {
        setIsDark(savedTheme === 'dark');
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    } finally {
      setIsLoaded(true);
    }
  };

  const saveThemePreference = async (darkMode: boolean) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, darkMode ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    saveThemePreference(newTheme);
  };

  const setTheme = (darkMode: boolean) => {
    setIsDark(darkMode);
    saveThemePreference(darkMode);
  };

  const theme = isDark ? darkTheme : lightTheme;

  // Don't render until theme is loaded
  if (!isLoaded) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}