/**
 * Task Alarm App - Sound Constants
 * 
 * Bundled alarm sounds configuration
 */

import { BundledSound } from '../types/alarm.types';

/**
 * Bundled alarm sounds
 * Note: Sound files will be added in Phase 6
 * For now, using 'default' as a placeholder
 */
export const BUNDLED_SOUNDS: BundledSound[] = [
  {
    id: 'chimes',
    name: 'Chimes',
    uri: 'default', // Will be replaced with: require('../assets/sounds/chimes.mp3')
  },
  {
    id: 'radar',
    name: 'Radar',
    uri: 'default', // Will be replaced with: require('../assets/sounds/radar.mp3')
  },
  {
    id: 'bell',
    name: 'Bell',
    uri: 'default', // Will be replaced with: require('../assets/sounds/bell.mp3')
  },
  {
    id: 'rooster',
    name: 'Rooster',
    uri: 'default', // Will be replaced with: require('../assets/sounds/rooster.mp3')
  },
];

/**
 * Default sound ID
 */
export const DEFAULT_SOUND_ID = 'chimes';

/**
 * Get sound by ID
 */
export function getSoundById(id: string): BundledSound | undefined {
  return BUNDLED_SOUNDS.find(sound => sound.id === id);
}

/**
 * Get sound URI by ID
 */
export function getSoundUri(id: string): string {
  const sound = getSoundById(id);
  return sound ? sound.uri : 'default';
}

/**
 * Get sound name by ID
 */
export function getSoundName(id: string): string {
  const sound = getSoundById(id);
  return sound ? sound.name : 'Default';
}

