import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { SurveyService } from '../../services/survey.service';
import type { SurveyCategory } from '../../types/survey-category.type';
import { parseDdMmYyyy } from '../../utils/date.utils';

@Component({
  selector: 'app-surveys',
  imports: [RouterLink],
  templateUrl: './surveys.html',
  styleUrl: './surveys.scss',
})
export class Surveys {
  private readonly surveyService = inject(SurveyService);
  private readonly selectedCategory = signal<SurveyCategory | null>(null);
  private readonly categoryDropdownOpen = signal(false);
  private readonly timeFilter = signal<'active' | 'past'>('active');

  readonly surveys = this.surveyService.surveys;
  readonly categories = computed(() => {
    const categories = this.surveys()
      .map((survey) => survey.category)
      .filter((category): category is SurveyCategory => category !== null);
    return [...new Set(categories)];
  });
  readonly selectedCategoryLabel = computed(() => this.selectedCategory());
  readonly isCategoryDropdownOpen = this.categoryDropdownOpen.asReadonly();
  readonly selectedTimeFilter = this.timeFilter.asReadonly();
  readonly filteredSurveys = computed(() => {
    const selectedCategory = this.selectedCategory();
    return this.surveys().filter((survey) => {
      const isPublished = survey.status === 'published';
      const isPastSurvey = this.isSurveyPast(survey.id, survey.endDate);
      const matchesTimeFilter = this.timeFilter() === 'active' ? isPublished && !isPastSurvey : isPublished && isPastSurvey;
      const matchesCategory = !selectedCategory || survey.category === selectedCategory;
      return matchesTimeFilter && matchesCategory;
    });
  });

  /**
   * Sets the active category filter and closes the dropdown.
   * @param category - The category to filter surveys by.
   */
  selectCategory(category: SurveyCategory): void {
    this.selectedCategory.set(category);
    this.categoryDropdownOpen.set(false);
  }

  /** Clears the active category filter and closes the dropdown. */
  clearCategoryFilter(): void {
    this.selectedCategory.set(null);
    this.categoryDropdownOpen.set(false);
  }

  /** Toggles the category filter dropdown open/closed state. */
  toggleCategoryDropdown(): void {
    this.categoryDropdownOpen.update((isOpen) => !isOpen);
  }

  /**
   * Sets the active time filter (active or past surveys).
   * @param filter - `'active'` to show ongoing surveys, `'past'` to show ended or answered ones.
   */
  setTimeFilter(filter: 'active' | 'past'): void {
    this.timeFilter.set(filter);
  }

  /**
   * Returns a human-readable label describing when the survey ends or ended.
   * Returns `'No end date'` if no end date is set.
   * @param endDateValue - The end date string in `dd.mm.yyyy` format.
   */
  getSurveyEndLabel(endDateValue: string): string {
    if (!endDateValue.trim()) return 'No end date';
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endDate = parseDdMmYyyy(endDateValue);
    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    const diffDays = Math.round((endDate.getTime() - today.getTime()) / millisecondsPerDay);
    if (diffDays > 1) return `Ends in ${diffDays} days`;
    if (diffDays === 1) return 'Ends in 1 day';
    if (diffDays === 0) return 'Ends today';
    const pastDays = Math.abs(diffDays);
    if (pastDays === 1) return 'Ended 1 day ago';
    return `Ended ${pastDays} days ago`;
  }

  /**
   * Checks whether the survey's end date is in the past.
   * Returns `false` if no end date is set.
   * @param endDateValue - The end date string in `dd.mm.yyyy` format.
   */
  private isSurveyExpired(endDateValue: string): boolean {
    if (!endDateValue.trim()) return false;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endDate = parseDdMmYyyy(endDateValue);
    return endDate < today;
  }

  /**
   * Determines whether a survey should be treated as past (expired or already answered).
   * @param surveyId - The ID of the survey to check.
   * @param endDateValue - The end date string in `dd.mm.yyyy` format.
   * @returns `true` if the survey is expired or the current user has already answered it.
   */
  isSurveyPast(surveyId: string, endDateValue: string): boolean {
    const isAnswered = this.surveyService.isSurveyAnswered(surveyId);
    const isExpired = this.isSurveyExpired(endDateValue);
    return isAnswered || isExpired;
  }
}
