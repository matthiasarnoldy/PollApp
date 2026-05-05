import type { SurveyCategory } from '../types/survey-category.type';

/** Payload for a single question when creating a new survey. */
export interface NewSurveyQuestionPayload {
  text: string;
  multiple: boolean;
  answers: string[];
}

/** Payload required to create a new survey via {@link SurveyService.createSurvey}. */
export interface NewSurveyPayload {
  title: string;
  description: string;
  category: SurveyCategory | null;
  endDate: string;
  questions: NewSurveyQuestionPayload[];
}
