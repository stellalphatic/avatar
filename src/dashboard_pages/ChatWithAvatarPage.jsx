import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { MessageCircleIcon, MicIcon, UsersIcon, SendIcon, Volume2Icon, VolumeXIcon, PhoneCall, Video, PhoneOff, VideoOff, Loader2, Bot } from 'lucide-react'; // Added Bot icon for the prompt modal

let textChatWs = null; // WebSocket for text-only chat
let voiceCallWs = null; // WebSocket for real-time voice (STT input, TTS audio output)
let recognition = null; // Client-side STT instance for both voice message and voice call input

const ChatWithAvatarPage = () => {
    const { user, supabase } = useAuth();
    const [avatars, setAvatars] = useState([]);
    const [selectedAvatar, setSelectedAvatar] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [loadingAvatars, setLoadingAvatars] = useState(true);
    const [error, setError] = useState('');
    const [isListening, setIsListening] = useState(false); // For client-side STT
    const [isSpeaking, setIsSpeaking] = useState(false); // If avatar is currently speaking audio
    const [textChatWsConnected, setTextChatWsConnected] = useState(false); // State for text chat WS connection
    const [voiceCallWsConnected, setVoiceCallWsConnected] = useState(false); // State for voice call WS connection
    const [audioCallActive, setAudioCallActive] = useState(false); // New state: true if an active voice call is in progress
    const [selectedLanguage, setSelectedLanguage] = useState('en'); // NEW: State for selected language, default to English
    const [showSystemPromptModal, setShowSystemPromptModal] = useState(false); // NEW: State for showing the system prompt modal

    const messagesEndRef = useRef(null);
    const systemPromptModalRef = useRef(null);

    // --- Web Audio API Refs ---
    const audioContextRef = useRef(null);
    const audioQueueRef = useRef([]); // Queue for ArrayBuffer audio chunks
    const currentSourceNodeRef = useRef(null); // Reference to the currently playing AudioBufferSourceNode
    const nextPlayTimeRef = useRef(0); // When the next audio chunk should start playing

    // Ensure this environment variable is correctly set in your .env (e.g., VITE_BACKEND_WS_URL=ws://localhost:5000)
    const backendWsUrl = import.meta.env.VITE_BACKEND_WS_URL;

    // Supported languages for STT/TTS (must match backend/voice service capabilities)
    const SUPPORTED_CHAT_LANGUAGES = [
        { code: 'en', name: 'English' },
        { code: 'hi', name: 'Hindi' },
        { code: 'es', name: 'Spanish' },
        { code: 'fr', name: 'French' },
        { code: 'de', name: 'German' },
        { code: 'it', name: 'Italian' },
        { code: 'ja', name: 'Japanese' },
        { code: 'ko', name: 'Korean' },
        { code: 'pt', name: 'Portuguese' },
        { code: 'ru', name: 'Russian' },
    ];

    // --- Refs for mutually dependent callback functions ---
    const handleStopSpeakingRef = useRef(null);
    const handleVoiceInputToggleRef = useRef(null);

    // Helper function to truncate text for display
    const truncatePrompt = (text, limit) => {
        if (!text) return 'No description available.';
        return text.length > limit ? text.substring(0, limit) + '...' : text;
    };

    // Close modal if a click occurs outside of it
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (systemPromptModalRef.current && !systemPromptModalRef.current.contains(event.target)) {
                setShowSystemPromptModal(false);
            }
        };
        if (showSystemPromptModal) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showSystemPromptModal]);


    // --- Playback and STT functions using refs ---
    const playNextAudioChunk = useCallback(async () => {
        if (!audioContextRef.current || audioQueueRef.current.length === 0) {
            return;
        }

        // Only proceed if not currently playing or if currentSourceNode has finished
        if (isSpeaking && currentSourceNodeRef.current && audioContextRef.current.currentTime < nextPlayTimeRef.current) {
            return;
        }

        const audioChunk = audioQueueRef.current.shift(); // Get the next chunk from the queue

        try {
            const audioBuffer = await audioContextRef.current.decodeAudioData(audioChunk);
            const source = audioContextRef.current.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContextRef.current.destination);

            const currentTime = audioContextRef.current.currentTime;
            if (nextPlayTimeRef.current < currentTime) {
                nextPlayTimeRef.current = currentTime;
            }
            source.start(nextPlayTimeRef.current);
            nextPlayTimeRef.current += audioBuffer.duration;

            currentSourceNodeRef.current = source;

            setIsSpeaking(true);
            // Pause user mic if avatar starts speaking
            if (isListening && recognition) {
                console.log("Avatar is speaking, pausing user microphone.");
                recognition.stop();
                setIsListening(false);
            }

            source.onended = () => {
                currentSourceNodeRef.current = null;
                if (audioQueueRef.current.length > 0) {
                    playNextAudioChunk();
                } else {
                    console.log("Avatar finished speaking all queued audio.");
                    setIsSpeaking(false);
                    // Re-enable microphone if in an active voice call and not already listening
                    if (audioCallActive && !isListening && recognition && handleVoiceInputToggleRef.current) {
                        console.log("Re-enabling microphone for user input after avatar spoke.");
                        handleVoiceInputToggleRef.current(true); // Call via ref
                    }
                }
            };

        } catch (e) {
            console.error("Error decoding or playing audio chunk:", e);
            setError("Error playing avatar's voice. Please try again.");
            setIsSpeaking(false);
            audioQueueRef.current = [];
            nextPlayTimeRef.current = audioContextRef.current.currentTime;
            if (audioCallActive && !isListening && recognition && handleVoiceInputToggleRef.current) {
                handleVoiceInputToggleRef.current(true); // Call via ref
            }
        }
    }, [audioCallActive, isListening, isSpeaking, audioContextRef, recognition]);


    const handleVoiceInputToggleCallback = useCallback((forceStart = false) => {
        const shouldListen = forceStart || !isListening;

        if (!shouldListen) {
            if (recognition) {
                recognition.stop();
            }
            setIsListening(false);
            return;
        }

        if (!('webkitSpeechRecognition' in window)) {
            setError("Web Speech API is not supported by this browser. Please use Chrome or Edge for voice input.");
            setIsListening(false);
            return;
        }

        setError('');

        // Ensure we're not speaking when starting to listen
        if (isSpeaking && handleStopSpeakingRef.current) { // Call via ref
            handleStopSpeakingRef.current();
        }

        if (!recognition) {
            recognition = new window.webkitSpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = selectedLanguage;
        } else {
            recognition.lang = selectedLanguage;
        }

        recognition.onstart = () => {
            console.log("Started listening for voice input...");
            setIsListening(true);
        };

        recognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }

            setInputMessage(interimTranscript);

            if (finalTranscript) {
                console.log("Final User said:", finalTranscript);
                setMessages((prev) => [...prev, { type: 'user', text: finalTranscript }]);
                setInputMessage('');

                if (voiceCallWs && voiceCallWs.readyState === WebSocket.OPEN) {
                    voiceCallWs.send(JSON.stringify({ type: 'user_text', text: finalTranscript }));
                } else if (textChatWs && textChatWs.readyState === WebSocket.OPEN) {
                    textChatWs.send(JSON.stringify({ type: 'text', message: finalTranscript }));
                } else {
                    setError("Neither text chat nor voice call is active to send transcribed speech.");
                }
            }
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            setError(`Speech recognition error: ${event.error}. Please ensure microphone access.`);
            setIsListening(false);
            if (recognition) {
                recognition.stop();
            }
        };

        recognition.onend = () => {
            console.log("Speech recognition ended.");
            setIsListening(false);
            if (audioCallActive && !isSpeaking && !isListening && recognition && handleVoiceInputToggleRef.current) { // Call via ref
                console.log("Recognition ended naturally, restarting for continuous voice call.");
                recognition.start();
                setIsListening(true);
            }
        };

        recognition.start();

    }, [audioCallActive, voiceCallWsConnected, textChatWsConnected, isListening, isSpeaking, selectedLanguage]);


    const handleStopSpeakingCallback = useCallback(() => {
        if (currentSourceNodeRef.current) {
            currentSourceNodeRef.current.stop();
            currentSourceNodeRef.current.disconnect();
            currentSourceNodeRef.current = null;
        }
        audioQueueRef.current = [];
        nextPlayTimeRef.current = audioContextRef.current ? audioContextRef.current.currentTime : 0;
        setIsSpeaking(false);

        if (audioCallActive && voiceCallWs && voiceCallWs.readyState === WebSocket.OPEN) {
            console.log("Sending stop_speaking to voice service.");
            voiceCallWs.send(JSON.stringify({ type: 'stop_speaking' }));
        }
        if (audioCallActive && recognition && !isListening && handleVoiceInputToggleRef.current) { // Call via ref
            console.log("Re-enabling microphone after manual stop speaking.");
            handleVoiceInputToggleRef.current(true);
        }
    }, [audioCallActive, voiceCallWs, isListening, recognition, audioContextRef]);

    // Assign callback functions to their refs after they are defined
    useEffect(() => {
        handleVoiceInputToggleRef.current = handleVoiceInputToggleCallback;
        handleStopSpeakingRef.current = handleStopSpeakingCallback;
    }, [handleVoiceInputToggleCallback, handleStopSpeakingCallback]);


    // --- Auto-scrolling Messages ---
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    // --- Web Audio API Initialization and Cleanup ---
    useEffect(() => {
        if (audioCallActive && !audioContextRef.current) {
            try {
                audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
                console.log("AudioContext initialized.");
                nextPlayTimeRef.current = audioContextRef.current.currentTime;
            } catch (e) {
                console.error("Error initializing AudioContext:", e);
                setError("Audio playback not supported or blocked by browser.");
            }
        }

        return () => {
            if (audioContextRef.current) {
                console.log("Closing AudioContext.");
                audioContextRef.current.close().then(() => {
                    audioContextRef.current = null;
                }).catch(e => console.error("Error closing AudioContext:", e));
            }
            audioQueueRef.current = [];
            nextPlayTimeRef.current = 0;
            if (currentSourceNodeRef.current) {
                currentSourceNodeRef.current.stop();
                currentSourceNodeRef.current.disconnect();
                currentSourceNodeRef.current = null;
            }
        };
    }, [audioCallActive]);


    // Effect to trigger playback when queue changes or speaking state allows
    useEffect(() => {
        if (!isSpeaking && audioQueueRef.current.length > 0) {
            playNextAudioChunk();
        }
    }, [audioQueueRef.current.length, isSpeaking, playNextAudioChunk]);


    // --- Data Fetching for Avatars ---
    useEffect(() => {
        const fetchUserAvatars = async () => {
            setLoadingAvatars(true);
            setError('');
            try {
                if (!user) {
                    setError('Please log in to chat with avatars.');
                    return;
                }
                const { data, error: fetchError } = await supabase
                    .from('avatars')
                    .select('*')
                    .eq('user_id', user.id);

                if (fetchError) throw fetchError;
                setAvatars(data);
                if (data.length > 0) {
                    if (!selectedAvatar || !data.some(a => a.id === selectedAvatar.id)) {
                        setSelectedAvatar(data[0]);
                    }
                } else {
                    setSelectedAvatar(null);
                }
            } catch (err) {
                console.error('Error fetching avatars:', err.message);
                setError(`Failed to load your avatars: ${err.message}`);
            } finally {
                setLoadingAvatars(false);
            }
        };

        if (user) {
            fetchUserAvatars();
        } else {
            setLoadingAvatars(false);
            setError('Please log in to chat with avatars.');
        }
    }, [user, supabase, selectedAvatar]);

    // --- Text Chat WebSocket Connection Management (/chat) ---
    useEffect(() => {
        const establishTextChatWebSocket = async () => {
            if (textChatWs && textChatWs.readyState === WebSocket.OPEN) {
                console.log('Closing existing text chat WebSocket connection before re-establishing...');
                textChatWs.close();
                textChatWs = null;
            }

            if (!selectedAvatar || !user || !backendWsUrl) {
                setTextChatWsConnected(false);
                setMessages([]);
                setError('');
                return;
            }

            if (audioCallActive) {
                console.log('Voice call is active, deferring text chat WS connection.');
                setTextChatWsConnected(false);
                return;
            }

            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) {
                    setError('No active session. Cannot establish text chat connection.');
                    return;
                }

                textChatWs = new WebSocket(`${backendWsUrl}/chat?token=${session.access_token}&avatarId=${selectedAvatar.id}`);

                textChatWs.onopen = () => {
                    console.log('Text Chat WebSocket connected');
                    setTextChatWsConnected(true);
                    setMessages([{ type: 'avatar', text: `Hello! I am ${selectedAvatar.name}. How can I help you today?` }]);
                    setError('');
                };

                textChatWs.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        if (data.type === 'llm_response_text') {
                            setMessages((prev) => [...prev, { type: 'avatar', text: data.text }]);
                        } else if (data.type === 'error' || data.type === 'system') {
                            setError(data.message);
                            setMessages((prev) => [...prev, { type: 'system', text: data.message }]);
                        } else {
                            console.warn('Unknown message type received on text chat WS:', data.type, data);
                        }
                    } catch (e) {
                        console.error('Error parsing text chat WS message:', e);
                    }
                };

                textChatWs.onclose = (event) => {
                    console.log('Text Chat WebSocket disconnected:', event.code, event.reason);
                    setTextChatWsConnected(false);
                    if (event.code !== 1000) {
                        setError('Text chat connection lost. Please try again.');
                    } else {
                        setError('');
                    }
                };

                textChatWs.onerror = (err) => {
                    console.error('Text Chat WebSocket error:', err);
                    setError('An error occurred with the text chat connection.');
                    if (textChatWs && textChatWs.readyState === WebSocket.OPEN) {
                        textChatWs.close();
                    }
                };

            } catch (err) {
                console.error("Failed to get session for text chat WS:", err);
                setError("Authentication error for text chat connection.");
            }
        };

        if (selectedAvatar && user && !audioCallActive) {
            establishTextChatWebSocket();
        }

        return () => {
            if (textChatWs) {
                console.log('Text Chat WebSocket cleanup: Closing connection.');
                textChatWs.close();
                textChatWs = null;
            }
        };
    }, [selectedAvatar, user, backendWsUrl, supabase, audioCallActive]);

    // --- Voice Call WebSocket Connection Management (/voice-chat) ---
    const startVoiceCallWebSocket = useCallback(async () => {
        if (!selectedAvatar || !user || !backendWsUrl) {
            setError('Cannot start voice call: Avatar not selected or user not logged in.');
            return;
        }

        if (voiceCallWs && voiceCallWs.readyState === WebSocket.OPEN) {
            console.log('Closing existing voice call WebSocket before starting new one...');
            voiceCallWs.close();
            voiceCallWs = null;
        }

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                setError('No active session. Cannot establish voice call connection.');
                return;
            }

            if (textChatWs && textChatWs.readyState === WebSocket.OPEN) {
                console.log('Closing text chat WS as voice call is starting.');
                textChatWs.close();
                textChatWs = null;
                setTextChatWsConnected(false);
            }

            voiceCallWs = new WebSocket(`${backendWsUrl}/voice-chat?token=${session.access_token}&avatarId=${selectedAvatar.id}&voiceUrl=${encodeURIComponent(selectedAvatar.voice_url)}&language=${selectedLanguage}`);

            voiceCallWs.binaryType = 'arraybuffer';

            voiceCallWs.onopen = () => {
                console.log('Voice Chat WebSocket connected');
                setVoiceCallWsConnected(true);
                setAudioCallActive(true);
                setError('');
            };

            voiceCallWs.onmessage = async (event) => {
                if (typeof event.data === 'string') {
                    const data = JSON.parse(event.data);
                    console.log('Voice WS text message:', data.type, data);
                    if (data.type === 'ready') {
                        setMessages((prev) => [...prev, { type: 'system', text: `Voice service ready: ${data.message}` }]);
                        if (!isListening && handleVoiceInputToggleRef.current) { // Call via ref
                            handleVoiceInputToggleRef.current(true);
                        }
                    } else if (data.type === 'llm_response_text') {
                        setMessages((prev) => [...prev, { type: 'avatar', text: data.text }]);
                    } else if (data.type === 'speech_start') {
                        setIsSpeaking(true);
                        if (isListening && recognition) {
                            console.log("Avatar is speaking, pausing user microphone.");
                            recognition.stop();
                            setIsListening(false);
                        }
                    } else if (data.type === 'speech_end') {
                        if (audioQueueRef.current.length === 0 && !currentSourceNodeRef.current) {
                            setIsSpeaking(false);
                            if (audioCallActive && !isListening && recognition && handleVoiceInputToggleRef.current) { // Call via ref
                                console.log("Re-enabling microphone for user input after avatar spoke.");
                                recognition.start();
                                setIsListening(true);
                            }
                        }
                    } else if (data.type === 'error' || data.type === 'system') {
                        setError(data.message);
                        setMessages((prev) => [...prev, { type: 'system', text: data.message }]);
                    }
                } else if (event.data instanceof ArrayBuffer) {
                    audioQueueRef.current.push(event.data);
                    if (!isSpeaking && audioQueueRef.current.length === 1) {
                        playNextAudioChunk();
                    }
                } else if (event.data instanceof Blob) {
                    try {
                        const arrayBuffer = await event.data.arrayBuffer();
                        audioQueueRef.current.push(arrayBuffer);
                        if (!isSpeaking && audioQueueRef.current.length === 1) {
                            playNextAudioChunk();
                        }
                    } catch (e) {
                        console.error("Error converting Blob to ArrayBuffer:", e);
                    }
                } else {
                    console.warn('Unhandled message type from Python service:', typeof event.data, event.data);
                }
            };

            voiceCallWs.onclose = (event) => {
                console.log('Voice Chat WebSocket disconnected:', event.code, event.reason);
                setVoiceCallWsConnected(false);
                setAudioCallActive(false);
                setError('Voice call ended.');

                if (currentSourceNodeRef.current) {
                    currentSourceNodeRef.current.stop();
                    currentSourceNodeRef.current.disconnect();
                    currentSourceNodeRef.current = null;
                }
                audioQueueRef.current = [];
                nextPlayTimeRef.current = 0;
                setIsSpeaking(false);

                if (recognition) {
                    recognition.stop();
                    setIsListening(false);
                }
            };

            voiceCallWs.onerror = (err) => {
                console.error('Voice Chat WebSocket error:', err);
                setError('An error occurred with the voice call.');
                if (voiceCallWs && voiceCallWs.readyState === WebSocket.OPEN) {
                    voiceCallWs.close();
                }
            };

        } catch (err) {
            console.error('Failed to establish voice call WS:', err);
            setError(`Failed to start voice call: ${err.message}`);
        }
    }, [selectedAvatar, user, backendWsUrl, supabase, isListening, isSpeaking, playNextAudioChunk, selectedLanguage]);

    const endVoiceCallWebSocket = useCallback(() => {
        if (voiceCallWs) {
            console.log('Ending voice call WebSocket connection.');
            voiceCallWs.send(JSON.stringify({ type: 'end_call' }));
            voiceCallWs.close();
            voiceCallWs = null;
        }
    }, []);

    // --- Message Sending & Voice Input Logic ---
    const handleSendMessage = (e) => {
        e.preventDefault();
        const messageText = inputMessage.trim();
        if (!messageText || !textChatWsConnected || !selectedAvatar) return;

        setMessages((prev) => [...prev, { type: 'user', text: messageText }]);

        textChatWs.send(JSON.stringify({
            type: 'text',
            message: messageText,
        }));

        setInputMessage('');
    };

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8">
            {/* Page Title for Mobile */}
            <h2 className="text-3xl sm:text-4xl font-extrabold text-center mb-6 lg:hidden">
                Chat with Avatar
            </h2>

            {/* Error Display */}
            {error && (
                <div className="bg-red-500/20 text-red-400 p-4 rounded-xl mb-6 text-center shadow-md border border-red-500">
                    {error}
                </div>
            )}

            {/* Main Content Area */}
            <aside className="w-full lg:w-1/4 bg-card p-6 rounded-xl shadow-lg border border-border mb-6 lg:mb-0 lg:mr-8 flex-shrink-0 flex flex-col">
                <h3 className="text-xl font-bold text-foreground mb-5 flex items-center gap-3">
                    <UsersIcon size={22} className="text-primary" /> Your Avatars
                </h3>
                {loadingAvatars ? (
                    <div className="flex flex-col items-center justify-center h-full min-h-[150px]">
                        <Loader2 className="animate-spin text-primary mb-3" size={32} />
                        <p className="text-muted-foreground">Loading avatars...</p>
                    </div>
                ) : avatars.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full min-h-[150px] text-center">
                        <p className="text-muted-foreground">No avatars found.</p>
                        <p className="text-muted-foreground text-sm mt-1">Create one to start chatting!</p>
                    </div>
                ) : (
                    <div className="space-y-4 overflow-y-auto custom-scrollbar flex-grow">
                        {avatars.map((avatar) => (
                            <button
                                key={avatar.id}
                                onClick={() => {
                                    setSelectedAvatar(avatar);
                                    if (audioCallActive) endVoiceCallWebSocket();
                                    if (isListening && handleVoiceInputToggleRef.current) handleVoiceInputToggleRef.current(); // Call via ref
                                    if (isSpeaking && handleStopSpeakingRef.current) handleStopSpeakingRef.current(); // Call via ref
                                    setMessages([]); // Clear messages on avatar change
                                }}
                                className={`w-full text-left p-4 rounded-lg flex items-center gap-4 transition-all duration-200 ease-in-out transform
                                    ${selectedAvatar?.id === avatar.id
                                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md scale-[1.02] border border-purple-400'
                                        : 'bg-background-light text-foreground hover:bg-accent hover:shadow-sm border border-border'
                                    }
                                    focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-card
                                `}
                            >
                                <img
                                    src={avatar.image_url || "https://placehold.co/50x50/7e22ce/ffffff?text=AV"}
                                    alt={avatar.name}
                                    className="w-12 h-12 rounded-full object-cover border-2 border-white/50 shadow-sm"
                                />
                                <div className="flex-1">
                                    <p className={`text-base font-medium ${selectedAvatar?.id === avatar.id ? 'text-white' : 'text-foreground'}`}>{avatar.name}</p>
                                    <p className={`text-xs ${selectedAvatar?.id === avatar.id ? 'text-purple-100' : 'text-muted-foreground'}`}>
                                        {truncatePrompt(avatar.system_prompt || avatar.persona_role, 40)}
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </aside>

            <section className="flex-1 bg-card p-6 rounded-xl shadow-lg border border-border flex flex-col h-[calc(100vh-16rem)] sm:h-[calc(100vh-12rem)] lg:h-[calc(100vh-8rem)]">
                {selectedAvatar ? (
                    <>
                        {/* Chat Header */}
                        <div className="flex items-center gap-4 mb-6 pb-4 border-b border-border">
                            <img
                                src={selectedAvatar.image_url || "https://placehold.co/60x60/7e22ce/ffffff?text=AV"}
                                alt={selectedAvatar.name}
                                className="w-14 h-14 rounded-full object-cover border-2 border-primary/50 shadow-md"
                                onClick={() => setShowSystemPromptModal(true)} // Click image to open modal
                            />
                            <div className="flex-1 cursor-pointer" onClick={() => setShowSystemPromptModal(true)}>
                                <h3 className="text-2xl font-bold text-foreground">{selectedAvatar.name}</h3>
                                <p className="text-muted-foreground text-sm hover:underline">
                                    {truncatePrompt(selectedAvatar.system_prompt || selectedAvatar.persona_role, 70)}
                                </p>
                            </div>
                            <div className="ml-auto flex flex-wrap justify-end gap-3"> {/* Use flex-wrap for responsiveness */}
                                {/* Language Selector */}
                                <select
                                    value={selectedLanguage}
                                    onChange={(e) => {
                                        setSelectedLanguage(e.target.value);
                                        if (audioCallActive) {
                                            endVoiceCallWebSocket();
                                            setTimeout(() => startVoiceCallWebSocket(), 500); // Reconnect voice call with new language
                                        }
                                    }}
                                    className="p-2 rounded-lg bg-input text-foreground border border-border focus:ring-2 focus:ring-purple-500 outline-none
                                               hover:bg-accent transition-colors text-sm sm:text-base"
                                    title="Select Language"
                                >
                                    {SUPPORTED_CHAT_LANGUAGES.map(lang => (
                                        <option key={lang.code} value={lang.code}>{lang.name}</option>
                                    ))}
                                </select>

                                {/* Voice Input Toggle (for Voice Messages in Text Chat OR Voice Call Input) */}
                                <button
                                    onClick={() => handleVoiceInputToggleRef.current()} // Call via ref
                                    className={`p-3 rounded-full transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95 shadow-md
                                        ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-background-light text-muted-foreground hover:bg-accent'}`}
                                    title={isListening ? "Stop Voice Input" : "Start Voice Input"}
                                    disabled={!selectedAvatar || (!textChatWsConnected && !voiceCallWsConnected)}
                                >
                                    <MicIcon size={20} />
                                </button>
                                {/* Stop Speaking Button (for Voice Chat/Call) */}
                                <button
                                    onClick={() => handleStopSpeakingRef.current()} // Call via ref
                                    disabled={!isSpeaking}
                                    className={`p-3 rounded-full transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95 shadow-md
                                        ${isSpeaking ? 'bg-blue-500 text-white' : 'bg-background-light text-muted-foreground opacity-50 cursor-not-allowed'}`}
                                    title="Stop Avatar Speaking"
                                >
                                    <VolumeXIcon size={20} />
                                </button>
                                {/* Audio Call Button (connects/disconnects /voice-chat) */}
                                <button
                                    onClick={() => audioCallActive ? endVoiceCallWebSocket() : startVoiceCallWebSocket()}
                                    className={`p-3 rounded-full transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95 shadow-md
                                        ${audioCallActive ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white' : 'bg-background-light text-muted-foreground hover:bg-accent'}`}
                                    title={audioCallActive ? "End Voice Call" : "Start Voice Call"}
                                    disabled={!selectedAvatar || !user}
                                >
                                    {audioCallActive ? <PhoneOff size={20} /> : <PhoneCall size={20} />}
                                </button>
                                {/* Video Call Button (Still a placeholder) */}
                                <button
                                    onClick={() => { /* Handle video call start/end */ alert("Video call not implemented yet!"); }}
                                    className={`p-3 rounded-full transition-all duration-200 ease-in-out transform shadow-md
                                        bg-background-light text-muted-foreground opacity-50 cursor-not-allowed`}
                                    title="Video Call (Not Implemented)"
                                    disabled={true}
                                >
                                    <Video size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Chat Messages Area */}
                        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar pb-4">
                            {messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`p-3 rounded-xl max-w-[80%] sm:max-w-[70%] shadow-md text-sm sm:text-base
                                        ${msg.type === 'user'
                                            ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-br-none'
                                            : 'bg-background-light text-foreground rounded-bl-none border border-border'
                                        }`}
                                    >
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Message Input Form */}
                        <form onSubmit={handleSendMessage} className="mt-6 flex gap-4">
                            <input
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                placeholder={audioCallActive ? "Voice call active..." : "Type your message..."}
                                className="flex-grow p-3 rounded-xl bg-input border border-border focus:ring-2 focus:ring-purple-500 outline-none text-foreground
                                           placeholder:text-muted-foreground transition-all duration-200"
                                disabled={!textChatWsConnected || !selectedAvatar || audioCallActive}
                            />
                            <button
                                type="submit"
                                className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700
                                           transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                                disabled={!inputMessage.trim() || !textChatWsConnected || !selectedAvatar || audioCallActive}
                            >
                                <SendIcon size={20} />
                            </button>
                        </form>
                        {!textChatWsConnected && selectedAvatar && !audioCallActive && (
                            <p className="text-red-400 text-xs sm:text-sm mt-2 text-center">Not connected to text chat service. Ensure backend /chat endpoint is running.</p>
                        )}
                        {audioCallActive && (
                            <p className="text-green-500 text-xs sm:text-sm mt-2 text-center">Voice call active. Text input is disabled.</p>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-center p-4">
                        <MessageCircleIcon size={80} className="mb-6 opacity-30" />
                        <p className="text-xl font-semibold mb-2">Select an avatar to start chatting!</p>
                        <p className="text-base">Choose an avatar from the left sidebar to begin your conversation.</p>
                        {loadingAvatars && (
                            <div className="mt-6 flex items-center gap-2 text-primary">
                                <Loader2 className="animate-spin" size={20} />
                                <p>Loading your avatars...</p>
                            </div>
                        )}
                        {avatars.length === 0 && !loadingAvatars && user && (
                            <p className="mt-4 text-base">You don't have any avatars yet. <span className="text-primary font-medium">Create one</span> to get started!</p>
                        )}
                        {!user && !loadingAvatars && (
                            <p className="mt-4 text-base text-red-400">Please log in to view and chat with avatars.</p>
                        )}
                    </div>
                )}
            </section>
            
            {/* Full System Prompt Modal */}
            {showSystemPromptModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/50">
                    <div
                        ref={systemPromptModalRef}
                        className="bg-card rounded-2xl p-6 shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto relative transform transition-all duration-300 scale-100 border border-border"
                    >
                        <button
                            onClick={() => setShowSystemPromptModal(false)}
                            className="absolute top-3 right-3 p-2 rounded-full text-muted-foreground hover:bg-accent transition-colors"
                            aria-label="Close"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 6 6 18"></path>
                                <path d="m6 6 12 12"></path>
                            </svg>
                        </button>
                        <h3 className="text-xl font-bold mb-4 text-foreground flex items-center gap-2">
                            <Bot size={22} /> System Prompt for {selectedAvatar.name}
                        </h3>
                        <pre className="whitespace-pre-wrap text-sm text-foreground bg-background p-4 rounded-xl border border-border">
                            {selectedAvatar.system_prompt || 'No system prompt available.'}
                        </pre>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatWithAvatarPage;
