import { Component, input } from '@angular/core';

import type { Survey } from '../../interfaces/survey.interface';

@Component({
  selector: 'app-survey-view-detail',
  imports: [],
  templateUrl: './survey-view-detail.html',
  styleUrl: './survey-view-detail.scss',
})
export class SurveyViewDetail {
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
}
