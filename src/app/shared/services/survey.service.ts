import { Injectable, signal } from '@angular/core';

import { TEST_SURVEYS } from '../data/test-surveys';
import type { NewSurveyPayload } from '../interfaces/new-survey-payload.interface';
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
  
  createSurvey(payload: NewSurveyPayload): void {
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
  }

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

  private applyVotesToAnswers(answers: Survey['questions'][number]['answers'], selectedAnswerIds: string[]): Survey['questions'][number]['answers'] {
    return answers.map((answer) => {
      if (!selectedAnswerIds.includes(answer.id)) return answer;
      return { ...answer, votes: answer.votes + 1 };
    });
  }

  isSurveyAnswered(surveyId: string): boolean {
    return this.answeredSurveyIdsSignal().includes(surveyId);
  }

  async submitVote(submission: SurveyVoteSubmission): Promise<void> {
    this.surveysSignal.update((surveys) =>
      surveys.map((survey) => {
        if (survey.id !== submission.surveyId) return survey;
        return this.applyVotesToSurvey(survey, submission);
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
