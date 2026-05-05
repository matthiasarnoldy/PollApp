import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { SurveyService } from '../../services/survey.service';
import type { NewSurveyPayload } from '../../interfaces/new-survey-payload.interface';
import type { SurveyCategory } from '../../types/survey-category.type';
import { parseDdMmYyyy } from '../../utils/date.utils';

@Component({
  selector: 'app-survey-create-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './survey-create-form.html',
  styleUrl: './survey-create-form.scss',
})
export class SurveyCreateForm {
  private readonly surveyService = inject(SurveyService);
  private readonly router = inject(Router);
  private readonly maxAnswersPerQuestion = 6;
  private readonly maxQuestions = 6;
  private readonly publishAttempted = signal(false);
  readonly categories: SurveyCategory[] = [
    'Team activities',
    'Health & Wellness',
    'Gaming & Entertainment',
    'Education & Learning',
    'Lifestyle & Preferences',
    'Technology & Innovation',
  ];
  readonly isCategoryDropdownOpen = signal(false);
  private readonly surveyNamePattern = /^(?=.{3,80}$)(?=.*[A-Za-zÄÖÜäöüß])[A-Za-zÄÖÜäöüß0-9][A-Za-zÄÖÜäöüß0-9 .,'&()\-]*[A-Za-zÄÖÜäöüß0-9]$/;
  private readonly endDatePattern = /^$|^(0[1-9]|[12][0-9]|3[01])\.(0[1-9]|1[0-2])\.[0-9]{4}$/;
  
  readonly surveys = this.surveyService.surveys;

  /**
   * Creates a new default question form group.
   * @returns A question group containing question text, selection mode, and two empty answers.
   */
  private createQuestionGroup(): FormGroup<{
    question: FormControl<string>;
    allowMultipleAnswers: FormControl<boolean>;
    answers: FormArray<FormControl<string>>;
  }> {
    return new FormGroup({
      question: new FormControl<string>('', { nonNullable: true }),
      allowMultipleAnswers: new FormControl<boolean>(false, { nonNullable: true }),
      answers: new FormArray<FormControl<string>>([
        new FormControl<string>('', { nonNullable: true }),
        new FormControl<string>('', { nonNullable: true }),
      ]),
    });
  }

  form = new FormGroup({
    name: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(this.surveyNamePattern)],
    }),
    setEndDate: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.pattern(this.endDatePattern), this.notPastDateValidator()],
    }),
    description: new FormControl<string>('', { nonNullable: true }),
    category: new FormControl<SurveyCategory | null>(null),
    questions: new FormArray([this.createQuestionGroup()]),
  });

  /** Returns the form control for the survey name field. */
  get nameControl(): FormControl<string> {
    return this.form.controls.name;
  }

  /** Returns the form control for the survey end date field. */
  get endDateControl(): FormControl<string> {
    return this.form.controls.setEndDate;
  }

  /**
   * Checks whether the survey name field is invalid and already touched.
   * @returns `true` when the field should show an error state.
   */
  isSurveyNameInvalid(): boolean {
    return this.nameControl.invalid && this.nameControl.touched;
  }

  /**
   * Returns the validation message for the survey name field.
   * @returns A user-friendly error message, or an empty string if there is no error.
   */
  getSurveyNameErrorMessage(): string {
    if (this.nameControl.hasError('required')) return 'This field is required';
    if (this.nameControl.hasError('pattern')) return 'Please enter a valid name';
    return '';
  }

  /**
   * Checks whether the end date field is invalid and already touched.
   * @returns `true` when the field should show an error state.
   */
  isEndDateInvalid(): boolean {
    return this.endDateControl.invalid && this.endDateControl.touched;
  }

  /**
   * Returns the validation message for the end date field.
   * @returns A user-friendly error message, or an empty string if there is no error.
   */
  getEndDateErrorMessage(): string {
    if (this.endDateControl.hasError('pattern') || this.endDateControl.hasError('invalidDate')) return 'Please enter a valid Date';
    if (this.endDateControl.hasError('pastDate')) return 'Date cannot be in the past';
    return '';
  }

  /**
   * Formats user input in the end date field to the `dd.mm.yyyy` pattern while typing.
   * @param event - The native input event.
   */
  onEndDateInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement | null;
    if (!inputElement) return;
    const inputEvent = event as InputEvent;
    const isDeleting = inputEvent.inputType?.startsWith('delete') ?? false;
    const shouldAppendTrailingDot = !isDeleting;
    const digitsOnly = inputElement.value.replace(/\D/g, '').slice(0, 8);
    const formattedValue = this.formatDateInput(digitsOnly, shouldAppendTrailingDot);
    inputElement.value = formattedValue;
    this.endDateControl.setValue(formattedValue);
  }

  /**
   * Formats a numeric date input string into partial or full `dd.mm.yyyy` format.
   * @param digitsOnly - The input containing digits only.
   * @param appendTrailingDot - Whether to append a trailing dot for completed day/month parts.
   * @returns The formatted date string.
   */
  private formatDateInput(digitsOnly: string, appendTrailingDot: boolean): string {
    if (digitsOnly.length <= 2) {
      return digitsOnly.length === 2 && appendTrailingDot ? `${digitsOnly}.` : digitsOnly;
    }
    if (digitsOnly.length <= 4) {
      const partial = `${digitsOnly.slice(0, 2)}.${digitsOnly.slice(2)}`;
      return digitsOnly.length === 4 && appendTrailingDot ? `${partial}.` : partial;
    }
    return `${digitsOnly.slice(0, 2)}.${digitsOnly.slice(2, 4)}.${digitsOnly.slice(4)}`;
  }

  /** Returns the questions form array from the root form. */
  get questionsArray(): FormArray<FormGroup<{
    question: FormControl<string>;
    allowMultipleAnswers: FormControl<boolean>;
    answers: FormArray<FormControl<string>>;
  }>> {
    return this.form.controls.questions;
  }

  /**
   * Returns the answers form array for a specific question.
   * @param questionIndex - The index of the question.
   */
  getAnswersArray(questionIndex: number): FormArray<FormControl<string>> {
    return this.questionsArray.at(questionIndex).controls.answers;
  }

  /**
   * Ensures a question text ends with `?` when it is non-empty.
   * @param questionIndex - The index of the question to normalize.
   */
  ensureQuestionMark(questionIndex: number): void {
    const questionControl = this.questionsArray.at(questionIndex)?.controls.question;
    if (!questionControl) return;
    const trimmedQuestion = questionControl.value.trimEnd();
    if (trimmedQuestion.length === 0) {
      questionControl.setValue('');
      return;
    }
    if (trimmedQuestion.endsWith('?')) {
      questionControl.setValue(trimmedQuestion);
      return;
    }
    questionControl.setValue(`${trimmedQuestion}?`);
  }

  /** Returns the form control for the survey category field. */
  get categoryControl(): FormControl<SurveyCategory | null> {
    return this.form.controls.category;
  }

  /** Toggles the category dropdown open/closed state. */
  toggleCategoryDropdown(): void {
    this.isCategoryDropdownOpen.update((open) => !open);
  }

  /**
   * Sets the selected category and closes the category dropdown.
   * @param category - The category to select.
   */
  selectCategory(category: SurveyCategory): void {
    this.categoryControl.setValue(category);
    this.isCategoryDropdownOpen.set(false);
  }

  /** Clears the selected category. */
  clearCategory(): void {
    this.categoryControl.setValue(null);
  }

  /**
   * Determines whether the question section should display a validation error.
   * @returns `true` if publish was attempted and the required first question is incomplete.
   */
  isQuestionSectionInvalid(): boolean {
    return this.publishAttempted() && !this.hasAtLeastOneCompleteQuestion();
  }

  /**
   * Validates the form, creates a new survey, and navigates back to the home route.
   */
  async publish(): Promise<void> {
    this.publishAttempted.set(true);
    this.form.markAllAsTouched();
    if (this.nameControl.invalid || this.endDateControl.invalid) return;
    if (!this.hasAtLeastOneCompleteQuestion()) return;
    this.surveyService.createSurvey(this.buildPayload());
    await this.router.navigateByUrl('/?published=true');
  }

  /**
   * Builds the service payload from current form values.
   * @returns A normalized payload for survey creation.
   */
  private buildPayload(): NewSurveyPayload {
    const raw = this.form.getRawValue();
    return {
      title: raw.name,
      description: raw.description,
      category: raw.category,
      endDate: raw.setEndDate,
      questions: raw.questions
        .map((q) => ({
          text: q.question,
          multiple: q.allowMultipleAnswers,
          answers: q.answers.filter((a) => a.trim().length > 0),
        }))
        .filter((q) => q.text.trim().length > 0),
    };
  }

  /**
   * Validates that the first question contains text and only non-empty answers.
   * @returns `true` if the first question is complete.
   */
  private hasAtLeastOneCompleteQuestion(): boolean {
    const firstQuestionGroup = this.questionsArray.at(0);
    if (!firstQuestionGroup) return false;
    return firstQuestionGroup.controls.question.value.trim().length > 0 &&
      firstQuestionGroup.controls.answers.controls.length > 0 &&
      firstQuestionGroup.controls.answers.controls.every((answerControl) => answerControl.value.trim().length > 0);
  }

  /**
   * Clears one of the base form fields.
   * @param fieldName - The form control name to clear.
   */
  clearBaseField(fieldName: 'name' | 'setEndDate' | 'description'): void {
    this.form.controls[fieldName].setValue('');
  }

  /** Adds a new question group if the maximum question limit is not reached. */
  addQuestion(): void {
    if (this.questionsArray.length >= this.maxQuestions) return;
    this.questionsArray.push(this.createQuestionGroup());
  }

  /**
   * Checks whether a new question can be added.
   * @returns `true` when the question count is below the configured maximum.
   */
  canAddQuestion(): boolean {
    return this.questionsArray.length < this.maxQuestions;
  }

  /**
   * Clears or removes a question depending on its current state.
   * @param questionIndex - The index of the question to clear or remove.
   */
  deleteQuestion(questionIndex: number): void {
    const questionGroup = this.questionsArray.at(questionIndex);
    if (!questionGroup) return;
    const questionControl = questionGroup.controls.question;
    const answersArray = questionGroup.controls.answers;
    const hasAnswerValue = answersArray.controls.some((answerControl) => answerControl.value.trim().length > 0);
    const hasQuestionValue = questionControl.value.trim().length > 0;
    if (hasQuestionValue || hasAnswerValue || questionGroup.controls.allowMultipleAnswers.value) {
      questionControl.setValue('');
      questionGroup.controls.allowMultipleAnswers.setValue(false);
      answersArray.controls.forEach((answerControl) => answerControl.setValue(''));
      return;
    }
    if (this.questionsArray.length <= 1) return;
    this.questionsArray.removeAt(questionIndex);
  }

  /**
   * Returns the tooltip text for the question delete action.
   * @param questionIndex - The index of the related question.
   */
  getQuestionDeleteTooltip(questionIndex: number): string {
    const questionGroup = this.questionsArray.at(questionIndex);
    if (!questionGroup) return 'Remove question';
    const hasAnswerValue = questionGroup.controls.answers.controls.some((answerControl) => answerControl.value.trim().length > 0,);
    const hasQuestionValue = questionGroup.controls.question.value.trim().length > 0;
    if (hasQuestionValue || hasAnswerValue || questionGroup.controls.allowMultipleAnswers.value) return 'Click to clear question and answers';
    if (this.questionsArray.length <= 1) return 'At least one question is required';
    return 'Click to delete question';
  }

  /**
   * Adds a new answer control to a question if the maximum answer limit is not reached.
   * @param questionIndex - The index of the target question.
   */
  addAnswer(questionIndex: number): void {
    const answersArray = this.getAnswersArray(questionIndex);
    if (answersArray.length >= this.maxAnswersPerQuestion) return;
    answersArray.push(new FormControl<string>('', { nonNullable: true }));
  }

  /**
   * Checks whether an additional answer can be added to a question.
   * @param questionIndex - The index of the target question.
   */
  canAddAnswer(questionIndex: number): boolean {
    return this.getAnswersArray(questionIndex).length < this.maxAnswersPerQuestion;
  }

  /**
   * Clears or removes an answer depending on its current state and minimum constraints.
   * @param questionIndex - The index of the parent question.
   * @param answerIndex - The index of the answer to clear or remove.
   */
  removeAnswer(questionIndex: number, answerIndex: number): void {
    const answersArray = this.getAnswersArray(questionIndex);
    const answerControl = answersArray.at(answerIndex);
    if (!answerControl) return;
    if (answerControl.value.trim().length > 0) {
      answerControl.setValue('');
      return;
    }
    if (answersArray.length <= 2) return;
    answersArray.removeAt(answerIndex);
  }

  /**
   * Returns the tooltip text for the answer delete action.
   * @param questionIndex - The index of the parent question.
   * @param answerIndex - The index of the related answer.
   */
  getAnswerDeleteTooltip(questionIndex: number, answerIndex: number): string {
    const answersArray = this.getAnswersArray(questionIndex);
    const answerControl = answersArray.at(answerIndex);
    if (!answerControl) return 'Remove answer';
    if (answerControl.value.trim().length > 0) return 'Click to clear answer';
    if (answersArray.length <= 2) return 'At least two answers are required';
    return 'Click to delete answer';
  }

  /**
   * Returns the alphabetical label for an answer index (A., B., C., …).
   * @param index - Zero-based answer index.
   */
  getAnswerLabel(index: number): string {
    return `${String.fromCharCode(65 + index)}.`;
  }

  /**
   * Creates a validator that rejects invalid date values and dates in the past.
   * @returns An Angular validator function for end date input.
   */
  private notPastDateValidator(): ValidatorFn {
    return (control: AbstractControl<string>): ValidationErrors | null => {
      const value = control.value?.trim();
      if (!value || !this.endDatePattern.test(value)) return null;
      const parsedDate = parseDdMmYyyy(value);
      const [dayString, monthString, yearString] = value.split('.');
      const isExactDate = parsedDate.getFullYear() === Number(yearString) && parsedDate.getMonth() === Number(monthString) - 1 && parsedDate.getDate() === Number(dayString);
      if (!isExactDate) return { invalidDate: true };
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      parsedDate.setHours(0, 0, 0, 0);
      if (parsedDate < today) return { pastDate: true };
      return null;
    };
  }
}
