import { motion } from 'framer-motion';
import { Trophy, Clock, Flame, BarChart, Download, Calendar, Zap } from 'lucide-react';
import { analyticsData } from '../data/mockAnalytics';

export default function AnalyticsPage() {
    const { personalStats, weeklyDistribution, leaderboard, focusQuality } = analyticsData;

    return (
        <div className="p-8 max-w-[1600px] mx-auto space-y-8">

            {/* Page Header */}
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Leaderboard & Analytics</h1>
                    <p className="text-slate-500 text-sm">Activity summary for March 2024</p>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
                        <button className="px-4 py-1.5 text-sm font-medium bg-blue-600 text-white rounded-md shadow-sm">Global</button>
                        <button className="px-4 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-md">Friends</button>
                        <button className="px-4 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-md">IIT-JEE</button>
                    </div>

                    <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl font-medium text-sm hover:bg-slate-50 transition-colors">
                        <Calendar size={16} />
                        Last 30 Days
                    </button>

                    <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl font-medium text-sm hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
                        <Download size={16} />
                        Export PDF
                    </button>
                </div>
            </header>

            {/* Main Grid Layout */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

                {/* Left Column: Leaderboard Podium + List (4 cols) */}
                <div className="xl:col-span-4 space-y-8">

                    {/* Podium Card */}
                    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <Trophy size={100} />
                        </div>

                        <h2 className="font-bold text-lg text-slate-800 mb-8">Top Performers</h2>

                        {/* Podium Visual */}
                        <div className="flex justify-center items-end gap-2 h-48 mb-6">
                            {/* 2nd Place */}
                            <div className="flex flex-col items-center gap-2">
                                <div className="relative">
                                    <img src={leaderboard[1].avatar} className="w-12 h-12 rounded-full border-2 border-slate-200" />
                                    <div className="absolute -bottom-2 -right-2 bg-slate-200 text-slate-600 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold">2</div>
                                </div>
                                <div className="text-center">
                                    <p className="font-bold text-xs text-slate-800">{leaderboard[1].name}</p>
                                    <p className="text-[10px] text-blue-600 font-bold">{leaderboard[1].hours}h</p>
                                </div>
                                <motion.div initial={{ height: 0 }} animate={{ height: 60 }} className="w-16 bg-slate-100 rounded-t-lg" />
                            </div>

                            {/* 1st Place */}
                            <div className="flex flex-col items-center gap-2">
                                <div className="relative">
                                    <img src={leaderboard[0].avatar} className="w-16 h-16 rounded-full border-4 border-yellow-100" />
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-yellow-500"><Trophy size={20} fill="currentColor" /></div>
                                </div>
                                <div className="text-center">
                                    <p className="font-bold text-sm text-slate-800">{leaderboard[0].name}</p>
                                    <p className="text-xs text-blue-600 font-bold">{leaderboard[0].hours}h</p>
                                </div>
                                <motion.div initial={{ height: 0 }} animate={{ height: 90 }} className="w-20 bg-yellow-50 rounded-t-lg border-t-4 border-yellow-400/20" />
                            </div>

                            {/* 3rd Place */}
                            <div className="flex flex-col items-center gap-2">
                                <div className="relative">
                                    <img src={leaderboard[2].avatar} className="w-12 h-12 rounded-full border-2 border-slate-200" />
                                    <div className="absolute -bottom-2 -right-2 bg-orange-100 text-orange-600 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold">3</div>
                                </div>
                                <div className="text-center">
                                    <p className="font-bold text-xs text-slate-800">{leaderboard[2].name}</p>
                                    <p className="text-[10px] text-blue-600 font-bold">{leaderboard[2].hours}h</p>
                                </div>
                                <motion.div initial={{ height: 0 }} animate={{ height: 40 }} className="w-16 bg-orange-50 rounded-t-lg" />
                            </div>
                        </div>
                    </div>

                    {/* List */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="flex justify-between p-4 border-b border-slate-50 bg-slate-50/50">
                            <span className="text-xs font-bold text-slate-400 tracking-wider">RANK</span>
                            <span className="text-xs font-bold text-slate-400 tracking-wider">STUDENT</span>
                            <span className="text-xs font-bold text-slate-400 tracking-wider">HOURS</span>
                        </div>
                        <div className="divide-y divide-slate-50">
                            <div className="flex items-center justify-between p-4 bg-blue-50/50 border-l-4 border-blue-500">
                                <span className="text-sm font-bold text-blue-600 w-6">14</span>
                                <div className="flex items-center gap-3 flex-1">
                                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Aryan" className="w-8 h-8 rounded-full bg-white" />
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">Arjun Sharma <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded ml-1">YOU</span></p>
                                        <p className="text-[10px] text-slate-500">IIT-JEE Aspirant</p>
                                    </div>
                                </div>
                                <span className="text-sm font-bold text-slate-900">88.4h</span>
                            </div>
                            {leaderboard.slice(3).map(user => (
                                <div key={user.rank} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                                    <span className="text-sm font-medium text-slate-400 w-6">{user.rank}</span>
                                    <div className="flex items-center gap-3 flex-1">
                                        <img src={user.avatar} className="w-8 h-8 rounded-full bg-slate-100" />
                                        <p className="text-sm font-medium text-slate-700">{user.name}</p>
                                    </div>
                                    <span className="text-sm font-bold text-slate-900">{user.hours}h</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Stats + Charts (8 cols) */}
                <div className="xl:col-span-8 space-y-8">

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group hover:border-blue-100 transition-all">
                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity"><Clock size={40} className="text-blue-600" /></div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Total Hours</p>
                            <h3 className="text-3xl font-bold text-slate-900 mb-1">{personalStats.totalHours}</h3>
                            <p className="text-xs font-medium text-green-500 bg-green-50 inline-block px-1.5 py-0.5 rounded">{personalStats.hoursChange}</p>
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group hover:border-green-100 transition-all">
                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity"><Zap size={40} className="text-green-600" /></div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Sessions</p>
                            <h3 className="text-3xl font-bold text-slate-900 mb-1">{personalStats.focusSessions}</h3>
                            <p className="text-xs font-medium text-green-500 bg-green-50 inline-block px-1.5 py-0.5 rounded">{personalStats.sessionsChange}</p>
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group hover:border-orange-100 transition-all border-b-4 border-b-orange-400">
                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity"><Flame size={40} className="text-orange-600" /></div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Day Streak</p>
                            <h3 className="text-3xl font-bold text-slate-900 mb-1">{personalStats.streak} <span className="text-sm font-normal text-slate-400">Days</span></h3>
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group hover:border-purple-100 transition-all border-b-4 border-b-purple-400">
                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity"><BarChart size={40} className="text-purple-600" /></div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Percentile</p>
                            <h3 className="text-3xl font-bold text-slate-900 mb-1">Top 5%</h3>
                            <p className="text-xs font-medium text-purple-600">Global Rank</p>
                        </div>
                    </div>

                    {/* Weekly Distribution Chart */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="font-bold text-slate-800">Weekly Focus Distribution</h3>
                            <div className="flex gap-4 text-xs font-medium">
                                <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 bg-blue-500 rounded-full"></span> YOU</div>
                                <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 bg-slate-200 rounded-full"></span> AVERAGE</div>
                            </div>
                        </div>

                        <div className="flex justify-between items-end h-48 px-4">
                            {weeklyDistribution.map((day) => (
                                <div key={day.day} className="flex flex-col items-center gap-3 w-full">
                                    <div className="flex gap-1 items-end h-full">
                                        <motion.div initial={{ height: 0 }} animate={{ height: `${day.average * 10}%` }} className="w-3 bg-slate-100 rounded-t-md" />
                                        <motion.div initial={{ height: 0 }} animate={{ height: `${day.yours * 10}%` }} className="w-3 bg-blue-500 rounded-t-md shadow-lg shadow-blue-500/20" />
                                    </div>
                                    <span className="text-xs font-medium text-slate-400">{day.day}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Bottom Row: Heatmap + Scores */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Heatmap (Simplified) */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-slate-800">Consistency Heatmap</h3>
                                <span className="text-xs text-slate-400">Less ■ ■ ■ ■ ■ More</span>
                            </div>
                            <div className="flex gap-1 flex-wrap">
                                {/* Generating grid of squares */}
                                {Array.from({ length: 42 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className={`w-6 h-6 rounded-sm ${Math.random() > 0.7 ? 'bg-blue-500' :
                                                Math.random() > 0.5 ? 'bg-blue-300' :
                                                    Math.random() > 0.3 ? 'bg-blue-100' : 'bg-slate-50'
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Scores & Focus Quality */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center items-center">
                                <div className="relative w-24 h-24 flex items-center justify-center">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle cx="48" cy="48" r="40" className="stroke-slate-100" strokeWidth="8" fill="none" />
                                        <circle cx="48" cy="48" r="40" className="stroke-blue-500" strokeWidth="8" fill="none" strokeDasharray="251.2" strokeDashoffset={251.2 * (1 - focusQuality.score / 100)} strokeLinecap="round" />
                                    </svg>
                                    <span className="absolute text-2xl font-bold text-slate-900">{focusQuality.score}</span>
                                </div>
                                <p className="font-bold text-slate-800 mt-2">Study Score</p>
                                <p className="text-xs text-green-500 font-medium">Excellent</p>
                            </div>

                            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center gap-4">
                                <h3 className="font-bold text-slate-800 text-sm">Focus Quality</h3>

                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-slate-500">Deep Work</span>
                                        <span className="font-bold text-blue-600">{focusQuality.deepWork}%</span>
                                    </div>
                                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-600 w-[72%] rounded-full"></div>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-slate-500">Revision</span>
                                        <span className="font-bold text-purple-600">{focusQuality.revision}%</span>
                                    </div>
                                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-purple-500 w-[28%] rounded-full"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
