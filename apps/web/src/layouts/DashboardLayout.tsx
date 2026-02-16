import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

export default function DashboardLayout() {
    return (
        <div className="layout-grid bg-[#F8FAFC]">
            <Sidebar />
            <main className="min-h-screen">
                <Outlet />
            </main>
        </div>
    );
}
