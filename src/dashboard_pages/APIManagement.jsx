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

  useEffect(() => {
    if (user) {
      fetchApiKeys()
      fetchUsageData()
    }
  }, [user])

  const fetchApiKeys = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        try {
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
        } catch (backendError) {
          // Silent fallback to Supabase
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
        try {
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
        } catch (backendError) {
          // Silent fallback
        }
      }

      // Fallback to direct Supabase query
      const { data, error } = await supabase
        .from("api_usage")
        .select(`
          *,
          api_keys!inner(name)
        `)
        .eq("user_id", user.id)
        .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order("created_at", { ascending: true })

      if (error) throw error

      const processedData = processUsageData(data || [])
      setUsageData(processedData)
    } catch (error) {
      console.error("Error fetching usage data:", error)
    }
  }

  const processUsageData = (data) => {
    const dailyUsage = {}
    const endpointUsage = { audio_generation: 0, video_generation: 0, avatar_creation: 0 }

    data.forEach((record) => {
      const date = new Date(record.created_at).toLocaleDateString()
      if (!dailyUsage[date]) {
        dailyUsage[date] = { date, audio: 0, video: 0, avatar: 0, total: 0 }
      }

      const amount = Number.parseFloat(record.usage_amount) || 0
      dailyUsage[date][record.endpoint_type.split("_")[0]] += amount
      dailyUsage[date].total += amount
      endpointUsage[record.endpoint_type] += amount
    })

    return {
      daily: Object.values(dailyUsage),
      endpoints: Object.entries(endpointUsage).map(([key, value]) => ({
        name: key.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        value: value,
      })),
    }
  }

  const generateApiKey = () => {
    const prefix = "mp_"
    const key =
      prefix +
      Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
    return { key, prefix }
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
        try {
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
          }
        } catch (backendError) {
          // Silent fallback
        }
      }

      // Fallback to direct Supabase creation
      const { key, prefix } = generateApiKey()
      const keyHash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(key))
      const hashArray = Array.from(new Uint8Array(keyHash))
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")

      const { data, error } = await supabase
        .from("api_keys")
        .insert([
          {
            user_id: user.id,
            name: newKeyForm.name,
            key_hash: hashHex,
            prefix: prefix,
            allowed_endpoints: newKeyForm.allowedEndpoints,
            rate_limit_per_minute: 60,
            rate_limit_per_hour: 1000,
            rate_limit_per_day: 10000,
            is_active: true,
          },
        ])
        .select()
        .single()

      if (error) throw error

      alert(
        `API Key Created Successfully!\n\nKey: ${key}\n\nSave this key securely - you won't be able to see it again!`,
      )

      setShowCreateDialog(false)
      setNewKeyForm({
        name: "",
        allowedEndpoints: ["audio_generation", "video_generation", "avatar_creation"],
      })
      fetchApiKeys()
    } catch (error) {
      console.error("Error creating API key:", error)
      alert("Error creating API key. Please try again.")
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
        try {
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
        } catch (backendError) {
          // Silent fallback
        }
      }

      // Fallback to direct Supabase
      const { error } = await supabase.from("api_keys").update({ is_active: false }).eq("id", keyId)
      if (error) throw error
      fetchApiKeys()
    } catch (error) {
      console.error("Error revoking API key:", error)
    }
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
      className={`container mx-auto p-6 space-y-6 ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"} min-h-screen`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>API Management</h1>
          <p className={`${theme === "dark" ? "text-gray-400" : "text-gray-600"} mt-2`}>
            Manage your API keys and monitor usage across all endpoints
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white">
              + Create API Key
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New API Key</DialogTitle>
              <DialogDescription>Generate a new API key for accessing MetaPresence APIs</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Key Name</Label>
                <Input
                  id="name"
                  value={newKeyForm.name}
                  onChange={(e) => setNewKeyForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="My App API Key"
                />
              </div>

              <div>
                <Label>Activate Endpoints</Label>
                <div className="space-y-3 mt-2">
                  {["audio_generation", "video_generation", "avatar_creation"].map((endpoint) => (
                    <div key={endpoint} className="flex items-center justify-between">
                      <Label className="text-sm">
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

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)} disabled={creating}>
                  Cancel
                </Button>
                <Button
                  onClick={createApiKey}
                  disabled={!newKeyForm.name.trim() || creating}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
                >
                  {creating ? "Creating..." : "Create API Key"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="keys" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="keys">API Keys</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="usage">Usage Limits</TabsTrigger>
        </TabsList>

        <TabsContent value="keys" className="space-y-4">
          {apiKeys.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div
                  className={`w-12 h-12 ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"} rounded-full flex items-center justify-center mb-4`}
                >
                  🔑
                </div>
                <h3 className={`text-lg font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"} mb-2`}>
                  No API Keys Yet
                </h3>
                <p className={`${theme === "dark" ? "text-gray-400" : "text-gray-600"} text-center mb-4`}>
                  Create your first API key to start using MetaPresence APIs
                </p>
                <Button
                  onClick={() => setShowCreateDialog(true)}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
                >
                  Create Your First API Key
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {apiKeys.map((apiKey) => (
                <Card key={apiKey.id} className={`${!apiKey.is_active ? "opacity-60" : ""}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {apiKey.name}
                          <Badge variant={apiKey.is_active ? "default" : "destructive"}>
                            {apiKey.is_active ? "Active" : "Revoked"}
                          </Badge>
                          <Badge variant="outline">{apiKey.environment || "production"}</Badge>
                        </CardTitle>
                        <CardDescription>{apiKey.description || "No description"}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
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
                        <Label className="text-sm font-medium">API Key</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <code
                            className={`flex-1 p-2 ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"} rounded text-sm font-mono`}
                          >
                            {visibleKeys[apiKey.id]
                              ? apiKey.prefix + "..."
                              : apiKey.prefix + "••••••••••••••••••••••••••••••••"}
                          </code>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <Label className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                            Created
                          </Label>
                          <p>{new Date(apiKey.created_at).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <Label className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                            Last Used
                          </Label>
                          <p>{apiKey.last_used_at ? new Date(apiKey.last_used_at).toLocaleDateString() : "Never"}</p>
                        </div>
                        <div>
                          <Label className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                            Rate Limits
                          </Label>
                          <p>
                            {apiKey.rate_limit_per_minute || 60}/min, {apiKey.rate_limit_per_hour || 1000}/hr
                          </p>
                        </div>
                        <div>
                          <Label className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                            Endpoints
                          </Label>
                          <p>{apiKey.allowed_endpoints?.length || 0} enabled</p>
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
            <Card>
              <CardHeader>
                <CardTitle>Daily Usage (Last 30 Days)</CardTitle>
                <CardDescription>API usage across all endpoints</CardDescription>
              </CardHeader>
              <CardContent>
                <SimpleLineChart data={usageData.daily} title="Daily API Calls" theme={theme} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Usage by Endpoint</CardTitle>
                <CardDescription>Distribution of API calls</CardDescription>
              </CardHeader>
              <CardContent>
                <SimplePieChart data={usageData.endpoints} title="Endpoint Distribution" theme={theme} />
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">This Month</p>
                    <p className="text-2xl font-bold">
                      {usageData.daily?.reduce((sum, d) => sum + d.total, 0)?.toFixed(1) || 0}
                    </p>
                  </div>
                  <div className="text-2xl">📊</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Active Keys</p>
                    <p className="text-2xl font-bold">{apiKeys.filter((k) => k.is_active).length}</p>
                  </div>
                  <div className="text-2xl">🔑</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Endpoints</p>
                    <p className="text-2xl font-bold">{usageData.endpoints?.length || 0}</p>
                  </div>
                  <div className="text-2xl">⚡</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Avg Daily</p>
                    <p className="text-2xl font-bold">
                      {(
                        usageData.daily?.reduce((sum, d) => sum + d.total, 0) /
                        Math.max(usageData.daily?.length || 1, 1)
                      )?.toFixed(1) || 0}
                    </p>
                  </div>
                  <div className="text-2xl">📈</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="usage" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                  Audio Generation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>This Month</span>
                    <span>45 / 1000 minutes</span>
                  </div>
                  <div className={`w-full ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"} rounded-full h-2`}>
                    <div className="bg-pink-500 h-2 rounded-full" style={{ width: "4.5%" }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  Video Generation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>This Month</span>
                    <span>12 / 500 minutes</span>
                  </div>
                  <div className={`w-full ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"} rounded-full h-2`}>
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: "2.4%" }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-pink-400 rounded-full"></div>
                  Avatar Creation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>This Month</span>
                    <span>3 / 10 avatars</span>
                  </div>
                  <div className={`w-full ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"} rounded-full h-2`}>
                    <div className="bg-pink-400 h-2 rounded-full" style={{ width: "30%" }}></div>
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
