import { Component } from '@angular/core';
import { Header } from "../header/header";
import { Overview } from "../overview/overview";
import { Surveys } from "../surveys/surveys";

@Component({
  selector: 'app-home',
  imports: [Header, Overview, Surveys],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {}
