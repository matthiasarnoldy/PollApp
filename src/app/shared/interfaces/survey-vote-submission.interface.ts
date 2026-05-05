/** Represents the selected answer(s) for a single question in a vote submission. */
export interface SurveyVoteSelection {
  questionId: string;
  answerIds: string[];
}

export interface SurveyVoteSubmission {
  surveyId: string;
  selections: SurveyVoteSelection[];
}
