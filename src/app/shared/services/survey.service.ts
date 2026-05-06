import { Injectable, OnDestroy, signal } from '@angular/core';
import type { RealtimeChannel } from '@supabase/supabase-js';

import type { NewSurveyPayload } from '../interfaces/new-survey-payload.interface';
import type { Survey } from '../interfaces/survey.interface';
import type { SurveyVoteSubmission } from '../interfaces/survey-vote-submission.interface';
import type { SurveyRow } from '../types/survey-row.type';
import { isSupabaseConfigured, supabase } from './supabase.client';

@Injectable({
  providedIn: 'root',
})
export class SurveyService implements OnDestroy {
  private readonly surveysSignal = signal<Survey[]>([]);
  private readonly answeredSurveyIdsSignal = signal<string[]>([]);
  private surveyInsertChannel: RealtimeChannel | null = null;
  private surveyDeleteChannel: RealtimeChannel | null = null;
  private surveyUpdateChannel: RealtimeChannel | null = null;

  readonly surveys = this.surveysSignal.asReadonly();
  readonly answeredSurveyIds = this.answeredSurveyIdsSignal.asReadonly();

  constructor() {
    void this.getSurveys();
    this.addSurveyChannel();
    this.deleteSurveyChannel();
    this.updateSurveyChannel();
  }

  ngOnDestroy(): void {
    if (this.surveyInsertChannel) {
      void supabase.removeChannel(this.surveyInsertChannel);
      this.surveyInsertChannel = null;
    }
    if (this.surveyDeleteChannel) {
      void supabase.removeChannel(this.surveyDeleteChannel);
      this.surveyDeleteChannel = null;
    }
    if (this.surveyUpdateChannel) {
      void supabase.removeChannel(this.surveyUpdateChannel);
      this.surveyUpdateChannel = null;
    }
  }

  /**
   * Loads all surveys from Supabase into local signal state.
   */
  async getSurveys(): Promise<void> {
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
   * Converts an internal Survey to the Supabase row shape.
   * @param survey - The survey model used in the app.
   */
  private mapSurveyToRow(survey: Survey): SurveyRow {
    return {
      id: survey.id,
      title: survey.title,
      description: survey.description,
      category: survey.category,
      status: survey.status,
      end_date: survey.endDate,
      questions: survey.questions,
    };
  }

  /**
   * Inserts a survey row in Supabase.
   * @param survey - The survey to insert.
   */
  private async addSurvey(survey: Survey): Promise<void> {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase
      .from('surveys')
      .insert([this.mapSurveyToRow(survey)])
      .select();

    if (error) console.error('Failed to insert survey in Supabase:', error.message);
  }

  /**
   * Updates an existing survey row in Supabase.
   * @param survey - The survey to update.
   */
  private async updateSurvey(survey: Survey): Promise<void> {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase
      .from('surveys')
      .update(this.mapSurveyToRow(survey))
      .eq('id', survey.id)
      .select();
    if (error) console.error('Failed to persist survey in Supabase:', error.message);
  }

  /**
   * Subscribes to INSERT changes on the surveys table.
   */
  private addSurveyChannel(): void {
    this.surveyInsertChannel = supabase.channel('custom-insert-channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'surveys' },
        (payload) => {
          const insertedSurvey = this.mapRowToSurvey(payload.new as SurveyRow);
          this.surveysSignal.update((surveys) =>
            surveys.some((survey) => survey.id === insertedSurvey.id) ? surveys : [...surveys, insertedSurvey],
          );
        },
      )
      .subscribe();
  }

  /** Subscribes to DELETE changes on the surveys table. */
  private deleteSurveyChannel(): void {
    this.surveyDeleteChannel = supabase.channel('custom-delete-channel')
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'surveys' },
        (payload) => {
          const deletedSurveyId = payload.old['id'] as string | undefined;
          if (!deletedSurveyId) return;
          this.surveysSignal.update((surveys) =>
            surveys.filter((survey) => survey.id !== deletedSurveyId),
          );
        },
      )
      .subscribe();
  }

  /** Subscribes to UPDATE changes on the surveys table. */
  private updateSurveyChannel(): void {
    this.surveyUpdateChannel = supabase.channel('custom-update-channel')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'surveys' },
        (payload) => {
          const updatedSurvey = this.mapRowToSurvey(payload.new as SurveyRow);
          this.surveysSignal.update((surveys) =>
            surveys.map((survey) =>
              survey.id === updatedSurvey.id ? updatedSurvey : survey,
            ),
          );
        },
      )
      .subscribe();
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
    await this.addSurvey(newSurvey);
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
    const selectedSurvey = this.surveys().find((survey) => survey.id === submission.surveyId);
    if (!selectedSurvey) return;
    const updatedSurvey = this.applyVotesToSurvey(selectedSurvey, submission);
    if (updatedSurvey) await this.updateSurvey(updatedSurvey);
    if (submission.selections.length > 0) {
      this.answeredSurveyIdsSignal.update((answeredSurveyIds) =>
        answeredSurveyIds.includes(submission.surveyId) ? answeredSurveyIds : [...answeredSurveyIds, submission.surveyId],
      );
    }
  }

  /**
   * Deletes a survey by ID in Supabase and updates local state.
   * @param surveyId - The ID of the survey to delete.
   */
  async deleteSurvey(surveyId: string): Promise<void> {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase
      .from('surveys')
      .delete()
      .eq('id', surveyId);
    if (error) console.error('Failed to delete survey in Supabase:', error.message);
  }
}
