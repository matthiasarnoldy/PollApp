import { Component, signal } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('Pollapp');

  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.changeBodyClass(event);
      }
    });
  }

  /**
   * Applies a route-specific CSS class to the document body.
   * @param event - The completed navigation event.
   */
  changeBodyClass(event: NavigationEnd) {
    document.body.className = '';
    const routePath = event.urlAfterRedirects.split('?')[0];
    if (routePath == '/home' || routePath == '/') {
      document.body.classList.add('home');
    } else if (routePath == '/survey/view') {
      document.body.classList.add('survey-view');
    } else if (routePath == '/survey/create') {
      document.body.classList.add('survey-create');
    }
  }
}
