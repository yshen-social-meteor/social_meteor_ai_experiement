import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { ThemeProvider } from '@/contexts/ThemeContext';
import HomeIndicator from '@/components/HomeIndicator';
import { StyleSheet, View, Platform } from 'react-native';

export default function RootLayout() {
  useFrameworkReady();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'transparent',
      paddingTop: Platform.OS === 'web' ? 0 : 0,
    },
  });

  return (
    <ThemeProvider>
      <StatusBar style="auto" translucent={false} />
      <View style={styles.container}>
        <Stack screenOptions={{ 
          headerShown: false,
          statusBarStyle: 'auto',
          statusBarTranslucent: false,
        }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="receipt/[id]" options={{ headerShown: true, headerTitle: 'Receipt Details' }} />
          <Stack.Screen name="receipt/create" options={{ headerShown: true, headerTitle: 'New Receipt' }} />
          <Stack.Screen name="receipt/manual" options={{ headerShown: true, headerTitle: 'Manual Entry' }} />
          <Stack.Screen name="receipt/camera" options={{ headerShown: true, headerTitle: 'Scan Receipt' }} />
          <Stack.Screen name="scanner" options={{ headerShown: false }} />
          <Stack.Screen name="friend/add" options={{ headerShown: true, headerTitle: 'Add Friend' }} />
          <Stack.Screen name="group/create" options={{ headerShown: true, headerTitle: 'Create Group' }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <HomeIndicator />
      </View>
    </ThemeProvider>
  );
}