import { Component, inject } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { SurveyService } from '../../services/survey.service';

@Component({
  selector: 'app-survey-create-form',
  imports: [ReactiveFormsModule],
  templateUrl: './survey-create-form.html',
  styleUrl: './survey-create-form.scss',
})
export class SurveyCreateForm {
  private readonly surveyService = inject(SurveyService);
  private readonly maxAnswersPerQuestion = 6;
  private readonly maxQuestions = 6;
  private readonly surveyNamePattern = /^(?=.{3,80}$)(?=.*[A-Za-zÄÖÜäöüß])[A-Za-zÄÖÜäöüß0-9][A-Za-zÄÖÜäöüß0-9 .,'&()\-]*[A-Za-zÄÖÜäöüß0-9]$/;
  
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
    setEndDate: new FormControl<string>('', { nonNullable: true }),
    description: new FormControl<string>('', { nonNullable: true }),
    questions: new FormArray([this.createQuestionGroup()]),
  });

  get nameControl(): FormControl<string> {
    return this.form.controls.name;
  }

  isSurveyNameInvalid(): boolean {
    return this.nameControl.invalid && (this.nameControl.dirty || this.nameControl.touched);
  }

  getSurveyNameErrorMessage(): string {
    if (this.nameControl.hasError('required')) return 'This field is required';
    if (this.nameControl.hasError('pattern')) return 'Please enter a valid name';
    return '';
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
}
