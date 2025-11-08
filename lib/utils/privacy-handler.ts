/**
 * Privacy Handler Utility
 * Ensures privacy-first design with per-user settings
 * Defaults to privacy-preserving (opt-in for sensitive features)
 */

export interface PrivacySettings {
  // Image storage
  storeImages: boolean; // Default: false - don't store images by default
  storeImageHistory: boolean; // Default: false
  
  // Transcript storage
  storeTranscripts: boolean; // Default: false - don't store transcripts by default
  storeTranscriptHistory: boolean; // Default: false
  
  // History storage
  storeHistory: boolean; // Default: false - don't store history by default
  autoDeleteHistory: boolean; // Default: true - auto-delete after session
  historyRetentionDays: number; // Default: 0 - don't retain history
  
  // Person detection (opt-in)
  personDetectionEnabled: boolean; // Default: false - opt-in required
  trustedPeopleSavingEnabled: boolean; // Default: false - opt-in required
  
  // Data sharing
  shareAnalytics: boolean; // Default: false - no analytics by default
  shareErrorReports: boolean; // Default: false - no error reports by default
}

const DEFAULT_PRIVACY_SETTINGS: PrivacySettings = {
  storeImages: false,
  storeImageHistory: false,
  storeTranscripts: false,
  storeTranscriptHistory: false,
  storeHistory: false,
  autoDeleteHistory: true,
  historyRetentionDays: 0,
  personDetectionEnabled: false,
  trustedPeopleSavingEnabled: false,
  shareAnalytics: false,
  shareErrorReports: false,
};

const PRIVACY_SETTINGS_KEY = 'inclusiaid-privacy-settings';

/**
 * Get privacy settings (defaults to privacy-preserving)
 */
export function getPrivacySettings(): PrivacySettings {
  if (typeof window === 'undefined') return DEFAULT_PRIVACY_SETTINGS;
  
  try {
    const stored = localStorage.getItem(PRIVACY_SETTINGS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with defaults to ensure all fields exist
      return { ...DEFAULT_PRIVACY_SETTINGS, ...parsed };
    }
  } catch (error) {
    console.error('Error reading privacy settings:', error);
  }
  
  return DEFAULT_PRIVACY_SETTINGS;
}

/**
 * Update privacy settings
 */
export function updatePrivacySettings(settings: Partial<PrivacySettings>): void {
  if (typeof window === 'undefined') return;
  
  try {
    const current = getPrivacySettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(PRIVACY_SETTINGS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error updating privacy settings:', error);
  }
}

/**
 * Reset privacy settings to defaults
 */
export function resetPrivacySettings(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(PRIVACY_SETTINGS_KEY, JSON.stringify(DEFAULT_PRIVACY_SETTINGS));
  } catch (error) {
    console.error('Error resetting privacy settings:', error);
  }
}

/**
 * Check if images should be stored
 */
export function shouldStoreImages(): boolean {
  return getPrivacySettings().storeImages;
}

/**
 * Check if transcripts should be stored
 */
export function shouldStoreTranscripts(): boolean {
  return getPrivacySettings().storeTranscripts;
}

/**
 * Check if history should be stored
 */
export function shouldStoreHistory(): boolean {
  return getPrivacySettings().storeHistory;
}

/**
 * Check if person detection is enabled (opt-in)
 */
export function isPersonDetectionEnabled(): boolean {
  return getPrivacySettings().personDetectionEnabled;
}

/**
 * Enable person detection (opt-in)
 */
export function enablePersonDetection(): void {
  updatePrivacySettings({ personDetectionEnabled: true });
}

/**
 * Disable person detection
 */
export function disablePersonDetection(): void {
  updatePrivacySettings({ personDetectionEnabled: false });
}

/**
 * Check if trusted people saving is enabled
 */
export function isTrustedPeopleSavingEnabled(): boolean {
  return getPrivacySettings().trustedPeopleSavingEnabled;
}

/**
 * Enable trusted people saving (opt-in)
 */
export function enableTrustedPeopleSaving(): void {
  updatePrivacySettings({ trustedPeopleSavingEnabled: true });
}

/**
 * Disable trusted people saving
 */
export function disableTrustedPeopleSaving(): void {
  updatePrivacySettings({ trustedPeopleSavingEnabled: false });
}

/**
 * Encrypt sensitive data (simple base64 encoding for demo - use proper encryption in production)
 * In production, use Web Crypto API for proper encryption
 */
export function encryptData(data: string): string {
  // In production, use proper encryption (Web Crypto API)
  // For demo, use base64 encoding
  return btoa(data);
}

/**
 * Decrypt sensitive data
 */
export function decryptData(encrypted: string): string {
  // In production, use proper decryption
  // For demo, use base64 decoding
  try {
    return atob(encrypted);
  } catch {
    return '';
  }
}

/**
 * Check if data should be auto-deleted
 */
export function shouldAutoDeleteHistory(): boolean {
  return getPrivacySettings().autoDeleteHistory;
}

/**
 * Get history retention period in days
 */
export function getHistoryRetentionDays(): number {
  return getPrivacySettings().historyRetentionDays;
}

