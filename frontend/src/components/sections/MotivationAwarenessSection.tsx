import React from 'react';
import { MotivationAwareness } from '../../types/questionnaire';

interface MotivationAwarenessSectionProps {
  data?: MotivationAwareness;
  onChange: (data: MotivationAwareness) => void;
}

export const MotivationAwarenessSection: React.FC<MotivationAwarenessSectionProps> = ({ data, onChange }) => {
  const updateField = (field: keyof MotivationAwareness, value: any) => {
    onChange({
      ...data,
      [field]: value,
    } as MotivationAwareness);
  };

  const handleReasonChange = (reason: string, checked: boolean) => {
    const currentReasons = data?.reasonsForStudy || [];
    let newReasons;
    
    if (checked) {
      newReasons = [...currentReasons, reason];
    } else {
      newReasons = currentReasons.filter(r => r !== reason);
    }
    
    updateField('reasonsForStudy', newReasons);
  };

  return (
    <div className="space-y-8">
      {/* Question 6 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          6. Why do you want to continue your studies? (Select all that apply) *
        </label>
        <div className="space-y-3">
          {[
            { value: 'good-job', label: 'To get a good job' },
            { value: 'learn-more', label: 'To learn more' },
            { value: 'support-family', label: 'To support my family in future' },
            { value: 'encouraged', label: 'Because my teachers/parents encourage me' },
            { value: 'other', label: 'Other' },
          ].map((option) => (
            <label key={option.value} className="flex items-center">
              <input
                type="checkbox"
                checked={data?.reasonsForStudy?.includes(option.value as any) || false}
                onChange={(e) => handleReasonChange(option.value, e.target.checked)}
                className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
        
        {data?.reasonsForStudy?.includes('other') && (
          <div className="mt-3">
            <input
              type="text"
              value={data?.otherReason || ''}
              onChange={(e) => updateField('otherReason', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Please specify other reason..."
            />
          </div>
        )}
      </div>

      {/* Question 7 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          7. Are you aware of scholarships or financial aid options for college? *
        </label>
        <div className="space-y-2">
          {[
            { value: 'yes', label: 'Yes' },
            { value: 'somewhat', label: 'Somewhat' },
            { value: 'no', label: 'No' },
          ].map((option) => (
            <label key={option.value} className="flex items-center">
              <input
                type="radio"
                name="scholarshipAwareness"
                value={option.value}
                checked={data?.scholarshipAwareness === option.value}
                onChange={(e) => updateField('scholarshipAwareness', e.target.value)}
                className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Question 8 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          8. Do you talk to anyone (teacher, family, mentor) about your future education plans? *
        </label>
        <div className="space-y-2">
          {[
            { value: 'regularly', label: 'Yes, regularly' },
            { value: 'occasionally', label: 'Occasionally' },
            { value: 'not-really', label: 'Not really' },
          ].map((option) => (
            <label key={option.value} className="flex items-center">
              <input
                type="radio"
                name="discussPlans"
                value={option.value}
                checked={data?.discussPlans === option.value}
                onChange={(e) => updateField('discussPlans', e.target.value)}
                className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Question 9 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          9. How confident are you that you will be able to go to college/university? *
        </label>
        <div className="space-y-2">
          {[
            { value: 'very-confident', label: 'Very confident' },
            { value: 'somewhat-confident', label: 'Somewhat confident' },
            { value: 'not-sure', label: "I'm not sure" },
            { value: 'not-possible', label: "I don't think it's possible" },
          ].map((option) => (
            <label key={option.value} className="flex items-center">
              <input
                type="radio"
                name="confidence"
                value={option.value}
                checked={data?.confidence === option.value}
                onChange={(e) => updateField('confidence', e.target.value)}
                className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}; 