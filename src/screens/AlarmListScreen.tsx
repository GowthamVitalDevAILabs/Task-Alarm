/**
 * AlarmListScreen - Main Screen
 * 
 * Displays list of all alarms with ability to toggle, edit, and delete.
 * Includes floating action button to create new alarms.
 * 
 * Reference: Docs/ARCHITECTURE.md - Screen Components
 */

import React from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';

// Hooks
import { useAlarms } from '../hooks';

// Components
import { AlarmItem } from '../components/AlarmItem';

// Types
import { RootStackParamList, Alarm } from '../types/alarm.types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'AlarmList'>;

/**
 * AlarmListScreen Component
 */
export const AlarmListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { alarms, loading, error, toggleAlarm, deleteAlarm, refreshAlarms } = useAlarms();
  const [refreshing, setRefreshing] = React.useState(false);

  /**
   * Navigate to settings
   */
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate('Settings')}
          style={styles.settingsButton}
        >
          <Text style={styles.settingsButtonText}>⚙️</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  /**
   * Handle refresh
   */
  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshAlarms();
    setRefreshing(false);
  };

  /**
   * Handle alarm toggle
   */
  const handleToggle = async (id: string) => {
    try {
      await toggleAlarm(id);
    } catch (error) {
      console.error('[AlarmListScreen] Failed to toggle alarm:', error);
    }
  };

  /**
   * Handle alarm delete
   */
  const handleDelete = async (id: string) => {
    try {
      await deleteAlarm(id);
    } catch (error) {
      console.error('[AlarmListScreen] Failed to delete alarm:', error);
    }
  };

  /**
   * Handle alarm edit
   */
  const handleEdit = (id: string) => {
    navigation.navigate('AlarmEdit', { alarmId: id, mode: 'edit' });
  };

  /**
   * Handle create new alarm
   */
  const handleCreateAlarm = () => {
    navigation.navigate('AlarmEdit', { mode: 'create' });
  };

  /**
   * Render alarm item
   */
  const renderAlarmItem = ({ item }: { item: Alarm }) => (
    <AlarmItem
      alarm={item}
      onToggle={handleToggle}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  );

  /**
   * Render empty state
   */
  const renderEmptyState = () => {
    if (loading) {
      return null;
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>⏰</Text>
        <Text style={styles.emptyTitle}>No Alarms Yet</Text>
        <Text style={styles.emptyMessage}>
          Tap the + button below to create your first alarm
        </Text>
      </View>
    );
  };

  /**
   * Render error state
   */
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  /**
   * Render loading state
   */
  if (loading && alarms.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Loading alarms...</Text>
      </View>
    );
  }

  /**
   * Render alarm list
   */
  return (
    <View style={styles.container}>
      <FlatList
        data={alarms}
        renderItem={renderAlarmItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#6200ee']}
          />
        }
      />
      
      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleCreateAlarm}
        activeOpacity={0.8}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContent: {
    padding: 16,
    paddingBottom: 80, // Space for FAB
  },
  settingsButton: {
    marginRight: 8,
    padding: 8,
  },
  settingsButtonText: {
    fontSize: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 32,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#6200ee',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6200ee',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabIcon: {
    fontSize: 32,
    color: '#ffffff',
    fontWeight: 'bold',
  },
});

