/**
 * Sound Classification Utility
 * Classifies sounds for DHH users using AI
 */

import type { SoundType } from '@/lib/store/sound-awareness-store';

export interface SoundClassificationResult {
  type: SoundType;
  confidence: number;
  label: string;
}

/**
 * Classify sound using AI (placeholder - in production, use proper audio classification)
 */
export async function classifySound(
  audioData: string | Blob,
  aiProvider: (prompt: string, audio?: string | Blob) => Promise<string>
): Promise<SoundClassificationResult | null> {
  try {
    // In production, this would use proper audio classification
    // For now, we'll use a text-based prompt approach
    const prompt = `Analyze this audio and classify the sound. Return ONLY one of these types:
- doorbell
- knock
- name-call
- baby-cry
- alarm
- timer
- smoke-alarm
- fire-alarm
- co-alarm
- siren
- honk
- glass-breaking
- phone-ring
- notification
- other

Format: TYPE|CONFIDENCE|LABEL
Example: doorbell|0.85|Doorbell ringing`;

    const result = await aiProvider(prompt, typeof audioData === 'string' ? undefined : audioData);
    
    // Parse result
    const parts = result.split('|');
    if (parts.length >= 3) {
      const type = parts[0].trim().toLowerCase() as SoundType;
      const confidence = parseFloat(parts[1].trim()) || 0.5;
      const label = parts[2].trim() || type;
      
      return {
        type,
        confidence,
        label,
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error classifying sound:', error);
    return null;
  }
}

/**
 * Provide haptic feedback for sound alert
 */
export function triggerSoundAlert(
  vibrationPattern: number[],
  screenFlash: boolean = false
) {
  // Haptic feedback
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(vibrationPattern);
  }
  
  // Screen flash (visual alert)
  if (screenFlash && typeof document !== 'undefined') {
    const flash = document.createElement('div');
    flash.style.position = 'fixed';
    flash.style.top = '0';
    flash.style.left = '0';
    flash.style.width = '100%';
    flash.style.height = '100%';
    flash.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
    flash.style.zIndex = '9999';
    flash.style.pointerEvents = 'none';
    flash.style.transition = 'opacity 0.3s';
    document.body.appendChild(flash);
    
    setTimeout(() => {
      flash.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(flash);
      }, 300);
    }, 200);
  }
}

