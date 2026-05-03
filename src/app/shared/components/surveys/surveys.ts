import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { SurveyService } from '../../services/survey.service';

@Component({
  selector: 'app-surveys',
  imports: [RouterLink],
  templateUrl: './surveys.html',
  styleUrl: './surveys.scss',
})
export class Surveys {
  private readonly surveyService = inject(SurveyService);

  readonly surveys = this.surveyService.surveys;
}
