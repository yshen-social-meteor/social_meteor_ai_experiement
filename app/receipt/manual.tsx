import React, { useState, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  Dimensions,
  Pressable,
  Modal,
  Alert
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Path, Circle, Text as SvgText, G } from 'react-native-svg';
import Colors from '@/constants/Colors';
import QRCodeGenerator from '@/components/QRCodeGenerator';

interface Item {
  id: number;
  name: string;
  quantity: number;
  price: string;
  sharedBy: string[];
}

interface Participant {
  id: string;
  initials: string;
  name: string;
  amount: number;
  percentage: number;
  color: string;
  shares: number; // Add shares property for fraction display
}

const CIRCLE_SIZE = Math.min(Dimensions.get('window').width - 80, 300);
const CENTER = CIRCLE_SIZE / 2;
const RADIUS = (CIRCLE_SIZE - 80) / 2;

function calculateCoordinates(percentage: number, startAngle: number) {
  const angle = (startAngle + (percentage * 3.6)) * (Math.PI / 180);
  return {
    x: CENTER + RADIUS * Math.cos(angle),
    y: CENTER + RADIUS * Math.sin(angle)
  };
}

function generatePath(percentage: number, startAngle: number) {
  if (percentage === 0) return '';
  if (percentage >= 99.9) { // Treat as full circle if very close to 100%
    return `M ${CENTER} ${CENTER - RADIUS} 
            A ${RADIUS} ${RADIUS} 0 1 1 ${CENTER - 0.01} ${CENTER - RADIUS} 
            Z`;
  }
  
  const start = calculateCoordinates(0, startAngle);
  const end = calculateCoordinates(percentage, startAngle);
  const largeArcFlag = percentage > 50 ? 1 : 0;
  
  return `M ${CENTER} ${CENTER} 
          L ${start.x} ${start.y} 
          A ${RADIUS} ${RADIUS} 0 ${largeArcFlag} 1 ${end.x} ${end.y} 
          Z`;
}

export default function ManualEntryScreen() {
  const router = useRouter();
  const [splitMethod, setSplitMethod] = useState('even'); // Default to split evenly
  const [selectedParticipant, setSelectedParticipant] = useState<string | null>(null);
  const [selectedItemMenu, setSelectedItemMenu] = useState<number | null>(null);
  const [displayMode, setDisplayMode] = useState<'dollar' | 'share' | 'percentage'>('percentage'); // New state for display mode
  const [subtotalInput, setSubtotalInput] = useState('78.00');
  const [taxPercentage, setTaxPercentage] = useState(7.5);
  const [tipPercentage, setTipPercentage] = useState(20);
  const [items, setItems] = useState<Item[]>([
    { id: 1, name: 'Rainbow Roll', quantity: 1, price: '16.00', sharedBy: ['KW', 'MP', 'SY'] },
    { id: 2, name: 'California Roll', quantity: 1, price: '12.00', sharedBy: ['KW', 'MP', 'SY'] },
    { id: 3, name: '750 Sake', quantity: 1, price: '50.00', sharedBy: ['KW', 'MP', 'SY'] },
    { id: 4, name: '750 Sake', quantity: 1, price: '50.00', sharedBy: ['KW', 'MP', 'SY'] },
  ]);
  
  const [participants, setParticipants] = useState<Participant[]>([
    { id: 'kw', initials: 'KW', name: 'Kevin', amount: 0, percentage: 25, color: '#4CAF50', shares: 1 },
    { id: 'mp', initials: 'MP', name: 'Matt', amount: 0, percentage: 25, color: '#2196F3', shares: 1 },
    { id: 'sy', initials: 'SY', name: 'Shen', amount: 0, percentage: 25, color: '#9C27B0', shares: 1 },
    { id: 'dh', initials: 'DH', name: 'Danny', amount: 0, percentage: 25, color: '#F44336', shares: 1 },
  ]);

  // Calculate total based on subtotal, tax, and tip for even split mode
  const itemsTotal = items.reduce((sum, item) => sum + parseFloat(item.price || '0'), 0);
  const subtotal = parseFloat(subtotalInput) || 0;
  const taxAmount = itemsTotal * taxPercentage / 100;
  const tipAmount = itemsTotal * tipPercentage / 100;
  const total = itemsTotal + taxAmount + tipAmount;

  React.useEffect(() => {
    setParticipants(current => 
      current.map(p => ({
        ...p,
        amount: splitMethod === 'even' ? (subtotal + (subtotal * taxPercentage / 100) + (subtotal * tipPercentage / 100)) / participants.length : (total * p.percentage) / 100
      }))
    );
  }, [total, subtotal, taxPercentage, tipPercentage, splitMethod, participants.length]);

  const updateSubtotal = (value: string) => {
    // Allow only numbers and one decimal point
    const sanitizedValue = value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
    setSubtotalInput(sanitizedValue);
  };

  const adjustTaxPercentage = (increment: boolean) => {
    setTaxPercentage(current => Math.max(0, Math.min(50, current + (increment ? 0.5 : -0.5))));
  };

  const adjustTipPercentage = (increment: boolean) => {
    setTipPercentage(current => Math.max(0, Math.min(50, current + (increment ? 1 : -1))));
  };
  const calculateParticipantAmounts = () => {
    if (splitMethod === 'percentage') {
      const amounts = {} as Record<string, number>;
      participants.forEach(p => {
        amounts[p.initials] = (total * p.percentage) / 100;
      });
      return amounts;
    } else if (splitMethod === 'even') {
      const amounts = {} as Record<string, number>;
      const evenAmount = total / participants.length;
      participants.forEach(p => {
        amounts[p.initials] = evenAmount;
      });
      return amounts;
    } else {
      // items method
      const amounts = {} as Record<string, number>;
      participants.forEach(p => {
        amounts[p.initials] = 0;
      });

      items.forEach(item => {
        if (item.sharedBy.length > 0) {
          const itemPrice = parseFloat(item.price || '0');
          const splitAmount = itemPrice / item.sharedBy.length;
          
          item.sharedBy.forEach(initials => {
            amounts[initials] = (amounts[initials] || 0) + splitAmount;
          });
        }
      });
      return amounts;
    }
  };

  const participantAmounts = calculateParticipantAmounts();

  // Ensure percentages always add up to 100% for complete pie chart
  const normalizedParticipants = React.useMemo(() => {
    const totalPercentage = participants.reduce((sum, p) => sum + p.percentage, 0);
    
    if (totalPercentage === 0) {
      // If all percentages are 0, distribute equally
      const equalPercentage = 100 / participants.length;
      return participants.map(p => ({ ...p, percentage: equalPercentage }));
    }
    
    if (totalPercentage !== 100) {
      // Normalize to ensure total is exactly 100%
      return participants.map(p => ({
        ...p,
        percentage: (p.percentage / totalPercentage) * 100
      }));
    }
    
    return participants;
  }, [participants]);

  const adjustPercentage = (id: string, increment: boolean) => {
    setParticipants(current => {
      const participant = current.find(p => p.id === id);
      if (!participant) return current;

      if (displayMode === 'share') {
        // In share mode: only the selected participant's shares change
        // Others keep their shares, but total denominator changes
        return current.map(p => {
          if (p.id === id) {
            const newShares = increment 
              ? p.shares + 1 
              : Math.max(1, p.shares - 1); // Don't go below 1 share
            
            // Calculate new total shares (only this participant's shares changed)
            const totalShares = current.reduce((sum, participant) => 
              participant.id === id ? sum + newShares : sum + participant.shares, 0
            );
            
            const newPercentage = (newShares / totalShares) * 100;
            
            return {
              ...p,
              shares: newShares,
              percentage: newPercentage,
              amount: (total * newPercentage) / 100
            };
          } else {
            // Other participants keep their shares but percentage changes due to new total
            const totalShares = current.reduce((sum, participant) => 
              participant.id === id 
                ? sum + (increment ? participant.shares + 1 : Math.max(1, participant.shares - 1))
                : sum + participant.shares, 0
            );
            
            const newPercentage = (p.shares / totalShares) * 100;
            
            return {
              ...p,
              percentage: newPercentage,
              amount: (total * newPercentage) / 100
            };
          }
        });
      } else {
        // Original percentage mode logic
        const currentPercentage = participant.percentage;
        
        let newPercentage;
        if (increment) {
          // Increase by 1%, but don't exceed 100%
          newPercentage = Math.min(currentPercentage + 1, 100);
        } else {
          // Decrease by 1%, but don't go below 0%
          newPercentage = Math.max(currentPercentage - 1, 0);
        }

        const percentageChange = newPercentage - currentPercentage;
        
        // If no change, return current state
        if (percentageChange === 0) return current;

        // Distribute the change among other participants
        const otherParticipants = current.filter(p => p.id !== id);
        const totalOtherPercentage = otherParticipants.reduce((sum, p) => sum + p.percentage, 0);
        
        return current.map(p => {
          if (p.id === id) {
            return {
              ...p,
              percentage: newPercentage,
              amount: (total * newPercentage) / 100
            };
          } else {
            // Distribute the percentage change proportionally among others
            const proportionalChange = totalOtherPercentage > 0 
              ? (p.percentage / totalOtherPercentage) * (-percentageChange)
              : (-percentageChange) / otherParticipants.length;
            
            const adjustedPercentage = Math.max(0, p.percentage + proportionalChange);
            
            return {
              ...p,
              percentage: adjustedPercentage,
              amount: (total * adjustedPercentage) / 100
            };
          }
        });
      }
    });
  };

  const updateParticipantPercentage = (id: string, percentage: string) => {
    const newPercentage = Math.min(100, Math.max(0, parseInt(percentage) || 0));
    
    setParticipants(current => {
      const otherParticipants = current.filter(p => p.id !== id);
      const remainingPercentage = 100 - otherParticipants.reduce((sum, p) => sum + p.percentage, 0);
      
      return current.map(p => {
        if (p.id === id) {
          const finalPercentage = Math.min(newPercentage, remainingPercentage);
          return {
            ...p,
            percentage: finalPercentage,
            amount: (total * finalPercentage) / 100
          };
        }
        return p;
      });
    });
  };

  const toggleParticipant = (itemId: number, initials: string) => {
    setItems(items.map(item => {
      if (item.id === itemId) {
        const sharedBy = item.sharedBy.includes(initials)
          ? item.sharedBy.filter(p => p !== initials)
          : [...item.sharedBy, initials];
        return { ...item, sharedBy };
      }
      return item;
    }));
  };

  const updateItemName = (itemId: number, name: string) => {
    setItems(items.map(item => 
      item.id === itemId ? { ...item, name } : item
    ));
  };

  const updateItemPrice = (itemId: number, price: string) => {
    const sanitizedPrice = price.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
    setItems(items.map(item => 
      item.id === itemId ? { ...item, price: sanitizedPrice } : item
    ));
  };

  const updateItemQuantity = (itemId: number, increment: boolean) => {
    setItems(items.map(item => {
      if (item.id === itemId) {
        const newQuantity = increment 
          ? item.quantity + 1 
          : Math.max(1, item.quantity - 1);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const addNewItem = () => {
    const newId = Math.max(...items.map(item => item.id)) + 1;
    setItems([...items, {
      id: newId,
      name: '',
      quantity: 1,
      price: '',
      sharedBy: participants.map(p => p.initials)
    }]);
  };

  const duplicateItem = (itemId: number) => {
    const itemToDuplicate = items.find(item => item.id === itemId);
    if (itemToDuplicate) {
      const newId = Math.max(...items.map(item => item.id)) + 1;
      const duplicatedItem = {
        ...itemToDuplicate,
        id: newId,
        name: `${itemToDuplicate.name} (Copy)`
      };
      setItems([...items, duplicatedItem]);
    }
    setSelectedItemMenu(null);
  };

  const assignToAll = (itemId: number) => {
    setItems(items.map(item => 
      item.id === itemId 
        ? { ...item, sharedBy: participants.map(p => p.initials) }
        : item
    ));
    setSelectedItemMenu(null);
  };

  const assignToNone = (itemId: number) => {
    setItems(items.map(item => 
      item.id === itemId 
        ? { ...item, sharedBy: [] }
        : item
    ));
    setSelectedItemMenu(null);
  };

  const deleteItem = (itemId: number) => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setItems(items.filter(item => item.id !== itemId));
            setSelectedItemMenu(null);
          }
        }
      ]
    );
  };

  const removeParticipant = (participantId: string) => {
    const participant = participants.find(p => p.id === participantId);
    if (!participant) return;
    
    console.log('removeParticipant called for:', participantId, participant.name);
    
    Alert.alert(
      'Remove Participant',
      `Remove ${participant.name} from this bill?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            console.log('Confirmed removal of:', participant.name);
            // Remove participant from the list
            setParticipants(current => current.filter(p => p.id !== participantId));
            
            // Remove participant from all items
            setItems(current => current.map(item => ({
                ...item,
                sharedBy: item.sharedBy.filter(initials => initials !== participant.initials)
              })));
          }
        }
      ]
    );
  };

  const formatParticipantDisplay = (participant: Participant) => {
    switch (displayMode) {
      case 'dollar':
        return `$${((total * participant.percentage) / 100).toFixed(2)}`;
      case 'share':
        const totalShares = participants.reduce((sum, p) => sum + p.shares, 0);
        return `${participant.shares}/${totalShares}`;
      case 'percentage':
        return `${participant.percentage.toFixed(0)}%`;
      default:
        return `${participant.percentage.toFixed(0)}%`;
    }
  };

  const formatPieChartDisplay = (participant: Participant) => {
    switch (displayMode) {
      case 'dollar':
        return `$${((total * participant.percentage) / 100).toFixed(0)}`;
      case 'share':
        const totalShares = participants.reduce((sum, p) => sum + p.shares, 0);
        return `${participant.shares}/${totalShares}`;
      case 'percentage':
        return `${participant.percentage.toFixed(0)}%`;
      default:
        return `${participant.percentage.toFixed(0)}%`;
    }
  };

  const renderPercentageView = () => {
    let startAngle = -90;
    
    return (
      <View style={styles.percentageView}>
        <View style={styles.pieChartContainer}>
          <Svg 
            width={CIRCLE_SIZE} 
            height={CIRCLE_SIZE} 
            viewBox={`0 0 ${CIRCLE_SIZE} ${CIRCLE_SIZE}`}
          >
            {normalizedParticipants.map(participant => {
              const path = generatePath(participant.percentage, startAngle);
              const currentStartAngle = startAngle;
              startAngle += participant.percentage * 3.6;
              
              const textAngle = currentStartAngle + (participant.percentage * 3.6) / 2;
              const textRadius = RADIUS * 0.7;
              const textX = CENTER + textRadius * Math.cos(textAngle * (Math.PI / 180));
              const textY = CENTER + textRadius * Math.sin(textAngle * (Math.PI / 180));
              
              return (
                <G key={participant.id}>
                  <Path
                    d={path}
                    fill={participant.color}
                    opacity={selectedParticipant === participant.id ? 1 : 0.8}
                    onPress={() => setSelectedParticipant(
                      selectedParticipant === participant.id ? null : participant.id
                    )}
                  />
                    {participant.percentage >= 10 && (
                      <>
                        <SvgText
                          x={textX}
                          y={textY - 10}
                          fill={Colors.white}
                          fontSize="16"
                          fontWeight="bold"
                          textAnchor="middle"
                          alignmentBaseline="middle"
                        >
                          {participant.initials}
                        </SvgText>
                        <SvgText
                          x={textX}
                          y={textY + 10}
                          fill={Colors.white}
                          fontSize="14"
                          fontWeight="bold"
                          textAnchor="middle"
                          alignmentBaseline="middle"
                        >
                          {formatPieChartDisplay(participant)}
                        </SvgText>
                      </>
                    )}
                </G>
              );
            })}
            
            <Circle
              cx={CENTER}
              cy={CENTER}
              r={RADIUS * 0.35}
              fill={Colors.white}
              stroke={Colors.border}
              strokeWidth={1}
            />
            
            {selectedParticipant ? (
              <G>
                <Circle
                  cx={CENTER - 20}
                  cy={CENTER}
                  r={15}
                  fill={participants.find(p => p.id === selectedParticipant)?.color}
                  onClick={() => adjustPercentage(selectedParticipant, false)}
                />
                <SvgText
                  x={CENTER - 20}
                  y={CENTER}
                  fontSize="20"
                  fontWeight="bold"
                  textAnchor="middle"
                  alignmentBaseline="middle"
                  fill={Colors.white}
                >
                  -
                </SvgText>
                
                <Circle
                  cx={CENTER + 20}
                  cy={CENTER}
                  r={15}
                  fill={participants.find(p => p.id === selectedParticipant)?.color}
                  onClick={() => adjustPercentage(selectedParticipant, true)}
                />
                <SvgText
                  x={CENTER + 20}
                  y={CENTER}
                  fontSize="20"
                  fontWeight="bold"
                  textAnchor="middle"
                  alignmentBaseline="middle"
                  fill={Colors.white}
                >
                  +
                </SvgText>
              </G>
            ) : (
              <SvgText
                x={CENTER}
                y={CENTER}
                fontSize="14"
                textAnchor="middle"
                alignmentBaseline="middle"
                fill={Colors.darkGray}
              >
                Select a slice
              </SvgText>
            )}
          </Svg>
        </View>

        <View style={styles.displayModeToggle}>
          <TouchableOpacity 
            style={[
              styles.toggleButton,
              displayMode === 'dollar' && styles.toggleButtonActive
            ]}
            onPress={() => setDisplayMode('dollar')}
          >
            <MaterialCommunityIcons 
              name="currency-usd" 
              size={16} 
              color={displayMode === 'dollar' ? Colors.white : Colors.darkGray} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.toggleButton,
              displayMode === 'share' && styles.toggleButtonActive
            ]}
            onPress={() => setDisplayMode('share')}
          >
            <MaterialCommunityIcons 
              name="chart-pie" 
              size={16} 
              color={displayMode === 'share' ? Colors.white : Colors.darkGray} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.toggleButton,
              displayMode === 'percentage' && styles.toggleButtonActive
            ]}
            onPress={() => setDisplayMode('percentage')}
          >
            <MaterialCommunityIcons 
              name="percent" 
              size={16} 
              color={displayMode === 'percentage' ? Colors.white : Colors.darkGray} 
            />
          </TouchableOpacity>
        </View>

        <View style={styles.participantsList}>
          {participants.map((participant) => (
            <View key={participant.id} style={styles.participantRow}>
              <View style={styles.participantInfo}>
                <View style={[
                  styles.avatar,
                  participant.id === 'kw' && styles.avatarWithCrown
                ]}>
                onPress={() => {
                  console.log('Avatar touched:', participant.id, participant.name);
                  removeParticipant(participant.id);
                }}
                activeOpacity={0.6}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    <MaterialCommunityIcons 
                      name="crown" 
                      size={16} 
                      color={Colors.primary} 
                      style={styles.crown} 
                    />
                  )}
                  <Text style={styles.avatarText}>{participant.initials}</Text>
                </View>
                <Text style={styles.participantName}>{participant.name}</Text>
              </View>

              <View style={styles.percentageControls}>
                <TouchableOpacity 
                  style={styles.percentageButton}
                  onPress={() => adjustPercentage(participant.id, false)}
                >
                  <MaterialCommunityIcons name="minus" size={20} color={Colors.darkGray} />
                </TouchableOpacity>
                
                <Text style={styles.percentageText}>
                  {formatParticipantDisplay(participant)}
                </Text>
                
                <TouchableOpacity 
                  style={styles.percentageButton}
                  onPress={() => adjustPercentage(participant.id, true)}
                >
                  <MaterialCommunityIcons name="plus" size={20} color={Colors.darkGray} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderEvenSplitView = () => {
    const calculatedSubtotal = parseFloat(subtotalInput) || 0;
    const calculatedTax = calculatedSubtotal * taxPercentage / 100;
    const calculatedTip = calculatedSubtotal * tipPercentage / 100;
    const calculatedTotal = calculatedSubtotal + calculatedTax + calculatedTip;
    const evenAmount = calculatedTotal / participants.length;
    
    return (
      <View style={styles.evenSplitContainer}>
        <Text style={styles.billTotalLabel}>Total</Text>
        <Text style={styles.billTotalAmount}>${calculatedTotal.toFixed(2)}</Text>
        
        <View style={styles.breakdownContainer}>
          {/* Subtotal Row */}
          <View style={styles.adjustableRow}>
            <Text style={styles.breakdownLabel}>subtotal</Text>
            <View style={styles.subtotalInputContainer}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={styles.subtotalInput}
                value={subtotalInput}
                onChangeText={updateSubtotal}
                placeholder="0.00"
                placeholderTextColor={Colors.darkGray}
                keyboardType="decimal-pad"
                maxLength={10}
              />
            </View>
          </View>
          
          {/* Tax Row */}
          <View style={styles.adjustableRow}>
            <Text style={styles.breakdownLabel}>tax {taxPercentage}%</Text>
            <View style={styles.adjustableControls}>
              <TouchableOpacity 
                style={styles.adjustButton}
                onPress={() => adjustTaxPercentage(false)}
              >
                <MaterialCommunityIcons name="minus" size={16} color={Colors.darkGray} />
              </TouchableOpacity>
              <Text style={styles.breakdownValue}>${calculatedTax.toFixed(2)}</Text>
              <TouchableOpacity 
                style={styles.adjustButton}
                onPress={() => adjustTaxPercentage(true)}
              >
                <MaterialCommunityIcons name="plus" size={16} color={Colors.darkGray} />
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Tip Row */}
          <View style={styles.adjustableRow}>
            <Text style={styles.breakdownLabel}>tip {tipPercentage}%</Text>
            <View style={styles.adjustableControls}>
              <TouchableOpacity 
                style={styles.adjustButton}
                onPress={() => adjustTipPercentage(false)}
              >
                <MaterialCommunityIcons name="minus" size={16} color={Colors.darkGray} />
              </TouchableOpacity>
              <Text style={styles.breakdownValue}>${calculatedTip.toFixed(2)}</Text>
              <TouchableOpacity 
                style={styles.adjustButton}
                onPress={() => adjustTipPercentage(true)}
              >
                <MaterialCommunityIcons name="plus" size={16} color={Colors.darkGray} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <>
      <Stack.Screen options={{ 
        headerShown: false, // Hide the header completely
      }} />
      
      {/* Custom Back Button - Positioned much lower */}
      <TouchableOpacity 
        onPress={() => router.back()}
        style={styles.backButton}
      >
        <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.text} />
      </TouchableOpacity>
      
      <View style={styles.container}>
        {/* QR Code - Positioned at top right */}
        <View style={styles.qrCodeTopRight}>
          <QRCodeGenerator 
            receiptId="april-15-dinner"
            receiptName="April 15th Dinner"
            size={60}
          />
        </View>
        
        {/* Title positioned next to QR code */}
        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>April 15th Dinner</Text>
        </View>
        
        {/* Split Method Options */}
        <View style={styles.splitMethodSection}>
          <View style={styles.splitMethodContainer}>
            <TouchableOpacity 
              style={[styles.methodButton, splitMethod === 'items' && styles.methodButtonActive]}
              onPress={() => setSplitMethod('items')}
            >
              <Text style={[styles.methodText, splitMethod === 'items' && styles.methodTextActive]}>
                Split by Item
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.methodButton, splitMethod === 'even' && styles.methodButtonActive]}
              onPress={() => setSplitMethod('even')}
            >
              <Text style={[styles.methodText, splitMethod === 'even' && styles.methodTextActive]}>
                Split Evenly
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.methodButton, splitMethod === 'percentage' && styles.methodButtonActive]}
              onPress={() => setSplitMethod('percentage')}
            >
              <Text style={[styles.methodText, splitMethod === 'percentage' && styles.methodTextActive]}>
                Split by %
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {splitMethod !== 'even' && (
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            {splitMethod === 'percentage' ? renderPercentageView() : (
              <>
                {items.map((item, index) => (
                  <View key={item.id} style={styles.itemRow}>
                    <View style={styles.itemNumberContainer}>
                      <Text style={styles.itemNumber}>{index + 1}</Text>
                    </View>
                    
                    <View style={styles.itemContent}>
                      <View style={styles.itemHeader}>
                        <View style={styles.itemNameContainer}>
                          <View style={styles.quantityControls}>
                            <TouchableOpacity 
                              style={styles.quantityButton}
                              onPress={() => updateItemQuantity(item.id, false)}
                            >
                              <MaterialCommunityIcons name="minus" size={16} color={Colors.darkGray} />
                            </TouchableOpacity>
                            <Text style={styles.quantityText}>{item.quantity}×</Text>
                            <TouchableOpacity 
                              style={styles.quantityButton}
                              onPress={() => updateItemQuantity(item.id, true)}
                            >
                              <MaterialCommunityIcons name="plus" size={16} color={Colors.darkGray} />
                            </TouchableOpacity>
                          </View>
                          <TextInput
                            style={styles.itemNameInput}
                            value={item.name}
                            onChangeText={(text) => updateItemName(item.id, text)}
                            placeholder="Enter item name"
                            placeholderTextColor={Colors.darkGray}
                          />
                        </View>
                        <View style={styles.priceInputContainer}>
                          <Text style={styles.currencySymbol}>$</Text>
                          <TextInput
                            style={styles.priceInput}
                            value={item.price}
                            onChangeText={(text) => updateItemPrice(item.id, text)}
                            placeholder="0.00"
                            placeholderTextColor={Colors.darkGray}
                            keyboardType="decimal-pad"
                            maxLength={7}
                          />
                        </View>
                      </View>
                      
                      <View style={styles.participantAvatars}>
                        {participants.map((participant) => (
                          <TouchableOpacity
                            key={participant.initials}
                            onPress={() => toggleParticipant(item.id, participant.initials)}
                            style={[
                              styles.avatar,
                              !item.sharedBy.includes(participant.initials) && styles.avatarInactive
                            ]}
                          >
                            <Text style={[
                              styles.avatarText,
                              !item.sharedBy.includes(participant.initials) && styles.avatarTextInactive
                            ]}>
                              {participant.initials}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                    
                    <TouchableOpacity 
                      style={styles.itemMenuButton}
                      onPress={() => setSelectedItemMenu(selectedItemMenu === item.id ? null : item.id)}
                    >
                      <MaterialCommunityIcons name="dots-vertical" size={20} color={Colors.darkGray} />
                    </TouchableOpacity>
                  </View>
                ))}
                
                <TouchableOpacity style={styles.addItemButton} onPress={addNewItem}>
                  <MaterialCommunityIcons name="plus" size={24} color={Colors.darkGray} />
                  <Text style={styles.addItemText}>Add Item</Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        )}

        {/* Even Split View - Outside ScrollView */}
        {splitMethod === 'even' && (
          <View style={styles.evenSplitViewContainer}>
            {renderEvenSplitView()}
          </View>
        )}

        <View style={styles.footer}>
          <View style={styles.participantsSection}>
            {participants.map((participant) => (
              <View key={participant.id} style={styles.participantColumn}>
                <TouchableOpacity 
                  style={[
                    styles.participantPicture,
                    participant.id === 'kw' && styles.participantPictureWithCrown
                  ]}
                  onPress={() => removeParticipant(participant.id)}
                >
                  {participant.id === 'kw' && (
                    <MaterialCommunityIcons 
                      name="crown" 
                      size={14} 
                      color={Colors.primary} 
                      style={styles.participantCrown} 
                    />
                  )}
                  <Text style={styles.participantInitials}>{participant.initials}</Text>
                </TouchableOpacity>
                <Text style={styles.participantName}>{participant.name}</Text>
                <Text style={styles.participantAmount}>
                  ${participantAmounts[participant.initials]?.toFixed(2) || '0.00'}
                </Text>
              </View>
            ))}
            <TouchableOpacity style={styles.addParticipantButton} onPress={addNewItem}>
              <MaterialCommunityIcons name="plus" size={20} color={Colors.darkGray} />
            </TouchableOpacity>
          </View>

          <View style={styles.bottomButtonsContainer}>
            <TouchableOpacity 
              style={styles.scanButton}
              onPress={() => router.push('/scanner')}
            >
              <MaterialCommunityIcons name="qrcode-scan" size={20} color={Colors.white} />
              <Text style={styles.scanButtonText}>Scan Receipt</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.settleButton}>
              <Text style={styles.settleButtonText}>Settle Up</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Item Menu Modal */}
        <Modal
          visible={selectedItemMenu !== null}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setSelectedItemMenu(null)}
        >
          <Pressable 
            style={styles.modalOverlay}
            onPress={() => setSelectedItemMenu(null)}
          >
            <View style={styles.itemMenuModal}>
              <TouchableOpacity 
                style={styles.menuOption}
                onPress={() => selectedItemMenu && duplicateItem(selectedItemMenu)}
              >
                <MaterialCommunityIcons name="content-duplicate" size={20} color={Colors.secondary} />
                <Text style={styles.menuOptionText}>Duplicate Item</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.menuOption}
                onPress={() => selectedItemMenu && assignToAll(selectedItemMenu)}
              >
                <MaterialCommunityIcons name="account-group" size={20} color={Colors.primary} />
                <Text style={styles.menuOptionText}>Assign to All</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.menuOption}
                onPress={() => selectedItemMenu && assignToNone(selectedItemMenu)}
              >
                <MaterialCommunityIcons name="account-remove" size={20} color={Colors.warning} />
                <Text style={styles.menuOptionText}>Assign to None</Text>
              </TouchableOpacity>
              
              <View style={styles.menuDivider} />
              
              <TouchableOpacity 
                style={styles.menuOption}
                onPress={() => selectedItemMenu && deleteItem(selectedItemMenu)}
              >
                <MaterialCommunityIcons name="delete" size={20} color={Colors.error} />
                <Text style={[styles.menuOptionText, { color: Colors.error }]}>Delete Item</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Modal>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingTop: 120, // Add padding to account for back button
  },
  header: {
    backgroundColor: Colors.white,
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 0,
  },
  headerTitle: {
    fontWeight: '600',
    fontSize: 17,
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 80, // Much lower position - well below status bar
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
  qrCodeTopRight: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1000,
  },
  titleContainer: {
    position: 'absolute',
    top: 52,
    left: 0,
    right: 0,
    zIndex: 1000,
    alignItems: 'center',
  },
  titleText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  splitMethodSection: {
    backgroundColor: Colors.white,
    paddingTop: 20,
    paddingBottom: 8,
  },
  splitMethodContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  methodButton: {
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  methodButtonActive: {
    backgroundColor: Colors.lightGray,
    borderRadius: 12,
  },
  methodText: {
    fontSize: 12,
    color: Colors.darkGray,
  },
  methodTextActive: {
    color: Colors.text,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContent: {
    paddingHorizontal: 24, // Increased from 20 to 24
    paddingVertical: 32, // Increased from 40 to 32 for top/bottom
    minHeight: Dimensions.get('window').height * 0.8, // Ensure content takes most of screen height
  },
  percentageView: {
    alignItems: 'center',
    paddingVertical: 0, // Remove all vertical padding
    paddingTop: 8, // Add minimal top padding
    minHeight: 500, // Further reduce minimum height
  },
  pieChartContainer: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    marginTop: 0,
    marginBottom: 16, // Further reduce bottom margin
  },
  displayModeToggle: {
    flexDirection: 'row',
    marginTop: 12, // Reduce top margin
    backgroundColor: Colors.lightGray,
    borderRadius: 20,
    padding: 4,
    gap: 2,
  },
  toggleButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  toggleButtonActive: {
    backgroundColor: Colors.primary,
  },
  participantsList: {
    width: '100%',
    marginTop: 20, // Reduce top margin to bring list closer
  },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20, // Increased from 16 to 20
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  participantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  participantName: {
    fontSize: 16,
    color: Colors.text,
  },
  participantAmountText: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
  },
  percentageControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  percentageButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentageText: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
    minWidth: 60,
    textAlign: 'center',
  },
  evenSplitViewContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  evenSplitContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  evenSplitView: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    minHeight: 500,
  },
  billNameText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.darkGray,
    marginBottom: 12,
    textAlign: 'center',
  },
  billTotalLabel: {
    fontSize: 16,
    color: Colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  billTotalAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  breakdownContainer: {
    width: '100%',
    gap: 8,
  },
  adjustableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  adjustableControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  adjustButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  breakdownLabel: {
    fontSize: 14,
    color: Colors.darkGray,
    flex: 1,
  },
  breakdownValue: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
    minWidth: 60,
    textAlign: 'center',
  },
  subtotalInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  subtotalInput: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
    padding: 0,
    margin: 0,
    minWidth: 60,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: 2,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 24, // Increased from 20 to 24
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  itemNumberContainer: {
    width: 24,
    alignItems: 'center',
  },
  itemNumber: {
    fontSize: 15,
    color: Colors.darkGray,
  },
  itemContent: {
    flex: 1,
    marginLeft: 10,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16, // Increased from 12 to 16
  },
  itemNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  quantityButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 15,
    color: Colors.text,
    marginHorizontal: 8,
    minWidth: 24,
    textAlign: 'center',
  },
  itemNameInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    padding: 0,
    margin: 0,
    minWidth: 100,
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 48,
    justifyContent: 'flex-end',
  },
  currencySymbol: {
    fontSize: 15,
    color: Colors.text,
    marginRight: 1,
  },
  priceInput: {
    fontSize: 15,
    color: Colors.text,
    padding: 0,
    margin: 0,
    width: 40,
    textAlign: 'right',
  },
  participantAvatars: {
    flexDirection: 'row',
    gap: 8,
  },
  itemMenuButton: {
    padding: 8,
  },
  addItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24, // Increased from 20 to 24
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: 32, // Increased from 20 to 32
  },
  addItemText: {
    fontSize: 15,
    color: Colors.darkGray,
    fontWeight: '500',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.text,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  avatarInactive: {
    backgroundColor: Colors.lightGray,
  },
  avatarWithCrown: {
    backgroundColor: Colors.text,
  },
  crown: {
    position: 'absolute',
    top: -8,
    right: -4,
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.white,
  },
  avatarTextInactive: {
    color: Colors.darkGray,
  },
  footer: {
    padding: 20,
    paddingTop: -20, // Move footer up by 20px total
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingBottom: Platform.OS === 'web' ? 40 : 20, // Extra padding for web to simulate iPhone home indicator
  },
  billNameSection: {
    alignItems: 'center',
    marginBottom: 12,
  },
  billName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  totalSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 14,
    color: Colors.darkGray,
    marginBottom: 4,
  },
  totalValue: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.text,
  },
  participantsSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginBottom: 20,
    gap: 16,
  },
  participantColumn: {
    alignItems: 'center',
    gap: 4,
  },
  participantPicture: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.text,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  participantPictureWithCrown: {
    backgroundColor: Colors.text,
  },
  participantCrown: {
    position: 'absolute',
    top: -10,
    right: -4,
  },
  participantInitials: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
  participantAmount: {
    fontSize: 12,
    color: Colors.darkGray,
    fontWeight: '500',
  },
  participantsInlineSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginTop: 32,
    gap: 16,
  },
  participantInlineColumn: {
    alignItems: 'center',
    gap: 4,
  },
  participantInlinePicture: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.text,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  participantInlinePictureWithCrown: {
    backgroundColor: Colors.text,
  },
  participantInlineCrown: {
    position: 'absolute',
    top: -10,
    right: -4,
  },
  participantInlineInitials: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
  participantInlineName: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: '500',
  },
  participantInlineAmount: {
    fontSize: 12,
    color: Colors.darkGray,
    fontWeight: '500',
  },
  addParticipantButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 0,
  },
  bottomButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  scanButton: {
    backgroundColor: Colors.secondary,
    borderRadius: 25,
    height: 50,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  scanButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  settleButton: {
    backgroundColor: Colors.text,
    borderRadius: 25,
    height: 50,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settleButtonText: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemMenuModal: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 8,
    minWidth: 200,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  menuOptionText: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
  },
  menuDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 4,
  },
});