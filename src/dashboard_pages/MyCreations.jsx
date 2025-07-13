// src/dashboard_pages/MyCreations.jsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import  supabase  from '../supabaseClient';
import { Loader2, Globe, Lock } from 'lucide-react';

const MyCreations = () => {
    const { user, supabase: authSupabase } = useAuth();
    const [creations, setCreations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMyCreations = async () => {
            if (!user) {
                setLoading(false);
                setError('User not logged in.');
                return;
            }

            setLoading(true);
            setError(null);
            try {
                // Fetch only creations owned by the current user
                // RLS will ensure only their data is returned
                const { data, error } = await supabase
                    .from('avatars') // Assuming 'avatars' table stores all creations (avatars, voices, videos)
                    .select('*')
                    .eq('user_id', user.id) // Filter by current user's ID
                    .order('created_at', { ascending: false });

                if (error) {
                    throw error;
                }
                setCreations(data);
            } catch (err) {
                console.error('Error fetching my creations:', err);
                setError('Failed to load your creations. ' + err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchMyCreations();
    }, [user, supabase]); // Dependency on user to re-fetch if user changes

    if (loading) return <div className="text-center text-foreground"><Loader2 className="animate-spin inline-block mr-2" size={24} /> Loading your creations...</div>;
    if (error) return <div className="text-center text-red-500">Error: {error}</div>;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-8 rounded-2xl bg-card shadow-xl border border-border"
        >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
                My AI Creations
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
                Here are all the avatars, voices, and videos you've created.
            </p>

            {creations.length === 0 ? (
                <p className="text-muted-foreground text-center text-lg">You haven't created anything yet. Go to <Link to="/dashboard/create-avatar" className="text-purple-500 hover:underline">Create Avatar</Link> to get started!</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {creations.map((creation) => (
                        <motion.div
                            key={creation.id}
                            whileHover={{ scale: 1.02 }}
                            className="p-6 bg-background rounded-xl border border-border flex flex-col items-start"
                        >
                            <h3 className="text-2xl font-semibold text-foreground mb-2">{creation.name}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                                {creation.is_public ? <Globe size={16} className="text-green-500" /> : <Lock size={16} className="text-red-500" />}
                                {creation.is_public ? 'Public' : 'Private'}
                            </div>
                            {creation.image_url && (
                                <img src={creation.image_url} alt={creation.name} className="w-full h-48 object-cover rounded-lg mb-4" />
                            )}
                            {creation.voice_url && (
                                <audio controls src={creation.voice_url} className="w-full mb-4"></audio>
                            )}
                            {creation.video_url && (
                                <video controls src={creation.video_url} className="w-full h-48 object-cover rounded-lg mb-4"></video>
                            )}
                            {/* You can add actions like 'Edit', 'Delete', 'Toggle Public' here */}
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    );
};

export default MyCreations;