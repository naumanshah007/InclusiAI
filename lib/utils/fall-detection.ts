/**
 * Fall Detection Utility
 * Prepares for fall detection using device sensors
 */

/**
 * Check if device motion API is available
 */
export function isDeviceMotionAvailable(): boolean {
  return typeof window !== 'undefined' && 'DeviceMotionEvent' in window;
}

/**
 * Check if device orientation API is available
 */
export function isDeviceOrientationAvailable(): boolean {
  return typeof window !== 'undefined' && 'DeviceOrientationEvent' in window;
}

/**
 * Initialize fall detection (requires user permission)
 */
export function initializeFallDetection(
  onFallDetected: () => void,
  onError?: (error: Error) => void
): () => void {
  if (!isDeviceMotionAvailable()) {
    if (onError) {
      onError(new Error('Device motion API not available'));
    }
    return () => {}; // No-op cleanup
  }

  let lastAcceleration: { x: number; y: number; z: number } | null = null;
  let fallThreshold = 2.5; // g-force threshold for fall detection
  let isMonitoring = true;

  const handleMotion = (event: DeviceMotionEvent) => {
    if (!isMonitoring) return;

    const acceleration = event.accelerationIncludingGravity;
    if (!acceleration) return;

    const currentAccel = {
      x: acceleration.x || 0,
      y: acceleration.y || 0,
      z: acceleration.z || 0,
    };

    if (lastAcceleration) {
      // Calculate change in acceleration
      const deltaX = Math.abs(currentAccel.x - lastAcceleration.x);
      const deltaY = Math.abs(currentAccel.y - lastAcceleration.y);
      const deltaZ = Math.abs(currentAccel.z - lastAcceleration.z);
      
      const totalDelta = Math.sqrt(deltaX ** 2 + deltaY ** 2 + deltaZ ** 2);
      
      // Check if acceleration change exceeds threshold (potential fall)
      if (totalDelta > fallThreshold) {
        // Additional check: verify device is in horizontal position (lying down)
        const magnitude = Math.sqrt(
          currentAccel.x ** 2 + currentAccel.y ** 2 + currentAccel.z ** 2
        );
        
        // If device is horizontal (magnitude close to 1g) and there was a sudden change
        if (magnitude < 1.5 && magnitude > 0.5) {
          onFallDetected();
        }
      }
    }

    lastAcceleration = currentAccel;
  };

  // Request permission (iOS 13+)
  if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
    (DeviceMotionEvent as any)
      .requestPermission()
      .then((permission: string) => {
        if (permission === 'granted') {
          window.addEventListener('devicemotion', handleMotion);
        } else if (onError) {
          onError(new Error('Device motion permission denied'));
        }
      })
      .catch((error: Error) => {
        if (onError) {
          onError(error);
        }
      });
  } else {
    // Android or older iOS
    window.addEventListener('devicemotion', handleMotion);
  }

  // Cleanup function
  return () => {
    isMonitoring = false;
    window.removeEventListener('devicemotion', handleMotion);
  };
}

/**
 * Check if fall detection is enabled
 */
export function isFallDetectionEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('fall-detection-enabled') === 'true';
}

/**
 * Enable fall detection
 */
export function enableFallDetection(): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('fall-detection-enabled', 'true');
  }
}

/**
 * Disable fall detection
 */
export function disableFallDetection(): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('fall-detection-enabled', 'false');
  }
}

