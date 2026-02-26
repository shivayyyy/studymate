import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import ProfileSetupPage from './pages/ProfileSetupPage';
import DashboardLayout from './layouts/DashboardLayout';
import FeedPage from './pages/FeedPage';
import RoomsPage from './pages/RoomsPage';
import RoomLivePage from './pages/RoomLivePage';
import AnalyticsPage from './pages/AnalyticsPage';
import LandingPage from './pages/LandingPage';

import ProfilePage from './pages/ProfilePage';

import DMPage from './pages/DMPage';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { useEffect, useRef } from 'react';
import { api } from './lib/axios';
import { useUserStore } from './stores/useUserStore';
import { useChatStore } from './stores/useChatStore';

// Bridge Supabase auth into user store and websocket connection
const SupabaseAuthBridge = ({ children }: { children: React.ReactNode }) => {
    const { session, loading: authLoading } = useAuth();
    const { login, logout: clearLocalUser } = useUserStore();
    const { initialize, disconnect } = useChatStore();
    const syncedRef = useRef(false);

    useEffect(() => {
        if (!authLoading && session?.user && !syncedRef.current) {
            syncedRef.current = true;
            // Sync Supabase user with our backend database
            api.post('/auth/sync')
                .then((res) => {
                    if (res.data.success) {
                        login(res.data.data);
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
        } else if (!authLoading && !session?.user) {
            syncedRef.current = false;
            clearLocalUser();
            disconnect();
        }
    }, [authLoading, session]);

    return <>{children}</>;
};

const ProtectedRoute = () => {
    const { session, loading: authLoading } = useAuth();
    const { user, isLoading } = useUserStore();

    if (authLoading || isLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );

    if (!session?.user) return <Navigate to="/login" replace />;

    // Check if profile is complete (Bio and Subjects are required)
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
            {
                path: 'rooms/:roomId',
                element: <RoomLivePage />,
            }
        ],
    },
]);

export default function App() {
    return (
        <SupabaseAuthBridge>
            <RouterProvider router={router} />
        </SupabaseAuthBridge>
    );
}
