import { Component, computed, input } from '@angular/core';

import type { Survey } from '../../interfaces/survey.interface';

@Component({
  selector: 'app-survey-results',
  imports: [],
  templateUrl: './survey-results.html',
  styleUrl: './survey-results.scss',
})
export class SurveyResults {
  readonly survey = input<Survey | null>(null);

  readonly questionResults = computed(() => {
    const selectedSurvey = this.survey();
    if (!selectedSurvey) return [];
    return selectedSurvey.questions.map((question) => {
      const totalVotes = question.answers.reduce((sum, answer) => sum + answer.votes, 0);
      return {
        id: question.id,
        text: question.text,
        answers: question.answers.map((answer) => {
          const percent = totalVotes > 0 ? Math.round((answer.votes / totalVotes) * 100) : 0;
          return {id: answer.id, text: answer.text, percent}
        }),
      };
    });
  });

  getAnswerLetter(index: number): string {
    return String.fromCharCode(65 + index);
  }
}
