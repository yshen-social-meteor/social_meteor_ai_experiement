import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView,
  Switch,
  Alert,
  Share,
  Platform
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';

interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  type: 'toggle' | 'action' | 'navigation';
  value?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
}

export default function SettingsScreen() {
  const { theme, isDark, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [hapticFeedback, setHapticFeedback] = useState(true);
  const [autoSplit, setAutoSplit] = useState(false);

  const handleShare = async () => {
    try {
      const message = 'Check out Split - the easiest way to split bills with friends!';
      
      if (Platform.OS === 'web') {
        await navigator.clipboard.writeText(message);
        Alert.alert('Copied!', 'Share message copied to clipboard');
      } else {
        await Share.share({
          message,
          title: 'Split App',
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleRateApp = () => {
    Alert.alert(
      'Rate Split',
      'Thank you for using Split! Would you like to rate us on the App Store?',
      [
        { text: 'Not Now', style: 'cancel' },
        { text: 'Rate App', onPress: () => console.log('Open app store') }
      ]
    );
  };

  const handleSupport = () => {
    Alert.alert(
      'Contact Support',
      'Need help? We\'re here for you!',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Email Support', onPress: () => console.log('Open email') },
        { text: 'FAQ', onPress: () => console.log('Open FAQ') }
      ]
    );
  };

  const handlePrivacy = () => {
    Alert.alert(
      'Privacy Policy',
      'View our privacy policy to learn how we protect your data.',
      [
        { text: 'Close', style: 'cancel' },
        { text: 'View Policy', onPress: () => console.log('Open privacy policy') }
      ]
    );
  };

  const handleTerms = () => {
    Alert.alert(
      'Terms of Service',
      'View our terms of service.',
      [
        { text: 'Close', style: 'cancel' },
        { text: 'View Terms', onPress: () => console.log('Open terms') }
      ]
    );
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: () => console.log('Sign out user')
        }
      ]
    );
  };

  const settingSections = [
    {
      title: 'Preferences',
      items: [
        {
          id: 'notifications',
          title: 'Push Notifications',
          subtitle: 'Get notified about bill updates',
          icon: 'bell',
          type: 'toggle' as const,
          value: notifications,
          onToggle: setNotifications,
        },
        {
          id: 'darkMode',
          title: 'Dark Mode',
          subtitle: 'Switch to dark theme',
          icon: 'theme-light-dark',
          type: 'toggle' as const,
          value: isDark,
          onToggle: toggleTheme,
        },
        {
          id: 'haptic',
          title: 'Haptic Feedback',
          subtitle: 'Feel vibrations for interactions',
          icon: 'vibrate',
          type: 'toggle' as const,
          value: hapticFeedback,
          onToggle: setHapticFeedback,
        },
        {
          id: 'autoSplit',
          title: 'Auto Split Evenly',
          subtitle: 'Default to equal split for new bills',
          icon: 'calculator',
          type: 'toggle' as const,
          value: autoSplit,
          onToggle: setAutoSplit,
        },
      ],
    },
    {
      title: 'Account',
      items: [
        {
          id: 'profile',
          title: 'Edit Profile',
          subtitle: 'Update your name and photo',
          icon: 'account-edit',
          type: 'navigation' as const,
          onPress: () => console.log('Navigate to profile'),
        },
        {
          id: 'payment',
          title: 'Payment Methods',
          subtitle: 'Manage Venmo, PayPal, and more',
          icon: 'credit-card',
          type: 'navigation' as const,
          onPress: () => console.log('Navigate to payment methods'),
        },
        {
          id: 'export',
          title: 'Export Data',
          subtitle: 'Download your transaction history',
          icon: 'download',
          type: 'action' as const,
          onPress: () => Alert.alert('Export Data', 'Feature coming soon!'),
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          id: 'share',
          title: 'Share Split',
          subtitle: 'Tell your friends about the app',
          icon: 'share-variant',
          type: 'action' as const,
          onPress: handleShare,
        },
        {
          id: 'rate',
          title: 'Rate Split',
          subtitle: 'Leave us a review',
          icon: 'star',
          type: 'action' as const,
          onPress: handleRateApp,
        },
        {
          id: 'support',
          title: 'Contact Support',
          subtitle: 'Get help with the app',
          icon: 'help-circle',
          type: 'action' as const,
          onPress: handleSupport,
        },
      ],
    },
    {
      title: 'Legal',
      items: [
        {
          id: 'privacy',
          title: 'Privacy Policy',
          icon: 'shield-account',
          type: 'action' as const,
          onPress: handlePrivacy,
        },
        {
          id: 'terms',
          title: 'Terms of Service',
          icon: 'file-document',
          type: 'action' as const,
          onPress: handleTerms,
        },
      ],
    },
  ];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    scrollView: {
      flex: 1,
    },
    profileSection: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.cardBackground,
      padding: 20,
      marginBottom: 20,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    profileAvatar: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    profileInitials: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.white,
    },
    profileInfo: {
      flex: 1,
    },
    profileName: {
      fontSize: 20,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 4,
    },
    profileEmail: {
      fontSize: 14,
      color: theme.darkGray,
    },
    editProfileButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.lightGray,
      justifyContent: 'center',
      alignItems: 'center',
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 8,
      marginHorizontal: 20,
    },
    sectionContent: {
      backgroundColor: theme.cardBackground,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    settingItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    settingLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.lightGray,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    settingText: {
      flex: 1,
    },
    settingTitle: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.text,
      marginBottom: 2,
    },
    settingSubtitle: {
      fontSize: 14,
      color: theme.darkGray,
    },
    settingRight: {
      marginLeft: 16,
    },
    itemDivider: {
      height: 1,
      backgroundColor: theme.border,
      marginLeft: 76,
    },
    signOutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.cardBackground,
      marginHorizontal: 20,
      marginBottom: 20,
      paddingVertical: 16,
      borderRadius: 12,
      gap: 8,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    signOutText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.error,
    },
    versionContainer: {
      alignItems: 'center',
      paddingVertical: 20,
      paddingBottom: 40,
    },
    versionText: {
      fontSize: 14,
      color: theme.darkGray,
      marginBottom: 4,
    },
    versionSubtext: {
      fontSize: 12,
      color: theme.gray,
    },
  });

  const renderSettingItem = (item: SettingItem) => {
    return (
      <TouchableOpacity
        key={item.id}
        style={styles.settingItem}
        onPress={item.onPress}
        disabled={item.type === 'toggle'}
      >
        <View style={styles.settingLeft}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons 
              name={item.icon} 
              size={24} 
              color={theme.primary} 
            />
          </View>
          <View style={styles.settingText}>
            <Text style={styles.settingTitle}>{item.title}</Text>
            {item.subtitle && (
              <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
            )}
          </View>
        </View>

        <View style={styles.settingRight}>
          {item.type === 'toggle' && (
            <Switch
              value={item.value}
              onValueChange={item.onToggle}
              trackColor={{ false: theme.lightGray, true: theme.primary }}
              thumbColor={theme.white}
            />
          )}
          {item.type === 'navigation' && (
            <MaterialCommunityIcons 
              name="chevron-right" 
              size={20} 
              color={theme.darkGray} 
            />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* User Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileInitials}>JD</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>John Doe</Text>
            <Text style={styles.profileEmail}>john.doe@example.com</Text>
          </View>
          <TouchableOpacity style={styles.editProfileButton}>
            <MaterialCommunityIcons name="pencil" size={16} color={theme.primary} />
          </TouchableOpacity>
        </View>

        {/* Settings Sections */}
        {settingSections.map((section, sectionIndex) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map((item, itemIndex) => (
                <View key={item.id}>
                  {renderSettingItem(item)}
                  {itemIndex < section.items.length - 1 && (
                    <View style={styles.itemDivider} />
                  )}
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <MaterialCommunityIcons name="logout" size={20} color={theme.error} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Split v1.0.0</Text>
          <Text style={styles.versionSubtext}>Made with ❤️ for splitting bills</Text>
        </View>
      </ScrollView>
    </View>
  );
}