import { useState } from 'react';
import { Search, SlidersHorizontal, Plus } from 'lucide-react';
import RoomCard from '../components/RoomCard';
import CreateRoomModal from '../components/CreateRoomModal';
import { rooms, filters } from '../data/mockData';

export default function RoomsPage() {
    const [activeFilter, setActiveFilter] = useState('All Sessions');
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="p-8 max-w-[1600px] mx-auto">
            <CreateRoomModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={() => alert('Room created successfully!')} />

            {/* Header */}
            <header className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-1">Study Rooms</h1>
                    <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        14,203 students active right now in the digital library
                    </div>
                </div>

                <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-lg shadow-blue-600/25 transition-all active:scale-95">
                    <Plus size={20} />
                    Create Room
                </button>
            </header>

            {/* Search & Filters */}
            <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 mb-8 flex flex-col gap-4">
                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search for JEE Physics, NEET Chemistry, or UPSC..."
                        className="w-full pl-12 pr-4 py-3 bg-white rounded-xl text-slate-700 outline-none placeholder:text-slate-400 focus:bg-slate-50 transition-colors"
                    />
                    <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
                        <SlidersHorizontal size={20} />
                    </button>
                </div>
            </div>

            {/* Filter Chips */}
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                {filters.map(filter => (
                    <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeFilter === filter
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                                : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-200 hover:text-blue-600 hover:bg-blue-50'
                            }`}
                    >
                        {filter}
                    </button>
                ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                {rooms.map(room => (
                    <RoomCard key={room.id} room={room} />
                ))}
            </div>

            {/* Load More */}
            <div className="mt-12 flex justify-center">
                <button className="bg-white border border-slate-200 text-slate-600 font-medium px-8 py-3 rounded-full hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm">
                    Load more sessions
                </button>
            </div>
        </div>
    );
}
