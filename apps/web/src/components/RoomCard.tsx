import { motion } from 'framer-motion';
import { Clock, Mic, Volume2 } from 'lucide-react';
import type { Room } from '../data/mockData';

export default function RoomCard({ room }: { room: Room }) {
    const percent = Math.round((room.currentOccupancy / room.maxOccupancy) * 100);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-blue-900/5 transition-all group overflow-hidden flex flex-col h-full min-h-[380px]"
        >
            {/* Header/Image Area - Fixed height */}
            <div className="h-48 relative w-full shrink-0" style={{ background: room.image }}>
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>

                <div className="absolute top-4 left-4 flex gap-2">
                    <span className="bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider text-slate-700 shadow-sm border border-slate-100/50">
                        {room.examCategory} {room.subject}
                    </span>
                </div>

                {room.isLive && (
                    <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-green-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm ring-2 ring-white/20">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                        LIVE
                    </div>
                )}
            </div>

            {/* Content Area - Flexible height */}
            <div className="p-5 flex flex-col gap-4 flex-1 bg-white relative z-10">
                <div>
                    <h3 className="font-bold text-lg text-slate-900 leading-tight line-clamp-2 mb-3 group-hover:text-blue-600 transition-colors">
                        {room.title}
                    </h3>

                    <div className="flex flex-wrap gap-2 mb-1">
                        <div className="flex items-center gap-1.5 bg-slate-50 text-slate-500 px-2 py-1 rounded text-xs font-medium border border-slate-100">
                            <Clock size={12} />
                            {room.timer}
                        </div>
                        <div className="flex items-center gap-1.5 bg-slate-50 text-slate-500 px-2 py-1 rounded text-xs font-medium border border-slate-100">
                            {room.type === 'Discussion' ? <Mic size={12} /> : <Volume2 size={12} />}
                            {room.type}
                        </div>
                    </div>
                </div>

                <div className="mt-auto space-y-4">
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs items-center">
                            <span className="text-slate-400 font-medium">Attendance</span>
                            <span className="text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded">{room.currentOccupancy}/{room.maxOccupancy}</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-blue-600 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${percent}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                            />
                        </div>
                    </div>

                    <button className="w-full bg-blue-600 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-600/20">
                        Join Study Room
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
