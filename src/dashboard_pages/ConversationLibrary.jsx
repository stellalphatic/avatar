"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { useTheme } from "../contexts/ThemeContext"
import supabase from "../supabaseClient"
import { Link } from "react-router-dom"
import {
  Phone,
  Video,
  Calendar,
  Clock,
  Search,
  Trash2,
  PhoneOff,
  Eye,
  MessageCircle,
  User,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const ConversationLibrary = () => {
  const { user } = useAuth()
  const { theme } = useTheme()
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [showDetails, setShowDetails] = useState(false)
  const [actionLoading, setActionLoading] = useState(null)
  const [error, setError] = useState("")

  // Fetch conversations
  const fetchConversations = async () => {
    if (!user) return

    try {
      setLoading(true)
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) return

      const params = new URLSearchParams()
      if (statusFilter !== "all") params.append("status", statusFilter)
      if (typeFilter !== "all") params.append("type", typeFilter)

      const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/conversations?${params}`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setConversations(data.conversations || [])
      } else {
        throw new Error("Failed to fetch conversations")
      }
    } catch (error) {
      console.error("Error fetching conversations:", error)
      setError("Failed to load conversations")
    } finally {
      setLoading(false)
    }
  }

  // End conversation
  const endConversation = async (conversationId) => {
    try {
      setActionLoading(conversationId)
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) return

      const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/conversations/${conversationId}/end`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      if (response.ok) {
        // Update local state
        setConversations((prev) =>
          prev.map((conv) => (conv.id === conversationId ? { ...conv, status: "ended" } : conv)),
        )
      } else {
        const error = await response.json()
        throw new Error(error.message || "Failed to end conversation")
      }
    } catch (error) {
      console.error("Error ending conversation:", error)
      setError("Failed to end conversation: " + error.message)
    } finally {
      setActionLoading(null)
    }
  }

  // Delete conversation
  const deleteConversation = async (conversationId) => {
    if (!confirm("Are you sure you want to delete this conversation? This action cannot be undone.")) {
      return
    }

    try {
      setActionLoading(conversationId)
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) return

      const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/conversations/${conversationId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      if (response.ok) {
        // Remove from local state
        setConversations((prev) => prev.filter((conv) => conv.id !== conversationId))
      } else {
        const error = await response.json()
        throw new Error(error.message || "Failed to delete conversation")
      }
    } catch (error) {
      console.error("Error deleting conversation:", error)
      setError("Failed to delete conversation: " + error.message)
    } finally {
      setActionLoading(null)
    }
  }

  // View conversation details
  const viewConversationDetails = async (conversationId) => {
    try {
      setActionLoading(conversationId)
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) return

      const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/conversations/${conversationId}`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      if (response.ok) {
        const result = await response.json()
        setSelectedConversation(result.data)
        setShowDetails(true)
      } else {
        const error = await response.json()
        throw new Error(error.message || "Failed to fetch conversation details")
      }
    } catch (error) {
      console.error("Error fetching conversation details:", error)
      setError("Failed to load conversation details: " + error.message)
    } finally {
      setActionLoading(null)
    }
  }

  // Filter conversations
  const filteredConversations = conversations.filter((conversation) => {
    const matchesSearch =
      conversation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conversation.avatars?.name.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesSearch
  })

  // Get status color and icon
  const getStatusInfo = (status) => {
    switch (status) {
      case "active":
        return {
          color: "text-green-500",
          bgColor: "bg-green-100 dark:bg-green-900/20",
          icon: <CheckCircle size={16} />,
          label: "active",
        }
      case "ended":
        return {
          color: "text-gray-500",
          bgColor: "bg-gray-100 dark:bg-gray-800",
          icon: <PhoneOff size={16} />,
          label: "ended",
        }
      case "failed":
        return {
          color: "text-red-500",
          bgColor: "bg-red-100 dark:bg-red-900/20",
          icon: <XCircle size={16} />,
          label: "failed",
        }
      default:
        return {
          color: "text-gray-500",
          bgColor: "bg-gray-100 dark:bg-gray-800",
          icon: <AlertCircle size={16} />,
          label: status,
        }
    }
  }

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now - date) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], { weekday: "short", hour: "2-digit", minute: "2-digit" })
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
    }
  }

  useEffect(() => {
    fetchConversations()
  }, [user, statusFilter, typeFilter])

  return (
    <div
      className={`${theme === "dark" ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"} min-h-screen p-4 lg:p-8`}
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Conversation Library</h1>
        <p className={`${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
          View and manage your conversation history
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 ${theme === "dark" ? "bg-gray-800 border-gray-700 text-gray-200" : "bg-white border-gray-300 text-gray-900"} border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500`}
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={`px-4 py-2 ${theme === "dark" ? "bg-gray-800 border-gray-700 text-gray-200" : "bg-white border-gray-300 text-gray-900"} border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500`}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="ended">Ended</option>
          <option value="failed">Failed</option>
        </select>

        {/* Type Filter */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className={`px-4 py-2 ${theme === "dark" ? "bg-gray-800 border-gray-700 text-gray-200" : "bg-white border-gray-300 text-gray-900"} border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500`}
        >
          <option value="all">All Types</option>
          <option value="voice">Voice</option>
          <option value="video">Video</option>
        </select>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 rounded-lg">
          {error}
        </div>
      )}

      {/* Conversations Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin" size={32} />
          <span className="ml-2">Loading conversations...</span>
        </div>
      ) : filteredConversations.length === 0 ? (
        <div className="text-center py-12">
          <MessageCircle size={64} className={`mx-auto mb-4 ${theme === "dark" ? "text-gray-600" : "text-gray-400"}`} />
          <h3 className={`text-xl font-semibold mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
            No conversations found
          </h3>
          <p className={`${theme === "dark" ? "text-gray-400" : "text-gray-600"} mb-6`}>
            {searchTerm || statusFilter !== "all" || typeFilter !== "all"
              ? "Try adjusting your filters or search terms"
              : "Start your first conversation to see it here"}
          </p>
          <Link
            to="/dashboard/conversation-studio"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors"
          >
            <MessageCircle size={20} className="mr-2" />
            Start Conversation
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredConversations.map((conversation) => {
            const statusInfo = getStatusInfo(conversation.status)
            return (
              <motion.div
                key={conversation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`${theme === "dark" ? "bg-gray-800" : "bg-white"} rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow`}
              >
                {/* Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {conversation.audio_only ? (
                        <Phone size={16} className="text-purple-500" />
                      ) : (
                        <Video size={16} className="text-pink-500" />
                      )}
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color} flex items-center space-x-1`}
                      >
                        {statusInfo.icon}
                        <span>{statusInfo.label}</span>
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => viewConversationDetails(conversation.id)}
                        disabled={actionLoading === conversation.id}
                        className={`p-1 rounded ${theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100"} transition-colors`}
                        title="View details"
                      >
                        {actionLoading === conversation.id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                      {conversation.status === "active" && (
                        <button
                          onClick={() => endConversation(conversation.id)}
                          disabled={actionLoading === conversation.id}
                          className="p-1 rounded text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                          title="End conversation"
                        >
                          <PhoneOff size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => deleteConversation(conversation.id)}
                        disabled={actionLoading === conversation.id}
                        className="p-1 rounded text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                        title="Delete conversation"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <h3 className={`font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                    {conversation.name}
                  </h3>
                </div>

                {/* Avatar Info */}
                <div className="p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                      {conversation.avatars?.image_url ? (
                        <img
                          src={conversation.avatars.image_url || "/placeholder.svg"}
                          alt={conversation.avatars.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User size={20} className="text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className={`font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                        with {conversation.avatars?.name || "Unknown Avatar"}
                      </p>
                      <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                        {conversation.audio_only ? "Voice Chat" : "Video Chat"} {formatDate(conversation.created_at)}
                      </p>
                    </div>
                  </div>

                  {/* Summary */}
                  {conversation.chat_history?.[0]?.summary && (
                    <p className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"} line-clamp-2`}>
                      {conversation.chat_history[0].summary}
                    </p>
                  )}

                  {/* Metadata */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar size={12} />
                        <span>{formatDate(conversation.created_at)}</span>
                      </div>
                      {conversation.chat_history?.[0]?.started_at && conversation.chat_history?.[0]?.ended_at && (
                        <div className="flex items-center space-x-1">
                          <Clock size={12} />
                          <span>
                            {Math.round(
                              (new Date(conversation.chat_history[0].ended_at) -
                                new Date(conversation.chat_history[0].started_at)) /
                                (1000 * 60),
                            )}
                            m
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Conversation Details Modal */}
      <AnimatePresence>
        {showDetails && selectedConversation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`${theme === "dark" ? "bg-gray-800" : "bg-white"} rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto`}
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className={`text-xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                    Conversation Details
                  </h2>
                  <button
                    onClick={() => setShowDetails(false)}
                    className={`${theme === "dark" ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"} transition-colors`}
                  >
                    <XCircle size={24} />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {/* Conversation Info */}
                <div className="mb-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                      {selectedConversation.avatars?.image_url ? (
                        <img
                          src={selectedConversation.avatars.image_url || "/placeholder.svg"}
                          alt={selectedConversation.avatars.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User size={24} className="text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className={`text-lg font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                        {selectedConversation.name}
                      </h3>
                      <p className={`${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                        with {selectedConversation.avatars?.name || "Unknown Avatar"}
                      </p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusInfo(selectedConversation.status).bgColor} ${getStatusInfo(selectedConversation.status).color}`}
                        >
                          {getStatusInfo(selectedConversation.status).label}
                        </span>
                        <span className="text-sm text-gray-500">
                          {selectedConversation.audio_only ? "Voice Chat" : "Video Chat"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chat Messages */}
                {selectedConversation.chat_history?.[0]?.chat_messages && (
                  <div className="mb-6">
                    <h4 className={`text-lg font-semibold mb-4 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                      Chat History
                    </h4>
                    <div
                      className={`${theme === "dark" ? "bg-gray-900" : "bg-gray-50"} rounded-lg p-4 max-h-96 overflow-y-auto`}
                    >
                      <div className="space-y-4">
                        {selectedConversation.chat_history[0].chat_messages.map((message, index) => (
                          <div
                            key={index}
                            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-xs px-4 py-2 rounded-lg ${
                                message.role === "user"
                                  ? "bg-purple-500 text-white"
                                  : `${theme === "dark" ? "bg-gray-700 text-gray-200" : "bg-white text-gray-800"} shadow`
                              }`}
                            >
                              <p className="text-sm">{message.parts[0].text}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Summary */}
                {selectedConversation.chat_history?.[0]?.summary && (
                  <div className="mb-6">
                    <h4 className={`text-lg font-semibold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                      Summary
                    </h4>
                    <p className={`${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                      {selectedConversation.chat_history[0].summary}
                    </p>
                  </div>
                )}

                {/* Metadata */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className={`font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                      Started:
                    </span>
                    <p className={`${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                      {new Date(selectedConversation.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className={`font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                      Language:
                    </span>
                    <p className={`${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                      {selectedConversation.conversation_language || "English"}
                    </p>
                  </div>
                  {selectedConversation.chat_history?.[0]?.ended_at && (
                    <div>
                      <span className={`font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                        Duration:
                      </span>
                      <p className={`${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                        {Math.round(
                          (new Date(selectedConversation.chat_history[0].ended_at) -
                            new Date(selectedConversation.chat_history[0].started_at)) /
                            (1000 * 60),
                        )}{" "}
                        minutes
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ConversationLibrary
