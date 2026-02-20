import { Post } from '../components/PostCard';

export const posts: Post[] = [
    {
        _id: '1',
        userId: {
            _id: 'u1',
            fullName: 'Priya Sharma',
            username: 'priya_iit',
            profilePicture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
        },
        createdAt: new Date().toISOString(),
        title: 'Integration Shortcuts: Definitive Guide for JEE Advanced 2024',
        contentType: 'NOTES',
        thumbnailUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=2670&auto=format&fit=crop',
        subject: 'Mathematics',
        examCategory: 'JEE',
        likesCount: 1200,
        commentsCount: 84,
        savesCount: 120
    },
    {
        _id: '2',
        userId: {
            _id: 'u2',
            fullName: 'Aditya Verma',
            username: 'aditya_aiims',
            profilePicture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aditya',
        },
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        title: 'Human Physiology: Hormonal Control Flowchart',
        contentType: 'MNEMONICS', // Mapping Flowchart to close equiv or add new
        subject: 'Biology',
        examCategory: 'NEET',
        likesCount: 458,
        commentsCount: 12,
        savesCount: 45
    },
    {
        _id: '3',
        userId: {
            _id: 'u3',
            fullName: 'Dr. Amit Vats',
            username: 'amit_phy',
            profilePicture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amit',
        },
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        title: 'Visualizing Rotational Motion - Why Torque matters',
        thumbnailUrl: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=2670&auto=format&fit=crop',
        contentType: 'PYQ', // closest
        subject: 'Physics',
        examCategory: 'JEE',
        likesCount: 3400,
        commentsCount: 210,
        savesCount: 890
    }
];
