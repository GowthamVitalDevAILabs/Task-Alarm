/**
 * AlarmItem Component
 * 
 * Displays individual alarm in the alarm list.
 * Shows time, label, repeat days, and toggle switch.
 * Provides swipe or long-press actions for edit/delete.
 * 
 * Reference: Docs/ARCHITECTURE.md - Component Hierarchy
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';

// Types
import { Alarm, WeekDay } from '../types/alarm.types';

// Utils
import { formatAlarmTime, getAlarmDescription } from '../utils/timeCalculations';

// Constants
import { WEEK_DAYS } from '../constants/alarm.constants';

/**
 * AlarmItem Props
 */
interface AlarmItemProps {
  alarm: Alarm;
  onToggle: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

/**
 * AlarmItem Component
 */
export const AlarmItem: React.FC<AlarmItemProps> = React.memo(
  ({ alarm, onToggle, onEdit, onDelete }) => {
    /**
     * Handle toggle
     */
    const handleToggle = () => {
      onToggle(alarm.id);
    };

    /**
     * Handle edit
     */
    const handleEdit = () => {
      onEdit(alarm.id);
    };

    /**
     * Handle delete with confirmation
     */
    const handleDelete = () => {
      Alert.alert(
        'Delete Alarm',
        `Are you sure you want to delete "${alarm.label || 'this alarm'}"?`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => onDelete(alarm.id),
          },
        ]
      );
    };

    /**
     * Format time for display
     */
    const displayTime = formatAlarmTime(alarm.time, false);

    /**
     * Get alarm description (e.g., "Today at 7:30 AM")
     */
    const description = alarm.isEnabled ? getAlarmDescription(alarm) : 'Disabled';

    /**
     * Render repeat days
     */
    const renderRepeatDays = () => {
      if (alarm.repeats.length === 0) {
        return <Text style={styles.repeatText}>One-time alarm</Text>;
      }

      if (alarm.repeats.length === 7) {
        return <Text style={styles.repeatText}>Every day</Text>;
      }

      // Check for weekdays (Mon-Fri)
      const weekdays: WeekDay[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
      const isWeekdays =
        alarm.repeats.length === 5 &&
        weekdays.every((day) => alarm.repeats.includes(day));

      if (isWeekdays) {
        return <Text style={styles.repeatText}>Weekdays</Text>;
      }

      // Check for weekends
      const weekends: WeekDay[] = ['Sat', 'Sun'];
      const isWeekends =
        alarm.repeats.length === 2 &&
        weekends.every((day) => alarm.repeats.includes(day));

      if (isWeekends) {
        return <Text style={styles.repeatText}>Weekends</Text>;
      }

      // Show individual days
      return (
        <View style={styles.daysContainer}>
          {WEEK_DAYS.map((day) => {
            const isActive = alarm.repeats.includes(day);
            return (
              <View
                key={day}
                style={[
                  styles.dayBadge,
                  isActive && styles.dayBadgeActive,
                  !alarm.isEnabled && styles.dayBadgeDisabled,
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    isActive && styles.dayTextActive,
                    !alarm.isEnabled && styles.dayTextDisabled,
                  ]}
                >
                  {day.charAt(0)}
                </Text>
              </View>
            );
          })}
        </View>
      );
    };

    return (
      <TouchableOpacity
        style={[styles.container, !alarm.isEnabled && styles.containerDisabled]}
        onPress={handleEdit}
        onLongPress={handleDelete}
        activeOpacity={0.7}
      >
        <View style={styles.content}>
          {/* Left section: Time and details */}
          <View style={styles.leftSection}>
            <Text style={[styles.time, !alarm.isEnabled && styles.timeDisabled]}>
              {displayTime}
            </Text>
            
            {alarm.label && (
              <Text style={[styles.label, !alarm.isEnabled && styles.labelDisabled]}>
                {alarm.label}
              </Text>
            )}
            
            {alarm.description && (
              <Text
                style={[styles.description, !alarm.isEnabled && styles.descriptionDisabled]}
                numberOfLines={1}
              >
                {alarm.description}
              </Text>
            )}
            
            {renderRepeatDays()}
            
            {alarm.isEnabled && (
              <Text style={styles.nextTrigger}>{description}</Text>
            )}
          </View>

          {/* Right section: Toggle switch */}
          <View style={styles.rightSection}>
            <Switch
              value={alarm.isEnabled}
              onValueChange={handleToggle}
              trackColor={{ false: '#d1d1d1', true: '#bb86fc' }}
              thumbColor={alarm.isEnabled ? '#6200ee' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Snooze indicator */}
        {alarm.snoozeEnabled && (
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              💤 Snooze: {alarm.snoozeDuration} min
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }
);

AlarmItem.displayName = 'AlarmItem';

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  containerDisabled: {
    opacity: 0.6,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  leftSection: {
    flex: 1,
    marginRight: 16,
  },
  rightSection: {
    justifyContent: 'center',
  },
  time: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  timeDisabled: {
    color: '#999999',
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 2,
  },
  labelDisabled: {
    color: '#999999',
  },
  description: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  descriptionDisabled: {
    color: '#aaaaaa',
  },
  repeatText: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  daysContainer: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 4,
  },
  dayBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayBadgeActive: {
    backgroundColor: '#6200ee',
  },
  dayBadgeDisabled: {
    backgroundColor: '#f0f0f0',
  },
  dayText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999999',
  },
  dayTextActive: {
    color: '#ffffff',
  },
  dayTextDisabled: {
    color: '#cccccc',
  },
  nextTrigger: {
    fontSize: 12,
    color: '#6200ee',
    marginTop: 8,
    fontWeight: '500',
  },
  footer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eeeeee',
  },
  footerText: {
    fontSize: 12,
    color: '#666666',
  },
});

