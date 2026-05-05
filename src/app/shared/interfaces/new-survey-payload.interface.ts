import type { SurveyCategory } from '../types/survey-category.type';

export interface NewSurveyQuestionPayload {
  text: string;
  multiple: boolean;
  answers: string[];
}

export interface NewSurveyPayload {
  title: string;
  description: string;
  category: SurveyCategory | null;
  endDate: string;
  questions: NewSurveyQuestionPayload[];
}
