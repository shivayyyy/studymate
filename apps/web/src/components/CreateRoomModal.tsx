
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';

// Schema matching backend - keeping in sync manually for now
const createRoomSchema = z.object({
    name: z.string().min(3, 'Room name must be at least 3 characters').max(100),
    subject: z.string().min(1, 'Subject is required'),
    examCategory: z.enum(['JEE', 'NEET', 'UPSC', 'GATE']),
    timerMode: z.enum(['POMODORO_25_5', 'EXTENDED_45_10', 'LONG_90_20', 'CUSTOM']),
    customTimerConfig: z.object({
        focusMinutes: z.number().min(1).max(120),
        breakMinutes: z.number().min(1).max(60),
    }).optional(),
    maxOccupancy: z.number().min(2).max(500).default(50),
});

type CreateRoomInputs = z.infer<typeof createRoomSchema>;

interface CreateRoomModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function CreateRoomModal({ isOpen, onClose, onSuccess }: CreateRoomModalProps) {
    const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<CreateRoomInputs>({
        resolver: zodResolver(createRoomSchema as any),
        defaultValues: {
            timerMode: 'POMODORO_25_5',
            examCategory: 'JEE',
            maxOccupancy: 50,
        }
    });

    const selectedTimerMode = watch('timerMode');

    const onSubmit = async (data: CreateRoomInputs) => {
        try {
            // API Call
            const response = await fetch('/api/rooms', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${token}` // TODO: Add real auth
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || 'Failed to create room');
            }

            onSuccess();
            onClose();
        } catch (error: any) {
            console.error(error);
            alert(error.message || 'Error creating room');
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-2xl shadow-xl z-[70] p-6 max-h-[90vh] overflow-y-auto"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-slate-900">Create Study Room</h2>
                            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Room Name</label>
                                <input {...register('name')} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Late Night Physics Grind" />
                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                                    <input {...register('subject')} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Physics" />
                                    {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject.message}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                                    <select {...register('examCategory')} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                                        {['JEE', 'NEET', 'UPSC', 'GATE'].map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Timer Mode</label>
                                <select {...register('timerMode')} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                                    <option value="POMODORO_25_5">Pomodoro (25/5)</option>
                                    <option value="EXTENDED_45_10">Extended (45/10)</option>
                                    <option value="LONG_90_20">Long Session (90/20)</option>
                                    <option value="CUSTOM">Custom</option>
                                </select>
                            </div>

                            {selectedTimerMode === 'CUSTOM' && (
                                <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Focus (min)</label>
                                        <input type="number" {...register('customTimerConfig.focusMinutes', { valueAsNumber: true })} className="w-full px-3 py-2 border rounded-lg" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Break (min)</label>
                                        <input type="number" {...register('customTimerConfig.breakMinutes', { valueAsNumber: true })} className="w-full px-3 py-2 border rounded-lg" />
                                    </div>
                                </div>
                            )}

                            <button disabled={isSubmitting} type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                                {isSubmitting ? <Loader2 className="animate-spin" /> : 'Create Room'}
                            </button>
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
