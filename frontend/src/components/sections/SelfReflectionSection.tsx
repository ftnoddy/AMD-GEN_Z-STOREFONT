import React from 'react';
import { SelfReflection } from '../../types/questionnaire';

interface SelfReflectionSectionProps {
  data?: SelfReflection;
  onChange: (data: SelfReflection) => void;
}

export const SelfReflectionSection: React.FC<SelfReflectionSectionProps> = ({ data, onChange }) => {
  const updateField = (field: keyof SelfReflection, value: any) => {
    onChange({
      ...data,
      [field]: value,
    } as SelfReflection);
  };

  return (
    <div className="space-y-8">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-blue-800 mb-2">Optional: Student Self-Reflection</h3>
        <p className="text-blue-700 text-sm">
          Please take a moment to reflect on these questions. Your thoughtful responses help us understand your perspective better.
        </p>
      </div>

      {/* Question 13 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          13. What does "education" mean to you? *
        </label>
        <p className="text-sm text-gray-500 mb-3">Share your thoughts in 1-2 sentences.</p>
        <textarea
          value={data?.educationMeaning || ''}
          onChange={(e) => updateField('educationMeaning', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Education means to me..."
        />
        <div className="mt-1 text-right text-sm text-gray-400">
          {data?.educationMeaning?.length || 0} characters
        </div>
      </div>

      {/* Question 14 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          14. If you had all the resources and support, what would you like to become in future? *
        </label>
        <p className="text-sm text-gray-500 mb-3">Dream big! Share your aspirations in 1-2 sentences.</p>
        <textarea
          value={data?.futureGoal || ''}
          onChange={(e) => updateField('futureGoal', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="In the future, I would like to become..."
        />
        <div className="mt-1 text-right text-sm text-gray-400">
          {data?.futureGoal?.length || 0} characters
        </div>
      </div>

      <div className="bg-green-50 p-4 rounded-lg">
        <h4 className="font-medium text-green-800 mb-2">💡 Writing Tips:</h4>
        <ul className="text-sm text-green-700 space-y-1">
          <li>• Be honest and authentic in your responses</li>
          <li>• Think about what motivates and inspires you</li>
          <li>• Consider how education can help you achieve your goals</li>
          <li>• Don't worry about perfect grammar - focus on your ideas</li>
        </ul>
      </div>
    </div>
  );
};