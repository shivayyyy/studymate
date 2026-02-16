import {
    GraduationCap,
    PlayCircle,
    Timer,
    Users,
    TrendingUp,
    MessageSquare,
    Download,
    Heart,
    MessageCircle,
    Repeat,
    Share2,
    MoreHorizontal,
    ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="font-sans bg-white text-slate-900 antialiased selection:bg-blue-100 selection:text-blue-900">

            {/* Header */}
            <header className="sticky top-0 z-50 w-full bg-white/70 backdrop-blur-xl border-b border-slate-100">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-12">
                    <div className="flex items-center gap-2 text-blue-600">
                        <GraduationCap size={32} />
                        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">StudyMate</h2>
                    </div>
                    <nav className="hidden md:flex items-center gap-10">
                        <a className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors" href="#">How it Works</a>
                        <a className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors" href="#">Pricing</a>
                        <a className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors" href="#">Resources</a>
                    </nav>
                    <div className="flex items-center gap-6">
                        <button onClick={() => navigate('/feed')} className="hidden sm:block text-sm font-bold text-slate-700 hover:text-blue-600">Login</button>
                        <button onClick={() => navigate('/feed')} className="bg-blue-600 hover:bg-blue-700 text-white px-7 py-3 rounded-full text-sm font-bold shadow-lg shadow-blue-200 transition-all active:scale-95">
                            Sign Up
                        </button>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative pt-20 pb-32 overflow-hidden">
                <div className="absolute top-20 right-0 -z-10 h-[600px] w-[600px] bg-blue-100/50 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-0 left-0 -z-10 h-[400px] w-[400px] bg-indigo-50/50 blur-[100px] rounded-full"></div>

                <div className="mx-auto max-w-7xl px-6 lg:px-12">
                    <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
                        <div className="max-w-2xl">
                            <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-blue-600 mb-8 border border-blue-100">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-600 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                                </span>
                                Join 10,000+ Students
                            </span>
                            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
                                Master Your Exams with <span className="text-blue-600">Collaborative Study</span>
                            </h1>
                            <p className="mt-8 text-xl leading-relaxed text-slate-600">
                                The ultimate bento-powered workspace for JEE, NEET, and UPSC aspirants. Deep focus sessions, real-time analytics, and a community that pushes you further.
                            </p>
                            <div className="mt-10 flex flex-wrap gap-5">
                                <button onClick={() => navigate('/feed')} className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-2xl text-lg font-bold shadow-2xl shadow-blue-300/50 transition-all transform hover:-translate-y-1 active:scale-95">
                                    Start Studying for Free
                                </button>
                                <button className="flex items-center gap-3 bg-white border border-slate-200 px-10 py-5 rounded-2xl text-lg font-bold text-slate-700 hover:bg-slate-50 transition-all active:scale-95">
                                    <PlayCircle size={24} />
                                    Watch Demo
                                </button>
                            </div>
                        </div>

                        <div className="relative lg:ml-10 hidden lg:block">
                            <motion.div
                                initial={{ rotateX: 5, rotateY: -10, rotateZ: 2 }}
                                animate={{ rotateX: 0, rotateY: 0, rotateZ: 0 }}
                                transition={{ duration: 5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                                className="bg-white rounded-[2.5rem] border border-slate-200 p-4 shadow-2xl relative z-10"
                                style={{ perspective: 1000 }}
                            >
                                <div className="bg-slate-50 rounded-[2rem] p-6">
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center text-white">
                                                <Timer size={20} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Current Session</p>
                                                <p className="text-sm font-bold">UPSC Ethics Paper II</p>
                                            </div>
                                        </div>
                                        <div className="h-8 px-3 bg-green-100 rounded-full flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 bg-green-600 rounded-full animate-pulse"></span>
                                            <span className="text-[10px] font-bold text-green-700 uppercase">LIVE NOW</span>
                                        </div>
                                    </div>

                                    {/* Placeholder for Dashboard Image - Improved simulation */}
                                    <div className="rounded-2xl w-full border border-slate-200 bg-white h-64 overflow-hidden relative">
                                        {/* Mock Dashboard UI */}
                                        <div className="absolute inset-0 bg-slate-50 p-4 grid grid-cols-3 gap-3">
                                            <div className="col-span-2 bg-white rounded-xl shadow-sm h-full p-3">
                                                <div className="w-1/2 h-3 bg-slate-100 rounded mb-2"></div>
                                                <div className="w-3/4 h-3 bg-slate-100 rounded mb-4"></div>
                                                <div className="flex gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-blue-100"></div>
                                                    <div className="w-8 h-8 rounded-full bg-green-100"></div>
                                                </div>
                                            </div>
                                            <div className="col-span-1 bg-blue-50 rounded-xl h-full border border-blue-100 flex items-center justify-center">
                                                <div className="text-center">
                                                    <div className="text-xl font-bold text-blue-600">25:00</div>
                                                    <div className="text-[8px] text-blue-400 font-bold uppercase">Focus</div>
                                                </div>
                                            </div>
                                            <div className="col-span-3 bg-white rounded-xl shadow-sm h-24 p-2 flex items-end gap-1">
                                                {[40, 60, 45, 70, 50, 80, 65].map((h, i) => (
                                                    <div key={i} style={{ height: `${h}%` }} className="flex-1 bg-slate-100 rounded-sm"></div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mt-6">
                                        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Daily Goal</p>
                                            <p className="text-xl font-bold text-slate-900">8.5 / 10h</p>
                                            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                                                <div className="bg-blue-600 h-full w-[85%] rounded-full"></div>
                                            </div>
                                        </div>
                                        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Focus Score</p>
                                            <p className="text-xl font-bold text-slate-900">92%</p>
                                            <div className="flex gap-1 mt-2">
                                                <div className="h-1.5 w-full bg-blue-600 rounded-full"></div>
                                                <div className="h-1.5 w-full bg-blue-600 rounded-full"></div>
                                                <div className="h-1.5 w-full bg-blue-600 rounded-full"></div>
                                                <div className="h-1.5 w-full bg-slate-100 rounded-full"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Trust Logos */}
            <section className="py-16 bg-white border-y border-slate-100">
                <div className="mx-auto max-w-7xl px-6 lg:px-12 text-center">
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] mb-10">Trusted by 10,000+ students from top institutions</p>
                    <div className="flex flex-wrap justify-center items-center gap-12 lg:gap-20 grayscale opacity-60">
                        {['IIT BOMBAY', 'AIIMS DELHI', 'BITS PILANI', 'NIT TRICHY', 'IIM AHMEDABAD'].map((name) => (
                            <div key={name} className="flex items-center gap-3">
                                <GraduationCap size={32} />
                                <span className="text-xl font-bold tracking-tighter text-slate-800">{name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Bento Grid */}
            <section className="py-24 bg-slate-50/50">
                <div className="mx-auto max-w-7xl px-6 lg:px-12">
                    <div className="mb-16">
                        <h2 className="text-4xl font-extrabold text-slate-900">Everything you need to <span className="text-blue-600">succeed</span>.</h2>
                        <p className="mt-4 text-lg text-slate-600">A unified platform built for high-performance learning.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
                        {/* Card 1 - Rooms */}
                        <div className="md:col-span-2 md:row-span-2 bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden group">
                            <div>
                                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-6">
                                    <Users size={24} />
                                </span>
                                <h3 className="text-3xl font-bold mb-4 text-slate-900">Virtual Study Rooms</h3>
                                <p className="text-slate-600 max-w-md leading-relaxed">Study with aspirants across the country. Toggle your camera, join a table, and stay focused with integrated tools.</p>
                            </div>
                            <div className="mt-8 relative h-full flex items-center justify-center">
                                <div className="w-full max-w-sm aspect-square bg-slate-50 rounded-full border-8 border-white shadow-inner flex items-center justify-center relative overflow-hidden">
                                    <div className="absolute inset-0 bg-blue-500/5 animate-pulse"></div>
                                    <div className="text-center z-10">
                                        <p className="text-6xl font-black text-slate-900 tabular-nums">25:00</p>
                                        <p className="text-sm font-bold text-blue-600 mt-2 uppercase tracking-widest">Focus Mode Active</p>
                                    </div>
                                    <div className="absolute h-48 w-48 border-2 border-blue-600/10 rounded-full animate-ping"></div>
                                </div>
                            </div>
                        </div>

                        {/* Card 2 - Analytics */}
                        <div className="md:col-span-1 md:row-span-2 bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col">
                            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-green-600 mb-6">
                                <TrendingUp size={24} />
                            </span>
                            <h3 className="text-2xl font-bold mb-4 text-slate-900">Analytics</h3>
                            <p className="text-slate-600 leading-relaxed mb-10">Real-time tracking of your performance across subjects and topics.</p>
                            <div className="flex-1 flex items-end gap-2 px-2">
                                {[40, 60, 45, 85, 70, 100].map((h, i) => (
                                    <div key={i} className="w-full bg-green-100 rounded-t-xl transition-all duration-500 hover:bg-green-500 group-hover:bg-green-500" style={{ height: `${h}%` }}></div>
                                ))}
                            </div>
                            <div className="mt-4 flex justify-between text-[10px] font-bold text-slate-400">
                                <span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span>
                            </div>
                        </div>

                        {/* Card 3 - Community Feed (Revamped) */}
                        <div className="md:col-span-3 md:row-span-1 bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col md:flex-row items-center gap-12 overflow-hidden relative group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full translate-x-1/3 -translate-y-1/3 -z-10 group-hover:scale-110 transition-transform duration-700"></div>

                            <div className="md:w-1/3 relative z-10">
                                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 mb-6">
                                    <MessageSquare size={24} />
                                </span>
                                <h3 className="text-3xl font-bold mb-4 text-slate-900">Your Academic Circle</h3>
                                <p className="text-slate-600 leading-relaxed mb-6">
                                    No more lonely prep. Connect with serious aspirants, share notes, and clear doubts in real-time.
                                </p>
                                <div className="flex items-center gap-3 text-sm font-bold text-indigo-600 cursor-pointer hover:underline">
                                    <span>Explore the Feed</span>
                                    <ArrowRight size={16} />
                                </div>
                            </div>

                            <div className="md:w-2/3 w-full relative h-[320px] bg-slate-50/50 rounded-2xl border border-slate-100 p-4 border-dashed overflow-hidden mask-linear-gradient">
                                <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-slate-50/50 to-transparent z-10"></div>
                                <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-slate-50/50 to-transparent z-10"></div>

                                <motion.div
                                    animate={{ y: [0, -140] }}
                                    transition={{ duration: 10, repeat: Infinity, repeatType: "mirror", ease: "linear" }}
                                    className="space-y-4"
                                >
                                    {/* Post 1 */}
                                    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-3">
                                                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Riya" alt="Riya" className="h-10 w-10 rounded-full bg-slate-100" />
                                                <div>
                                                    <p className="font-bold text-slate-900">Riya M. <span className="text-slate-400 font-normal">@riyam_jee</span></p>
                                                    <p className="text-xs text-slate-400">2h ago</p>
                                                </div>
                                            </div>
                                            <button className="text-slate-400 hover:text-slate-600"><MoreHorizontal size={16} /></button>
                                        </div>
                                        <p className="text-slate-700 text-sm leading-relaxed mb-3">
                                            Found this amazing mnemonics chart for p-block elements! 🧪 Literally saved me 3 hours of rote learning. Attached the PDF below 👇
                                        </p>
                                        <div className="bg-blue-50 rounded-lg p-3 flex items-center gap-3 mb-4 border border-blue-100">
                                            <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600"><Download size={16} /></div>
                                            <div className="flex-1">
                                                <p className="text-xs font-bold text-slate-900">P-Block_Shortnotes.pdf</p>
                                                <p className="text-[10px] text-slate-500">2.4 MB • PDF</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between text-slate-400 text-xs px-2">
                                            <button className="flex items-center gap-2 hover:text-blue-500 transition-colors"><MessageCircle size={16} /> 12</button>
                                            <button className="flex items-center gap-2 hover:text-green-500 transition-colors"><Repeat size={16} /> 4</button>
                                            <button className="flex items-center gap-2 hover:text-red-500 transition-colors"><Heart size={16} /> 89</button>
                                            <button className="flex items-center gap-2 hover:text-blue-500 transition-colors"><Share2 size={16} /></button>
                                        </div>
                                    </div>

                                    {/* Post 2 */}
                                    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 opacity-90">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-3">
                                                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun" alt="Arjun" className="h-10 w-10 rounded-full bg-slate-100" />
                                                <div>
                                                    <p className="font-bold text-slate-900">Arjun K. <span className="text-slate-400 font-normal">@arjun_neet</span></p>
                                                    <p className="text-xs text-slate-400">5h ago</p>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-slate-700 text-sm leading-relaxed mb-3">
                                            Does anyone have clear diagrams for Human Heart anatomy? The NCERT one is a bit confusing.
                                        </p>
                                        <div className="flex items-center justify-between text-slate-400 text-xs px-2">
                                            <button className="flex items-center gap-2 hover:text-blue-500 transition-colors"><MessageCircle size={16} /> 24</button>
                                            <button className="flex items-center gap-2 hover:text-green-500 transition-colors"><Repeat size={16} /> 2</button>
                                            <button className="flex items-center gap-2 hover:text-red-500 transition-colors"><Heart size={16} /> 34</button>
                                            <button className="flex items-center gap-2 hover:text-blue-500 transition-colors"><Share2 size={16} /></button>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Success Stories */}
            <section className="py-24 bg-white">
                <div className="mx-auto max-w-7xl px-6 lg:px-12">
                    <h2 className="mb-20 text-center text-4xl font-extrabold text-slate-900 tracking-tight">Success Stories from <span className="text-blue-600 underline decoration-blue-100 underline-offset-8">Toppers</span></h2>
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                        {[
                            { name: "Aditya Sharma", rank: "AIR 45 - JEE Advance", text: "StudyMate's analytics were a game-changer. Seeing my weekly focus heatmap helped me realize I was neglecting Physics in the mornings.", seed: "Aditya" },
                            { name: "Priya Singh", rank: "Rank 12 - UPSC CSE", text: "UPSC is lonely. The virtual rooms gave me a sense of community. The shared mind-maps for GS Paper II were incredibly useful.", seed: "Priya" },
                            { name: "Rahul Verma", rank: "AIR 88 - NEET", text: "The 24/7 library rooms kept me disciplined during final months. Seeing others work hard motivated me to stay on my desk longer.", seed: "Rahul" }
                        ].map((story) => (
                            <div key={story.name} className="flex flex-col rounded-3xl bg-slate-50 p-10 border border-slate-100 transition-transform hover:-translate-y-2">
                                <div className="flex items-center gap-4 mb-8">
                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${story.seed}`} alt={story.name} className="h-14 w-14 rounded-full object-cover ring-4 ring-white bg-slate-200" />
                                    <div>
                                        <p className="font-bold text-slate-900 text-lg">{story.name}</p>
                                        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{story.rank}</p>
                                    </div>
                                </div>
                                <p className="text-slate-600 leading-relaxed text-lg italic">"{story.text}"</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24">
                <div className="mx-auto max-w-7xl px-6 lg:px-12">
                    <div className="relative overflow-hidden rounded-[3rem] bg-slate-900 px-8 py-20 text-center text-white lg:px-24">
                        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
                        <div className="relative z-10 max-w-3xl mx-auto">
                            <h2 className="text-4xl lg:text-6xl font-extrabold mb-8 tracking-tight">Ready to Top Your Next Exam?</h2>
                            <p className="text-xl text-slate-300 mb-12">Join thousands of students who are turning their study goals into reality. No credit card required.</p>
                            <div className="flex flex-col sm:flex-row justify-center gap-5">
                                <button onClick={() => navigate('/feed')} className="bg-blue-600 hover:bg-blue-500 text-white px-12 py-5 rounded-2xl text-xl font-extrabold transition-all shadow-xl shadow-blue-500/20">
                                    Join for Free Now
                                </button>
                                <button className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-12 py-5 rounded-2xl text-xl font-extrabold transition-all border border-white/20">
                                    View Pricing
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white border-t border-slate-100 py-20">
                <div className="mx-auto max-w-7xl px-6 lg:px-12">
                    <div className="grid grid-cols-2 gap-12 lg:grid-cols-5">
                        <div className="col-span-2">
                            <div className="flex items-center gap-2 text-blue-600 mb-8">
                                <GraduationCap size={32} />
                                <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">StudyMate</h2>
                            </div>
                            <p className="text-slate-500 leading-relaxed mb-8 max-w-sm">
                                The premium bento-style destination for collaborative exam preparation in India. Focused, disciplined, and data-driven.
                            </p>
                            <div className="flex gap-4">
                                <a className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-blue-600 transition-colors" href="#">
                                    <span className="sr-only">Twitter</span>
                                    <svg className="h-5 w-5 fill-currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path></svg>
                                </a>
                                <a className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-blue-600 transition-colors" href="#">
                                    <span className="sr-only">Twitter</span>
                                    <svg className="h-5 w-5 fill-currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"></path></svg>
                                </a>
                            </div>
                        </div>
                        <div>
                            <h4 className="mb-6 font-bold text-slate-900 uppercase tracking-widest text-xs">Exams</h4>
                            <ul className="space-y-4 text-slate-500 text-sm font-medium">
                                <li><a className="hover:text-blue-600 transition-colors" href="#">JEE Main & Advanced</a></li>
                                <li><a className="hover:text-blue-600 transition-colors" href="#">NEET-UG</a></li>
                                <li><a className="hover:text-blue-600 transition-colors" href="#">UPSC CSE</a></li>
                                <li><a className="hover:text-blue-600 transition-colors" href="#">GATE 2025</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="mb-6 font-bold text-slate-900 uppercase tracking-widest text-xs">Product</h4>
                            <ul className="space-y-4 text-slate-500 text-sm font-medium">
                                <li><a className="hover:text-blue-600 transition-colors" href="#">Study Rooms</a></li>
                                <li><a className="hover:text-blue-600 transition-colors" href="#">Bento Dashboard</a></li>
                                <li><a className="hover:text-blue-600 transition-colors" href="#">Note Sharing</a></li>
                                <li><a className="hover:text-blue-600 transition-colors" href="#">Leaderboard</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="mb-6 font-bold text-slate-900 uppercase tracking-widest text-xs">Support</h4>
                            <ul className="space-y-4 text-slate-500 text-sm font-medium">
                                <li><a className="hover:text-blue-600 transition-colors" href="#">Help Center</a></li>
                                <li><a className="hover:text-blue-600 transition-colors" href="#">Contact Us</a></li>
                                <li><a className="hover:text-blue-600 transition-colors" href="#">Privacy</a></li>
                                <li><a className="hover:text-blue-600 transition-colors" href="#">Terms</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-20 border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-400 font-medium">
                        <p>© 2024 StudyMate EdTech. Empowering future leaders.</p>
                        <div className="flex items-center gap-6">
                            <span>English (IN)</span>
                            <span>Cookie Policy</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
