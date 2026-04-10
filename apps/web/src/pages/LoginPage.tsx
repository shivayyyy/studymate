import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { SignIn } from '@clerk/clerk-react';

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { session, loading: authLoading } = useAuth();

    useEffect(() => {
        if (!authLoading && session) {
            navigate('/feed');
        }
    }, [session, authLoading, navigate]);

    if (authLoading) return null;

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 px-4">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    StudyMate
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                    Sign in to continue your journey
                </p>
            </div>
            
            <SignIn 
                routing="hash"
                forceRedirectUrl="/feed"
                signUpForceRedirectUrl="/feed"
                appearance={{
                    elements: {
                        card: 'shadow-xl w-full max-w-md border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-2xl',
                    }
                }}
            />
        </div>
    );
};

export default LoginPage;
