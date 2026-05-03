import { Injectable, signal } from '@angular/core';

import { TEST_SURVEYS } from '../data/test-surveys';
import type { Survey } from '../interfaces/survey.interface';
import type { SurveyVoteSubmission } from '../interfaces/survey-vote-submission.interface';

@Injectable({
  providedIn: 'root',
})
export class SurveyService {
  private readonly surveysSignal = signal<Survey[]>(TEST_SURVEYS);
  private readonly answeredSurveyIdsSignal = signal<string[]>([]);

  readonly surveys = this.surveysSignal.asReadonly();
  readonly answeredSurveyIds = this.answeredSurveyIdsSignal.asReadonly();

  getSurveyById(surveyId: string): Survey | null {
    return this.surveys().find((survey) => survey.id === surveyId) ?? null;
  }

  isSurveyAnswered(surveyId: string): boolean {
    return this.answeredSurveyIdsSignal().includes(surveyId);
  }

  async submitVote(submission: SurveyVoteSubmission): Promise<void> {
    this.surveysSignal.update((surveys) =>
      surveys.map((survey) => {
        if (survey.id !== submission.surveyId) {
          return survey;
        }

        return {
          ...survey,
          questions: survey.questions.map((question) => {
            const selectedQuestion = submission.selections.find((selection) => selection.questionId === question.id);

            if (!selectedQuestion || selectedQuestion.answerIds.length === 0) {
              return question;
            }

            const selectedAnswerIds = question.multiple
              ? selectedQuestion.answerIds
              : selectedQuestion.answerIds.slice(0, 1);

            return {
              ...question,
              answers: question.answers.map((answer) => {
                if (!selectedAnswerIds.includes(answer.id)) {
                  return answer;
                }

                return {
                  ...answer,
                  votes: answer.votes + 1,
                };
              }),
            };
          }),
        };
      }),
    );

    if (submission.selections.length > 0) {
      this.answeredSurveyIdsSignal.update((answeredSurveyIds) =>
        answeredSurveyIds.includes(submission.surveyId)
          ? answeredSurveyIds
          : [...answeredSurveyIds, submission.surveyId],
      );
    }
  }
}
