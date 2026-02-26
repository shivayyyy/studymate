import { useEffect, useState } from 'react';
import { useDebounce } from '../hooks/useDebounce';
import { api } from '../lib/axios';
import { Search, Plus, Users, Lock, Unlock } from 'lucide-react';
import RoomCard, { Room } from '../components/RoomCard';
import CreateRoomModal from '../components/CreateRoomModal';

import { useNavigate } from 'react-router-dom';

export default function RoomsPage() {
    const navigate = useNavigate();
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'ALL' | 'PUBLIC' | 'PRIVATE'>('ALL');
    const [catFilter, setCatFilter] = useState<'ALL' | 'STUDY' | 'QUIZ'>('ALL');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearch = useDebounce(searchQuery, 500);

    const fetchRooms = async () => {
        try {
            setLoading(true);
            const params: any = {};
            if (filter !== 'ALL') params.type = filter;
            if (catFilter !== 'ALL') params.category = catFilter;
            if (debouncedSearch && debouncedSearch.length >= 3) {
                params.search = debouncedSearch;
            }

            const response = await api.get('/rooms', {
                params,
            });

            if (response.data.success) {
                setRooms(response.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch rooms", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (debouncedSearch.length === 0 || debouncedSearch.length >= 3) {
            fetchRooms();
        }
    }, [filter, catFilter, debouncedSearch]);

    const handleJoinRoom = async (room: Room) => {
        if (room.type === 'PRIVATE') {
            const password = prompt("Enter room password:");
            if (!password) return;

            try {
                const res = await api.post(`/rooms/${room._id}/join`,
                    { password },
                );
                if (res.data.success) {
                    navigate(`/rooms/${room._id}`);
                }
            } catch (error: any) {
                alert(error.response?.data?.message || "Incorrect password");
            }
        } else {
            navigate(`/rooms/${room._id}`);
        }
    };

    const handleDeleteRoom = async (roomId: string) => {
        try {
            const res = await api.delete(`/rooms/${roomId}`);
            if (res.data.success) {
                fetchRooms();
            }
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to delete room");
        }
    };

    return (
        <div className="p-4 sm:p-8 max-w-[1600px] mx-auto min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 sm:mb-8 gap-4">
                <div>
                    <h1 className="text-xl sm:text-3xl font-bold text-slate-900">Study Rooms</h1>
                    <p className="text-slate-500 text-xs sm:text-base mt-0.5 sm:mt-1">Join a focused session with peers.</p>
                </div>

                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="hidden md:flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all active:scale-95"
                >
                    <Plus size={20} />
                    Create Room
                </button>
            </div>

            {/* Filters & Search */}
            <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-sm mb-6 sm:mb-8 flex flex-col md:flex-row gap-3 sm:gap-4 items-center">
                <div className="relative flex-1 w-full shrink-0">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search rooms..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                    />
                </div>

                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-hide -mx-3 px-3 sm:mx-0 sm:px-0">
                    <button
                        onClick={() => setFilter('ALL')}
                        className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors ${filter === 'ALL' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                    >
                        All Rooms
                    </button>
                    <button
                        onClick={() => setFilter('PUBLIC')}
                        className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors ${filter === 'PUBLIC' ? 'bg-green-600 text-white' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}
                    >
                        <Unlock size={14} /> Public
                    </button>
                    <button
                        onClick={() => setFilter('PRIVATE')}
                        className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors ${filter === 'PRIVATE' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'}`}
                    >
                        <Lock size={14} /> Private
                    </button>

                    <div className="w-px h-6 bg-slate-200 mx-1 hidden md:block"></div>

                    <button
                        onClick={() => setCatFilter('ALL')}
                        className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors ${catFilter === 'ALL' ? 'bg-blue-900 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}
                    >
                        All Types
                    </button>
                    <button
                        onClick={() => setCatFilter('STUDY')}
                        className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors ${catFilter === 'STUDY' ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'}`}
                    >
                        Study
                    </button>
                    <button
                        onClick={() => setCatFilter('QUIZ')}
                        className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors ${catFilter === 'QUIZ' ? 'bg-purple-600 text-white' : 'bg-purple-50 text-purple-700 hover:bg-purple-100'}`}
                    >
                        Quiz
                    </button>
                    <div className="w-2 shrink-0 md:hidden"></div> {/* Extra space at end for mobile scroll */}
                </div>
            </div>

            {/* Rooms Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-48 bg-slate-100 rounded-xl animate-pulse"></div>
                    ))}
                </div>
            ) : rooms.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {rooms.map(room => (
                        <RoomCard
                            key={room._id}
                            room={room}
                            onJoin={handleJoinRoom}
                            onDelete={handleDeleteRoom}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                        <Users size={32} className="opacity-50" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-700">No rooms found</h3>
                    <p>Try adjusting your search or create a new room.</p>
                </div>
            )}

            <CreateRoomModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onCreated={fetchRooms}
            />

            {/* Mobile FAB */}
            <button
                onClick={() => setIsCreateModalOpen(true)}
                className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center z-40 active:scale-90 transition-transform shadow-blue-600/40"
            >
                <Plus size={28} />
            </button>
        </div>
    );
}
