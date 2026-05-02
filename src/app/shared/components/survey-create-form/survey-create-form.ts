import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-survey-create-form',
  imports: [ReactiveFormsModule],
  templateUrl: './survey-create-form.html',
  styleUrl: './survey-create-form.scss',
})
export class SurveyCreateForm {
  form = new FormGroup({
    name: new FormControl<string>('', { nonNullable: true }),
    setEndDate: new FormControl<string>('', { nonNullable: true }),
    description: new FormControl<string>('', { nonNullable: true }),
  });
}
