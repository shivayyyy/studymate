import {
    BookOpen, Edit2, Verified, Grid, Bookmark, UserSquare,
    Heart, MessageCircle, Share2, FileText, File, BarChart2, FolderOutput,
    Mail, Lightbulb
} from 'lucide-react';

// Interfaces matching Database Schema
interface UserProfile {
    _id: string;
    fullName: string;
    username: string;
    profilePicture: string;
    email: string;
    bio: string;
    examCategory: 'JEE' | 'NEET' | 'UPSC' | 'GATE';
    subjects: string[];
    targetYear: number;
    followersCount: number;
    followingCount: number;
    postsCount: number;
    isVerified: boolean;
    totalStudyHours: number;
    currentStreak: number;
    contributorBadge: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
}

interface Post {
    _id: string;
    userId: string;
    contentType: 'NOTES' | 'MNEMONICS' | 'PYQ' | 'CHEAT_SHEET' | 'MIND_MAP' | 'MISTAKE_LOG';
    thumbnailUrl?: string; // If image/video
    likesCount: number;
    commentsCount: number;
}

// Mock Data based on Schema
const mockUser: UserProfile = {
    _id: "u123",
    fullName: "Shivam Mishra",
    username: "shivam_mishra",
    profilePicture: "https://lh3.googleusercontent.com/aida-public/AB6AXuD06ZcjRbTekx_SQNethBTSMPaCkJtaz-FocGuvpQwaVNMDpVI6G-05gWJU0lGUkr8j0YdM40J6YaTAxq2ZY6Nw05_iajlYD-Eo7cfnhxwWlbtyD2FH8R3dUS0Lkn10r0dVMIQfNHDbfgHk0ZpSYbdt9JxBnML9_OMliscPgRnF4S_xlPBopwgJ63o-Eu4BRA-5CeDebYNuoeJXyWOI0sIxlWGOdUfv5wuadpUmbMtpwrEjJdtKTirJ73-qqe2hpysMVuRRlPZ7G23-",
    email: "shivam@example.com",
    bio: "Computer Science Undergraduate | Aspiring Data Scientist | GATE 2025 Aspirant",
    examCategory: "GATE",
    subjects: ["Data Science", "Algorithms", "DBMS"],
    targetYear: 2025,
    followersCount: 142,
    followingCount: 89,
    postsCount: 12,
    isVerified: true,
    totalStudyHours: 84.5,
    currentStreak: 12,
    contributorBadge: 'BRONZE'
};

const mockPosts: Post[] = [
    { _id: "p1", userId: "u123", contentType: "NOTES", thumbnailUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuALhn6HZSbcVW0YlLRoVw7eYPmP14NOyOILdNOo-i2kXO_HERemtR0aXn6kLNayicF5kgTPeOObNIlEWXR1Qyn4_KesFIg26mzakImPCH11CDM68608ejoNWDL-rWF7iR_X_0JLYKdaYRCb5nb6I5SXSd5V2x0QFKuXULVr-XIB07EnJIjSF670sTPXM7yf_Cx_gWLvZeNGeSyaQDs1A452daED8PDZ2RItDDL2o7bB98xY1GJSfhNLwrNFVEGVPAphSzQvNWH6cQ2H", likesCount: 24, commentsCount: 8 },
    { _id: "p2", userId: "u123", contentType: "MIND_MAP", likesCount: 45, commentsCount: 12 },
    { _id: "p3", userId: "u123", contentType: "CHEAT_SHEET", likesCount: 18, commentsCount: 3 },
    { _id: "p4", userId: "u123", contentType: "PYQ", likesCount: 67, commentsCount: 21 },
    { _id: "p5", userId: "u123", contentType: "MISTAKE_LOG", likesCount: 31, commentsCount: 5 },
    { _id: "p6", userId: "u123", contentType: "MNEMONICS", likesCount: 92, commentsCount: 14 },
];

export default function ProfilePage() {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans text-slate-900">
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Left Column: Profile & Stats */}
                <aside className="w-full lg:w-1/3 flex flex-col gap-6">
                    {/* Profile Header */}
                    <div className="bg-white border border-slate-200 rounded-xl p-8 flex flex-col items-center text-center shadow-sm">
                        <div className="relative group">
                            <img alt={mockUser.fullName} className="w-[120px] h-[120px] rounded-full object-cover border-4 border-white shadow-lg" src={mockUser.profilePicture} />
                            {/* Contributor Badge Overlay */}
                            <div className={`absolute -bottom-2 -right-2 border-4 border-white rounded-full flex items-center justify-center
                                ${mockUser.contributorBadge === 'PLATINUM' ? 'w-10 h-10 bg-linear-to-tr from-slate-300 to-cyan-400 shadow-lg shadow-cyan-500/50' :
                                    mockUser.contributorBadge === 'GOLD' ? 'w-9 h-9 bg-yellow-400 shadow-lg shadow-yellow-500/50' :
                                        mockUser.contributorBadge === 'SILVER' ? 'w-8 h-8 bg-slate-300 shadow-md shadow-slate-400/50' :
                                            'w-7 h-7 bg-amber-700 shadow-sm'
                                }
                            `} title={`${mockUser.contributorBadge} Contributor`}>
                                {mockUser.contributorBadge === 'PLATINUM' && <span className="text-white text-lg drop-shadow-md">👑</span>}
                                {mockUser.contributorBadge === 'GOLD' && <span className="text-white text-base drop-shadow-md">⭐</span>}
                                {mockUser.contributorBadge === 'SILVER' && <span className="text-slate-600 text-sm font-bold">S</span>}
                                {mockUser.contributorBadge === 'BRONZE' && <span className="text-amber-100 text-xs font-bold">B</span>}
                            </div>
                        </div>

                        <div className="mt-4 flex flex-col items-center">
                            <div className="flex items-center gap-1.5">
                                <h1 className="text-2xl font-bold text-slate-900">{mockUser.fullName}</h1>
                                {mockUser.isVerified && <Verified className="text-blue-500 w-5 h-5" fill="currentColor" stroke="white" />}
                            </div>
                            <span className="text-slate-500 font-medium text-sm">@{mockUser.username}</span>
                        </div>

                        {/* Bio directly from DB */}
                        <p className="text-slate-500 mt-2 font-medium text-sm leading-relaxed px-4">{mockUser.bio}</p>

                        <div className="mt-4 flex items-center gap-6 text-sm font-medium text-slate-600">
                            <div><span className="font-bold text-slate-900">{mockUser.postsCount}</span> Posts</div>
                            <div><span className="font-bold text-slate-900">{mockUser.followersCount}</span> Followers</div>
                            <div><span className="font-bold text-slate-900">{mockUser.followingCount}</span> Following</div>
                        </div>

                        {/* Exam & Subjects mapped from DB */}
                        <div className="mt-4 flex flex-wrap justify-center gap-2">
                            <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-100">{mockUser.examCategory} {mockUser.targetYear}</span>
                            {mockUser.subjects.map(subject => (
                                <span key={subject} className="px-3 py-1 bg-slate-50 text-slate-600 rounded-full text-xs font-semibold border border-slate-200">{subject}</span>
                            ))}
                        </div>

                        <div className="mt-6 flex w-full gap-2">
                            <button className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm shadow-blue-500/20">
                                <Edit2 className="w-4 h-4" />
                                Edit Profile
                            </button>
                            <button className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-all flex items-center justify-center gap-2">
                                <Mail className="w-4 h-4" />
                                Message
                            </button>
                        </div>
                    </div>

                    {/* Stats Overview - Directly matching User Model fields */}
                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                        <div className="p-4 border-b border-slate-100">
                            <h2 className="font-bold text-slate-800">Study Stats</h2>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center">
                                        <span className="text-xl">🔥</span>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500">Current Streak</p>
                                        <p className="text-lg font-bold text-slate-900">{mockUser.currentStreak} Days</p>
                                    </div>
                                </div>
                                <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded">Active</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                                        <span className="text-xl">📚</span>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500">Total Studied</p>
                                        <p className="text-lg font-bold text-slate-900">{mockUser.totalStudyHours} Hours</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
                                        <span className="text-xl">🏆</span>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500">Badge</p>
                                        <p className="text-lg font-bold text-slate-900">{mockUser.contributorBadge}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Right Column: Content Grid */}
                <section className="flex-1">
                    <div className="bg-white border border-slate-200 rounded-xl min-h-[600px] flex flex-col overflow-hidden shadow-sm">
                        {/* Tab Headers */}
                        <div className="px-6 border-b border-slate-200">
                            <div className="flex justify-center gap-12">
                                <button className="py-4 border-t-2 border-slate-900 -mt-px text-slate-900 font-bold text-xs tracking-widest flex items-center gap-2">
                                    <Grid className="w-[18px] h-[18px]" />
                                    POSTS
                                </button>
                                <button className="py-4 border-t-2 border-transparent -mt-px text-slate-400 hover:text-slate-700 font-bold text-xs tracking-widest flex items-center gap-2 transition-colors">
                                    <Bookmark className="w-[18px] h-[18px]" />
                                    SAVED
                                </button>
                                <button className="py-4 border-t-2 border-transparent -mt-px text-slate-400 hover:text-slate-700 font-bold text-xs tracking-widest flex items-center gap-2 transition-colors">
                                    <UserSquare className="w-[18px] h-[18px]" />
                                    TAGGED
                                </button>
                            </div>
                        </div>

                        {/* Grid Content */}
                        <div className="p-6 flex-1">
                            <div className="grid grid-cols-3 gap-1 md:gap-4 lg:gap-6">
                                {mockPosts.map((post) => (
                                    <div key={post._id} className="relative aspect-square bg-slate-100 rounded-sm overflow-hidden group cursor-pointer border border-slate-200">
                                        {post.thumbnailUrl ? (
                                            <img alt={post.contentType} className="w-full h-full object-cover" src={post.thumbnailUrl} />
                                        ) : (
                                            <div className={`w-full h-full flex items-center justify-center ${post.contentType === 'NOTES' ? 'bg-slate-50' :
                                                post.contentType === 'MIND_MAP' ? 'bg-blue-50' :
                                                    post.contentType === 'PYQ' ? 'bg-red-50' :
                                                        post.contentType === 'CHEAT_SHEET' ? 'bg-purple-50' :
                                                            'bg-green-50'
                                                }`}>
                                                {/* Dynamic Icon based on Content Type */}
                                                {post.contentType === 'NOTES' && <FileText className="w-10 h-10 text-slate-300" />}
                                                {post.contentType === 'MIND_MAP' && <Share2 className="w-10 h-10 text-blue-300" />}
                                                {post.contentType === 'PYQ' && <File className="w-10 h-10 text-red-300" />}
                                                {post.contentType === 'CHEAT_SHEET' && <FolderOutput className="w-10 h-10 text-purple-300" />}
                                                {post.contentType === 'MISTAKE_LOG' && <BarChart2 className="w-10 h-10 text-green-300" />}
                                                {post.contentType === 'MNEMONICS' && <Lightbulb className="w-10 h-10 text-amber-300" />}
                                            </div>
                                        )}

                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6 text-white font-bold">
                                            <div className="flex items-center gap-1.5">
                                                <Heart className="w-5 h-5 fill-white" />
                                                <span>{post.likesCount}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <MessageCircle className="w-5 h-5 fill-white" />
                                                <span>{post.commentsCount}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* Footer */}
            <footer className="mt-10 border-t border-slate-200 py-10 flex flex-col md:flex-row justify-between items-center text-slate-400 text-sm">
                <div className="flex items-center gap-2 mb-4 md:mb-0">
                    <BookOpen className="w-5 h-5" />
                    <span className="font-bold text-slate-600">StudyMate</span>
                    <span>© 2024 All Rights Reserved</span>
                </div>
                <div className="flex gap-8">
                    <a href="#" className="hover:text-blue-500 transition-colors">Privacy Policy</a>
                    <a href="#" className="hover:text-blue-500 transition-colors">Help Center</a>
                    <a href="#" className="hover:text-blue-500 transition-colors">Community Guidelines</a>
                </div>
            </footer>
        </div>
    );
}
