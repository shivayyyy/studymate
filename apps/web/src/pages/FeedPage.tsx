import { useState } from 'react';
import { Search, Bell, Plus, Image, FileText } from 'lucide-react';
import PostCard from '../components/PostCard';
import RightSidebar from '../components/RightSidebar';
import { posts } from '../data/mockPosts';

const tabs = ['Trending', 'Following', 'Saved'];

export default function FeedPage() {
    const [activeTab, setActiveTab] = useState('Trending');

    return (
        <div className="p-8 max-w-[1600px] mx-auto">


            <div className="flex gap-8 items-start">
                {/* Main Feed */}
                <div className="flex-1 min-w-0 max-w-2xl mx-auto">
                    {/* Search Bar */}
                    <div className="relative mb-6">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search for courses, notes, or topics..."
                            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-xl text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
                        />
                    </div>

                    {/* Create Post Input - Twitter Style */}
                    <div className="bg-white border-b border-slate-100 p-4 mb-4">
                        <div className="flex gap-4">
                            <div className="flex-shrink-0">
                                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Aryan" alt="Profile" className="w-10 h-10 rounded-full hover:opacity-90 cursor-pointer" />
                            </div>
                            <div className="flex-1">
                                <textarea
                                    placeholder="What is happening?!"
                                    className="w-full bg-transparent border-none outline-none text-slate-900 text-xl placeholder:text-slate-500 font-normal resize-none h-12 focus:ring-0 p-0 mb-2"
                                    rows={1}
                                />
                                <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                                    <div className="flex gap-1 text-blue-500">
                                        <div className="relative group">
                                            <button className="p-2 hover:bg-blue-50 rounded-full transition-colors">
                                                <Image size={20} />
                                            </button>
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-slate-800 text-white text-[10px] font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                                Media
                                            </div>
                                        </div>
                                        <div className="relative group">
                                            <button className="p-2 hover:bg-blue-50 rounded-full transition-colors">
                                                <FileText size={20} />
                                            </button>
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-slate-800 text-white text-[10px] font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                                GIF
                                            </div>
                                        </div>
                                        <div className="relative group">
                                            <button className="p-2 hover:bg-blue-50 rounded-full transition-colors">
                                                <svg viewBox="0 0 24 24" aria-hidden="true" className="w-5 h-5 fill-current"><g><path d="M6 5.5C6 4.67157 6.67157 4 7.5 4C8.32843 4 9 4.67157 9 5.5V18.5C9 19.3284 8.32843 20 7.5 20C6.67157 20 6 19.3284 6 18.5V5.5ZM17.5 4C16.6716 4 16 4.67157 16 5.5V18.5C16 19.3284 16.6716 20 17.5 20C18.3284 20 19 19.3284 19 18.5V5.5C19 4.67157 18.3284 4 17.5 4ZM12.25 10.5C11.4216 10.5 10.75 11.1716 10.75 12V18.5C10.75 19.3284 11.4216 20 12.25 20C13.0784 20 13.75 19.3284 13.75 18.5V12C13.75 11.1716 13.0784 10.5 12.25 10.5Z"></path></g></svg>
                                            </button>
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-slate-800 text-white text-[10px] font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                                Poll
                                            </div>
                                        </div>
                                        <div className="relative group">
                                            <button className="p-2 hover:bg-blue-50 rounded-full transition-colors">
                                                <svg viewBox="0 0 24 24" aria-hidden="true" className="w-5 h-5 fill-current"><g><path d="M8 10C8 11.1046 8.89543 12 10 12C11.1046 12 12 11.1046 12 10C12 8.89543 11.1046 8 10 8C8.89543 8 8 8.89543 8 10ZM14 10C14 11.1046 14.8954 12 16 12C17.1046 12 18 11.1046 18 10C18 8.89543 17.1046 8 16 8C14.8954 8 14 8.89543 14 10ZM12 19C9.79086 19 7.91508 17.5262 7.25208 15.5H5.11142C5.90159 18.8152 8.58332 21 12 21C15.4167 21 18.0984 18.8152 18.8886 15.5H16.7479C16.0849 17.5262 14.2091 19 12 19ZM2 10C2 15.5228 6.47715 20 12 20C17.5228 20 22 15.5228 22 10C22 4.47715 17.5228 0 12 0C6.47715 0 2 4.47715 2 10ZM20 10C20 14.4183 16.4183 18 12 18C7.58172 18 4 14.4183 4 10C4 5.58172 7.58172 2 12 2C16.4183 2 20 5.58172 20 10Z"></path></g></svg>
                                            </button>
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-slate-800 text-white text-[10px] font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                                Emoji
                                            </div>
                                        </div>
                                        <div className="relative group">
                                            <button className="p-2 hover:bg-blue-50 rounded-full transition-colors">
                                                <svg viewBox="0 0 24 24" aria-hidden="true" className="w-5 h-5 fill-current"><g><path d="M6 3V2H8V3H16V2H18V3H21C21.5523 3 22 3.44772 22 4V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3H6ZM20 20V8H4V20H20ZM20 6H4V5H20V6ZM15 11H9V12H15V11ZM13 14H9V15H13V14Z"></path></g></svg>
                                            </button>
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-slate-800 text-white text-[10px] font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                                Schedule
                                            </div>
                                        </div>
                                    </div>
                                    <div className='flex items-center gap-3'>
                                        <div className="relative group">
                                            <button className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-colors">
                                                <Plus size={20} />
                                            </button>
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-slate-800 text-white text-[10px] font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                                Add File
                                            </div>
                                        </div>
                                        <button className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-1.5 rounded-full text-[15px] font-bold transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                                            Post
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs - Minimal */}
                    <div className="flex border-b border-slate-100 mb-6 bg-white sticky top-0 z-10 opacity-95 backdrop-blur">
                        {tabs.map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 py-4 text-sm font-bold text-center transition-colors relative ${activeTab === tab ? 'text-slate-900' : 'text-slate-500 hover:bg-slate-50'
                                    }`}
                            >
                                {tab}
                                {activeTab === tab && (
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-blue-600 rounded-t-full"></div>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Posts */}
                    <div className="space-y-4">
                        {posts.map((post, index) => (
                            <PostCard key={post.id} post={post} index={index} />
                        ))}
                    </div>
                </div>

                {/* Right Sidebar Column */}
                <div className="hidden xl:block w-80 space-y-6">
                    {/* Profile Header */}
                    <div className="flex items-center justify-end gap-4 mb-2">
                        <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
                            <Bell size={24} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>

                        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                            <div className="text-right hidden sm:block">
                                <h4 className="font-bold text-sm text-slate-900">Aryan Sharma</h4>
                                <p className="text-xs text-slate-500">JEE Aspirant</p>
                            </div>
                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Aryan" alt="Profile" className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200" />
                        </div>
                    </div>

                    <RightSidebar />
                </div>
            </div>

            {/* FAB Mobile */}
            <button className="fixed bottom-24 right-6 lg:hidden w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-600/30 z-50">
                <span className="text-2xl font-bold">+</span>
            </button>
        </div>
    );
}
