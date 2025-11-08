/**
 * Color Detection Utility
 * Enhanced color detection for color-blind and visually impaired users
 */

export interface ColorInfo {
  colors: string[];
  primaryColor?: string;
  secondaryColor?: string;
  contrastLevel?: 'high' | 'medium' | 'low';
  outfitMatch?: 'matches' | 'complements' | 'clashes';
  outfitStyle?: 'formal' | 'casual' | 'business' | 'unknown';
}

/**
 * Detect colors in image using AI
 */
export async function detectColors(
  image: string,
  aiProvider: (image: string, prompt: string) => Promise<string>
): Promise<ColorInfo | null> {
  try {
    const prompt = `Identify all colors in this image. Be very specific with color names (e.g., "navy blue" not just "blue", "burgundy" not just "red"). 
    
If this appears to be clothing or an outfit, also analyze:
1. Whether the colors match or complement each other
2. If the outfit appears formal, casual, or business-appropriate
3. Overall color coordination

Format your response as:
Colors: [list of all colors]
Primary: [main color]
Secondary: [secondary color if applicable]
Contrast: [high/medium/low]
Outfit Match: [matches/complements/clashes if applicable]
Style: [formal/casual/business if applicable]`;
    
    const result = await aiProvider(image, prompt);
    
    // Parse the result
    const lines = result.split('\n').map(l => l.trim());
    const info: ColorInfo = {
      colors: [],
    };
    
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      if (lowerLine.startsWith('colors:')) {
        const colorsText = line.replace(/^colors:\s*/i, '').trim();
        info.colors = colorsText.split(',').map(c => c.trim()).filter(c => c.length > 0);
      } else if (lowerLine.startsWith('primary:')) {
        info.primaryColor = line.replace(/^primary:\s*/i, '').trim();
      } else if (lowerLine.startsWith('secondary:')) {
        info.secondaryColor = line.replace(/^secondary:\s*/i, '').trim();
      } else if (lowerLine.startsWith('contrast:')) {
        const contrast = line.replace(/^contrast:\s*/i, '').trim().toLowerCase();
        if (contrast.includes('high')) {
          info.contrastLevel = 'high';
        } else if (contrast.includes('medium')) {
          info.contrastLevel = 'medium';
        } else if (contrast.includes('low')) {
          info.contrastLevel = 'low';
        }
      } else if (lowerLine.startsWith('outfit match:')) {
        const match = line.replace(/^outfit match:\s*/i, '').trim().toLowerCase();
        if (match.includes('match')) {
          info.outfitMatch = 'matches';
        } else if (match.includes('complement')) {
          info.outfitMatch = 'complements';
        } else if (match.includes('clash')) {
          info.outfitMatch = 'clashes';
        }
      } else if (lowerLine.startsWith('style:')) {
        const style = line.replace(/^style:\s*/i, '').trim().toLowerCase();
        if (style.includes('formal')) {
          info.outfitStyle = 'formal';
        } else if (style.includes('casual')) {
          info.outfitStyle = 'casual';
        } else if (style.includes('business')) {
          info.outfitStyle = 'business';
        }
      }
    }
    
    return info;
  } catch (error) {
    console.error('Error detecting colors:', error);
    return null;
  }
}

