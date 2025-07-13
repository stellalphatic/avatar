// src/dashboard_pages/PublicGallery.jsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import supabase from '../supabaseClient';
import { Loader2, User } from 'lucide-react';

const PublicGallery = () => {
    const [publicCreations, setPublicCreations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPublicCreations = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch only public creations
                // RLS will ensure only public data is returned to any user (even unauthenticated)
                const { data, error } = await supabase
                    .from('avatars')
                    .select(`
                        *,
                        user:profiles(username) // Fetch associated username from profiles table
                    `)
                    .eq('is_public', true) // Explicitly query for public items
                    .order('created_at', { ascending: false });

                if (error) {
                    throw error;
                }
                setPublicCreations(data);
            } catch (err) {
                console.error('Error fetching public creations:', err);
                setError('Failed to load public gallery. ' + err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPublicCreations();
    }, []);

    if (loading) return <div className="text-center text-foreground"><Loader2 className="animate-spin inline-block mr-2" size={24} /> Loading public gallery...</div>;
    if (error) return <div className="text-center text-red-500">Error: {error}</div>;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-8 rounded-2xl bg-card shadow-xl border border-border"
        >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
                Public AI Creation Gallery
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
                Explore amazing AI creations shared by our community!
            </p>

            {publicCreations.length === 0 ? (
                <p className="text-muted-foreground text-center text-lg">No public creations yet. Be the first to share!</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {publicCreations.map((creation) => (
                        <motion.div
                            key={creation.id}
                            whileHover={{ scale: 1.02 }}
                            className="p-6 bg-background rounded-xl border border-border flex flex-col items-start"
                        >
                            <h3 className="text-2xl font-semibold text-foreground mb-2">{creation.name}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                                <User size={16} className="text-gray-400" /> Created by: {creation.user?.username || 'Anonymous'}
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
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    );
};

export default PublicGallery;