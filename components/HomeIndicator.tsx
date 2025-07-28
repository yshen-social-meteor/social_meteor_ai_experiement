import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

export default function HomeIndicator() {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      bottom: 8,
      left: '50%',
      transform: [{ translateX: -67 }],
      zIndex: 1000,
    },
    indicator: {
      width: 134,
      height: 5,
      backgroundColor: theme.text,
      borderRadius: 3,
      opacity: 0.3,
    },
  });

  // Only show on web platform to simulate iPhone
  if (Platform.OS !== 'web') {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.indicator} />
    </View>
  );
}