import type { SurveyCategory } from '../types/survey-category.type';
import type { SurveyStatus } from '../types/survey-status.type';
import type { SurveyQuestion } from './survey-question.interface';

export interface Survey {
  id: string;
  category: SurveyCategory | null;
  title: string;
  description: string;
  status: SurveyStatus;
  endDate: string;
  questions: SurveyQuestion[];
}
