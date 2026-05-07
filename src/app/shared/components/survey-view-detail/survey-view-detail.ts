import { Component, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import type { Survey } from '../../interfaces/survey.interface';
import { parseDdMmYyyy } from '../../utils/date.utils';
import type { SurveyVoteSelection } from '../../interfaces/survey-vote-submission.interface';
import { SurveyService } from '../../services/survey.service';

@Component({
  selector: 'app-survey-view-detail',
  imports: [RouterLink],
  templateUrl: './survey-view-detail.html',
  styleUrl: './survey-view-detail.scss',
})
export class SurveyViewDetail {
  private readonly surveyService = inject(SurveyService);
  private readonly router = inject(Router);
  private readonly selectedAnswers = signal<Record<string, string[]>>({});

  readonly survey = input<Survey | null>(null);

  /**
   * Returns a formatted label for the survey's end date.
   * @param endDateValue - The end date string in `dd.mm.yyyy` format.
   * @returns A localized string such as `'Ends on 31.12.2025'`, or `'No end date'` if empty.
   */
  getEndDateLabel(endDateValue: string): string {
    if (!endDateValue.trim()) return 'No end date';
    const formattedDate = new Intl.DateTimeFormat('de-DE').format(parseDdMmYyyy(endDateValue));
    return `Ends on ${formattedDate}`;
  }

  /**
   * Returns the letter label (A, B, C, …) for an answer at the given index.
   * @param index - The zero-based index of the answer.
   */
  getAnswerLetter(index: number): string {
    return String.fromCharCode(65 + index);
  }

  /**
   * Returns an informational label for a question based on its selection type.
   * @param multiple - Whether the question allows multiple answers.
   * @returns A hint string for multi-choice questions, or an empty string for single-choice.
   */
  getQuestionInfoLabel(multiple: boolean): string {
    return multiple ? 'More than one answers is possible' : '';
  }

  /**
   * Checks whether a specific answer is currently selected by the user.
   * @param questionId - The ID of the question.
   * @param answerId - The ID of the answer to check.
   */
  isAnswerSelected(questionId: string, answerId: string): boolean {
    return (this.selectedAnswers()[questionId] ?? []).includes(answerId);
  }

  /**
   * Handles a change event on an answer input (checkbox or radio).
   * Updates the internal `selectedAnswers` signal accordingly.
   * @param questionId - The ID of the question being answered.
   * @param answerId - The ID of the answer that was changed.
   * @param multiple - Whether the question allows multiple selections.
   * @param checked - Whether the answer input is now checked.
   */
  onAnswerChange(questionId: string, answerId: string, multiple: boolean, checked: boolean): void {
    this.selectedAnswers.update((currentSelections) => {
      const currentAnswerIds = currentSelections[questionId] ?? [];
      const nextAnswerIds = this.getNextAnswerIds(currentAnswerIds, answerId, multiple, checked);
      const nextSelections = { ...currentSelections };
      if (nextAnswerIds.length === 0) {
        delete nextSelections[questionId];
      } else {
        nextSelections[questionId] = nextAnswerIds;
      }
      return nextSelections;
    });
  }

  /**
   * Computes the next set of selected answer IDs after a change event.
   * For single-choice questions, only one answer is kept at most.
   * @param currentAnswerIds - The currently selected answer IDs for the question.
   * @param answerId - The answer ID that was toggled.
   * @param multiple - Whether multiple selections are allowed.
   * @param checked - Whether the answer was checked or unchecked.
   */
  private getNextAnswerIds(currentAnswerIds: string[], answerId: string, multiple: boolean, checked: boolean): string[] {
    if (!multiple) return checked ? [answerId] : [];
    if (checked) return currentAnswerIds.includes(answerId) ? currentAnswerIds : [...currentAnswerIds, answerId];
    return currentAnswerIds.filter((currentAnswerId) => currentAnswerId !== answerId);
  }

  /**
   * Submits the user's current answer selections, updates the vote counts in the service,
   * resets local selection state, and navigates back to the home page.
   */
  async completeSurvey(): Promise<void> {
    const selectedSurvey = this.survey();
    if (!selectedSurvey) return;
    const selections = this.getSurveySelections(selectedSurvey);
    await this.surveyService.submitVote({
      surveyId: selectedSurvey.id,
      selections,
    });
    this.selectedAnswers.set({});
    await this.router.navigate(['/'], { queryParams: { voted: 'true' } });
  }

  /**
   * Builds the list of vote selections to submit, containing only questions
   * for which at least one answer has been selected.
   * @param selectedSurvey - The survey currently being viewed.
   */
  private getSurveySelections(selectedSurvey: Survey): SurveyVoteSelection[] {
    return selectedSurvey.questions
      .map((question) => ({
        questionId: question.id,
        answerIds: this.selectedAnswers()[question.id] ?? [],
      }))
      .filter((selection) => selection.answerIds.length > 0);
  }
}
