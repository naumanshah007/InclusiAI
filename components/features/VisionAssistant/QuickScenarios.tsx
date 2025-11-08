'use client';

import { useState } from 'react';

export type ScenarioType = 'medicine' | 'sign' | 'menu' | 'document' | 'object' | 'color' | 'general';

interface QuickScenario {
  id: ScenarioType;
  label: string;
  icon: string;
  description: string;
  color: string;
}

interface QuickScenariosProps {
  onScenarioSelect: (scenario: ScenarioType) => void;
  selectedScenario?: ScenarioType;
}

const scenarios: QuickScenario[] = [
  {
    id: 'medicine',
    label: 'Read Medicine',
    icon: '💊',
    description: 'Read medication labels, dosage, instructions',
    color: 'from-red-500 to-red-600',
  },
  {
    id: 'sign',
    label: 'Read Sign',
    icon: '🚏',
    description: 'Read street signs, building numbers',
    color: 'from-blue-500 to-blue-600',
  },
  {
    id: 'menu',
    label: 'Read Menu',
    icon: '📋',
    description: 'Read restaurant menus, prices, ingredients',
    color: 'from-orange-500 to-orange-600',
  },
  {
    id: 'document',
    label: 'Read Document',
    icon: '📄',
    description: 'Read forms, letters, bills, contracts',
    color: 'from-purple-500 to-purple-600',
  },
  {
    id: 'object',
    label: 'Find Object',
    icon: '🔍',
    description: 'Identify objects and their locations',
    color: 'from-green-500 to-green-600',
  },
  {
    id: 'color',
    label: 'Identify Color',
    icon: '🎨',
    description: 'Identify colors for matching and accessibility',
    color: 'from-pink-500 to-pink-600',
  },
  {
    id: 'general',
    label: 'General Description',
    icon: '👁️',
    description: 'General image description',
    color: 'from-gray-500 to-gray-600',
  },
];

export function QuickScenarios({ onScenarioSelect, selectedScenario }: QuickScenariosProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="mb-2 text-lg font-semibold text-gray-900">
          Quick Scenarios
        </h3>
        <p className="text-sm text-gray-600">
          Select a scenario to get optimized descriptions for your specific need
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {scenarios.map((scenario) => (
          <button
            key={scenario.id}
            onClick={() => onScenarioSelect(scenario.id)}
            className={`group flex flex-col items-center rounded-xl border-2 p-4 text-center transition-all hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
              selectedScenario === scenario.id
                ? 'border-primary-500 bg-primary-50 shadow-md'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
            aria-pressed={selectedScenario === scenario.id}
            aria-label={`${scenario.label}: ${scenario.description}`}
          >
            <div
              className={`mb-3 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br ${scenario.color} text-3xl text-white shadow-lg transition-transform group-hover:scale-110`}
            >
              {scenario.icon}
            </div>
            <h4 className="mb-1 font-semibold text-gray-900">{scenario.label}</h4>
            <p className="text-xs text-gray-600">{scenario.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

