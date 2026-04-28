import { Component } from '@angular/core';
import { Hero } from "../hero/hero";
import { CurrentSurveys } from "../current-surveys/current-surveys";

@Component({
  selector: 'app-overview',
  imports: [Hero, CurrentSurveys],
  templateUrl: './overview.html',
  styleUrl: './overview.scss',
})
export class Overview {}
