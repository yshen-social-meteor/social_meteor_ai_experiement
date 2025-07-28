import { useState, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Animated,
  Modal,
  Pressable
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import EmptyState from '@/components/EmptyState';
import TransactionCard from '@/components/TransactionCard';
import SearchBar from '@/components/SearchBar';

export default function HistoryScreen() {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState('all');
  const [showGroupDropdown, setShowGroupDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showTimeframeDropdown, setShowTimeframeDropdown] = useState(false);
  
  const [transactions, setTransactions] = useState([
    // Mock data for demonstration
    {
      id: '1',
      name: 'Dinner at Joe\'s Bistro',
      date: '2024-01-15',
      amount: 85.50,
      group: 'College Friends',
      isSettled: true,
      paidBy: 'Alex',
      participants: [
        { name: 'You', amount: 28.50, isPaid: true },
        { name: 'Alex', amount: 28.50, isPaid: true },
        { name: 'Sam', amount: 28.50, isPaid: true },
      ]
    },
    {
      id: '2',
      name: 'Grocery Shopping',
      date: '2024-01-12',
      amount: 124.75,
      group: 'Roommates',
      isSettled: false,
      paidBy: 'You',
      participants: [
        { name: 'You', amount: 62.38, isPaid: true },
        { name: 'Jordan', amount: 62.37, isPaid: false },
      ]
    },
    {
      id: '3',
      name: 'Movie Night Snacks',
      date: '2024-01-10',
      amount: 32.40,
      group: 'College Friends',
      isSettled: true,
      paidBy: 'Sam',
      participants: [
        { name: 'You', amount: 10.80, isPaid: true },
        { name: 'Alex', amount: 10.80, isPaid: true },
        { name: 'Sam', amount: 10.80, isPaid: true },
      ]
    },
    {
      id: '4',
      name: 'Coffee & Pastries',
      date: '2024-01-08',
      amount: 18.90,
      group: 'Work Team',
      isSettled: false,
      paidBy: 'Sarah',
      participants: [
        { name: 'You', amount: 6.30, isPaid: false },
        { name: 'Sarah', amount: 6.30, isPaid: true },
        { name: 'Mike', amount: 6.30, isPaid: true },
      ]
    },
    {
      id: '5',
      name: 'Weekend Brunch',
      date: '2024-01-07',
      amount: 67.20,
      group: 'College Friends',
      isSettled: true,
      paidBy: 'You',
      participants: [
        { name: 'You', amount: 22.40, isPaid: true },
        { name: 'Alex', amount: 22.40, isPaid: true },
        { name: 'Sam', amount: 22.40, isPaid: true },
      ]
    },
    {
      id: '6',
      name: 'Pizza Night',
      date: '2024-01-05',
      amount: 45.60,
      group: 'Roommates',
      isSettled: true,
      paidBy: 'Jordan',
      participants: [
        { name: 'You', amount: 22.80, isPaid: true },
        { name: 'Jordan', amount: 22.80, isPaid: true },
      ]
    },
    {
      id: '7',
      name: 'Concert Tickets',
      date: '2024-01-03',
      amount: 180.00,
      group: 'College Friends',
      isSettled: false,
      paidBy: 'You',
      participants: [
        { name: 'You', amount: 60.00, isPaid: true },
        { name: 'Alex', amount: 60.00, isPaid: false },
        { name: 'Sam', amount: 60.00, isPaid: true },
      ]
    },
    {
      id: '8',
      name: 'Team Lunch',
      date: '2024-01-02',
      amount: 95.40,
      group: 'Work Team',
      isSettled: true,
      paidBy: 'Mike',
      participants: [
        { name: 'You', amount: 31.80, isPaid: true },
        { name: 'Sarah', amount: 31.80, isPaid: true },
        { name: 'Mike', amount: 31.80, isPaid: true },
      ]
    },
  ]);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Mock groups data
  const groups = [
    { id: 'college-friends', name: 'College Friends' },
    { id: 'roommates', name: 'Roommates' },
    { id: 'work-team', name: 'Work Team' },
  ];

  // Fade-in animation when component mounts
  useState(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  // Filter transactions based on search and filters
  const filteredTransactions = transactions.filter(transaction => {
    // Search filter
    const matchesSearch = transaction.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         transaction.group.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         transaction.paidBy.toLowerCase().includes(searchQuery.toLowerCase());

    // Group filter
    const matchesGroup = selectedGroup === null || 
                        groups.find(g => g.id === selectedGroup)?.name === transaction.group;

    // Status filter
    const matchesStatus = selectedStatus === 'all' ||
                         (selectedStatus === 'settled' && transaction.isSettled) ||
                         (selectedStatus === 'pending' && !transaction.isSettled);

    // Timeframe filter (simplified for demo)
    const matchesTimeframe = selectedTimeframe === 'all' || true; // Would implement actual date filtering

    return matchesSearch && matchesGroup && matchesStatus && matchesTimeframe;
  });

  const statusOptions = [
    { id: 'all', label: 'All Transactions', icon: 'format-list-bulleted' },
    { id: 'pending', label: 'Pending', icon: 'clock-outline' },
    { id: 'settled', label: 'Settled', icon: 'check-circle' },
  ];

  const timeframeOptions = [
    { id: 'all', label: 'All Time', icon: 'calendar' },
    { id: 'week', label: 'This Week', icon: 'calendar-week' },
    { id: 'month', label: 'This Month', icon: 'calendar-month' },
    { id: 'year', label: 'This Year', icon: 'calendar-range' },
  ];

  const groupOptions = [
    { id: null, label: 'All Groups', icon: 'account-group' },
    ...groups.map(group => ({
      id: group.id,
      label: group.name,
      icon: 'account-group'
    }))
  ];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    searchContainer: {
      paddingTop: 8,
    },
    filtersContainer: {
      backgroundColor: theme.background,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    filtersRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
    },
    filterPill: {
      paddingHorizontal: 16,
      paddingVertical: 6,
      borderRadius: 16,
      backgroundColor: theme.cardBackground,
      borderWidth: 1,
      borderColor: theme.border,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      minWidth: 70,
      justifyContent: 'center',
      height: 28,
    },
    filterPillActive: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    filterPillText: {
      fontSize: 11,
      fontWeight: '500',
      color: theme.darkGray,
    },
    filterPillTextActive: {
      color: theme.white,
    },
    clearFilterPill: {
      backgroundColor: theme.lightGray,
      borderColor: theme.border,
    },
    clearFilterText: {
      color: theme.error,
      fontWeight: '600',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    dropdownModal: {
      backgroundColor: theme.cardBackground,
      borderRadius: 16,
      minWidth: 280,
      maxWidth: 320,
      maxHeight: 400,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 16,
      elevation: 8,
    },
    dropdownHeader: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      alignItems: 'center',
    },
    dropdownHeaderText: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.text,
    },
    dropdownScrollView: {
      maxHeight: 300,
    },
    dropdownOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    dropdownOptionLast: {
      borderBottomWidth: 0,
    },
    dropdownOptionActive: {
      backgroundColor: theme.lightGray,
    },
    dropdownOptionIcon: {
      marginRight: 16,
    },
    dropdownOptionText: {
      fontSize: 16,
      color: theme.text,
      flex: 1,
    },
    dropdownOptionTextActive: {
      color: theme.primary,
      fontWeight: '600',
    },
    checkIcon: {
      marginLeft: 12,
    },
    content: {
      flex: 1,
      backgroundColor: theme.background,
    },
    scrollView: {
      flex: 1,
      backgroundColor: theme.background,
      padding: 16,
    },
    emptyStateContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 40,
    },
    noResultsTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    noResultsDescription: {
      fontSize: 14,
      color: theme.darkGray,
      textAlign: 'center',
      paddingHorizontal: 32,
      lineHeight: 20,
    },
    clearAllButton: {
      position: 'absolute',
      top: 16,
      right: 16,
      backgroundColor: theme.lightGray,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      zIndex: 10,
    },
    clearAllText: {
      fontSize: 12,
      color: theme.primary,
      fontWeight: '600',
    },
  });

  const hasActiveFilters = selectedGroup !== null || selectedStatus !== 'all' || selectedTimeframe !== 'all' || searchQuery !== '';

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedGroup(null);
    setSelectedStatus('all');
    setSelectedTimeframe('all');
  };

  const closeAllDropdowns = () => {
    setShowGroupDropdown(false);
    setShowStatusDropdown(false);
    setShowTimeframeDropdown(false);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (selectedGroup !== null) count++;
    if (selectedStatus !== 'all') count++;
    if (selectedTimeframe !== 'all') count++;
    return count;
  };

  const getFilterIcon = (filterType: string) => {
    switch (filterType) {
      case 'group':
        return selectedGroup !== null ? 'account-group' : 'account-group-outline';
      case 'status':
        if (selectedStatus === 'settled') return 'check-circle';
        if (selectedStatus === 'pending') return 'clock-outline';
        return 'format-list-bulleted-square';
      case 'timeframe':
        if (selectedTimeframe === 'week') return 'calendar-week';
        if (selectedTimeframe === 'month') return 'calendar-month';
        if (selectedTimeframe === 'year') return 'calendar-range';
        return 'calendar-outline';
      default:
        return 'filter-outline';
    }
  };

  const getFilterLabel = (filterType: string) => {
    switch (filterType) {
      case 'group':
        if (selectedGroup === null) return 'Groups';
        return groups.find(g => g.id === selectedGroup)?.name || 'Groups';
      case 'status':
        if (selectedStatus === 'settled') return 'Settled';
        if (selectedStatus === 'pending') return 'Pending';
        return 'Status';
      case 'timeframe':
        if (selectedTimeframe === 'week') return 'Week';
        if (selectedTimeframe === 'month') return 'Month';
        if (selectedTimeframe === 'year') return 'Year';
        return 'Time';
      default:
        return 'Filter';
    }
  };

  const isFilterActive = (filterType: string) => {
    switch (filterType) {
      case 'group':
        return selectedGroup !== null;
      case 'status':
        return selectedStatus !== 'all';
      case 'timeframe':
        return selectedTimeframe !== 'all';
      default:
        return false;
    }
  };

  const renderDropdown = (
    isVisible: boolean,
    onClose: () => void,
    options: any[],
    selectedValue: any,
    onSelect: (value: any) => void,
    title: string
  ) => (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <View style={styles.dropdownModal}>
          <View style={styles.dropdownHeader}>
            <Text style={styles.dropdownHeaderText}>{title}</Text>
          </View>
          <ScrollView style={styles.dropdownScrollView}>
            {options.map((option, index) => {
              const isSelected = selectedValue === option.id;
              const isLast = index === options.length - 1;
              
              return (
                <TouchableOpacity
                  key={option.id || 'null'}
                  style={[
                    styles.dropdownOption,
                    isSelected && styles.dropdownOptionActive,
                    isLast && styles.dropdownOptionLast
                  ]}
                  onPress={() => {
                    onSelect(option.id);
                    onClose();
                  }}
                >
                  <MaterialCommunityIcons
                    name={option.icon}
                    size={22}
                    color={isSelected ? theme.primary : theme.darkGray}
                    style={styles.dropdownOptionIcon}
                  />
                  <Text style={[
                    styles.dropdownOptionText,
                    isSelected && styles.dropdownOptionTextActive
                  ]}>
                    {option.label}
                  </Text>
                  {isSelected && (
                    <MaterialCommunityIcons
                      name="check"
                      size={18}
                      color={theme.primary}
                      style={styles.checkIcon}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </Pressable>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <SearchBar
          placeholder="Search transactions..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filters - Wider Pills */}
      <View style={styles.filtersContainer}>
        <View style={styles.filtersRow}>
          {/* Groups Filter */}
          <TouchableOpacity
            style={[
              styles.filterPill,
              isFilterActive('group') && styles.filterPillActive
            ]}
            onPress={() => {
              closeAllDropdowns();
              setShowGroupDropdown(true);
            }}
          >
            <MaterialCommunityIcons
              name={getFilterIcon('group')}
              size={14}
              color={isFilterActive('group') ? theme.white : theme.darkGray}
            />
            <Text style={[
              styles.filterPillText,
              isFilterActive('group') && styles.filterPillTextActive
            ]}>
              {getFilterLabel('group')}
            </Text>
          </TouchableOpacity>

          {/* Status Filter */}
          <TouchableOpacity
            style={[
              styles.filterPill,
              isFilterActive('status') && styles.filterPillActive
            ]}
            onPress={() => {
              closeAllDropdowns();
              setShowStatusDropdown(true);
            }}
          >
            <MaterialCommunityIcons
              name={getFilterIcon('status')}
              size={14}
              color={isFilterActive('status') ? theme.white : theme.darkGray}
            />
            <Text style={[
              styles.filterPillText,
              isFilterActive('status') && styles.filterPillTextActive
            ]}>
              {getFilterLabel('status')}
            </Text>
          </TouchableOpacity>

          {/* Timeframe Filter */}
          <TouchableOpacity
            style={[
              styles.filterPill,
              isFilterActive('timeframe') && styles.filterPillActive
            ]}
            onPress={() => {
              closeAllDropdowns();
              setShowTimeframeDropdown(true);
            }}
          >
            <MaterialCommunityIcons
              name={getFilterIcon('timeframe')}
              size={14}
              color={isFilterActive('timeframe') ? theme.white : theme.darkGray}
            />
            <Text style={[
              styles.filterPillText,
              isFilterActive('timeframe') && styles.filterPillTextActive
            ]}>
              {getFilterLabel('timeframe')}
            </Text>
          </TouchableOpacity>

          {/* Clear Filters Button (only show when filters are active) */}
          {hasActiveFilters && (
            <TouchableOpacity
              style={[styles.filterPill, styles.clearFilterPill]}
              onPress={clearAllFilters}
            >
              <MaterialCommunityIcons
                name="close-circle"
                size={14}
                color={theme.error}
              />
              <Text style={[styles.filterPillText, styles.clearFilterText]}>
                Clear
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Clear All Filters Button (floating) */}
      {hasActiveFilters && (
        <TouchableOpacity style={styles.clearAllButton} onPress={clearAllFilters}>
          <MaterialCommunityIcons name="close-circle" size={14} color={theme.primary} />
          <Text style={styles.clearAllText}>Clear All</Text>
        </TouchableOpacity>
      )}

      {/* Content */}
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {filteredTransactions.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            {hasActiveFilters ? (
              <>
                <MaterialCommunityIcons name="filter-remove\" size={64} color={theme.primary} />
                <Text style={styles.noResultsTitle}>No Results Found</Text>
                <Text style={styles.noResultsDescription}>
                  Try adjusting your search or filters to find what you're looking for
                </Text>
              </>
            ) : (
              <EmptyState
                icon="history"
                title="No Transaction History"
                description="Your bill splitting history will appear here"
              />
            )}
          </View>
        ) : (
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {filteredTransactions.map((transaction, index) => (
              <TransactionCard key={transaction.id} transaction={transaction} />
            ))}
          </ScrollView>
        )}
      </Animated.View>

      {/* Dropdown Modals */}
      {renderDropdown(
        showGroupDropdown,
        () => setShowGroupDropdown(false),
        groupOptions,
        selectedGroup,
        setSelectedGroup,
        'Select Group'
      )}

      {renderDropdown(
        showStatusDropdown,
        () => setShowStatusDropdown(false),
        statusOptions,
        selectedStatus,
        setSelectedStatus,
        'Filter by Status'
      )}

      {renderDropdown(
        showTimeframeDropdown,
        () => setShowTimeframeDropdown(false),
        timeframeOptions,
        selectedTimeframe,
        setSelectedTimeframe,
        'Select Time Period'
      )}
    </View>
  );
}