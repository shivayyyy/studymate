import { Calendar, Trophy } from 'lucide-react';

export default function RightSidebar() {
    return (
        <div className="hidden xl:flex flex-col gap-6 w-80 shrink-0">

            {/* Search - If not in header */}
            {/* Assuming header has search, omitting here or adding as backup */}

            {/* Deadlines Widget */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-800 text-xs tracking-wider uppercase">Deadlines & Tests</h3>
                </div>
                <div className="space-y-3">
                    <div className="flex gap-3 items-start p-3 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-slate-100">
                        <div className="w-10 h-10 rounded-lg bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                            <Calendar size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-800 text-sm">JEE Mains Registration</h4>
                            <p className="text-red-500 text-xs font-medium mt-0.5">Closes in 2 days</p>
                        </div>
                    </div>

                    <div className="flex gap-3 items-start p-3 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-slate-100">
                        <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
                            <Calendar size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-800 text-sm">Physics Assignment</h4>
                            <p className="text-slate-500 text-xs mt-0.5">Due: Today, 11:59 PM</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Leaderboard Widget */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-800 text-xs tracking-wider uppercase">Community Leaderboard</h3>
                </div>
                <div className="space-y-4">
                    {/* Top 3 List */}
                    {[
                        { rank: '01', name: 'Rahul K.', points: '4,520', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul' },
                        { rank: '02', name: 'Sneha Roy', points: '4,210', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sneha' },
                        { rank: '03', name: 'You', points: '3,890', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix' },
                    ].map((user) => (
                        <div key={user.name} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className={`text-xs font-bold w-4 ${user.rank === '01' ? 'text-yellow-500' : 'text-slate-400'}`}>{user.rank}</span>
                                <img src={user.image} className="w-8 h-8 rounded-full bg-slate-100" />
                                <div>
                                    <h4 className="font-bold text-slate-800 text-sm">{user.name}</h4>
                                    <p className="text-slate-400 text-[10px]">{user.points} Points</p>
                                </div>
                            </div>
                            {user.rank === '01' && <Trophy size={14} className="text-yellow-500" />}
                        </div>
                    ))}
                </div>

                <button className="w-full mt-5 py-2 text-blue-600 text-xs font-bold border border-blue-100 rounded-lg hover:bg-blue-50 transition-colors">
                    View All Rankings
                </button>
            </div>
        </div>
    );
}
