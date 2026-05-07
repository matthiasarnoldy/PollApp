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
  readonly showVotedMessage = signal(false);

  constructor() {
    this.initPublishedMessageEffect();
    this.initVotedMessageEffect();
  }

  /** Registers the effect that shows the published overlay based on the `published` query param. */
  private initPublishedMessageEffect(): void {
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

  /** Registers the effect that shows the voted overlay based on the `voted` query param. */
  private initVotedMessageEffect(): void {
    effect((onCleanup) => {
      const shouldShowVotedMessage = this.queryParamMap().get('voted') === 'true';
      if (!shouldShowVotedMessage) {
        this.showVotedMessage.set(false);
        return;
      }
      this.showVotedMessage.set(true);
      const timeoutId = this.scheduleHideVotedMessage();
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

  /**
   * Schedules hiding the voted overlay message and removes the `voted` query param from the URL.
   * @returns The timeout ID used for cleanup.
   */
  private scheduleHideVotedMessage(): number {
    return window.setTimeout(() => {
      this.showVotedMessage.set(false);
      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { voted: null },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    }, 3000);
  }
}
