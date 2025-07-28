import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Platform } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

export default function TabLayout() {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    tabBar: {
      backgroundColor: theme.cardBackground,
      elevation: 8,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      borderTopWidth: 0.5,
      borderTopColor: theme.border,
      height: 60,
      paddingBottom: Platform.OS === 'web' ? 20 : 5, // Extra padding for web to simulate iPhone home indicator
    },
    tabBarLabel: {
      fontSize: 12,
      fontWeight: '500',
    },
    header: {
      backgroundColor: 'transparent', // Make header background transparent
      elevation: 2,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      borderBottomWidth: 0.5,
      borderBottomColor: theme.border,
      paddingTop: Platform.OS === 'web' ? 50 : 20, // Add proper spacing below status bar
      height: Platform.OS === 'web' ? 94 : 64, // Increase header height to accommodate spacing
    },
    headerTitle: {
      fontWeight: 'bold',
      fontSize: 18,
      color: theme.text,
    },
  });

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.gray,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarStyle: styles.tabBar,
        headerStyle: styles.header,
        headerTitleStyle: styles.headerTitle,
        headerTintColor: theme.text,
        headerShown: true, // Ensure headers are shown for tabs that need them
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Receipts',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="receipt" size={size} color={color} />
          ),
          headerTitle: 'Split',
          headerShown: false, // Keep main tab header hidden
        }}
      />
      <Tabs.Screen
        name="friends"
        options={{
          title: 'Friends',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-group" size={size} color={color} />
          ),
          headerTitle: 'Friends & Groups',
          headerShown: true, // Show header for friends tab
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="history" size={size} color={color} />
          ),
          headerTitle: 'Transaction History',
          headerShown: true, // Show header for history tab
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cog" size={size} color={color} />
          ),
          headerTitle: 'Settings',
          headerShown: true, // Show header for settings tab
        }}
      />
    </Tabs>
  );
}