import type { Survey } from '../interfaces/survey.interface';

export type SurveyRow = {
  id: string;
  title: string;
  description: string;
  category: string | null;
  status: Survey['status'];
  end_date: string;
  questions: Survey['questions'];
};
