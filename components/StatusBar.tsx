import React from 'react';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { useTheme } from '@/contexts/ThemeContext';

export default function StatusBar() {
  const { isDark } = useTheme();
  
  return (
    <ExpoStatusBar 
      style={isDark ? 'light' : 'dark'} 
      backgroundColor="transparent"
    />
  );
}