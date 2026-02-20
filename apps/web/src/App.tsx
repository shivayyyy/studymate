import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import ProfileSetupPage from './pages/ProfileSetupPage';
import DashboardLayout from './layouts/DashboardLayout';
import FeedPage from './pages/FeedPage';
import RoomsPage from './pages/RoomsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import LandingPage from './pages/LandingPage';

import ProfilePage from './pages/ProfilePage';

import DMPage from './pages/DMPage';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { useEffect, useRef } from 'react';
import { setClerkGetToken, api } from './lib/axios';
import { useUserStore } from './stores/useUserStore';
import { useChatStore } from './stores/useChatStore';

// Bridge Clerk auth into axios and user store
const ClerkAuthBridge = ({ children }: { children: React.ReactNode }) => {
    const { isSignedIn, isLoaded, getToken } = useAuth();
    const { login, logout: clearLocalUser } = useUserStore();
    const { initialize, disconnect } = useChatStore();
    const syncedRef = useRef(false);

    useEffect(() => {
        // Wire Clerk's getToken into the axios interceptor
        setClerkGetToken(getToken);
    }, [getToken]);

    useEffect(() => {
        if (isLoaded && isSignedIn && !syncedRef.current) {
            syncedRef.current = true;
            // Sync Clerk user with our backend database
            api.post('/auth/sync')
                .then((res) => {
                    if (res.data.success) {
                        login(res.data.data);
                        // Fetch socket token specifically for websocket connection
                        // We need to use the Clerk token to authenticate this request first
                        // But usually our api interceptor handles that.
                        api.get('/auth/socket-token').then(res => {
                            if (res.data.success) {
                                initialize(res.data.data.token);
                            }
                        }).catch(err => console.error("Failed to fetch socket token", err));
                    }
                })
                .catch((err) => {
                    console.error('Failed to sync user with backend:', err);
                });
        } else if (isLoaded && !isSignedIn) {
            syncedRef.current = false;
            clearLocalUser();
            disconnect();
        }
    }, [isLoaded, isSignedIn]);

    return <>{children}</>;
};

const ProtectedRoute = () => {
    const { isSignedIn, isLoaded } = useAuth();
    const { user, isLoading } = useUserStore();

    if (!isLoaded || isLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );

    if (!isSignedIn) return <Navigate to="/login" replace />;

    // Check if profile is complete (Bio and Subjects are required)
    // Note: We check if user exists first to avoid race conditions during initial sync
    if (user && (!user.bio || !user.subjects || user.subjects.length === 0)) {
        return <Navigate to="/profile-setup" replace />;
    }

    return <Outlet />;
};

const router = createBrowserRouter([
    {
        path: '/',
        element: <LandingPage />,
    },
    {
        path: '/login',
        element: <LoginPage />,
    },
    {
        path: '/profile-setup',
        element: <ProfileSetupPage />,
    },
    {
        path: '/',
        element: <ProtectedRoute />,
        children: [
            {
                path: '/',
                element: <DashboardLayout />,
                children: [
                    { path: 'feed', element: <FeedPage /> },
                    { path: 'rooms', element: <RoomsPage /> },
                    { path: 'analytics', element: <AnalyticsPage /> },
                    { path: 'profile', element: <ProfilePage /> },
                    { path: 'dms', element: <DMPage /> },
                    { path: 'dms/:chatId', element: <DMPage /> },
                ],
            },
        ],
    },
]);

export default function App() {
    return (
        <ClerkAuthBridge>
            <RouterProvider router={router} />
        </ClerkAuthBridge>
    );
}
