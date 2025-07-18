import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { MessageCircleIcon, MicIcon, UsersIcon, SendIcon, Volume2Icon, VolumeXIcon, PhoneCall, Video, PhoneOff, VideoOff } from 'lucide-react';

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

    const messagesEndRef = useRef(null);
    const audioRef = useRef(new Audio()); // For playing avatar's TTS audio

    const backendWsUrl = import.meta.env.VITE_BACKEND_WS_URL;

    // --- Auto-scrolling Messages ---
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    // --- Audio Playback Handler ---
    useEffect(() => {
        const currentAudioRef = audioRef.current;
        const handleAudioEnded = () => {
            console.log("Avatar finished speaking.");
            setIsSpeaking(false);
            // If we are in an active voice call and the avatar just finished speaking,
            // we should re-enable user's microphone for the next turn.
            if (audioCallActive && !isListening && recognition) {
                console.log("Re-enabling microphone for user input after avatar spoke.");
                recognition.start(); // Restart listening if it was paused
                setIsListening(true);
            }
        };

        currentAudioRef.onended = handleAudioEnded;

        // Cleanup: remove event listener when component unmounts or ref changes
        return () => {
            currentAudioRef.removeEventListener('ended', handleAudioEnded);
        };
    }, [audioCallActive, isListening]); // Depend on audioCallActive and isListening

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
                    // Only set selected avatar if none is selected or current one is no longer in list
                    if (!selectedAvatar || !data.some(a => a.id === selectedAvatar.id)) {
                        setSelectedAvatar(data[0]); // Select first avatar by default
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
    }, [user, supabase, selectedAvatar]); // Re-run if user or selectedAvatar changes

    // --- Text Chat WebSocket Connection Management (/chat) ---
    useEffect(() => {
        const establishTextChatWebSocket = async () => {
            // Close existing text chat WS if it exists and is open
            if (textChatWs && textChatWs.readyState === WebSocket.OPEN) {
                console.log('Closing existing text chat WebSocket connection before re-establishing...');
                textChatWs.close();
                textChatWs = null;
            }

            if (!selectedAvatar || !user || !backendWsUrl) {
                setTextChatWsConnected(false);
                setMessages([]);
                setError(''); // Clear error if no avatar is selected
                return;
            }

            // If a voice call is active, don't establish text chat WS
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

                // Connect to the /chat endpoint for text chat
                textChatWs = new WebSocket(`${backendWsUrl}/chat?token=${session.access_token}&avatarId=${selectedAvatar.id}`);

                textChatWs.onopen = () => {
                    console.log('Text Chat WebSocket connected');
                    setTextChatWsConnected(true);
                    setMessages([{ type: 'avatar', text: `Hello! I am ${selectedAvatar.name}. How can I help you today?` }]);
                    setError(''); // Clear any previous connection errors
                };

                textChatWs.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        if (data.type === 'llm_response_text') { // Expecting text responses from LLM via /chat
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
                    if (event.code !== 1000) { // 1000 is normal closure
                        setError('Text chat connection lost. Please try again.');
                    } else {
                        setError(''); // Clear error on normal close
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

        // Only establish if an avatar is selected AND no voice call is active
        if (selectedAvatar && user && !audioCallActive) {
            establishTextChatWebSocket();
        }

        // Cleanup for this specific WebSocket
        return () => {
            if (textChatWs) {
                console.log('Text Chat WebSocket cleanup: Closing connection.');
                textChatWs.close();
                textChatWs = null;
            }
        };
    }, [selectedAvatar, user, backendWsUrl, supabase, audioCallActive]); // Re-run when audioCallActive changes

    // --- Voice Call WebSocket Connection Management (/voice-chat) ---
    const startVoiceCallWebSocket = useCallback(async () => {
        if (!selectedAvatar || !user || !backendWsUrl) {
            setError('Cannot start voice call: Avatar not selected or user not logged in.');
            return;
        }

        // Close any existing voice call WS before starting a new one
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

            // Immediately close text chat WS if active
            if (textChatWs && textChatWs.readyState === WebSocket.OPEN) {
                console.log('Closing text chat WS as voice call is starting.');
                textChatWs.close();
                textChatWs = null;
                setTextChatWsConnected(false);
            }

            // Connect to the /voice-chat endpoint for voice
            voiceCallWs = new WebSocket(`${backendWsUrl}/voice-chat?token=${session.access_token}&avatarId=${selectedAvatar.id}&voiceUrl=${encodeURIComponent(selectedAvatar.voice_url)}`); // Pass voice_url

            voiceCallWs.onopen = () => {
                console.log('Voice Chat WebSocket connected');
                setVoiceCallWsConnected(true);
                setAudioCallActive(true); // Call is now active
                setError('');
                // The backend will send a 'ready' message when the Python service is initialized
            };

            voiceCallWs.onmessage = async (event) => {
                if (typeof event.data === 'string') {
                    const data = JSON.parse(event.data);
                    console.log('Voice WS text message:', data.type, data);
                    if (data.type === 'ready') {
                        setMessages((prev) => [...prev, { type: 'system', text: `Voice service ready: ${data.message}` }]);
                        // Optionally start listening for user input immediately after ready
                        if (!isListening) {
                            handleVoiceInputToggle(true); // Pass true to force start listening
                        }
                    } else if (data.type === 'llm_response_text') {
                        // Display the LLM's text response in the chat
                        setMessages((prev) => [...prev, { type: 'avatar', text: data.text }]);
                    } else if (data.type === 'speech_start') {
                        setIsSpeaking(true);
                        if (isListening && recognition) {
                             // Temporarily stop listening when avatar speaks
                             console.log("Avatar is speaking, pausing user microphone.");
                             recognition.stop();
                             setIsListening(false);
                        }
                    } else if (data.type === 'speech_end') {
                        // This is handled by audioRef.current.onended, but good to have a fallback
                        setIsSpeaking(false);
                        // handleAudioEnded will restart mic
                    } else if (data.type === 'error' || data.type === 'system') {
                        setError(data.message);
                        setMessages((prev) => [...prev, { type: 'system', text: data.message }]);
                    }
                } else if (event.data instanceof Blob || event.data instanceof ArrayBuffer) {
                    // Handle incoming audio data
                    const audioBlob = event.data instanceof Blob ? event.data : new Blob([event.data], { type: 'audio/wav' }); // Ensure correct type if known
                    const audioUrl = URL.createObjectURL(audioBlob);

                    // Ensure previous audio is stopped and source cleared before playing new
                    if (audioRef.current.src) {
                        URL.revokeObjectURL(audioRef.current.src); // Clean up previous blob URL
                    }
                    audioRef.current.src = audioUrl;
                    audioRef.current.play().catch(e => console.error("Error playing audio:", e));
                }
            };

            voiceCallWs.onclose = (event) => {
                console.log('Voice Chat WebSocket disconnected:', event.code, event.reason);
                setVoiceCallWsConnected(false);
                setAudioCallActive(false); // Turn off audio call state
                setError('Voice call ended.');
                // Ensure mic is off and audio is stopped
                if (recognition) {
                    recognition.stop(); // Stop ongoing recognition
                    setIsListening(false);
                }
                audioRef.current.pause();
                audioRef.current.src = '';
                setIsSpeaking(false);

                // Re-establish text chat WS after voice call ends
                // This useEffect will be triggered by `audioCallActive` becoming false
                // and `selectedAvatar` still being present.
            };

            voiceCallWs.onerror = (err) => {
                console.error('Voice Chat WebSocket error:', err);
                setError('An error occurred with the voice call.');
                if (voiceCallWs && voiceCallWs.readyState === WebSocket.OPEN) {
                    voiceCallWs.close(); // Attempt to close on error
                }
            };

        } catch (err) {
            console.error('Failed to establish voice call WS:', err);
            setError(`Failed to start voice call: ${err.message}`);
        }
    }, [selectedAvatar, user, backendWsUrl, supabase, isListening]);

    const endVoiceCallWebSocket = useCallback(() => {
        if (voiceCallWs) {
            console.log('Ending voice call WebSocket connection.');
            voiceCallWs.send(JSON.stringify({ type: 'end_call' })); // Inform backend to end the call
            voiceCallWs.close(); // This will trigger onclose handler
            voiceCallWs = null; // Clear the ref
            // State updates handled by onclose handler
        }
    }, []);

    // --- Message Sending & Voice Input Logic ---
    const handleSendMessage = (e) => {
        e.preventDefault();
        const messageText = inputMessage.trim();
        if (!messageText || !textChatWsConnected || !selectedAvatar) return;

        setMessages((prev) => [...prev, { type: 'user', text: messageText }]);

        // Send to text chat WebSocket
        textChatWs.send(JSON.stringify({
            type: 'text', // Backend expects 'text' type for text chat
            message: messageText,
        }));

        setInputMessage('');
    };

    // Client-side STT for either "voice message" (via text chat WS) or "voice call input" (via voice call WS)
    // `forVoiceCall` flag determines which WebSocket to use
    const handleVoiceInputToggle = useCallback((forceStart = false) => {
        // If forceStart is true, we want to start listening (e.g., after voice call ready)
        // If isListening is true, we want to stop.
        // If isListening is false, we want to start.
        const shouldListen = forceStart || !isListening;

        if (!shouldListen) { // If currently listening and we want to stop
            if (recognition) {
                recognition.stop();
            }
            setIsListening(false);
            return;
        }

        // If we want to start listening
        if (!('webkitSpeechRecognition' in window)) {
            setError("Web Speech API is not supported by this browser. Please use Chrome or Edge for voice input.");
            setIsListening(false);
            return;
        }

        setError(''); // Clear any previous errors

        // Ensure we're not speaking when starting to listen
        if (isSpeaking) {
            handleStopSpeaking(); // Stop avatar if it's speaking
        }

        if (!recognition) { // Initialize recognition only once
            recognition = new window.webkitSpeechRecognition();
            recognition.continuous = true; // Allow continuous listening until stopped manually
            recognition.interimResults = true; // Show interim results
            recognition.lang = 'en-US';
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

            // Update input message with interim results
            setInputMessage(interimTranscript);

            if (finalTranscript) {
                console.log("Final User said:", finalTranscript);
                setMessages((prev) => [...prev, { type: 'user', text: finalTranscript }]); // Display user's transcribed text
                setInputMessage(''); // Clear interim input

                // Determine which WebSocket to send to based on active connection
                if (audioCallActive && voiceCallWsConnected && voiceCallWs.readyState === WebSocket.OPEN) {
                    // Send to voice chat WebSocket (for real-time conversation)
                    voiceCallWs.send(JSON.stringify({ type: 'user_text', text: finalTranscript }));
                } else if (textChatWsConnected && textChatWs.readyState === WebSocket.OPEN) {
                    // Send to text chat WebSocket (for voice messages within text chat)
                    textChatWs.send(JSON.stringify({ type: 'text', message: finalTranscript }));
                } else {
                    setError("Neither text chat nor voice call is active to send transcribed speech.");
                }

                // If continuous is false, you'd restart recognition here.
                // Since continuous is true, it keeps listening.
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
            // If in an active audio call, and recognition stopped naturally (e.g., due to silence),
            // you might want to restart it after a short delay, or keep it stopped
            // if it's intended to be turn-based and only restarted after avatar speaks.
            // Current `handleAudioEnded` covers restarting after avatar's speech ends.
        };

        recognition.start();

    }, [audioCallActive, voiceCallWsConnected, textChatWsConnected, isListening, isSpeaking]);


    // New: Handle stop speaking command to backend
    const handleStopSpeaking = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = ''; // Clear source to free memory
        }
        setIsSpeaking(false);

        // If voice call is active, tell the backend to stop any ongoing TTS from Python
        if (audioCallActive && voiceCallWs && voiceCallWs.readyState === WebSocket.OPEN) {
            console.log("Sending stop_speaking to voice service.");
            voiceCallWs.send(JSON.stringify({ type: 'stop_speaking' }));
        }
        // If the mic was paused because avatar was speaking, re-enable it
        if (audioCallActive && recognition && !isListening) {
             console.log("Re-enabling microphone after manual stop speaking.");
             recognition.start();
             setIsListening(true);
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
                                onClick={() => {
                                    setSelectedAvatar(avatar);
                                    // When switching avatars, stop any ongoing calls/listening/speaking
                                    if (audioCallActive) endVoiceCallWebSocket();
                                    if (isListening) handleVoiceInputToggle(); // Stop listening
                                    if (isSpeaking) handleStopSpeaking(); // Stop speaking
                                    setMessages([]); // Clear messages for new avatar
                                }}
                                className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors
                                    ${selectedAvatar?.id === avatar.id ? 'bg-primary/20 text-primary font-semibold' : 'bg-input text-muted-foreground hover:bg-accent'}`}
                            >
                                <img src={avatar.image_url || "https://via.placeholder.com/40"} alt={avatar.name} className="w-10 h-10 rounded-full object-cover" />
                                <div>
                                    <p className="text-sm font-medium">{avatar.name}</p>
                                    <p className="text-xs text-muted-foreground">{typeof avatar.personality_data === 'string' ? avatar.personality_data.substring(0, 30) : 'No description'}...</p>
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
                            <img src={selectedAvatar.image_url || "https://via.placeholder.com/60"} alt={selectedAvatar.name} className="w-12 h-12 rounded-full object-cover" />
                            <div>
                                <h3 className="text-2xl font-bold text-foreground">{selectedAvatar.name}</h3>
                                <p className="text-muted-foreground text-sm">{typeof selectedAvatar.personality_data === 'string' ? selectedAvatar.personality_data : 'No description'}</p>
                            </div>
                            <div className="ml-auto flex gap-2">
                                {/* Voice Input Toggle (for Voice Messages in Text Chat OR Voice Call Input) */}
                                <button
                                    onClick={() => handleVoiceInputToggle()}
                                    className={`p-2 rounded-full transition-colors ${isListening ? 'bg-red-500 text-white' : 'bg-input text-muted-foreground hover:bg-accent'}`}
                                    title={isListening ? "Stop Voice Input" : "Start Voice Input"}
                                    // This button is enabled if either text chat or voice call is active
                                    disabled={!selectedAvatar || (!textChatWsConnected && !voiceCallWsConnected)}
                                >
                                    <MicIcon size={20} />
                                </button>
                                {/* Stop Speaking Button (for Voice Chat/Call) */}
                                <button
                                    onClick={handleStopSpeaking}
                                    disabled={!isSpeaking} // Only enable if avatar is currently speaking
                                    className={`p-2 rounded-full transition-colors ${isSpeaking ? 'bg-blue-500 text-white' : 'bg-input text-muted-foreground opacity-50 cursor-not-allowed'}`}
                                    title="Stop Avatar Speaking"
                                >
                                    <VolumeXIcon size={20} />
                                </button>
                                {/* Audio Call Button (connects/disconnects /voice-chat) */}
                                <button
                                    onClick={() => audioCallActive ? endVoiceCallWebSocket() : startVoiceCallWebSocket()}
                                    className={`p-2 rounded-full transition-colors ${audioCallActive ? 'bg-red-500 text-white' : 'bg-input text-muted-foreground hover:bg-accent'}`}
                                    title={audioCallActive ? "End Voice Call" : "Start Voice Call"}
                                    disabled={!selectedAvatar || !user} // Always allow connecting/disconnecting to voice call
                                >
                                    {audioCallActive ? <PhoneOff size={20} /> : <PhoneCall size={20} />}
                                </button>
                                {/* Video Call Button (Still a placeholder) */}
                                <button
                                    onClick={() => { /* Handle video call start/end */ alert("Video call not implemented yet!"); }}
                                    className={`p-2 rounded-full transition-colors bg-input text-muted-foreground hover:bg-accent opacity-50 cursor-not-allowed`}
                                    title="Video Call (Not Implemented)"
                                    disabled={true} // Always disabled for now
                                >
                                    <Video size={20} />
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
                            <div ref={messagesEndRef} />
                        </div>

                        <form onSubmit={handleSendMessage} className="mt-6 flex gap-4">
                            <input
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                placeholder="Type your message..."
                                className="flex-grow p-3 rounded-lg bg-input border border-border focus:ring-2 focus:ring-purple-500 outline-none text-foreground"
                                disabled={!textChatWsConnected || !selectedAvatar || audioCallActive} // Disable if voice call is active
                            />
                            <button
                                type="submit"
                                className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={!inputMessage.trim() || !textChatWsConnected || !selectedAvatar || audioCallActive} // Disable if voice call is active
                            >
                                <SendIcon size={20} />
                            </button>
                        </form>
                        {!textChatWsConnected && selectedAvatar && !audioCallActive && (
                            <p className="text-red-400 text-sm mt-2 text-center">Not connected to text chat service. Ensure backend /chat endpoint is running.</p>
                        )}
                        {audioCallActive && (
                            <p className="text-green-500 text-sm mt-2 text-center">Voice call active. Text input is disabled.</p>
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