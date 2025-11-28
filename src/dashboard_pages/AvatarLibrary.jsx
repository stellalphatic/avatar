import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import supabase from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Loader2,
  User,
  Globe,
  Copy,
  CheckCircle2,
  Sparkles,
  Brain,
} from "lucide-react";
import { motion } from "framer-motion";

export default function AvatarLibrary() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [avatars, setAvatars] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [activeTab, setActiveTab] = useState("avatars");
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch avatars
      const { data: avatarData } = await supabase
        .from("avatars")
        .select("*")
        .or(`is_public.eq.true,is_stock.eq.true`)
        .order("created_at", { ascending: false });

      setAvatars(avatarData || []);

      // Fetch personas
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        const personaRes = await fetch(
          `${import.meta.env.VITE_BACKEND_API_URL}/personas`,
          {
            headers: { Authorization: `Bearer ${session.access_token}` },
          }
        );

        if (personaRes.ok) {
          const data = await personaRes.json();
          const publicPersonas = (data.data || []).filter(
            (p) => p.is_public || p.is_stock
          );
          setPersonas(publicPersonas);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyPublicId = (publicId) => {
    navigator.clipboard.writeText(publicId);
    setCopiedId(publicId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredAvatars = avatars.filter((avatar) => {
    const matchesSearch =
      avatar.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      avatar.public_id?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterType === "all" ||
      (filterType === "stock" && avatar.is_stock) ||
      (filterType === "public" && avatar.is_public);

    return matchesSearch && matchesFilter;
  });

  const filteredPersonas = personas.filter((persona) => {
    const matchesSearch =
      persona.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      persona.public_id?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterType === "all" ||
      (filterType === "stock" && persona.is_stock) ||
      (filterType === "public" && persona.is_public);

    return matchesSearch && matchesFilter;
  });

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Public Library
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Explore public avatars and personas available for everyone
          </p>
        </div>

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
                Avatars ({filteredAvatars.length})
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
                Personas ({filteredPersonas.length})
              </div>
            </button>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Search ${activeTab}...`}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All</option>
            <option value="stock">Stock Only</option>
            <option value="public">Community</option>
          </select>
        </div>

        {/* Content */}
        {activeTab === "avatars" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAvatars.map((avatar) => (
              <motion.div
                key={avatar.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
              >
                {/* Avatar Image */}
                <div className="aspect-square bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 relative">
                  {avatar.image_url ? (
                    <img
                      src={avatar.image_url}
                      alt={avatar.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <User className="w-20 h-20" />
                    </div>
                  )}
                  {/* Badges */}
                  <div className="absolute top-2 right-2 flex gap-2">
                    {avatar.is_stock && (
                      <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Stock
                      </span>
                    )}
                    {avatar.is_public && (
                      <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        Public
                      </span>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1 truncate">
                    {avatar.name}
                  </h3>
                  {avatar.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                      {avatar.description}
                    </p>
                  )}

                  {/* Public ID */}
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

                  <button
                    onClick={() => navigate(`/dashboard/chat?avatar=${avatar.id}`)}
                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                  >
                    Start Conversation
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredPersonas.map((persona) => (
              <motion.div
                key={persona.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Brain className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                        {persona.name}
                      </h3>
                      {persona.is_stock && (
                        <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs rounded-full">
                          Stock
                        </span>
                      )}
                      {persona.is_public && (
                        <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs rounded-full">
                          Public
                        </span>
                      )}
                    </div>
                    {persona.persona_role && (
                      <p className="text-sm text-purple-600 dark:text-purple-400 font-medium mb-2">
                        {persona.persona_role}
                      </p>
                    )}
                    {persona.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {persona.description}
                      </p>
                    )}

                    {/* Public ID */}
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

                    <button
                      onClick={() => navigate(`/dashboard/chat?persona=${persona.id}`)}
                      className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm font-medium"
                    >
                      Use This Persona
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {((activeTab === "avatars" && filteredAvatars.length === 0) ||
          (activeTab === "personas" && filteredPersonas.length === 0)) && (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 mb-2">
              {activeTab === "avatars" ? (
                <User className="w-16 h-16 mx-auto mb-3 opacity-50" />
              ) : (
                <Brain className="w-16 h-16 mx-auto mb-3 opacity-50" />
              )}
              <p className="text-sm">
                No {activeTab} found matching your criteria
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
