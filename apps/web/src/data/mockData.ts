export interface Room {
    id: string;
    title: string;
    subject: string;
    examCategory: 'JEE' | 'NEET' | 'UPSC';
    type: 'Pomodoro' | 'Quiet Study' | 'Discussion';
    timer: string;
    currentOccupancy: number;
    maxOccupancy: number;
    isLive: boolean;
    image: string; // Using gradient/abstract placeholders for now
}

export const rooms: Room[] = [
    {
        id: '1',
        title: 'JEE Physics — Mechanics Deep Dive',
        subject: 'Physics',
        examCategory: 'JEE',
        type: 'Quiet Study',
        timer: '25/5',
        currentOccupancy: 23,
        maxOccupancy: 500,
        isLive: true,
        image: 'linear-gradient(135deg, #0F766E 0%, #115E59 100%)' // teal
    },
    {
        id: '2',
        title: 'Carbonyl Compounds Flash Cards',
        subject: 'Organic',
        examCategory: 'NEET',
        type: 'Pomodoro',
        timer: '50/10',
        currentOccupancy: 412,
        maxOccupancy: 500,
        isLive: true,
        image: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)' // dark slate
    },
    {
        id: '3',
        title: 'Calculus: Indefinite Integration',
        subject: 'Maths',
        examCategory: 'JEE',
        type: 'Quiet Study',
        timer: '25/5',
        currentOccupancy: 128,
        maxOccupancy: 300,
        isLive: true,
        image: 'linear-gradient(135deg, #059669 0%, #047857 100%)' // emerald
    },
    {
        id: '4',
        title: 'Ancient Indian History: Mauryan Empire',
        subject: 'History',
        examCategory: 'UPSC',
        type: 'Discussion',
        timer: '90/15',
        currentOccupancy: 89,
        maxOccupancy: 100,
        isLive: true,
        image: 'linear-gradient(135deg, #1E3A8A 0%, #172554 100%)' // blue
    },
    {
        id: '5',
        title: 'Full Length Mock: JEE Main 2024',
        subject: 'Mock Test',
        examCategory: 'JEE',
        type: 'Quiet Study',
        timer: '3 Hours',
        currentOccupancy: 1452,
        maxOccupancy: 2000,
        isLive: true,
        image: 'linear-gradient(135deg, #B45309 0%, #92400E 100%)' // amber
    },
    {
        id: '6',
        title: 'Plant Physiology: NCERT Focus',
        subject: 'Biology',
        examCategory: 'NEET',
        type: 'Pomodoro',
        timer: '25/5',
        currentOccupancy: 45,
        maxOccupancy: 100,
        isLive: true,
        image: 'linear-gradient(135deg, #A855F7 0%, #9333EA 100%)' // purple
    }
];

export const filters = ['All Sessions', 'JEE Mains', 'JEE Advanced', 'NEET-UG', 'Physics', 'Chemistry', 'UPSC Prep'];
