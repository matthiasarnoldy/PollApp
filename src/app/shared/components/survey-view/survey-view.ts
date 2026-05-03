import { Component, inject } from '@angular/core';
import { Header } from "../header/header";
import { SurveyViewDetail } from "../survey-view-detail/survey-view-detail";
import { SurveyResults } from "../survey-results/survey-results";

import { SurveyService } from '../../services/survey.service';

@Component({
  selector: 'app-survey-view',
  imports: [Header, SurveyViewDetail, SurveyResults],
  templateUrl: './survey-view.html',
  styleUrl: './survey-view.scss',
})
export class SurveyView {
  private readonly surveyService = inject(SurveyService);

  readonly surveys = this.surveyService.surveys;
}
