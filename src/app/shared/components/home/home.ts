import { Component, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { Header } from "../header/header";
import { Overview } from "../overview/overview";
import { Surveys } from "../surveys/surveys";

@Component({
  selector: 'app-home',
  imports: [Header, Overview, Surveys],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly queryParamMap = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });

  readonly showPublishedMessage = signal(false);

  constructor() {
    effect((onCleanup) => {
      const shouldShowMessage = this.queryParamMap().get('published') === 'true';
      if (!shouldShowMessage) {
        this.showPublishedMessage.set(false);
        return;
      }
      this.showPublishedMessage.set(true);
      const timeoutId = this.scheduleHidePublishedMessage();
      onCleanup(() => window.clearTimeout(timeoutId));
    });
  }

  /**
   * Schedules hiding the published overlay message and removes the `published` query param from the URL.
   * @returns The timeout ID used for cleanup.
   */
  private scheduleHidePublishedMessage(): number {
    return window.setTimeout(() => {
      this.showPublishedMessage.set(false);
      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { published: null },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    }, 3000);
  }
}
