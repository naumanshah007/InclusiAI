/**
 * Money Detection Utility
 * Detects and identifies banknotes, cards, and POS terminals
 */

export interface MoneyInfo {
  type: 'banknote' | 'coin' | 'card' | 'pos';
  currency?: string;
  denomination?: string;
  orientation?: 'front' | 'back' | 'unknown';
  side?: 'front' | 'back';
}

/**
 * Detect money/banknote using AI
 */
export async function detectMoney(
  image: string,
  aiProvider: (image: string, prompt: string) => Promise<string>
): Promise<MoneyInfo | null> {
  try {
    const prompt = `Look at this image. If it contains money (banknotes or coins), identify:
1. Type: banknote or coin
2. Currency (e.g., USD, EUR, GBP)
3. Denomination (e.g., "20 dollars", "10 euros", "5 pounds")
4. Which side is visible (front or back)

If it's a card (credit card, debit card, ID card), identify:
1. Type: card
2. Which side is visible (front or back)
3. Card type if visible (credit, debit, ID)

If it's a POS terminal or payment device, identify:
1. Type: pos
2. What buttons or options are visible

Format your response as:
Type: [type]
Currency: [currency if applicable]
Denomination: [denomination if applicable]
Side: [front/back]
Details: [additional details]`;
    
    const result = await aiProvider(image, prompt);
    
    // Parse the result
    const lines = result.split('\n').map(l => l.trim());
    const info: MoneyInfo = {
      type: 'banknote',
    };
    
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      if (lowerLine.startsWith('type:')) {
        const type = line.replace(/^type:\s*/i, '').trim().toLowerCase();
        if (type.includes('coin')) {
          info.type = 'coin';
        } else if (type.includes('card')) {
          info.type = 'card';
        } else if (type.includes('pos') || type.includes('terminal') || type.includes('payment')) {
          info.type = 'pos';
        } else {
          info.type = 'banknote';
        }
      } else if (lowerLine.startsWith('currency:')) {
        info.currency = line.replace(/^currency:\s*/i, '').trim();
      } else if (lowerLine.startsWith('denomination:')) {
        info.denomination = line.replace(/^denomination:\s*/i, '').trim();
      } else if (lowerLine.startsWith('side:')) {
        const side = line.replace(/^side:\s*/i, '').trim().toLowerCase();
        info.side = side.includes('front') ? 'front' : side.includes('back') ? 'back' : undefined;
        info.orientation = info.side;
      }
    }
    
    return info;
  } catch (error) {
    console.error('Error detecting money:', error);
    return null;
  }
}

