import React from 'react';
import { BasicInfo } from '../../types/questionnaire';
import { User, School, Briefcase, GraduationCap } from 'lucide-react';

interface BasicInfoSectionProps {
  data?: BasicInfo;
  onChange: (data: BasicInfo) => void;
}

export const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({ data, onChange }) => {
  const updateField = (field: keyof BasicInfo, value: any) => {
    onChange({
      ...data,
      [field]: value,
    } as BasicInfo);
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Name Field */}
        <div className="group">
          <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
            <User className="w-4 h-4 mr-2 text-blue-500" />
            Full Name *
          </label>
          <div className="relative">
            <input
              type="text"
              value={data?.name || ''}
              onChange={(e) => updateField('name', e.target.value)}
              className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 text-gray-800 placeholder-gray-400 group-hover:border-gray-300"
              placeholder="Enter your full name"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
              <div className={`w-2 h-2 rounded-full transition-all duration-300 ${data?.name ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            </div>
          </div>
        </div>

        {/* Age Field */}
        <div className="group">
          <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
            <User className="w-4 h-4 mr-2 text-purple-500" />
            Age *
          </label>
          <div className="relative">
            <input
              type="number"
              min="13"
              max="18"
              value={data?.age || ''}
              onChange={(e) => updateField('age', parseInt(e.target.value) || 0)}
              className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-300 text-gray-800 placeholder-gray-400 group-hover:border-gray-300"
              placeholder="Age (13-18)"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
              <div className={`w-2 h-2 rounded-full transition-all duration-300 ${data?.age ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            </div>
          </div>
        </div>

        {/* Grade Field */}
        <div className="group">
          <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
            <GraduationCap className="w-4 h-4 mr-2 text-green-500" />
            Grade/Class *
          </label>
          <div className="relative">
            <input
              type="text"
              value={data?.grade || ''}
              onChange={(e) => updateField('grade', e.target.value)}
              className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-300 text-gray-800 placeholder-gray-400 group-hover:border-gray-300"
              placeholder="e.g., Class 10, Grade 11"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
              <div className={`w-2 h-2 rounded-full transition-all duration-300 ${data?.grade ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            </div>
          </div>
        </div>

        {/* School Field */}
        <div className="group">
          <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
            <School className="w-4 h-4 mr-2 text-orange-500" />
            School Name *
          </label>
          <div className="relative">
            <input
              type="text"
              value={data?.schoolName || ''}
              onChange={(e) => updateField('schoolName', e.target.value)}
              className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-500 transition-all duration-300 text-gray-800 placeholder-gray-400 group-hover:border-gray-300"
              placeholder="Enter your school name"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
              <div className={`w-2 h-2 rounded-full transition-all duration-300 ${data?.schoolName ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Parent Occupation Field */}
      <div className="group">
        <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
          <Briefcase className="w-4 h-4 mr-2 text-indigo-500" />
          Parent/Guardian Occupation *
        </label>
        <div className="relative">
          <input
            type="text"
            value={data?.parentOccupation || ''}
            onChange={(e) => updateField('parentOccupation', e.target.value)}
            className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-300 text-gray-800 placeholder-gray-400 group-hover:border-gray-300"
            placeholder="Enter parent/guardian occupation"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
            <div className={`w-2 h-2 rounded-full transition-all duration-300 ${data?.parentOccupation ? 'bg-green-500' : 'bg-gray-300'}`}></div>
          </div>
        </div>
      </div>

      {/* Family Education Background */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
        <label className="flex items-center text-sm font-semibold text-gray-700 mb-4">
          <GraduationCap className="w-4 h-4 mr-2 text-blue-500" />
          Do any of your family members have a college degree? *
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { value: 'yes', label: 'Yes', color: 'from-green-500 to-emerald-500' },
            { value: 'no', label: 'No', color: 'from-red-500 to-pink-500' },
            { value: 'not-sure', label: 'Not sure', color: 'from-gray-500 to-slate-500' },
          ].map((option) => (
            <label key={option.value} className="group cursor-pointer">
              <div className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${
                data?.familyCollegeDegree === option.value
                  ? `bg-gradient-to-r ${option.color} text-white border-transparent shadow-lg transform scale-105`
                  : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:shadow-md'
              }`}>
                <input
                  type="radio"
                  name="familyCollegeDegree"
                  value={option.value}
                  checked={data?.familyCollegeDegree === option.value}
                  onChange={(e) => updateField('familyCollegeDegree', e.target.value)}
                  className="sr-only"
                />
                <div className="flex items-center justify-center">
                  <span className="font-medium">{option.label}</span>
                  {data?.familyCollegeDegree === option.value && (
                    <div className="ml-2 w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  )}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="flex justify-center mt-8">
        <div className="flex space-x-2">
          {Array.from({ length: 6 }, (_, index) => {
            const fields = ['name', 'age', 'grade', 'schoolName', 'parentOccupation', 'familyCollegeDegree'];
            const isComplete = data && data[fields[index] as keyof BasicInfo];
            return (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  isComplete ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gray-200'
                }`}
              ></div>
            );
          })}
        </div>
      </div>
    </div>
  );
}; 