// src/dashboard_pages/NewConversation.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, Info } from 'lucide-react';

const CustomToggle = ({ enabled, setEnabled }) => (
    <button type="button" onClick={() => setEnabled(!enabled)} className={`${ enabled ? 'bg-pink-600' : 'bg-gray-200 dark:bg-gray-600'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}>
        <span className={`${ enabled ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}/>
    </button>
);

const NewConversation = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [avatars, setAvatars] = useState([]);
    const [loadingAvatars, setLoadingAvatars] = useState(true);

    const [selectedAvatarId, setSelectedAvatarId] = useState(searchParams.get('avatarId') || '');
    const [conversationName, setConversationName] = useState('');
    const [customGreeting, setCustomGreeting] = useState('');
    const [conversationContext, setConversationContext] = useState('');
    const [conversationLanguage, setConversationLanguage] = useState('English');

    // Properties
    const [maxCallDuration, setMaxCallDuration] = useState(3600);
    const [participantLeftTimeout, setParticipantLeftTimeout] = useState(0);
    const [participantAbsentTimeout, setParticipantAbsentTimeout] = useState(300);
    const [enableCaptions, setEnableCaptions] = useState(false);
    const [applyGreenscreen, setApplyGreenscreen] = useState(false);
    const [audioOnly, setAudioOnly] = useState(true);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUserAvatars = async () => {
            if (!user) return;
            setLoadingAvatars(true);
            const { data, error } = await supabase
                .from('avatars')
                .select('id, name, is_public')
                .or(`user_id.eq.${user.id},is_public.eq.true`);
            
            if (error) {
                console.error("Error fetching avatars:", error);
                setError("Could not load your avatars.");
            } else {
                setAvatars(data);
                // If an avatarId is in the URL, ensure it's selected
                if (searchParams.get('avatarId')) {
                    setSelectedAvatarId(searchParams.get('avatarId'));
                } else if (data.length > 0) {
                    // Default to first avatar if none specified
                    setSelectedAvatarId(data[0].id);
                }
            }
            setLoadingAvatars(false);
        };
        fetchUserAvatars();
    }, [user, searchParams]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedAvatarId) {
            setError('Please select an avatar.');
            return;
        }
        setIsSubmitting(true);
        setError('');

        const { error: insertError } = await supabase
            .from('conversations')
            .insert([{
                user_id: user.id,
                avatar_id: selectedAvatarId,
                name: conversationName || `Conversation with ${avatars.find(a => a.id === selectedAvatarId)?.name}`,
                description: conversationContext,
                conversation_language: conversationLanguage,
                max_duration_seconds: maxCallDuration,
                participant_timeout_seconds: participantAbsentTimeout,
                enable_closed_captions: enableCaptions,
                apply_greenscreen: applyGreenscreen,
                audio_only: audioOnly,
                status: 'active'
            }]);
        
        if (insertError) {
            setError(`Failed to create conversation: ${insertError.message}`);
            setIsSubmitting(false);
        } else {
            // On success, you would likely navigate to the chat page with the new conversation ID
            navigate('/dashboard/conversation/library');
        }
    };
    
    // UI is split into two columns like the screenshot
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">New Conversation</h1>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column: Basics */}
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 space-y-5">
                <span className="text-xs font-semibold uppercase text-gray-500">Basics</span>
                <div>
                    <label htmlFor="persona" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Avatar</label>
                    {loadingAvatars ? <div className="w-full h-10 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div> : (
                        <select id="persona" value={selectedAvatarId} onChange={e => setSelectedAvatarId(e.target.value)} className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-1 focus:ring-pink-500 focus:border-pink-500 outline-none">
                            <option value="" disabled>Select an avatar</option>
                            {avatars.map(avatar => <option key={avatar.id} value={avatar.id}>{avatar.name} {avatar.is_public ? '(Stock)' : ''}</option>)}
                        </select>
                    )}
                </div>
                {/* Other fields like Language, Name, Greeting, Context */}
            </div>
            {/* Right Column: Properties */}
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 space-y-6">
                <span className="text-xs font-semibold uppercase text-gray-500">Properties</span>
                {/* Duration, Timeouts, Toggles */}
                <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Audio-Only</label>
                    <CustomToggle enabled={audioOnly} setEnabled={setAudioOnly} />
                </div>
                 {/* ... other properties */}
            </div>
            <div className="lg:col-span-2 flex justify-end">
                <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 text-sm font-semibold text-white bg-pink-600 rounded-md hover:bg-pink-700 disabled:opacity-50 disabled:cursor-wait flex items-center gap-2">
                    {isSubmitting && <Loader2 className="animate-spin" size={16} />}
                    Create Conversation
                </button>
            </div>
        </form>
      </div>
    );
};

export default NewConversation;