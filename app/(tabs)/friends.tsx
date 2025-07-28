import { useState, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Animated, Image } from 'react-native';
import { Link } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import EmptyState from '@/components/EmptyState';
import FloatingActionButton from '@/components/FloatingActionButton';
import SearchBar from '@/components/SearchBar';

export default function FriendsScreen() {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('friends'); // 'friends' or 'groups'
  const slideAnim = useRef(new Animated.Value(0)).current;

  const friends = [
    // Mock data
  ];

  const groups = [
    // Mock data
  ];

  const handleTabChange = (tab) => {
    if (tab === activeTab) return;
    
    const toValue = tab === 'friends' ? 0 : 1;
    setActiveTab(tab);
    
    Animated.spring(slideAnim, {
      toValue,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    tabContainer: {
      flexDirection: 'row',
      marginHorizontal: 16,
      marginTop: 16,
      marginBottom: 8,
      borderRadius: 8,
      backgroundColor: theme.lightGray,
      position: 'relative',
      height: 48,
    },
    tabIndicator: {
      position: 'absolute',
      width: '50%',
      height: '100%',
      backgroundColor: theme.cardBackground,
      borderRadius: 8,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    tab: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1,
    },
    activeTab: {},
    tabText: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.darkGray,
    },
    activeTabText: {
      color: theme.primary,
      fontWeight: '600',
    },
    content: {
      flex: 1,
      padding: 16,
    },
    scrollView: {
      flex: 1,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <Animated.View 
          style={[
            styles.tabIndicator, 
            { 
              transform: [{ 
                translateX: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 150] // adjust based on your tab width
                }) 
              }] 
            }
          ]} 
        />
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'friends' && styles.activeTab]} 
          onPress={() => handleTabChange('friends')}
        >
          <Text style={[
            styles.tabText, 
            activeTab === 'friends' && styles.activeTabText
          ]}>
            Friends
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'groups' && styles.activeTab]} 
          onPress={() => handleTabChange('groups')}
        >
          <Text style={[
            styles.tabText, 
            activeTab === 'groups' && styles.activeTabText
          ]}>
            Groups
          </Text>
        </TouchableOpacity>
      </View>

      <SearchBar
        placeholder={activeTab === 'friends' ? 'Search friends...' : 'Search groups...'}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <View style={styles.content}>
        {activeTab === 'friends' && (
          friends.length === 0 ? (
            <EmptyState
              icon="account-plus"
              title="No Friends Yet"
              description="Add friends to split bills and expenses with them"
            />
          ) : (
            <ScrollView style={styles.scrollView}>
              {/* Friends list here */}
            </ScrollView>
          )
        )}
        
        {activeTab === 'groups' && (
          groups.length === 0 ? (
            <EmptyState
              icon="account-group"
              title="No Groups Yet"
              description="Create groups to easily split bills with multiple people"
            />
          ) : (
            <ScrollView style={styles.scrollView}>
              {/* Groups list here */}
            </ScrollView>
          )
        )}
      </View>

      <FloatingActionButton
        onPress={() => {}}
        icon="plus"
        actions={activeTab === 'friends' ? [
          {
            icon: 'account-plus',
            label: 'Add Friend',
            onPress: () => {},
          },
          {
            icon: 'qrcode-scan',
            label: 'Scan Code',
            onPress: () => {},
          },
        ] : [
          {
            icon: 'account-group',
            label: 'Create Group',
            onPress: () => {},
          },
        ]}
      />
    </View>
  );
}