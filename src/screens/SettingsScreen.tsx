/**
 * SettingsScreen - App Settings Screen
 * 
 * Displays app settings including default snooze duration,
 * default sound, battery optimization warnings, and app info.
 * 
 * Reference: Docs/ARCHITECTURE.md - Screen Components
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Linking,
} from 'react-native';

// Services
import { StorageService } from '../services/StorageService';

// Components
import { SoundPicker } from '../components/SoundPicker';

// Constants
import { DEFAULT_SETTINGS, MIN_SNOOZE_DURATION, MAX_SNOOZE_DURATION } from '../constants/alarm.constants';
import { getSoundName } from '../constants/sounds';

// Types
import { AppSettings } from '../types/alarm.types';

/**
 * SettingsScreen Component
 */
export const SettingsScreen: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [showSoundPicker, setShowSoundPicker] = useState(false);

  /**
   * Load settings on mount
   */
  useEffect(() => {
    loadSettings();
  }, []);

  /**
   * Load settings from storage
   */
  const loadSettings = async () => {
    try {
      const storedSettings = await StorageService.getSettings();
      setSettings(storedSettings);
    } catch (error) {
      console.error('[SettingsScreen] Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Save settings to storage
   */
  const saveSettings = async (newSettings: Partial<AppSettings>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      await StorageService.saveSettings(updatedSettings);
      setSettings(updatedSettings);
    } catch (error) {
      console.error('[SettingsScreen] Failed to save settings:', error);
      Alert.alert('Error', 'Failed to save settings');
    }
  };

  /**
   * Handle default snooze duration change
   */
  const handleSnoozeDurationChange = (duration: number) => {
    if (duration < MIN_SNOOZE_DURATION || duration > MAX_SNOOZE_DURATION) {
      Alert.alert('Invalid Duration', `Please select a duration between ${MIN_SNOOZE_DURATION} and ${MAX_SNOOZE_DURATION} minutes`);
      return;
    }
    saveSettings({ defaultSnoozeDuration: duration });
  };

  /**
   * Handle default sound change
   */
  const handleSoundChange = (soundId: string) => {
    saveSettings({ defaultSound: soundId });
  };

  /**
   * Open battery optimization settings
   */
  const openBatterySettings = () => {
    Alert.alert(
      'Battery Optimization',
      'For alarms to work reliably, please disable battery optimization for this app in your device settings.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Open Settings',
          onPress: () => {
            // This is a simplified approach
            // In production, you'd use expo-intent-launcher or custom native module
            Linking.openSettings();
          },
        },
      ]
    );
  };

  /**
   * Mark battery optimization warning as seen
   */
  const handleBatteryWarningDismiss = () => {
    saveSettings({ batteryOptimizationWarned: true });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading settings...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Battery Optimization Warning */}
      {!settings.batteryOptimizationWarned && (
        <View style={styles.warningBanner}>
          <Text style={styles.warningTitle}>⚠️ Important</Text>
          <Text style={styles.warningText}>
            For alarms to work reliably, please disable battery optimization for this app.
          </Text>
          <View style={styles.warningButtons}>
            <TouchableOpacity
              style={styles.warningButton}
              onPress={openBatterySettings}
            >
              <Text style={styles.warningButtonText}>Open Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.warningButton, styles.warningButtonSecondary]}
              onPress={handleBatteryWarningDismiss}
            >
              <Text style={styles.warningButtonTextSecondary}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Default Settings Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Default Settings</Text>

        {/* Default Snooze Duration */}
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Default Snooze Duration</Text>
          <Text style={styles.settingDescription}>
            Default snooze time for new alarms
          </Text>
          <View style={styles.durationButtons}>
            {[5, 10, 15, 20, 30].map((duration) => (
              <TouchableOpacity
                key={duration}
                style={[
                  styles.durationButton,
                  settings.defaultSnoozeDuration === duration && styles.durationButtonActive,
                ]}
                onPress={() => handleSnoozeDurationChange(duration)}
              >
                <Text
                  style={[
                    styles.durationButtonText,
                    settings.defaultSnoozeDuration === duration && styles.durationButtonTextActive,
                  ]}
                >
                  {duration} min
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Default Sound */}
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Default Alarm Sound</Text>
          <Text style={styles.settingDescription}>
            Default sound for new alarms
          </Text>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowSoundPicker(true)}
          >
            <Text style={styles.pickerButtonText}>{getSoundName(settings.defaultSound)}</Text>
            <Text style={styles.pickerButtonIcon}>›</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* System Settings Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>System</Text>

        <TouchableOpacity style={styles.settingItem} onPress={openBatterySettings}>
          <Text style={styles.settingLabel}>Battery Optimization</Text>
          <Text style={styles.settingDescription}>
            Manage battery settings for reliable alarms
          </Text>
          <Text style={styles.linkText}>Open Settings ›</Text>
        </TouchableOpacity>
      </View>

      {/* About Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Task Alarm App</Text>
          <Text style={styles.settingDescription}>Version 1.0.0</Text>
          <Text style={styles.aboutText}>
            A powerful and customizable alarm application built with React Native and Expo.
          </Text>
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Features</Text>
          <Text style={styles.featureText}>✓ Repeating alarms</Text>
          <Text style={styles.featureText}>✓ Customizable snooze duration</Text>
          <Text style={styles.featureText}>✓ Multiple alarm sounds</Text>
          <Text style={styles.featureText}>✓ High-priority notifications</Text>
          <Text style={styles.featureText}>✓ Do Not Disturb bypass</Text>
        </View>
      </View>

      {/* Developer Info */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Built with ❤️ using React Native
        </Text>
        <Text style={styles.footerText}>
          VitalDevAILabs © 2025
        </Text>
      </View>

      {/* Sound Picker Modal */}
      <SoundPicker
        visible={showSoundPicker}
        selectedSound={settings.defaultSound}
        onSoundSelect={handleSoundChange}
        onClose={() => setShowSoundPicker(false)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  warningBanner: {
    backgroundColor: '#fff3cd',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ff9800',
  },
  warningTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
    lineHeight: 20,
  },
  warningButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  warningButton: {
    flex: 1,
    backgroundColor: '#ff9800',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  warningButtonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ff9800',
  },
  warningButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  warningButtonTextSecondary: {
    color: '#ff9800',
    fontWeight: '600',
    fontSize: 14,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  settingItem: {
    marginBottom: 24,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 12,
  },
  durationButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  durationButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f8f8f8',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#f8f8f8',
  },
  durationButtonActive: {
    backgroundColor: '#f3e5ff',
    borderColor: '#6200ee',
  },
  durationButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  durationButtonTextActive: {
    color: '#6200ee',
  },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 16,
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#333333',
  },
  pickerButtonIcon: {
    fontSize: 24,
    color: '#666666',
  },
  linkText: {
    fontSize: 14,
    color: '#6200ee',
    fontWeight: '500',
    marginTop: 8,
  },
  aboutText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginTop: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#666666',
    marginTop: 6,
    lineHeight: 20,
  },
  footer: {
    alignItems: 'center',
    marginTop: 16,
  },
  footerText: {
    fontSize: 12,
    color: '#999999',
    marginTop: 4,
  },
});

