import {
  Square,
  Mic,
  MicOff,
  Volume2,
  MessageSquare,
  User,
} from "lucide-react";
import PropTypes from "prop-types";
import { useEffect, useState, useRef } from "react";

export default function FullScreenConversation({
  avatar,
  persona,
  conversationType,
  isConnected,
  isConnecting,
  connectionStatus,
  callDuration,
  isSpeaking,
  messages, // ✅ Real-time messages from LiveKit
  error,
  onEndCall,
  onToggleMicrophone,
  videoElementRef,
}) {
  const [isMuted, setIsMuted] = useState(false);
  const [showTranscript, setShowTranscript] = useState(true); // ✅ Toggle transcript
  const messagesEndRef = useRef(null);

  // ✅ Auto-scroll to bottom when new message arrives
  useEffect(() => {
    if (messagesEndRef.current && showTranscript) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, showTranscript]);

  // ✅ Ensure video element is ready
  useEffect(() => {
    if (videoElementRef?.current && conversationType === "video") {
      console.log("[FullScreenConversation] Video element ready");
      videoElementRef.current.style.display = "block";
    }
  }, [videoElementRef, conversationType]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleToggleMute = async () => {
    const newState = await onToggleMicrophone();
    setIsMuted(!newState);
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent z-10 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-white text-xl font-semibold">
              {persona?.name || "Conversation"}
            </h2>
            <div className="flex items-center gap-2 text-white/80 text-sm">
              {isConnecting && (
                <span className="flex items-center gap-1">
                  <div className="animate-pulse w-2 h-2 bg-yellow-400 rounded-full" />
                  {connectionStatus}
                </span>
              )}
              {isConnected && (
                <>
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    Connected
                  </span>
                  <span>•</span>
                  <span>{formatTime(callDuration)}</span>
                </>
              )}
            </div>
          </div>

          {/* Toggle Transcript Button */}
          <button
            onClick={() => setShowTranscript(!showTranscript)}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
          >
            <MessageSquare className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex">
        {/* Video/Avatar Area */}
        <div
          className={`${
            showTranscript ? "w-2/3" : "w-full"
          } relative flex items-center justify-center`}
        >
          {conversationType === "video" ? (
            <video
              ref={videoElementRef}
              className="w-full h-full object-contain"
              autoPlay
              playsInline
            />
          ) : (
            <div className="flex flex-col items-center justify-center">
              {avatar?.image_url ? (
                <img
                  src={avatar.image_url}
                  alt={avatar.name}
                  className="w-64 h-64 rounded-full object-cover border-4 border-white/20"
                />
              ) : (
                <div className="w-64 h-64 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <User className="w-32 h-32 text-white" />
                </div>
              )}
              <p className="text-white mt-4 text-lg">{avatar?.name}</p>
              {isSpeaking && (
                <div className="mt-4 flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-blue-500 rounded-full animate-pulse"
                      style={{
                        height: `${Math.random() * 30 + 10}px`,
                        animationDelay: `${i * 0.1}s`,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
              {error}
            </div>
          )}
        </div>

        {/* ✅ Real-Time Transcript Panel */}
        {showTranscript && (
          <div className="w-1/3 bg-gray-900/95 backdrop-blur-sm flex flex-col">
            <div className="p-4 border-b border-gray-700">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Live Transcript
              </h3>
              <p className="text-gray-400 text-xs mt-1">
                {messages.length} message{messages.length !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="text-center text-gray-400 mt-8">
                  <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">
                    Waiting for conversation to start...
                  </p>
                </div>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex gap-2 ${
                      message.type === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-3 py-2 ${
                        message.type === "user"
                          ? "bg-blue-600 text-white"
                          : message.type === "avatar"
                          ? "bg-gray-700 text-white"
                          : "bg-gray-800 text-gray-400"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold opacity-70">
                          {message.type === "user"
                            ? "You"
                            : message.type === "avatar"
                            ? avatar?.name || "Avatar"
                            : "System"}
                        </span>
                        {message.timestamp && (
                          <span className="text-[10px] opacity-50">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </span>
                        )}
                      </div>
                      <p className="text-sm leading-relaxed">{message.text}</p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent z-10 p-6">
        <div className="flex items-center justify-center gap-4">
          {/* Mute Button */}
          <button
            onClick={handleToggleMute}
            disabled={!isConnected}
            className={`p-4 rounded-full transition-all ${
              isMuted
                ? "bg-red-500 hover:bg-red-600"
                : "bg-white/20 hover:bg-white/30"
            } ${!isConnected ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {isMuted ? (
              <MicOff className="w-6 h-6 text-white" />
            ) : (
              <Mic className="w-6 h-6 text-white" />
            )}
          </button>

          {/* End Call Button */}
          <button
            onClick={onEndCall}
            className="p-4 bg-red-500 hover:bg-red-600 rounded-full transition-all"
          >
            <Square className="w-6 h-6 text-white" />
          </button>

          {/* Speaking Indicator */}
          {isSpeaking && (
            <div className="flex items-center gap-2 text-white bg-white/20 px-4 py-2 rounded-full">
              <Volume2 className="w-5 h-5 animate-pulse" />
              <span className="text-sm">Avatar is speaking...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

FullScreenConversation.propTypes = {
  avatar: PropTypes.object,
  persona: PropTypes.object,
  conversationType: PropTypes.string.isRequired,
  isConnected: PropTypes.bool.isRequired,
  isConnecting: PropTypes.bool.isRequired,
  connectionStatus: PropTypes.string,
  callDuration: PropTypes.number.isRequired,
  isSpeaking: PropTypes.bool.isRequired,
  messages: PropTypes.array.isRequired,
  error: PropTypes.string,
  onEndCall: PropTypes.func.isRequired,
  onToggleMicrophone: PropTypes.func.isRequired,
  videoElementRef: PropTypes.object,
};
