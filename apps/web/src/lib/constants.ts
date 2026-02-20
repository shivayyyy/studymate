export const EXAM_SUBJECTS: Record<string, string[]> = {
    'JEE': ['Physics', 'Chemistry', 'Mathematics'],
    'NEET': ['Physics', 'Chemistry', 'Biology'],
    'UPSC': [
        'History',
        'Geography',
        'Polity',
        'Economics',
        'General Studies',
        'CSAT',
        'Current Affairs',
        'Ethics',
        'Essay'
    ],
    'GATE': [
        'General Aptitude',
        'Engineering Mathematics',
        'Computer Science',
        'Mechanical Engineering',
        'Civil Engineering',
        'Electronics',
        'Electrical Engineering'
    ],
    'General': ['General']
};

export const CONTENT_TYPES = [
    { value: 'NOTES', label: 'Notes' },
    { value: 'MNEMONICS', label: 'Mnemonics' },
    { value: 'PYQ', label: 'PYQ' },
    { value: 'CHEAT_SHEET', label: 'Cheat Sheet' },
    { value: 'MIND_MAP', label: 'Mind Map' },
    { value: 'MISTAKE_LOG', label: 'Mistake Log' },
];
