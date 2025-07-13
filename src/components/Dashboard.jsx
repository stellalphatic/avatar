// src/components/Dashboard.jsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import {PricingModal} from './PricingModal'; // Ensure this path is correct

const Dashboard = () => {
    const [showPricingModal, setShowPricingModal] = useState(false);

    return (
        <div className="flex h-screen bg-background text-foreground">
            {/* Sidebar passes a prop to handle showing the pricing modal */}
            <Sidebar onUpgradeClick={() => setShowPricingModal(true)} />
            <main className="flex-1 overflow-y-auto p-8">
                {/* Outlet renders the nested route component (e.g., DashboardOverview, MyAvatarsPage) */}
                <Outlet />
            </main>

            {/* Render the PricingModal if showPricingModal is true */}
            {showPricingModal && <PricingModal onClose={() => setShowPricingModal(false)} />}
        </div>
    );
};

export default Dashboard;