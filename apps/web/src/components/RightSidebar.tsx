import { Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AnalyticsService, LeaderboardEntry } from '../services/analytics.service';
import { useUserStore } from '../stores/useUserStore';

export default function RightSidebar() {
    const { user } = useUserStore();
    const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                if (user?.examCategory) {
                    const res = await AnalyticsService.getLeaderboard(user.examCategory, 5);
                    if (res.success) {
                        setLeaders(res.data);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch leaderboard", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchLeaderboard();
        }
    }, [user]);

    return (
        <div className="hidden xl:flex flex-col gap-6 w-80 shrink-0">

            {/* Leaderboard Widget */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-800 text-xs tracking-wider uppercase">
                        {user?.examCategory || 'Community'} Leaderboard
                    </h3>
                </div>

                {loading ? (
                    <div className="space-y-4 animate-pulse">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="w-4 h-4 bg-slate-200 rounded"></div>
                                <div className="w-8 h-8 rounded-full bg-slate-200"></div>
                                <div className="flex-1 space-y-1">
                                    <div className="h-3 bg-slate-200 rounded w-20"></div>
                                    <div className="h-2 bg-slate-200 rounded w-12"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : leaders.length === 0 ? (
                    <div className="text-center py-4 text-slate-500 text-sm">
                        No active users this week. Be the first!
                    </div>
                ) : (
                    <div className="space-y-4">
                        {leaders.map((entry, index) => (
                            <div key={entry.userId} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className={`text-xs font-bold w-4 ${index === 0 ? 'text-yellow-500' :
                                        index === 1 ? 'text-slate-400' :
                                            index === 2 ? 'text-orange-400' : 'text-slate-400'
                                        }`}>
                                        {String(index + 1).padStart(2, '0')}
                                    </span>
                                    <img
                                        src={entry.user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(entry.user.fullName)}&background=random`}
                                        alt={entry.user.username}
                                        className="w-8 h-8 rounded-full bg-slate-100 object-cover"
                                    />
                                    <div>
                                        <h4 className="font-bold text-slate-800 text-sm">{entry.user.fullName}</h4>
                                        <p className="text-slate-400 text-[10px]">{Math.round(entry.score)} Hours</p>
                                    </div>
                                </div>
                                {index === 0 && <Trophy size={14} className="text-yellow-500" />}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
