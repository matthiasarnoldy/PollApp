import type { SurveyAnswer } from './survey-answer.interface';

export interface SurveyQuestion {
  id: string;
  text: string;
  multiple: boolean;
  answers: SurveyAnswer[];
}
