export interface BasicInfo {
  name: string;
  age: number;
  grade: string;
  schoolName: string;
  parentOccupation: string;
  familyCollegeDegree: 'yes' | 'no' | 'not-sure';
}

export interface InterestAspiration {
  enjoyLearning: 'yes' | 'sometimes' | 'no';
  futureThoughts: 'very-clearly' | 'some-ideas' | 'no';
  studyAfterSchool: 'yes-definitely' | 'maybe' | 'not-really';
  educationLevel: '10th' | '12th' | 'diploma' | 'undergraduate' | 'postgraduate' | 'not-sure';
  interestedField: string;
}

export interface MotivationAwareness {
  reasonsForStudy: Array<'good-job' | 'learn-more' | 'support-family' | 'encouraged' | 'other'>;
  otherReason?: string;
  scholarshipAwareness: 'yes' | 'somewhat' | 'no';
  discussPlans: 'regularly' | 'occasionally' | 'not-really';
  confidence: 'very-confident' | 'somewhat-confident' | 'not-sure' | 'not-possible';
}

export interface ReadinessSupport {
  hasBooks: boolean;
  hasQuietSpace: boolean;
  hasInternet: boolean;
  studyHours: 'less-1' | '1-2' | '2-4' | 'more-4';
  challenges: Array<'financial' | 'guidance' | 'family-responsibilities' | 'confidence' | 'other'>;
  otherChallenge?: string;
}

export interface SelfReflection {
  educationMeaning: string;
  futureGoal: string;
}

export interface QuestionnaireData {
  basicInfo: BasicInfo;
  interestAspiration: InterestAspiration;
  motivationAwareness: MotivationAwareness;
  readinessSupport: ReadinessSupport;
  selfReflection: SelfReflection;
}

export interface StudentScore {
  id: string;
  name: string;
  totalScore: number;
  breakdownScores: {
    higherEducationDesire: number;
    clarityOfAspiration: number;
    consistentMotivation: number;
    proactiveBehavior: number;
    studyHabits: number;
    overcomingBarriers: number;
  };
  questionnaire: QuestionnaireData;
} 