"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { Video, MessageCircle, User } from "lucide-react"
import supabase from "../supabaseClient" // Declare the supabase variable

const UsageIndicator = ({ className = "" }) => {
  const { user } = useAuth()
  const [usage, setUsage] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUsage = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session) {
          const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/api/usage/stats`, {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          })

          if (response.ok) {
            const data = await response.json()
            setUsage(data)
          }
        }
      } catch (error) {
        console.error("Error fetching usage:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsage()

    // Refresh usage every 30 seconds
    const interval = setInterval(fetchUsage, 30000)
    return () => clearInterval(interval)
  }, [user])

  if (loading || !usage) return null

  const getUsageColor = (percentage) => {
    if (percentage >= 90) return "text-red-500"
    if (percentage >= 70) return "text-yellow-500"
    return "text-green-500"
  }

  const getUsageBarColor = (percentage) => {
    if (percentage >= 90) return "bg-red-500"
    if (percentage >= 70) return "bg-yellow-500"
    return "bg-green-500"
  }

  return (
    <div className={`flex items-center space-x-4 text-sm ${className}`}>
      {/* Conversation Minutes */}
      <div className="flex items-center space-x-2">
        <MessageCircle size={16} className="text-purple-500" />
        <div className="flex flex-col">
          <span className={`font-medium ${getUsageColor(usage.conversation.percentage)}`}>
            {usage.conversation.remaining}m
          </span>
          <div className="w-12 h-1 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${getUsageBarColor(usage.conversation.percentage)} transition-all duration-300`}
              style={{ width: `${usage.conversation.percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Video Generation */}
      <div className="flex items-center space-x-2">
        <Video size={16} className="text-pink-500" />
        <div className="flex flex-col">
          <span className={`font-medium ${getUsageColor(usage.videoGeneration.percentage)}`}>
            {usage.videoGeneration.remaining}m
          </span>
          <div className="w-12 h-1 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${getUsageBarColor(usage.videoGeneration.percentage)} transition-all duration-300`}
              style={{ width: `${usage.videoGeneration.percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Avatar Creation */}
      <div className="flex items-center space-x-2">
        <User size={16} className="text-blue-500" />
        <div className="flex flex-col">
          <span className={`font-medium ${getUsageColor(usage.avatarCreation.percentage)}`}>
            {usage.avatarCreation.remaining}
          </span>
          <div className="w-12 h-1 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${getUsageBarColor(usage.avatarCreation.percentage)} transition-all duration-300`}
              style={{ width: `${usage.avatarCreation.percentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default UsageIndicator
