/**
 * WeekDayPicker Component
 * 
 * Reusable component for selecting days of the week.
 * Displays 7 toggle buttons for each day.
 * 
 * Reference: Docs/ARCHITECTURE.md - Component Hierarchy
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

// Types
import { WeekDay } from '../types/alarm.types';

// Constants
import { WEEK_DAYS } from '../constants/alarm.constants';

/**
 * WeekDayPicker Props
 */
interface WeekDayPickerProps {
  selectedDays: WeekDay[];
  onDaysChange: (days: WeekDay[]) => void;
}

/**
 * WeekDayPicker Component
 */
export const WeekDayPicker: React.FC<WeekDayPickerProps> = ({
  selectedDays,
  onDaysChange,
}) => {
  /**
   * Toggle day selection
   */
  const toggleDay = (day: WeekDay) => {
    if (selectedDays.includes(day)) {
      // Remove day
      onDaysChange(selectedDays.filter((d) => d !== day));
    } else {
      // Add day
      onDaysChange([...selectedDays, day]);
    }
  };

  /**
   * Quick select all days
   */
  const selectAllDays = () => {
    onDaysChange([...WEEK_DAYS]);
  };

  /**
   * Quick select weekdays (Mon-Fri)
   */
  const selectWeekdays = () => {
    onDaysChange(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  };

  /**
   * Quick select weekends (Sat-Sun)
   */
  const selectWeekends = () => {
    onDaysChange(['Sat', 'Sun']);
  };

  /**
   * Clear all selections
   */
  const clearSelection = () => {
    onDaysChange([]);
  };

  return (
    <View style={styles.container}>
      {/* Day buttons */}
      <View style={styles.daysContainer}>
        {WEEK_DAYS.map((day) => {
          const isSelected = selectedDays.includes(day);
          return (
            <TouchableOpacity
              key={day}
              style={[styles.dayButton, isSelected && styles.dayButtonSelected]}
              onPress={() => toggleDay(day)}
              activeOpacity={0.7}
            >
              <Text style={[styles.dayText, isSelected && styles.dayTextSelected]}>
                {day}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Quick selection buttons */}
      <View style={styles.quickSelectContainer}>
        <TouchableOpacity style={styles.quickButton} onPress={selectWeekdays}>
          <Text style={styles.quickButtonText}>Weekdays</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.quickButton} onPress={selectWeekends}>
          <Text style={styles.quickButtonText}>Weekends</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.quickButton} onPress={selectAllDays}>
          <Text style={styles.quickButtonText}>Every Day</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.quickButton} onPress={clearSelection}>
          <Text style={styles.quickButtonText}>Clear</Text>
        </TouchableOpacity>
      </View>

      {/* Selection info */}
      <Text style={styles.infoText}>
        {selectedDays.length === 0
          ? 'One-time alarm (select days to repeat)'
          : `Repeats on ${selectedDays.length} day${selectedDays.length > 1 ? 's' : ''}`}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
  },
  dayButton: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#f0f0f0',
  },
  dayButtonSelected: {
    backgroundColor: '#6200ee',
    borderColor: '#6200ee',
  },
  dayText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  dayTextSelected: {
    color: '#ffffff',
  },
  quickSelectContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 8,
  },
  quickButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#e8e8e8',
    alignItems: 'center',
  },
  quickButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333333',
  },
  infoText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginTop: 8,
  },
});

