import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import supabase from "../supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import {
  Key,
  Copy,
  Trash2,
  Plus,
  AlertCircle,
  CheckCircle2,
  Shield,
  Zap,
  Loader2,
  FileCode,
  Activity,
  MessageSquare,
  X,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

// Cache
const cache = {
  apiKeys: null,
  usage: null,
  timestamp: null,
};

const CACHE_DURATION = 3 * 60 * 1000;

const COLORS = {
  voice: "#10b981",
  video: "#3b82f6",
};

export default function APIManagement() {
  const { user } = useAuth();
  const { theme } = useTheme();

  // Main state
  const [loading, setLoading] = useState(true);
  const [apiKeys, setApiKeys] = useState([]);
  const [usage, setUsage] = useState(null);
  const [activeTab, setActiveTab] = useState("keys");

  // UI state
  const [copiedKey, setCopiedKey] = useState(null);
  const [error, setError] = useState("");

  // Create dialog
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [newKeyData, setNewKeyData] = useState({
    name: "",
    environment: "production",
    allow_voice: true,
    allow_video: false,
    allow_avatar_generation: false,
    allow_audio_generation: false,
    allow_video_generation: false,
    expires_in_days: "",
  });
  const [createdKey, setCreatedKey] = useState(null);

  // Delete dialog
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [keyToDelete, setKeyToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Analytics
  const [timeRange, setTimeRange] = useState("7d");
  const [selectedKeyFilter, setSelectedKeyFilter] = useState("all");
  const [analyticsData, setAnalyticsData] = useState({
    trend: [],
    byType: [],
    byKey: [],
    total: 0,
  });

  // Check cache
  const isCacheValid = () => {
    return cache.timestamp && Date.now() - cache.timestamp < CACHE_DURATION;
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  useEffect(() => {
    if (user && activeTab === "analytics") fetchAnalytics();
  }, [user, activeTab, timeRange, selectedKeyFilter]);

  const fetchData = async () => {
    try {
      if (isCacheValid()) {
        setApiKeys(cache.apiKeys || []);
        setUsage(cache.usage);
        setLoading(false);
        return;
      }

      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      // Fetch API keys
      const keysRes = await fetch(
        `${import.meta.env.VITE_BACKEND_API_URL}/keys`,
        {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }
      );

      if (keysRes.ok) {
        const keysData = await keysRes.json();
        cache.apiKeys = keysData.data || [];
        setApiKeys(cache.apiKeys);
      }

      // Fetch usage stats
      const usageRes = await fetch(
        `${import.meta.env.VITE_BACKEND_API_URL}/usage/stats`,
        {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }
      );

      if (usageRes.ok) {
        const usageData = await usageRes.json();
        cache.usage = usageData.data;
        setUsage(cache.usage);
      }

      cache.timestamp = Date.now();
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const startDate = getStartDate(timeRange);
      let query = supabase
        .from("conversations")
        .select("*, api_keys(name)")
        .eq("user_id", user.id)
        .gte("created_at", startDate)
        .order("created_at", { ascending: false });

      if (selectedKeyFilter !== "all") {
        query = query.eq("api_key_id", selectedKeyFilter);
      }

      const { data: conversations } = await query;

      if (conversations) {
        processAnalytics(conversations);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    }
  };

  const getStartDate = (range) => {
    const now = new Date();
    switch (range) {
      case "24h":
        return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      case "7d":
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      case "30d":
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      default:
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    }
  };

  const processAnalytics = (conversations) => {
    const trendMap = {};
    conversations.forEach((conv) => {
      const date = new Date(conv.created_at).toLocaleDateString();
      if (!trendMap[date]) {
        trendMap[date] = { date, voice: 0, video: 0 };
      }
      trendMap[date][conv.conversation_type] += 1;
    });

    const trend = Object.values(trendMap).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    const voiceCount = conversations.filter(
      (c) => c.conversation_type === "voice"
    ).length;
    const videoCount = conversations.filter(
      (c) => c.conversation_type === "video"
    ).length;

    const byType = [
      { name: "Voice", value: voiceCount, color: COLORS.voice },
      { name: "Video", value: videoCount, color: COLORS.video },
    ];

    const keyMap = {};
    conversations.forEach((conv) => {
      const keyName = conv.api_keys?.name || "Direct";
      if (!keyMap[keyName]) {
        keyMap[keyName] = { name: keyName, count: 0 };
      }
      keyMap[keyName].count += 1;
    });

    const byKey = Object.values(keyMap);

    setAnalyticsData({
      trend,
      byType,
      byKey,
      total: conversations.length,
    });
  };

  const handleCreateKey = async () => {
    try {
      if (!newKeyData.name.trim()) {
        setError("API key name is required");
        return;
      }

      if (
        newKeyData.expires_in_days &&
        (isNaN(parseInt(newKeyData.expires_in_days)) ||
          parseInt(newKeyData.expires_in_days) < 1 ||
          parseInt(newKeyData.expires_in_days) > 365)
      ) {
        setError("Expiration must be between 1 and 365 days");
        return;
      }

      setCreateLoading(true);
      setError("");

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_API_URL}/keys`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            ...newKeyData,
            expires_in_days: newKeyData.expires_in_days
              ? parseInt(newKeyData.expires_in_days)
              : null,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create API key");
      }

      const result = await response.json();
      setCreatedKey(result.data);
      cache.timestamp = null;
      await fetchData();

      setNewKeyData({
        name: "",
        environment: "production",
        allow_voice: true,
        allow_video: false,
        allow_avatar_generation: false,
        allow_audio_generation: false,
        allow_video_generation: false,
        expires_in_days: "",
      });
    } catch (error) {
      console.error("Error creating API key:", error);
      setError(error.message);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeleteKey = async () => {
    if (!keyToDelete) return;

    try {
      setDeleteLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_API_URL}/keys/${keyToDelete.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${session.access_token}` },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete API key");
      }

      cache.timestamp = null;
      await fetchData();
      setShowDeleteDialog(false);
      setKeyToDelete(null);
    } catch (error) {
      console.error("Error deleting API key:", error);
      setError(error.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggleKeyStatus = async (keyId, currentStatus) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_API_URL}/keys/${keyId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ is_active: !currentStatus }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update API key");
      }

      cache.timestamp = null;
      await fetchData();
    } catch (error) {
      console.error("Error updating API key:", error);
      setError(error.message);
    }
  };

  const copyToClipboard = (text, keyId) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyId);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getPermissions = (key) => {
    const perms = [];
    if (key.allow_voice) perms.push("Voice");
    if (key.allow_video) perms.push("Video");
    if (key.allow_avatar_generation) perms.push("Avatar");
    if (key.allow_audio_generation) perms.push("Audio");
    if (key.allow_video_generation) perms.push("Video Gen");
    return perms.join(", ") || "None";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const isExpired = (expiresAt) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            API Management
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage your API keys and monitor usage
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCreateDialog(true)}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium flex items-center gap-2 hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          Create API Key
        </motion.button>
      </div>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
          <button
            onClick={() => setError("")}
            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <Key className="w-5 h-5 text-purple-600" />
            <Shield className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {
              apiKeys.filter((k) => k.is_active && !isExpired(k.expires_at))
                .length
            }
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Active Keys
          </p>
        </div>

        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <MessageSquare className="w-5 h-5 text-green-600" />
            <Activity className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {usage?.voiceConversation?.used?.toFixed(1) || 0}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Voice Minutes
          </p>
        </div>

        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <FileCode className="w-5 h-5 text-blue-600" />
            <Activity className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {usage?.videoConversation?.used?.toFixed(1) || 0}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Video Minutes
          </p>
        </div>

        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <Zap className="w-5 h-5 text-yellow-600" />
            <TrendingUp className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {usage?.currentPlan || "Free"}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Plan</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab("keys")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "keys"
              ? "text-purple-600 border-b-2 border-purple-600"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          API Keys
        </button>
        <button
          onClick={() => setActiveTab("analytics")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "analytics"
              ? "text-purple-600 border-b-2 border-purple-600"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          Analytics
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "keys" && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          {apiKeys.length === 0 ? (
            <div className="p-12 text-center">
              <Key className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No API Keys Yet
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Create your first API key to integrate MetaPresence
              </p>
              <button
                onClick={() => setShowCreateDialog(true)}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create API Key
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Key Prefix
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Environment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Permissions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Expires
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Last Used
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {apiKeys.map((apiKey) => {
                    const expired = isExpired(apiKey.expires_at);
                    return (
                      <tr
                        key={apiKey.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {apiKey.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-mono text-gray-600 dark:text-gray-400">
                            {apiKey.prefix}•••
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400">
                            {apiKey.environment}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {expired ? (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 flex items-center gap-1 w-fit">
                              <AlertTriangle className="w-3 h-3" />
                              Expired
                            </span>
                          ) : (
                            <button
                              onClick={() =>
                                handleToggleKeyStatus(
                                  apiKey.id,
                                  apiKey.is_active
                                )
                              }
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                apiKey.is_active
                                  ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
                                  : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-400"
                              }`}
                            >
                              {apiKey.is_active ? "Active" : "Inactive"}
                            </button>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">
                            {getPermissions(apiKey)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(apiKey.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {apiKey.expires_at
                            ? formatDate(apiKey.expires_at)
                            : "Never"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(apiKey.last_used_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {!expired && (
                            <button
                              onClick={() => {
                                setKeyToDelete(apiKey);
                                setShowDeleteDialog(true);
                              }}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "analytics" && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>

            <select
              value={selectedKeyFilter}
              onChange={(e) => setSelectedKeyFilter(e.target.value)}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
            >
              <option value="all">All API Keys</option>
              {apiKeys.map((key) => (
                <option key={key.id} value={key.id}>
                  {key.name}
                </option>
              ))}
            </select>
          </div>

          {/* Total Conversations */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Total Conversations
            </h3>
            <p className="text-3xl font-bold text-purple-600">
              {analyticsData.total}
            </p>
          </div>

          {/* Trend Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Conversation Trend
            </h3>
            {analyticsData.trend.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analyticsData.trend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="voice"
                    stackId="1"
                    stroke={COLORS.voice}
                    fill={COLORS.voice}
                  />
                  <Area
                    type="monotone"
                    dataKey="video"
                    stackId="1"
                    stroke={COLORS.video}
                    fill={COLORS.video}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-12">
                No data available
              </p>
            )}
          </div>

          {/* Type Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                By Type
              </h3>
              {analyticsData.byType.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={analyticsData.byType}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analyticsData.byType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-500 text-center py-12">No data</p>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                By API Key
              </h3>
              {analyticsData.byKey.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={analyticsData.byKey}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-500 text-center py-12">No data</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create API Key Dialog */}
      <AnimatePresence>
        {showCreateDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => !createLoading && setShowCreateDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Create API Key
                </h2>
                <button
                  onClick={() => !createLoading && setShowCreateDialog(false)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {createdKey ? (
                <div className="p-6">
                  <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-green-800 dark:text-green-400 mb-1">
                          API Key Created Successfully
                        </p>
                        <p className="text-xs text-green-700 dark:text-green-500">
                          This is the only time you&apos;ll see this key. Copy it now
                          and store it securely.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Your API Key
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={createdKey.key}
                          readOnly
                          className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg font-mono text-sm"
                        />
                        <button
                          onClick={() => copyToClipboard(createdKey.key, "new")}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          {copiedKey === "new" ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : (
                            <Copy className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setCreatedKey(null);
                        setShowCreateDialog(false);
                      }}
                      className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={newKeyData.name}
                      onChange={(e) =>
                        setNewKeyData({ ...newKeyData, name: e.target.value })
                      }
                      placeholder="e.g., Production API Key"
                      className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      disabled={createLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Environment
                    </label>
                    <select
                      value={newKeyData.environment}
                      onChange={(e) =>
                        setNewKeyData({
                          ...newKeyData,
                          environment: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      disabled={createLoading}
                    >
                      <option value="production">Production</option>
                      <option value="development">Development</option>
                      <option value="staging">Staging</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Expires In (Days)
                    </label>
                    <input
                      type="number"
                      value={newKeyData.expires_in_days}
                      onChange={(e) =>
                        setNewKeyData({
                          ...newKeyData,
                          expires_in_days: e.target.value,
                        })
                      }
                      placeholder="Optional (leave empty for no expiration)"
                      min="1"
                      max="365"
                      className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      disabled={createLoading}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Valid range: 1-365 days
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Permissions
                    </label>
                    <div className="space-y-2">
                      {[
                        { key: "allow_voice", label: "Voice Conversations" },
                        { key: "allow_video", label: "Video Conversations" },
                        {
                          key: "allow_avatar_generation",
                          label: "Avatar Generation",
                        },
                        {
                          key: "allow_audio_generation",
                          label: "Audio Generation",
                        },
                        {
                          key: "allow_video_generation",
                          label: "Video Generation",
                        },
                      ].map((perm) => (
                        <label
                          key={perm.key}
                          className="flex items-center gap-2"
                        >
                          <input
                            type="checkbox"
                            checked={newKeyData[perm.key]}
                            onChange={(e) =>
                              setNewKeyData({
                                ...newKeyData,
                                [perm.key]: e.target.checked,
                              })
                            }
                            className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                            disabled={createLoading}
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {perm.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() =>
                        !createLoading && setShowCreateDialog(false)
                      }
                      disabled={createLoading}
                      className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateKey}
                      disabled={createLoading}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {createLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        "Create API Key"
                      )}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {showDeleteDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => !deleteLoading && setShowDeleteDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full"
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Delete API Key
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      This cannot be undone
                    </p>
                  </div>
                </div>

                <p className="text-sm text-gray-700 dark:text-gray-300 mb-6">
                  Delete &quot;{keyToDelete?.name}&quot;? Apps using this key will stop
                  working.
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => !deleteLoading && setShowDeleteDialog(false)}
                    disabled={deleteLoading}
                    className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteKey}
                    disabled={deleteLoading}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {deleteLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
