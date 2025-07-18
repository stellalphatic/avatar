// Frontend: src/components/VoiceChat.js or similar
import React, { useState, useEffect, useRef } from 'react';
import './VoiceChat.css'; // Assuming some basic CSS for styling
import { Howl } from 'howler'; // For playing audio chunks efficiently

// Make sure you've installed Howler: npm install howler

// Use import.meta.env for Vite environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'; // Your Node.js backend URL

function VoiceChat({ userId, avatarId, avatarData }) {
    const [isListening, setIsListening] = useState(false);
    const [transcribedText, setTranscribedText] = useState('');
    const [responseText, setResponseText] = useState('');
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [wsConnected, setWsConnected] = useState(false);
    const [error, setError] = useState(null);

    const recognitionRef = useRef(null); // For Web Speech API
    const audioContextRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioQueueRef = useRef([]); // Queue for incoming audio chunks
    const isPlayingRef = useRef(false); // Flag to prevent multiple concurrent plays
    const audioSourceRef = useRef(null); // Current audio source node
    const wsRef = useRef(null); // WebSocket connection to Node.js backend

    // --- WebSocket Connection to Node.js Backend ---
    useEffect(() => {
        if (!userId || !avatarId) {
            setError("User ID or Avatar ID is missing. Cannot establish WebSocket.");
            return;
        }

        const connectWebSocket = () => {
            console.log(`Attempting to connect to WS at: ws://${new URL(API_BASE_URL).host}`);
            wsRef.current = new WebSocket(`ws://${new URL(API_BASE_URL).host}/chat`);

            wsRef.current.onopen = () => {
                console.log('WebSocket connected to Node.js backend');
                setWsConnected(true);
                setError(null);
                // Send initialization message to Node.js backend
                wsRef.current.send(JSON.stringify({
                    type: 'init',
                    userId: userId,
                    avatarId: avatarId, // Pass avatarId to backend for voice_url lookup
                    // voice_clone_url is now managed by the backend
                }));
            };

            wsRef.current.onmessage = (event) => {
                try {
                    // Node.js backend sends JSON messages for control
                    if (typeof event.data === 'string') {
                        const message = JSON.parse(event.data);
                        if (message.type === 'response_text') {
                            setResponseText(message.text);
                        } else if (message.type === 'speech_start') {
                            console.log("Backend signaled speech start.");
                            setIsSpeaking(true);
                        } else if (message.type === 'speech_end') {
                            console.log("Backend signaled speech end.");
                            setIsSpeaking(false);
                            // Ensure queue is played out completely or stopped
                            if (isPlayingRef.current) {
                                // If currently playing, let it finish naturally from queue
                            } else {
                                // If not playing, clear queue and ensure no lingering state
                                audioQueueRef.current = [];
                            }
                        } else if (message.type === 'error') {
                            setError(`Backend Error: ${message.message}`);
                            console.error('Backend Error:', message.message);
                        } else if (message.type === 'ready') {
                            console.log('Backend and Voice Service ready for interaction.');
                            // This signals that the entire chain is ready.
                        }
                    } else if (event.data instanceof Blob) {
                        // Binary audio data from Node.js (streamed from Python service)
                        audioQueueRef.current.push(event.data);
                        if (!isPlayingRef.current) {
                            playNextAudioChunk();
                        }
                    } else if (event.data instanceof ArrayBuffer) {
                        // Binary audio data from Node.js (streamed from Python service)
                        // Convert ArrayBuffer to Blob for consistent handling
                        const audioBlob = new Blob([event.data], { type: 'audio/mpeg' }); // Assuming MP3 or similar
                        audioQueueRef.current.push(audioBlob);
                        if (!isPlayingRef.current) {
                            playNextAudioChunk();
                        }
                    }
                } catch (e) {
                    console.error("Error parsing WebSocket message:", e, event.data);
                    setError(`WebSocket data error: ${e.message}`);
                }
            };

            wsRef.current.onclose = (event) => {
                console.log('WebSocket disconnected:', event.code, event.reason);
                setWsConnected(false);
                setError(`WebSocket disconnected: ${event.reason || event.code}. Attempting to reconnect...`);
                // Attempt to reconnect after a delay
                setTimeout(connectWebSocket, 3000);
            };

            wsRef.current.onerror = (err) => {
                console.error('WebSocket error:', err);
                setError(`WebSocket connection error: ${err.message || 'Unknown error'}`);
                wsRef.current.close(); // Close to trigger onclose and reconnect
            };
        };

        connectWebSocket();

        // Cleanup on unmount
        return () => {
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                wsRef.current.close();
            }
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                mediaRecorderRef.current.stop();
            }
            // Clear any lingering audio
            if (isPlayingRef.current && audioSourceRef.current) {
                audioSourceRef.current.stop();
            }
            audioQueueRef.current = [];
        };
    }, [userId, avatarId]); // avatarData is not needed for WS connection logic anymore

    // --- Audio Playback Queue Logic ---
    const playNextAudioChunk = async () => {
        if (audioQueueRef.current.length > 0 && !isPlayingRef.current) {
            isPlayingRef.current = true;
            const chunk = audioQueueRef.current.shift(); // Get the next chunk

            try {
                if (!audioContextRef.current) {
                    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
                }

                // Decode audio data
                const arrayBuffer = await chunk.arrayBuffer();
                const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);

                audioSourceRef.current = audioContextRef.current.createBufferSource();
                audioSourceRef.current.buffer = audioBuffer;
                audioSourceRef.current.connect(audioContextRef.current.destination);

                audioSourceRef.current.onended = () => {
                    // When a chunk finishes playing, try to play the next one
                    isPlayingRef.current = false;
                    // Only continue playing if still in an 'isSpeaking' state or if there are more chunks
                    // and 'speech_end' hasn't been received yet.
                    if (audioQueueRef.current.length > 0) {
                        playNextAudioChunk();
                    } else {
                        // If queue is empty, and backend signaled speech_end, then really stop.
                        // Otherwise, wait for more chunks.
                        if (!isSpeaking) { // This implies speech_end was received
                             // Final cleanup after last chunk of the current utterance
                            console.log("All queued audio played. Stopping.");
                        }
                    }
                };

                audioSourceRef.current.start(0); // Play immediately
            } catch (error) {
                console.error("Error playing audio chunk:", error);
                setError(`Audio playback error: ${error.message}`);
                isPlayingRef.current = false; // Reset flag to try next chunk
                if (audioQueueRef.current.length > 0) {
                    playNextAudioChunk(); // Try playing the next one
                }
            }
        } else if (audioQueueRef.current.length === 0 && !isSpeaking) {
            // If no more chunks and backend signaled speech_end, ensure playback stops
            isPlayingRef.current = false;
            if (audioSourceRef.current) {
                try {
                    audioSourceRef.current.stop(); // Ensure any residual playback is stopped
                    audioSourceRef.current.disconnect();
                } catch (e) {
                    console.warn("Could not stop audio source cleanly:", e);
                }
                audioSourceRef.current = null;
            }
        }
    };


    // --- Web Speech API (STT) Logic ---
    useEffect(() => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            setError("Web Speech API is not supported in this browser.");
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false; // Process one utterance at a time
        recognitionRef.current.interimResults = false; // Only send final results
        recognitionRef.current.lang = 'en-US'; // Or dynamically set based on user preference

        recognitionRef.current.onstart = () => {
            console.log('Speech recognition started');
            setIsListening(true);
            setError(null);
        };

        recognitionRef.current.onresult = (event) => {
            const transcript = Array.from(event.results)
                .map(result => result[0])
                .map(result => result.transcript)
                .join('');
            console.log('Transcribed:', transcript);
            setTranscribedText(transcript);

            if (wsConnected && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                wsRef.current.send(JSON.stringify({ type: 'user_text_input', text: transcript }));
            } else {
                setError("WebSocket not connected. Cannot send transcribed text to backend.");
            }
        };

        recognitionRef.current.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            setError(`Speech recognition error: ${event.error}`);
            setIsListening(false);
            if (event.error === 'no-speech') {
                console.warn("No speech detected.");
            } else if (event.error === 'not-allowed') {
                console.error("Microphone access denied.");
                alert("Please allow microphone access to use voice chat.");
            }
        };

        recognitionRef.current.onend = () => {
            console.log('Speech recognition ended');
            setIsListening(false);
        };

        // Clean up
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
                recognitionRef.current = null;
            }
        };
    }, [wsConnected]); // Depend on wsConnected to ensure we can send data

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            setTranscribedText('');
            setResponseText('');
            setError(null);
            audioQueueRef.current = []; // Clear queue before new interaction
            if (isPlayingRef.current && audioSourceRef.current) {
                audioSourceRef.current.stop();
                audioSourceRef.current.disconnect();
                audioSourceRef.current = null;
            }
            isPlayingRef.current = false;
            setIsSpeaking(false); // Reset speaking state
            recognitionRef.current?.start();
        }
    };

    // Emergency Stop Function (e.g., for a 'Stop' button)
    const stopPlaybackAndRecognition = () => {
        if (isListening) {
            recognitionRef.current?.stop();
        }
        if (isPlayingRef.current && audioSourceRef.current) {
            audioSourceRef.current.stop();
            audioSourceRef.current.disconnect();
            audioSourceRef.current = null;
        }
        audioQueueRef.current = [];
        isPlayingRef.current = false;
        setIsSpeaking(false);
        // Optionally send a stop signal to backend
        if (wsConnected && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'stop_speaking' }));
        }
        console.log("Force stopped all audio and recognition.");
    };


    return (
        <div className="voice-chat-container">
            <h2>Voice Chat with Avatar: {avatarData?.name || 'Loading...'}</h2>
            {error && <p className="error-message">Error: {error}</p>}
            {!wsConnected && <p className="status-message">Connecting to backend...</p>}
            {wsConnected && <p className="status-message">Connected!</p>}

            <div className="chat-interface">
                <p><strong>You:</strong> {transcribedText}</p>
                <p><strong>Avatar:</strong> {responseText}</p>

                <button
                    onClick={toggleListening}
                    disabled={!wsConnected || isSpeaking}
                    className={`voice-button ${isListening ? 'listening' : ''}`}
                >
                    {isListening ? 'Listening...' : 'Hold to Speak'}
                </button>
                <button
                    onClick={stopPlaybackAndRecognition}
                    disabled={!isListening && !isSpeaking && audioQueueRef.current.length === 0}
                    className="stop-button"
                >
                    Stop All
                </button>
                {isSpeaking && <p className="status-message">Avatar is speaking...</p>}
            </div>

            {/* Display debug info */}
            <div className="debug-info">
                <p>WS Status: {wsConnected ? 'Connected' : 'Disconnected'}</p>
                <p>Is Listening: {isListening ? 'Yes' : 'No'}</p>
                <p>Is Speaking: {isSpeaking ? 'Yes' : 'No'}</p>
                <p>Audio Queue Size: {audioQueueRef.current.length}</p>
            </div>
        </div>
    );
}

export default VoiceChat;