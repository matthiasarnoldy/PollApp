import { Component, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';

import type { Survey } from '../../interfaces/survey.interface';
import type { SurveyVoteSelection } from '../../interfaces/survey-vote-submission.interface';
import { SurveyService } from '../../services/survey.service';

@Component({
  selector: 'app-survey-view-detail',
  imports: [],
  templateUrl: './survey-view-detail.html',
  styleUrl: './survey-view-detail.scss',
})
export class SurveyViewDetail {
  private readonly surveyService = inject(SurveyService);
  private readonly router = inject(Router);
  private readonly selectedAnswers = signal<Record<string, string[]>>({});

  readonly survey = input<Survey | null>(null);

  getEndDateLabel(endDateValue: string): string {
    const formattedDate = new Intl.DateTimeFormat('de-DE').format(new Date(`${endDateValue}T00:00:00`));
    return `Ends on ${formattedDate}`;
  }

  getAnswerLetter(index: number): string {
    return String.fromCharCode(65 + index);
  }

  getQuestionInfoLabel(multiple: boolean): string {
    return multiple ? 'More than one answers are possible' : '';
  }

  isAnswerSelected(questionId: string, answerId: string): boolean {
    return (this.selectedAnswers()[questionId] ?? []).includes(answerId);
  }

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

  private getNextAnswerIds(currentAnswerIds: string[], answerId: string, multiple: boolean, checked: boolean): string[] {
    if (!multiple) return checked ? [answerId] : [];
    if (checked) return currentAnswerIds.includes(answerId) ? currentAnswerIds : [...currentAnswerIds, answerId];
    return currentAnswerIds.filter((currentAnswerId) => currentAnswerId !== answerId);
  }

  async completeSurvey(): Promise<void> {
    const selectedSurvey = this.survey();
    if (!selectedSurvey) return;
    const selections = this.getSurveySelections(selectedSurvey);
    await this.surveyService.submitVote({
      surveyId: selectedSurvey.id,
      selections,
    });
    this.selectedAnswers.set({});
    await this.router.navigateByUrl('/');
  }

  private getSurveySelections(selectedSurvey: Survey): SurveyVoteSelection[] {
    return selectedSurvey.questions
      .map((question) => ({
        questionId: question.id,
        answerIds: this.selectedAnswers()[question.id] ?? [],
      }))
      .filter((selection) => selection.answerIds.length > 0);
  }
}
