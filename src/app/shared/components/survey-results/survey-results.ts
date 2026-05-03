import { Component, inject } from '@angular/core';

import { SurveyService } from '../../services/survey.service';

@Component({
  selector: 'app-survey-results',
  imports: [],
  templateUrl: './survey-results.html',
  styleUrl: './survey-results.scss',
})
export class SurveyResults {}
export class SurveyResults {
  private readonly surveyService = inject(SurveyService);

  readonly surveys = this.surveyService.surveys;
}
