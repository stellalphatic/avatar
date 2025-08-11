"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { useTheme } from "../contexts/ThemeContext"
import supabase from "../supabaseClient"
import { Link } from "react-router-dom"
import { Video, ChevronDown, X, Search, UserPlus, Wand2, Loader2, Play, Eye, AlertTriangle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const MAGIC_PHRASES = [
  "Welcome to our innovative platform! Discover amazing features that will transform your business.",
  "Hello! I'm excited to share how our AI technology can help you achieve your goals.",
  "Attention entrepreneurs! Our cutting-edge solution is designed to boost your productivity.",
  "Hi there! Let me introduce you to the future of digital communication and engagement.",
  "Greetings! Experience the power of personalized AI avatars for your business needs.",
  "Welcome! Our platform combines advanced AI with user-friendly design for optimal results.",
  "Hello everyone! Join thousands of satisfied customers who trust our innovative solutions.",
  "Hi! Ready to revolutionize your workflow with our state-of-the-art AI technology?",
]

const AvatarModal = ({ isOpen, onClose, onSelect, avatars, theme }) => {
  const [tab, setTab] = useState("personal")
  const [searchTerm, setSearchTerm] = useState("")

  const personalAvatars = avatars.filter((a) => !a.is_public)
  const stockAvatars = avatars.filter((a) => a.is_public)

  const filteredAvatars = (tab === "personal" ? personalAvatars : stockAvatars).filter((avatar) =>
    avatar.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={`${theme === "dark" ? "bg-gray-800" : "bg-white"} rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6`}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>Select an Avatar</h2>
          <button
            onClick={onClose}
            className={`${theme === "dark" ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"} transition-colors`}
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex items-center space-x-4 mb-6">
          <div className="flex space-x-2 text-sm">
            <button
              onClick={() => setTab("personal")}
              className={`px-4 py-2 rounded-full font-medium transition-colors ${
                tab === "personal"
                  ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white"
                  : `${theme === "dark" ? "bg-gray-700 text-gray-300 hover:bg-pink-500" : "bg-gray-200 text-gray-700 hover:bg-pink-500 hover:text-white"}`
              }`}
            >
              Personal ({personalAvatars.length})
            </button>
            <button
              onClick={() => setTab("stock")}
              className={`px-4 py-2 rounded-full font-medium transition-colors ${
                tab === "stock"
                  ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white"
                  : `${theme === "dark" ? "bg-gray-700 text-gray-300 hover:bg-pink-500" : "bg-gray-200 text-gray-700 hover:bg-pink-500 hover:text-white"}`
              }`}
            >
              Stock ({stockAvatars.length})
            </button>
          </div>
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full ${theme === "dark" ? "bg-gray-700 text-gray-200" : "bg-gray-100 text-gray-900"} rounded-full py-2 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-shadow`}
            />
            <Search
              className={`absolute right-3 top-1/2 -translate-y-1/2 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
              size={20}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {tab === "personal" && (
            <Link
              to="/dashboard/avatars/create"
              className={`${theme === "dark" ? "bg-gray-700 border-gray-500 hover:border-pink-500" : "bg-gray-50 border-gray-300 hover:border-pink-500"} rounded-xl border border-dashed flex items-center justify-center p-6 text-center transition-colors cursor-pointer group`}
            >
              <div className="text-center">
                <UserPlus className="h-8 w-8 mx-auto mb-2 text-pink-500 group-hover:text-pink-600" />
                <span className="text-pink-500 group-hover:text-pink-600 font-medium">Create Avatar</span>
              </div>
            </Link>
          )}

          {filteredAvatars.map((avatar) => (
            <motion.div
              key={avatar.id}
              whileHover={{ scale: 1.05 }}
              onClick={() => onSelect(avatar)}
              className={`relative ${theme === "dark" ? "bg-gray-700" : "bg-gray-100"} rounded-xl overflow-hidden cursor-pointer group transition-all duration-300 hover:shadow-xl`}
            >
              <div className="aspect-square">
                <img
                  src={avatar.image_url || "/placeholder.svg"}
                  alt={avatar.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = `/placeholder.svg?height=300&width=300&text=${encodeURIComponent(avatar.name)}`
                  }}
                />
              </div>
              <div className="p-4">
                <h3 className={`${theme === "dark" ? "text-white" : "text-gray-900"} font-semibold text-lg truncate`}>
                  {avatar.name}
                </h3>
                <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"} truncate`}>
                  {avatar.persona_role || "Custom Avatar"}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredAvatars.length === 0 && (
          <div className="text-center py-12">
            <p className={`${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              {tab === "personal"
                ? "No personal avatars found. Create your first avatar!"
                : "No stock avatars available."}
            </p>
          </div>
        )}
      </motion.div>
    </div>
  )
}

const VideoGeneration = () => {
  const { user } = useAuth()
  const { theme } = useTheme()
  const [inputTab, setInputTab] = useState("script")
  const [script, setScript] = useState("")
  const [selectedAvatar, setSelectedAvatar] = useState(null)
  const [avatars, setAvatars] = useState([])
  const [showAvatarModal, setShowAvatarModal] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [recentVideos, setRecentVideos] = useState([])
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState("info")
  const [additionalSettingsOpen, setAdditionalSettingsOpen] = useState(false)
  const [quality, setQuality] = useState("high")
  const [videoOptions, setVideoOptions] = useState(null)
  const [usage, setUsage] = useState(null)

  // Fetch avatars and recent videos
  useEffect(() => {
    const fetchAvatars = async () => {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from("avatars")
          .select("*")
          .or(`user_id.eq.${user.id},is_public.eq.true`)
          .order("created_at", { ascending: false })

        if (error) throw error
        setAvatars(data || [])
      } catch (error) {
        console.error("Error fetching avatars:", error)
        showMessage("Failed to load avatars", "error")
      }
    }

    const fetchRecentVideos = async () => {
      if (!user) return

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session) {
          const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/video-generation/history`, {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          })

          if (response.ok) {
            const result = await response.json()
            if (result.success) {
              setRecentVideos(result.data.videos.slice(0, 6))
            }
          }
        }
      } catch (error) {
        console.error("Error fetching recent videos:", error)
      }
    }

    const fetchVideoOptions = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/video-generation/options`)

        if (response.ok) {
          const result = await response.json()
          if (result.success) {
            setVideoOptions(result.data)
          }
        }
      } catch (error) {
        console.error("Error fetching video options:", error)
      }
    }

    fetchAvatars()
    fetchRecentVideos()
    fetchVideoOptions()
  }, [user])

  useEffect(() => {
    const fetchUsageStats = async () => {
      if (!user) return

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session) {
          const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/usage/stats`, {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          })

          if (response.ok) {
            const result = await response.json()
            if (result.success) {
              setUsage(result.data)
            }
          }
        }
      } catch (error) {
        console.error("Error fetching usage stats:", error)
      }
    }

    fetchUsageStats()
  }, [user])

  const showMessage = (text, type = "info") => {
    setMessage(text)
    setMessageType(type)
    setTimeout(() => setMessage(""), 5000)
  }

  const handleMagicWrite = () => {
    const randomPhrase = MAGIC_PHRASES[Math.floor(Math.random() * MAGIC_PHRASES.length)]
    setScript(randomPhrase)
  }

  const handleGenerate = async () => {
    if (!script.trim()) {
      showMessage("Please enter a script for your video", "error")
      return
    }

    if (!selectedAvatar) {
      showMessage("Please select an avatar for your video", "error")
      return
    }

    // Check usage limits
    if (usage && usage.videoGeneration.remaining <= 0) {
      showMessage("You have exceeded your monthly video generation limit. Please upgrade your plan.", "error")
      return
    }

    setIsGenerating(true)
    setMessage("")

    try {
      // Get the session to get the access token
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        throw new Error("No active session found")
      }

      const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/video-generation/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          avatarId: selectedAvatar.id,
          text: script,
          quality: quality,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || "Route not found")
      }

      const result = await response.json()

      if (result.success) {
        showMessage(
          `Video generation started! This may take ${quality === "high" ? "2-5 minutes" : "30-60 seconds"}.`,
          "success",
        )
        setScript("")

        // Refresh recent videos and usage after a short delay
        setTimeout(() => {
          fetchRecentVideos()
          fetchUsageStats()
        }, 2000)
      } else {
        throw new Error(result.message || "Failed to generate video")
      }
    } catch (error) {
      console.error("Error generating video:", error)
      showMessage(error.message || "Failed to start video generation", "error")
    } finally {
      setIsGenerating(false)
    }
  }

  const fetchRecentVideos = async () => {
    if (!user) return

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/video-generation/history`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        })

        if (response.ok) {
          const result = await response.json()
          if (result.success) {
            setRecentVideos(result.data.videos.slice(0, 6))
          }
        }
      }
    } catch (error) {
      console.error("Error fetching recent videos:", error)
    }
  }

  const fetchUsageStats = async () => {
    if (!user) return

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/usage/stats`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        })

        if (response.ok) {
          const result = await response.json()
          if (result.success) {
            setUsage(result.data)
          }
        }
      }
    } catch (error) {
      console.error("Error fetching usage stats:", error)
    }
  }

  return (
    <div
      className={`${theme === "dark" ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"} min-h-screen flex flex-col lg:flex-row p-4 lg:p-8 space-y-8 lg:space-y-0 lg:space-x-8`}
    >
      {/* Left Panel - Input Section */}
      <div className="lg:w-1/2 xl:w-2/5 flex flex-col space-y-6">
        {/* Input Section */}
        <div
          className={`${theme === "dark" ? "bg-gray-800" : "bg-white"} rounded-xl p-6 shadow-lg flex-grow flex flex-col`}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Input</h2>
            <button
              onClick={handleMagicWrite}
              className="flex items-center space-x-2 text-pink-500 hover:text-pink-600 transition-colors"
              title="Generate random script"
            >
              <Wand2 size={20} />
              <span className="text-sm font-medium">Magic Write</span>
            </button>
          </div>

          {/* Avatar Selection */}
          <div className="mb-6">
            <label className={`block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"} mb-2`}>
              Avatar
            </label>
            <div
              onClick={() => setShowAvatarModal(true)}
              className={`flex items-center justify-between ${theme === "dark" ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-100 hover:bg-gray-200"} rounded-lg p-3 cursor-pointer transition-colors`}
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`w-10 h-10 rounded-full overflow-hidden ${theme === "dark" ? "bg-gray-600" : "bg-gray-300"} flex-shrink-0`}
                >
                  {selectedAvatar ? (
                    <img
                      src={selectedAvatar.image_url || "/placeholder.svg"}
                      alt={selectedAvatar.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className={`w-full h-full flex items-center justify-center text-sm font-bold ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
                    >
                      ?
                    </div>
                  )}
                </div>
                <div>
                  <p className={`font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                    {selectedAvatar?.name || "Select Avatar"}
                  </p>
                  <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                    {selectedAvatar ? "Selected" : "Click to choose"}
                  </p>
                </div>
              </div>
              <ChevronDown size={20} />
            </div>
          </div>

          {/* Script/Audio Tabs */}
          <div className={`flex space-x-2 border-b ${theme === "dark" ? "border-gray-700" : "border-gray-200"} mb-4`}>
            <button
              onClick={() => setInputTab("script")}
              className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
                inputTab === "script"
                  ? "border-pink-500 text-pink-500"
                  : `border-transparent ${theme === "dark" ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"}`
              }`}
            >
              Script to Video
            </button>
            <button
              onClick={() => setInputTab("audio")}
              className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
                inputTab === "audio"
                  ? "border-pink-500 text-pink-500"
                  : `border-transparent ${theme === "dark" ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"}`
              }`}
            >
              Audio to Video
            </button>
          </div>

          {/* Script Input */}
          {inputTab === "script" && (
            <div className="flex-grow">
              <textarea
                className={`w-full h-40 ${theme === "dark" ? "bg-gray-700 text-gray-200" : "bg-gray-100 text-gray-900"} rounded-lg p-4 resize-none focus:outline-none focus:ring-2 focus:ring-pink-500 transition-shadow text-sm`}
                placeholder="Enter your script here... Click 'Magic Write' for inspiration!"
                value={script}
                onChange={(e) => setScript(e.target.value)}
              />
              <div className="flex justify-between items-center mt-2">
                <span className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                  {script.length} characters
                </span>
                {videoOptions && (
                  <span className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                    Max: {videoOptions.maxTextLength} characters
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Audio Input (Coming Soon) */}
          {inputTab === "audio" && (
            <div
              className={`flex-grow flex items-center justify-center ${theme === "dark" ? "bg-gray-700" : "bg-gray-100"} rounded-lg`}
            >
              <div className="text-center p-8">
                <Video className={`h-12 w-12 mx-auto mb-4 ${theme === "dark" ? "text-gray-600" : "text-gray-400"}`} />
                <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                  Audio-to-Video functionality is coming soon!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Quality Settings */}
        <div className={`${theme === "dark" ? "bg-gray-800" : "bg-white"} rounded-xl shadow-lg p-6`}>
          <button
            onClick={() => setAdditionalSettingsOpen(!additionalSettingsOpen)}
            className="w-full flex justify-between items-center text-lg font-bold transition-colors"
          >
            Quality Settings
            <ChevronDown className={`h-5 w-5 transition-transform ${additionalSettingsOpen ? "rotate-180" : ""}`} />
          </button>

          <AnimatePresence>
            {additionalSettingsOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 space-y-4"
              >
                <div>
                  <label
                    className={`block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"} mb-2`}
                  >
                    Video Quality
                  </label>
                  <div className="space-y-2">
                    {videoOptions?.qualities?.map((q) => (
                      <label key={q.name} className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name="quality"
                          value={q.name}
                          checked={quality === q.name}
                          onChange={(e) => setQuality(e.target.value)}
                          className="text-pink-500 focus:ring-pink-500"
                        />
                        <div>
                          <div className={`font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                            {q.name === "high" ? "High Quality" : "Fast Generation"}
                          </div>
                          <div className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                            {q.description} • {q.estimatedTime}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Usage Display */}
        {usage && (
          <div className={`${theme === "dark" ? "bg-gray-800" : "bg-white"} rounded-xl shadow-lg p-6`}>
            <h3 className="text-lg font-bold mb-4">Usage</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Video Generation Minutes</span>
                  <span>
                    {usage.videoGeneration.used.toFixed(1)}/{usage.videoGeneration.limit}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-pink-500 h-2 rounded-full"
                    style={{ width: `${usage.videoGeneration.percentage}%` }}
                  />
                </div>
                <p className={`text-xs mt-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                  {usage.videoGeneration.remaining.toFixed(1)} minutes remaining
                </p>
              </div>
            </div>
            {usage.videoGeneration.remaining <= 0 && (
              <div className="mt-3 p-2 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertTriangle size={16} className="text-red-500" />
                  <span className="text-sm text-red-700 dark:text-red-400">You've reached your monthly limit</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={
            isGenerating || !script.trim() || !selectedAvatar || (usage && usage.videoGeneration.remaining <= 0)
          }
          className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-4 rounded-full text-lg shadow-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300 transform active:scale-95 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center space-x-2"
        >
          {isGenerating && <Loader2 className="animate-spin h-5 w-5" />}
          <span>{isGenerating ? "Generating Video..." : "Generate Video →"}</span>
        </button>

        {/* Message Display */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`p-4 rounded-lg text-center font-medium ${
                messageType === "success"
                  ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                  : messageType === "error"
                    ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                    : "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
              }`}
            >
              {message}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right Panel - Preview and Recent Videos */}
      <div className="lg:w-1/2 xl:w-3/5 flex flex-col space-y-8">
        {/* Preview Section */}
        <div className={`${theme === "dark" ? "bg-gray-800" : "bg-white"} rounded-xl p-6 shadow-lg`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Preview</h2>
            <div className="flex space-x-2 text-sm font-medium">
              <button className="px-3 py-1 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white">
                Video
              </button>
            </div>
          </div>
          <div
            className={`w-full aspect-video ${theme === "dark" ? "bg-gray-900" : "bg-gray-100"} rounded-lg overflow-hidden flex items-center justify-center relative`}
          >
            {isGenerating ? (
              <div className="text-center">
                <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-pink-500" />
                <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                  Generating your video...
                </p>
                <p className={`text-xs mt-2 ${theme === "dark" ? "text-gray-500" : "text-gray-500"}`}>
                  This may take {quality === "high" ? "2-5 minutes" : "30-60 seconds"}
                </p>
              </div>
            ) : (
              <div className={`text-center ${theme === "dark" ? "text-gray-400" : "text-gray-600"} text-sm`}>
                <Video className="h-12 w-12 mx-auto mb-2" />
                <p>Your video preview will appear here</p>
                {selectedAvatar && <p className="mt-2 text-xs">Selected: {selectedAvatar.name}</p>}
              </div>
            )}
          </div>
        </div>

        {/* Recent Videos */}
        <div className={`${theme === "dark" ? "bg-gray-800" : "bg-white"} rounded-xl p-6 shadow-lg flex-grow`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Recent Videos</h2>
            <Link
              to="/dashboard/video/library"
              className="text-pink-500 hover:text-pink-600 transition-colors text-sm font-medium flex items-center space-x-1"
            >
              <span>View All</span>
              <Eye size={16} />
            </Link>
          </div>

          {recentVideos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentVideos.slice(0, 6).map((video) => (
                <motion.div
                  key={video.id}
                  whileHover={{ scale: 1.02 }}
                  className={`relative aspect-video ${theme === "dark" ? "bg-gray-900" : "bg-gray-100"} rounded-lg overflow-hidden shadow-md group`}
                >
                  {video.video_url ? (
                    <video
                      src={video.video_url}
                      className="w-full h-full object-cover"
                      poster={video.avatars?.image_url}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Loader2 className="animate-spin h-6 w-6 text-pink-500" />
                    </div>
                  )}

                  {!video.video_url && (
                    <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center text-white text-sm font-semibold">
                      <div className="text-center">
                        <Loader2 className="animate-spin h-5 w-5 mx-auto mb-2" />
                        Processing...
                      </div>
                    </div>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-sm font-medium truncate">{video.prompt?.substring(0, 30)}...</p>
                    <p className="text-gray-300 text-xs">{video.avatars?.name}</p>
                  </div>

                  {video.video_url && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="h-8 w-8 text-white bg-black bg-opacity-50 rounded-full p-2" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className={`text-center p-12 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              <Video className={`h-12 w-12 mx-auto ${theme === "dark" ? "text-gray-600" : "text-gray-400"}`} />
              <p className="mt-4">Your generated videos will appear here</p>
              <p className="text-sm mt-2">Create your first video to get started!</p>
            </div>
          )}
        </div>
      </div>

      {/* Avatar Selection Modal */}
      <AnimatePresence>
        {showAvatarModal && (
          <AvatarModal
            isOpen={showAvatarModal}
            onClose={() => setShowAvatarModal(false)}
            onSelect={(avatar) => {
              setSelectedAvatar(avatar)
              setShowAvatarModal(false)
            }}
            avatars={avatars}
            theme={theme}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default VideoGeneration
