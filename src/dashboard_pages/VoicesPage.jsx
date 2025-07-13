// src/dashboard_pages/VoicesPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { MicIcon, UploadIcon, CheckIcon } from '../utils/icons'; // Assuming these are in utils/icons.jsx

const VoicesPage = () => {
    const { user, supabase } = useAuth();
    const [myVoices, setMyVoices] = useState([]);
    const [publicVoices, setPublicVoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedTab, setSelectedTab] = useState('my'); // 'my' or 'public' or 'upload'
    const [uploading, setUploading] = useState(false);
    const [audioFile, setAudioFile] = useState(null);
    const [voiceName, setVoiceName] = useState('');
    const [isPublicVoice, setIsPublicVoice] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    useEffect(() => {
        if (user) {
            fetchVoices();
        } else {
            setLoading(false);
            setError('Please log in to view voices.');
        }
    }, [user, supabase]);

    const fetchVoices = async () => {
        setLoading(true);
        setError('');
        try {
            // Fetch My Voices
            const { data: myVoicesData, error: myVoicesError } = await supabase
                .from('voices')
                .select('*')
                .eq('user_id', user.id);

            if (myVoicesError) throw myVoicesError;
            setMyVoices(myVoicesData);

            // Fetch Public Voices
            const { data: publicVoicesData, error: publicVoicesError } = await supabase
                .from('voices')
                .select('*')
                .eq('is_public', true)
                .neq('user_id', user.id); // Exclude current user's public voices from this list

            if (publicVoicesError) throw publicVoicesError;
            setPublicVoices(publicVoicesData);

        } catch (err) {
            console.error('Error fetching voices:', err.message);
            setError(`Failed to load voices: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (file) {
            setAudioFile(file);
            setVoiceName(file.name.split('.')[0]); // Pre-fill name from filename
        }
    };

    const handleVoiceUpload = async (e) => {
        e.preventDefault();
        if (!audioFile || !voiceName.trim()) {
            setError('Please select an audio file and provide a name for your voice.');
            return;
        }

        setUploading(true);
        setError('');
        setUploadProgress(0);

        try {
            // 1. Upload audio file to Supabase Storage
            const filePath = `voices/${user.id}/${Date.now()}-${audioFile.name}`;
            const { data, error: uploadError } = await supabase.storage
                .from('avatar-media') // Assuming 'avatar-media' is where voices go
                .upload(filePath, audioFile, {
                    cacheControl: '3600',
                    upsert: false,
                    onUploadProgress: (event) => {
                        if (event.lengthComputable) {
                            setUploadProgress(Math.round((event.loaded / event.total) * 100));
                        }
                    }
                });

            if (uploadError) throw uploadError;

            // Get public URL for the uploaded file
            const { data: publicUrlData } = supabase.storage
                .from('avatar-media')
                .getPublicUrl(filePath);

            if (!publicUrlData || !publicUrlData.publicUrl) {
                throw new Error('Failed to get public URL for uploaded voice.');
            }

            // 2. Insert voice metadata into the 'voices' table
            const { data: newVoice, error: insertError } = await supabase
                .from('voices')
                .insert({
                    user_id: user.id,
                    name: voiceName.trim(),
                    audio_url: publicUrlData.publicUrl,
                    is_public: isPublicVoice,
                    is_cloned: true // Assuming uploaded voices are for cloning/synthesis
                })
                .select() // Return the inserted data
                .single();

            if (insertError) throw insertError;

            alert('Voice uploaded and created successfully!');
            setAudioFile(null);
            setVoiceName('');
            setIsPublicVoice(false);
            setUploadProgress(0);
            setSelectedTab('my'); // Go back to my voices
            fetchVoices(); // Refresh the list

        } catch (err) {
            console.error('Error uploading voice:', err.message);
            setError(`Failed to upload voice: ${err.message}`);
        } finally {
            setUploading(false);
        }
    };

    const handleUseVoice = (voice) => {
        // This function would typically pass the voice ID/URL to the CreateAvatarPage
        // or a global state/context for avatar creation.
        alert(`You selected voice: ${voice.name}. You can now use this when creating an avatar!`);
        // Example: navigate('/dashboard/avatars/create', { state: { selectedVoice: voice } });
    };

    const handleDeleteVoice = async (voiceId) => {
        if (!window.confirm('Are you sure you want to delete this voice?')) return;

        try {
            // Delete from Supabase Storage (optional but good practice)
            const filePath = voiceId.audio_url.split('/avatar-media/')[1]; // Extract path from URL
            if (filePath) {
                const { error: storageError } = await supabase.storage
                    .from('avatar-media')
                    .remove([filePath]);
                if (storageError) console.error("Error deleting file from storage:", storageError);
            }

            // Delete from database
            const { error: deleteError } = await supabase
                .from('voices')
                .delete()
                .eq('id', voiceId);

            if (deleteError) throw deleteError;
            alert('Voice deleted successfully.');
            fetchVoices(); // Refresh list
        } catch (err) {
            console.error('Error deleting voice:', err.message);
            setError(`Failed to delete voice: ${err.message}`);
        }
    };

    const renderVoiceList = (voices, type) => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {voices.length === 0 ? (
                <p className="col-span-full text-center text-muted-foreground">
                    {type === 'my' ? "You haven't uploaded any voices yet." : "No public voices available."}
                </p>
            ) : (
                voices.map((voice) => (
                    <div key={voice.id} className="bg-card p-4 rounded-lg shadow border border-border flex flex-col">
                        <div className="flex items-center gap-3 mb-3">
                            <MicIcon size={24} className="text-primary" />
                            <h4 className="text-xl font-semibold text-foreground flex-grow">{voice.name}</h4>
                            {voice.is_cloned && (
                                <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full">Cloned</span>
                            )}
                        </div>
                        {voice.description && (
                            <p className="text-muted-foreground text-sm mb-3">{voice.description}</p>
                        )}
                        <audio controls src={voice.audio_url} className="w-full mb-4"></audio>
                        <div className="flex justify-end gap-2 mt-auto">
                            {type === 'my' && (
                                <button
                                    onClick={() => handleDeleteVoice(voice.id)}
                                    className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                                >
                                    Delete
                                </button>
                            )}
                            <button
                                onClick={() => handleUseVoice(voice)}
                                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors"
                            >
                                {type === 'my' ? 'Use This Voice' : 'Add to My Voices'}
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
    );

    return (
        <div className="container mx-auto px-4 py-8">
            <h2 className="text-4xl font-bold text-foreground mb-8">Voice Library</h2>

            {error && (
                <div className="bg-red-500/20 text-red-400 p-4 rounded-lg mb-6 text-center">
                    {error}
                </div>
            )}

            <div className="flex border-b border-border mb-8">
                <button
                    className={`px-6 py-3 text-lg font-medium ${selectedTab === 'my' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
                    onClick={() => setSelectedTab('my')}
                >
                    My Voices
                </button>
                <button
                    className={`px-6 py-3 text-lg font-medium ${selectedTab === 'public' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
                    onClick={() => setSelectedTab('public')}
                >
                    Public Voices
                </button>
                <button
                    className={`px-6 py-3 text-lg font-medium ${selectedTab === 'upload' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
                    onClick={() => setSelectedTab('upload')}
                >
                    Upload New Voice
                </button>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <p className="text-lg text-muted-foreground">Loading voices...</p>
                    {/* Add a simple spinner here */}
                </div>
            ) : (
                <>
                    {selectedTab === 'my' && renderVoiceList(myVoices, 'my')}
                    {selectedTab === 'public' && renderVoiceList(publicVoices, 'public')}
                    {selectedTab === 'upload' && (
                        <div className="bg-card p-8 rounded-lg shadow border border-border max-w-2xl mx-auto">
                            <h3 className="text-2xl font-semibold text-foreground mb-6 text-center">Upload New Voice</h3>
                            <form onSubmit={handleVoiceUpload} className="space-y-6">
                                <div>
                                    <label htmlFor="voiceName" className="block text-sm font-medium text-muted-foreground mb-2">Voice Name</label>
                                    <input
                                        type="text"
                                        id="voiceName"
                                        value={voiceName}
                                        onChange={(e) => setVoiceName(e.target.value)}
                                        required
                                        className="w-full p-3 rounded-lg bg-input border border-border focus:ring-2 focus:ring-purple-500 outline-none text-foreground"
                                        placeholder="e.g., My AI Voice, Professional Narrator"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="audioFile" className="block text-sm font-medium text-muted-foreground mb-2">Audio File (MP3, WAV, FLAC)</label>
                                    <input
                                        type="file"
                                        id="audioFile"
                                        accept="audio/mp3,audio/wav,audio/flac"
                                        onChange={handleFileUpload}
                                        required
                                        className="w-full p-3 rounded-lg bg-input border border-border focus:ring-2 focus:ring-purple-500 outline-none text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
                                    />
                                    {audioFile && <p className="mt-2 text-sm text-muted-foreground">Selected: {audioFile.name}</p>}
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="isPublicVoice"
                                        checked={isPublicVoice}
                                        onChange={(e) => setIsPublicVoice(e.target.checked)}
                                        className="h-4 w-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                                    />
                                    <label htmlFor="isPublicVoice" className="text-sm font-medium text-muted-foreground">Make this voice public?</label>
                                </div>

                                {uploading && uploadProgress > 0 && (
                                    <div className="w-full bg-gray-700 rounded-full h-2.5 mb-4">
                                        <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                                        <p className="text-xs text-center mt-1 text-muted-foreground">{uploadProgress}% uploaded</p>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold text-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {uploading ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <UploadIcon size={20} /> Upload Voice
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default VoicesPage;