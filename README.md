# Pollapp

Pollapp is an Angular-based survey application where users can create polls, publish them, vote, and see live-updating results.

## What this app does

- Create surveys with:
  - title
  - description
  - category
  - end date
  - one or more questions
  - multiple answer options per question
  - single-choice or multiple-choice mode per question
- Publish surveys and show a short success overlay on the home page.
- Browse and open published surveys.
- Submit votes.
- Display result percentages per answer.
- Sync survey create/update/delete changes in real time via Supabase Realtime.

## User flow

1. Open the app home view.
2. Create a new survey in the creation view.
3. Publish the survey.
4. Return to home and open a survey.
5. Vote on one or more answers (depending on question type).
6. Review results immediately.
7. See updates from other clients in real time.