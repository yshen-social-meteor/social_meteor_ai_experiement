import { useState, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import EmptyState from '@/components/EmptyState';
import FloatingActionButton from '@/components/FloatingActionButton';

export default function ReceiptsScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const [receipts, setReceipts] = useState([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Fade-in animation when component mounts
  useState(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleScanQR = () => {
    router.push('/scanner');
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    content: {
      flex: 1,
      padding: 16,
    },
    scrollView: {
      flex: 1,
    },
    receiptCard: {
      backgroundColor: theme.cardBackground,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    receiptHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    receiptName: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.text,
    },
    receiptDate: {
      fontSize: 14,
      color: theme.darkGray,
    },
    receiptDetails: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    receiptTotal: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.primary,
    },
    receiptMeta: {
      alignItems: 'flex-end',
    },
    receiptPeople: {
      fontSize: 14,
      color: theme.darkGray,
      marginBottom: 4,
    },
    receiptStatus: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.accent,
    },
    scanButton: {
      position: 'absolute',
      left: 24,
      bottom: 24,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 5,
      elevation: 5,
      zIndex: 1,
    },
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {receipts.length === 0 ? (
          <EmptyState
            icon="receipt"
            title="No Receipts Yet"
            description="Add your first receipt by entering it manually or scan someone's QR code to join their bill"
          />
        ) : (
          <ScrollView style={styles.scrollView}>
            {receipts.map((receipt, index) => (
              <Link href={`/receipt/${receipt.id}`} key={index} asChild>
                <TouchableOpacity style={styles.receiptCard}>
                  <View style={styles.receiptHeader}>
                    <Text style={styles.receiptName}>{receipt.name}</Text>
                    <Text style={styles.receiptDate}>{receipt.date}</Text>
                  </View>
                  <View style={styles.receiptDetails}>
                    <Text style={styles.receiptTotal}>${receipt.total.toFixed(2)}</Text>
                    <View style={styles.receiptMeta}>
                      <Text style={styles.receiptPeople}>
                        {receipt.people} {receipt.people === 1 ? 'person' : 'people'}
                      </Text>
                      <Text style={styles.receiptStatus}>
                        {receipt.settled ? 'Settled' : 'Pending'}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </Link>
            ))}
          </ScrollView>
        )}
      </Animated.View>

      {/* QR Scanner Button - Bottom Left */}
      <TouchableOpacity 
        style={styles.scanButton}
        onPress={handleScanQR}
      >
        <MaterialCommunityIcons name="qrcode-scan" size={24} color={theme.white} />
      </TouchableOpacity>

      {/* Main FAB - Bottom Right */}
      <FloatingActionButton
        icon="plus"
        onPress={() => router.push('/receipt/manual')}
      />
    </View>
  );
}