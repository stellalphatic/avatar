import { Square, Mic, MicOff, Volume2, MessageSquare } from "lucide-react";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";

export default function FullScreenConversation({
  avatar,
  persona,
  conversationType,
  isConnected,
  isConnecting,
  connectionStatus,
  callDuration,
  isSpeaking,
  messages,
  error,
  onEndCall,
  onToggleMicrophone,
  videoElementRef, // ✅ Use passed ref
}) {
  const [isMuted, setIsMuted] = useState(false);

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
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/80 to-transparent z-10">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img
              src={avatar?.image_url}
              alt={avatar?.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-white"
            />
            <div>
              <h2 className="text-white font-bold text-lg">{avatar?.name}</h2>
              <p className="text-gray-300 text-sm">{persona?.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-white font-mono text-xl">
              {formatTime(callDuration)}
            </div>
            {isSpeaking && (
              <div className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-full animate-pulse">
                <Volume2 size={16} />
                <span className="text-sm font-medium">Speaking</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Video/Avatar Display */}
      <div className="flex-1 flex items-center justify-center relative">
        {isConnecting ? (
          <div className="text-center text-white">
            <div className="w-24 h-24 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-2">Connecting...</h2>
            <p className="text-gray-400">{connectionStatus}</p>
          </div>
        ) : isConnected ? (
          conversationType === "video" ? (
            // ✅ USE PASSED videoElementRef
            <div
              style={{
                width: "85vw",
                maxWidth: "1400px",
                height: "75vh",
                background: "#111",
                borderRadius: 16,
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
              }}
            >
              <video
                ref={videoElementRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  //   transform: "scale(1.05)",
                  transform: "scaleX(1.52)",
                }}
                // className="w-full h-full object-cover"
                onLoadedData={() =>
                  console.log("✅ [FullScreenConversation] Video loaded")
                }
                onPlay={() =>
                  console.log("✅ [FullScreenConversation] Video playing")
                }
                onError={(e) =>
                  console.error("❌ [FullScreenConversation] Video error:", e)
                }
              />
            </div>
          ) : (
            <div className="text-center">
              <div className="relative inline-block">
                <img
                  src={avatar?.image_url}
                  alt={avatar?.name}
                  className="w-80 h-80 rounded-full object-cover border-8 border-purple-500 shadow-2xl"
                />
                {isSpeaking && (
                  <div className="absolute -bottom-4 -right-4 bg-green-500 text-white p-6 rounded-full animate-pulse">
                    <Volume2 size={32} />
                  </div>
                )}
              </div>
            </div>
          )
        ) : null}
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex justify-center items-center gap-6">
          <button
            onClick={handleToggleMute}
            className={`p-6 rounded-full transition-all transform hover:scale-110 ${
              isMuted
                ? "bg-red-500 hover:bg-red-600"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
          >
            {isMuted ? (
              <MicOff size={28} className="text-white" />
            ) : (
              <Mic size={28} className="text-white" />
            )}
          </button>

          <button
            onClick={onEndCall}
            className="p-6 bg-red-500 hover:bg-red-600 rounded-full transition-all transform hover:scale-110"
          >
            <Square size={28} className="text-white" />
          </button>
        </div>
      </div>

      {/* Transcript (Optional - bottom right) */}
      {messages.length > 0 && (
        <div className="absolute bottom-24 right-8 w-96 max-h-96 bg-black/80 backdrop-blur-lg rounded-2xl p-4 overflow-y-auto">
          <div className="flex items-center gap-2 mb-3 text-white">
            <MessageSquare size={18} />
            <span className="font-semibold text-sm">Transcript</span>
          </div>
          <div className="space-y-2">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`text-sm p-2 rounded-lg ${
                  msg.type === "user"
                    ? "bg-purple-500 text-white ml-8"
                    : "bg-gray-700 text-white mr-8"
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="absolute top-24 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-xl shadow-lg">
          {error}
        </div>
      )}
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
  videoElementRef: PropTypes.object, // ✅ Add this
  theme: PropTypes.string.isRequired,
};
