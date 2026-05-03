import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { SurveyService } from '../../services/survey.service';

@Component({
  selector: 'app-highlights',
  imports: [RouterLink],
  templateUrl: './highlights.html',
  styleUrl: './highlights.scss',
})
export class Highlights {
  private readonly surveyService = inject(SurveyService);

  readonly highlightSurveys = computed(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return this.surveyService
      .surveys()
      .filter((survey) => survey.status === 'published' && new Date(`${survey.endDate}T00:00:00`) >= today)
      .sort((firstSurvey, secondSurvey) => {
        const firstEndDate = new Date(`${firstSurvey.endDate}T00:00:00`).getTime();
        const secondEndDate = new Date(`${secondSurvey.endDate}T00:00:00`).getTime();
        return firstEndDate - secondEndDate;
      })
      .slice(0, 3);
  });

  getSurveyEndLabel(endDateValue: string): string {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endDate = new Date(`${endDateValue}T00:00:00`);
    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    const diffDays = Math.round((endDate.getTime() - today.getTime()) / millisecondsPerDay);
    if (diffDays > 1) return `Ends in ${diffDays} days`;
    if (diffDays === 1) return 'Ends in 1 day';
    return 'Ends today';
  }
}
