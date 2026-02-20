import React, { useState } from 'react';
import { X, Lock, Globe, Clock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { api } from '../lib/axios';

interface CreateRoomModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreated: () => void; // Refresh list
}

interface CreateRoomForm {
    name: string;
    examCategory: string;
    subject: string;
    type: 'PUBLIC' | 'PRIVATE';
    password?: string;
    timerMode: string;
}

const CreateRoomModal: React.FC<CreateRoomModalProps> = ({ isOpen, onClose, onCreated }) => {
    const { register, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = useForm<CreateRoomForm>({
        defaultValues: {
            type: 'PUBLIC',
            timerMode: 'POMODORO_25_5'
        }
    });
    const roomType = watch('type');
    const [serverError, setServerError] = useState('');

    if (!isOpen) return null;

    const onSubmit = async (data: CreateRoomForm) => {
        try {
            setServerError('');
            await api.post('/rooms', data);
            onCreated();
            reset(); // Clear form
            onClose();
        } catch (error: any) {
            setServerError(error.response?.data?.message || 'Failed to create room');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center p-6 border-b border-slate-100">
                    <h2 className="text-xl font-bold text-slate-900">Create Study Room</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Room Name</label>
                        <input
                            {...register('name', { required: 'Room name is required' })}
                            placeholder="e.g. Late Night JEE Grind"
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                    </div>

                    {/* Subject & Category */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Exam</label>
                            <select
                                {...register('examCategory', { required: true })}
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                            >
                                <option value="JEE">JEE</option>
                                <option value="NEET">NEET</option>
                                <option value="UPSC">UPSC</option>
                                <option value="GATE">GATE</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                            <input
                                {...register('subject', { required: 'Subject required' })}
                                placeholder="e.g. Physics"
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* Timer Mode */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Timer Mode</label>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { value: 'POMODORO_25_5', label: 'Pomodoro (25/5)' },
                                { value: 'EXTENDED_45_10', label: 'Extended (45/10)' },
                                { value: 'LONG_90_20', label: 'Deep Work (90/20)' },
                                { value: 'CUSTOM', label: 'Custom' }
                            ].map(mode => (
                                <label key={mode.value} className="cursor-pointer">
                                    <input
                                        type="radio"
                                        value={mode.value}
                                        {...register('timerMode')}
                                        className="peer sr-only"
                                    />
                                    <div className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 peer-checked:border-blue-500 peer-checked:bg-blue-50 peer-checked:text-blue-700 flex items-center gap-2 justify-center transition-all">
                                        <Clock size={14} />
                                        {mode.label}
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Room Type */}
                    <div className="space-y-3 pt-2">
                        <label className="block text-sm font-medium text-slate-700">Privacy</label>
                        <div className="flex gap-4">
                            <label className="flex-1 cursor-pointer">
                                <input
                                    type="radio"
                                    value="PUBLIC"
                                    {...register('type')}
                                    className="peer sr-only"
                                />
                                <div className="p-4 border border-slate-200 rounded-xl peer-checked:border-blue-500 peer-checked:bg-blue-50 transition-all flex flex-col items-center gap-2">
                                    <Globe className="peer-checked:text-blue-600 text-slate-400" />
                                    <span className="font-bold text-sm text-slate-700">Public</span>
                                </div>
                            </label>
                            <label className="flex-1 cursor-pointer">
                                <input
                                    type="radio"
                                    value="PRIVATE"
                                    {...register('type')}
                                    className="peer sr-only"
                                />
                                <div className="p-4 border border-slate-200 rounded-xl peer-checked:border-blue-500 peer-checked:bg-blue-50 transition-all flex flex-col items-center gap-2">
                                    <Lock className="peer-checked:text-blue-600 text-slate-400" />
                                    <span className="font-bold text-sm text-slate-700">Private</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Password Field (Conditional) */}
                    {roomType === 'PRIVATE' && (
                        <div className="animate-in slide-in-from-top-2 fade-in duration-200">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Set Create Password</label>
                            <input
                                type="password"
                                {...register('password', { required: roomType === 'PRIVATE' ? 'Password is required' : false })}
                                placeholder="Secret Code"
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            />
                            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                        </div>
                    )}

                    {serverError && <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{serverError}</p>}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                    >
                        {isSubmitting ? 'Creating...' : 'Create Room'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateRoomModal;
