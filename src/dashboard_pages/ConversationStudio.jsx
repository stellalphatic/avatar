"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "../contexts/AuthContext"
import { useTheme } from "../contexts/ThemeContext"
import supabase from "../supabaseClient"
import { Link } from "react-router-dom"
import {
  Video,
  Phone,
  VideoOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  MessageCircle,
  Play,
  Square,
  ChevronDown,
  X,
  Search,
  UserPlus,
  Loader2,
  AlertTriangle,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

// WebSocket connections
let voiceCallWs = null
let videoCallWs = null
let recognition = null

const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English" },
  { code: "hi", name: "Hindi" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "pt", name: "Portuguese" },
  { code: "ru", name: "Russian" },
]

const AvatarModal = ({ isOpen, onClose, onSelect, avatars, theme }) => {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredAvatars = avatars.filter((avatar) => avatar.name.toLowerCase().includes(searchTerm.toLowerCase()))

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

        <div className="relative mb-6">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <Link
            to="/dashboard/avatars/create"
            className={`${theme === "dark" ? "bg-gray-700 border-gray-500 hover:border-pink-500" : "bg-gray-50 border-gray-300 hover:border-pink-500"} rounded-xl border border-dashed flex items-center justify-center p-6 text-center transition-colors cursor-pointer group`}
          >
            <div className="text-center">
              <UserPlus className="h-8 w-8 mx-auto mb-2 text-pink-500 group-hover:text-pink-600" />
              <span className="text-pink-500 group-hover:text-pink-600 font-medium">Create Avatar</span>
            </div>
          </Link>

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
              No avatars found. Create your first avatar!
            </p>
          </div>
        )}
      </motion.div>
    </div>
  )
}

const ConversationStudio = () => {
  const { user } = useAuth()
  const { theme } = useTheme()
  const [selectedAvatar, setSelectedAvatar] = useState(null)
  const [avatars, setAvatars] = useState([])
  const [showAvatarModal, setShowAvatarModal] = useState(false)
  const [conversationType, setConversationType] = useState("voice") // 'voice' or 'video'
  const [language, setLanguage] = useState("en")
  const [duration, setDuration] = useState(5) // minutes
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState("")
  const [callDuration, setCallDuration] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [messages, setMessages] = useState([])
  const [usage, setUsage] = useState(null)
  const [error, setError] = useState("")

  // Refs
  const videoRef = useRef(null)
  const audioContextRef = useRef(null)
  const audioQueueRef = useRef([]) // Audio queue like your old code
  const currentSourceNodeRef = useRef(null)
  const nextPlayTimeRef = useRef(0)
  const callTimerRef = useRef(null)
  const conversationStartTimeRef = useRef(null)
  const recognitionRestartTimeoutRef = useRef(null)
  const inactivityTimeoutRef = useRef(null)
  const lastUserActivityRef = useRef(Date.now())

  // Fetch avatars and usage
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      try {
        // Fetch avatars
        const { data: avatarData, error: avatarError } = await supabase
          .from("avatars")
          .select("*")
          .or(`user_id.eq.${user.id},is_public.eq.true`)
          .order("created_at", { ascending: false })

        if (avatarError) throw avatarError
        setAvatars(avatarData || [])

        // Fetch usage
        await fetchUsageStats()
      } catch (error) {
        console.error("Error fetching data:", error)
        setError("Failed to load data")
      }
    }

    fetchData()
  }, [user])

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

  // Call timer
  useEffect(() => {
    if (isConnected) {
      conversationStartTimeRef.current = Date.now()
      callTimerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - conversationStartTimeRef.current) / 1000)
        setCallDuration(elapsed)
      }, 1000)
    } else {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current)
        callTimerRef.current = null
      }
      setCallDuration(0)
    }

    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current)
      }
    }
  }, [isConnected])

  // Audio context initialization (like your old code)
  useEffect(() => {
    if (isConnected && !audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
        console.log("AudioContext initialized.")
        nextPlayTimeRef.current = audioContextRef.current.currentTime
      } catch (e) {
        console.error("Error initializing AudioContext:", e)
        setError("Audio playback not supported or blocked by browser.")
      }
    }

    return () => {
      if (audioContextRef.current) {
        console.log("Closing AudioContext.")
        audioContextRef.current
          .close()
          .then(() => {
            audioContextRef.current = null
          })
          .catch((e) => console.error("Error closing AudioContext:", e))
      }
      audioQueueRef.current = []
      nextPlayTimeRef.current = 0
      if (currentSourceNodeRef.current) {
        currentSourceNodeRef.current.stop()
        currentSourceNodeRef.current.disconnect()
        currentSourceNodeRef.current = null
      }
    }
  }, [isConnected])

  // Audio playback function 
  const playNextAudioChunk = async () => {
    if (!audioContextRef.current || audioQueueRef.current.length === 0) {
      return;
    }

    // Only proceed if not currently playing
    if (isSpeaking && currentSourceNodeRef.current && audioContextRef.current.currentTime < nextPlayTimeRef.current) {
      return;
    }

    const audioChunk = audioQueueRef.current.shift();
    try {
      const audioBuffer = await audioContextRef.current.decodeAudioData(audioChunk);
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);

      const currentTime = audioContextRef.current.currentTime;
      if (nextPlayTimeRef.current < currentTime) {
        nextPlayTimeRef.current = currentTime;
      }

      source.start(nextPlayTimeRef.current);
      nextPlayTimeRef.current += audioBuffer.duration;
      currentSourceNodeRef.current = source;

      setIsSpeaking(true);

      // Pause user mic if avatar starts speaking
      if (isListening && recognition) {
        console.log("Avatar is speaking, pausing user microphone.");
        recognition.stop();
        setIsListening(false);
      }

      source.onended = () => {
        currentSourceNodeRef.current = null;
        if (audioQueueRef.current.length > 0) {
          // Recursively play next chunk
          playNextAudioChunk();
        } else {
          console.log("Avatar finished speaking all queued audio.");
          setIsSpeaking(false);
          // Re-enable microphone if in an active call
          if (isConnected && !isListening && recognition && !isMuted) {
            console.log("Re-enabling microphone for user input after avatar spoke.");
            startSpeechRecognition();
          }
        }
      };
    } catch (e) {
      console.error("Error decoding or playing audio chunk:", e);
      setError("Error playing avatar's voice. Please try again.");
      setIsSpeaking(false);
      audioQueueRef.current = [];
      nextPlayTimeRef.current = audioContextRef.current.currentTime;
      if (isConnected && !isListening && recognition && !isMuted) {
        startSpeechRecognition();
      }
    }
  };

  // Effect to trigger playback when queue changes 
  // useEffect(() => {
  //   if (!isSpeaking && audioQueueRef.current.length > 0) {
  //     playNextAudioChunk()
  //   }
  // }, [audioQueueRef.current.length, isSpeaking])

  // Inactivity timeout - auto-stop after 60 seconds of no user activity
  useEffect(() => {
    if (isConnected) {
      const checkInactivity = () => {
        const timeSinceLastActivity = Date.now() - lastUserActivityRef.current
        if (timeSinceLastActivity > 60000) {
          // 60 seconds
          console.log("Auto-stopping conversation due to inactivity")
          endConversation()
        }
      }

      inactivityTimeoutRef.current = setInterval(checkInactivity, 5000) // Check every 5 seconds
    } else {
      if (inactivityTimeoutRef.current) {
        clearInterval(inactivityTimeoutRef.current)
        inactivityTimeoutRef.current = null
      }
    }

    return () => {
      if (inactivityTimeoutRef.current) {
        clearInterval(inactivityTimeoutRef.current)
      }
    }
  }, [isConnected])

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Check if user can start conversation
  const canStartConversation = () => {
    if (!usage) return true
    return usage.conversation.remaining >= duration
  }

  // Start conversation
  const startConversation = async () => {
    if (!selectedAvatar) {
      setError("Please select an avatar")
      return
    }

    if (!canStartConversation()) {
      setError(
        `Insufficient conversation minutes. You need ${duration} minutes but only have ${usage.conversation.remaining} remaining.`,
      )
      return
    }

    setIsConnecting(true)
    setConnectionStatus("Initializing connection...")
    setError("")
    lastUserActivityRef.current = Date.now()

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) {
        throw new Error("No active session")
      }

      const backendWsUrl = import.meta.env.VITE_BACKEND_WS_URL || "ws://localhost:5000"

      if (conversationType === "voice") {
        // Start voice conversation
        const wsUrl = `${backendWsUrl}/voice-chat?token=${session.access_token}&avatarId=${selectedAvatar.id}&language=${language}`
        console.log("Connecting to voice WebSocket:", wsUrl)

        voiceCallWs = new WebSocket(wsUrl)
        voiceCallWs.binaryType = "arraybuffer"

        voiceCallWs.onopen = () => {
          console.log("Voice chat WebSocket opened")
          setConnectionStatus("Connecting to voice service...")
        }

        voiceCallWs.onmessage = handleVoiceMessage
        voiceCallWs.onclose = handleDisconnect
        voiceCallWs.onerror = handleError
      } else {
        // Start video conversation
        const wsUrl = `${backendWsUrl}/video-chat?token=${session.access_token}&avatarId=${selectedAvatar.id}&language=${language}`
        console.log("Connecting to video WebSocket:", wsUrl)

        videoCallWs = new WebSocket(wsUrl)
        videoCallWs.binaryType = "arraybuffer"

        videoCallWs.onopen = () => {
          console.log("Video chat WebSocket opened")
          setConnectionStatus("Connecting to video and voice services...")
        }

        videoCallWs.onmessage = handleVideoMessage
        videoCallWs.onclose = handleDisconnect
        videoCallWs.onerror = handleError
      }
    } catch (error) {
      console.error("Error starting conversation:", error)
      setError(`Failed to start conversation: ${error.message}`)
      setIsConnecting(false)
      setConnectionStatus("")
    }
  }

  // Handle voice message (based on your old code logic)
  const handleVoiceMessage = async (event) => {
    if (typeof event.data === "string") {
      const data = JSON.parse(event.data)
      console.log("Voice message:", data)

      switch (data.type) {
        case "connecting":
          setConnectionStatus(data.message)
          break
        case "ready":
          setIsConnected(true)
          setIsConnecting(false)
          setConnectionStatus("")
          setMessages((prev) => [...prev, { type: "system", text: data.message }])
          startSpeechRecognition()
          break
        case "llm_response_text":
          setMessages((prev) => [...prev, { type: "avatar", text: data.text }])
          break
        case "speech_start":
          setIsSpeaking(true)
          break
        case "speech_end":
          setIsSpeaking(false)
          break
        case "error":
          setError(data.message)
          setIsConnecting(false)
          setConnectionStatus("")
          break
      }
    } else if (event.data instanceof ArrayBuffer) {
      // Handle audio data - add to queue like your old code
      if (event.data.byteLength > 0) {
        audioQueueRef.current.push(event.data)
        if (!isSpeaking && audioQueueRef.current.length === 1) {
          playNextAudioChunk()
        }
      }
    }
  }

  // Handle video message
  const handleVideoMessage = async (event) => {
    try {
      if (typeof event.data === "string") {
        const data = JSON.parse(event.data);
        console.log("[VIDEO_CHAT] Received:", data.type);

        switch (data.type) {
          case "connecting":
            setConnectionStatus(data.message);
            break;

          case "ready":
            setIsConnected(true);
            setIsConnecting(false);
            setConnectionStatus("");
            setMessages((prev) => [...prev, { type: "system", text: data.message }]);

            if (!isMuted) {
              setTimeout(() => startSpeechRecognition(), 1000);
            }
            break;

          case "llm_response_text":
            setMessages((prev) => [...prev, { type: "avatar", text: data.text }]);
            break;

          case "speech_start":
            setIsSpeaking(true);
            if (isListening && recognition) {
              recognition.stop();
              setIsListening(false);
            }
            break;

          case "speech_end":
            setIsSpeaking(false);
            if (isConnected && !isMuted && !isSpeaking) {
              setTimeout(() => startSpeechRecognition(), 500);
            }
            break;

          case "video_disconnected":
            setError("Video service disconnected - switching to audio only");
            break;

          case "error":
            console.error("[VIDEO_CHAT] Error:", data.message);
            setError(data.message);
            setIsConnecting(false);
            setConnectionStatus("");
            break;
        }
      }
      else if (event.data instanceof ArrayBuffer && event.data.byteLength > 1) {
        // Binary data with header byte
        const dataView = new Uint8Array(event.data);
        const headerByte = dataView[0];
        const payload = event.data.slice(1);

        if (headerByte === 0x01 && payload.byteLength > 0) {
          // Audio data (0x01)
          audioQueueRef.current.push(payload);
          if (!isSpeaking && audioQueueRef.current.length === 1) {
            playNextAudioChunk();
          }
        }
        else if (headerByte === 0x02 && payload.byteLength > 0) {
          // Video frame data (0x02)
          displayVideoFrame(payload);
        }
      }
    } catch (error) {
      console.error("[VIDEO_CHAT] Error handling message:", error);
    }
  };

  // Fixed displayVideoFrame function
  const displayVideoFrame = (frameData) => {
    if (!videoRef.current || !frameData || frameData.byteLength === 0) {
      return;
    }

    try {
      const oldUrl = videoRef.current.src;

      // Create new blob and object URL
      const blob = new Blob([frameData], { type: "image/jpeg" });
      const newUrl = URL.createObjectURL(blob);

      // Update the image source - this triggers reload
      videoRef.current.src = newUrl;

      // Clean up old URL after a delay to ensure new image loads
      if (oldUrl && oldUrl.startsWith("blob:")) {
        setTimeout(() => {
          try {
            URL.revokeObjectURL(oldUrl);
          } catch (e) {
            console.error("[VIDEO_CHAT] Error revoking old URL:", e);
          }
        }, 100);
      }
    } catch (error) {
      console.error("[VIDEO_CHAT] Error displaying video frame:", error);
    }
  };

  // Start speech recognition (based on your old code)
  const startSpeechRecognition = () => {
    if (!("webkitSpeechRecognition" in window)) {
      setError("Speech recognition not supported in this browser")
      return
    }

    if (recognition) {
      recognition.stop()
      recognition = null
    }

    recognition = new window.webkitSpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = language

    recognition.onstart = () => {
      console.log("Speech recognition started")
      setIsListening(true)
    }

    recognition.onresult = (event) => {
      let finalTranscript = ""
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript
        }
      }

      if (finalTranscript) {
        console.log("User said:", finalTranscript)
        lastUserActivityRef.current = Date.now()
        setMessages((prev) => [...prev, { type: "user", text: finalTranscript }])

        // Send to appropriate WebSocket
        const ws = conversationType === "voice" ? voiceCallWs : videoCallWs

        // ADD THIS DEBUG LOG
        console.log("[DEBUG] Sending to WebSocket:", {
          wsExists: !!ws,
          wsState: ws?.readyState,
          conversationType: conversationType,
          message: finalTranscript
        })

        if (ws && ws.readyState === WebSocket.OPEN) {
          const message = JSON.stringify({ type: "user_text", text: finalTranscript })
          console.log("[DEBUG] Sending message:", message) // DEBUGGING
          ws.send(message)
        } else {
          console.error("[DEBUG] WebSocket not ready!", {
            wsExists: !!ws,
            wsState: ws?.readyState
          })
        }
      }
    }

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error)
      if (event.error !== "no-speech" && event.error !== "aborted") {
        setError(`Speech recognition error: ${event.error}`)
      }
    }

    recognition.onend = () => {
      console.log("Speech recognition ended")
      setIsListening(false)

      // Restart recognition if still connected and not muted
      if (isConnected && !isMuted) {
        // Clear any existing timeout
        if (recognitionRestartTimeoutRef.current) {
          clearTimeout(recognitionRestartTimeoutRef.current)
        }

        // Restart after a short delay
        recognitionRestartTimeoutRef.current = setTimeout(() => {
          if (isConnected && !isMuted) {
            startSpeechRecognition()
          }
        }, 500)
      }
    }

    try {
      recognition.start()
    } catch (error) {
      console.error("Failed to start speech recognition:", error)
    }
  }

  // Handle disconnect
  const handleDisconnect = () => {
    console.log("Conversation disconnected")
    setIsConnected(false)
    setIsConnecting(false)
    setConnectionStatus("")
    setIsSpeaking(false)
    setIsListening(false)

    // Stop any playing audio (like your old code)
    if (currentSourceNodeRef.current) {
      try {
        currentSourceNodeRef.current.stop()
      } catch (e) {
        // Ignore if already stopped
      }
      currentSourceNodeRef.current = null
    }

    // Clear audio queue
    audioQueueRef.current = []

    // Clear recognition restart timeout
    if (recognitionRestartTimeoutRef.current) {
      clearTimeout(recognitionRestartTimeoutRef.current)
      recognitionRestartTimeoutRef.current = null
    }

    // Clear inactivity timeout
    if (inactivityTimeoutRef.current) {
      clearInterval(inactivityTimeoutRef.current)
      inactivityTimeoutRef.current = null
    }

    if (recognition) {
      recognition.stop()
      recognition = null
    }

    // Calculate conversation duration and update usage
    if (conversationStartTimeRef.current) {
      const durationMinutes = (Date.now() - conversationStartTimeRef.current) / (1000 * 60)
      updateConversationUsage(durationMinutes)
    }
  }

  // Handle error
  const handleError = (error) => {
    console.error("WebSocket error:", error)
    setError("Connection error occurred")
    handleDisconnect()
  }

  // End conversation
  const endConversation = () => {
    if (voiceCallWs) {
      voiceCallWs.close()
      voiceCallWs = null
    }
    if (videoCallWs) {
      videoCallWs.close()
      videoCallWs = null
    }
    handleDisconnect()
  }

  // Toggle mute
  const toggleMute = () => {
    const newMutedState = !isMuted
    setIsMuted(newMutedState)

    if (recognition) {
      if (newMutedState) {
        // Mute - stop recognition
        recognition.stop()
        setIsListening(false)
      } else {
        // Unmute - restart recognition if connected
        if (isConnected) {
          setTimeout(() => startSpeechRecognition(), 100)
        }
      }
    }
  }

  // Update conversation usage
  const updateConversationUsage = async (durationMinutes) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session) {
        await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/usage/update-conversation`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ durationMinutes }),
        })
      }
    } catch (error) {
      console.error("Error updating usage:", error)
    }
  }

  return (
    <div
      className={`${theme === "dark" ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"} min-h-screen flex flex-col lg:flex-row p-4 lg:p-8 space-y-8 lg:space-y-0 lg:space-x-8`}
    >
      {/* Left Panel - Setup */}
      <div className="lg:w-1/3 xl:w-1/4 flex flex-col space-y-6">
        {/* Avatar Selection */}
        <div className={`${theme === "dark" ? "bg-gray-800" : "bg-white"} rounded-xl p-6 shadow-lg`}>
          <h2 className="text-xl font-bold mb-4">Select Avatar</h2>
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

        {/* Conversation Settings */}
        <div className={`${theme === "dark" ? "bg-gray-800" : "bg-white"} rounded-xl p-6 shadow-lg`}>
          <h2 className="text-xl font-bold mb-4">Settings</h2>

          {/* Conversation Type */}
          <div className="mb-4">
            <label className={`block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"} mb-2`}>
              Type
            </label>
            <div className="flex space-x-2">
              <button
                onClick={() => setConversationType("voice")}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-lg transition-colors ${conversationType === "voice"
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                  : `${theme === "dark" ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`
                  }`}
              >
                <Phone size={16} />
                <span>Voice</span>
              </button>
              <button
                onClick={() => setConversationType("video")}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-lg transition-colors ${conversationType === "video"
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                  : `${theme === "dark" ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`
                  }`}
              >
                <Video size={16} />
                <span>Video</span>
              </button>
            </div>
          </div>

          {/* Language */}
          <div className="mb-4">
            <label className={`block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"} mb-2`}>
              Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className={`w-full px-3 py-2 ${theme === "dark" ? "bg-gray-700 text-gray-200 border-gray-600" : "bg-gray-100 text-gray-900 border-gray-300"} border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500`}
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          {/* Duration */}
          <div className="mb-4">
            <label className={`block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"} mb-2`}>
              Max Duration: {duration} minutes
            </label>
            <input
              type="range"
              min="1"
              max="30"
              value={duration}
              onChange={(e) => setDuration(Number.parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1 min</span>
              <span>30 min</span>
            </div>
          </div>

          {/* Usage Warning */}
          {usage && !canStartConversation() && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle size={16} className="text-red-500" />
                <span className="text-sm text-red-700 dark:text-red-400">
                  Insufficient conversation minutes ({usage.conversation.remaining} remaining)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Usage Display */}
        {usage && (
          <div className={`${theme === "dark" ? "bg-gray-800" : "bg-white"} rounded-xl p-6 shadow-lg`}>
            <h2 className="text-xl font-bold mb-4">Usage</h2>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Conversation Minutes</span>
                  <span>
                    {usage.conversation.used}/{usage.conversation.limit}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full"
                    style={{ width: `${usage.conversation.percentage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Connection Status */}
        {isConnecting && connectionStatus && (
          <div className={`${theme === "dark" ? "bg-gray-800" : "bg-white"} rounded-xl p-6 shadow-lg`}>
            <div className="flex items-center space-x-3">
              <Loader2 className="animate-spin text-purple-500" size={20} />
              <span className="text-sm">{connectionStatus}</span>
            </div>
          </div>
        )}

        {/* Start/End Button */}
        <button
          onClick={isConnected ? endConversation : startConversation}
          disabled={isConnecting || !selectedAvatar || (!canStartConversation() && !isConnected)}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${isConnected
            ? "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700"
            : "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
            }`}
        >
          {isConnecting ? (
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="animate-spin" size={20} />
              <span>Connecting...</span>
            </div>
          ) : isConnected ? (
            <div className="flex items-center justify-center space-x-2">
              <Square size={20} />
              <span>End Conversation</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <Play size={20} />
              <span>Start Conversation</span>
            </div>
          )}
        </button>
      </div>

      {/* Right Panel - Conversation */}
      <div className="lg:w-2/3 xl:w-3/4 flex flex-col space-y-6">
        {/* Video/Avatar Display */}
        <div
          className={`${theme === "dark" ? "bg-gray-800" : "bg-white"} rounded-xl shadow-lg overflow-hidden flex-grow`}
        >
          {isConnected ? (
            <div className="relative h-full min-h-[400px]">
              {conversationType === "video" ? (
                <div className="relative w-full h-full bg-black rounded-xl overflow-hidden">
                  <img
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    alt="Avatar video"
                    style={{ minHeight: '400px' }}
                  />

                  {/* Call Controls Overlay */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 bg-black bg-opacity-50 rounded-full px-6 py-3">
                    <button
                      onClick={toggleMute}
                      className={`p-3 rounded-full transition-colors ${isMuted ? "bg-red-500 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        }`}
                    >
                      {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                    </button>

                    <div className="text-white font-mono text-lg">{formatTime(callDuration)}</div>

                    <button
                      onClick={() => setIsVideoEnabled(!isVideoEnabled)}
                      className={`p-3 rounded-full transition-colors ${!isVideoEnabled ? "bg-red-500 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        }`}
                    >
                      {isVideoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
                    </button>
                  </div>

                  {/* Speaking Indicator */}
                  {isSpeaking && (
                    <div className="absolute top-4 left-4 flex items-center space-x-2 bg-green-500 text-white px-3 py-1 rounded-full animate-pulse">
                      <Volume2 size={16} />
                      <span className="text-sm">Avatar Speaking</span>
                    </div>
                  )}


                  {/* Listening Indicator */}
                  {isListening && !isMuted && (
                    <div className="absolute top-4 right-4 flex items-center space-x-2 bg-red-500 text-white px-3 py-1 rounded-full animate-pulse">
                      <Mic size={16} />
                      <span className="text-sm">Listening</span>
                    </div>
                  )}
                </div>
              ) : (
                // Voice-only mode
                <div className="flex flex-col items-center justify-center h-full p-8">
                  <div className="relative">
                    <img
                      src={selectedAvatar?.image_url || "/placeholder.svg"}
                      alt={selectedAvatar?.name}
                      className="w-48 h-48 rounded-full object-cover border-4 border-purple-500 shadow-2xl"
                    />

                    {/* Audio Visualization */}
                    {isSpeaking && (
                      <div className="absolute inset-0 rounded-full border-4 border-green-500 animate-pulse" />
                    )}
                  </div>

                  <h2 className={`text-2xl font-bold mt-6 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                    {selectedAvatar?.name}
                  </h2>

                  <div className="flex items-center space-x-4 mt-6 bg-black bg-opacity-50 rounded-full px-6 py-3">
                    <button
                      onClick={toggleMute}
                      className={`p-3 rounded-full transition-colors ${isMuted ? "bg-red-500 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        }`}
                    >
                      {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                    </button>

                    <div className="text-white font-mono text-lg">{formatTime(callDuration)}</div>

                    <div className={`p-3 rounded-full ${isSpeaking ? "bg-green-500" : "bg-gray-700"} text-white`}>
                      {isSpeaking ? <Volume2 size={20} /> : <VolumeX size={20} />}
                    </div>
                  </div>

                  {/* Status Indicators */}
                  <div className="flex items-center space-x-4 mt-4">
                    {isListening && !isMuted && (
                      <div className="flex items-center space-x-2 text-red-500 animate-pulse">
                        <Mic size={16} />
                        <span className="text-sm">Listening</span>
                      </div>
                    )}

                    {isSpeaking && (
                      <div className="flex items-center space-x-2 text-green-500">
                        <Volume2 size={16} />
                        <span className="text-sm">Speaking</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] p-8">
              <MessageCircle size={80} className={`mb-6 ${theme === "dark" ? "text-gray-600" : "text-gray-400"}`} />
              <h2 className={`text-2xl font-bold mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                Ready to Start
              </h2>
              <p className={`text-center ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                {selectedAvatar
                  ? `Select your preferences and start a ${conversationType} conversation with ${selectedAvatar.name}`
                  : "Select an avatar and configure your conversation settings"}
              </p>
            </div>
          )}
        </div>

        {/* Chat Messages */}
        {messages.length > 0 && (
          <div
            className={`${theme === "dark" ? "bg-gray-800" : "bg-white"} rounded-xl p-6 shadow-lg max-h-60 overflow-y-auto`}
          >
            <h3 className="text-lg font-bold mb-4">Conversation</h3>
            <div className="space-y-3">
              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-xs px-3 py-2 rounded-lg text-sm ${message.type === "user"
                      ? "bg-purple-500 text-white"
                      : message.type === "avatar"
                        ? `${theme === "dark" ? "bg-gray-700 text-gray-200" : "bg-gray-200 text-gray-800"}`
                        : "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                      }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
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

export default ConversationStudio
