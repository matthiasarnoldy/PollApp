import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
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
  private readonly route = inject(ActivatedRoute);
  private readonly surveyService = inject(SurveyService);
  private readonly queryParamMap = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });

  readonly surveys = this.surveyService.surveys;
  readonly selectedSurvey = computed(() => {
    const surveyId = this.queryParamMap().get('id');
    if (!surveyId) return this.surveys()[0] ?? null;
    return this.surveys().find((survey) => survey.id === surveyId) ?? null;
  });
}
