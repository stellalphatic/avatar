// src/dashboard_pages/ChatWithAvatarPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { MessageCircleIcon, MicIcon, UsersIcon, SendIcon, Volume2Icon, VolumeXIcon } from '../utils/icons'; // Ensure these icons exist

// Placeholder for WS connection (you'll need a real backend for this)
let ws = null;

const ChatWithAvatarPage = () => {
    const { user, supabase } = useAuth();
    const [avatars, setAvatars] = useState([]);
    const [selectedAvatar, setSelectedAvatar] = useState(null);
    const [messages, setMessages] = useState([]); // { type: 'user' | 'avatar', text: '...' }
    const [inputMessage, setInputMessage] = useState('');
    const [loadingAvatars, setLoadingAvatars] = useState(true);
    const [error, setError] = useState('');
    const [isListening, setIsListening] = useState(false); // For voice input
    const [isSpeaking, setIsSpeaking] = useState(false); // For avatar voice output
    const [wsConnected, setWsConnected] = useState(false);

    const messagesEndRef = useRef(null); // For auto-scrolling chat
    const audioRef = useRef(new Audio()); // For playing avatar's voice

    const backendWsUrl = import.meta.env.VITE_BACKEND_WS_URL; // Your WebSocket URL

    useEffect(() => {
        if (user) {
            fetchUserAvatars();
        } else {
            setLoadingAvatars(false);
            setError('Please log in to chat with avatars.');
        }
    }, [user, supabase]);

    useEffect(() => {
        // Scroll to bottom of messages
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    // WebSocket connection setup
    useEffect(() => {
        if (!selectedAvatar || !user || !backendWsUrl) return;

        // Close existing connection if any
        if (ws) {
            ws.close();
        }

        const connectWebSocket = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) {
                    setError('No active session. Cannot establish chat connection.');
                    return;
                }

                // Append JWT token for authentication
                ws = new WebSocket(`${backendWsUrl}/chat?token=${session.access_token}&avatarId=${selectedAvatar.id}`);

                ws.onopen = () => {
                    console.log('WebSocket connected');
                    setWsConnected(true);
                    setMessages([{ type: 'avatar', text: `Hello! I am ${selectedAvatar.name}. How can I help you today?` }]);
                };

                ws.onmessage = (event) => {
                    const data = JSON.parse(event.data);
                    if (data.type === 'text') {
                        setMessages((prev) => [...prev, { type: 'avatar', text: data.text }]);
                    } else if (data.type === 'audio_url') {
                        // Play the audio
                        audioRef.current.src = data.url;
                        audioRef.current.play();
                        setIsSpeaking(true);
                    }
                    // Handle other message types like 'typing_indicator', 'error' etc.
                };

                ws.onclose = () => {
                    console.log('WebSocket disconnected');
                    setWsConnected(false);
                    setError('Chat connection lost. Please try again.');
                };

                ws.onerror = (err) => {
                    console.error('WebSocket error:', err);
                    setError('An error occurred with the chat connection.');
                };

            } catch (err) {
                console.error("Failed to get session for WS:", err);
                setError("Authentication error for chat connection.");
            }
        };

        connectWebSocket();

        // Cleanup on unmount or avatar change
        return () => {
            if (ws) {
                ws.close();
                ws = null;
            }
            audioRef.current.pause();
            setIsSpeaking(false);
        };
    }, [selectedAvatar, user, backendWsUrl, supabase]);

    audioRef.current.onended = () => {
        setIsSpeaking(false);
    };

    const fetchUserAvatars = async () => {
        setLoadingAvatars(true);
        setError('');
        try {
            const { data, error: fetchError } = await supabase
                .from('avatars')
                .select('*')
                .eq('user_id', user.id);

            if (fetchError) throw fetchError;
            setAvatars(data);
            if (data.length > 0) {
                setSelectedAvatar(data[0]); // Select first avatar by default
            }
        } catch (err) {
            console.error('Error fetching avatars:', err.message);
            setError(`Failed to load your avatars: ${err.message}`);
        } finally {
            setLoadingAvatars(false);
        }
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!inputMessage.trim() || !wsConnected || !selectedAvatar) return;

        setMessages((prev) => [...prev, { type: 'user', text: inputMessage.trim() }]);

        // Send message to WebSocket backend
        ws.send(JSON.stringify({
            type: 'text',
            message: inputMessage.trim(),
            avatarId: selectedAvatar.id // Ensure backend knows which avatar to use
        }));

        setInputMessage('');
    };

    const handleVoiceInputToggle = () => {
        if (!wsConnected || !selectedAvatar) {
            setError('Not connected to avatar chat.');
            return;
        }
        // This is a placeholder. Real voice recognition (Web Speech API or backend STT)
        // would be integrated here.
        if (isListening) {
            setIsListening(false);
            console.log("Stopped listening for voice input.");
            // Stop speech recognition or stop sending audio chunks to WS
            ws.send(JSON.stringify({ type: 'audio_stream_end' })); // Inform backend
        } else {
            setIsListening(true);
            console.log("Started listening for voice input...");
            setError('');
            // Start speech recognition or start sending audio chunks to WS
            ws.send(JSON.stringify({ type: 'audio_stream_start' })); // Inform backend
            // For a real implementation, you'd get microphone input and send it to WS
            // navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => { /* ... */ });
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 h-full flex flex-col lg:flex-row">
            <h2 className="text-4xl font-bold text-foreground mb-8 lg:hidden">Chat with Avatar</h2>

            {error && (
                <div className="bg-red-500/20 text-red-400 p-4 rounded-lg mb-6 text-center lg:col-span-3">
                    {error}
                </div>
            )}

            <aside className="w-full lg:w-1/4 bg-card p-6 rounded-lg shadow border border-border mb-6 lg:mb-0 lg:mr-6 flex-shrink-0">
                <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                    <UsersIcon size={20} /> Your Avatars
                </h3>
                {loadingAvatars ? (
                    <p className="text-muted-foreground text-center">Loading avatars...</p>
                ) : avatars.length === 0 ? (
                    <p className="text-muted-foreground text-center">No avatars found. Create one!</p>
                ) : (
                    <div className="space-y-3">
                        {avatars.map((avatar) => (
                            <button
                                key={avatar.id}
                                onClick={() => setSelectedAvatar(avatar)}
                                className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors
                                    ${selectedAvatar?.id === avatar.id ? 'bg-primary/20 text-primary font-semibold' : 'bg-input text-muted-foreground hover:bg-accent'}`}
                            >
                                {/* You might want to display avatar's image here */}
                                <img src={avatar.media_url || "https://via.placeholder.com/40"} alt={avatar.name} className="w-10 h-10 rounded-full object-cover" />
                                <div>
                                    <p className="text-sm font-medium">{avatar.name}</p>
                                    <p className="text-xs text-muted-foreground">{avatar.description?.substring(0, 30)}...</p>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </aside>

            <section className="flex-1 bg-card p-6 rounded-lg shadow border border-border flex flex-col h-[calc(100vh-16rem)] lg:h-[calc(100vh-8rem)]">
                {selectedAvatar ? (
                    <>
                        <div className="flex items-center gap-4 mb-6 pb-4 border-b border-border">
                            {/* Avatar image and name at the top of chat */}
                            <img src={selectedAvatar.media_url || "https://via.placeholder.com/60"} alt={selectedAvatar.name} className="w-12 h-12 rounded-full object-cover" />
                            <div>
                                <h3 className="text-2xl font-bold text-foreground">{selectedAvatar.name}</h3>
                                <p className="text-muted-foreground text-sm">{selectedAvatar.description}</p>
                            </div>
                            <div className="ml-auto flex gap-2">
                                <button
                                    onClick={handleVoiceInputToggle}
                                    className={`p-2 rounded-full transition-colors ${isListening ? 'bg-red-500 text-white' : 'bg-input text-muted-foreground hover:bg-accent'}`}
                                    title={isListening ? "Stop Voice Input" : "Start Voice Input"}
                                >
                                    <MicIcon size={20} />
                                </button>
                                <button
                                    onClick={() => audioRef.current.pause()} // Stop playback
                                    disabled={!isSpeaking}
                                    className={`p-2 rounded-full transition-colors ${isSpeaking ? 'bg-blue-500 text-white' : 'bg-input text-muted-foreground opacity-50 cursor-not-allowed'}`}
                                    title="Stop Avatar Speaking"
                                >
                                    <VolumeXIcon size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                            {messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`p-3 rounded-lg max-w-[70%] ${
                                        msg.type === 'user'
                                            ? 'bg-purple-600 text-white rounded-br-none'
                                            : 'bg-background-light text-foreground rounded-bl-none'
                                    }`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} /> {/* For auto-scrolling */}
                        </div>

                        <form onSubmit={handleSendMessage} className="mt-6 flex gap-4">
                            <input
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                placeholder="Type your message..."
                                className="flex-grow p-3 rounded-lg bg-input border border-border focus:ring-2 focus:ring-purple-500 outline-none text-foreground"
                                disabled={!wsConnected || !selectedAvatar}
                            />
                            <button
                                type="submit"
                                className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={!inputMessage.trim() || !wsConnected || !selectedAvatar}
                            >
                                <SendIcon size={20} />
                            </button>
                        </form>
                        {!wsConnected && selectedAvatar && (
                             <p className="text-red-400 text-sm mt-2 text-center">Not connected to chat service. Please ensure your backend is running.</p>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                        <MessageCircleIcon size={64} className="mb-4 opacity-50" />
                        <p className="text-xl">Select an avatar from the left to start chatting.</p>
                        {loadingAvatars && <p className="mt-4">Loading your avatars...</p>}
                        {avatars.length === 0 && !loadingAvatars && (
                            <p className="mt-4">You don't have any avatars yet. Create one on the "Create New Avatar" page!</p>
                        )}
                    </div>
                )}
            </section>
        </div>
    );
};

export default ChatWithAvatarPage;