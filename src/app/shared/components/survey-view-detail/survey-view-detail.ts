import { Component, inject } from '@angular/core';

import { SurveyService } from '../../services/survey.service';

@Component({
  selector: 'app-survey-view-detail',
  imports: [],
  templateUrl: './survey-view-detail.html',
  styleUrl: './survey-view-detail.scss',
})
export class SurveyViewDetail {
  private readonly surveyService = inject(SurveyService);

  readonly surveys = this.surveyService.surveys;
}
