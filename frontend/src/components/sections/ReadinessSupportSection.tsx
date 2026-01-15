import React from 'react';
import { ReadinessSupport } from '../../types/questionnaire';

interface ReadinessSupportSectionProps {
  data?: ReadinessSupport;
  onChange: (data: ReadinessSupport) => void;
}

export const ReadinessSupportSection: React.FC<ReadinessSupportSectionProps> = ({ data, onChange }) => {
  const updateField = (field: keyof ReadinessSupport, value: any) => {
    onChange({
      ...data,
      [field]: value,
    } as ReadinessSupport);
  };

  const handleChallengeChange = (challenge: string, checked: boolean) => {
    const currentChallenges = data?.challenges || [];
    let newChallenges;
    
    if (checked) {
      newChallenges = [...currentChallenges, challenge];
    } else {
      newChallenges = currentChallenges.filter(c => c !== challenge);
    }
    
    updateField('challenges', newChallenges);
  };

  return (
    <div className="space-y-8">
      {/* Question 10 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          10. Do you currently have access to: *
        </label>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
            <span className="text-gray-700">Books and materials for studies</span>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="hasBooks"
                  checked={data?.hasBooks === true}
                  onChange={() => updateField('hasBooks', true)}
                  className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                Yes
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="hasBooks"
                  checked={data?.hasBooks === false}
                  onChange={() => updateField('hasBooks', false)}
                  className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                No
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
            <span className="text-gray-700">A quiet space to study</span>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="hasQuietSpace"
                  checked={data?.hasQuietSpace === true}
                  onChange={() => updateField('hasQuietSpace', true)}
                  className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                Yes
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="hasQuietSpace"
                  checked={data?.hasQuietSpace === false}
                  onChange={() => updateField('hasQuietSpace', false)}
                  className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                No
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
            <span className="text-gray-700">Internet or digital devices for learning</span>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="hasInternet"
                  checked={data?.hasInternet === true}
                  onChange={() => updateField('hasInternet', true)}
                  className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                Yes
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="hasInternet"
                  checked={data?.hasInternet === false}
                  onChange={() => updateField('hasInternet', false)}
                  className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                No
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Question 11 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          11. How many hours do you usually study outside school each day? *
        </label>
        <div className="space-y-2">
          {[
            { value: 'less-1', label: 'Less than 1 hour' },
            { value: '1-2', label: '1–2 hours' },
            { value: '2-4', label: '2–4 hours' },
            { value: 'more-4', label: 'More than 4 hours' },
          ].map((option) => (
            <label key={option.value} className="flex items-center">
              <input
                type="radio"
                name="studyHours"
                value={option.value}
                checked={data?.studyHours === option.value}
                onChange={(e) => updateField('studyHours', e.target.value)}
                className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Question 12 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          12. What challenges do you think might stop you from pursuing higher education? (Tick all that apply) *
        </label>
        <div className="space-y-3">
          {[
            { value: 'financial', label: 'Financial difficulty' },
            { value: 'guidance', label: 'Lack of guidance' },
            { value: 'family-responsibilities', label: 'Family responsibilities' },
            { value: 'confidence', label: 'Lack of confidence' },
            { value: 'other', label: 'Other' },
          ].map((option) => (
            <label key={option.value} className="flex items-center">
              <input
                type="checkbox"
                checked={data?.challenges?.includes(option.value as any) || false}
                onChange={(e) => handleChallengeChange(option.value, e.target.checked)}
                className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
        
        {data?.challenges?.includes('other') && (
          <div className="mt-3">
            <input
              type="text"
              value={data?.otherChallenge || ''}
              onChange={(e) => updateField('otherChallenge', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Please specify other challenge..."
            />
          </div>
        )}
      </div>
    </div>
  );
}; 