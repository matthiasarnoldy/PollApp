import type { Survey } from '../interfaces/survey.interface';

export const TEST_SURVEYS: Survey[] = [
  {
    id: 'survey-001',
    category: 'Team activities',
    title: 'Let’s Plan the Next Team Event Together',
    description: 'Choose activities and a preferred weekday for the next team event.',
    status: 'published',
    createdAt: '20.04.2026',
    endDate: '05.05.2026',
    questions: [
      {
        id: 'q-001-1',
        text: 'Which activity should we do?',
        multiple: false,
        answers: [
          { id: 'a-001-1', text: 'Escape Room', votes: 0 },
          { id: 'a-001-2', text: 'Bowling', votes: 0 },
          { id: 'a-001-3', text: 'Cooking Class', votes: 0 },
        ],
      },
    ],
  },
  {
    id: 'survey-002',
    category: 'Gaming & Entertainment',
    title: 'Gaming Habits and Favorite Genres',
    description: 'Understand what the team plays and when they play most often.',
    status: 'published',
    createdAt: '18.04.2026',
    endDate: '06.05.2026',
    questions: [
      {
        id: 'q-002-1',
        text: 'What is your favorite genre?',
        multiple: false,
        answers: [
          { id: 'a-002-1', text: 'RPG', votes: 8 },
          { id: 'a-002-2', text: 'Shooter', votes: 3 },
          { id: 'a-002-3', text: 'Strategy', votes: 5 },
        ],
      },
    ],
  },
  {
    id: 'survey-003',
    category: 'Health & Wellness',
    title: 'Weekly Wellness Check-In',
    description: 'Quick pulse check on energy, sleep and stress levels.',
    status: 'published',
    createdAt: '19.04.2026',
    endDate: '08.05.2026',
    questions: [
      {
        id: 'q-003-1',
        text: 'How many times do you exercise per week?',
        multiple: false,
        answers: [
          { id: 'a-003-1', text: '0–1', votes: 4 },
          { id: 'a-003-2', text: '2–3', votes: 9 },
          { id: 'a-003-3', text: '4+', votes: 6 },
        ],
      },
    ],
  },
  {
    id: 'survey-004',
    category: 'Education & Learning',
    title: 'Learning Goals for Q2',
    description: 'Identify which skills should be prioritized this quarter.',
    status: 'draft',
    createdAt: '01.05.2026',
    endDate: '25.05.2026',
    questions: [
      {
        id: 'q-004-1',
        text: 'Which area do you want to improve?',
        multiple: true,
        answers: [
          { id: 'a-004-1', text: 'Frontend', votes: 0 },
          { id: 'a-004-2', text: 'Backend', votes: 0 },
          { id: 'a-004-3', text: 'DevOps', votes: 0 },
        ],
      },
    ],
  },
  {
    id: 'survey-005',
    category: 'Lifestyle & Preferences',
    title: 'Remote Work Preferences',
    description: 'Find a balanced office and remote setup for the team.',
    status: 'published',
    createdAt: '22.04.2026',
    endDate: '10.05.2026',
    questions: [
      {
        id: 'q-005-1',
        text: 'Preferred office days per week?',
        multiple: false,
        answers: [
          { id: 'a-005-1', text: '0–1 days', votes: 5 },
          { id: 'a-005-2', text: '2–3 days', votes: 10 },
          { id: 'a-005-3', text: '4–5 days', votes: 2 },
        ],
      },
    ],
  },
  {
    id: 'survey-006',
    category: 'Technology & Innovation',
    title: 'AI Tools in Daily Workflow',
    description: 'Assess adoption and opportunities for AI-based tooling.',
    status: 'published',
    createdAt: '25.04.2026',
    endDate: '12.05.2026',
    questions: [
      {
        id: 'q-006-1',
        text: 'Which AI tool do you use most?',
        multiple: false,
        answers: [
          { id: 'a-006-1', text: 'GitHub Copilot', votes: 11 },
          { id: 'a-006-2', text: 'ChatGPT', votes: 7 },
          { id: 'a-006-3', text: 'Other', votes: 1 },
        ],
      },
    ],
  },
  {
    id: 'survey-007',
    category: 'Team activities',
    title: 'Lunch Spot Voting',
    description: 'Pick the best lunch place for Friday.',
    status: 'published',
    createdAt: '28.03.2026',
    endDate: '04.04.2026',
    questions: [
      {
        id: 'q-007-1',
        text: 'Where should we go?',
        multiple: true,
        answers: [
          { id: 'a-007-1', text: 'Italian', votes: 6 },
          { id: 'a-007-2', text: 'Sushi', votes: 9 },
          { id: 'a-007-3', text: 'Burgers', votes: 3 },
        ],
      },
    ],
  },
  {
    id: 'survey-008',
    category: 'Health & Wellness',
    title: 'Office Ergonomics Feedback',
    description: 'Collect feedback about desks, chairs and monitor setup.',
    status: 'published',
    createdAt: '15.03.2026',
    endDate: '30.03.2026',
    questions: [
      {
        id: 'q-008-1',
        text: 'Are you satisfied with your workspace setup?',
        multiple: false,
        answers: [
          { id: 'a-008-1', text: 'Yes', votes: 12 },
          { id: 'a-008-2', text: 'Partly', votes: 4 },
          { id: 'a-008-3', text: 'No', votes: 2 },
        ],
      },
    ],
  },
  {
    id: 'survey-009',
    category: 'Gaming & Entertainment',
    title: 'Movie Night Theme',
    description: 'Choose a theme for the next team movie night.',
    status: 'draft',
    createdAt: '02.05.2026',
    endDate: '20.05.2026',
    questions: [
      {
        id: 'q-009-1',
        text: 'What should we watch?',
        multiple: false,
        answers: [
          { id: 'a-009-1', text: 'Sci-Fi', votes: 0 },
          { id: 'a-009-2', text: 'Comedy', votes: 0 },
          { id: 'a-009-3', text: 'Action', votes: 0 },
        ],
      },
    ],
  },
  {
    id: 'survey-010',
    category: 'Technology & Innovation',
    title: 'Preferred Frontend Stack 2026',
    description: 'Gather opinions on framework and tooling choices.',
    status: 'published',
    createdAt: '10.02.2026',
    endDate: '24.02.2026',
    questions: [
      {
        id: 'q-010-1',
        text: 'Which frontend framework do you prefer?',
        multiple: false,
        answers: [
          { id: 'a-010-1', text: 'Angular', votes: 10 },
          { id: 'a-010-2', text: 'React', votes: 5 },
          { id: 'a-010-3', text: 'Vue', votes: 3 },
        ],
      },
    ],
  },
];
