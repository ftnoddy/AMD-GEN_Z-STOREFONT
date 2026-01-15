import React from 'react';
import { InterestAspiration } from '../../types/questionnaire';

interface InterestAspirationSectionProps {
  data?: InterestAspiration;
  onChange: (data: InterestAspiration) => void;
}

export const InterestAspirationSection: React.FC<InterestAspirationSectionProps> = ({ data, onChange }) => {
  const updateField = (field: keyof InterestAspiration, value: any) => {
    onChange({
      ...data,
      [field]: value,
    } as InterestAspiration);
  };

  return (
    <div className="space-y-8">
      {/* Question 1 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          1. Do you enjoy learning new things in school? *
        </label>
        <div className="space-y-2">
          {[
            { value: 'yes', label: 'Yes' },
            { value: 'sometimes', label: 'Sometimes' },
            { value: 'no', label: 'No' },
          ].map((option) => (
            <label key={option.value} className="flex items-center">
              <input
                type="radio"
                name="enjoyLearning"
                value={option.value}
                checked={data?.enjoyLearning === option.value}
                onChange={(e) => updateField('enjoyLearning', e.target.value)}
                className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Question 2 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          2. Have you ever thought about what you want to become when you grow up? *
        </label>
        <div className="space-y-2">
          {[
            { value: 'very-clearly', label: 'Yes, very clearly' },
            { value: 'some-ideas', label: 'I have some ideas' },
            { value: 'no', label: 'No, not yet' },
          ].map((option) => (
            <label key={option.value} className="flex items-center">
              <input
                type="radio"
                name="futureThoughts"
                value={option.value}
                checked={data?.futureThoughts === option.value}
                onChange={(e) => updateField('futureThoughts', e.target.value)}
                className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Question 3 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          3. Do you want to study after finishing school (Class 10 or 12)? *
        </label>
        <div className="space-y-2">
          {[
            { value: 'yes-definitely', label: 'Yes, definitely' },
            { value: 'maybe', label: 'Maybe' },
            { value: 'not-really', label: 'Not really' },
          ].map((option) => (
            <label key={option.value} className="flex items-center">
              <input
                type="radio"
                name="studyAfterSchool"
                value={option.value}
                checked={data?.studyAfterSchool === option.value}
                onChange={(e) => updateField('studyAfterSchool', e.target.value)}
                className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Question 4 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          4. What level of education would you like to complete? *
        </label>
        <div className="space-y-2">
          {[
            { value: '10th', label: '10th Standard' },
            { value: '12th', label: '12th Standard' },
            { value: 'diploma', label: 'Diploma/ITI' },
            { value: 'undergraduate', label: 'Undergraduate Degree (BA, BCom, BSc, BTech, etc.)' },
            { value: 'postgraduate', label: 'Postgraduate Degree (MA, MSc, MBA, etc.)' },
            { value: 'not-sure', label: "I'm not sure" },
          ].map((option) => (
            <label key={option.value} className="flex items-center">
              <input
                type="radio"
                name="educationLevel"
                value={option.value}
                checked={data?.educationLevel === option.value}
                onChange={(e) => updateField('educationLevel', e.target.value)}
                className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Question 5 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          5. Which subject or field are you most interested in pursuing further? *
        </label>
        <textarea
          value={data?.interestedField || ''}
          onChange={(e) => updateField('interestedField', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Please describe the subject or field you're most interested in..."
        />
      </div>
    </div>
  );
}; 