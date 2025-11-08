/**
 * Access Methods Utility
 * Handles alternative input methods for AAC users
 */

export type AccessMethod = 'touch' | 'switch' | 'scanning' | 'eye-tracking';

export interface ScanningState {
  currentIndex: number;
  isActive: boolean;
  items: any[];
  intervalId: NodeJS.Timeout | null;
}

/**
 * Initialize scanning mode
 */
export function initializeScanning(
  items: any[],
  onSelect: (item: any, index: number) => void,
  speed: number = 1000
): ScanningState {
  let currentIndex = 0;
  let intervalId: NodeJS.Timeout | null = null;
  
  const start = () => {
    if (intervalId) {
      clearInterval(intervalId);
    }
    
    intervalId = setInterval(() => {
      // Highlight current item
      currentIndex = (currentIndex + 1) % items.length;
      
      // Visual feedback (in production, this would highlight UI elements)
      if (typeof document !== 'undefined') {
        // Remove previous highlights
        document.querySelectorAll('.scanning-highlight').forEach((el) => {
          el.classList.remove('scanning-highlight');
        });
        
        // Highlight current item
        const currentElement = document.querySelector(`[data-scan-index="${currentIndex}"]`);
        if (currentElement) {
          currentElement.classList.add('scanning-highlight');
        }
      }
    }, speed);
  };
  
  const stop = () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };
  
  const select = () => {
    if (items[currentIndex]) {
      onSelect(items[currentIndex], currentIndex);
    }
  };
  
  return {
    currentIndex,
    isActive: false,
    items,
    intervalId: null,
  };
}

/**
 * Handle switch input
 */
export function handleSwitchInput(
  callback: () => void,
  debounceMs: number = 300
): () => void {
  let lastCall = 0;
  
  return () => {
    const now = Date.now();
    if (now - lastCall > debounceMs) {
      lastCall = now;
      callback();
    }
  };
}

/**
 * Check if eye tracking is available
 */
export function isEyeTrackingAvailable(): boolean {
  // In production, check for eye tracking API support
  return typeof window !== 'undefined' && 'EyeDropper' in window; // Placeholder check
}

/**
 * Initialize eye tracking (placeholder)
 */
export function initializeEyeTracking(
  onSelect: (x: number, y: number) => void
): () => void {
  // In production, integrate with actual eye tracking API
  // For now, return cleanup function
  return () => {};
}

