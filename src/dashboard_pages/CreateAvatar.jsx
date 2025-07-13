// src/dashboard_pages/CreateAvatar.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import supabase  from '../supabaseClient';
import { Upload, Mic, Image, Video, Save, Loader2, Globe, Lock } from 'lucide-react';

const CreateAvatar = () => {
    const { user, supabase: authSupabase } = useAuth(); // Use authSupabase for session and user
    const [name, setName] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [voiceFile, setVoiceFile] = useState(null);
    const [videoFile, setVideoFile] = useState(null);
    const [isPublic, setIsPublic] = useState(false); // New state for public/private
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleFileChange = (e, setter) => {
        if (e.target.files[0]) {
            setter(e.target.files[0]);
        }
    };

    const uploadFileToSupabaseStorage = async (file, bucketName, folderName) => {
        if (!file) return null;
        const filePath = `${folderName}/${user.id}/${Date.now()}-${file.name}`;
        const { data, error } = await supabase.storage.from(bucketName).upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
        });

        if (error) {
            throw new Error(`Failed to upload ${file.name}: ${error.message}`);
        }
        // Get public URL
        const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(filePath);
        return publicUrlData.publicUrl;
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        if (!user) {
            setError('You must be logged in to create an avatar.');
            setLoading(false);
            return;
        }

        try {
            // Get session token to send to backend for authentication
            const { data: { session } } = await authSupabase.auth.getSession();
            if (!session) {
                throw new Error("No active session found. Please log in again.");
            }

            let imageUrl = null;
            let voiceUrl = null;
            let videoUrl = null;

            // Upload files to Supabase Storage
            if (imageFile) imageUrl = await uploadFileToSupabaseStorage(imageFile, 'avatars', 'images');
            if (voiceFile) voiceUrl = await uploadFileToSupabaseStorage(voiceFile, 'avatars', 'voices');
            if (videoFile) videoUrl = await uploadFileToSupabaseStorage(videoFile, 'avatars', 'videos');

            // Send data to your backend API
            const response = await fetch('http://localhost:5000/api/avatars', { // Your backend URL
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}` // Attach JWT
                },
                body: JSON.stringify({
                    name,
                    imageUrl,
                    voiceUrl,
                    videoUrl,
                    is_public: isPublic, // Send public/private status
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create avatar on backend');
            }

            const newAvatar = await response.json();
            setMessage(`Avatar "${newAvatar.name}" created successfully!`);
            // Reset form
            setName('');
            setImageFile(null);
            setVoiceFile(null);
            setVideoFile(null);
            setIsPublic(false);
            e.target.reset(); // Resets file inputs
        } catch (err) {
            console.error('Avatar creation error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-8 rounded-2xl bg-card shadow-xl border border-border"
        >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
                Create Your AI Avatar
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
                Bring your digital self to life with custom images, voices, and videos.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="avatarName" className="block text-sm font-medium text-muted-foreground mb-2">Avatar Name</label>
                    <input
                        type="text"
                        id="avatarName"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full p-3 rounded-lg bg-input border border-border focus:ring-2 focus:ring-purple-500 outline-none transition-all duration-200 text-foreground"
                        placeholder="e.g., My Professional Avatar"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Image Upload */}
                    <div className="flex flex-col items-center p-4 bg-background rounded-lg border border-border">
                        <Image className="w-10 h-10 text-purple-500 mb-3" />
                        <label htmlFor="imageUpload" className="cursor-pointer bg-purple-500/10 text-purple-400 px-4 py-2 rounded-lg hover:bg-purple-500/20 transition-colors">
                            <Upload size={18} className="inline-block mr-2" /> Upload Image
                        </label>
                        <input
                            id="imageUpload"
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, setImageFile)}
                            className="hidden"
                        />
                        {imageFile && <p className="text-sm text-muted-foreground mt-2">{imageFile.name}</p>}
                    </div>

                    {/* Voice Upload */}
                    <div className="flex flex-col items-center p-4 bg-background rounded-lg border border-border">
                        <Mic className="w-10 h-10 text-pink-500 mb-3" />
                        <label htmlFor="voiceUpload" className="cursor-pointer bg-pink-500/10 text-pink-400 px-4 py-2 rounded-lg hover:bg-pink-500/20 transition-colors">
                            <Upload size={18} className="inline-block mr-2" /> Upload Voice
                        </label>
                        <input
                            id="voiceUpload"
                            type="file"
                            accept="audio/*"
                            onChange={(e) => handleFileChange(e, setVoiceFile)}
                            className="hidden"
                        />
                        {voiceFile && <p className="text-sm text-muted-foreground mt-2">{voiceFile.name}</p>}
                    </div>

                    {/* Video Upload */}
                    <div className="flex flex-col items-center p-4 bg-background rounded-lg border border-border">
                        <Video className="w-10 h-10 text-blue-500 mb-3" />
                        <label htmlFor="videoUpload" className="cursor-pointer bg-blue-500/10 text-blue-400 px-4 py-2 rounded-lg hover:bg-blue-500/20 transition-colors">
                            <Upload size={18} className="inline-block mr-2" /> Upload Video
                        </label>
                        <input
                            id="videoUpload"
                            type="file"
                            accept="video/*"
                            onChange={(e) => handleFileChange(e, setVideoFile)}
                            className="hidden"
                        />
                        {videoFile && <p className="text-sm text-muted-foreground mt-2">{videoFile.name}</p>}
                    </div>
                </div>

                {/* Public/Private Toggle */}
                <div className="flex items-center justify-center p-4 bg-background rounded-lg border border-border">
                    <button
                        type="button"
                        onClick={() => setIsPublic(!isPublic)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors duration-200
                            ${isPublic
                                ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                                : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                            }`}
                    >
                        {isPublic ? <Globe size={20} /> : <Lock size={20} />}
                        {isPublic ? 'Make Private (Publicly Visible)' : 'Make Public (Private by default)'}
                    </button>
                </div>


                <motion.button
                    type="submit"
                    disabled={loading || !name || (!imageFile && !voiceFile && !videoFile)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold text-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    {loading ? 'Generating...' : 'Create Avatar'}
                </motion.button>

                {message && (
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center text-green-500 mt-4"
                    >
                        {message}
                    </motion.p>
                )}
                {error && (
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center text-red-500 mt-4"
                    >
                        {error}
                    </motion.p>
                )}
            </form>
        </motion.div>
    );
};

export default CreateAvatar;