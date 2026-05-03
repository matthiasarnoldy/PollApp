export interface SurveyVoteSelection {
  questionId: string;
  answerIds: string[];
}

export interface SurveyVoteSubmission {
  surveyId: string;
  selections: SurveyVoteSelection[];
}
