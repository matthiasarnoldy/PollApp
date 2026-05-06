import { Injectable, signal } from '@angular/core';

import type { NewSurveyPayload } from '../interfaces/new-survey-payload.interface';
import type { Survey } from '../interfaces/survey.interface';
import type { SurveyVoteSubmission } from '../interfaces/survey-vote-submission.interface';
import { isSupabaseConfigured, supabase } from './supabase.client';

type SurveyRow = {
  id: string;
  title: string;
  description: string;
  category: string | null;
  status: Survey['status'];
  end_date: string;
  questions: Survey['questions'];
};

@Injectable({
  providedIn: 'root',
})
export class SurveyService {
  private readonly surveysSignal = signal<Survey[]>([]);
  private readonly answeredSurveyIdsSignal = signal<string[]>([]);

  readonly surveys = this.surveysSignal.asReadonly();
  readonly answeredSurveyIds = this.answeredSurveyIdsSignal.asReadonly();

  constructor() {
    void this.loadSurveys();
  }

  /**
   * Loads surveys from Supabase when configured.
   * Returns an empty list if Supabase is not configured.
   */
  private async loadSurveys(): Promise<void> {
    if (!isSupabaseConfigured) {
      this.surveysSignal.set([]);
      return;
    }
    const { data, error } = await supabase
      .from('surveys')
      .select('id, title, description, category, status, end_date, questions')
      .order('created_at', { ascending: false });
    const mappedSurveys = (data ?? []).map((row) => this.mapRowToSurvey(row as SurveyRow));
    this.surveysSignal.set(mappedSurveys);
  }

  /**
   * Converts a Supabase row to the internal Survey model.
   * @param row - The raw row from the `surveys` table.
   */
  private mapRowToSurvey(row: SurveyRow): Survey {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      category: row.category as Survey['category'],
      status: row.status,
      endDate: row.end_date,
      questions: row.questions,
    };
  }

  /**
   * Persists a survey via upsert when Supabase is configured.
   * @param survey - The survey to persist.
   */
  private async persistSurvey(survey: Survey): Promise<void> {
    if (!isSupabaseConfigured) return;
  }

  /**
   * Returns a survey by its unique ID.
   * @param surveyId - The ID of the survey to look up.
   * @returns The matching {@link Survey}, or `null` if not found.
   */
  getSurveyById(surveyId: string): Survey | null {
    return this.surveys().find((survey) => survey.id === surveyId) ?? null;
  }

  /**
   * Creates a new survey from the given payload and appends it to the survey list.
   * The survey is immediately set to `published` status.
   * @param payload - The data required to create the survey.
   */
  async createSurvey(payload: NewSurveyPayload): Promise<void> {
    const newSurvey: Survey = {
      id: `survey-${crypto.randomUUID()}`,
      title: payload.title,
      description: payload.description,
      category: payload.category,
      status: 'published',
      endDate: payload.endDate,
      questions: this.buildQuestions(payload),
    };
    this.surveysSignal.update((surveys) => [...surveys, newSurvey]);
    await this.persistSurvey(newSurvey);
  }

  /**
   * Maps the questions from a {@link NewSurveyPayload} to fully typed {@link Survey} questions,
   * generating unique IDs for each question and answer.
   * @param payload - The survey creation payload containing raw question data.
   * @returns An array of typed survey questions with generated IDs and zero initial votes.
   */
  private buildQuestions(payload: NewSurveyPayload): Survey['questions'] {
    return payload.questions.map((q, qIndex) => ({
      id: `q-${crypto.randomUUID()}-${qIndex}`,
      text: q.text,
      multiple: q.multiple,
      answers: q.answers.map((answerText, aIndex) => ({
        id: `a-${crypto.randomUUID()}-${aIndex}`,
        text: answerText,
        votes: 0,
      })),
    }));
  }

  /**
   * Applies the vote selections from a submission to all questions of a survey.
   * @param survey - The survey to update.
   * @param submission - The vote submission containing selected answer IDs per question.
   * @returns A new {@link Survey} object with updated vote counts.
   */
  private applyVotesToSurvey(survey: Survey, submission: SurveyVoteSubmission): Survey {
    return {
      ...survey,
      questions: survey.questions.map((question) => {
        const selectedQuestion = submission.selections.find((selection) => selection.questionId === question.id);
        if (!selectedQuestion || selectedQuestion.answerIds.length === 0) return question;
        const selectedAnswerIds = question.multiple ? selectedQuestion.answerIds : selectedQuestion.answerIds.slice(0, 1);
        return {
          ...question,
          answers: this.applyVotesToAnswers(question.answers, selectedAnswerIds),
        };
      }),
    };
  }

  /**
   * Increments the vote count for each answer whose ID is included in `selectedAnswerIds`.
   * @param answers - The list of answers to update.
   * @param selectedAnswerIds - The IDs of answers that received a vote.
   * @returns A new array of answers with updated vote counts.
   */
  private applyVotesToAnswers(answers: Survey['questions'][number]['answers'], selectedAnswerIds: string[]): Survey['questions'][number]['answers'] {
    return answers.map((answer) => {
      if (!selectedAnswerIds.includes(answer.id)) return answer;
      return { ...answer, votes: answer.votes + 1 };
    });
  }

  /**
   * Checks whether the current user has already submitted a vote for the given survey.
   * @param surveyId - The ID of the survey to check.
   * @returns `true` if the survey has been answered, `false` otherwise.
   */
  isSurveyAnswered(surveyId: string): boolean {
    return this.answeredSurveyIdsSignal().includes(surveyId);
  }

  /**
   * Submits a vote for a survey by applying the selected answers to the survey's vote counts
   * and registering the survey as answered for the current user.
   * For single-answer questions, only the first selected answer ID is applied.
   * @param submission - The vote submission containing the survey ID and answer selections.
   */
  async submitVote(submission: SurveyVoteSubmission): Promise<void> {
    this.surveysSignal.update((surveys) =>
      surveys.map((survey) => {
        if (survey.id !== submission.surveyId) return survey;
        return this.applyVotesToSurvey(survey, submission);
      }),
    );
    const updatedSurvey = this.surveysSignal().find((survey) => survey.id === submission.surveyId);
    if (updatedSurvey) await this.persistSurvey(updatedSurvey);
    if (submission.selections.length > 0) {
      this.answeredSurveyIdsSignal.update((answeredSurveyIds) =>
        answeredSurveyIds.includes(submission.surveyId) ? answeredSurveyIds : [...answeredSurveyIds, submission.surveyId],
      );
    }
  }
}
