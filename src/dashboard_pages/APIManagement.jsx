"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { useTheme } from "../contexts/ThemeContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Badge } from "../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog"
import { Switch } from "../components/ui/switch"

const SimpleLineChart = ({ data, title, theme }) => (
  <div className="space-y-4">
    <h4 className={`text-sm font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{title}</h4>
    <div
      className={`h-48 flex items-end space-x-1 border-b border-l pl-4 pb-4 ${theme === "dark" ? "border-gray-600" : "border-gray-300"}`}
    >
      {data.map((item, index) => (
        <div key={index} className="flex flex-col items-center space-x-1 flex-1">
          <div
            className="bg-gradient-to-t from-pink-500 to-purple-600 w-full rounded-t"
            style={{ height: `${Math.max((item.total / Math.max(...data.map((d) => d.total))) * 160, 4)}px` }}
          />
          <span className={`text-xs rotate-45 origin-left ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
            {item.date}
          </span>
        </div>
      ))}
    </div>
  </div>
)

const SimplePieChart = ({ data, title, theme }) => (
  <div className="space-y-4">
    <h4 className={`text-sm font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{title}</h4>
    <div className="space-y-2">
      {data.map((item, index) => {
        const colors = ["bg-pink-500", "bg-purple-500", "bg-pink-400"]
        const total = data.reduce((sum, d) => sum + d.value, 0)
        const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0
        return (
          <div key={index} className="flex items-center space-x-3">
            <div className={`w-4 h-4 rounded ${colors[index % colors.length]}`} />
            <span className={`text-sm flex-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
              {item.name}
            </span>
            <span className={`text-sm font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              {percentage}%
            </span>
          </div>
        )
      })}
    </div>
  </div>
)

const APIManagement = () => {
  const { user, supabase } = useAuth()
  const { theme } = useTheme()
  const [apiKeys, setApiKeys] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [usageData, setUsageData] = useState({ daily: [], endpoints: [] })
  const [visibleKeys, setVisibleKeys] = useState({})
  const [creating, setCreating] = useState(false)

  const [newKeyForm, setNewKeyForm] = useState({
    name: "",
    allowedEndpoints: ["audio_generation", "video_generation", "avatar_creation"],
  })

  const [usage, setUsage] = useState(null)

  useEffect(() => {
    if (user) {
      fetchApiKeys()
      fetchUsageData()
      fetchUsageStats()
    }
  }, [user])

  const fetchApiKeys = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/api-keys`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        })
        if (response.ok) {
          const result = await response.json()
          if (result.success) {
            setApiKeys(result.data)
            return
          }
        }
      }

      // Fallback to direct Supabase query
      const { data, error } = await supabase
        .from("api_keys")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      setApiKeys(data || [])
    } catch (error) {
      console.error("Error fetching API keys:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUsageData = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/api-usage/analytics`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        })
        if (response.ok) {
          const result = await response.json()
          if (result.success) {
            setUsageData(result.data)
            return
          }
        }
      }

      // Fallback with empty data
      setUsageData({ daily: [], endpoints: [] })
    } catch (error) {
      console.error("Error fetching usage data:", error)
      setUsageData({ daily: [], endpoints: [] })
    }
  }

  const fetchUsageStats = async () => {
    if (!user) return
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/api-usage/stats`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        })
        if (response.ok) {
          const result = await response.json()
          if (result.success) {
            setUsage({
              ...result.data,
              apiCalls: { used: 0, limit: 10000, remaining: 10000 },
            })
            return
          }
        }
      }

      const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/usage/stats`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          // Map existing usage data to API format
          setUsage({
            ...result.data,
            apiCalls: { used: 0, limit: 10000, remaining: 10000 },
          })
        }
      }
    } catch (error) {
      console.error("Error fetching usage stats:", error)
      setUsage({
        apiCalls: { used: 0, limit: 10000, remaining: 10000 },
        currentPlan: "Free",
      })
    }
  }

  const createApiKey = async () => {
    if (!newKeyForm.name.trim()) {
      alert("Please enter a name for your API key")
      return
    }

    setCreating(true)
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/api-keys/create`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            name: newKeyForm.name,
            allowedEndpoints: newKeyForm.allowedEndpoints,
          }),
        })

        const result = await response.json()
        if (response.ok && result.success) {
          alert(
            `API Key Created Successfully!\n\nKey: ${result.data.key}\n\nSave this key securely - you won't be able to see it again!`,
          )
          setShowCreateDialog(false)
          setNewKeyForm({
            name: "",
            allowedEndpoints: ["audio_generation", "video_generation", "avatar_creation"],
          })
          fetchApiKeys()
          return
        } else {
          throw new Error(result.message || "Failed to create API key")
        }
      }
    } catch (error) {
      console.error("Error creating API key:", error)
      alert(`Error creating API key: ${error.message}`)
    } finally {
      setCreating(false)
    }
  }

  const toggleKeyVisibility = (keyId) => {
    setVisibleKeys((prev) => ({
      ...prev,
      [keyId]: !prev[keyId],
    }))
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    alert("Copied to clipboard!")
  }

  const revokeApiKey = async (keyId) => {
    if (!confirm("Are you sure you want to revoke this API key? This action cannot be undone.")) {
      return
    }

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/api-keys/${keyId}/revoke`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        })
        if (response.ok) {
          fetchApiKeys()
          return
        }
      }

      // Fallback to direct Supabase
      const { error } = await supabase.from("api_keys").update({ is_active: false }).eq("id", keyId)
      if (error) throw error
      fetchApiKeys()
    } catch (error) {
      console.error("Error revoking API key:", error)
      alert("Error revoking API key. Please try again.")
    }
  }

  const handleCreateFirstApiKey = () => {
    setShowCreateDialog(true)
  }

  if (loading) {
    return (
      <div
        className={`flex items-center justify-center min-h-screen ${theme === "dark" ? "bg-gray-900" : "bg-gray-50"}`}
      >
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  return (
    <div
      className={`container mx-auto p-4 sm:p-6 space-y-6 min-h-screen ${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl sm:text-3xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            API Management
          </h1>
          <p className={`${theme === "dark" ? "text-gray-400" : "text-gray-600"} mt-2 text-sm sm:text-base`}>
            Manage your API keys and monitor usage across all endpoints
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white w-full sm:w-auto">
              + Create API Key
            </Button>
          </DialogTrigger>
          <DialogContent
            className={`max-w-md ${theme === "dark" ? "bg-gray-800 text-white border-gray-700" : "bg-white text-gray-900 border-gray-200"}`}
          >
            <DialogHeader>
              <DialogTitle className={theme === "dark" ? "text-white" : "text-gray-900"}>
                Create New API Key
              </DialogTitle>
              <DialogDescription className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
                Generate a new API key for accessing MetaPresence APIs
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className={theme === "dark" ? "text-gray-200" : "text-gray-700"}>
                  Key Name
                </Label>
                <Input
                  id="name"
                  value={newKeyForm.name}
                  onChange={(e) => setNewKeyForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="My App API Key"
                  className={theme === "dark" ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : ""}
                />
              </div>

              <div>
                <Label className={theme === "dark" ? "text-gray-200" : "text-gray-700"}>Activate Endpoints</Label>
                <div className="space-y-3 mt-2">
                  {["audio_generation", "video_generation", "avatar_creation"].map((endpoint) => (
                    <div key={endpoint} className="flex items-center justify-between">
                      <Label className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                        {endpoint.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                      </Label>
                      <Switch
                        checked={newKeyForm.allowedEndpoints.includes(endpoint)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setNewKeyForm((prev) => ({
                              ...prev,
                              allowedEndpoints: [...prev.allowedEndpoints, endpoint],
                            }))
                          } else {
                            setNewKeyForm((prev) => ({
                              ...prev,
                              allowedEndpoints: prev.allowedEndpoints.filter((e) => e !== endpoint),
                            }))
                          }
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCreateDialog(false)
                    setNewKeyForm({
                      name: "",
                      allowedEndpoints: ["audio_generation", "video_generation", "avatar_creation"],
                    })
                  }}
                  disabled={creating}
                  className={`w-full sm:w-auto ${theme === "dark" ? "border-gray-600 text-gray-300 hover:bg-gray-700" : ""}`}
                >
                  Cancel
                </Button>
                <Button
                  onClick={createApiKey}
                  disabled={!newKeyForm.name.trim() || creating}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white w-full sm:w-auto"
                >
                  {creating ? "Creating..." : "Create API Key"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="keys" className="space-y-6">
        <TabsList className={`grid w-full grid-cols-3 ${theme === "dark" ? "bg-gray-800" : ""}`}>
          <TabsTrigger value="keys" className={theme === "dark" ? "data-[state=active]:bg-gray-700" : ""}>
            API Keys
          </TabsTrigger>
          <TabsTrigger value="analytics" className={theme === "dark" ? "data-[state=active]:bg-gray-700" : ""}>
            Analytics
          </TabsTrigger>
          <TabsTrigger value="usage" className={theme === "dark" ? "data-[state=active]:bg-gray-700" : ""}>
            Usage Limits
          </TabsTrigger>
        </TabsList>

        <TabsContent value="keys" className="space-y-4">
          {apiKeys.length === 0 ? (
            <Card className={theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                    theme === "dark" ? "bg-gray-700" : "bg-gray-100"
                  }`}
                >
                  🔑
                </div>
                <h3 className={`text-lg font-semibold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                  No API Keys Yet
                </h3>
                <p className={`text-center mb-4 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                  Create your first API key to start using MetaPresence APIs
                </p>
                <Button
                  onClick={handleCreateFirstApiKey}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
                >
                  Create Your First API Key
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {apiKeys.map((apiKey) => (
                <Card
                  key={apiKey.id}
                  className={`${!apiKey.is_active ? "opacity-60" : ""} ${
                    theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                  }`}
                >
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle
                          className={`flex flex-wrap items-center gap-2 ${theme === "dark" ? "text-white" : ""}`}
                        >
                          <span className="break-all">{apiKey.name}</span>
                          <Badge variant={apiKey.is_active ? "default" : "destructive"}>
                            {apiKey.is_active ? "Active" : "Revoked"}
                          </Badge>
                          <Badge variant="outline">{apiKey.environment || "production"}</Badge>
                        </CardTitle>
                        <CardDescription className={theme === "dark" ? "text-gray-400" : ""}>
                          {apiKey.description || "No description"}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button variant="outline" size="sm" onClick={() => toggleKeyVisibility(apiKey.id)}>
                          {visibleKeys[apiKey.id] ? "👁️" : "🙈"}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => copyToClipboard(apiKey.prefix + "...")}>
                          📋
                        </Button>
                        {apiKey.is_active && (
                          <Button variant="destructive" size="sm" onClick={() => revokeApiKey(apiKey.id)}>
                            🗑️
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label
                          className={`text-sm font-medium ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}
                        >
                          API Key
                        </Label>
                        <div className="flex items-center gap-2 mt-1">
                          <code
                            className={`flex-1 p-2 rounded text-sm font-mono break-all ${
                              theme === "dark"
                                ? "bg-gray-700 text-gray-200 border-gray-600"
                                : "bg-gray-50 text-gray-800 border-gray-200"
                            } border`}
                          >
                            {visibleKeys[apiKey.id]
                              ? apiKey.prefix + "..."
                              : apiKey.prefix + "••••••••••••••••••••••••••••••••"}
                          </code>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                          <Label className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                            Created
                          </Label>
                          <p className={theme === "dark" ? "text-gray-200" : ""}>
                            {new Date(apiKey.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <Label className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                            Last Used
                          </Label>
                          <p className={theme === "dark" ? "text-gray-200" : ""}>
                            {apiKey.last_used_at ? new Date(apiKey.last_used_at).toLocaleDateString() : "Never"}
                          </p>
                        </div>
                        <div>
                          <Label className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                            Rate Limits
                          </Label>
                          <p className={theme === "dark" ? "text-gray-200" : ""}>
                            {apiKey.rate_limit_per_minute || 60}/min, {apiKey.rate_limit_per_hour || 1000}/hr
                          </p>
                        </div>
                        <div>
                          <Label className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                            Endpoints
                          </Label>
                          <p className={theme === "dark" ? "text-gray-200" : ""}>
                            {apiKey.allowed_endpoints?.length || 0} enabled
                          </p>
                        </div>
                      </div>

                      {apiKey.allowed_endpoints && (
                        <div>
                          <Label className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                            Allowed Endpoints
                          </Label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {apiKey.allowed_endpoints.map((endpoint) => (
                              <Badge key={endpoint} variant="secondary" className="text-xs">
                                {endpoint.replace("_", " ")}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className={theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}>
              <CardHeader>
                <CardTitle className={theme === "dark" ? "text-white" : ""}>Daily Usage (Last 30 Days)</CardTitle>
                <CardDescription className={theme === "dark" ? "text-gray-400" : ""}>
                  API usage across all endpoints
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SimpleLineChart data={usageData.daily} title="Daily API Calls" theme={theme} />
              </CardContent>
            </Card>

            <Card className={theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}>
              <CardHeader>
                <CardTitle className={theme === "dark" ? "text-white" : ""}>Usage by Endpoint</CardTitle>
                <CardDescription className={theme === "dark" ? "text-gray-400" : ""}>
                  Distribution of API calls
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SimplePieChart data={usageData.endpoints} title="Endpoint Distribution" theme={theme} />
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className={theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>This Month</p>
                    <p className={`text-2xl font-bold ${theme === "dark" ? "text-white" : ""}`}>
                      {usage?.apiCalls?.used || usageData.daily?.reduce((sum, d) => sum + d.total, 0)?.toFixed(1) || 0}
                    </p>
                  </div>
                  <div className="text-2xl">📊</div>
                </div>
              </CardContent>
            </Card>

            <Card className={theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>Active Keys</p>
                    <p className={`text-2xl font-bold ${theme === "dark" ? "text-white" : ""}`}>
                      {apiKeys.filter((k) => k.is_active).length}
                    </p>
                  </div>
                  <div className="text-2xl">🔑</div>
                </div>
              </CardContent>
            </Card>

            <Card className={theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>Endpoints</p>
                    <p className={`text-2xl font-bold ${theme === "dark" ? "text-white" : ""}`}>
                      {usageData.endpoints?.length || 3}
                    </p>
                  </div>
                  <div className="text-2xl">⚡</div>
                </div>
              </CardContent>
            </Card>

            <Card className={theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>Plan</p>
                    <p className={`text-lg font-bold ${theme === "dark" ? "text-white" : ""}`}>
                      {usage?.currentPlan || "Free"}
                    </p>
                  </div>
                  <div className="text-2xl">💎</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="usage" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className={theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${theme === "dark" ? "text-white" : ""}`}>
                  <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                  API Calls
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className={`flex justify-between text-sm ${theme === "dark" ? "text-gray-300" : ""}`}>
                    <span>This Month</span>
                    <span>
                      {usage?.apiCalls?.used || 0} / {usage?.apiCalls?.limit || 10000} calls
                    </span>
                  </div>
                  <div className={`w-full ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"} rounded-full h-2`}>
                    <div
                      className="bg-pink-500 h-2 rounded-full"
                      style={{ width: `${usage?.apiCalls?.percentage || 0}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${theme === "dark" ? "text-white" : ""}`}>
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  Video Generation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className={`flex justify-between text-sm ${theme === "dark" ? "text-gray-300" : ""}`}>
                    <span>This Month</span>
                    <span>
                      {usage?.videoGeneration?.used || 0} / {usage?.videoGeneration?.limit || 500} minutes
                    </span>
                  </div>
                  <div className={`w-full ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"} rounded-full h-2`}>
                    <div
                      className="bg-purple-500 h-2 rounded-full"
                      style={{ width: `${usage?.videoGeneration?.percentage || 0}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${theme === "dark" ? "text-white" : ""}`}>
                  <div className="w-3 h-3 bg-pink-400 rounded-full"></div>
                  Avatar Creation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className={`flex justify-between text-sm ${theme === "dark" ? "text-gray-300" : ""}`}>
                    <span>This Month</span>
                    <span>
                      {usage?.avatarCreation?.used || 0} / {usage?.avatarCreation?.limit || 10} avatars
                    </span>
                  </div>
                  <div className={`w-full ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"} rounded-full h-2`}>
                    <div
                      className="bg-pink-400 h-2 rounded-full"
                      style={{ width: `${usage?.avatarCreation?.percentage || 0}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default APIManagement
