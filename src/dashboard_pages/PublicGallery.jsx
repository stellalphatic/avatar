// src/dashboard_pages/PublicGallery.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import supabase from '../supabaseClient';
import { Loader2, User, Search, PlusCircle, MessageCircle } from 'lucide-react';

const PublicGallery = () => {
    const { user, supabase: authSupabase } = useAuth();
    const navigate = useNavigate();

    const [publicCreations, setPublicCreations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [addingAvatarId, setAddingAvatarId] = useState(null);

    const backendRestUrl = import.meta.env.VITE_BACKEND_REST_URL || 'http://localhost:5000';

    // --- Data Fetching for Public Avatars ---
    const fetchPublicCreations = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error: fetchError } = await supabase
                .from('avatars')
                .select(`
                    id,
                    name,
                    image_url,
                    voice_url,
                    video_url,
                    personality_data,
                    is_public,
                    user_id,
                    user:profiles(username) // Removed the JS comment from here, now a valid PostgREST hint
                `)
                .eq('is_public', true)
                .order('created_at', { ascending: false });

            if (fetchError) {
                throw fetchError;
            }
            setPublicCreations(data);
        } catch (err) {
            console.error('Error fetching public creations:', err);
            setError('Failed to load public gallery. ' + err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPublicCreations();
    }, [fetchPublicCreations]);

    // --- Filtered Creations for Search ---
    const filteredCreations = publicCreations.filter(creation =>
        creation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (creation.user?.username && creation.user.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (creation.personality_data && creation.personality_data.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // --- Handle Adding Avatar to User's Collection ---
    const handleAddAvatar = async (avatar) => {
        if (!user) {
            setError('Please log in to add avatars to your collection.');
            return;
        }
        if (addingAvatarId === avatar.id) return;

        setAddingAvatarId(avatar.id);
        setMessage(null);
        setError(null);

        try {
            const { data: { session } } = await authSupabase.auth.getSession();
            if (!session) {
                throw new Error("No active session found. Please log in again.");
            }

            const { data: existingAvatars, error: existingError } = await authSupabase
                .from('avatars')
                .select('id')
                .eq('user_id', user.id)
                .eq('name', avatar.name)
                .eq('personality_data', avatar.personality_data);

            if (existingError) throw existingError;

            if (existingAvatars && existingAvatars.length > 0) {
                setMessage(`You already have an avatar named "${avatar.name}" in your collection.`);
                setAddingAvatarId(null);
                return;
            }

            const response = await fetch(`${backendRestUrl}/api/avatars`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({
                    name: avatar.name,
                    imageUrl: avatar.image_url,
                    voiceUrl: avatar.voice_url,
                    videoUrl: avatar.video_url,
                    is_public: false,
                    personalityData: avatar.personality_data,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to add avatar to your collection.');
            }

            setMessage(`Avatar "${avatar.name}" added to your collection!`);
        } catch (err) {
            console.error('Error adding avatar:', err);
            setError(err.message);
        } finally {
            setAddingAvatarId(null);
        }
    };

    // --- Handle Chatting with Avatar ---
    const handleChatWithAvatar = (avatarId) => {
        navigate(`/dashboard/chat-with-avatar?avatarId=${avatarId}`);
    };

    if (loading) return <div className="text-center text-foreground p-8"><Loader2 className="animate-spin inline-block mr-2" size={24} /> Loading public gallery...</div>;
    if (error) return <div className="text-center text-red-500 p-8">Error: {error}</div>;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-8 rounded-2xl bg-card shadow-xl border border-border min-h-screen"
        >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
                Public AI Creation Gallery
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
                Explore amazing AI creations shared by our community!
            </p>

            {/* Search Bar */}
            <div className="mb-8 relative">
                <input
                    type="text"
                    placeholder="Search avatars by name, creator, or personality..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-3 pl-10 rounded-lg bg-input border border-border focus:ring-2 focus:ring-purple-500 outline-none text-foreground"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            </div>

            {/* Messages */}
            {message && (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center text-green-500 mt-4 mb-4 p-2 bg-green-500/10 rounded"
                >
                    {message}
                </motion.p>
            )}
            {error && (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center text-red-500 mt-4 mb-4 p-2 bg-red-500/10 rounded"
                >
                    {error}
                </motion.p>
            )}

            {filteredCreations.length === 0 && !loading ? (
                <p className="text-muted-foreground text-center text-lg">No public creations found matching your search.</p>
            ) : filteredCreations.length === 0 && loading ? (
                <p className="text-muted-foreground text-center text-lg">Loading...</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCreations.map((creation) => (
                        <motion.div
                            key={creation.id}
                            whileHover={{ scale: 1.02 }}
                            className="p-6 bg-background rounded-xl border border-border flex flex-col items-start"
                        >
                            <h3 className="text-2xl font-semibold text-foreground mb-2">{creation.name}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                                <User size={16} className="text-gray-400" /> Created by: {creation.user?.username || 'Anonymous'}
                            </div>
                            <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{creation.personality_data}</p>
                            {creation.image_url && (
                                <img src={creation.image_url} alt={creation.name} className="w-full h-48 object-cover rounded-lg mb-4" />
                            )}
                            {creation.voice_url && (
                                <audio controls src={creation.voice_url} className="w-full mb-4"></audio>
                            )}
                            {creation.video_url && (
                                <video controls src={creation.video_url} className="w-full h-48 object-cover rounded-lg mb-4"></video>
                            )}

                            {/* Actions */}
                            <div className="flex gap-2 mt-auto w-full">
                                <button
                                    onClick={() => handleAddAvatar(creation)}
                                    className="flex-1 p-2 bg-purple-500/10 text-purple-400 rounded-lg hover:bg-purple-500/20 transition-colors flex items-center justify-center gap-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Add to My Avatars"
                                    disabled={addingAvatarId === creation.id || !user}
                                >
                                    {addingAvatarId === creation.id ? <Loader2 className="animate-spin" size={16} /> : <PlusCircle size={16} />}
                                    {addingAvatarId === creation.id ? 'Adding...' : 'Add to My Avatars'}
                                </button>
                                <button
                                    onClick={() => handleChatWithAvatar(creation.id)}
                                    className="flex-1 p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors flex items-center justify-center gap-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Chat with this Avatar"
                                    disabled={!user}
                                >
                                    <MessageCircle size={16} /> Chat
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    );
};

export default PublicGallery;