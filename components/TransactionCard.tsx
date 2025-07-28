import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';

interface Transaction {
  id: string;
  name: string;
  date: string;
  amount: number;
  group: string;
  isSettled: boolean;
  paidBy: string;
  participants: {
    name: string;
    amount: number;
    isPaid: boolean;
  }[];
}

interface TransactionCardProps {
  transaction: Transaction;
}

export default function TransactionCard({ transaction }: TransactionCardProps) {
  const { theme } = useTheme();

  const getStatusColor = () => {
    return transaction.isSettled ? theme.success : theme.warning;
  };

  const styles = StyleSheet.create({
    container: {
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
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    headerLeft: {
      flex: 1,
    },
    name: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 4,
    },
    date: {
      fontSize: 14,
      color: theme.darkGray,
    },
    amount: {
      fontSize: 20,
      fontWeight: '700',
    },
    groupContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    group: {
      fontSize: 14,
      color: theme.darkGray,
      marginLeft: 4,
    },
    divider: {
      height: 1,
      backgroundColor: theme.border,
      marginBottom: 12,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    paidBy: {
      fontSize: 14,
      color: theme.text,
    },
    statusContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 6,
    },
    status: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.text,
    },
  });

  return (
    <Link href={`/transaction/${transaction.id}`} asChild>
      <TouchableOpacity style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.name}>{transaction.name}</Text>
            <Text style={styles.date}>{transaction.date}</Text>
          </View>
          <Text style={[styles.amount, { color: getStatusColor() }]}>
            ${transaction.amount.toFixed(2)}
          </Text>
        </View>

        <View style={styles.groupContainer}>
          <MaterialCommunityIcons name="account-group" size={16} color={theme.darkGray} />
          <Text style={styles.group}>{transaction.group}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.footer}>
          <Text style={styles.paidBy}>
            Paid by {transaction.paidBy}
          </Text>
          <View style={styles.statusContainer}>
            <View 
              style={[
                styles.statusDot, 
                { backgroundColor: getStatusColor() }
              ]} 
            />
            <Text style={styles.status}>
              {transaction.isSettled ? 'Settled' : 'Pending'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  );
}