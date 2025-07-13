// src/dashboard_pages/SettingsPage.jsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import  supabase  from '../supabaseClient';
import { Loader2, AlertCircle } from 'lucide-react';

const SettingsPage = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updateMessage, setUpdateMessage] = useState('');

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
                setError('Failed to load profile details.');
            } finally {
                setLoading(false);
            }
        };
        fetchUserProfile();
    }, [user]);

    const handleUpdateUsername = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setUpdateMessage('');

        const newUsername = e.target.username.value;
        if (!newUsername) {
            setError('Username cannot be empty.');
            setLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase
                .from('profiles')
                .update({ username: newUsername, updated_at: new Date().toISOString() })
                .eq('id', user.id)
                .select()
                .single();

            if (error) {
                throw error;
            }
            setProfile(data);
            setUpdateMessage('Username updated successfully!');
        } catch (err) {
            console.error('Error updating username:', err);
            setError('Failed to update username: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center text-foreground"><Loader2 className="animate-spin inline-block mr-2" size={24} /> Loading settings...</div>;
    if (error) return <div className="text-center text-red-500">Error: {error}</div>;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-8 rounded-2xl bg-card shadow-xl border border-border"
        >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
                Account Settings
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
                Manage your profile and subscription.
            </p>

            <div className="space-y-8">
                {/* User Information */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="bg-background p-6 rounded-xl border border-border"
                >
                    <h2 className="text-2xl font-bold text-foreground mb-4">User Information</h2>
                    <p className="text-muted-foreground mb-2">Email: <span className="font-semibold text-foreground">{user?.email}</span></p>
                    <form onSubmit={handleUpdateUsername} className="space-y-4">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-muted-foreground mb-2">Username</label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                defaultValue={profile?.username || ''}
                                className="w-full p-3 rounded-lg bg-input border border-border focus:ring-2 focus:ring-purple-500 outline-none transition-all duration-200 text-foreground"
                                placeholder="Your username"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Updating...' : 'Update Username'}
                        </button>
                        {updateMessage && <p className="text-green-500 mt-2">{updateMessage}</p>}
                        {error && <p className="text-red-500 mt-2 flex items-center gap-2"><AlertCircle size={16}/>{error}</p>}
                    </form>
                </motion.div>

                {/* Subscription Details */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="bg-background p-6 rounded-xl border border-border"
                >
                    <h2 className="text-2xl font-bold text-foreground mb-4">Subscription Plan</h2>
                    <p className="text-muted-foreground mb-4">
                        Your current plan: <span className="font-semibold text-foreground capitalize">{profile?.subscription_status || 'Free'}</span>
                    </p>
                    {profile?.subscription_status !== 'enterprise' && (
                        <button
                            // This button would typically open the pricing modal again
                            // or redirect to a dedicated upgrade page
                            onClick={() => alert('Feature to change/upgrade plan will be implemented here!')}
                            className="px-6 py-3 border border-purple-500 text-purple-500 rounded-lg hover:bg-purple-500/10 transition-colors duration-200"
                        >
                            Upgrade Plan
                        </button>
                    )}
                    {profile?.subscription_status !== 'free' && (
                         <button
                            onClick={() => alert('Feature to manage/cancel subscription via Stripe Portal will be implemented here!')}
                            className="ml-4 px-6 py-3 border border-red-500 text-red-500 rounded-lg hover:bg-red-500/10 transition-colors duration-200"
                        >
                            Manage Subscription (Stripe Portal)
                        </button>
                    )}
                </motion.div>
            </div>
        </motion.div>
    );
};

export default SettingsPage;