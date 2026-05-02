import { Component } from '@angular/core';
import { Header } from "../header/header";
import { SurveyCreateForm } from "../survey-create-form/survey-create-form";

@Component({
  selector: 'app-survey-create',
  imports: [Header, SurveyCreateForm],
  templateUrl: './survey-create.html',
  styleUrl: './survey-create.scss',
})
export class SurveyCreate {}
