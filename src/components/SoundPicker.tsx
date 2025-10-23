/**
 * SoundPicker Component
 * 
 * Modal component for selecting alarm sounds.
 * Displays list of bundled sounds with preview capability.
 * 
 * Reference: Docs/ARCHITECTURE.md - Component Hierarchy
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  SafeAreaView,
} from 'react-native';

// Constants
import { BUNDLED_SOUNDS, getSoundName } from '../constants/sounds';

// Types
import { BundledSound } from '../types/alarm.types';

/**
 * SoundPicker Props
 */
interface SoundPickerProps {
  visible: boolean;
  selectedSound: string;
  onSoundSelect: (soundId: string) => void;
  onClose: () => void;
}

/**
 * SoundPicker Component
 */
export const SoundPicker: React.FC<SoundPickerProps> = ({
  visible,
  selectedSound,
  onSoundSelect,
  onClose,
}) => {
  /**
   * Handle sound selection
   */
  const handleSoundSelect = (soundId: string) => {
    onSoundSelect(soundId);
    onClose();
  };

  /**
   * Render sound item
   */
  const renderSoundItem = ({ item }: { item: BundledSound }) => {
    const isSelected = item.id === selectedSound;

    return (
      <TouchableOpacity
        style={[styles.soundItem, isSelected && styles.soundItemSelected]}
        onPress={() => handleSoundSelect(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.soundItemContent}>
          <View>
            <Text style={[styles.soundName, isSelected && styles.soundNameSelected]}>
              {item.name}
            </Text>
            <Text style={styles.soundSubtext}>
              {isSelected ? 'Currently selected' : 'Tap to select'}
            </Text>
          </View>
          
          {isSelected && (
            <View style={styles.checkmark}>
              <Text style={styles.checkmarkText}>✓</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modal}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Select Alarm Sound</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Sound list */}
            <FlatList
              data={BUNDLED_SOUNDS}
              renderItem={renderSoundItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
            />

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                More sounds coming in future updates
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#666666',
  },
  listContent: {
    padding: 16,
  },
  soundItem: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#f8f8f8',
  },
  soundItemSelected: {
    backgroundColor: '#f3e5ff',
    borderColor: '#6200ee',
  },
  soundItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  soundName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  soundNameSelected: {
    color: '#6200ee',
  },
  soundSubtext: {
    fontSize: 14,
    color: '#666666',
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#6200ee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eeeeee',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999999',
    fontStyle: 'italic',
  },
});

