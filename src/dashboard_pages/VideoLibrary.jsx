"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { useTheme } from "../contexts/ThemeContext"
import supabase from "../supabaseClient"
import { Link } from "react-router-dom"
import {
  Video,
  Play,
  Download,
  Trash2,
  Search,
  Filter,
  Calendar,
  User,
  Clock,
  Plus,
  Eye,
  Share2,
  MoreVertical,
  X,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const VideoCard = ({ video, theme, onDelete, onView }) => {
  const [showMenu, setShowMenu] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatDuration = (minutes) => {
    if (minutes < 1) return "< 1 min"
    return `${Math.round(minutes)} min`
  }

  const handleDownload = async () => {
    if (video.video_url) {
      try {
        const response = await fetch(video.video_url)
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `video-${video.id}.mp4`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } catch (error) {
        console.error("Error downloading video:", error)
      }
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`relative ${theme === "dark" ? "bg-gray-800" : "bg-white"} rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl group`}
    >
      {/* Video Thumbnail/Player */}
      <div className="relative aspect-video">
        {video.video_url ? (
          <>
            <video
              src={video.video_url}
              className="w-full h-full object-cover"
              poster={video.avatars?.image_url}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              controls={isPlaying}
            />
            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 transition-opacity">
                <Play className="h-12 w-12 text-white bg-black bg-opacity-50 rounded-full p-3 cursor-pointer" />
              </div>
            )}
          </>
        ) : video.status === "failed" ? (
          <div
            className={`w-full h-full ${theme === "dark" ? "bg-red-900" : "bg-red-100"} flex items-center justify-center`}
          >
            <div className="text-center">
              <X className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className={`text-sm ${theme === "dark" ? "text-red-400" : "text-red-600"}`}>Generation Failed</p>
            </div>
          </div>
        ) : (
          <div
            className={`w-full h-full ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"} flex items-center justify-center`}
          >
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-2"></div>
              <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Processing...</p>
            </div>
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-2 left-2">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              video.video_url
                ? "bg-green-500 text-white"
                : video.status === "failed"
                  ? "bg-red-500 text-white"
                  : "bg-yellow-500 text-white"
            }`}
          >
            {video.video_url ? "Ready" : video.status === "failed" ? "Failed" : "Processing"}
          </span>
        </div>

        {/* Menu Button */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70 transition-colors"
            >
              <MoreVertical size={16} />
            </button>

            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={`absolute right-0 mt-2 w-48 ${theme === "dark" ? "bg-gray-700" : "bg-white"} rounded-lg shadow-lg border ${theme === "dark" ? "border-gray-600" : "border-gray-200"} z-10`}
                >
                  <div className="py-1">
                    <button
                      onClick={() => {
                        onView(video)
                        setShowMenu(false)
                      }}
                      className={`w-full text-left px-4 py-2 text-sm ${theme === "dark" ? "text-gray-300 hover:bg-gray-600" : "text-gray-700 hover:bg-gray-100"} flex items-center space-x-2`}
                    >
                      <Eye size={16} />
                      <span>View Details</span>
                    </button>
                    {video.video_url && (
                      <button
                        onClick={() => {
                          handleDownload()
                          setShowMenu(false)
                        }}
                        className={`w-full text-left px-4 py-2 text-sm ${theme === "dark" ? "text-gray-300 hover:bg-gray-600" : "text-gray-700 hover:bg-gray-100"} flex items-center space-x-2`}
                      >
                        <Download size={16} />
                        <span>Download</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(video.video_url || "Processing...")
                        setShowMenu(false)
                      }}
                      className={`w-full text-left px-4 py-2 text-sm ${theme === "dark" ? "text-gray-300 hover:bg-gray-600" : "text-gray-700 hover:bg-gray-100"} flex items-center space-x-2`}
                    >
                      <Share2 size={16} />
                      <span>Copy Link</span>
                    </button>
                    <button
                      onClick={() => {
                        onDelete(video.id)
                        setShowMenu(false)
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2"
                    >
                      <Trash2 size={16} />
                      <span>Delete</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Video Info */}
      <div className="p-4">
        <h3 className={`font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"} truncate mb-2`}>
          {video.prompt?.substring(0, 50)}...
        </h3>

        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm">
            <User size={14} className={theme === "dark" ? "text-gray-400" : "text-gray-600"} />
            <span className={`${theme === "dark" ? "text-gray-400" : "text-gray-600"} truncate`}>
              {video.avatars?.name || "Unknown Avatar"}
            </span>
          </div>

          <div className="flex items-center space-x-2 text-sm">
            <Clock size={14} className={theme === "dark" ? "text-gray-400" : "text-gray-600"} />
            <span className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
              {formatDuration(video.duration_minutes)}
            </span>
          </div>

          <div className="flex items-center space-x-2 text-sm">
            <Calendar size={14} className={theme === "dark" ? "text-gray-400" : "text-gray-600"} />
            <span className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>{formatDate(video.created_at)}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

const VideoLibrary = () => {
  const { user } = useAuth()
  const { theme } = useTheme()
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [selectedVideo, setSelectedVideo] = useState(null)

  // Fetch videos from database
  useEffect(() => {
    const fetchVideos = async () => {
      if (!user) return

      setLoading(true)
      try {
        const { data, error } = await supabase
          .from("video_generation_history")
          .select(`
            *,
            avatars (
              name,
              image_url
            )
          `)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (error) throw error
        setVideos(data || [])
      } catch (error) {
        console.error("Error fetching videos:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchVideos()

    // Set up real-time subscription
    const channel = supabase
      .channel("video_generation_history")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "video_generation_history",
          filter: `user_id=eq.${user?.id}`,
        },
        () => {
          fetchVideos()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  // Filter and sort videos
  const filteredVideos = videos
    .filter((video) => {
      const matchesSearch =
        video.prompt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.avatars?.name?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesFilter =
        filterStatus === "all" ||
        (filterStatus === "ready" && video.video_url) ||
        (filterStatus === "processing" && !video.video_url)

      return matchesSearch && matchesFilter
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.created_at) - new Date(a.created_at)
        case "oldest":
          return new Date(a.created_at) - new Date(b.created_at)
        case "name":
          return (a.avatars?.name || "").localeCompare(b.avatars?.name || "")
        default:
          return 0
      }
    })

  const handleDeleteVideo = async (videoId) => {
    if (!confirm("Are you sure you want to delete this video?")) return

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) return

      const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/video-generation/${videoId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      if (response.ok) {
        setVideos(videos.filter((v) => v.id !== videoId))
      } else {
        const error = await response.json()
        console.error("Error deleting video:", error)
        alert("Failed to delete video: " + (error.message || "Unknown error"))
      }
    } catch (error) {
      console.error("Error deleting video:", error)
      alert("Failed to delete video")
    }
  }

  const handleViewVideo = (video) => {
    setSelectedVideo(video)
  }

  if (loading) {
    return (
      <div
        className={`${theme === "dark" ? "bg-gray-900" : "bg-gray-50"} min-h-screen flex items-center justify-center`}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className={`${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>Loading your videos...</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`${theme === "dark" ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"} min-h-screen p-4 lg:p-8`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Videos</h1>
          <p className={`${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
            {videos.length} video{videos.length !== 1 ? "s" : ""} generated
          </p>
        </div>

        <Link
          to="/dashboard/video/generate"
          className="flex items-center space-x-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-full font-medium hover:from-pink-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
        >
          <Plus size={20} />
          <span>Generate Video</span>
        </Link>
      </div>

      {/* Filters and Search */}
      <div className={`${theme === "dark" ? "bg-gray-800" : "bg-white"} rounded-xl p-6 shadow-lg mb-8`}>
        <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
          {/* Search */}
          <div className="relative flex-grow">
            <Search
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
              size={20}
            />
            <input
              type="text"
              placeholder="Search videos by script or avatar name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 ${theme === "dark" ? "bg-gray-700 text-gray-200 border-gray-600" : "bg-gray-100 text-gray-900 border-gray-300"} border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 transition-shadow`}
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <Filter size={20} className={theme === "dark" ? "text-gray-400" : "text-gray-600"} />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`px-4 py-3 ${theme === "dark" ? "bg-gray-700 text-gray-200 border-gray-600" : "bg-gray-100 text-gray-900 border-gray-300"} border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500`}
            >
              <option value="all">All Videos</option>
              <option value="ready">Ready</option>
              <option value="processing">Processing</option>
            </select>
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={`px-4 py-3 ${theme === "dark" ? "bg-gray-700 text-gray-200 border-gray-600" : "bg-gray-100 text-gray-900 border-gray-300"} border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500`}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name">By Avatar Name</option>
          </select>
        </div>
      </div>

      {/* Videos Grid */}
      {filteredVideos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {filteredVideos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                theme={theme}
                onDelete={handleDeleteVideo}
                onView={handleViewVideo}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className={`${theme === "dark" ? "bg-gray-800" : "bg-white"} rounded-xl p-12 text-center shadow-lg`}>
          <Video className={`h-16 w-16 mx-auto mb-4 ${theme === "dark" ? "text-gray-600" : "text-gray-400"}`} />
          <h3 className={`text-xl font-semibold mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
            {searchTerm || filterStatus !== "all" ? "No videos found" : "No videos yet"}
          </h3>
          <p className={`${theme === "dark" ? "text-gray-400" : "text-gray-600"} mb-6`}>
            {searchTerm || filterStatus !== "all"
              ? "Try adjusting your search or filter criteria"
              : "Create your first video with your avatars!"}
          </p>
          {!searchTerm && filterStatus === "all" && (
            <Link
              to="/dashboard/video/generate"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-full font-medium hover:from-pink-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
            >
              <Plus size={20} />
              <span>Generate Your First Video</span>
            </Link>
          )}
        </div>
      )}

      {/* Video Detail Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`${theme === "dark" ? "bg-gray-800" : "bg-white"} rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto`}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className={`text-xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                    Video Details
                  </h2>
                  <button
                    onClick={() => setSelectedVideo(null)}
                    className={`${theme === "dark" ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"} transition-colors`}
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Video Player */}
                {selectedVideo.video_url && (
                  <div className="aspect-video mb-6">
                    <video
                      src={selectedVideo.video_url}
                      controls
                      className="w-full h-full rounded-lg"
                      poster={selectedVideo.avatars?.image_url}
                    />
                  </div>
                )}

                {/* Video Info */}
                <div className="space-y-4">
                  <div>
                    <label
                      className={`block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"} mb-1`}
                    >
                      Script
                    </label>
                    <p
                      className={`${theme === "dark" ? "bg-gray-700 text-gray-200" : "bg-gray-100 text-gray-900"} p-3 rounded-lg`}
                    >
                      {selectedVideo.prompt}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        className={`block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"} mb-1`}
                      >
                        Avatar
                      </label>
                      <p className={`${theme === "dark" ? "text-gray-200" : "text-gray-900"}`}>
                        {selectedVideo.avatars?.name || "Unknown"}
                      </p>
                    </div>

                    <div>
                      <label
                        className={`block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"} mb-1`}
                      >
                        Duration
                      </label>
                      <p className={`${theme === "dark" ? "text-gray-200" : "text-gray-900"}`}>
                        {Math.round(selectedVideo.duration_minutes)} minutes
                      </p>
                    </div>

                    <div>
                      <label
                        className={`block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"} mb-1`}
                      >
                        Created
                      </label>
                      <p className={`${theme === "dark" ? "text-gray-200" : "text-gray-900"}`}>
                        {new Date(selectedVideo.created_at).toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <label
                        className={`block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"} mb-1`}
                      >
                        Status
                      </label>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          selectedVideo.video_url ? "bg-green-500 text-white" : "bg-yellow-500 text-white"
                        }`}
                      >
                        {selectedVideo.video_url ? "Ready" : "Processing"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default VideoLibrary
