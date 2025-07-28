import React from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';

interface SearchBarProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
}

export default function SearchBar({ placeholder, value, onChangeText }: SearchBarProps) {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      height: 36,
      backgroundColor: theme.cardBackground,
      borderRadius: 18,
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: 16,
      marginBottom: 8,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
      borderWidth: 1,
      borderColor: theme.border,
    },
    searchIcon: {
      paddingLeft: 12,
    },
    input: {
      flex: 1,
      fontSize: 14,
      color: theme.text,
      paddingHorizontal: 6,
      height: '100%',
    },
    clearButton: {
      padding: 6,
      marginRight: 6,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.searchIcon}>
        <MaterialCommunityIcons name="magnify" size={16} color={theme.gray} />
      </View>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={theme.gray}
        value={value}
        onChangeText={onChangeText}
      />
      {value !== '' && (
        <TouchableOpacity
          style={styles.clearButton}
          onPress={() => onChangeText('')}
        >
          <MaterialCommunityIcons name="close-circle" size={14} color={theme.gray} />
        </TouchableOpacity>
      )}
    </View>
  );
}