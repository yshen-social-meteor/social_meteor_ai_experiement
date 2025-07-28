import React, { useState, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  TouchableOpacity, 
  Text, 
  Animated, 
  Easing,
  Pressable 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';

interface Action {
  icon: string;
  label: string;
  onPress: () => void;
}

interface FloatingActionButtonProps {
  onPress: () => void;
  icon: string;
  actions?: Action[];
}

export default function FloatingActionButton({ 
  onPress, 
  icon, 
  actions 
}: FloatingActionButtonProps) {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;
  
  const toggleMenu = () => {
    if (!actions || actions.length === 0) {
      onPress();
      return;
    }
    
    const toValue = isOpen ? 0 : 1;
    
    Animated.timing(animation, {
      toValue,
      duration: 300,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
      useNativeDriver: true,
    }).start();
    
    setIsOpen(!isOpen);
  };

  const handleActionPress = (action: Action) => {
    setIsOpen(false);
    Animated.timing(animation, {
      toValue: 0,
      duration: 300,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
      useNativeDriver: true,
    }).start(() => {
      action.onPress();
    });
  };

  const backdropOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5],
  });

  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      right: 24,
      bottom: 24,
      alignItems: 'center',
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: theme.shadow,
      zIndex: 1,
    },
    button: {
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
      zIndex: 2,
    },
    buttonActive: {
      backgroundColor: theme.error,
    },
    actionsContainer: {
      position: 'absolute',
      bottom: 0,
      zIndex: 1,
    },
    actionContainer: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      flexDirection: 'row',
      alignItems: 'center',
    },
    actionButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.secondary,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 5,
      elevation: 2,
    },
    actionLabelContainer: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      borderRadius: 4,
      marginRight: 16,
    },
    actionLabel: {
      color: theme.white,
      fontSize: 14,
      fontWeight: '500',
    },
  });

  return (
    <>
      {isOpen && (
        <Pressable
          style={[styles.backdrop, { opacity: backdropOpacity }]}
          onPress={toggleMenu}
        />
      )}
      
      <View style={styles.container}>
        {actions && actions.length > 0 && (
          <View style={styles.actionsContainer}>
            {actions.map((action, index) => {
              const actionAnimation = animation.interpolate({
                inputRange: [0, 1],
                outputRange: [80, -16 - (index * 56)],
              });
              
              const scaleAnimation = animation.interpolate({
                inputRange: [0, 0.7, 1],
                outputRange: [0, 0, 1],
              });
              
              const opacityAnimation = animation.interpolate({
                inputRange: [0, 0.7, 1],
                outputRange: [0, 0, 1],
              });
              
              return (
                <Animated.View
                  key={index}
                  style={[
                    styles.actionContainer,
                    {
                      transform: [
                        { translateY: actionAnimation },
                        { scale: scaleAnimation }
                      ],
                      opacity: opacityAnimation,
                    },
                  ]}
                >
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleActionPress(action)}
                  >
                    <MaterialCommunityIcons 
                      name={action.icon} 
                      size={24} 
                      color={theme.white} 
                    />
                  </TouchableOpacity>
                  
                  <View style={styles.actionLabelContainer}>
                    <Text style={styles.actionLabel}>{action.label}</Text>
                  </View>
                </Animated.View>
              );
            })}
          </View>
        )}
        
        <TouchableOpacity
          style={[
            styles.button,
            isOpen && styles.buttonActive
          ]}
          onPress={toggleMenu}
        >
          <Animated.View
            style={{
              transform: [
                {
                  rotate: animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '45deg'],
                  }),
                },
              ],
            }}
          >
            <MaterialCommunityIcons
              name={isOpen ? 'close' : icon}
              size={24}
              color={theme.white}
            />
          </Animated.View>
        </TouchableOpacity>
      </View>
    </>
  );
}