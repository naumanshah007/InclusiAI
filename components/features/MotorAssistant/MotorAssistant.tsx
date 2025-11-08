'use client';

import { useState } from 'react';
import { VoiceCommands } from './VoiceCommands';

export function MotorAssistant() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <VoiceCommands />
      </div>
    </div>
  );
}

