/**
 * Spatial Guidance Utility
 * Provides audio and haptic guidance for object finding
 */

export interface SpatialGuidance {
  direction: 'left' | 'right' | 'center' | 'ahead' | 'behind' | 'up' | 'down';
  distance: number; // in feet or meters
  instruction: string;
}

/**
 * Generate spatial guidance instructions
 */
export function generateSpatialGuidance(
  objectLocation: string,
  userPosition: string = 'center'
): SpatialGuidance {
  const lowerLocation = objectLocation.toLowerCase();
  
  // Determine direction
  let direction: SpatialGuidance['direction'] = 'center';
  if (lowerLocation.includes('left')) {
    direction = 'left';
  } else if (lowerLocation.includes('right')) {
    direction = 'right';
  } else if (lowerLocation.includes('ahead') || lowerLocation.includes('front') || lowerLocation.includes('forward')) {
    direction = 'ahead';
  } else if (lowerLocation.includes('behind') || lowerLocation.includes('back')) {
    direction = 'behind';
  } else if (lowerLocation.includes('up') || lowerLocation.includes('above')) {
    direction = 'up';
  } else if (lowerLocation.includes('down') || lowerLocation.includes('below')) {
    direction = 'down';
  }
  
  // Extract distance
  const distanceMatch = lowerLocation.match(/(\d+(?:\.\d+)?)\s*(?:feet|ft|meters?|m)/);
  const distance = distanceMatch ? parseFloat(distanceMatch[1]) : 0;
  
  // Generate instruction
  let instruction = '';
  if (direction === 'left') {
    instruction = `Turn left and look ${distance > 0 ? `${distance} feet` : ''} to your left`;
  } else if (direction === 'right') {
    instruction = `Turn right and look ${distance > 0 ? `${distance} feet` : ''} to your right`;
  } else if (direction === 'ahead') {
    instruction = `Look straight ahead${distance > 0 ? `, about ${distance} feet away` : ''}`;
  } else if (direction === 'behind') {
    instruction = `Turn around and look behind you${distance > 0 ? `, about ${distance} feet away` : ''}`;
  } else if (direction === 'up') {
    instruction = `Look up${distance > 0 ? `, about ${distance} feet above` : ''}`;
  } else if (direction === 'down') {
    instruction = `Look down${distance > 0 ? `, about ${distance} feet below` : ''}`;
  } else {
    instruction = `Look around you${distance > 0 ? `, within ${distance} feet` : ''}`;
  }
  
  return {
    direction,
    distance,
    instruction,
  };
}

/**
 * Provide haptic feedback (vibration) for guidance
 */
export function provideHapticFeedback(direction: SpatialGuidance['direction']) {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    const patterns: { [key: string]: number[] } = {
      left: [100, 50, 100], // Short-long-short
      right: [50, 100, 50, 100], // Long-short-long-short
      center: [100, 100, 100], // Three short
      ahead: [200], // One long
      behind: [100, 100], // Two short
      up: [50, 50, 50, 50], // Four very short
      down: [150, 50, 150], // Long-short-long
    };
    
    const pattern = patterns[direction] || [100];
    navigator.vibrate(pattern);
  }
}

/**
 * Speak spatial guidance
 */
export function speakSpatialGuidance(guidance: SpatialGuidance) {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(guidance.instruction);
    utterance.rate = 1.0;
    utterance.volume = 1.0;
    synth.speak(utterance);
    
    // Provide haptic feedback
    provideHapticFeedback(guidance.direction);
  }
}

