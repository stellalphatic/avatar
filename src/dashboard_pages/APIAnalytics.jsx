"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import supabase from "../supabaseClient";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  BarChart3,
  TrendingUp,
  Activity,
  Zap,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Calendar,
  Users,
  MessageSquare,
} from "lucide-react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";

const COLORS = {
  voice: "#10b981",
  video: "#3b82f6",
  audio: "#f59e0b",
  avatar: "#ef4444",
  success: "#10b981",
  error: "#ef4444",
};

const APIAnalytics = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("7d");
  const [selectedApiKey, setSelectedApiKey] = useState("all");
  const [apiKeys, setApiKeys] = useState([]);
  const [analyticsData, setAnalyticsData] = useState({
    overview: {
      totalConversations: 0,
      totalVoiceMinutes: 0,
      totalVideoMinutes: 0,
      averageDuration: 0,
    },
    conversationTrend: [],
    usageByType: [],
    recentConversations: [],
    apiKeyUsage: [],
  });

  useEffect(() => {
    if (user) {
      fetchAnalyticsData();
      // Auto-refresh every 60 seconds
      const interval = setInterval(fetchAnalyticsData, 60000);
      return () => clearInterval(interval);
    }
  }, [user, timeRange, selectedApiKey]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) return;

      // Fetch API keys for filtering
      const keysRes = await fetch(
        `${import.meta.env.VITE_BACKEND_API_URL}/api/keys`,
        {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }
      );

      if (keysRes.ok) {
        const keysData = await keysRes.json();
        setApiKeys(keysData.data || []);
      }

      // Fetch conversations with filters
      const startDate = getStartDate(timeRange);
      let conversationsQuery = supabase
        .from("conversations")
        .select("*, avatars(name), api_keys(name)")
        .eq("user_id", user.id)
        .gte("created_at", startDate)
        .order("created_at", { ascending: false });

      if (selectedApiKey !== "all") {
        conversationsQuery = conversationsQuery.eq(
          "api_key_id",
          selectedApiKey
        );
      }

      const { data: conversations, error } = await conversationsQuery;

      if (!error && conversations) {
        processAnalyticsData(conversations);
      }

      // Fetch API key usage stats
      if (selectedApiKey === "all") {
        const { data: keyUsage } = await supabase
          .from("api_key_usage")
          .select("*, api_keys(name)")
          .eq("user_id", user.id)
          .gte("created_at", startDate);

        if (keyUsage) {
          processApiKeyUsage(keyUsage);
        }
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
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
      case "90d":
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
      default:
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    }
  };

  const processAnalyticsData = (conversations) => {
    // Overview stats
    const totalConversations = conversations.length;
    const voiceConvs = conversations.filter(
      (c) => c.conversation_type === "voice"
    );
    const videoConvs = conversations.filter(
      (c) => c.conversation_type === "video"
    );

    const totalVoiceMinutes = voiceConvs.reduce(
      (sum, c) => sum + (c.duration_minutes || 0),
      0
    );
    const totalVideoMinutes = videoConvs.reduce(
      (sum, c) => sum + (c.duration_minutes || 0),
      0
    );

    const totalMinutes = totalVoiceMinutes + totalVideoMinutes;
    const averageDuration =
      totalConversations > 0 ? totalMinutes / totalConversations : 0;

    // Conversation trend by day
    const trendMap = {};
    conversations.forEach((conv) => {
      const date = new Date(conv.created_at).toLocaleDateString();
      if (!trendMap[date]) {
        trendMap[date] = {
          date,
          voice: 0,
          video: 0,
          total: 0,
        };
      }
      trendMap[date][conv.conversation_type] += 1;
      trendMap[date].total += 1;
    });

    const conversationTrend = Object.values(trendMap).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    // Usage by type (for pie chart)
    const usageByType = [
      {
        name: "Voice",
        value: voiceConvs.length,
        minutes: totalVoiceMinutes,
        color: COLORS.voice,
      },
      {
        name: "Video",
        value: videoConvs.length,
        minutes: totalVideoMinutes,
        color: COLORS.video,
      },
    ];

    // Recent conversations (top 10)
    const recentConversations = conversations.slice(0, 10);

    setAnalyticsData({
      overview: {
        totalConversations,
        totalVoiceMinutes,
        totalVideoMinutes,
        averageDuration,
      },
      conversationTrend,
      usageByType,
      recentConversations,
    });
  };

  const processApiKeyUsage = (keyUsage) => {
    const keyMap = {};
    keyUsage.forEach((usage) => {
      const keyName = usage.api_keys?.name || "Unknown";
      if (!keyMap[keyName]) {
        keyMap[keyName] = {
          name: keyName,
          calls: 0,
          minutes: 0,
        };
      }
      keyMap[keyName].calls += usage.api_calls || 0;
      keyMap[keyName].minutes += usage.duration_minutes || 0;
    });

    const apiKeyUsage = Object.values(keyMap);
    setAnalyticsData((prev) => ({ ...prev, apiKeyUsage }));
  };

  const formatDuration = (minutes) => {
    if (minutes < 1) return `${Math.round(minutes * 60)}s`;
    if (minutes < 60) return `${minutes.toFixed(1)}m`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Analytics & Insights</h1>
            <p className="text-muted-foreground">
              Monitor your API usage, track conversations, and analyze
              performance
            </p>
          </div>
          <div className="flex gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24 hours</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedApiKey} onValueChange={setSelectedApiKey}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All API Keys" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All API Keys</SelectItem>
                {apiKeys.map((key) => (
                  <SelectItem key={key.id} value={key.id}>
                    {key.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Conversations
                </p>
                <p className="text-2xl font-bold">
                  {analyticsData.overview.totalConversations}
                </p>
              </div>
              <MessageSquare className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Voice Minutes
                </p>
                <p className="text-2xl font-bold">
                  {analyticsData.overview.totalVoiceMinutes.toFixed(1)}
                </p>
              </div>
              <Zap className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Video Minutes
                </p>
                <p className="text-2xl font-bold">
                  {analyticsData.overview.totalVideoMinutes.toFixed(1)}
                </p>
              </div>
              <Activity className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Avg Duration
                </p>
                <p className="text-2xl font-bold">
                  {formatDuration(analyticsData.overview.averageDuration)}
                </p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="usage">Usage Details</TabsTrigger>
          <TabsTrigger value="conversations">Recent Activity</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Conversation Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Conversation Trend</CardTitle>
              <CardDescription>
                Daily conversation volume over the selected period
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analyticsData.conversationTrend.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No conversation data available for this period</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analyticsData.conversationTrend}>
                    <defs>
                      <linearGradient
                        id="voiceGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor={COLORS.voice}
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor={COLORS.voice}
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient
                        id="videoGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor={COLORS.video}
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor={COLORS.video}
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: theme === "dark" ? "#888" : "#666" }}
                    />
                    <YAxis
                      tick={{ fill: theme === "dark" ? "#888" : "#666" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: theme === "dark" ? "#1f2937" : "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="voice"
                      stackId="1"
                      stroke={COLORS.voice}
                      fill="url(#voiceGradient)"
                      name="Voice"
                    />
                    <Area
                      type="monotone"
                      dataKey="video"
                      stackId="1"
                      stroke={COLORS.video}
                      fill="url(#videoGradient)"
                      name="Video"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Usage Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Usage by Type</CardTitle>
                <CardDescription>
                  Distribution of voice vs video conversations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {analyticsData.usageByType.every((item) => item.value === 0) ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No usage data available</p>
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={analyticsData.usageByType.filter(
                            (item) => item.value > 0
                          )}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) =>
                            `${name}: ${(percent * 100).toFixed(0)}%`
                          }
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {analyticsData.usageByType.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor:
                              theme === "dark" ? "#1f2937" : "#fff",
                            border: "1px solid #e5e7eb",
                            borderRadius: "8px",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* API Key Usage */}
            {selectedApiKey === "all" && analyticsData.apiKeyUsage && (
              <Card>
                <CardHeader>
                  <CardTitle>Usage by API Key</CardTitle>
                  <CardDescription>
                    API calls and minutes per key
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {analyticsData.apiKeyUsage.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No API key usage data</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={analyticsData.apiKeyUsage}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis
                          dataKey="name"
                          tick={{ fill: theme === "dark" ? "#888" : "#666" }}
                        />
                        <YAxis
                          tick={{ fill: theme === "dark" ? "#888" : "#666" }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor:
                              theme === "dark" ? "#1f2937" : "#fff",
                            border: "1px solid #e5e7eb",
                            borderRadius: "8px",
                          }}
                        />
                        <Bar
                          dataKey="calls"
                          fill={COLORS.voice}
                          name="API Calls"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Usage Details Tab */}
        <TabsContent value="usage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Usage Metrics</CardTitle>
              <CardDescription>
                Comprehensive breakdown of your API usage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Voice Conversations */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-green-500" />
                      <h3 className="font-semibold">Voice Conversations</h3>
                    </div>
                    <Badge variant="secondary">
                      {analyticsData.usageByType[0]?.value || 0} conversations
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pl-7">
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        Total Minutes
                      </p>
                      <p className="text-xl font-bold">
                        {analyticsData.overview.totalVoiceMinutes.toFixed(1)}
                      </p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        Avg Duration
                      </p>
                      <p className="text-xl font-bold">
                        {analyticsData.usageByType[0]?.value > 0
                          ? formatDuration(
                              analyticsData.overview.totalVoiceMinutes /
                                analyticsData.usageByType[0].value
                            )
                          : "0m"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Video Conversations */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-blue-500" />
                      <h3 className="font-semibold">Video Conversations</h3>
                    </div>
                    <Badge variant="secondary">
                      {analyticsData.usageByType[1]?.value || 0} conversations
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pl-7">
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        Total Minutes
                      </p>
                      <p className="text-xl font-bold">
                        {analyticsData.overview.totalVideoMinutes.toFixed(1)}
                      </p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        Avg Duration
                      </p>
                      <p className="text-xl font-bold">
                        {analyticsData.usageByType[1]?.value > 0
                          ? formatDuration(
                              analyticsData.overview.totalVideoMinutes /
                                analyticsData.usageByType[1].value
                            )
                          : "0m"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recent Activity Tab */}
        <TabsContent value="conversations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Conversations</CardTitle>
              <CardDescription>
                Latest conversations from your applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analyticsData.recentConversations.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No recent conversations</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {analyticsData.recentConversations.map((conv) => (
                    <div
                      key={conv.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{conv.name}</h4>
                          <Badge
                            variant={
                              conv.conversation_type === "voice"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {conv.conversation_type}
                          </Badge>
                          {conv.status === "completed" ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          ) : conv.status === "failed" ? (
                            <XCircle className="w-4 h-4 text-red-500" />
                          ) : null}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(conv.created_at).toLocaleString()}
                          </span>
                          {conv.duration_minutes && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDuration(conv.duration_minutes)}
                            </span>
                          )}
                          {conv.avatars?.name && (
                            <span>Avatar: {conv.avatars.name}</span>
                          )}
                          {conv.api_keys?.name && (
                            <span>Key: {conv.api_keys.name}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default APIAnalytics;
