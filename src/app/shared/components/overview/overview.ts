import { Component } from '@angular/core';
import { Hero } from "../hero/hero";
import { Highlights } from "../highlights/highlights";

@Component({
  selector: 'app-overview',
  imports: [Hero, Highlights],
  templateUrl: './overview.html',
  styleUrl: './overview.scss',
})
export class Overview {}
