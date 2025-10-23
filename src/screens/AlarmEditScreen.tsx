/**
 * AlarmEditScreen - Create/Edit Alarm Screen
 * 
 * Form for creating new alarms or editing existing ones.
 * Includes time picker, label input, repeat selector, sound picker, and snooze settings.
 * 
 * Reference: Docs/ARCHITECTURE.md - Screen Components
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import DateTimePicker from '@react-native-community/datetimepicker';

// Hooks
import { useAlarms } from '../hooks';

// Components
import { WeekDayPicker } from '../components/WeekDayPicker';
import { SoundPicker } from '../components/SoundPicker';

// Types
import { RootStackParamList, WeekDay, AlarmInput } from '../types/alarm.types';

// Constants
import { DEFAULT_SNOOZE_DURATION } from '../constants/alarm.constants';
import { DEFAULT_SOUND_ID, getSoundName } from '../constants/sounds';

// Utils
import { formatDateToTime, getCurrentTimeString } from '../utils/timeCalculations';

type Props = NativeStackScreenProps<RootStackParamList, 'AlarmEdit'>;

/**
 * AlarmEditScreen Component
 */
export const AlarmEditScreen: React.FC<Props> = ({ route, navigation }) => {
  const { alarmId, mode } = route.params || {};
  const { alarms, addAlarm, updateAlarm } = useAlarms();
  
  // Find existing alarm if editing
  const existingAlarm = alarmId ? alarms.find((a) => a.id === alarmId) : undefined;

  // Form state
  const [time, setTime] = useState<string>(existingAlarm?.time || getCurrentTimeString());
  const [label, setLabel] = useState(existingAlarm?.label || '');
  const [description, setDescription] = useState(existingAlarm?.description || '');
  const [repeats, setRepeats] = useState<WeekDay[]>(existingAlarm?.repeats || []);
  const [soundUri, setSoundUri] = useState(existingAlarm?.soundUri || DEFAULT_SOUND_ID);
  const [snoozeEnabled, setSnoozeEnabled] = useState(
    existingAlarm?.snoozeEnabled ?? true
  );
  const [snoozeDuration, setSnoozeDuration] = useState(
    existingAlarm?.snoozeDuration || DEFAULT_SNOOZE_DURATION
  );
  const [isEnabled, setIsEnabled] = useState(existingAlarm?.isEnabled ?? true);

  // Time picker state
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [pickerDate, setPickerDate] = useState(() => {
    if (existingAlarm?.time) {
      const [hours, minutes] = existingAlarm.time.split(':').map(Number);
      const date = new Date();
      date.setHours(hours, minutes, 0, 0);
      return date;
    }
    return new Date();
  });

  // Sound picker state
  const [showSoundPicker, setShowSoundPicker] = useState(false);

  // Saving state
  const [isSaving, setIsSaving] = useState(false);

  /**
   * Handle time change from picker
   */
  const handleTimeChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }

    if (selectedDate) {
      setPickerDate(selectedDate);
      const timeString = formatDateToTime(selectedDate);
      setTime(timeString);
    }
  };

  /**
   * Show time picker
   */
  const handleShowTimePicker = () => {
    setShowTimePicker(true);
  };

  /**
   * Handle save
   */
  const handleSave = async () => {
    try {
      // Validation
      if (!time) {
        Alert.alert('Error', 'Please set a time for the alarm');
        return;
      }

      if (label.trim().length === 0) {
        Alert.alert('Error', 'Please enter a label for the alarm');
        return;
      }

      setIsSaving(true);

      const alarmData: AlarmInput = {
        label: label.trim(),
        description: description.trim(),
        time,
        repeats,
        isEnabled,
        soundUri,
        snoozeEnabled,
        snoozeDuration,
      };

      if (mode === 'edit' && alarmId) {
        // Update existing alarm
        await updateAlarm(alarmId, alarmData);
      } else {
        // Create new alarm
        await addAlarm(alarmData);
      }

      // Navigate back
      navigation.goBack();
    } catch (error) {
      console.error('[AlarmEditScreen] Error saving alarm:', error);
      Alert.alert('Error', 'Failed to save alarm. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Handle cancel
   */
  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Time Picker Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Time</Text>
        <TouchableOpacity style={styles.timeButton} onPress={handleShowTimePicker}>
          <Text style={styles.timeButtonText}>{time}</Text>
        </TouchableOpacity>
        
        {showTimePicker && (
          <DateTimePicker
            value={pickerDate}
            mode="time"
            is24Hour={false}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleTimeChange}
          />
        )}
      </View>

      {/* Label Input */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Label</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Morning Alarm"
          value={label}
          onChangeText={setLabel}
          maxLength={50}
        />
      </View>

      {/* Description Input */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description (Optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="e.g., Time to wake up!"
          value={description}
          onChangeText={setDescription}
          maxLength={200}
          multiline
          numberOfLines={3}
        />
      </View>

      {/* Repeat Days */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Repeat</Text>
        <WeekDayPicker selectedDays={repeats} onDaysChange={setRepeats} />
      </View>

      {/* Sound Picker */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sound</Text>
        <TouchableOpacity
          style={styles.pickerButton}
          onPress={() => setShowSoundPicker(true)}
        >
          <Text style={styles.pickerButtonText}>{getSoundName(soundUri)}</Text>
          <Text style={styles.pickerButtonIcon}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Snooze Settings */}
      <View style={styles.section}>
        <View style={styles.switchRow}>
          <Text style={styles.sectionTitle}>Enable Snooze</Text>
          <Switch
            value={snoozeEnabled}
            onValueChange={setSnoozeEnabled}
            trackColor={{ false: '#d1d1d1', true: '#bb86fc' }}
            thumbColor={snoozeEnabled ? '#6200ee' : '#f4f3f4'}
          />
        </View>

        {snoozeEnabled && (
          <View style={styles.durationContainer}>
            <Text style={styles.label}>Snooze Duration (minutes)</Text>
            <View style={styles.durationButtons}>
              {[5, 10, 15, 20, 30].map((duration) => (
                <TouchableOpacity
                  key={duration}
                  style={[
                    styles.durationButton,
                    snoozeDuration === duration && styles.durationButtonActive,
                  ]}
                  onPress={() => setSnoozeDuration(duration)}
                >
                  <Text
                    style={[
                      styles.durationButtonText,
                      snoozeDuration === duration && styles.durationButtonTextActive,
                    ]}
                  >
                    {duration}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* Enable Alarm Toggle */}
      <View style={styles.section}>
        <View style={styles.switchRow}>
          <Text style={styles.sectionTitle}>Alarm Enabled</Text>
          <Switch
            value={isEnabled}
            onValueChange={setIsEnabled}
            trackColor={{ false: '#d1d1d1', true: '#bb86fc' }}
            thumbColor={isEnabled ? '#6200ee' : '#f4f3f4'}
          />
        </View>
        <Text style={styles.helperText}>
          {isEnabled
            ? 'Alarm will trigger at the specified time'
            : 'Alarm is disabled and will not trigger'}
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={handleCancel}
          disabled={isSaving}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.saveButton, isSaving && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={isSaving}
        >
          <Text style={styles.saveButtonText}>
            {isSaving ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sound Picker Modal */}
      <SoundPicker
        visible={showSoundPicker}
        selectedSound={soundUri}
        onSoundSelect={setSoundUri}
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
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  timeButton: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#6200ee',
  },
  timeButtonText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#6200ee',
  },
  input: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333333',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
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
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  durationContainer: {
    marginTop: 16,
  },
  label: {
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
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
  },
  durationButtonTextActive: {
    color: '#6200ee',
  },
  helperText: {
    fontSize: 12,
    color: '#666666',
    marginTop: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#e0e0e0',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  saveButton: {
    backgroundColor: '#6200ee',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});

