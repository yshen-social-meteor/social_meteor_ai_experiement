import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView,
  Modal,
  FlatList
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';

// This would typically come from an API or store
const mockReceipt = {
  id: '123',
  name: 'Dinner at Joe\'s',
  date: '2023-10-15',
  restaurant: 'Joe\'s Bistro',
  items: [
    { id: '1', name: 'Pasta Carbonara', price: 16.99, quantity: 1 },
    { id: '2', name: 'Caesar Salad', price: 8.99, quantity: 1 },
    { id: '3', name: 'Garlic Bread', price: 4.99, quantity: 2 },
    { id: '4', name: 'Tiramisu', price: 7.99, quantity: 1 },
    { id: '5', name: 'Iced Tea', price: 2.99, quantity: 2 },
  ],
  tax: 4.25,
  tip: 8.50,
  total: 63.68,
  splitMethod: 'itemized', // or 'equal'
  participants: [
    { id: '101', name: 'You', items: ['1', '4'], total: 24.98 },
    { id: '102', name: 'Alex', items: ['2', '5'], total: 14.97 },
    { id: '103', name: 'Sam', items: ['3', '5'], total: 12.97 },
  ]
};

export default function ReceiptDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [receipt] = useState(mockReceipt);
  const [splitMethod, setSplitMethod] = useState(receipt.splitMethod);
  const [showSplitOptions, setShowSplitOptions] = useState(false);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  
  const calculateItemTotal = (price, quantity) => {
    return (price * quantity).toFixed(2);
  };
  
  const calculateSubtotal = () => {
    return receipt.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);
  };
  
  const calculateEqualSplit = () => {
    return (receipt.total / receipt.participants.length).toFixed(2);
  };
  
  return (
    <>
      <Stack.Screen options={{ 
        headerTitle: receipt.name,
        headerTitleStyle: styles.headerTitle,
        headerStyle: styles.header,
        headerTintColor: Colors.text,
      }} />
      
      <View style={styles.container}>
        <ScrollView style={styles.scrollView}>
          <View style={styles.receiptHeader}>
            <View style={styles.receiptInfo}>
              <Text style={styles.restaurantName}>{receipt.restaurant}</Text>
              <Text style={styles.receiptDate}>{receipt.date}</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.splitMethodButton}
              onPress={() => setShowSplitOptions(true)}
            >
              <Text style={styles.splitMethodText}>
                {splitMethod === 'equal' ? 'Split Equally' : 'Itemized Split'}
              </Text>
              <MaterialCommunityIcons name="chevron-down" size={20} color={Colors.darkGray} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Items</Text>
            
            {receipt.items.map((item) => (
              <View key={item.id} style={styles.itemRow}>
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemQuantity}>
                    {item.quantity > 1 ? `${item.quantity}x ` : ''}
                    ${item.price.toFixed(2)}
                  </Text>
                </View>
                <Text style={styles.itemTotal}>
                  ${calculateItemTotal(item.price, item.quantity)}
                </Text>
              </View>
            ))}
            
            <View style={styles.divider} />
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>${calculateSubtotal()}</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax</Text>
              <Text style={styles.summaryValue}>${receipt.tax.toFixed(2)}</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tip</Text>
              <Text style={styles.summaryValue}>${receipt.tip.toFixed(2)}</Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>${receipt.total.toFixed(2)}</Text>
            </View>
          </View>
          
          {splitMethod === 'equal' ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Equal Split</Text>
              
              <View style={styles.equalSplitContainer}>
                <Text style={styles.equalSplitText}>
                  ${calculateEqualSplit()} per person
                </Text>
                <Text style={styles.equalSplitSubtext}>
                  Split equally among {receipt.participants.length} people
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Itemized Split</Text>
              
              {receipt.participants.map((participant) => (
                <View key={participant.id} style={styles.participantRow}>
                  <Text style={styles.participantName}>{participant.name}</Text>
                  <Text style={styles.participantAmount}>
                    ${participant.total.toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>
          )}
          
          <TouchableOpacity 
            style={styles.requestButton}
            onPress={() => setShowPaymentOptions(true)}
          >
            <Text style={styles.requestButtonText}>Request Payment</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
      
      {/* Split Method Modal */}
      <Modal
        visible={showSplitOptions}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSplitOptions(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choose Split Method</Text>
            
            <TouchableOpacity 
              style={styles.modalOption}
              onPress={() => {
                setSplitMethod('equal');
                setShowSplitOptions(false);
              }}
            >
              <MaterialCommunityIcons 
                name={splitMethod === 'equal' ? 'radiobox-marked' : 'radiobox-blank'}
                size={24}
                color={Colors.primary}
              />
              <View style={styles.modalOptionTextContainer}>
                <Text style={styles.modalOptionTitle}>Split Equally</Text>
                <Text style={styles.modalOptionDescription}>
                  Total amount divided equally among all participants
                </Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.modalOption}
              onPress={() => {
                setSplitMethod('itemized');
                setShowSplitOptions(false);
              }}
            >
              <MaterialCommunityIcons 
                name={splitMethod === 'itemized' ? 'radiobox-marked' : 'radiobox-blank'}
                size={24}
                color={Colors.primary}
              />
              <View style={styles.modalOptionTextContainer}>
                <Text style={styles.modalOptionTitle}>Itemized Split</Text>
                <Text style={styles.modalOptionDescription}>
                  Assign specific items to each person
                </Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setShowSplitOptions(false)}
            >
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Payment Options Modal */}
      <Modal
        visible={showPaymentOptions}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPaymentOptions(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Request Payment Via</Text>
            
            <FlatList
              data={[
                { id: 'venmo', name: 'Venmo', icon: 'currency-usd' },
                { id: 'paypal', name: 'PayPal', icon: 'paypal' },
                { id: 'cashapp', name: 'Cash App', icon: 'cash' },
                { id: 'zelle', name: 'Zelle', icon: 'bank' },
              ]}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.paymentOption}
                  onPress={() => {
                    setShowPaymentOptions(false);
                    // Handle payment request through selected service
                  }}
                >
                  <MaterialCommunityIcons 
                    name={item.icon}
                    size={28}
                    color={Colors.primary}
                  />
                  <Text style={styles.paymentOptionText}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
            
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setShowPaymentOptions(false)}
            >
              <Text style={styles.modalCloseButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  receiptHeader: {
    backgroundColor: Colors.white,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  receiptInfo: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  receiptDate: {
    fontSize: 14,
    color: Colors.darkGray,
  },
  splitMethodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.lightGray,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  splitMethodText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginRight: 4,
  },
  section: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    padding: 16,
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    color: Colors.text,
    marginBottom: 2,
  },
  itemQuantity: {
    fontSize: 14,
    color: Colors.darkGray,
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: Colors.text,
  },
  summaryValue: {
    fontSize: 16,
    color: Colors.text,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  equalSplitContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  equalSplitText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 8,
  },
  equalSplitSubtext: {
    fontSize: 14,
    color: Colors.darkGray,
  },
  participantRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  participantName: {
    fontSize: 16,
    color: Colors.text,
  },
  participantAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  requestButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 16,
    marginHorizontal: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  requestButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    paddingBottom: 32,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalOptionTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  modalOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  modalOptionDescription: {
    fontSize: 14,
    color: Colors.darkGray,
  },
  modalCloseButton: {
    marginTop: 16,
    paddingVertical: 12,
    backgroundColor: Colors.lightGray,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  paymentOptionText: {
    fontSize: 16,
    color: Colors.text,
    marginLeft: 16,
  },
});