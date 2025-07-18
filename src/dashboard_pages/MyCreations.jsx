// src/dashboard_pages/MyCreations.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import supabase from '../supabaseClient'; // Ensure this is your direct supabase client for file uploads
import { Loader2, Globe, Lock, Edit, Trash2, Save, X, Mic, Image, Video, Upload } from 'lucide-react';
import { Link } from 'react-router-dom'; // Import Link for navigation

const MyCreations = () => {
    const { user, supabase: authSupabase } = useAuth(); // Use authSupabase for session and user
    const [creations, setCreations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null); // For success messages

    // State for editing functionality
    const [editingAvatar, setEditingAvatar] = useState(null); // Stores the avatar object being edited
    const [showEditModal, setShowEditModal] = useState(false);
    const [editFormState, setEditFormState] = useState({
        name: '',
        personalityData: '',
        isPublic: false,
    });
    const [editImageFile, setEditImageFile] = useState(null);
    const [editVoiceFile, setEditVoiceFile] = useState(null);
    const [editVideoFile, setEditVideoFile] = useState(null);
    const [uploadingEditFiles, setUploadingEditFiles] = useState(false);

    // State for deletion confirmation
    const [deletingAvatarId, setDeletingAvatarId] = useState(null); // Stores ID of avatar to be deleted

    const backendRestUrl = import.meta.env.VITE_BACKEND_REST_URL || 'http://localhost:5000';

    // --- Data Fetching ---
    const fetchMyCreations = useCallback(async () => {
        if (!user) {
            setLoading(false);
            setError('User not logged in.');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            // Fetch only creations owned by the current user
            // RLS on Supabase will ensure only their data is returned
            const { data, error: fetchError } = await authSupabase // Use authSupabase for authenticated fetch
                .from('avatars')
                .select('*')
                .eq('user_id', user.id) // Filter by current user's ID
                .order('created_at', { ascending: false });

            if (fetchError) {
                throw fetchError;
            }
            setCreations(data);
        } catch (err) {
            console.error('Error fetching my creations:', err);
            setError('Failed to load your creations. ' + err.message);
        } finally {
            setLoading(false);
        }
    }, [user, authSupabase]); // Dependency on user and authSupabase

    useEffect(() => {
        fetchMyCreations();
    }, [fetchMyCreations]); // Re-fetch when fetchMyCreations callback changes

    // --- File Upload Helper for Edit Modal ---
    const uploadFileToSupabaseStorage = async (file, bucketName, folderName) => {
        if (!file) return null;
        const filePath = `${folderName}/${user.id}/${Date.now()}-${file.name}`;
        const { data, error } = await supabase.storage.from(bucketName).upload(filePath, file, {
            cacheControl: '3600',
            upsert: false // Do not upsert, throw error if file exists
        });

        if (error) {
            throw new Error(`Failed to upload ${file.name}: ${error.message}`);
        }
        const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(filePath);
        return publicUrlData.publicUrl;
    };

    // --- Handlers for Avatar Actions ---

    // Edit
    const handleEditClick = (avatar) => {
        setEditingAvatar(avatar);
        setEditFormState({
            name: avatar.name,
            personalityData: avatar.personality_data || '',
            isPublic: avatar.is_public,
        });
        setEditImageFile(null); // Clear file inputs
        setEditVoiceFile(null);
        setEditVideoFile(null);
        setShowEditModal(true);
        setError(null); // Clear previous errors
        setMessage(null); // Clear previous messages
    };

    const handleSaveEdit = async (e) => {
        e.preventDefault();
        if (!editingAvatar || !user) return;

        setUploadingEditFiles(true);
        setError(null);
        setMessage(null);

        try {
            const { data: { session } } = await authSupabase.auth.getSession();
            if (!session) {
                throw new Error("No active session found. Please log in again.");
            }

            let updatedImageUrl = editingAvatar.image_url;
            let updatedVoiceUrl = editingAvatar.voice_url;
            let updatedVideoUrl = editingAvatar.video_url;

            // Upload new files if selected
            if (editImageFile) {
                updatedImageUrl = await uploadFileToSupabaseStorage(editImageFile, 'avatar-media', 'images');
            }
            if (editVoiceFile) {
                updatedVoiceUrl = await uploadFileToSupabaseStorage(editVoiceFile, 'avatar-media', 'voices');
            }
            if (editVideoFile) {
                updatedVideoUrl = await uploadFileToSupabaseStorage(editVideoFile, 'avatar-media', 'videos');
            }

            const response = await fetch(`${backendRestUrl}/api/avatars/${editingAvatar.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({
                    name: editFormState.name,
                    imageUrl: updatedImageUrl,
                    voiceUrl: updatedVoiceUrl,
                    videoUrl: updatedVideoUrl,
                    is_public: editFormState.isPublic,
                    personalityData: editFormState.personalityData,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update avatar on backend');
            }

            setMessage('Avatar updated successfully!');
            setShowEditModal(false);
            setEditingAvatar(null);
            setEditImageFile(null);
            setEditVoiceFile(null);
            setEditVideoFile(null);
            fetchMyCreations(); // Re-fetch to update the list
        } catch (err) {
            console.error('Error saving avatar:', err);
            setError(err.message);
        } finally {
            setUploadingEditFiles(false);
        }
    };

    // Delete
    const handleDeleteClick = (avatarId) => {
        setDeletingAvatarId(avatarId);
        setError(null); // Clear previous errors
        setMessage(null); // Clear previous messages
    };

    const confirmDelete = async () => {
        if (!deletingAvatarId || !user) return;

        setLoading(true); // Set main loading state for deletion
        setError(null);
        setMessage(null);

        try {
            const { data: { session } } = await authSupabase.auth.getSession();
            if (!session) {
                throw new Error("No active session found. Please log in again.");
            }

            const response = await fetch(`${backendRestUrl}/api/avatars/${deletingAvatarId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete avatar on backend');
            }

            setMessage('Avatar deleted successfully!');
            setDeletingAvatarId(null);
            fetchMyCreations(); // Re-fetch to update the list
        } catch (err) {
            console.error('Error deleting avatar:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const cancelDelete = () => {
        setDeletingAvatarId(null);
    };

    // Toggle Public/Private
    const handleTogglePublic = async (avatar) => {
        if (!user) {
            setError('You must be logged in to modify avatars.');
            return;
        }

        setLoading(true); // Indicate loading for this specific action
        setError(null);
        setMessage(null);

        try {
            const { data: { session } } = await authSupabase.auth.getSession();
            if (!session) {
                throw new Error("No active session found. Please log in again.");
            }

            const newPublicStatus = !avatar.is_public;
            const response = await fetch(`${backendRestUrl}/api/avatars/${avatar.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ is_public: newPublicStatus }), // Only send the field to update
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to toggle public status on backend');
            }

            setMessage(`Avatar status changed to ${newPublicStatus ? 'Public' : 'Private'}!`);
            fetchMyCreations(); // Re-fetch to update the list
        } catch (err) {
            console.error('Error toggling public status:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };


    if (loading) return <div className="text-center text-foreground p-8"><Loader2 className="animate-spin inline-block mr-2" size={24} /> Loading your creations...</div>;
    if (error) return <div className="text-center text-red-500 p-8">Error: {error}</div>;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-8 rounded-2xl bg-card shadow-xl border border-border min-h-screen"
        >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
                My AI Creations
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
                Here are all the avatars, voices, and videos you've created.
            </p>

            {message && (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center text-green-500 mt-4 mb-4 p-2 bg-green-500/10 rounded"
                >
                    {message}
                </motion.p>
            )}

            {creations.length === 0 ? (
                <p className="text-muted-foreground text-center text-lg">You haven't created anything yet. Go to <Link to="/dashboard/create-avatar" className="text-purple-500 hover:underline">Create Avatar</Link> to get started!</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {creations.map((creation) => (
                        <motion.div
                            key={creation.id}
                            whileHover={{ scale: 1.02 }}
                            className="p-6 bg-background rounded-xl border border-border flex flex-col items-start relative"
                        >
                            <h3 className="text-2xl font-semibold text-foreground mb-2">{creation.name}</h3>
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{creation.personality_data}</p>
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
                            
                            {/* Action Buttons */}
                            <div className="flex gap-2 mt-auto w-full">
                                <button
                                    onClick={() => handleEditClick(creation)}
                                    className="flex-1 p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors flex items-center justify-center gap-1 text-sm"
                                    title="Edit Avatar"
                                >
                                    <Edit size={16} /> Edit
                                </button>
                                <button
                                    onClick={() => handleDeleteClick(creation.id)}
                                    className="flex-1 p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors flex items-center justify-center gap-1 text-sm"
                                    title="Delete Avatar"
                                >
                                    <Trash2 size={16} /> Delete
                                </button>
                                <button
                                    onClick={() => handleTogglePublic(creation)}
                                    className={`flex-1 p-2 rounded-lg hover:opacity-80 transition-colors flex items-center justify-center gap-1 text-sm
                                        ${creation.is_public ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}
                                    title={creation.is_public ? "Make Private" : "Make Public"}
                                >
                                    {creation.is_public ? <Lock size={16} /> : <Globe size={16} />}
                                    {creation.is_public ? 'Private' : 'Public'}
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Edit Avatar Modal */}
            <AnimatePresence>
                {showEditModal && editingAvatar && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                        onClick={() => setShowEditModal(false)} // Close when clicking outside
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-card p-8 rounded-xl shadow-2xl max-w-2xl w-full relative"
                            onClick={(e) => e.stopPropagation()} // Prevent click from closing modal
                        >
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="absolute top-4 right-4 p-2 rounded-full bg-input hover:bg-accent transition-colors"
                                title="Close"
                            >
                                <X size={20} />
                            </button>
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
                                Edit Avatar: {editingAvatar.name}
                            </h2>
                            <form onSubmit={handleSaveEdit} className="space-y-6">
                                <div>
                                    <label htmlFor="editName" className="block text-sm font-medium text-muted-foreground mb-2">Avatar Name</label>
                                    <input
                                        type="text"
                                        id="editName"
                                        value={editFormState.name}
                                        onChange={(e) => setEditFormState({ ...editFormState, name: e.target.value })}
                                        required
                                        className="w-full p-3 rounded-lg bg-input border border-border focus:ring-2 focus:ring-purple-500 outline-none text-foreground"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="editPersonalityData" className="block text-sm font-medium text-muted-foreground mb-2">Personality/Expertise</label>
                                    <textarea
                                        id="editPersonalityData"
                                        value={editFormState.personalityData}
                                        onChange={(e) => setEditFormState({ ...editFormState, personalityData: e.target.value })}
                                        rows="4"
                                        className="w-full p-3 rounded-lg bg-input border border-border focus:ring-2 focus:ring-purple-500 outline-none text-foreground"
                                        placeholder="Describe the avatar's personality, expertise, or role."
                                    ></textarea>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Image Upload */}
                                    <div className="flex flex-col items-center p-4 bg-background rounded-lg border border-border">
                                        <Image className="w-8 h-8 text-purple-500 mb-2" />
                                        <label htmlFor="editImageUpload" className="cursor-pointer bg-purple-500/10 text-purple-400 px-3 py-1 rounded-lg hover:bg-purple-500/20 transition-colors text-sm">
                                            <Upload size={16} className="inline-block mr-1" /> New Image
                                        </label>
                                        <input
                                            id="editImageUpload"
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setEditImageFile(e.target.files[0])}
                                            className="hidden"
                                        />
                                        {editImageFile ? <p className="text-xs text-muted-foreground mt-1">{editImageFile.name}</p> : <p className="text-xs text-muted-foreground mt-1">Current: <a href={editingAvatar.image_url} target="_blank" rel="noopener noreferrer" className="underline">View</a></p>}
                                    </div>

                                    {/* Voice Upload */}
                                    <div className="flex flex-col items-center p-4 bg-background rounded-lg border border-border">
                                        <Mic className="w-8 h-8 text-pink-500 mb-2" />
                                        <label htmlFor="editVoiceUpload" className="cursor-pointer bg-pink-500/10 text-pink-400 px-3 py-1 rounded-lg hover:bg-pink-500/20 transition-colors text-sm">
                                            <Upload size={16} className="inline-block mr-1" /> New Voice
                                        </label>
                                        <input
                                            id="editVoiceUpload"
                                            type="file"
                                            accept="audio/*"
                                            onChange={(e) => setEditVoiceFile(e.target.files[0])}
                                            className="hidden"
                                        />
                                        {editVoiceFile ? <p className="text-xs text-muted-foreground mt-1">{editVoiceFile.name}</p> : <p className="text-xs text-muted-foreground mt-1">Current: <a href={editingAvatar.voice_url} target="_blank" rel="noopener noreferrer" className="underline">Listen</a></p>}
                                    </div>

                                    {/* Video Upload */}
                                    <div className="flex flex-col items-center p-4 bg-background rounded-lg border border-border">
                                        <Video className="w-8 h-8 text-blue-500 mb-2" />
                                        <label htmlFor="editVideoUpload" className="cursor-pointer bg-blue-500/10 text-blue-400 px-3 py-1 rounded-lg hover:bg-blue-500/20 transition-colors text-sm">
                                            <Upload size={16} className="inline-block mr-1" /> New Video
                                        </label>
                                        <input
                                            id="editVideoUpload"
                                            type="file"
                                            accept="video/*"
                                            onChange={(e) => setEditVideoFile(e.target.files[0])}
                                            className="hidden"
                                        />
                                        {editVideoFile ? <p className="text-xs text-muted-foreground mt-1">{editVideoFile.name}</p> : <p className="text-xs text-muted-foreground mt-1">Current: <a href={editingAvatar.video_url} target="_blank" rel="noopener noreferrer" className="underline">Watch</a></p>}
                                    </div>
                                </div>

                                {/* Public/Private Toggle */}
                                <div className="flex items-center justify-center p-4 bg-background rounded-lg border border-border">
                                    <button
                                        type="button"
                                        onClick={() => setEditFormState({ ...editFormState, isPublic: !editFormState.isPublic })}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors duration-200
                                            ${editFormState.isPublic
                                                ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                                                : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                                            }`}
                                    >
                                        {editFormState.isPublic ? <Globe size={20} /> : <Lock size={20} />}
                                        {editFormState.isPublic ? 'Public' : 'Private'}
                                    </button>
                                </div>

                                <motion.button
                                    type="submit"
                                    disabled={uploadingEditFiles || !editFormState.name.trim()}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold text-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {uploadingEditFiles ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                                    {uploadingEditFiles ? 'Saving...' : 'Save Changes'}
                                </motion.button>
                                {error && <p className="text-red-500 text-center mt-2">{error}</p>}
                                {message && <p className="text-green-500 text-center mt-2">{message}</p>}
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deletingAvatarId && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                        onClick={cancelDelete}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-card p-8 rounded-xl shadow-2xl max-w-md w-full relative text-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-2xl font-bold text-foreground mb-4">Confirm Deletion</h2>
                            <p className="text-muted-foreground mb-6">Are you sure you want to delete this avatar? This action cannot be undone.</p>
                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={confirmDelete}
                                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                                    disabled={loading}
                                >
                                    {loading ? <Loader2 className="animate-spin inline-block mr-2" size={16} /> : <Trash2 size={16} className="inline-block mr-2" />}
                                    {loading ? 'Deleting...' : 'Delete'}
                                </button>
                                <button
                                    onClick={cancelDelete}
                                    className="px-6 py-2 bg-input text-foreground rounded-lg hover:bg-accent transition-colors disabled:opacity-50"
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                            </div>
                            {error && <p className="text-red-500 text-center mt-4">{error}</p>}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default MyCreations;