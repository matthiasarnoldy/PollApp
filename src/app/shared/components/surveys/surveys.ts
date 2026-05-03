import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { SurveyService } from '../../services/survey.service';
import type { SurveyCategory } from '../../types/survey-category.type';

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
  readonly categories = computed(() => [...new Set(this.surveys().map((survey) => survey.category))]);
  readonly selectedCategoryLabel = computed(() => this.selectedCategory());
  readonly isCategoryDropdownOpen = this.categoryDropdownOpen.asReadonly();
  readonly selectedTimeFilter = this.timeFilter.asReadonly();
  readonly filteredSurveys = computed(() => {
    const selectedCategory = this.selectedCategory();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return this.surveys().filter((survey) => {
      const endDate = new Date(`${survey.endDate}T00:00:00`);
      const isPublished = survey.status === 'published';
      const matchesTimeFilter = this.timeFilter() === 'active' ? isPublished && endDate >= today : isPublished && endDate < today;
      const matchesCategory = !selectedCategory || survey.category === selectedCategory;
      return matchesTimeFilter && matchesCategory;
    });
  });

  selectCategory(category: SurveyCategory): void {
    this.selectedCategory.set(category);
    this.categoryDropdownOpen.set(false);
  }

  clearCategoryFilter(): void {
    this.selectedCategory.set(null);
    this.categoryDropdownOpen.set(false);
  }

  toggleCategoryDropdown(): void {
    this.categoryDropdownOpen.update((isOpen) => !isOpen);
  }

  setTimeFilter(filter: 'active' | 'past'): void {
    this.timeFilter.set(filter);
  }

  getSurveyEndLabel(endDateValue: string): string {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endDate = new Date(`${endDateValue}T00:00:00`);
    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    const diffDays = Math.round((endDate.getTime() - today.getTime()) / millisecondsPerDay);
    if (diffDays > 1) return `Ends in ${diffDays} days`;
    if (diffDays === 1) return 'Ends in 1 day';
    if (diffDays === 0) return 'Ends today';
    const pastDays = Math.abs(diffDays);
    if (pastDays === 1) return 'Ended 1 day ago';
    return `Ended ${pastDays} days ago`;
  }
}
