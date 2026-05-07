import { Component, computed, input, signal } from '@angular/core';

import type { Survey } from '../../interfaces/survey.interface';

@Component({
  selector: 'app-survey-results',
  imports: [],
  templateUrl: './survey-results.html',
  styleUrl: './survey-results.scss',
})
export class SurveyResults {
  readonly isMobileResultsOpen = signal(true);
  readonly survey = input<Survey | null>(null);
  toggleMobileResults(): void {
    this.isMobileResultsOpen.update((open) => !open);
  }

  /**
   * Returns the mobile toggle button label based on current open state.
   * @returns `'Close results'` when expanded, otherwise `'Open results'`.
   */
  getMobileToggleLabel(): string {
    return this.isMobileResultsOpen() ? 'Close results' : 'Open results';
  }


  readonly hasAnyVotes = computed(() => {
    const selectedSurvey = this.survey();
    if (!selectedSurvey) return false;
    return selectedSurvey.questions.some((question) => question.answers.some((answer) => answer.votes > 0));
  });

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

  /**
   * Returns the letter label (A, B, C, …) for an answer at the given index.
   * @param index - The zero-based index of the answer.
   */
  getAnswerLetter(index: number): string {
    return String.fromCharCode(65 + index);
  }
}
