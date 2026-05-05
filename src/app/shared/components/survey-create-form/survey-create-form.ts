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

  get nameControl(): FormControl<string> {
    return this.form.controls.name;
  }

  get endDateControl(): FormControl<string> {
    return this.form.controls.setEndDate;
  }

  isSurveyNameInvalid(): boolean {
    return this.nameControl.invalid && this.nameControl.touched;
  }

  getSurveyNameErrorMessage(): string {
    if (this.nameControl.hasError('required')) return 'This field is required';
    if (this.nameControl.hasError('pattern')) return 'Please enter a valid name';
    return '';
  }

  isEndDateInvalid(): boolean {
    return this.endDateControl.invalid && this.endDateControl.touched;
  }

  getEndDateErrorMessage(): string {
    if (this.endDateControl.hasError('pattern') || this.endDateControl.hasError('invalidDate')) return 'Please enter a valid Date';
    if (this.endDateControl.hasError('pastDate')) return 'Date cannot be in the past';
    return '';
  }

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

  get questionsArray(): FormArray<FormGroup<{
    question: FormControl<string>;
    allowMultipleAnswers: FormControl<boolean>;
    answers: FormArray<FormControl<string>>;
  }>> {
    return this.form.controls.questions;
  }

  getAnswersArray(questionIndex: number): FormArray<FormControl<string>> {
    return this.questionsArray.at(questionIndex).controls.answers;
  }

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

  get categoryControl(): FormControl<SurveyCategory | null> {
    return this.form.controls.category;
  }

  toggleCategoryDropdown(): void {
    this.isCategoryDropdownOpen.update((open) => !open);
  }

  selectCategory(category: SurveyCategory): void {
    this.categoryControl.setValue(category);
    this.isCategoryDropdownOpen.set(false);
  }

  clearCategory(): void {
    this.categoryControl.setValue(null);
  }

  isQuestionSectionInvalid(): boolean {
    return this.publishAttempted() && !this.hasAtLeastOneCompleteQuestion();
  }

  async publish(): Promise<void> {
    this.publishAttempted.set(true);
    this.form.markAllAsTouched();
    if (this.nameControl.invalid || this.endDateControl.invalid) return;
    if (!this.hasAtLeastOneCompleteQuestion()) return;
    this.surveyService.createSurvey(this.buildPayload());
    await this.router.navigateByUrl('/');
  }

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

  private hasAtLeastOneCompleteQuestion(): boolean {
    const firstQuestionGroup = this.questionsArray.at(0);
    if (!firstQuestionGroup) return false;
    return firstQuestionGroup.controls.question.value.trim().length > 0 &&
      firstQuestionGroup.controls.answers.controls.length > 0 &&
      firstQuestionGroup.controls.answers.controls.every((answerControl) => answerControl.value.trim().length > 0);
  }

  clearBaseField(fieldName: 'name' | 'setEndDate' | 'description'): void {
    this.form.controls[fieldName].setValue('');
  }

  addQuestion(): void {
    if (this.questionsArray.length >= this.maxQuestions) return;
    this.questionsArray.push(this.createQuestionGroup());
  }

  canAddQuestion(): boolean {
    return this.questionsArray.length < this.maxQuestions;
  }

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

  getQuestionDeleteTooltip(questionIndex: number): string {
    const questionGroup = this.questionsArray.at(questionIndex);
    if (!questionGroup) return 'Remove question';
    const hasAnswerValue = questionGroup.controls.answers.controls.some((answerControl) => answerControl.value.trim().length > 0,);
    const hasQuestionValue = questionGroup.controls.question.value.trim().length > 0;
    if (hasQuestionValue || hasAnswerValue || questionGroup.controls.allowMultipleAnswers.value) return 'Click to clear question and answers';
    if (this.questionsArray.length <= 1) return 'At least one question is required';
    return 'Click to delete question';
  }

  addAnswer(questionIndex: number): void {
    const answersArray = this.getAnswersArray(questionIndex);
    if (answersArray.length >= this.maxAnswersPerQuestion) return;
    answersArray.push(new FormControl<string>('', { nonNullable: true }));
  }

  canAddAnswer(questionIndex: number): boolean {
    return this.getAnswersArray(questionIndex).length < this.maxAnswersPerQuestion;
  }

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

  getAnswerDeleteTooltip(questionIndex: number, answerIndex: number): string {
    const answersArray = this.getAnswersArray(questionIndex);
    const answerControl = answersArray.at(answerIndex);
    if (!answerControl) return 'Remove answer';
    if (answerControl.value.trim().length > 0) return 'Click to clear answer';
    if (answersArray.length <= 2) return 'At least two answers are required';
    return 'Click to delete answer';
  }

  getAnswerLabel(index: number): string {
    return `${String.fromCharCode(65 + index)}.`;
  }

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
