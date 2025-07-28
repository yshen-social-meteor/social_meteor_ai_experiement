import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import Colors from '@/constants/Colors';

export default function CreateReceiptScreen() {
  const router = useRouter();
  
  return (
    <>
      <Stack.Screen options={{ 
        headerTitle: 'New Receipt',
        headerTitleStyle: styles.headerTitle,
        headerStyle: styles.header,
        headerTintColor: Colors.text,
        headerShown: false, // Hide the header completely
      }} />
      
      {/* Custom Back Button - Positioned much lower */}
      <TouchableOpacity 
        onPress={() => router.back()}
        style={styles.backButton}
      >
        <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.text} />
      </TouchableOpacity>

      {/* Custom Header */}
      <View style={styles.customHeader}>
        <Text style={styles.customHeaderTitle}>New Receipt</Text>
      </View>
      
      <View style={styles.container}>
        <View style={styles.optionsContainer}>
          <TouchableOpacity 
            style={styles.optionCard}
            onPress={() => router.push('/receipt/camera')}
          >
            <View style={[styles.iconCircle, { backgroundColor: Colors.primary }]}>
              <MaterialCommunityIcons name="camera" size={32} color={Colors.white} />
            </View>
            <Text style={styles.optionTitle}>Scan Receipt</Text>
            <Text style={styles.optionDescription}>
              Take a photo of your receipt and we'll extract the information
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.optionCard}
            onPress={() => router.push('/receipt/manual')}
          >
            <View style={[styles.iconCircle, { backgroundColor: Colors.secondary }]}>
              <MaterialCommunityIcons name="pencil" size={32} color={Colors.white} />
            </View>
            <Text style={styles.optionTitle}>Manual Entry</Text>
            <Text style={styles.optionDescription}>
              Manually enter receipt details including items, tax, and tips
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.white,
    elevation: 2,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerTitle: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 20, // Move much closer to top to eliminate all gap
    padding: 16,
    backgroundColor: Colors.white,
    borderRadius: 25,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 10000, // Very high z-index
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customHeader: {
    position: 'absolute',
    top: 0, // Move to very top to eliminate gap
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    zIndex: 1000,
  },
  customHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 16,
    paddingTop: 80, // Reduced to account for header at top
  },
  optionsContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 24,
  },
  optionCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 16,
    color: Colors.darkGray,
    textAlign: 'center',
  },
});