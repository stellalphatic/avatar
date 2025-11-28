import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import supabase from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import {
  Loader2,
  User,
  Brain,
  Plus,
  Search,
  Copy,
  CheckCircle2,
  Edit,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function MyCreations() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [avatars, setAvatars] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [activeTab, setActiveTab] = useState("avatars");
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      // Fetch avatars
      const avatarRes = await fetch(
        `${import.meta.env.VITE_BACKEND_API_URL}/avatars`,
        {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }
      );

      if (avatarRes.ok) {
        const data = await avatarRes.json();
        // Your controller already returns all avatars (user + public + stock),
        // here we only show user-owned in "My Creations"
        const mine = (data.data || []).filter(
          (a) => a.user_id === user.id && !a.is_stock
        );
        setAvatars(mine);
      } else {
        setError("Failed to load avatars");
      }

      // Fetch personas
      const personaRes = await fetch(
        `${import.meta.env.VITE_BACKEND_API_URL}/personas`,
        {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }
      );

      if (personaRes.ok) {
        const data = await personaRes.json();
        const mine = (data.data || []).filter(
          (p) => p.user_id === user.id && !p.is_stock
        );
        setPersonas(mine);
      } else {
        setError("Failed to load personas");
      }
    } catch (err) {
      console.error("Error fetching creations:", err);
      setError("Failed to load your creations. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  const copyPublicId = (publicId) => {
    navigator.clipboard.writeText(publicId);
    setCopiedId(publicId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredAvatars = avatars.filter(
    (avatar) =>
      avatar.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      avatar.public_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPersonas = personas.filter(
    (persona) =>
      persona.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      persona.public_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateAvatar = () => {
    navigate("/dashboard/create?type=avatar");
  };

  const handleCreatePersona = () => {
    navigate("/dashboard/create?type=persona");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              My Creations
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your custom avatars and personas
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleCreateAvatar}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Avatar
            </button>
            <button
              onClick={handleCreatePersona}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Persona
            </button>
          </div>
        </div>

        {/* Error banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab("avatars")}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "avatars"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Avatars ({avatars.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab("personas")}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "personas"
                  ? "border-purple-500 text-purple-600 dark:text-purple-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4" />
                Personas ({personas.length})
              </div>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Search your ${activeTab}...`}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Content */}
        {activeTab === "avatars" ? (
          avatars.length === 0 ? (
            <EmptyState
              icon={User}
              title="No avatars yet"
              description="Create your first custom avatar to bring your ideas to life."
              actionLabel="Create Avatar"
              onAction={handleCreateAvatar}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredAvatars.map((avatar) => (
                <motion.div
                  key={avatar.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow flex flex-col"
                >
                  <div className="aspect-square bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 relative">
                    {avatar.image_url ? (
                      <img
                        src={avatar.image_url}
                        alt={avatar.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <User className="w-16 h-16" />
                      </div>
                    )}
                    <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 text-white text-xs rounded-full flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      My Avatar
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1 truncate">
                      {avatar.name}
                    </h3>
                    {avatar.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                        {avatar.description}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                      Created: {formatDate(avatar.created_at)}
                    </p>
                    <div className="flex items-center gap-2 mb-3">
                      <code className="flex-1 text-xs font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded truncate">
                        {avatar.public_id}
                      </code>
                      <button
                        onClick={() => copyPublicId(avatar.public_id)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                      >
                        {copiedId === avatar.public_id ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-auto">
                      <button
                        onClick={() =>
                          navigate(`/dashboard/chat?avatar=${avatar.id}`)
                        }
                        className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors"
                      >
                        Start Conversation
                      </button>
                      <button
                        onClick={() =>
                          navigate(`/dashboard/create?type=avatar&edit=${avatar.id}`)
                        }
                        className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )
        ) : personas.length === 0 ? (
          <EmptyState
            icon={Brain}
            title="No personas yet"
            description="Create a persona to define how your avatar thinks and talks."
            actionLabel="Create Persona"
            onAction={handleCreatePersona}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredPersonas.map((persona) => (
              <motion.div
                key={persona.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow flex flex-col"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Brain className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate">
                        {persona.name}
                      </h3>
                    </div>
                    {persona.persona_role && (
                      <p className="text-sm text-purple-600 dark:text-purple-400 font-medium mb-1">
                        {persona.persona_role}
                      </p>
                    )}
                    {persona.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                        {persona.description}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                      Created: {formatDate(persona.created_at)}
                    </p>
                    <div className="flex items-center gap-2 mb-3">
                      <code className="flex-1 text-xs font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded truncate">
                        {persona.public_id}
                      </code>
                      <button
                        onClick={() => copyPublicId(persona.public_id)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                      >
                        {copiedId === persona.public_id ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {persona.system_prompt && (
                      <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                          System Prompt
                        </p>
                        <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-2">
                          {persona.system_prompt}
                        </p>
                      </div>
                    )}
                    <div className="flex items-center justify-between gap-2 mt-auto">
                      <button
                        onClick={() =>
                          navigate(`/dashboard/chat?persona=${persona.id}`)
                        }
                        className="flex-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-medium transition-colors"
                      >
                        Use Persona
                      </button>
                      <button
                        onClick={() =>
                          navigate(`/dashboard/create?type=persona&edit=${persona.id}`)
                        }
                        className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, title, description, actionLabel, onAction }) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-10 text-center">
      <Icon className="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-500" />
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
        {title}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        {description}
      </p>
      <button
        onClick={onAction}
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
      >
        <Plus className="w-4 h-4" />
        {actionLabel}
      </button>
    </div>
  );
}
