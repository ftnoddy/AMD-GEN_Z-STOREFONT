import { QuestionnaireData, StudentScore } from '../types/questionnaire';

export function calculateScore(data: QuestionnaireData): Pick<StudentScore, 'totalScore' | 'breakdownScores'> {
  const scores = {
    higherEducationDesire: 0,
    clarityOfAspiration: 0,
    consistentMotivation: 0,
    proactiveBehavior: 0,
    studyHabits: 0,
    overcomingBarriers: 0,
  };

  // 1. Strong Desire to Pursue Higher Education (Max 20 Points)
  // Study after Class 10/12
  if (data.interestAspiration.studyAfterSchool === 'yes-definitely') {
    scores.higherEducationDesire += 10;
  } else if (data.interestAspiration.studyAfterSchool === 'maybe') {
    scores.higherEducationDesire += 5;
  }

  // Future thoughts/career goals
  if (data.interestAspiration.futureThoughts === 'very-clearly') {
    scores.higherEducationDesire += 10;
  } else if (data.interestAspiration.futureThoughts === 'some-ideas') {
    scores.higherEducationDesire += 5;
  }

  // 2. Clarity of Aspiration (Max 20 Points)
  // Specific field mentioned
  if (data.interestAspiration.interestedField.trim().length > 10) {
    scores.clarityOfAspiration += 10;
  }

  // Self-reflection responses
  const reflectionQuality = assessReflectionQuality(data.selfReflection.educationMeaning, data.selfReflection.futureGoal);
  scores.clarityOfAspiration += reflectionQuality;

  // 3. Consistent Motivation (Max 15 Points)
  const motivationCount = data.motivationAwareness.reasonsForStudy.length;
  if (motivationCount >= 3) {
    scores.consistentMotivation = 15;
  } else if (motivationCount === 2) {
    scores.consistentMotivation = 10;
  } else if (motivationCount === 1) {
    scores.consistentMotivation = 5;
  }

  // 4. Proactive Behavior & Support-Seeking (Max 15 Points)
  // Talks to mentors about future
  if (data.motivationAwareness.discussPlans === 'regularly') {
    scores.proactiveBehavior += 10;
  } else if (data.motivationAwareness.discussPlans === 'occasionally') {
    scores.proactiveBehavior += 5;
  }

  // Scholarship awareness
  if (data.motivationAwareness.scholarshipAwareness === 'yes') {
    scores.proactiveBehavior += 5;
  } else if (data.motivationAwareness.scholarshipAwareness === 'somewhat') {
    scores.proactiveBehavior += 3;
  }

  // 5. Study Habits and Readiness (Max 15 Points)
  // Study hours outside school
  if (data.readinessSupport.studyHours === 'more-4' || data.readinessSupport.studyHours === '2-4') {
    scores.studyHabits += 10;
  } else if (data.readinessSupport.studyHours === '1-2') {
    scores.studyHabits += 5;
  }

  // Access to resources
  const resourcesCount = [data.readinessSupport.hasBooks, data.readinessSupport.hasQuietSpace, data.readinessSupport.hasInternet].filter(Boolean).length;
  if (resourcesCount === 3) {
    scores.studyHabits += 5;
  } else if (resourcesCount === 2) {
    scores.studyHabits += 3;
  } else if (resourcesCount === 1) {
    scores.studyHabits += 1;
  }

  // 6. Overcoming Barriers (Max 15 Points)
  // Award bonus points for high aspiration despite barriers
  const hasSignificantBarriers = data.readinessSupport.challenges.includes('financial') || 
                                data.readinessSupport.challenges.includes('family-responsibilities');
  
  if (hasSignificantBarriers && scores.higherEducationDesire >= 15) {
    scores.overcomingBarriers = 15;
  } else if (hasSignificantBarriers && scores.higherEducationDesire >= 10) {
    scores.overcomingBarriers = 10;
  } else if (data.motivationAwareness.confidence === 'very-confident') {
    scores.overcomingBarriers = 10;
  } else if (data.motivationAwareness.confidence === 'somewhat-confident') {
    scores.overcomingBarriers = 5;
  }

  const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);

  return {
    totalScore,
    breakdownScores: scores,
  };
}

function assessReflectionQuality(educationMeaning: string, futureGoal: string): number {
  const combinedLength = educationMeaning.length + futureGoal.length;
  const hasDepth = educationMeaning.includes('learn') || educationMeaning.includes('grow') || educationMeaning.includes('future') ||
                   futureGoal.includes('help') || futureGoal.includes('become') || futureGoal.includes('achieve');

  if (combinedLength > 100 && hasDepth) {
    return 10; // Clear and inspiring
  } else if (combinedLength > 50) {
    return 5; // Somewhat clear
  } else {
    return 0; // Vague or blank
  }
} 