/**
 * QR/NFC Handler Utility
 * Handles QR code and NFC tag scanning
 */

export interface QRNFCTag {
  type: 'qr' | 'nfc';
  data: string;
  format?: string;
}

/**
 * Detect QR code in image using AI
 */
export async function detectQRCode(
  image: string,
  aiProvider: (image: string, prompt: string) => Promise<string>
): Promise<QRNFCTag | null> {
  try {
    const prompt = `Look for a QR code in this image. QR codes are square patterns with black and white squares. If you find one, extract the data or URL from it. Return ONLY the QR code data if found, or "NO_QR_CODE" if no QR code is visible.`;
    
    const result = await aiProvider(image, prompt);
    
    if (result && !result.includes('NO_QR_CODE') && result.trim().length > 0) {
      // Extract URL or data
      const urlMatch = result.match(/https?:\/\/[^\s]+/);
      const data = urlMatch ? urlMatch[0] : result.trim();
      
      if (data && data.length > 0) {
        return {
          type: 'qr',
          data,
          format: 'URL',
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error detecting QR code:', error);
    return null;
  }
}

/**
 * Handle NFC tag (requires browser NFC API - future implementation)
 */
export async function detectNFCTag(): Promise<QRNFCTag | null> {
  // NFC API is not widely supported yet
  // This is a placeholder for future implementation
  if (typeof window !== 'undefined' && 'NDEFReader' in window) {
    try {
      // @ts-ignore - NFC API is experimental
      const reader = new NDEFReader();
      await reader.scan();
      
      reader.onreading = (event: any) => {
        const message = event.message;
        // Process NFC message
        return {
          type: 'nfc' as const,
          data: message.records[0]?.data || '',
        };
      };
    } catch (error) {
      console.error('NFC not available:', error);
    }
  }
  
  return null;
}

