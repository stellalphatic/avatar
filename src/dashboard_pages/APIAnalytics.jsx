"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { BarChart3, TrendingUp, AlertCircle, Activity, Zap } from "lucide-react"
import {
  LineChart,
  Line,
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
} from "recharts"

const APIAnalytics = () => {
  const { user, supabase } = useAuth()
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("7d")
  const [selectedApiKey, setSelectedApiKey] = useState("all")
  const [analyticsData, setAnalyticsData] = useState({
    overview: {},
    usage: [],
    performance: [],
    errors: [],
    apiKeys: [],
    realTime: {},
  })

  useEffect(() => {
    if (user) {
      fetchAnalyticsData()
      // Set up real-time updates every 30 seconds
      const interval = setInterval(fetchRealTimeData, 30000)
      return () => clearInterval(interval)
    }
  }, [user, timeRange, selectedApiKey])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      await Promise.all([
        fetchOverviewData(),
        fetchUsageData(),
        fetchPerformanceData(),
        fetchErrorData(),
        fetchApiKeysData(),
        fetchRealTimeData(),
      ])
    } catch (error) {
      console.error("Error fetching analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchOverviewData = async () => {
    const { data, error } = await supabase
      .from("api_usage")
      .select("endpoint_type, usage_amount, success, created_at")
      .eq("user_id", user.id)
      .gte("created_at", getDateRange(timeRange))

    if (!error && data) {
      const overview = {
        totalRequests: data.length,
        successfulRequests: data.filter((r) => r.success).length,
        totalUsage: data.reduce((sum, r) => sum + Number.parseFloat(r.usage_amount || 0), 0),
        successRate: data.length > 0 ? (data.filter((r) => r.success).length / data.length) * 100 : 0,
      }
      setAnalyticsData((prev) => ({ ...prev, overview }))
    }
  }

  const fetchUsageData = async () => {
    const { data, error } = await supabase
      .from("api_usage")
      .select(`
        endpoint_type,
        usage_amount,
        created_at,
        api_keys!inner(name)
      `)
      .eq("user_id", user.id)
      .gte("created_at", getDateRange(timeRange))
      .order("created_at", { ascending: true })

    if (!error && data) {
      const processedData = processUsageByTime(data)
      setAnalyticsData((prev) => ({ ...prev, usage: processedData }))
    }
  }

  const fetchPerformanceData = async () => {
    const { data, error } = await supabase
      .from("api_request_logs")
      .select("endpoint, response_time_ms, response_status, created_at")
      .eq("user_id", user.id)
      .gte("created_at", getDateRange(timeRange))
      .order("created_at", { ascending: true })

    if (!error && data) {
      const processedData = processPerformanceData(data)
      setAnalyticsData((prev) => ({ ...prev, performance: processedData }))
    }
  }

  const fetchErrorData = async () => {
    const { data, error } = await supabase
      .from("api_request_logs")
      .select("endpoint, response_status, error_message, created_at")
      .eq("user_id", user.id)
      .gte("response_status", 400)
      .gte("created_at", getDateRange(timeRange))
      .order("created_at", { ascending: false })
      .limit(50)

    if (!error && data) {
      setAnalyticsData((prev) => ({ ...prev, errors: data }))
    }
  }

  const fetchApiKeysData = async () => {
    const { data, error } = await supabase
      .from("api_keys")
      .select(`
        id,
        name,
        created_at,
        last_used_at,
        is_active,
        api_usage!inner(endpoint_type, usage_amount, success, created_at)
      `)
      .eq("user_id", user.id)
      .eq("is_active", true)

    if (!error && data) {
      const processedKeys = data.map((key) => ({
        ...key,
        totalRequests: key.api_usage.length,
        successRate:
          key.api_usage.length > 0 ? (key.api_usage.filter((u) => u.success).length / key.api_usage.length) * 100 : 0,
        totalUsage: key.api_usage.reduce((sum, u) => sum + Number.parseFloat(u.usage_amount || 0), 0),
      }))
      setAnalyticsData((prev) => ({ ...prev, apiKeys: processedKeys }))
    }
  }

  const fetchRealTimeData = async () => {
    const now = new Date()
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)

    const { data, error } = await supabase
      .from("api_usage")
      .select("endpoint_type, success, created_at")
      .eq("user_id", user.id)
      .gte("created_at", oneHourAgo.toISOString())

    if (!error && data) {
      const realTime = {
        requestsLastHour: data.length,
        successRateLastHour: data.length > 0 ? (data.filter((r) => r.success).length / data.length) * 100 : 0,
        activeEndpoints: [...new Set(data.map((r) => r.endpoint_type))].length,
      }
      setAnalyticsData((prev) => ({ ...prev, realTime }))
    }
  }

  const getDateRange = (range) => {
    const now = new Date()
    switch (range) {
      case "1d":
        return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
      case "7d":
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
      case "30d":
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
      case "90d":
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString()
      default:
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
    }
  }

  const processUsageByTime = (data) => {
    const grouped = {}
    data.forEach((record) => {
      const date = new Date(record.created_at).toLocaleDateString()
      if (!grouped[date]) {
        grouped[date] = { date, audio: 0, video: 0, avatar: 0, total: 0 }
      }
      const amount = Number.parseFloat(record.usage_amount) || 0
      const type = record.endpoint_type.split("_")[0]
      grouped[date][type] += amount
      grouped[date].total += amount
    })
    return Object.values(grouped).sort((a, b) => new Date(a.date) - new Date(b.date))
  }

  const processPerformanceData = (data) => {
    const grouped = {}
    data.forEach((record) => {
      const hour = new Date(record.created_at).toISOString().slice(0, 13) + ":00:00.000Z"
      if (!grouped[hour]) {
        grouped[hour] = { time: hour, avgResponseTime: 0, requests: 0, errors: 0 }
      }
      grouped[hour].requests += 1
      grouped[hour].avgResponseTime += record.response_time_ms || 0
      if (record.response_status >= 400) {
        grouped[hour].errors += 1
      }
    })

    return Object.values(grouped)
      .map((group) => ({
        ...group,
        avgResponseTime: group.requests > 0 ? group.avgResponseTime / group.requests : 0,
        errorRate: group.requests > 0 ? (group.errors / group.requests) * 100 : 0,
      }))
      .sort((a, b) => new Date(a.time) - new Date(b.time))
  }

  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">API Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Comprehensive analytics and insights for your API usage
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedApiKey} onValueChange={setSelectedApiKey}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All API Keys" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All API Keys</SelectItem>
              {analyticsData.apiKeys.map((key) => (
                <SelectItem key={key.id} value={key.id}>
                  {key.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Real-time Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Requests</p>
                <p className="text-2xl font-bold">{analyticsData.overview.totalRequests?.toLocaleString() || 0}</p>
              </div>
              <Activity className="h-8 w-8 text-emerald-600" />
            </div>
            <div className="flex items-center mt-2">
              <Badge variant="secondary" className="text-xs">
                {analyticsData.realTime.requestsLastHour || 0} last hour
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">{analyticsData.overview.successRate?.toFixed(1) || 0}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <div className="flex items-center mt-2">
              <Badge variant="secondary" className="text-xs">
                {analyticsData.realTime.successRateLastHour?.toFixed(1) || 0}% last hour
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Usage</p>
                <p className="text-2xl font-bold">{analyticsData.overview.totalUsage?.toFixed(1) || 0}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
            <div className="flex items-center mt-2">
              <Badge variant="secondary" className="text-xs">
                minutes
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Endpoints</p>
                <p className="text-2xl font-bold">{analyticsData.realTime.activeEndpoints || 0}</p>
              </div>
              <Zap className="h-8 w-8 text-amber-600" />
            </div>
            <div className="flex items-center mt-2">
              <Badge variant="secondary" className="text-xs">
                last hour
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="usage" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="usage">Usage Trends</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="errors">Error Analysis</TabsTrigger>
          <TabsTrigger value="keys">API Keys</TabsTrigger>
        </TabsList>

        <TabsContent value="usage" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Usage Over Time</CardTitle>
                <CardDescription>API usage across all endpoints</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analyticsData.usage}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="total"
                      stackId="1"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Usage by Endpoint</CardTitle>
                <CardDescription>Breakdown by API endpoint type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Audio", value: analyticsData.usage.reduce((sum, d) => sum + d.audio, 0) },
                        { name: "Video", value: analyticsData.usage.reduce((sum, d) => sum + d.video, 0) },
                        { name: "Avatar", value: analyticsData.usage.reduce((sum, d) => sum + d.avatar, 0) },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[0, 1, 2].map((index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Detailed Usage Breakdown</CardTitle>
              <CardDescription>Usage by endpoint over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={analyticsData.usage}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="audio" stroke="#10b981" strokeWidth={2} />
                  <Line type="monotone" dataKey="video" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="avatar" stroke="#f59e0b" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Response Times</CardTitle>
                <CardDescription>Average response time over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData.performance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" tickFormatter={(time) => new Date(time).toLocaleTimeString()} />
                    <YAxis />
                    <Tooltip labelFormatter={(time) => new Date(time).toLocaleString()} />
                    <Line type="monotone" dataKey="avgResponseTime" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Error Rate</CardTitle>
                <CardDescription>Error rate percentage over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analyticsData.performance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" tickFormatter={(time) => new Date(time).toLocaleTimeString()} />
                    <YAxis />
                    <Tooltip labelFormatter={(time) => new Date(time).toLocaleString()} />
                    <Area type="monotone" dataKey="errorRate" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Request Volume</CardTitle>
              <CardDescription>Number of requests per hour</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.performance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" tickFormatter={(time) => new Date(time).toLocaleTimeString()} />
                  <YAxis />
                  <Tooltip labelFormatter={(time) => new Date(time).toLocaleString()} />
                  <Bar dataKey="requests" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Errors</CardTitle>
              <CardDescription>Latest API errors and issues</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.errors.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">No errors found in the selected time range</p>
                  </div>
                ) : (
                  analyticsData.errors.slice(0, 10).map((error, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="destructive">{error.response_status}</Badge>
                        <div>
                          <p className="font-medium">{error.endpoint}</p>
                          <p className="text-sm text-muted-foreground">{error.error_message || "Unknown error"}</p>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">{new Date(error.created_at).toLocaleString()}</div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="keys" className="space-y-6">
          <div className="grid gap-4">
            {analyticsData.apiKeys.map((apiKey) => (
              <Card key={apiKey.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {apiKey.name}
                        <Badge variant={apiKey.is_active ? "default" : "destructive"}>
                          {apiKey.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        Created {new Date(apiKey.created_at).toLocaleDateString()} • Last used{" "}
                        {apiKey.last_used_at ? new Date(apiKey.last_used_at).toLocaleDateString() : "Never"}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-2xl font-bold text-emerald-600">{apiKey.totalRequests}</p>
                      <p className="text-sm text-muted-foreground">Total Requests</p>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{apiKey.successRate.toFixed(1)}%</p>
                      <p className="text-sm text-muted-foreground">Success Rate</p>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{apiKey.totalUsage.toFixed(1)}</p>
                      <p className="text-sm text-muted-foreground">Total Usage (min)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default APIAnalytics
