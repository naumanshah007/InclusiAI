/**
 * Form Parser Utility
 * Parses form fields and provides guidance for filling forms
 */

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'phone' | 'date' | 'number' | 'signature' | 'checkbox' | 'radio' | 'select';
  position: {
    x: number; // 0-100, percentage from left
    y: number; // 0-100, percentage from top
  };
  required?: boolean;
  currentValue?: string;
}

export interface FormInfo {
  title: string;
  fields: FormField[];
  signatureLocation?: {
    x: number;
    y: number;
  };
}

/**
 * Parse form from AI response
 */
export function parseFormInfo(aiResponse: string): FormInfo {
  const info: FormInfo = {
    title: '',
    fields: [],
  };
  
  const lines = aiResponse.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  let currentField: Partial<FormField> | null = null;
  let fieldIndex = 0;
  
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    
    // Extract form title
    if (lowerLine.includes('form') || lowerLine.includes('document') || lowerLine.includes('title')) {
      if (!info.title && line.length < 100) {
        info.title = line.replace(/^(form|document|title):\s*/i, '').trim();
      }
    }
    
    // Extract fields
    if (lowerLine.includes('field') || lowerLine.includes('label') || lowerLine.match(/^\d+[\.\)]/)) {
      if (currentField && currentField.label) {
        info.fields.push({
          id: `field-${fieldIndex++}`,
          label: currentField.label,
          type: currentField.type || 'text',
          position: currentField.position || { x: 50, y: 50 },
          required: currentField.required,
        });
      }
      
      currentField = {
        label: line.replace(/^(field|label|\d+[\.\)])\s*:?\s*/i, '').trim(),
        type: 'text',
        position: { x: 50, y: 50 },
      };
      
      // Detect field type
      const labelLower = currentField.label.toLowerCase();
      if (labelLower.includes('email')) {
        currentField.type = 'email';
      } else if (labelLower.includes('phone') || labelLower.includes('tel')) {
        currentField.type = 'phone';
      } else if (labelLower.includes('date') || labelLower.includes('dob')) {
        currentField.type = 'date';
      } else if (labelLower.includes('sign') || labelLower.includes('signature')) {
        currentField.type = 'signature';
        info.signatureLocation = { x: 50, y: 80 };
      } else if (labelLower.includes('number') || labelLower.includes('amount') || labelLower.includes('quantity')) {
        currentField.type = 'number';
      } else if (labelLower.includes('check') || labelLower.includes('agree')) {
        currentField.type = 'checkbox';
      }
      
      // Detect required
      if (labelLower.includes('required') || labelLower.includes('*') || labelLower.includes('must')) {
        currentField.required = true;
      }
    }
    
    // Extract position hints
    if (lowerLine.includes('position') || lowerLine.includes('location')) {
      const posMatch = line.match(/(\d+)[,\s]+(\d+)/);
      if (posMatch && currentField) {
        currentField.position = {
          x: parseInt(posMatch[1]),
          y: parseInt(posMatch[2]),
        };
      }
    }
  }
  
  // Add last field
  if (currentField && currentField.label) {
    info.fields.push({
      id: `field-${fieldIndex++}`,
      label: currentField.label,
      type: currentField.type || 'text',
      position: currentField.position || { x: 50, y: 50 },
      required: currentField.required,
    });
  }
  
  return info;
}

/**
 * Generate pen position guidance
 */
export function generatePenGuidance(
  field: FormField,
  currentPenPosition?: { x: number; y: number }
): string {
  const directionX = field.position.x > (currentPenPosition?.x || 50) ? 'right' : 'left';
  const directionY = field.position.y > (currentPenPosition?.y || 50) ? 'down' : 'up';
  const distanceX = Math.abs(field.position.x - (currentPenPosition?.x || 50));
  const distanceY = Math.abs(field.position.y - (currentPenPosition?.y || 50));
  
  if (distanceX < 5 && distanceY < 5) {
    return `You are at the ${field.label} field. ${field.type === 'signature' ? 'Sign here.' : 'Write here.'}`;
  }
  
  const instructions: string[] = [];
  
  if (distanceX > 5) {
    instructions.push(`Move ${directionX} about ${Math.round(distanceX / 10)} units`);
  }
  
  if (distanceY > 5) {
    instructions.push(`Move ${directionY} about ${Math.round(distanceY / 10)} units`);
  }
  
  return `To reach ${field.label} field: ${instructions.join(', ')}.`;
}

