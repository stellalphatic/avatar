// src/dashboard_pages/DashboardOverview.jsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../AuthContext';
import { Zap, Mic, Video, Cloud } from 'lucide-react';
import supabase  from '../supabaseClient'; 
import { Link } from 'react-router-dom';

const DashboardOverview = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserProfile = async () => {
            if (!user) {
                setLoading(false);
                return;
            }
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (error) {
                    throw error;
                }
                setProfile(data);
            } catch (err) {
                console.error('Error fetching user profile:', err);
                setError('Failed to load profile. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        fetchUserProfile();
    }, [user]);

    if (loading) return <div className="text-center text-foreground">Loading dashboard...</div>;
    if (error) return <div className="text-center text-red-500">Error: {error}</div>;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-8 rounded-2xl bg-card shadow-xl border border-border"
        >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
                Welcome, {user?.email || 'User'}!
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
                Your current plan: <span className="font-semibold text-foreground capitalize">{profile?.subscription_status || 'Free'}</span>
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <motion.div
                    whileHover={{ scale: 1.03 }}
                    className="p-6 bg-background rounded-xl border border-border flex items-center gap-4"
                >
                    <Zap className="w-8 h-8 text-yellow-500" />
                    <div>
                        <h3 className="text-xl font-semibold text-foreground">Avatar Credits</h3>
                        <p className="text-muted-foreground">{profile?.avatar_credits || 0} remaining</p>
                    </div>
                </motion.div>
                <motion.div
                    whileHover={{ scale: 1.03 }}
                    className="p-6 bg-background rounded-xl border border-border flex items-center gap-4"
                >
                    <Mic className="w-8 h-8 text-blue-500" />
                    <div>
                        <h3 className="text-xl font-semibold text-foreground">Voice Clones</h3>
                        <p className="text-muted-foreground">Unlimited for Pro/Enterprise</p>
                    </div>
                </motion.div>
                <motion.div
                    whileHover={{ scale: 1.03 }}
                    className="p-6 bg-background rounded-xl border border-border flex items-center gap-4"
                >
                    <Video className="w-8 h-8 text-green-500" />
                    <div>
                        <h3 className="text-xl font-semibold text-foreground">Video Generations</h3>
                        <p className="text-muted-foreground">High quality output</p>
                    </div>
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-10 bg-background rounded-2xl border border-border p-6"
            >
                <h3 className="text-2xl font-bold text-foreground mb-4">Quick Actions</h3>
                <div className="flex flex-wrap gap-4">
                    <Link to="/dashboard/create-avatar" className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                        Create New Avatar
                    </Link>
                    <Link to="/dashboard/my-creations" className="px-6 py-3 border border-border text-foreground rounded-lg hover:bg-accent transition-colors">
                        View My Creations
                    </Link>
                    <Link to="/dashboard/settings" className="px-6 py-3 border border-border text-foreground rounded-lg hover:bg-accent transition-colors">
                        Manage Subscription
                    </Link>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default DashboardOverview;