import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone,
  X,
  Mic,
  MicOff,
  Loader2,
  PhoneOff,
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { Room, RoomEvent } from "livekit-client";

const AvatarWidget = () => {
  const { theme } = useTheme();
  const [isMinimized, setIsMinimized] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [error, setError] = useState("");

  // Transcript state
  const [messages, setMessages] = useState([]);
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);

  const roomRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startCall = async () => {
    try {
      setIsConnecting(true);
      setError("");

      // --- CRITICAL FIX: Enhanced Audio Processing ---
      // Enable noise suppression and echo cancellation to filter background noise
      await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_API_URL}/demo/start-call`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            agent_type: "standard",
            voice_name: "female-1",
            language: "en",
            persona_id: "DEMO002",
            custom_greeting:
              "Hi! I'm your MetaPresence assistant. How can I help you today?",
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to start call");
      const { data } = await response.json();

      // const room = new Room({ adaptiveStream: true, dynacast: true });

      const room = new Room({
        adaptiveStream: true,
        dynacast: true,
        // Publish options with audio processing
        publishDefaults: {
          audioPreset: {
            maxBitrate: 32000,
          },
          dtx: true, // Discontinuous Transmission to save bandwidth on silence
          red: true, // Redundant Audio Data for packet loss recovery
        },
      });

      roomRef.current = room;

      room.on(RoomEvent.Connected, () => {
        setIsConnected(true);
        setIsConnecting(false);
        setMessages([
          {
            sender: "assistant",
            text: data.metadata.custom_greeting || "Hello!",
            timestamp: new Date(),
            isFinal: true,
          },
        ]);
      });

      room.on(RoomEvent.Disconnected, () => {
        setIsConnected(false);
      });

      room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
        if (track.kind === "audio") {
          const audioElement = track.attach();
          audioElement.autoplay = true;
          document.body.appendChild(audioElement);
        }
      });

      // --- CRITICAL FIX: Handle Streaming Text without Duplication ---
      room.on(RoomEvent.DataReceived, (payload, participant) => {
        try {
          const msgData = JSON.parse(new TextDecoder().decode(payload));

          if (msgData.type === "transcript") {
            setMessages((prev) => {
              const lastMsg = prev[prev.length - 1];

              // Logic: If last message is from same sender and NOT final, update it
              if (
                lastMsg &&
                lastMsg.sender === msgData.sender &&
                !lastMsg.isFinal
              ) {
                const updated = [...prev];
                updated[prev.length - 1] = {
                  ...lastMsg,
                  text: msgData.text,
                  isFinal: msgData.is_final, // Update final status
                  timestamp: new Date(),
                };
                return updated;
              }

              // Otherwise, append new message (only if text has content)
              if (msgData.text && msgData.text.trim().length > 0) {
                return [
                  ...prev,
                  {
                    sender: msgData.sender,
                    text: msgData.text,
                    isFinal: msgData.is_final,
                    timestamp: new Date(),
                  },
                ];
              }
              return prev;
            });
          } else if (msgData.type === "agent_speaking") {
            setIsAgentSpeaking(msgData.is_speaking);
          }
        } catch (e) {
          console.error("Data parse error:", e);
        }
      });

      await room.connect(data.url, data.token, { autoSubscribe: true });
      await room.localParticipant.setMicrophoneEnabled(true);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to connect");
      setIsConnecting(false);
    }
  };

  const endCall = async () => {
    if (roomRef.current) await roomRef.current.disconnect();
    roomRef.current = null;
    setIsConnected(false);
    setMessages([]);
    setIsMinimized(true);
  };

  const toggleMute = async () => {
    if (roomRef.current) {
      await roomRef.current.localParticipant.setMicrophoneEnabled(isMuted);
      setIsMuted(!isMuted);
    }
  };

  const toggleSpeaker = () => {
    const audioElements = document.querySelectorAll("audio");
    audioElements.forEach((audio) => {
      audio.muted = !isSpeakerMuted;
    });
    setIsSpeakerMuted(!isSpeakerMuted);
  };

  if (isMinimized) {
    return (
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-8 right-8 z-50 w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 shadow-2xl flex items-center justify-center group"
      >
        <Phone className="w-6 h-6 text-white group-hover:animate-pulse" />
      </motion.button>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 20 }}
        className={`fixed bottom-8 right-8 z-50 w-[420px] h-[600px] rounded-2xl shadow-2xl overflow-hidden flex flex-col ${
          theme === "dark"
            ? "bg-gray-900 border border-gray-800"
            : "bg-white border border-gray-200"
        }`}
      >
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 flex-shrink-0 flex justify-between items-center">
          <div>
            <h3 className="text-white font-bold text-lg flex items-center gap-2">
              {isConnected && (
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              )}
              MetaPresence
            </h3>
            <p className="text-white/80 text-xs">
              {isConnected ? "Connected" : "Ready"}
            </p>
          </div>
          <button
            onClick={() => setIsMinimized(true)}
            className="text-white/80 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          {!isConnected && !isConnecting ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8">
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="w-32 h-32 rounded-full bg-purple-100 flex items-center justify-center mb-6"
              >
                <Phone className="w-16 h-16 text-purple-600" />
              </motion.div>
              <h4 className="text-2xl font-bold mb-2 dark:text-white">
                Start Demo
              </h4>
              <button
                onClick={startCall}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Start Call
              </button>
              {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
            </div>
          ) : isConnecting ? (
            <div className="flex-1 flex flex-col items-center justify-center">
              <Loader2 className="w-12 h-12 text-purple-600 animate-spin mb-4" />
              <p className="dark:text-gray-300">Connecting...</p>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${
                      msg.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                        msg.sender === "user"
                          ? "bg-purple-600 text-white"
                          : "bg-gray-200 dark:bg-gray-800 dark:text-white"
                      }`}
                    >
                      <p className="text-sm">{msg.text}</p>
                      {/* Show 'typing' indicator if not final */}
                      {!msg.isFinal && (
                        <span className="inline-block w-1.5 h-4 ml-1 bg-current animate-pulse align-middle" />
                      )}
                    </div>
                  </motion.div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex justify-center gap-4">
                <button
                  onClick={toggleMute}
                  className={`p-3 rounded-full ${
                    isMuted
                      ? "bg-red-500 text-white"
                      : "bg-gray-200 dark:bg-gray-700"
                  }`}
                >
                  {isMuted ? <MicOff /> : <Mic />}
                </button>
                <button
                  onClick={endCall}
                  className="p-3 rounded-full bg-red-600 text-white"
                >
                  <PhoneOff />
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AvatarWidget;
