import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ChevronRight, Check, Atom, Stethoscope, Building2, Cpu, GraduationCap, Timer, Brain, Clock } from 'lucide-react';
import { api } from '../lib/axios';
import { useUserStore } from '../stores/useUserStore';

// --- Validation Schemas ---
const step1Schema = z.object({
    fullName: z.string().min(2, 'Name must be at least 2 characters'),
    username: z.string().min(3, 'Username must be at least 3 characters'),
    bio: z.string().max(150, 'Bio must be less than 150 characters').optional(),
});

const step2Schema = z.object({
    examCategory: z.enum(['JEE', 'NEET', 'UPSC', 'GATE']),
});

const step3Schema = z.object({
    subjects: z.array(z.string()).min(1, 'Select at least one subject'),
    targetYear: z.number().int(),
    dailyStudyGoal: z.number().min(2).max(12),
});

const step4Schema = z.object({
    timerPreference: z.object({
        mode: z.enum(['POMODORO', 'EXTENDED', 'DEEP', 'CUSTOM']),
        focusDuration: z.number(),
        breakDuration: z.number(),
    }),
});

// --- Types ---
type FormData = z.infer<typeof step1Schema> &
    z.infer<typeof step2Schema> &
    z.infer<typeof step3Schema> &
    z.infer<typeof step4Schema>;

const initialData: FormData = {
    fullName: '',
    username: '',
    bio: '',
    examCategory: 'JEE',
    subjects: [],
    targetYear: new Date().getFullYear() + 1,
    dailyStudyGoal: 6,
    timerPreference: {
        mode: 'POMODORO',
        focusDuration: 25,
        breakDuration: 5,
    },
};

// --- Components ---

const StepIndicator = ({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) => (
    <div className="flex justify-center space-x-2 mb-8">
        {Array.from({ length: totalSteps }).map((_, i) => (
            <motion.div
                key={i}
                initial={false}
                animate={{
                    scale: i + 1 === currentStep ? 1.2 : 1,
                    backgroundColor: i + 1 <= currentStep ? '#3B82F6' : '#E2E8F0',
                }}
                className="w-2.5 h-2.5 rounded-full"
            />
        ))}
    </div>
);

// --- Main Page Component ---

export default function ProfileSetupPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [direction, setDirection] = useState(0);
    const [formData, setFormData] = useState<FormData>(initialData);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const totalSteps = 5;

    const { user, updateUser } = useUserStore();

    // Load user data from store
    useEffect(() => {
        if (user) {
            setFormData((prev) => ({
                ...prev,
                fullName: user.fullName || '',
                username: user.username || '',
                // Pre-fill other fields if they exist (e.g. if user comes back to edit)
                bio: (user as any).bio || '',
            }));
        }
    }, [user]);

    const handleNext = async (data: Partial<FormData>) => {
        setFormData((prev) => ({ ...prev, ...data }));
        if (step < totalSteps) {
            setDirection(1);
            setStep(step + 1);
        } else {
            await handleSubmitFinal();
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setDirection(-1);
            setStep(step - 1);
        }
    };

    const handleSubmitFinal = async () => {
        setIsSubmitting(true);
        try {
            const response = await api.put('/users/me', formData);
            const updatedUser = response.data.data; // Assuming API returns wrapped data

            // Update Global Store
            updateUser(updatedUser);

            navigate('/feed');
        } catch (error) {
            console.error('Failed to save profile:', error);
            // Handle error (toast, etc.)
        } finally {
            setIsSubmitting(false);
        }
    };

    const variants = {
        enter: (dir: number) => ({
            x: dir > 0 ? 1000 : -1000,
            opacity: 0,
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
        },
        exit: (dir: number) => ({
            zIndex: 0,
            x: dir < 0 ? 1000 : -1000,
            opacity: 0,
        }),
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-br from-[#0F172A] to-[#1E3A5F] p-4 font-sans text-gray-800">
            <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl overflow-hidden relative min-h-[600px] flex flex-col">
                {/* Progress Bar */}
                <div className="h-1 bg-gray-100 w-full">
                    <motion.div
                        className="h-full bg-blue-500"
                        animate={{ width: `${(step / totalSteps) * 100}%` }}
                    />
                </div>

                <div className="p-8 flex-1 flex flex-col">
                    <StepIndicator currentStep={step} totalSteps={totalSteps} />

                    <div className="flex-1 relative overflow-hidden">
                        <AnimatePresence initial={false} custom={direction} mode='wait'>
                            {step === 1 && (
                                <Step1Personal
                                    key="step1"
                                    custom={direction}
                                    variants={variants}
                                    defaultValues={formData}
                                    onNext={handleNext}
                                />
                            )}
                            {step === 2 && (
                                <Step2Exam
                                    key="step2"
                                    custom={direction}
                                    variants={variants}
                                    defaultValues={formData}
                                    onNext={handleNext}
                                    onBack={handleBack}
                                />
                            )}
                            {step === 3 && (
                                <Step3SubjectYear
                                    key="step3"
                                    custom={direction}
                                    variants={variants}
                                    defaultValues={formData}
                                    onNext={handleNext}
                                    onBack={handleBack}
                                />
                            )}
                            {step === 4 && (
                                <Step4Timer
                                    key="step4"
                                    custom={direction}
                                    variants={variants}
                                    defaultValues={formData}
                                    onNext={handleNext}
                                    onBack={handleBack}
                                />
                            )}
                            {step === 5 && (
                                <Step5Confirmation
                                    key="step5"
                                    custom={direction}
                                    variants={variants}
                                    formData={formData}
                                    onSubmit={handleSubmitFinal}
                                    onBack={handleBack}
                                    isSubmitting={isSubmitting}
                                />
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- Step Components ---

function Step1Personal({ custom, variants, defaultValues, onNext }: any) {
    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(step1Schema),
        defaultValues: {
            fullName: defaultValues.fullName,
            username: defaultValues.username,
            bio: defaultValues.bio
        }
    });

    return (
        <motion.form
            custom={custom}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
            className="flex flex-col h-full"
            onSubmit={handleSubmit(onNext)}
        >
            <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-3 flex items-center justify-center overflow-hidden">
                    {/* Placeholder for avatar */}
                    <span className="text-2xl">👤</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Complete Your Profile</h2>
                <p className="text-sm text-gray-500">Help us personalize your experience</p>
            </div>

            <div className="space-y-4 flex-1">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                        {...register("fullName")}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        placeholder="John Doe"
                    />
                    {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message as string}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">@</span>
                        <input
                            {...register("username")}
                            className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            placeholder="username"
                        />
                    </div>
                    {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message as string}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                    <textarea
                        {...register("bio")}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none h-24"
                        placeholder="Tell aspirants about yourself..."
                    />
                    {errors.bio && <p className="text-red-500 text-xs mt-1">{errors.bio.message as string}</p>}
                </div>
            </div>

            <div className="mt-6 flex justify-end">
                <button type="submit" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center">
                    Continue <ChevronRight className="w-4 h-4 ml-1" />
                </button>
            </div>
        </motion.form>
    );
}

function Step2Exam({ custom, variants, defaultValues, onNext, onBack }: any) {
    const { control, handleSubmit } = useForm({
        defaultValues: { examCategory: defaultValues.examCategory },
        resolver: zodResolver(step2Schema)
    });

    const exams = [
        { id: 'JEE', name: 'JEE', desc: 'Engineering Entrance', icon: <Atom size={24} /> },
        { id: 'NEET', name: 'NEET', desc: 'Medical Entrance', icon: <Stethoscope size={24} /> },
        { id: 'UPSC', name: 'UPSC', desc: 'Civil Services', icon: <Building2 size={24} /> },
        { id: 'GATE', name: 'GATE', desc: 'Graduate Aptitude', icon: <Cpu size={24} /> },
    ];

    return (
        <motion.form
            custom={custom}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ x: { type: "spring", stiffness: 300, damping: 30 } }}
            className="flex flex-col h-full"
            onSubmit={handleSubmit(onNext)}
        >
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Which exam are you targeting?</h2>
                <p className="text-sm text-gray-500">We'll personalize your rooms and feed</p>
            </div>

            <div className="flex-1 grid grid-cols-2 gap-4">
                <Controller
                    name="examCategory"
                    control={control}
                    render={({ field }) => (
                        <>
                            {exams.map((exam) => (
                                <div
                                    key={exam.id}
                                    onClick={() => field.onChange(exam.id)}
                                    className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex flex-col items-center justify-center text-center gap-2
                                        ${field.value === exam.id ? 'border-blue-500 bg-blue-50 shadow-md ring-1 ring-blue-500' : 'border-gray-100 hover:border-blue-200 bg-white'}
                                    `}
                                >
                                    {field.value === exam.id && (
                                        <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full text-white flex items-center justify-center shadow-sm">
                                            <Check size={14} strokeWidth={3} />
                                        </div>
                                    )}
                                    <div className={`p-3 rounded-full ${field.value === exam.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                                        {exam.icon}
                                    </div>
                                    <div>
                                        <h3 className={`font-bold ${field.value === exam.id ? 'text-blue-900' : 'text-gray-900'}`}>{exam.name}</h3>
                                        <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wide mt-1">{exam.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                />
            </div>

            <div className="mt-8 flex justify-between items-center">
                <button type="button" onClick={onBack} className="text-gray-400 hover:text-gray-600 font-medium px-4 py-2">
                    Back
                </button>
                <button type="submit" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center">
                    Continue <ChevronRight className="w-4 h-4 ml-1" />
                </button>
            </div>
        </motion.form>
    );
}

function Step3SubjectYear({ custom, variants, defaultValues, onNext, onBack }: any) {
    const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm({
        defaultValues: {
            targetYear: defaultValues.targetYear,
            dailyStudyGoal: defaultValues.dailyStudyGoal,
            subjects: defaultValues.subjects
        },
        resolver: zodResolver(step3Schema)
    });

    const dailyGoal = watch('dailyStudyGoal');
    const selectedSubjects = watch('subjects');

    const getSubjects = (category: string) => {
        switch (category) {
            case 'JEE': return ['Mathematics', 'Physics', 'Chemistry'];
            case 'NEET': return ['Biology', 'Physics', 'Chemistry'];
            case 'UPSC': return ['GS Prelims', 'GS Mains', 'Essay', 'Optional', 'Current Affairs'];
            case 'GATE': return ['Core Subject', 'Mathematics', 'Aptitude'];
            default: return ['Available Subjects'];
        }
    };

    const availableSubjects = getSubjects(defaultValues.examCategory);
    const years = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() + i);

    return (
        <motion.form
            custom={custom}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ x: { type: "spring", stiffness: 300, damping: 30 } }}
            className="flex flex-col h-full"
            onSubmit={handleSubmit(onNext)}
        >
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Set Your Focus</h2>
                <p className="text-sm text-gray-500">Select subjects and your target year</p>
            </div>

            <div className="space-y-6 flex-1 overflow-y-auto px-1">
                {/* Subjects */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Subjects (Select all that apply)</label>
                    <div className="flex flex-wrap gap-2">
                        {availableSubjects.map(sub => (
                            <button
                                key={sub}
                                type="button"
                                onClick={() => {
                                    const current = selectedSubjects || [];
                                    const next = current.includes(sub)
                                        ? current.filter((s: string) => s !== sub)
                                        : [...current, sub];
                                    setValue('subjects', next, { shouldValidate: true });
                                }}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border
                                    ${selectedSubjects?.includes(sub)
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                                        : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                                    }
                                `}
                            >
                                {sub}
                            </button>
                        ))}
                    </div>
                    {errors.subjects && <p className="text-red-500 text-xs mt-1">{errors.subjects.message as string}</p>}
                </div>

                {/* Target Year */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Target Exam Year</label>
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                        <Controller
                            control={control}
                            name="targetYear"
                            render={({ field }) => (
                                <>
                                    {years.map(year => (
                                        <button
                                            key={year}
                                            type="button"
                                            onClick={() => field.onChange(year)}
                                            className={`px-5 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all border-2
                                                ${field.value === year
                                                    ? 'bg-blue-600 text-white border-blue-600'
                                                    : 'bg-white text-gray-500 border-gray-100 hover:border-gray-200'
                                                }
                                            `}
                                        >
                                            {year}
                                        </button>
                                    ))}
                                </>
                            )}
                        />
                    </div>
                </div>

                {/* Daily Goal */}
                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                    <div className="flex justify-between items-end mb-4">
                        <label className="block text-sm font-medium text-blue-900">Daily Study Goal</label>
                        <span className="text-2xl font-bold text-blue-600">{dailyGoal} <span className="text-sm text-blue-400 font-normal">hrs</span></span>
                    </div>
                    <input
                        type="range"
                        min="2"
                        max="12"
                        step="1"
                        {...register('dailyStudyGoal', { valueAsNumber: true })}
                        className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between text-[10px] text-gray-400 mt-2 font-medium">
                        <span>2h</span>
                        <span>4h</span>
                        <span>6h</span>
                        <span>8h</span>
                        <span>10h</span>
                        <span>12h</span>
                    </div>
                </div>
            </div>

            <div className="mt-6 flex justify-between items-center">
                <button type="button" onClick={onBack} className="text-gray-400 hover:text-gray-600 font-medium px-4 py-2">
                    Back
                </button>
                <button type="submit" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center">
                    Continue <ChevronRight className="w-4 h-4 ml-1" />
                </button>
            </div>
        </motion.form>
    );
}

function Step4Timer({ custom, variants, defaultValues, onNext, onBack }: any) {
    const { control, handleSubmit } = useForm({
        defaultValues: { timerPreference: defaultValues.timerPreference },
        resolver: zodResolver(step4Schema)
    });

    const options = [
        { id: 'POMODORO', title: 'Classic Pomodoro', sub: '25 min study • 5 min break', icon: <Timer />, tag: 'Popular', focus: 25, break: 5 },
        { id: 'EXTENDED', title: 'Extended Focus', sub: '45 min study • 10 min break', icon: <Clock />, focus: 45, break: 10 },
        { id: 'DEEP', title: 'Deep Work', sub: '90 min study • 20 min break', icon: <Brain />, tag: 'Pro', focus: 90, break: 20 },
        { id: 'CUSTOM', title: 'Custom Timer', sub: 'Set your own duration', icon: <GraduationCap /> },
    ];

    return (
        <motion.form
            custom={custom}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ x: { type: "spring", stiffness: 300, damping: 30 } }}
            className="flex flex-col h-full"
            onSubmit={handleSubmit((data) => {
                // Determine values based on mode if not custom (though state should be synced)
                // For simplicity, we trust the form update logic in render or assume user didn't change numbers if not custom
                onNext(data);
            })}
        >
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Choose Your Study Style</h2>
                <p className="text-sm text-gray-500">Pick your default Pomodoro timer mode</p>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto px-1">
                <Controller
                    name="timerPreference"
                    control={control}
                    render={({ field }) => (
                        <>
                            {options.map(opt => (
                                <div
                                    key={opt.id}
                                    onClick={() => {
                                        if (opt.id !== 'CUSTOM') {
                                            field.onChange({ mode: opt.id, focusDuration: opt.focus, breakDuration: opt.break });
                                        } else {
                                            field.onChange({ ...field.value, mode: 'CUSTOM' });
                                        }
                                    }}
                                    className={`relative group p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                                        ${field.value.mode === opt.id
                                            ? 'border-blue-500 bg-blue-50/50 ring-1 ring-blue-100'
                                            : 'border-gray-100 bg-white hover:border-blue-200'
                                        }
                                    `}
                                >
                                    {field.value.mode === opt.id && (
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-500">
                                            <Check size={20} />
                                        </div>
                                    )}

                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-full ${field.value.mode === opt.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                                            {opt.icon}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className={`font-bold ${field.value.mode === opt.id ? 'text-blue-900' : 'text-gray-900'}`}>{opt.title}</h3>
                                                {opt.tag && <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${opt.tag === 'Popular' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`}>{opt.tag}</span>}
                                            </div>
                                            {opt.id === 'CUSTOM' && field.value.mode === 'CUSTOM' ? (
                                                <div className="flex items-center gap-3 mt-2" onClick={(e) => e.stopPropagation()}>
                                                    <label className="text-xs text-gray-500 flex items-center gap-1">
                                                        Focus:
                                                        <input
                                                            type="number"
                                                            className="w-12 p-1 border rounded text-center text-gray-900 font-bold"
                                                            value={field.value.focusDuration}
                                                            onChange={(e) => field.onChange({ ...field.value, focusDuration: parseInt(e.target.value) || 25 })}
                                                        />
                                                        min
                                                    </label>
                                                    <label className="text-xs text-gray-500 flex items-center gap-1">
                                                        Break:
                                                        <input
                                                            type="number"
                                                            className="w-12 p-1 border rounded text-center text-gray-900 font-bold"
                                                            value={field.value.breakDuration}
                                                            onChange={(e) => field.onChange({ ...field.value, breakDuration: parseInt(e.target.value) || 5 })}
                                                        />
                                                        min
                                                    </label>
                                                </div>
                                            ) : (
                                                <p className="text-xs text-gray-500">{opt.sub}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                />
            </div>

            <div className="mt-6 flex justify-between items-center">
                <button type="button" onClick={onBack} className="text-gray-400 hover:text-gray-600 font-medium px-4 py-2">
                    Back
                </button>
                <button type="submit" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center">
                    Continue <ChevronRight className="w-4 h-4 ml-1" />
                </button>
            </div>
        </motion.form>
    );
}

function Step5Confirmation({ custom, variants, formData, onSubmit, onBack, isSubmitting }: any) {
    return (
        <motion.div
            custom={custom}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ x: { type: "spring", stiffness: 300, damping: 30 } }}
            className="flex flex-col h-full text-center items-center justify-center py-6"
        >
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 text-green-500"
            >
                <Check size={48} strokeWidth={4} />
            </motion.div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">You're all set!</h2>
            <p className="text-gray-500 mb-8">Welcome to StudyMate, {formData.fullName.split(' ')[0]}! 🎉</p>

            <div className="bg-gray-50 rounded-2xl w-full p-6 space-y-4 text-left border border-gray-100 shadow-sm mb-8">
                <ConfirmationRow label="📚 Exam" value={`${formData.examCategory} ${formData.targetYear}`} />
                <ConfirmationRow label="📖 Subjects" value={formData.subjects.join(', ')} />
                <ConfirmationRow label="⏱ Timer" value={`${formData.timerPreference.mode === 'CUSTOM' ? 'Custom' : formData.timerPreference.mode.charAt(0) + formData.timerPreference.mode.slice(1).toLowerCase()} (${formData.timerPreference.focusDuration}/${formData.timerPreference.breakDuration})`} />
                <ConfirmationRow label="🎯 Daily Goal" value={`${formData.dailyStudyGoal} hours`} />
            </div>

            <button
                onClick={onSubmit}
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
            >
                {isSubmitting ? (
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                        className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                    />
                ) : (
                    <>Enter StudyMate <ChevronRight className="ml-1" /></>
                )}
            </button>

            <button type="button" onClick={onBack} className="text-gray-400 hover:text-gray-600 font-medium mt-4 text-sm">
                Change Details
            </button>
        </motion.div>
    );
}

function ConfirmationRow({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex justify-between items-start text-sm">
            <span className="font-medium text-gray-500 min-w-[80px]">{label}</span>
            <span className="font-semibold text-gray-900 text-right flex-1 wrap-break-word ml-4">{value}</span>
        </div>
    );
}
