import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import supabase from '../supabaseClient'; // Ensure this is your direct supabase client for file uploads
import { Loader2, Globe, Lock, Edit, Trash2, Save, X, Mic, Image, Video, Upload, PlayCircle, Info, AlertCircle, CheckCircle } from 'lucide-react';
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
        persona_role: '', // Use persona_role instead of personalityData
        system_prompt: '', // Added system_prompt for editing
        conversational_context: '', // Added conversational_context for editing
        is_public: false,
    });
    const [editImageFile, setEditImageFile] = useState(null);
    const [editVoiceFile, setEditVoiceFile] = useState(null);
    const [editVideoFile, setEditVideoFile] = useState(null);
    const [uploadingEditFiles, setUploadingEditFiles] = useState(false);

    // State for deletion confirmation
    const [deletingAvatarId, setDeletingAvatarId] = useState(null); // Stores ID of avatar to be deleted

    // backendRestUrl is no longer used for avatar CRUD operations directly
    // const backendRestUrl = import.meta.env.VITE_BACKEND_REST_URL || 'http://localhost:5000';

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
                .select('*') // Select all columns including new ones
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
        setUploadingEditFiles(true); // Indicate file upload is in progress
        const filePath = `${folderName}/${user.id}/${Date.now()}-${file.name.replace(/\s/g, '_')}`;
        try {
            const { error } = await supabase.storage.from(bucketName).upload(filePath, file, {
                cacheControl: '3600',
                upsert: false // Do not upsert, throw error if file exists
            });

            if (error) {
                throw new Error(`Failed to upload ${file.name}: ${error.message}`);
            }
            const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(filePath);
            return publicUrlData.publicUrl;
        } catch (err) {
            console.error(`Error uploading file to ${folderName}:`, err);
            setError(`Failed to upload file: ${err.message}`);
            return null;
        } finally {
            setUploadingEditFiles(false); // Reset file upload loading
        }
    };

    // --- Handlers for Avatar Actions ---

    // Edit
    const handleEditClick = (avatar) => {
        setEditingAvatar(avatar);
        setEditFormState({
            name: avatar.name,
            persona_role: avatar.persona_role || '', // Use persona_role
            system_prompt: avatar.system_prompt || '', // Populate system_prompt
            conversational_context: avatar.conversational_context || '', // Populate conversational_context
            is_public: avatar.is_public,
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

        setLoading(true); // Use main loading for form submission
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
                updatedImageUrl = await uploadFileToSupabaseStorage(editImageFile, 'avatar-media', 'avatars/images');
            }
            if (editVoiceFile) {
                updatedVoiceUrl = await uploadFileToSupabaseStorage(editVoiceFile, 'avatar-media', 'avatars/voices');
            }
            if (editVideoFile) {
                updatedVideoUrl = await uploadFileToSupabaseStorage(editVideoFile, 'avatar-media', 'avatars/videos');
            }

            // Construct update payload for Supabase
            const updatePayload = {
                name: editFormState.name,
                image_url: updatedImageUrl,
                voice_url: updatedVoiceUrl,
                video_url: updatedVideoUrl,
                is_public: editFormState.isPublic,
                persona_role: editFormState.persona_role, // Use persona_role
                system_prompt: editFormState.system_prompt, // Update system_prompt
                conversational_context: editFormState.conversational_context, // Update conversational_context
                updated_at: new Date().toISOString(), // Update timestamp
            };

            // Directly update Supabase table instead of backend REST endpoint
            const { error: updateError } = await supabase
                .from('avatars')
                .update(updatePayload)
                .eq('id', editingAvatar.id)
                .eq('user_id', user.id); // Ensure only owner can update

            if (updateError) {
                throw updateError;
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
            setError(err.message || 'An unexpected error occurred while saving.');
        } finally {
            setLoading(false);
            setTimeout(() => setMessage(null), 3000); // Clear messages after 3 seconds
            setTimeout(() => setError(null), 3000);
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
            // Directly delete from Supabase table instead of backend REST endpoint
            const { error: deleteError } = await supabase
                .from('avatars')
                .delete()
                .eq('id', deletingAvatarId)
                .eq('user_id', user.id); // Ensure only owner can delete

            if (deleteError) {
                throw deleteError;
            }

            setMessage('Avatar deleted successfully!');
            setDeletingAvatarId(null);
            fetchMyCreations(); // Re-fetch to update the list
        } catch (err) {
            console.error('Error deleting avatar:', err);
            setError(err.message || 'An unexpected error occurred during deletion.');
        } finally {
            setLoading(false);
            setTimeout(() => setMessage(null), 3000); // Clear messages after 3 seconds
            setTimeout(() => setError(null), 3000);
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
            const newPublicStatus = !avatar.is_public;
            // Directly update Supabase table instead of backend REST endpoint
            const { error: updateError } = await supabase
                .from('avatars')
                .update({ is_public: newPublicStatus, updated_at: new Date().toISOString() })
                .eq('id', avatar.id)
                .eq('user_id', user.id); // Ensure only owner can update

            if (updateError) {
                throw updateError;
            }

            setMessage(`Avatar status changed to ${newPublicStatus ? 'Public' : 'Private'}!`);
            fetchMyCreations(); // Re-fetch to update the list
        } catch (err) {
            console.error('Error toggling public status:', err);
            setError(err.message || 'An unexpected error occurred while toggling status.');
        } finally {
            setLoading(false);
            setTimeout(() => setMessage(null), 3000); // Clear messages after 3 seconds
            setTimeout(() => setError(null), 3000);
        }
    };


    if (loading && !creations.length) return <div className="text-center text-gray-700 dark:text-gray-300 p-8"><Loader2 className="animate-spin inline-block mr-2" size={24} /> Loading your creations...</div>;
    if (error && !creations.length) return <div className="text-center text-red-500 p-8">Error: {error}</div>;


    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-4 sm:p-8 rounded-2xl bg-white dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-800 min-h-screen max-w-7xl mx-auto my-8"
        >
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 sm:mb-6">
                My AI Creations
            </h1>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-8">
                Here are all the custom avatars you've created. Manage, edit, and share them with ease.
            </p>

            {/* Global Messages */}
            <AnimatePresence>
                {message && (
                    <motion.p
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-4 py-3 rounded-md relative mb-4 text-sm"
                    >
                        <CheckCircle size={16} className="inline-block mr-2" />{message}
                    </motion.p>
                )}
                {error && (
                    <motion.p
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 px-4 py-3 rounded-md relative mb-4 text-sm"
                    >
                        <AlertCircle size={16} className="inline-block mr-2" />{error}
                    </motion.p>
                )}
            </AnimatePresence>

            {creations.length === 0 && !loading ? (
                <div className="text-center p-10 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">You haven't created any custom avatars yet.</p>
                    <Link to="/dashboard/avatars/create" className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg shadow-md hover:from-purple-700 hover:to-pink-700 transition-all duration-200">
                        <Upload size={20} className="mr-2" /> Create Your First Avatar
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {creations.map((creation) => (
                        <motion.div
                            key={creation.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                            whileHover={{ scale: 1.03, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
                            className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden shadow-sm"
                        >
                            {/* Media Display */}
                            <div className="relative w-full aspect-square bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                                {creation.image_url && !creation.video_url ? (
                                    <img src={creation.image_url} alt={creation.name} className="w-full h-full object-contain" />
                                ) : creation.video_url ? (
                                    <video src={creation.video_url} controls className="w-full h-full object-contain" />
                                ) : (
                                    <Image size={48} className="text-gray-400" />
                                )}
                            </div>

                            {/* Content Area */}
                            <div className="p-4 flex-grow flex flex-col">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 truncate">{creation.name}</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 truncate">{creation.persona_role || 'No role defined'}</p>
                                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 line-clamp-2">{creation.system_prompt || 'No system prompt.'}</p>

                                {/* Voice Player */}
                                {creation.voice_url && (
                                    <div className="w-full mb-3">
                                        <audio controls src={creation.voice_url} className="w-full rounded-md" />
                                    </div>
                                )}
                                
                                {/* Status */}
                                <div className="flex items-center gap-2 text-xs font-medium mb-4">
                                    {creation.is_public ? (
                                        <span className="flex items-center text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20 px-2 py-1 rounded-full">
                                            <Globe size={14} className="mr-1" /> Public
                                        </span>
                                    ) : (
                                        <span className="flex items-center text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20 px-2 py-1 rounded-full">
                                            <Lock size={14} className="mr-1" /> Private
                                        </span>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-wrap gap-2 mt-auto">
                                    <button
                                        onClick={() => handleEditClick(creation)}
                                        className="flex-1 min-w-[80px] px-3 py-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors flex items-center justify-center gap-1 text-xs font-medium"
                                        title="Edit Avatar"
                                    >
                                        <Edit size={14} /> Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(creation.id)}
                                        className="flex-1 min-w-[80px] px-3 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors flex items-center justify-center gap-1 text-xs font-medium"
                                        title="Delete Avatar"
                                    >
                                        <Trash2 size={14} /> Delete
                                    </button>
                                    <button
                                        onClick={() => handleTogglePublic(creation)}
                                        className={`flex-1 min-w-[80px] px-3 py-2 rounded-lg hover:opacity-80 transition-colors flex items-center justify-center gap-1 text-xs font-medium
                                            ${creation.is_public ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}
                                        title={creation.is_public ? "Make Private" : "Make Public"}
                                    >
                                        {creation.is_public ? <Lock size={14} /> : <Globe size={14} />}
                                        {creation.is_public ? 'Private' : 'Public'}
                                    </button>
                                </div>
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
                            className="bg-white dark:bg-gray-900 p-6 sm:p-8 rounded-xl shadow-2xl max-w-lg w-full relative border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto" // Added max-h and overflow-y-auto
                            onClick={(e) => e.stopPropagation()} // Prevent click from closing modal
                        >
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-gray-600 dark:text-gray-300"
                                title="Close"
                            >
                                <X size={20} />
                            </button>
                            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
                                Edit Avatar: {editingAvatar.name}
                            </h2>
                            <form onSubmit={handleSaveEdit} className="space-y-4"> {/* Reduced space-y */}
                                <div>
                                    <label htmlFor="editName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Avatar Name</label> {/* Reduced mb */}
                                    <input
                                        type="text"
                                        id="editName"
                                        value={editFormState.name}
                                        onChange={(e) => setEditFormState({ ...editFormState, name: e.target.value })}
                                        required
                                        className="w-full p-2 text-sm rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 outline-none text-gray-900 dark:text-white" // Reduced padding and font size
                                    />
                                </div>
                                <div>
                                    <label htmlFor="editPersonaRole" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Persona Role (Optional)</label> {/* Reduced mb */}
                                    <input
                                        type="text"
                                        id="editPersonaRole"
                                        value={editFormState.persona_role}
                                        onChange={(e) => setEditFormState({ ...editFormState, persona_role: e.target.value })}
                                        className="w-full p-2 text-sm rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 outline-none text-gray-900 dark:text-white" // Reduced padding and font size
                                        placeholder="e.g., Financial Advisor, Sales Coach"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="editSystemPrompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">System Prompt (Persona)</label> {/* Reduced mb */}
                                    <textarea
                                        id="editSystemPrompt"
                                        value={editFormState.system_prompt}
                                        onChange={(e) => setEditFormState({ ...editFormState, system_prompt: e.target.value })}
                                        rows="3" // Reduced rows
                                        className="w-full p-2 text-sm rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 outline-none text-gray-900 dark:text-white" // Reduced padding and font size
                                        placeholder="Describe the avatar's personality, expertise, or role."
                                    ></textarea>
                                </div>
                                <div>
                                    <label htmlFor="editConversationalContext" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Conversational Context (Optional)</label> {/* Reduced mb */}
                                    <textarea
                                        id="editConversationalContext"
                                        value={editFormState.conversational_context}
                                        onChange={(e) => setEditFormState({ ...editFormState, conversational_context: e.target.value })}
                                        rows="2" // Reduced rows
                                        className="w-full p-2 text-sm rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 outline-none text-gray-900 dark:text-white" // Reduced padding and font size
                                        placeholder="Additional context for specific conversation flows."
                                    ></textarea>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3"> {/* Reduced gap */}
                                    {/* Image Upload */}
                                    <div className="flex flex-col items-center p-3 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700"> {/* Reduced padding */}
                                        <Image className="w-7 h-7 text-purple-500 mb-1" /> {/* Reduced size and mb */}
                                        <label htmlFor="editImageUpload" className="cursor-pointer bg-purple-500/10 text-purple-400 px-2 py-1 rounded-lg hover:bg-purple-500/20 transition-colors text-xs"> {/* Reduced padding and font size */}
                                            <Upload size={14} className="inline-block mr-1" /> New Image
                                        </label>
                                        <input
                                            id="editImageUpload"
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setEditImageFile(e.target.files[0])}
                                            className="hidden"
                                        />
                                        {editImageFile ? <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">{editImageFile.name}</p> : <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Current: <a href={editingAvatar.image_url} target="_blank" rel="noopener noreferrer" className="underline">View</a></p>}
                                    </div>

                                    {/* Voice Upload */}
                                    <div className="flex flex-col items-center p-3 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700"> {/* Reduced padding */}
                                        <Mic className="w-7 h-7 text-pink-500 mb-1" /> {/* Reduced size and mb */}
                                        <label htmlFor="editVoiceUpload" className="cursor-pointer bg-pink-500/10 text-pink-400 px-2 py-1 rounded-lg hover:bg-pink-500/20 transition-colors text-xs"> {/* Reduced padding and font size */}
                                            <Upload size={14} className="inline-block mr-1" /> New Voice
                                        </label>
                                        <input
                                            id="editVoiceUpload"
                                            type="file"
                                            accept="audio/*"
                                            onChange={(e) => setEditVoiceFile(e.target.files[0])}
                                            className="hidden"
                                        />
                                        {editVoiceFile ? <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">{editVoiceFile.name}</p> : <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Current: <a href={editingAvatar.voice_url} target="_blank" rel="noopener noreferrer" className="underline">Listen</a></p>}
                                    </div>

                                    {/* Video Upload */}
                                    <div className="flex flex-col items-center p-3 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700"> {/* Reduced padding */}
                                        <Video className="w-7 h-7 text-blue-500 mb-1" /> {/* Reduced size and mb */}
                                        <label htmlFor="editVideoUpload" className="cursor-pointer bg-blue-500/10 text-blue-400 px-2 py-1 rounded-lg hover:bg-blue-500/20 transition-colors text-xs"> {/* Reduced padding and font size */}
                                            <Upload size={14} className="inline-block mr-1" /> New Video
                                        </label>
                                        <input
                                            id="editVideoUpload"
                                            type="file"
                                            accept="video/*"
                                            onChange={(e) => setEditVideoFile(e.target.files[0])}
                                            className="hidden"
                                        />
                                        {editVideoFile ? <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">{editVideoFile.name}</p> : <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Current: <a href={editingAvatar.video_url} target="_blank" rel="noopener noreferrer" className="underline">Watch</a></p>}
                                    </div>
                                </div>

                                {/* Public/Private Toggle */}
                                <div className="flex items-center justify-center p-3 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700"> {/* Reduced padding */}
                                    <button
                                        type="button"
                                        onClick={() => setEditFormState({ ...editFormState, isPublic: !editFormState.isPublic })}
                                        className={`flex items-center gap-2 px-3 py-1 rounded-lg font-semibold transition-colors duration-200 text-sm
                                            ${editFormState.isPublic
                                                ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                                                : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                                            }`} // Reduced padding and font size
                                    >
                                        {editFormState.isPublic ? <Globe size={18} /> : <Lock size={18} />} {/* Reduced icon size */}
                                        {editFormState.isPublic ? 'Public' : 'Private'}
                                    </button>
                                </div>

                                <motion.button
                                    type="submit"
                                    disabled={uploadingEditFiles || !editFormState.name.trim() || loading}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold text-base hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed" // Reduced padding and font size
                                >
                                    {loading || uploadingEditFiles ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} {/* Reduced icon size */}
                                    {loading || uploadingEditFiles ? 'Saving...' : 'Save Changes'}
                                </motion.button>
                                <AnimatePresence>
                                    {error && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="text-red-500 text-center mt-2 text-xs flex items-center justify-center gap-1" // Reduced font size
                                        >
                                            <AlertCircle size={14} />{error} {/* Reduced icon size */}
                                        </motion.p>
                                    )}
                                    {message && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="text-green-500 text-center mt-2 text-xs flex items-center justify-center gap-1" // Reduced font size
                                        >
                                            <CheckCircle size={14} />{message} {/* Reduced icon size */}
                                        </motion.p>
                                    )}
                                </AnimatePresence>
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
                            className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-2xl max-w-md w-full relative text-center border border-gray-200 dark:border-gray-700"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Confirm Deletion</h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">Are you sure you want to delete this avatar? This action cannot be undone.</p>
                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={confirmDelete}
                                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                    disabled={loading}
                                >
                                    {loading ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                                    {loading ? 'Deleting...' : 'Delete'}
                                </button>
                                <button
                                    onClick={cancelDelete}
                                    className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                            </div>
                            {error && <p className="text-red-500 text-center mt-4 text-sm flex items-center justify-center gap-1"><AlertCircle size={16} />{error}</p>}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default MyCreations;
