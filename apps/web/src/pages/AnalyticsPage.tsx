import { motion } from 'framer-motion';
import { BarChart3, LineChart, PieChart, TrendingUp, Calendar, Download, Sparkles, Lock } from 'lucide-react';

export default function AnalyticsPage() {
    return (
        <div className="p-8 max-w-[1600px] mx-auto min-h-[calc(100vh-4rem)] flex flex-col relative">

            {/* Header */}
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Analytics & Insights</h1>
                    <p className="text-slate-500 text-sm mt-1">Track your progress and study patterns</p>
                </div>
                <div className="flex gap-4">
                    <button disabled className="flex items-center gap-2 bg-white border border-slate-200 text-slate-400 px-4 py-2 rounded-xl font-medium text-sm cursor-not-allowed hidden md:flex">
                        <Calendar size={16} />
                        Last 30 Days
                    </button>
                    <button disabled className="flex items-center gap-2 bg-slate-100 text-slate-400 px-4 py-2 rounded-xl font-medium text-sm cursor-not-allowed hidden md:flex">
                        <Download size={16} />
                        Export Report
                    </button>
                </div>
            </header>

            {/* Content Wrapper with Overlay */}
            <div className="relative flex-1 rounded-3xl overflow-hidden border border-slate-200/60 bg-white/50">

                {/* Blurred Background Skeleton Grid */}
                <div className="absolute inset-0 p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-[160px] opacity-40 blur-[4px] pointer-events-none select-none">
                    {/* Top Stats */}
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 flex flex-col justify-between">
                        <div className="w-10 h-10 rounded-full bg-blue-100/50 flex items-center justify-center"><TrendingUp className="text-blue-400" /></div>
                        <div><div className="h-3 w-24 bg-slate-200 rounded mb-2"></div><div className="h-8 w-16 bg-slate-200 rounded"></div></div>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 flex flex-col justify-between">
                        <div className="w-10 h-10 rounded-full bg-purple-100/50 flex items-center justify-center"><BarChart3 className="text-purple-400" /></div>
                        <div><div className="h-3 w-20 bg-slate-200 rounded mb-2"></div><div className="h-8 w-24 bg-slate-200 rounded"></div></div>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 flex flex-col justify-between md:col-span-2 xl:col-span-2">
                        <div className="w-10 h-10 rounded-full bg-green-100/50 flex items-center justify-center"><LineChart className="text-green-400" /></div>
                        <div className="flex items-end gap-2 h-16 mt-4">
                            {[40, 70, 45, 90, 65, 85, 50, 100].map((h, i) => (
                                <div key={i} className="flex-1 bg-slate-200 rounded-t-sm" style={{ height: `${h}%` }}></div>
                            ))}
                        </div>
                    </div>

                    {/* Main Chart Area */}
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 md:col-span-2 lg:col-span-3 xl:col-span-3 row-span-2">
                        <div className="h-4 w-48 bg-slate-200 rounded mb-8"></div>
                        <div className="w-full h-[200px] border-b border-l border-slate-200 flex items-end justify-between px-4 pb-0 relative">
                            {/* Fake chart lines */}
                            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                                <path d="M0,80 Q25,30 50,60 T100,20 L100,100 L0,100 Z" fill="#e2e8f0" opacity="0.5" />
                                <path d="M0,80 Q25,30 50,60 T100,20" fill="none" stroke="#cbd5e1" strokeWidth="2" />
                            </svg>
                        </div>
                    </div>

                    {/* Side Pie Chart */}
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 flex flex-col items-center justify-center row-span-2">
                        <div className="h-4 w-32 bg-slate-200 rounded mb-8 self-start"></div>
                        <div className="w-40 h-40 rounded-full border-[16px] border-slate-200 border-t-slate-300 border-r-slate-300 border-b-slate-100 relative">
                            <div className="absolute inset-0 flex items-center justify-center"><PieChart className="text-slate-300 w-8 h-8" /></div>
                        </div>
                    </div>
                </div>

                {/* Coming Soon Glass Overlay */}
                <div className="absolute inset-0 z-10 flex items-center justify-center pb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.08)] rounded-3xl p-10 md:p-14 max-w-xl w-full mx-4 text-center ring-1 ring-slate-900/5 relative overflow-hidden"
                    >
                        {/* Decorative glow */}
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-400/20 rounded-full blur-3xl"></div>
                        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-400/20 rounded-full blur-3xl"></div>

                        <div className="relative z-10 flex flex-col items-center">
                            <div className="w-20 h-20 bg-linear-to-tr from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white mb-6 shadow-xl shadow-blue-500/20 ring-4 ring-white">
                                <Sparkles size={36} strokeWidth={1.5} />
                            </div>

                            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
                                Deep Insights <br />
                                <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-purple-600">
                                    Coming Soon
                                </span>
                            </h2>

                            <p className="text-slate-500 text-lg mb-8 max-w-sm leading-relaxed">
                                We're cooking up powerful analytics to help you understand your study patterns, track focus quality, and crush your goals.
                            </p>

                            <div className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-full font-medium text-sm shadow-md hover:scale-105 transition-transform cursor-default">
                                <Lock size={16} className="text-slate-400" />
                                Currently in Development
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

        </div>
    );
}
