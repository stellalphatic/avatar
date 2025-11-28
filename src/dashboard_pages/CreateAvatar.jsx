import { useState, useRef, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import supabase from "../supabaseClient";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Upload,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Info,
  Lock,
  FileCode,
  BookOpen,
} from "lucide-react";

export default function CreateAvatar() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialType = searchParams.get("type") || "avatar";
  const [creationType, setCreationType] = useState(initialType);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [usage, setUsage] = useState(null);

  // Avatar fields
  const [avatarName, setAvatarName] = useState("");
  const [avatarDescription, setAvatarDescription] = useState("");
  const [visualFile, setVisualFile] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const visualInputRef = useRef(null);
  const audioInputRef = useRef(null);

  // Persona fields
  const [personaName, setPersonaName] = useState("");
  const [personaDescription, setPersonaDescription] = useState("");
  const [personaRole, setPersonaRole] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [personaContext, setPersonaContext] = useState("");

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          // Fetch usage stats
          const usageRes = await fetch(
            `${import.meta.env.VITE_BACKEND_API_URL}/usage/stats`,
            { headers: { Authorization: `Bearer ${session.access_token}` } }
          );

          if (usageRes.ok) {
            const data = await usageRes.json();
            if (data.success) setUsage(data.data);
          }

        }
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, [user]);

  const handleFileChange = (e, setFile) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validate file size
      const maxSize = file.type.startsWith("audio") ? 5 : 10; // 5MB for audio, 10MB for video/image
      if (file.size > maxSize * 1024 * 1024) {
        setError(`File size exceeds ${maxSize}MB limit`);
        return;
      }

      setFile(file);
    }
  };

  const uploadFile = async (file, path) => {
    if (!file) return null;

    const filePath = `${user.id}/${path}/${Date.now()}-${file.name.replace(
      /\s/g,
      "_"
    )}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from("avatar-media")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("avatar-media")
        .getPublicUrl(filePath);
      return data.publicUrl;
    } catch (err) {
      throw new Error(`Upload failed: ${err.message}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      if (creationType === "avatar") {
        // Create Avatar
        if (!avatarName || !visualFile) {
          throw new Error("Avatar name and visual file are required");
        }

        // Upload files
        let imageUrl = null;
        let idleVideoUrl = null;
        let voiceUrl = null;

        if (visualFile.type.startsWith("image/")) {
          imageUrl = await uploadFile(visualFile, "avatars/images");
        } else if (visualFile.type.startsWith("video/")) {
          idleVideoUrl = await uploadFile(visualFile, "avatars/videos");
          // For video, extract first frame as image (optional, can be done later)
          imageUrl = idleVideoUrl; // Temp: use video URL
        }

        if (audioFile) {
          voiceUrl = await uploadFile(audioFile, "avatars/voices");
        }

        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_API_URL}/avatars/create`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              name: avatarName,
              description: avatarDescription,
              image_url: imageUrl,
              idle_video_url: idleVideoUrl,
              voice_url: voiceUrl,
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to create avatar");
        }

        const result = await response.json();
        console.log("Avatar created:", result);

        // Update usage
        await fetch(
          `${
            import.meta.env.VITE_BACKEND_API_URL
          }/usage/update-avatar-creation`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        setSuccess("Replica created successfully!");
        setTimeout(() => navigate("/dashboard/chat"), 2000);
      } else {
        // Create Persona
        if (!personaName || !systemPrompt) {
          throw new Error("Persona name and system prompt are required");
        }

        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_API_URL}/personas/create`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              name: personaName,
              description: personaDescription,
              persona_role: personaRole,
              system_prompt: systemPrompt,
              conversational_context: personaContext,
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to create persona");
        }

        const result = await response.json();
        console.log("Persona created:", result);

        setSuccess("Persona created successfully!");
        setTimeout(() => navigate("/dashboard/chat"), 2000);
      }
    } catch (err) {
      console.error("Creation error:", err);
      setError(err.message || "Failed to create");
    } finally {
      setLoading(false);
    }
  };

  const canCreate = () => {
    if (!usage) return true;
    return usage.avatarCreation.remaining > 0;
  };

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
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              New {creationType === "avatar" ? "Replica" : "Persona"}
            </h1>
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full text-xs font-medium text-blue-700 dark:text-blue-300">
              POST
              <span className="text-gray-500 dark:text-gray-400">
                / v2 / {creationType === "avatar" ? "replicas" : "personas"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
            <button className="flex items-center gap-2 hover:text-gray-900 dark:hover:text-white">
              <FileCode size={16} />
              View Code
            </button>
            <button className="flex items-center gap-2 hover:text-gray-900 dark:hover:text-white">
              <BookOpen size={16} />
              Read Docs
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Type Toggle */}
        <div className="mb-8 flex gap-2">
          <button
            onClick={() => setCreationType("persona")}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              creationType === "persona"
                ? "bg-purple-600 text-white"
                : theme === "dark"
                ? "bg-gray-800 text-gray-400 hover:text-white"
                : "bg-gray-200 text-gray-600 hover:text-gray-900"
            }`}
          >
            Create Persona
          </button>
          <button
            onClick={() => setCreationType("avatar")}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              creationType === "avatar"
                ? "bg-purple-600 text-white"
                : theme === "dark"
                ? "bg-gray-800 text-gray-400 hover:text-white"
                : "bg-gray-200 text-gray-600 hover:text-gray-900"
            }`}
          >
            Create Replica
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg flex items-center gap-3">
            <AlertTriangle size={20} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg flex items-center gap-3">
            <CheckCircle size={20} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              <div
                className={`${
                  theme === "dark"
                    ? "bg-gray-900 border-gray-800"
                    : "bg-white border-gray-200"
                } rounded-lg border p-6`}
              >
                <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-6">
                  {creationType === "avatar" ? "Replica" : "Persona"}
                </h2>

                {creationType === "avatar" ? (
                  <div className="space-y-6">
                    {/* Avatar Name */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Replica Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={avatarName}
                        onChange={(e) => setAvatarName(e.target.value)}
                        placeholder="Enter name for your replica"
                        required
                        className={`w-full px-4 py-3 ${
                          theme === "dark"
                            ? "bg-gray-800 border-gray-700"
                            : "bg-gray-50 border-gray-300"
                        } border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none`}
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Description{" "}
                        <span className="text-gray-400">(optional)</span>
                      </label>
                      <input
                        type="text"
                        value={avatarDescription}
                        onChange={(e) => setAvatarDescription(e.target.value)}
                        placeholder="Brief description of this replica"
                        className={`w-full px-4 py-3 ${
                          theme === "dark"
                            ? "bg-gray-800 border-gray-700"
                            : "bg-gray-50 border-gray-300"
                        } border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none`}
                      />
                    </div>

                    {/* Visual Upload */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Upload Image or Video{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <div
                        onClick={() => visualInputRef.current.click()}
                        className={`cursor-pointer p-8 ${
                          theme === "dark"
                            ? "bg-gray-800 border-gray-700 hover:border-gray-600"
                            : "bg-gray-50 border-gray-300 hover:border-gray-400"
                        } border-2 border-dashed rounded-lg text-center transition-colors`}
                      >
                        {visualFile ? (
                          <div>
                            <p className="text-sm font-medium mb-1">
                              {visualFile.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {(visualFile.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                          </div>
                        ) : (
                          <div>
                            <Upload
                              size={32}
                              className="mx-auto text-gray-400 mb-2"
                            />
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Click to upload image or video
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Max 10MB • JPG, PNG, MP4
                            </p>
                          </div>
                        )}
                      </div>
                      <input
                        ref={visualInputRef}
                        type="file"
                        accept="image/*,video/*"
                        className="hidden"
                        onChange={(e) => handleFileChange(e, setVisualFile)}
                      />
                    </div>

                    {/* Audio Upload (Optional) */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Upload Audio Sample{" "}
                        <span className="text-gray-400">(optional)</span>
                      </label>
                      <div
                        onClick={() => audioInputRef.current.click()}
                        className={`cursor-pointer p-8 ${
                          theme === "dark"
                            ? "bg-gray-800 border-gray-700 hover:border-gray-600"
                            : "bg-gray-50 border-gray-300 hover:border-gray-400"
                        } border-2 border-dashed rounded-lg text-center transition-colors`}
                      >
                        {audioFile ? (
                          <div>
                            <p className="text-sm font-medium mb-1">
                              {audioFile.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {(audioFile.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                          </div>
                        ) : (
                          <div>
                            <Upload
                              size={32}
                              className="mx-auto text-gray-400 mb-2"
                            />
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Click to upload audio
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Max 5MB • WAV, MP3
                            </p>
                          </div>
                        )}
                      </div>
                      <input
                        ref={audioInputRef}
                        type="file"
                        accept="audio/*"
                        className="hidden"
                        onChange={(e) => handleFileChange(e, setAudioFile)}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Persona Name */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Persona Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={personaName}
                        onChange={(e) => setPersonaName(e.target.value)}
                        placeholder="Enter persona name"
                        required
                        className={`w-full px-4 py-3 ${
                          theme === "dark"
                            ? "bg-gray-800 border-gray-700"
                            : "bg-gray-50 border-gray-300"
                        } border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none`}
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Description{" "}
                        <span className="text-gray-400">(optional)</span>
                      </label>
                      <input
                        type="text"
                        value={personaDescription}
                        onChange={(e) => setPersonaDescription(e.target.value)}
                        placeholder="Brief description"
                        className={`w-full px-4 py-3 ${
                          theme === "dark"
                            ? "bg-gray-800 border-gray-700"
                            : "bg-gray-50 border-gray-300"
                        } border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none`}
                      />
                    </div>

                    {/* Persona Role */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Persona Role{" "}
                        <span className="text-gray-400">(optional)</span>
                      </label>
                      <input
                        type="text"
                        value={personaRole}
                        onChange={(e) => setPersonaRole(e.target.value)}
                        placeholder="e.g., Customer Support Agent"
                        className={`w-full px-4 py-3 ${
                          theme === "dark"
                            ? "bg-gray-800 border-gray-700"
                            : "bg-gray-50 border-gray-300"
                        } border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none`}
                      />
                    </div>

                    {/* System Prompt */}
                    <div>
                      <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                        System Prompt <span className="text-red-500">*</span>
                        <Info size={14} className="text-gray-400" />
                      </label>
                      <textarea
                        value={systemPrompt}
                        onChange={(e) => setSystemPrompt(e.target.value)}
                        placeholder="e.g. You are a witty travel guide with deep knowledge of European history and architecture."
                        rows={6}
                        required
                        className={`w-full px-4 py-3 ${
                          theme === "dark"
                            ? "bg-gray-800 border-gray-700"
                            : "bg-gray-50 border-gray-300"
                        } border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none resize-none`}
                      />
                    </div>

                    {/* Persona Context */}
                    <div>
                      <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                        Persona Context{" "}
                        <span className="text-gray-400">(optional)</span>
                        <Info size={14} className="text-gray-400" />
                      </label>
                      <textarea
                        value={personaContext}
                        onChange={(e) => setPersonaContext(e.target.value)}
                        placeholder="e.g. You are guiding a tour group around Paris..."
                        rows={4}
                        className={`w-full px-4 py-3 ${
                          theme === "dark"
                            ? "bg-gray-800 border-gray-700"
                            : "bg-gray-50 border-gray-300"
                        } border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none resize-none`}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Layers (Locked) */}
            <div className="space-y-6">
              <div
                className={`${
                  theme === "dark"
                    ? "bg-gray-900 border-gray-800"
                    : "bg-white border-gray-200"
                } rounded-lg border p-6`}
              >
                <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-6">
                  Layers
                </h2>

                {/* LLM - Locked */}
                <div
                  className={`w-full p-4 mb-4 ${
                    theme === "dark" ? "bg-gray-800" : "bg-gray-50"
                  } rounded-lg flex items-start gap-3 opacity-60`}
                >
                  <Lock
                    size={18}
                    className="text-gray-400 mt-1 flex-shrink-0"
                  />
                  <div className="flex-1">
                    <h3 className="text-sm font-medium mb-1">
                      Language Model (LLM)
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                      Choose your LLM and configure advanced settings like
                      speculative response speed-ups and tool integrations.
                    </p>
                  </div>
                </div>

                {/* STT - Locked */}
                <div
                  className={`w-full p-4 mb-4 ${
                    theme === "dark" ? "bg-gray-800" : "bg-gray-50"
                  } rounded-lg flex items-start gap-3 opacity-60`}
                >
                  <Lock
                    size={18}
                    className="text-gray-400 mt-1 flex-shrink-0"
                  />
                  <div className="flex-1">
                    <h3 className="text-sm font-medium mb-1">
                      Speech-to-Text (STT)
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                      Configure the selected speech-to-text engine, including
                      pause, interrupt, and turn-taking settings.
                    </p>
                  </div>
                </div>

                {/* TTS - Locked */}
                <div
                  className={`w-full p-4 ${
                    theme === "dark" ? "bg-gray-800" : "bg-gray-50"
                  } rounded-lg flex items-start gap-3 opacity-60`}
                >
                  <Lock
                    size={18}
                    className="text-gray-400 mt-1 flex-shrink-0"
                  />
                  <div className="flex-1">
                    <h3 className="text-sm font-medium mb-1">
                      Text-to-Speech (TTS)
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                      Configure the selected text-to-speech engine, including
                      voice, emotion, and custom settings.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons - Fixed Bottom */}
          <div className="fixed bottom-8 right-8 flex items-center gap-4 z-40">
            {creationType === "persona" && (
              <button
                type="button"
                disabled
                className="px-6 py-4 bg-gray-200 dark:bg-gray-700 text-gray-400 rounded-xl font-semibold cursor-not-allowed"
              >
                Create and Start Conversation
              </button>
            )}

            <button
              type="submit"
              disabled={loading || !canCreate()}
              className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-semibold shadow-2xl hover:shadow-3xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-3"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Creating...
                </>
              ) : (
                <>Create {creationType === "avatar" ? "Replica" : "Persona"}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
