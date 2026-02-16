import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import FeedPage from './pages/FeedPage';
import RoomsPage from './pages/RoomsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import LandingPage from './pages/LandingPage';

import ProfilePage from './pages/ProfilePage';

import DMPage from './pages/DMPage';

// Placeholder pages to prevent crashes on navigation (Profile page is now implemented)
// const Profile = () => <div className="p-10 text-slate-400 text-center text-xl font-medium">Profile (Coming Soon)</div>;

const router = createBrowserRouter([
    {
        path: '/',
        element: <LandingPage />,
    },
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
]);

export default function App() {
    return <RouterProvider router={router} />;
}
