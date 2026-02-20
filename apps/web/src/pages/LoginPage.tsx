import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SignedIn, SignedOut, SignInButton, SignUpButton } from '@clerk/clerk-react';
import { useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { isSignedIn, isLoaded } = useAuth();

    useEffect(() => {
        if (isLoaded && isSignedIn) {
            navigate('/feed');
        }
    }, [isSignedIn, isLoaded, navigate]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">
                    Welcome to StudyMate
                </h1>
                <p className="text-gray-600 dark:text-gray-300 text-center mb-8">
                    Sign in to continue your learning journey
                </p>

                <SignedOut>
                    <div className="flex flex-col gap-3">
                        <SignInButton mode="modal">
                            <button
                                className="flex items-center justify-center gap-3 w-full px-4 py-3 text-white transition-all duration-200 bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 font-medium"
                            >
                                Sign In
                            </button>
                        </SignInButton>
                        <SignUpButton mode="modal">
                            <button
                                className="flex items-center justify-center gap-3 w-full px-4 py-3 text-gray-700 transition-all duration-200 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 font-medium dark:text-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600"
                            >
                                Create Account
                            </button>
                        </SignUpButton>
                    </div>
                </SignedOut>

                <SignedIn>
                    <p className="text-center text-green-600 font-medium">
                        You are signed in! Redirecting...
                    </p>
                </SignedIn>

                <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                    By signing in, you agree to our Terms of Service and Privacy Policy.
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
