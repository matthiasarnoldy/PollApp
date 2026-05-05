import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { SurveyService } from '../../services/survey.service';
import { parseDdMmYyyy } from '../../utils/date.utils';

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
      .filter((survey) => survey.status === 'published' && (!survey.endDate.trim() || parseDdMmYyyy(survey.endDate) >= today))
      .sort((firstSurvey, secondSurvey) => {
        const firstEndDate = firstSurvey.endDate.trim() ? parseDdMmYyyy(firstSurvey.endDate).getTime() : Number.POSITIVE_INFINITY;
        const secondEndDate = secondSurvey.endDate.trim() ? parseDdMmYyyy(secondSurvey.endDate).getTime() : Number.POSITIVE_INFINITY;
        return firstEndDate - secondEndDate;
      })
      .slice(0, 3);
  });

  /**
   * Returns a human-readable label describing when the survey ends.
   * Returns `'No end date'` if no end date is set.
   * @param endDateValue - The end date string in `dd.mm.yyyy` format.
   */
  getSurveyEndLabel(endDateValue: string): string {
    if (!endDateValue.trim()) return 'No end date';
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endDate = parseDdMmYyyy(endDateValue);
    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    const diffDays = Math.round((endDate.getTime() - today.getTime()) / millisecondsPerDay);
    if (diffDays > 1) return `Ends in ${diffDays} days`;
    if (diffDays === 1) return 'Ends in 1 day';
    return 'Ends today';
  }
}
