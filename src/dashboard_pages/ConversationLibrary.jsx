import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import supabase from "../supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  Search,
  Calendar,
  Clock,
  MessageSquare,
  Video,
  Mic,
  ChevronDown,
  ChevronRight,
  User,
  Brain,
  Download,
} from "lucide-react";

// Cache outside component
const cache = {
  conversations: null,
  timestamp: null,
};

const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

export default function ConversationLibrary() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [filteredConversations, setFilteredConversations] = useState([]);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [languageFilter, setLanguageFilter] = useState("all");

  // Expanded conversation for transcript
  const [expandedId, setExpandedId] = useState(null);
  const [messages, setMessages] = useState({});
  const [loadingMessages, setLoadingMessages] = useState({});

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    voice: 0,
    video: 0,
    totalMinutes: 0,
  });

  useEffect(() => {
    if (user) fetchConversations();
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [
    conversations,
    searchTerm,
    typeFilter,
    statusFilter,
    dateFilter,
    languageFilter,
  ]);

  const isCacheValid = () => {
    return cache.timestamp && Date.now() - cache.timestamp < CACHE_DURATION;
  };

  const fetchConversations = async () => {
    try {
      if (isCacheValid()) {
        console.log("📦 Using cached conversations");
        setConversations(cache.conversations);
        calculateStats(cache.conversations);
        setLoading(false);
        return;
      }

      setLoading(true);

      const { data, error } = await supabase
        .from("conversations")
        .select(
          `
          *,
          avatars (id, name, image_url, public_id),
          personas (id, name, persona_role, public_id)
        `
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      cache.conversations = data || [];
      cache.timestamp = Date.now();

      setConversations(cache.conversations);
      calculateStats(cache.conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (convos) => {
    const total = convos.length;
    const voice = convos.filter((c) => c.conversation_type === "voice").length;
    const video = convos.filter((c) => c.conversation_type === "video").length;
    const totalMinutes = convos.reduce(
      (sum, c) => sum + (c.duration_minutes || 0),
      0
    );

    setStats({ total, voice, video, totalMinutes });
  };

  const applyFilters = () => {
    let filtered = [...conversations];

    // Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.avatars?.name.toLowerCase().includes(term) ||
          c.personas?.name.toLowerCase().includes(term) ||
          c.conversation_language?.toLowerCase().includes(term) ||
          c.id.toLowerCase().includes(term)
      );
    }

    // Type
    if (typeFilter !== "all") {
      filtered = filtered.filter((c) => c.conversation_type === typeFilter);
    }

    // Status
    if (statusFilter !== "all") {
      filtered = filtered.filter((c) => c.status === statusFilter);
    }

    // Date
    if (dateFilter !== "all") {
      const now = new Date();
      filtered = filtered.filter((c) => {
        const convDate = new Date(c.created_at);
        switch (dateFilter) {
          case "today":
            return convDate.toDateString() === now.toDateString();
          case "week":
            { const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return convDate >= weekAgo; }
          case "month":
            { const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            return convDate >= monthAgo; }
          default:
            return true;
        }
      });
    }

    // Language
    if (languageFilter !== "all") {
      filtered = filtered.filter(
        (c) => c.conversation_language === languageFilter
      );
    }

    setFilteredConversations(filtered);
  };

  const fetchMessages = async (conversationId) => {
    if (messages[conversationId]) {
      // Already loaded
      setExpandedId(expandedId === conversationId ? null : conversationId);
      return;
    }

    try {
      setLoadingMessages((prev) => ({ ...prev, [conversationId]: true }));

      const { data, error } = await supabase
        .from("conversation_messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      setMessages((prev) => ({ ...prev, [conversationId]: data || [] }));
      setExpandedId(conversationId);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoadingMessages((prev) => ({ ...prev, [conversationId]: false }));
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  const formatDuration = (minutes) => {
    if (!minutes) return "0m";
    const hrs = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  };

  const downloadTranscript = (conversation) => {
    const msgs = messages[conversation.id] || [];
    const transcript = msgs
      .map((m) => `[${m.sender_type}] ${m.message_text}`)
      .join("\n");

    const blob = new Blob([transcript], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transcript-${conversation.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const uniqueLanguages = [
    ...new Set(
      conversations.map((c) => c.conversation_language).filter(Boolean)
    ),
  ];

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
            Conversation Library
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            View and manage your conversation history
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total Conversations
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {stats.total}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">Voice</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
              {stats.voice}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">Video</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
              {stats.video}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total Time
            </p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
              {formatDuration(stats.totalMinutes)}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-6 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-4">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search conversations..."
                  className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white"
            >
              <option value="all">All Types</option>
              <option value="voice">Voice Only</option>
              <option value="video">Video Only</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="ended">Ended</option>
            </select>

            {/* Date Filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>

            {/* Language Filter */}
            {uniqueLanguages.length > 0 && (
              <select
                value={languageFilter}
                onChange={(e) => setLanguageFilter(e.target.value)}
                className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white"
              >
                <option value="all">All Languages</option>
                {uniqueLanguages.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang.toUpperCase()}
                  </option>
                ))}
              </select>
            )}

            {/* Clear Filters */}
            {(searchTerm ||
              typeFilter !== "all" ||
              statusFilter !== "all" ||
              dateFilter !== "all" ||
              languageFilter !== "all") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setTypeFilter("all");
                  setStatusFilter("all");
                  setDateFilter("all");
                  setLanguageFilter("all");
                }}
                className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Showing {filteredConversations.length} of {conversations.length}{" "}
            conversations
          </p>
        </div>

        {/* Conversation List */}
        {filteredConversations.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No conversations found
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {conversations.length === 0
                ? "Start your first conversation to see it here"
                : "Try adjusting your filters"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredConversations.map((conversation) => (
              <motion.div
                key={conversation.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Main Row */}
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 flex-shrink-0">
                      {conversation.avatars?.image_url ? (
                        <img
                          src={conversation.avatars.image_url}
                          alt={conversation.avatars.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {conversation.avatars?.name || "Unknown Avatar"}
                        </h3>
                        <div className="flex items-center gap-2">
                          {conversation.conversation_type === "voice" ? (
                            <span className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs rounded-full">
                              <Mic className="w-3 h-3" />
                              Voice
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs rounded-full">
                              <Video className="w-3 h-3" />
                              Video
                            </span>
                          )}
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              conversation.status === "active"
                                ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                            }`}
                          >
                            {conversation.status}
                          </span>
                        </div>
                      </div>

                      {conversation.personas && (
                        <div className="flex items-center gap-1 text-sm text-purple-600 dark:text-purple-400 mb-2">
                          <Brain className="w-4 h-4" />
                          {conversation.personas.name}
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(conversation.created_at)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDuration(conversation.duration_minutes)}
                        </div>
                        {conversation.conversation_language && (
                          <div className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">
                            {conversation.conversation_language.toUpperCase()}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => fetchMessages(conversation.id)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="View Transcript"
                      >
                        {expandedId === conversation.id ? (
                          <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Transcript */}
                <AnimatePresence>
                  {expandedId === conversation.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50"
                    >
                      <div className="p-5">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            Transcript
                          </h4>
                          <button
                            onClick={() => downloadTranscript(conversation)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors"
                          >
                            <Download className="w-3 h-3" />
                            Download
                          </button>
                        </div>

                        {loadingMessages[conversation.id] ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                          </div>
                        ) : messages[conversation.id]?.length === 0 ? (
                          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                            No messages in this conversation
                          </p>
                        ) : (
                          <div className="space-y-3 max-h-96 overflow-y-auto">
                            {messages[conversation.id]?.map((msg) => (
                              <div
                                key={msg.id}
                                className={`flex gap-3 ${
                                  msg.sender_type === "user"
                                    ? "justify-end"
                                    : "justify-start"
                                }`}
                              >
                                <div
                                  className={`max-w-[80%] px-4 py-2 rounded-lg ${
                                    msg.sender_type === "user"
                                      ? "bg-blue-600 text-white"
                                      : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
                                  }`}
                                >
                                  <p className="text-sm">{msg.message_text}</p>
                                  <p
                                    className={`text-xs mt-1 ${
                                      msg.sender_type === "user"
                                        ? "text-blue-100"
                                        : "text-gray-500 dark:text-gray-400"
                                    }`}
                                  >
                                    {new Date(
                                      msg.created_at
                                    ).toLocaleTimeString(undefined, {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
