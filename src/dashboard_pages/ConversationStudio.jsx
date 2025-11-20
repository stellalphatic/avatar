import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import supabase from "../supabaseClient";
import { useLiveKitConversation } from "../hooks/useLiveKitConversation";
import {
  ChevronDown,
  Loader2,
  AlertTriangle,
  Info,
  Clock,
  FileCode,
  BookOpen,
  Settings as SettingsIcon,
  Book,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Import modals
import PersonaSelectionModal from "../components/modals/PersonaSelectionModal";
import AvatarSelectionModal from "../components/modals/AvatarSelectionModal";
import FullScreenConversation from "../components/FullScreenConversation";

const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English" },
  { code: "hi", name: "Hindi" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
];

export default function ConversationStudio() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  // State
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [selectedPersona, setSelectedPersona] = useState(null);
  const [avatars, setAvatars] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [voices, setVoices] = useState([]);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showPersonaModal, setShowPersonaModal] = useState(false);
  const [language, setLanguage] = useState("en");
  const [conversationName, setConversationName] = useState("");
  const [customGreeting, setCustomGreeting] = useState("");
  const [conversationContext, setConversationContext] = useState("");
  const [audioOnly, setAudioOnly] = useState(false);
  const [usage, setUsage] = useState(null);
  const [error, setError] = useState("");
  const [isFullScreen, setIsFullScreen] = useState(false);

  const {
    isConnected,
    isConnecting,
    connectionStatus,
    error: livekitError,
    callDuration,
    isSpeaking,
    messages,
    connect,
    disconnect,
    toggleMicrophone,
    videoElementRef,
  } = useLiveKitConversation();

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        const { data: avatarData } = await supabase
          .from("avatars")
          .select("*")
          .or(`user_id.eq.${user.id},is_public.eq.true,is_stock.eq.true`)
          .order("is_stock", { ascending: false });

        setAvatars(avatarData || []);

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          const [personaRes, voiceRes, usageRes] = await Promise.all([
            fetch(`${import.meta.env.VITE_BACKEND_API_URL}/personas`, {
              headers: { Authorization: `Bearer ${session.access_token}` },
            }),
            fetch(`${import.meta.env.VITE_BACKEND_API_URL}/personas/voices`, {
              headers: { Authorization: `Bearer ${session.access_token}` },
            }),
            fetch(`${import.meta.env.VITE_BACKEND_API_URL}/usage/stats`, {
              headers: { Authorization: `Bearer ${session.access_token}` },
            }),
          ]);

          if (personaRes.ok) {
            const data = await personaRes.json();
            setPersonas(data.data || []);
          }

          if (voiceRes.ok) {
            const data = await voiceRes.json();
            setVoices(data.data || []);
          }

          if (usageRes.ok) {
            const data = await usageRes.json();
            if (data.success) setUsage(data.data);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load data. Please refresh the page.");
      }
    };

    fetchData();
  }, [user]);

  const canStartConversation = () => {
    if (!usage) return true;
    return usage.conversation.remaining > 0;
  };

  const validateAndStart = () => {
    setError("");

    if (!selectedPersona) {
      setError("Please select a persona");
      return;
    }

    if (!selectedAvatar) {
      setError("Please select a replica");
      return;
    }

    if (!canStartConversation()) {
      setError("Insufficient conversation minutes");
      return;
    }

    setIsFullScreen(true);
    startConversation();
  };

  const startConversation = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("Not authenticated. Please log in again.");
      }

      console.log("[ConversationStudio] Starting conversation:", {
        avatarId: selectedAvatar.id,
        avatarName: selectedAvatar.name,
        personaId: selectedPersona?.id,
        personaName: selectedPersona?.name,
        conversationType: audioOnly ? "voice" : "video",
      });

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_API_URL}/livekit/generate-token`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            avatarId: selectedAvatar.id,
            personaId: selectedPersona?.id,
            voiceId: selectedAvatar.default_voice_id || null,
            conversationType: audioOnly ? "voice" : "video",
            language,
            conversationName: conversationName || null,
            customGreeting: customGreeting || undefined,
            conversationContext: conversationContext || undefined,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to generate token");
      }

      const result = await response.json();

      console.log("[ConversationStudio] Token generated successfully");

      // ✅ Pass metadata to LiveKit
      await connect({
        token: result.data.token,
        wsUrl: result.data.wsUrl,
        roomName: result.data.roomName,
        conversationId: result.data.conversationId,
        conversationType: audioOnly ? "voice" : "video",
        metadata: {
          avatar_id: selectedAvatar.id,
          persona_id: selectedPersona?.id,
          persona_name: selectedPersona?.name,
          audio_only: audioOnly,
        },
      });
    } catch (error) {
      console.error("[ConversationStudio] Conversation error:", error);
      setError(error.message || "Failed to start conversation");
      setIsFullScreen(false);
    }
  };

  const handleEndConversation = async () => {
    try {
      const result = await disconnect();

      if (result?.conversationId) {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          await fetch(
            `${import.meta.env.VITE_BACKEND_API_URL}/livekit/end-conversation`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({
                conversationId: result.conversationId,
                durationMinutes: result.durationMinutes,
              }),
            }
          );
        }
      }
    } catch (error) {
      console.error("[ConversationStudio] End conversation error:", error);
    } finally {
      setIsFullScreen(false);
    }
  };

  // Helper to get avatar profile image
  const getAvatarProfileImage = (avatar) => {
    if (!avatar) return null;

    // Priority: thumbnail_url > image_url
    if (avatar.thumbnail_url) return avatar.thumbnail_url;
    if (avatar.image_url) {
      // If image_url is a video, show a placeholder
      if (avatar.image_url.match(/\.(mp4|webm|mov)$/i)) {
        return null; // Will show initials
      }
      return avatar.image_url;
    }

    return null;
  };

  // Full-screen view
  if (isFullScreen) {
    return (
      <FullScreenConversation
        avatar={selectedAvatar}
        persona={selectedPersona}
        conversationType={audioOnly ? "voice" : "video"}
        isConnected={isConnected}
        isConnecting={isConnecting}
        connectionStatus={connectionStatus}
        callDuration={callDuration}
        isSpeaking={isSpeaking}
        messages={messages}
        error={livekitError}
        onEndCall={handleEndConversation}
        onToggleMicrophone={toggleMicrophone}
        videoElementRef={videoElementRef}
        theme={theme}
      />
    );
  }

  // Main configuration view
  return (
    <div
      className={`min-h-screen ${
        theme === "dark" ? "bg-gray-950" : "bg-gray-50"
      }`}
    >
      {/* Header */}
      <div
        className={`border-b ${
          theme === "dark"
            ? "border-gray-800 bg-gray-900"
            : "border-gray-200 bg-white"
        } px-6 py-4`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            New Conversation
          </h1>
          <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
            <button
              onClick={() => navigate("/dashboard/history")}
              className="flex items-center gap-2 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <Clock size={16} />
              History
            </button>
            <button className="flex items-center gap-2 hover:text-gray-900 dark:hover:text-white transition-colors">
              <FileCode size={16} />
              View Code
            </button>
            <button className="flex items-center gap-2 hover:text-gray-900 dark:hover:text-white transition-colors">
              <BookOpen size={16} />
              Read Docs
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Basics */}
          <div className="lg:col-span-2 space-y-6">
            <div
              className={`${
                theme === "dark"
                  ? "bg-gray-900 border-gray-800"
                  : "bg-white border-gray-200"
              } rounded-lg border p-6`}
            >
              <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-6">
                Basics
              </h2>

              <div className="space-y-6">
                {/* Persona */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Persona
                  </label>
                  <button
                    onClick={() => setShowPersonaModal(true)}
                    className={`w-full px-4 py-3 ${
                      theme === "dark"
                        ? "bg-gray-800 border-gray-700 hover:border-gray-600"
                        : "bg-gray-50 border-gray-300 hover:border-gray-400"
                    } border rounded-lg flex items-center justify-between text-left transition-colors`}
                  >
                    <span className="text-gray-900 dark:text-white">
                      {selectedPersona
                        ? selectedPersona.name
                        : "Select persona..."}
                    </span>
                    <ChevronDown
                      size={20}
                      className="text-gray-400 flex-shrink-0"
                    />
                  </button>
                </div>

                {/* Replica (Avatar) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Replica
                    </label>
                    <button
                      onClick={() => setShowAvatarModal(true)}
                      className={`w-full px-4 py-3 ${
                        theme === "dark"
                          ? "bg-gray-800 border-gray-700 hover:border-gray-600"
                          : "bg-gray-50 border-gray-300 hover:border-gray-400"
                      } border rounded-lg flex items-center justify-between text-left transition-colors`}
                    >
                      {selectedAvatar ? (
                        <div className="flex items-center gap-3 min-w-0">
                          {getAvatarProfileImage(selectedAvatar) ? (
                            <img
                              src={getAvatarProfileImage(selectedAvatar)}
                              alt={selectedAvatar.name}
                              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                              {selectedAvatar.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span className="text-gray-900 dark:text-white truncate">
                            {selectedAvatar.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-900 dark:text-white">
                          Select replica...
                        </span>
                      )}
                      <ChevronDown
                        size={20}
                        className="text-gray-400 flex-shrink-0 ml-2"
                      />
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      Conversation Language
                      <Info size={14} className="text-gray-400" />
                    </label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className={`w-full px-4 py-3 ${
                        theme === "dark"
                          ? "bg-gray-800 border-gray-700"
                          : "bg-gray-50 border-gray-300"
                      } border rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors`}
                    >
                      {SUPPORTED_LANGUAGES.map((lang) => (
                        <option key={lang.code} value={lang.code}>
                          {lang.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Conversation Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Conversation Name{" "}
                    <span className="text-gray-400">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={conversationName}
                    onChange={(e) => setConversationName(e.target.value)}
                    placeholder="e.g., Customer Support Demo"
                    className={`w-full px-4 py-3 ${
                      theme === "dark"
                        ? "bg-gray-800 border-gray-700"
                        : "bg-gray-50 border-gray-300"
                    } border rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors`}
                  />
                </div>

                {/* Custom Greeting */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Custom Greeting{" "}
                    <span className="text-gray-400">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={customGreeting}
                    onChange={(e) => setCustomGreeting(e.target.value)}
                    placeholder="e.g., Hi there, welcome to our demo!"
                    className={`w-full px-4 py-3 ${
                      theme === "dark"
                        ? "bg-gray-800 border-gray-700"
                        : "bg-gray-50 border-gray-300"
                    } border rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors`}
                  />
                </div>

                {/* Conversation Context */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    Conversation Context{" "}
                    <span className="text-gray-400">(optional)</span>
                    <Info size={14} className="text-gray-400" />
                  </label>
                  <textarea
                    value={conversationContext}
                    onChange={(e) => setConversationContext(e.target.value)}
                    placeholder="Describe the context, e.g., 'This is a product demo for new customers'"
                    rows={4}
                    className={`w-full px-4 py-3 ${
                      theme === "dark"
                        ? "bg-gray-800 border-gray-700"
                        : "bg-gray-50 border-gray-300"
                    } border rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors resize-none`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Properties */}
          <div className="space-y-6">
            <div
              className={`${
                theme === "dark"
                  ? "bg-gray-900 border-gray-800"
                  : "bg-white border-gray-200"
              } rounded-lg border p-6`}
            >
              <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-6">
                Properties
              </h2>

              {/* Properties Link */}
              <button
                className={`w-full p-4 ${
                  theme === "dark"
                    ? "bg-gray-800 hover:bg-gray-750"
                    : "bg-gray-50 hover:bg-gray-100"
                } rounded-lg flex items-start justify-between transition-colors mb-6`}
              >
                <div className="flex items-start gap-3 text-left">
                  <SettingsIcon
                    size={20}
                    className="text-gray-400 mt-0.5 flex-shrink-0"
                  />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                      Properties
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                      Configure call duration, timeouts, media settings,
                      recording options, and other conversation properties.
                    </p>
                  </div>
                </div>
                <ChevronDown
                  size={16}
                  className="text-gray-400 mt-1 flex-shrink-0 rotate-[-90deg]"
                />
              </button>

              {/* Audio-Only Toggle */}
              <div
                className={`p-4 ${
                  theme === "dark" ? "bg-gray-800" : "bg-gray-50"
                } rounded-lg mb-6`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    Audio-Only
                  </h3>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={audioOnly}
                      onChange={(e) => setAudioOnly(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  Start a conversation in audio-only mode, perfect for
                  voice-only or low-bandwidth environments.
                </p>
              </div>

              {/* Usage Stats */}
              {usage && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                    Usage
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500 dark:text-gray-400">
                        Conversation Minutes
                      </span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {usage.conversation.remaining} /{" "}
                        {usage.conversation.total}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full transition-all"
                        style={{
                          width: `${
                            (usage.conversation.remaining /
                              usage.conversation.total) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Memories - Coming Soon */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Memories
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 leading-relaxed">
                  Allow your persona to remember and recall information from
                  conversations based on a provided tag value.
                </p>
                <button
                  disabled
                  className={`w-full px-4 py-3 ${
                    theme === "dark"
                      ? "bg-gray-800 border-gray-700"
                      : "bg-gray-50 border-gray-300"
                  } border rounded-lg flex items-center justify-between text-left opacity-50 cursor-not-allowed`}
                >
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Select memories or type to add custom...
                  </span>
                  <ChevronDown size={16} className="text-gray-400" />
                </button>
              </div>

              {/* Knowledge Base - Coming Soon */}
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start gap-2">
                    <Book size={18} className="text-gray-400 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        Knowledge Base
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                        Enable your persona to reference information from any
                        previously uploaded documents during conversations.
                      </p>
                    </div>
                  </div>
                  <button
                    disabled
                    className="px-3 py-1.5 text-xs font-medium text-gray-400 border border-gray-300 dark:border-gray-700 rounded-lg opacity-50 cursor-not-allowed"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {(error || livekitError) && (
          <div className="mt-6 max-w-7xl mx-auto">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg flex items-center gap-3">
              <AlertTriangle size={20} className="flex-shrink-0" />
              <span className="text-sm">{error || livekitError}</span>
            </div>
          </div>
        )}

        {/* Create Button - Fixed Bottom Right */}
        <div className="fixed bottom-8 right-8 z-40">
          <button
            onClick={validateAndStart}
            disabled={
              !selectedPersona ||
              !selectedAvatar ||
              !canStartConversation() ||
              isConnecting
            }
            className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-semibold shadow-2xl hover:shadow-3xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-3 text-base hover:scale-105 active:scale-95"
          >
            {isConnecting ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Creating...
              </>
            ) : (
              <>
                Create Conversation
                <ChevronDown className="rotate-[-90deg]" size={18} />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Modals */}
      <PersonaSelectionModal
        isOpen={showPersonaModal}
        onClose={() => setShowPersonaModal(false)}
        personas={personas}
        selectedPersona={selectedPersona}
        onSelect={(persona) => {
          setSelectedPersona(persona);
          setShowPersonaModal(false);
        }}
        onCreate={() => navigate("/dashboard/avatars/create?type=persona")}
        theme={theme}
      />

      <AvatarSelectionModal
        isOpen={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
        avatars={avatars}
        selectedAvatar={selectedAvatar}
        onSelect={(avatar) => {
          setSelectedAvatar(avatar);
          setShowAvatarModal(false);
        }}
        onCreate={() => navigate("/dashboard/avatars/create?type=avatar")}
        theme={theme}
      />
    </div>
  );
}
