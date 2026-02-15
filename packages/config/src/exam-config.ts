import { ExamCategory } from '@studymate/types';

export interface ExamConfig {
    name: string;
    fullName: string;
    subjects: string[];
    icon: string;
}

export const EXAM_CONFIGS: Record<ExamCategory, ExamConfig> = {
    [ExamCategory.JEE]: {
        name: 'JEE',
        fullName: 'Joint Entrance Examination',
        subjects: ['Physics', 'Chemistry', 'Mathematics'],
        icon: '🧪',
    },
    [ExamCategory.NEET]: {
        name: 'NEET',
        fullName: 'National Eligibility cum Entrance Test',
        subjects: ['Physics', 'Chemistry', 'Biology', 'Zoology', 'Botany'],
        icon: '🏥',
    },
    [ExamCategory.UPSC]: {
        name: 'UPSC',
        fullName: 'Union Public Service Commission',
        subjects: [
            'General Studies',
            'History',
            'Geography',
            'Polity',
            'Economy',
            'Science & Technology',
            'Environment',
            'Ethics',
            'Essay',
        ],
        icon: '🏛️',
    },
    [ExamCategory.GATE]: {
        name: 'GATE',
        fullName: 'Graduate Aptitude Test in Engineering',
        subjects: [
            'Computer Science',
            'Electronics',
            'Mechanical',
            'Electrical',
            'Civil',
            'Mathematics',
            'General Aptitude',
        ],
        icon: '⚙️',
    },
};

export const getExamSubjects = (exam: ExamCategory): string[] => {
    return EXAM_CONFIGS[exam]?.subjects || [];
};
