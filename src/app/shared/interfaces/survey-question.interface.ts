import type { SurveyAnswer } from './survey-answer.interface';

/** Represents a single question within a survey. */
export interface SurveyQuestion {
  id: string;
  text: string;
  multiple: boolean;
  answers: SurveyAnswer[];
}
