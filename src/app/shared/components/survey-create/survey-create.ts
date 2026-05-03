import { Component, inject } from '@angular/core';
import { Header } from "../header/header";
import { SurveyCreateForm } from "../survey-create-form/survey-create-form";

import { SurveyService } from '../../services/survey.service';

@Component({
  selector: 'app-survey-create',
  imports: [Header, SurveyCreateForm],
  templateUrl: './survey-create.html',
  styleUrl: './survey-create.scss',
})
export class SurveyCreate {
  private readonly surveyService = inject(SurveyService);

  readonly surveys = this.surveyService.surveys;
}
