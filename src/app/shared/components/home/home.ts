import { Component } from '@angular/core';
import { Header } from "../header/header";
import { Overview } from "../overview/overview";

@Component({
  selector: 'app-home',
  imports: [Header, Overview],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {}
