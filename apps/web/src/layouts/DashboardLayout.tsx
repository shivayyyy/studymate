import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Header } from '../components/Header';

export default function DashboardLayout() {
    return (
        <div className="layout-grid bg-bg-page">
            <Sidebar />
            <main className="min-h-screen pb-20 md:pb-0 flex flex-col items-center">
                <Header />
                <div className="w-full flex-1 max-w-[1600px] mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
