/**
 * Medicine Label Parser
 * Parses structured medicine information from AI response
 */

export interface MedicineInfo {
  brandName?: string;
  genericName?: string;
  fullName: string;
  dosage?: {
    strength: string;
    form: string;
    quantity?: string;
  };
  instructions?: {
    frequency: string;
    timing: string;
    amount: string;
    duration?: string;
  };
  warnings?: string[];
  precautions?: string[];
  expirationDate?: string;
  isExpired?: boolean;
  prescriptionNumber?: string;
  doctorName?: string;
  pharmacyName?: string;
  conflicts?: string[];
  missingInfo?: string[];
}

/**
 * Parse medicine information from AI response
 */
export function parseMedicineInfo(aiResponse: string): MedicineInfo {
  const info: MedicineInfo = {
    fullName: '',
    conflicts: [],
    missingInfo: [],
  };

  const lines = aiResponse.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  let currentSection = '';
  
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    
    // Detect sections
    if (lowerLine.includes('medication name') || lowerLine.includes('1.')) {
      currentSection = 'name';
    } else if (lowerLine.includes('dosage') || lowerLine.includes('2.')) {
      currentSection = 'dosage';
    } else if (lowerLine.includes('instructions') || lowerLine.includes('3.')) {
      currentSection = 'instructions';
    } else if (lowerLine.includes('warning') || lowerLine.includes('4.')) {
      currentSection = 'warnings';
    } else if (lowerLine.includes('expiration') || lowerLine.includes('5.')) {
      currentSection = 'expiration';
    } else if (lowerLine.includes('prescription') || lowerLine.includes('6.')) {
      currentSection = 'prescription';
    } else if (lowerLine.includes('conflict') || lowerLine.includes('7.')) {
      currentSection = 'conflicts';
    }
    
    // Extract information based on section
    if (currentSection === 'name') {
      if (lowerLine.includes('brand')) {
        info.brandName = line.replace(/^.*brand[:\-]?\s*/i, '').trim();
      } else if (lowerLine.includes('generic')) {
        info.genericName = line.replace(/^.*generic[:\-]?\s*/i, '').trim();
      } else if (!info.fullName && line.length > 5 && !line.includes(':')) {
        info.fullName = line;
      }
    } else if (currentSection === 'dosage') {
      if (!info.dosage) {
        info.dosage = { strength: '', form: '' };
      }
      if (lowerLine.includes('strength') || lowerLine.match(/\d+\s*(mg|ml|g|mcg)/i)) {
        const strengthMatch = line.match(/(\d+(?:\.\d+)?\s*(?:mg|ml|g|mcg|%))/i);
        if (strengthMatch) {
          info.dosage.strength = strengthMatch[1];
        }
      }
      if (lowerLine.includes('form') || lowerLine.match(/(tablet|capsule|liquid|cream|gel|spray)/i)) {
        const formMatch = line.match(/(tablet|capsule|liquid|cream|gel|spray|ointment|drops)/i);
        if (formMatch) {
          info.dosage.form = formMatch[1];
        }
      }
    } else if (currentSection === 'instructions') {
      if (!info.instructions) {
        info.instructions = { frequency: '', timing: '', amount: '' };
      }
      if (lowerLine.includes('frequency') || lowerLine.match(/(daily|twice|once|every)/i)) {
        const freqMatch = line.match(/(\d+\s*times?\s*(?:daily|a day)|once|twice|daily|every\s*\d+\s*hours?)/i);
        if (freqMatch) {
          info.instructions.frequency = freqMatch[1];
        }
      }
      if (lowerLine.includes('when') || lowerLine.match(/(with food|empty stomach|bedtime)/i)) {
        const timingMatch = line.match(/(with food|on empty stomach|at bedtime|before|after)/i);
        if (timingMatch) {
          info.instructions.timing = timingMatch[1];
        }
      }
    } else if (currentSection === 'warnings') {
      if (!info.warnings) {
        info.warnings = [];
      }
      if (line.length > 10 && !line.includes(':')) {
        info.warnings.push(line);
      }
    } else if (currentSection === 'expiration') {
      const dateMatch = line.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|exp|expires?|expiration)/i);
      if (dateMatch) {
        info.expirationDate = line;
        // Check if expired
        const today = new Date();
        // Simple check - if response mentions "expired" or date is in past
        if (lowerLine.includes('expired') || lowerLine.includes('past')) {
          info.isExpired = true;
        }
      }
    } else if (currentSection === 'conflicts') {
      if (!info.conflicts) {
        info.conflicts = [];
      }
      if (line.length > 10 && (lowerLine.includes('warning') || lowerLine.includes('unusual') || lowerLine.includes('unclear'))) {
        info.conflicts.push(line);
      }
    }
    
    // Check for missing info warnings
    if (lowerLine.includes('missing') || lowerLine.includes('unclear') || lowerLine.includes('not visible')) {
      if (!info.missingInfo) {
        info.missingInfo = [];
      }
      info.missingInfo.push(line);
    }
  }
  
  // If no full name extracted, try to find it in the first few lines
  if (!info.fullName) {
    for (const line of lines.slice(0, 5)) {
      if (line.length > 5 && line.length < 100 && !line.includes(':')) {
        info.fullName = line;
        break;
      }
    }
  }
  
  return info;
}

/**
 * Format medicine info for speech output
 */
export function formatMedicineInfoForSpeech(info: MedicineInfo): string {
  const parts: string[] = [];
  
  if (info.fullName) {
    parts.push(`Medication: ${info.fullName}`);
  }
  
  if (info.dosage) {
    const dosageParts: string[] = [];
    if (info.dosage.strength) {
      dosageParts.push(info.dosage.strength);
    }
    if (info.dosage.form) {
      dosageParts.push(info.dosage.form);
    }
    if (dosageParts.length > 0) {
      parts.push(`Dosage: ${dosageParts.join(' ')}`);
    }
  }
  
  if (info.instructions) {
    const instParts: string[] = [];
    if (info.instructions.amount) {
      instParts.push(info.instructions.amount);
    }
    if (info.instructions.frequency) {
      instParts.push(info.instructions.frequency);
    }
    if (info.instructions.timing) {
      instParts.push(info.instructions.timing);
    }
    if (instParts.length > 0) {
      parts.push(`Instructions: ${instParts.join(', ')}`);
    }
  }
  
  if (info.warnings && info.warnings.length > 0) {
    parts.push(`Warnings: ${info.warnings.join('. ')}`);
  }
  
  if (info.expirationDate) {
    parts.push(`Expiration: ${info.expirationDate}`);
    if (info.isExpired) {
      parts.push('WARNING: This medication appears to be expired. Do not use.');
    }
  }
  
  if (info.conflicts && info.conflicts.length > 0) {
    parts.push(`IMPORTANT: ${info.conflicts.join('. ')}`);
  }
  
  if (info.missingInfo && info.missingInfo.length > 0) {
    parts.push(`Note: ${info.missingInfo.join('. ')}`);
  }
  
  return parts.join('. ');
}

