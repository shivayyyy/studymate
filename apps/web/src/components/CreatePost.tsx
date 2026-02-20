import React, { useState, useRef, useEffect } from 'react';
import { Image, FileText, X, Loader2, Upload } from 'lucide-react';
import { useUserStore } from '../stores/useUserStore';
import { FeedService } from '../services/feed.service';
import { UploadService } from '../services/upload.service';
import { Post } from '../types';
import { EXAM_SUBJECTS, CONTENT_TYPES } from '../lib/constants';

interface CreatePostProps {
    onPostCreated: (post: Post) => void;
}

const CreatePost: React.FC<CreatePostProps> = ({ onPostCreated }) => {
    const { user } = useUserStore();
    const [description, setDescription] = useState('');
    const [contentType, setContentType] = useState(CONTENT_TYPES[0].value);

    // Determine available subjects based on user category
    const availableSubjects = user?.examCategory && EXAM_SUBJECTS[user.examCategory]
        ? EXAM_SUBJECTS[user.examCategory]
        : EXAM_SUBJECTS['JEE']; // Default

    const [subject, setSubject] = useState(availableSubjects[0]);

    // Update subject when category changes (e.g. if user updates profile, though unlikely to happen mid-session here)
    // or just ensure initial state is correct. 
    // Better to use useEffect to sync subject if user changes? 
    // For now, simple initialization is enough as user store doesn't change often in real-time.
    // However, if availableSubjects changes, we should reset subject.

    const [mediaFiles, setMediaFiles] = useState<File[]>([]);
    const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isPosting, setIsPosting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Effect to reset subject if availableSubjects changes (optimistic safety)
    useEffect(() => {
        if (!availableSubjects.includes(subject)) {
            setSubject(availableSubjects[0]);
        }
    }, [user?.examCategory, availableSubjects, subject]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setMediaFiles(prev => [...prev, ...files]);

            const newPreviews = files.map(file => URL.createObjectURL(file));
            setMediaPreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const removeFile = (index: number) => {
        setMediaFiles(prev => prev.filter((_, i) => i !== index));
        setMediaPreviews(prev => {
            const newPreviews = [...prev];
            URL.revokeObjectURL(newPreviews[index]); // Cleanup
            return newPreviews.filter((_, i) => i !== index);
        });
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const clearFiles = () => {
        setMediaFiles([]);
        mediaPreviews.forEach(url => URL.revokeObjectURL(url));
        setMediaPreviews([]);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async () => {
        if (!description.trim()) return;

        setIsPosting(true);
        try {
            const fileUrls: string[] = [];
            let thumbnailUrl = undefined;

            if (mediaFiles.length > 0) {
                setIsUploading(true);
                // Upload all files in parallel
                const uploadPromises = mediaFiles.map(file => UploadService.uploadFile(file));
                const uploadResults = await Promise.all(uploadPromises);

                uploadResults.forEach(res => {
                    if (res.success) {
                        fileUrls.push(res.data.url);
                    }
                });

                // Set first image as thumbnail if available
                const firstImageIndex = mediaFiles.findIndex(f => f.type.startsWith('image/'));
                if (firstImageIndex !== -1 && uploadResults[firstImageIndex]?.success) {
                    thumbnailUrl = uploadResults[firstImageIndex].data.url;
                }

                setIsUploading(false);
            }

            const res = await FeedService.createPost({
                description,
                contentType: contentType as any,
                subject,
                examCategory: user?.examCategory || 'JEE',
                thumbnailUrl,
                fileUrl: fileUrls[0], // Backward compatibility
                fileUrls,
            });

            if (res.success) {
                setDescription('');
                clearFiles();
                setContentType(CONTENT_TYPES[0].value);
                setSubject(availableSubjects[0]);

                onPostCreated(res.data);
            }
        } catch (error) {
            console.error('Failed to create post:', error);
            setIsUploading(false);
        } finally {
            setIsPosting(false);
        }
    };

    return (
        <div className="bg-white border-b border-slate-100 p-4 mb-4 rounded-xl shadow-sm">
            <div className="flex gap-4">
                <div className="shrink-0">
                    <img src={user?.profilePicture || "https://api.dicebear.com/7.x/avataaars/svg?seed=User"} alt="Profile" className="w-10 h-10 rounded-full hover:opacity-90 cursor-pointer" />
                </div>
                <div className="flex-1 space-y-3">
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="What's on your mind? Share notes, doubts, or strategies..."
                        className="w-full bg-transparent border-none outline-none text-slate-700 text-lg placeholder:text-slate-500 font-normal resize-none focus:ring-0 p-0 min-h-[80px]"
                    />

                    {mediaPreviews.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {mediaPreviews.map((preview, index) => (
                                <div key={index} className="relative rounded-xl overflow-hidden border border-slate-200 min-w-[100px] w-32 h-32 shrink-0">
                                    <button
                                        onClick={() => removeFile(index)}
                                        className="absolute top-1 right-1 p-0.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors z-10"
                                    >
                                        <X size={14} />
                                    </button>
                                    {mediaFiles[index]?.type.startsWith('image/') ? (
                                        <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 p-2 text-center">
                                            <FileText className="text-blue-500 mb-1" size={24} />
                                            <span className="text-[10px] font-medium text-slate-700 line-clamp-2">{mediaFiles[index]?.name}</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex justify-between items-center pt-3 border-t border-slate-50">
                        <div className="flex items-center gap-2">
                            <div className="flex gap-1 text-blue-500 mr-2">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-2 hover:bg-blue-50 rounded-full transition-colors relative group"
                                >
                                    <Image size={20} />
                                    <span className="sr-only">Upload Image</span>
                                </button>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-2 hover:bg-blue-50 rounded-full transition-colors relative group"
                                >
                                    <Upload size={20} />
                                    <span className="sr-only">Upload File</span>
                                </button>
                            </div>

                            <select
                                value={contentType}
                                onChange={(e) => setContentType(e.target.value)}
                                className="text-xs font-medium text-slate-600 bg-slate-100 border-none rounded-lg py-1.5 pl-2 pr-8 focus:ring-0 cursor-pointer hover:bg-slate-200 transition-colors"
                            >
                                {CONTENT_TYPES.map(type => (
                                    <option key={type.value} value={type.value}>{type.label}</option>
                                ))}
                            </select>

                            <select
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className="text-xs font-medium text-slate-600 bg-slate-100 border-none rounded-lg py-1.5 pl-2 pr-8 focus:ring-0 cursor-pointer hover:bg-slate-200 transition-colors"
                            >
                                {availableSubjects.map(sub => (
                                    <option key={sub} value={sub}>{sub}</option>
                                ))}
                            </select>
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={!description.trim() || isPosting}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-1.5 rounded-full text-[15px] font-bold transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isPosting && <Loader2 size={16} className="animate-spin" />}
                            {isPosting ? (isUploading ? 'Uploading...' : 'Posting...') : 'Post'}
                        </button>
                    </div>
                </div>
            </div>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                accept="image/*,application/pdf"
                multiple
            />
        </div>
    );
};

export default CreatePost;
