import React, { useState } from 'react';
import { Card } from './ui/card';
import { BasicInfoSection } from './sections/BasicInfoSection';
import { InterestAspirationSection } from './sections/InterestAspirationSection';
import { MotivationAwarenessSection } from './sections/MotivationAwarenessSection';
import { ReadinessSupportSection } from './sections/ReadinessSupportSection';
import { SelfReflectionSection } from './sections/SelfReflectionSection';
import { 
  QuestionnaireData, 
  StudentScore, 
  BasicInfo, 
  InterestAspiration, 
  MotivationAwareness, 
  ReadinessSupport, 
  SelfReflection 
} from '../types/questionnaire';
import { calculateScore } from '../utils/scoring';
import { v4 as uuidv4 } from 'uuid';
import { ChevronLeft, ChevronRight, Send, User, Heart, Target, BookOpen, Lightbulb, Sparkles } from 'lucide-react';

interface QuestionnaireFormProps {
  onSubmit: (score: StudentScore) => void;
}

const SECTIONS = [
  { key: 'basicInfo', title: 'Basic Information', icon: User, color: 'from-blue-500 to-cyan-500', description: 'Tell us about yourself' },
  { key: 'interestAspiration', title: 'Interest & Aspiration', icon: Heart, color: 'from-pink-500 to-rose-500', description: 'Your dreams and interests' },
  { key: 'motivationAwareness', title: 'Motivation & Awareness', icon: Target, color: 'from-purple-500 to-violet-500', description: 'What drives you forward' },
  { key: 'readinessSupport', title: 'Readiness & Support', icon: BookOpen, color: 'from-green-500 to-emerald-500', description: 'Your learning environment' },
  { key: 'selfReflection', title: 'Self Reflection', icon: Lightbulb, color: 'from-amber-500 to-orange-500', description: 'Your thoughts on education' }
] as const;

export const QuestionnaireForm: React.FC<QuestionnaireFormProps> = ({ onSubmit }) => {
  const [currentSection, setCurrentSection] = useState(0);
  const [formData, setFormData] = useState<Partial<QuestionnaireData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateFormData = (section: keyof QuestionnaireData, data: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: data
    }));
  };

  const isCurrentSectionComplete = () => {
    const section = SECTIONS[currentSection].key;
    const data = formData[section as keyof QuestionnaireData];
    
    switch (section) {
      case 'basicInfo': {
        const basicData = data as BasicInfo | undefined;
        return basicData && basicData.name && basicData.age && basicData.grade && basicData.schoolName && basicData.parentOccupation && basicData.familyCollegeDegree;
      }
      case 'interestAspiration': {
        const interestData = data as InterestAspiration | undefined;
        return interestData && interestData.enjoyLearning && interestData.futureThoughts && interestData.studyAfterSchool && interestData.educationLevel && interestData.interestedField;
      }
      case 'motivationAwareness': {
        const motivationData = data as MotivationAwareness | undefined;
        return motivationData && motivationData.reasonsForStudy && motivationData.reasonsForStudy.length > 0 && motivationData.scholarshipAwareness && motivationData.discussPlans && motivationData.confidence;
      }
      case 'readinessSupport': {
        const readinessData = data as ReadinessSupport | undefined;
        return readinessData && typeof readinessData.hasBooks === 'boolean' && typeof readinessData.hasQuietSpace === 'boolean' && typeof readinessData.hasInternet === 'boolean' && readinessData.studyHours && readinessData.challenges;
      }
      case 'selfReflection': {
        const reflectionData = data as SelfReflection | undefined;
        return reflectionData && reflectionData.educationMeaning && reflectionData.futureGoal;
      }
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentSection < SECTIONS.length - 1) {
      setCurrentSection(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!isFormComplete()) return;
    
    setIsSubmitting(true);
    
    const studentScore: StudentScore = {
      id: uuidv4(),
      name: formData.basicInfo!.name,
      ...calculateScore(formData as QuestionnaireData),
      questionnaire: formData as QuestionnaireData
    };
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    onSubmit(studentScore);
    
    // Reset form
    setFormData({});
    setCurrentSection(0);
  };

  const isFormComplete = () => {
    return SECTIONS.every(section => {
      const data = formData[section.key as keyof QuestionnaireData];
      return data !== undefined;
    });
  };

  const renderCurrentSection = () => {
    const section = SECTIONS[currentSection].key;
    
    switch (section) {
      case 'basicInfo':
        return (
          <BasicInfoSection
            data={formData.basicInfo}
            onChange={(data) => updateFormData('basicInfo', data)}
          />
        );
      case 'interestAspiration':
        return (
          <InterestAspirationSection
            data={formData.interestAspiration}
            onChange={(data) => updateFormData('interestAspiration', data)}
          />
        );
      case 'motivationAwareness':
        return (
          <MotivationAwarenessSection
            data={formData.motivationAwareness}
            onChange={(data) => updateFormData('motivationAwareness', data)}
          />
        );
      case 'readinessSupport':
        return (
          <ReadinessSupportSection
            data={formData.readinessSupport}
            onChange={(data) => updateFormData('readinessSupport', data)}
          />
        );
      case 'selfReflection':
        return (
          <SelfReflectionSection
            data={formData.selfReflection}
            onChange={(data) => updateFormData('selfReflection', data)}
          />
        );
      default:
        return null;
    }
  };

  const progressPercentage = ((currentSection + 1) / SECTIONS.length) * 100;
  const currentSectionData = SECTIONS[currentSection];
  const IconComponent = currentSectionData.icon;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Enhanced Progress Section */}
      <div className="mb-10 animate-fadeInUp">
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-white/50">
          {/* Progress Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-2xl bg-gradient-to-r ${currentSectionData.color} shadow-lg animate-float`}>
                <IconComponent className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{currentSectionData.title}</h2>
                <p className="text-gray-600">{currentSectionData.description}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 mb-1">Progress</div>
              <div className="text-2xl font-bold text-gray-800">{currentSection + 1}/{SECTIONS.length}</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative">
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${currentSectionData.color} rounded-full transition-all duration-700 ease-out relative`}
                style={{ width: `${progressPercentage}%` }}
              >
                <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
              </div>
            </div>
            <div className="flex justify-between mt-4">
              {SECTIONS.map((section, index) => {
                const SectionIcon = section.icon;
                const isCompleted = index < currentSection;
                const isCurrent = index === currentSection;
                
                return (
                  <div key={section.key} className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                        isCompleted
                          ? `bg-gradient-to-r ${section.color} text-white shadow-lg`
                          : isCurrent
                          ? `bg-gradient-to-r ${section.color} text-white shadow-lg animate-pulse-glow`
                          : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      {isCompleted ? (
                        <Sparkles className="w-5 h-5" />
                      ) : (
                        <SectionIcon className="w-5 h-5" />
                      )}
                    </div>
                    <span className={`text-xs mt-2 font-medium ${isCurrent ? 'text-gray-800' : 'text-gray-500'}`}>
                      {section.title.split(' ')[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Form Section */}
      <div className="animate-fadeInUp animation-delay-200">
        <Card className={`glass-strong rounded-3xl border-0 shadow-2xl overflow-hidden card-hover`}>
          <div className={`h-2 bg-gradient-to-r ${currentSectionData.color}`}></div>
          <div className="p-10">
            <div className="animate-slideInRight">
              {renderCurrentSection()}
            </div>
          </div>
        </Card>
      </div>

      {/* Enhanced Navigation */}
      <div className="flex justify-between mt-8 animate-fadeInUp animation-delay-400">
        <button
          onClick={handlePrevious}
          disabled={currentSection === 0}
          className="group flex items-center px-8 py-4 bg-white/80 backdrop-blur-lg text-gray-700 rounded-2xl hover:bg-white hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 border border-white/50"
        >
          <ChevronLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          Previous
        </button>

        {currentSection === SECTIONS.length - 1 ? (
          <button
            onClick={handleSubmit}
            disabled={!isCurrentSectionComplete() || isSubmitting}
            className="group flex items-center px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl hover:from-emerald-700 hover:to-teal-700 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 mr-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Submitting...</span>
                <Sparkles className="w-5 h-5 ml-2 animate-pulse" />
              </>
            ) : (
              <>
                <Send className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
                Submit Assessment
                <Sparkles className="w-5 h-5 ml-2 group-hover:rotate-12 transition-transform" />
              </>
            )}
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={!isCurrentSectionComplete()}
            className="group flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
          >
            Next Section
            <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </button>
        )}
      </div>
    </div>
  );
}; 