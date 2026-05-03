import { Injectable, signal } from '@angular/core';

import { TEST_SURVEYS } from '../data/test-surveys';
import type { Survey } from '../interfaces/survey.interface';

@Injectable({
  providedIn: 'root',
})
export class SurveyService {
  private readonly surveysSignal = signal<Survey[]>(TEST_SURVEYS);

  readonly surveys = this.surveysSignal.asReadonly();
}
