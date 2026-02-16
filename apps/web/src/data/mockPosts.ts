import { Post } from '../components/PostCard';

export const posts: Post[] = [
    {
        id: '1',
        author: {
            name: 'Priya Sharma',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
            role: 'IIT Delhi \'25',
            badge: 'Gold'
        },
        timeAgo: '2 hours ago',
        title: 'Integration Shortcuts: Definitive Guide for JEE Advanced 2024',
        content: 'Sharing my handwritten notes for definite integration. Includes 15+ shortcuts for Wallis Formula, King\'s Property...',
        image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=2670&auto=format&fit=crop',
        tags: ['Mathematics', 'Calculus', 'JEE Advanced'],
        stats: { likes: 1200, comments: 84 },
        type: 'Note'
    },
    {
        id: '2',
        author: {
            name: 'Aditya Verma',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aditya',
            role: 'AIIMS Aspirant',
        },
        timeAgo: '5 hours ago',
        title: 'Human Physiology: Hormonal Control Flowchart',
        content: 'Pro tip: Remember the mnemonic G-F-R for adrenal cortex layers (Glomerulosa, Fasciculata, Reticularis). Essential for quick recall in MCQ tests!',
        tags: ['Biology', 'NEET'],
        stats: { likes: 458, comments: 12 },
        type: 'Flowchart'
    },
    {
        id: '3',
        author: {
            name: 'Dr. Amit Vats',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amit',
            role: 'Physics Mentor',
            badge: 'Gold'
        },
        timeAgo: 'Yesterday',
        title: 'Visualizing Rotational Motion - Why Torque matters',
        image: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=2670&auto=format&fit=crop', // Beach? Using abstract physics placeholder if possible, sticking to unsplash
        tags: ['Physics', 'Mechanics'],
        stats: { likes: 3400, comments: 210 },
        type: 'Video'
    }
];
