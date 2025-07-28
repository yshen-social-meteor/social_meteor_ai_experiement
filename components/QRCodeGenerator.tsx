import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Share, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';

interface QRCodeGeneratorProps {
  receiptId: string;
  receiptName: string;
  size?: number;
}

export default function QRCodeGenerator({ 
  receiptId, 
  receiptName, 
  size = 80 
}: QRCodeGeneratorProps) {
  // Generate a shareable URL for the receipt
  const shareUrl = `https://split-app.com/join/${receiptId}`;
  
  // QR code API URL with better styling
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(shareUrl)}&format=png&bgcolor=FFFFFF&color=212121&qzone=2&margin=10`;

  const handleShare = async () => {
    try {
      const message = `Join "${receiptName}" bill splitting session: ${shareUrl}`;
      
      if (Platform.OS === 'web') {
        // Web fallback - copy to clipboard
        await navigator.clipboard.writeText(shareUrl);
        // You could show a toast notification here
      } else {
        await Share.share({
          message,
          url: shareUrl,
          title: `Join ${receiptName}`,
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.qrContainer}>
        <View style={styles.qrCodeWrapper}>
          <img 
            src={qrCodeUrl}
            style={styles.qrCode}
            alt="QR Code for sharing bill"
          />
          <View style={styles.logoOverlay}>
            <MaterialCommunityIcons 
              name="receipt" 
              size={12} 
              color={Colors.primary} 
            />
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.shareButton}
          onPress={handleShare}
        >
          <MaterialCommunityIcons 
            name="share-variant" 
            size={12} 
            color={Colors.primary} 
          />
          <Text style={styles.shareText}>Share Link</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  qrContainer: {
    alignItems: 'center',
  },
  qrCodeWrapper: {
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  qrCode: {
    width: 80,
    height: 80,
    borderRadius: 6,
  },
  logoOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -6 }, { translateY: -6 }],
    backgroundColor: Colors.white,
    borderRadius: 8,
    padding: 2,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 1,
    elevation: 1,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -2,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: Colors.lightGray,
    borderRadius: 12,
    gap: 3,
  },
  shareText: {
    fontSize: 10,
    color: Colors.primary,
    fontWeight: '500',
  },
});