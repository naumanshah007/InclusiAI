/**
 * Danger Detection Utility
 * Detects potential dangers or hazards in images
 */

export interface DangerInfo {
  level: 'high' | 'medium' | 'low' | 'none';
  hazards: string[];
  recommendations: string[];
}

/**
 * Detect dangers using AI
 */
export async function detectDangers(
  image: string,
  aiProvider: (image: string, prompt: string) => Promise<string>
): Promise<DangerInfo> {
  try {
    const prompt = `Analyze this image for potential dangers or hazards that could affect a blind or visually impaired person. Look for:
1. Obstacles in the path (stairs, curbs, objects on floor)
2. Open hazards (open drawers, doors, sharp objects)
3. Slippery surfaces (wet floors, ice)
4. Moving objects or vehicles
5. Low-hanging objects
6. Unstable surfaces
7. Construction or maintenance areas
8. Any other safety concerns

Rate the danger level as HIGH, MEDIUM, LOW, or NONE.
List all hazards found and provide specific recommendations for safe navigation.

Format your response as:
Level: [HIGH/MEDIUM/LOW/NONE]
Hazards: [list of hazards]
Recommendations: [list of recommendations]`;
    
    const result = await aiProvider(image, prompt);
    
    // Parse the result
    const lines = result.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const info: DangerInfo = {
      level: 'none',
      hazards: [],
      recommendations: [],
    };
    
    let currentSection: 'hazards' | 'recommendations' | null = null;
    
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      
      if (lowerLine.startsWith('level:')) {
        const level = line.replace(/^level:\s*/i, '').trim().toLowerCase();
        if (level.includes('high')) {
          info.level = 'high';
        } else if (level.includes('medium')) {
          info.level = 'medium';
        } else if (level.includes('low')) {
          info.level = 'low';
        } else {
          info.level = 'none';
        }
      } else if (lowerLine.startsWith('hazards:')) {
        currentSection = 'hazards';
        const hazardText = line.replace(/^hazards:\s*/i, '').trim();
        if (hazardText) {
          info.hazards.push(hazardText);
        }
      } else if (lowerLine.startsWith('recommendations:')) {
        currentSection = 'recommendations';
        const recText = line.replace(/^recommendations:\s*/i, '').trim();
        if (recText) {
          info.recommendations.push(recText);
        }
      } else if (currentSection === 'hazards' && line.length > 0) {
        info.hazards.push(line);
      } else if (currentSection === 'recommendations' && line.length > 0) {
        info.recommendations.push(line);
      }
    }
    
    return info;
  } catch (error) {
    console.error('Error detecting dangers:', error);
    return {
      level: 'none',
      hazards: [],
      recommendations: [],
    };
  }
}

