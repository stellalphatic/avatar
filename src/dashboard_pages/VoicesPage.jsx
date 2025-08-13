"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "../contexts/AuthContext"
import {
  Mic,
  Upload,
  Check,
  Loader2,
  Play,
  Trash2,
  AlertCircle,
  Volume2,
  History,
  Clock,
  LinkIcon,
  Pause,
  Download,
  RefreshCw,
  Zap,
  Users,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const VoicesPage = () => {
  const { user, supabase, authToken } = useAuth()
  const [myVoices, setMyVoices] = useState([])
  const [publicVoices, setPublicVoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [selectedTab, setSelectedTab] = useState("my")
  const [usage, setUsage] = useState(null)

  // Upload Voice states
  const [uploading, setUploading] = useState(false)
  const [audioFile, setAudioFile] = useState(null)
  const [voiceName, setVoiceName] = useState("")
  const [isPublicVoice, setIsPublicVoice] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  // TTS Generation states
  const [ttsText, setTtsText] = useState("")
  const [selectedVoiceForTTS, setSelectedVoiceForTTS] = useState(null)
  const [generatingTTS, setGeneratingTTS] = useState(false)
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState(null)
  const audioPlayerRef = useRef(null)
  const [ttsLanguage, setTtsLanguage] = useState("en")

  // Generated Audios List states
  const [generatedAudiosList, setGeneratedAudiosList] = useState([])
  const [loadingGeneratedAudios, setLoadingGeneratedAudios] = useState(false)
  const [generatedAudioFilterVoice, setGeneratedAudioFilterVoice] = useState("")
  const [generatedAudioSortOrder, setGeneratedAudioSortOrder] = useState("desc")
  const [refreshingAudios, setRefreshingAudios] = useState(false)

  // Audio playback states
  const [playingAudio, setPlayingAudio] = useState(null)
  const [audioProgress, setAudioProgress] = useState({})
  const audioRefs = useRef({})
  const [audioSpeeds, setAudioSpeeds] = useState({}) // Track speed for each audio

  // Modal states
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [confirmAction, setConfirmAction] = useState(null)
  const [confirmMessage, setConfirmMessage] = useState("")
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [infoMessage, setInfoModalMessage] = useState("")

  // Supported languages for TTS
  const SUPPORTED_TTS_LANGUAGES = [
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

  useEffect(() => {
    if (user) {
      fetchVoices()
      fetchUsageStats()
    } else {
      setLoading(false)
      setError("Please log in to view voices.")
    }
  }, [user, supabase])

  useEffect(() => {
    if (selectedTab === "generated" && user) {
      fetchGeneratedAudios()
    }
  }, [selectedTab, generatedAudioFilterVoice, generatedAudioSortOrder, user])

  // Auto-refresh generated audios every 5 seconds when there are processing items
  useEffect(() => {
    const hasProcessingAudios = generatedAudiosList.some(
      (audio) => audio.status === "queued" || audio.status === "processing",
    )
    if (hasProcessingAudios && selectedTab === "generated") {
      const interval = setInterval(() => {
        fetchGeneratedAudios(true) // Silent refresh
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [generatedAudiosList, selectedTab])

  const fetchUsageStats = async () => {
    if (!user) return
    try {
      // Try backend first, fallback to default values
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session) {
        try {
          const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/usage/stats`, {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          })
          if (response.ok) {
            const result = await response.json()
            if (result.success) {
              setUsage(result.data)
              return
            }
          }
        } catch (backendError) {
          // Silent fallback - no console.log
        }
        // Fallback: Set default usage stats
        setUsage({
          audioGeneration: { used: 0, limit: 100, remaining: 100 },
          videoGeneration: { used: 0, limit: 10, remaining: 10 },
          conversation: { used: 0, limit: 50, remaining: 50 }, // Fixed: was 'conversations'
        })
      }
    } catch (error) {
      // Set default values on error
      setUsage({
        audioGeneration: { used: 0, limit: 100, remaining: 100 },
        videoGeneration: { used: 0, limit: 10, remaining: 10 },
        conversation: { used: 0, limit: 50, remaining: 50 }, // Fixed: was 'conversations'
      })
    }
  }

  const displayInfo = (msg) => {
    setInfoModalMessage(msg)
    setShowInfoModal(true)
  }

  const requestConfirmation = (msg, action) => {
    setConfirmMessage(msg)
    setConfirmAction(() => action)
    setShowConfirmModal(true)
  }

  const handleConfirm = () => {
    if (confirmAction) {
      confirmAction()
    }
    setShowConfirmModal(false)
    setConfirmAction(null)
  }

  const handleCancelConfirm = () => {
    setShowConfirmModal(false)
    setConfirmAction(null)
  }

  const fetchVoices = async () => {
    setLoading(true)
    setError("")
    try {
      // Fetch My Voices
      const { data: myVoicesData, error: myVoicesError } = await supabase
        .from("voices")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (myVoicesError) throw myVoicesError
      setMyVoices(myVoicesData)

      // Fetch Public Voices (excluding my own public voices)
      const { data: publicVoicesData, error: publicVoicesError } = await supabase
        .from("voices")
        .select("*")
        .eq("is_public", true)
        .neq("user_id", user.id)

      if (publicVoicesError) throw publicVoicesError
      setPublicVoices(publicVoicesData)
    } catch (err) {
      setError(`Failed to load voices: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const fetchGeneratedAudios = async (silent = false) => {
    if (!user) return
    if (!silent) setLoadingGeneratedAudios(true)
    setError("")
    try {
      // Fetch directly from Supabase
      const { data: audios, error: audiosError } = await supabase
        .from("generated_audios")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50)

      if (audiosError) {
        if (!silent) setError(`Failed to load generated audios: ${audiosError.message}`)
        return
      }

      // Get voice names for the audios
      const voiceIds = [...new Set(audios.map((audio) => audio.voice_id).filter(Boolean))]
      let voicesMap = {}
      if (voiceIds.length > 0) {
        const { data: voices, error: voicesError } = await supabase.from("voices").select("id, name").in("id", voiceIds)
        if (!voicesError && voices) {
          voicesMap = voices.reduce((acc, voice) => {
            acc[voice.id] = voice
            return acc
          }, {})
        }
      }

      // Add voice names to audios
      const audiosWithVoices = audios.map((audio) => ({
        ...audio,
        voices: voicesMap[audio.voice_id] || { name: "Unknown Voice" },
      }))

      setGeneratedAudiosList(audiosWithVoices || [])
    } catch (err) {
      if (!silent) setError(`Failed to load generated audios: ${err.message}`)
    } finally {
      if (!silent) setLoadingGeneratedAudios(false)
    }
  }

  const handleRefreshAudios = async () => {
    setRefreshingAudios(true)
    await fetchGeneratedAudios()
    setRefreshingAudios(false)
  }

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      setAudioFile(file)
      setVoiceName(file.name.split(".")[0])
    }
  }

  const handleVoiceUpload = async (e) => {
    e.preventDefault()
    if (!audioFile || !voiceName.trim()) {
      setError("Please select an audio file and provide a name for your voice.")
      return
    }

    setUploading(true)
    setError("")
    setSuccessMessage("")
    setUploadProgress(0)
    try {
      const filePath = `voices/${user.id}/${Date.now()}-${audioFile.name}`
      const { data, error: uploadError } = await supabase.storage.from("avatar-media").upload(filePath, audioFile, {
        cacheControl: "3600",
        upsert: false,
        onUploadProgress: (event) => {
          if (event.lengthComputable) {
            setUploadProgress(Math.round((event.loaded / event.total) * 100))
          }
        },
      })

      if (uploadError) throw uploadError

      const { data: publicUrlData } = supabase.storage.from("avatar-media").getPublicUrl(filePath)

      if (!publicUrlData || !publicUrlData.publicUrl) {
        throw new Error("Failed to get public URL for uploaded voice.")
      }

      const { data: newVoice, error: insertError } = await supabase
        .from("voices")
        .insert({
          user_id: user.id,
          name: voiceName.trim(),
          audio_url: publicUrlData.publicUrl,
          is_public: isPublicVoice,
          is_cloned: true,
        })
        .select()
        .single()

      if (insertError) throw insertError

      setSuccessMessage("Voice uploaded and created successfully!")
      setAudioFile(null)
      setVoiceName("")
      setIsPublicVoice(false)
      setUploadProgress(0)
      setSelectedTab("my")
      fetchVoices()
    } catch (err) {
      setError(`Failed to upload voice: ${err.message}`)
    } finally {
      setUploading(false)
      setTimeout(() => setError(""), 5000)
      setTimeout(() => setSuccessMessage(""), 5000)
    }
  }

  const handleDeleteVoice = async (voiceId, audioUrl) => {
    requestConfirmation("Are you sure you want to delete this voice? This action cannot be undone.", async () => {
      try {
        const filePath = audioUrl.split("/avatar-media/")[1]
        if (filePath) {
          const { error: storageError } = await supabase.storage.from("avatar-media").remove([filePath])
          if (storageError) console.error("Error deleting file from storage:", storageError)
        }

        const { error: deleteError } = await supabase.from("voices").delete().eq("id", voiceId)
        if (deleteError) throw deleteError

        setSuccessMessage("Voice deleted successfully.")
        fetchVoices()
      } catch (err) {
        setError(`Failed to delete voice: ${err.message}`)
      } finally {
        setTimeout(() => setError(""), 5000)
        setTimeout(() => setSuccessMessage(""), 5000)
      }
    })
  }

  const handleDeleteGeneratedAudio = async (audioId, audioUrl) => {
    requestConfirmation(
      "Are you sure you want to delete this generated audio? This action cannot be undone.",
      async () => {
        try {
          // Delete from storage if audio_url exists and is not empty
          if (audioUrl && audioUrl.trim() !== "") {
            try {
              const filePath = audioUrl.split("/avatar-media/")[1]
              if (filePath) {
                const { error: storageError } = await supabase.storage.from("avatar-media").remove([filePath])
                if (storageError) console.error("Error deleting file from storage:", storageError)
              }
            } catch (storageError) {
              console.error("Error deleting from storage:", storageError)
            }
          }

          // Delete from database
          const { error: deleteError } = await supabase
            .from("generated_audios")
            .delete()
            .eq("id", audioId)
            .eq("user_id", user.id)

          if (deleteError) throw deleteError

          setSuccessMessage("Generated audio deleted successfully.")
          fetchGeneratedAudios()
        } catch (err) {
          setError(`Failed to delete generated audio: ${err.message}`)
        } finally {
          setTimeout(() => setError(""), 5000)
          setTimeout(() => setSuccessMessage(""), 5000)
        }
      },
    )
  }

  const handlePlayPause = (audioId, audioUrl) => {
    if (!audioUrl) return

    const audioRef = audioRefs.current[audioId]
    if (!audioRef) {
      audioRefs.current[audioId] = new Audio(audioUrl)

      // Load metadata immediately to show duration
      audioRefs.current[audioId].addEventListener("loadedmetadata", () => {
        const audio = audioRefs.current[audioId]
        if (audio && audio.duration) {
          setAudioProgress((prev) => ({
            ...prev,
            [audioId]: {
              currentTime: 0,
              duration: audio.duration,
              progress: 0,
            },
          }))
        }
      })

      audioRefs.current[audioId].addEventListener("timeupdate", () => {
        const audio = audioRefs.current[audioId]
        if (audio) {
          setAudioProgress((prev) => ({
            ...prev,
            [audioId]: {
              currentTime: audio.currentTime,
              duration: audio.duration || 0,
              progress: audio.duration ? (audio.currentTime / audio.duration) * 100 : 0,
            },
          }))
        }
      })

      audioRefs.current[audioId].addEventListener("ended", () => {
        setPlayingAudio(null)
        setAudioProgress((prev) => ({
          ...prev,
          [audioId]: { currentTime: 0, duration: prev[audioId]?.duration || 0, progress: 0 },
        }))
      })

      // Load metadata immediately
      audioRefs.current[audioId].load()
    }

    const audio = audioRefs.current[audioId]
    if (playingAudio === audioId) {
      audio.pause()
      setPlayingAudio(null)
    } else {
      // Pause any currently playing audio
      Object.values(audioRefs.current).forEach((a) => a.pause())
      setPlayingAudio(audioId)
      audio.play()
    }
  }

  const handleSeek = (audioId, seekTime) => {
    const audio = audioRefs.current[audioId]
    if (audio && audio.duration) {
      audio.currentTime = seekTime
    }
  }

  const handleSpeedChange = (audioId) => {
    const audio = audioRefs.current[audioId]
    if (!audio) return

    const currentSpeed = audioSpeeds[audioId] || 1
    const speeds = [1, 1.25, 1.5, 2, 0.75]
    const currentIndex = speeds.indexOf(currentSpeed)
    const nextIndex = (currentIndex + 1) % speeds.length
    const newSpeed = speeds[nextIndex]

    audio.playbackRate = newSpeed
    setAudioSpeeds((prev) => ({
      ...prev,
      [audioId]: newSpeed,
    }))
  }

  const handleDownloadAudio = (audioUrl, fileName) => {
    const link = document.createElement("a")
    link.href = audioUrl
    link.download = fileName || "audio.wav"
    link.target = "_blank"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00"
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleGenerateTTS = async (e) => {
    e.preventDefault()
    if (!selectedVoiceForTTS) {
      setError("Please select a voice to generate audio.")
      return
    }
    if (!ttsText.trim()) {
      setError("Please enter text to generate audio.")
      return
    }

    // Check text length limit - 1000 characters
    if (ttsText.trim().length > 1000) {
      setError("Text is too long. Maximum 1000 characters allowed.")
      return
    }

    // Check usage limits
    if (usage && usage.audioGeneration && usage.audioGeneration.remaining <= 0) {
      setError(`You have exceeded your monthly audio generation limit of ${usage.audioGeneration.limit} generations.`)
      return
    }

    setGeneratingTTS(true)
    setGeneratedAudioUrl(null)
    setError(null)
    setSuccessMessage("")

    // Create temporary record in UI
    const tempAudioId = `temp-${Date.now()}`
    const newTempAudio = {
      id: tempAudioId,
      text_input: ttsText,
      language: ttsLanguage,
      voice_id: selectedVoiceForTTS.id,
      voice_name: selectedVoiceForTTS.name,
      created_at: new Date().toISOString(),
      timestamp: new Date().toISOString(),
      status: "queued",
      audio_url: "",
      error_message: null,
      voices: { name: selectedVoiceForTTS.name },
    }

    setGeneratedAudiosList((prev) => {
      const newList = [newTempAudio, ...prev]
      return newList
    })
    setSelectedTab("generated")

    try {
      // Try backend first, fallback to direct processing
      const backendApiBaseUrl = import.meta.env.VITE_BACKEND_API_URL
      let backendSuccess = false
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (session) {
          const response = await fetch(`${backendApiBaseUrl}/audio-generation/generate`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              voiceId: selectedVoiceForTTS.id,
              text: ttsText,
              language: ttsLanguage,
            }),
          })

          const result = await response.json()
          if (response.ok && result.success && result.data && result.data.record) {
            // Update the temporary record with the real record data
            setGeneratedAudiosList((prev) =>
              prev.map((audio) =>
                audio.id === tempAudioId
                  ? {
                      ...result.data.record,
                      voices: { name: selectedVoiceForTTS.name },
                    }
                  : audio,
              ),
            )
            if (result.data.record.audio_url) {
              setGeneratedAudioUrl(result.data.record.audio_url)
              setSuccessMessage("Audio generated and saved successfully!")
            }
            backendSuccess = true
            // Refresh usage stats only after successful generation
            fetchUsageStats()
          } else {
            throw new Error(result.message || "Backend processing failed")
          }
        }
      } catch (backendError) {
        // Silent fallback
      }

      if (!backendSuccess) {
        // Fallback: Create record directly in Supabase matching your schema
        const currentTimestamp = new Date().toISOString()
        const { data: record, error: recordError } = await supabase
          .from("generated_audios")
          .insert({
            user_id: user.id,
            voice_id: selectedVoiceForTTS.id,
            text_input: ttsText,
            language: ttsLanguage,
            audio_url: "", // Required field in your schema
            status: "queued",
            created_at: currentTimestamp,
            timestamp: currentTimestamp,
            error_message: null,
          })
          .select()
          .single()

        if (recordError) {
          throw new Error(`Failed to create record: ${recordError.message}`)
        }

        // Update the temporary record with the real record data
        setGeneratedAudiosList((prev) =>
          prev.map((audio) =>
            audio.id === tempAudioId
              ? {
                  ...record,
                  voices: { name: selectedVoiceForTTS.name },
                }
              : audio,
          ),
        )
        setSuccessMessage("Audio generation request created! Processing will happen when backend is available.")
      }
    } catch (err) {
      setGeneratedAudiosList((prev) =>
        prev.map((audio) =>
          audio.id === tempAudioId
            ? {
                ...audio,
                status: "failed",
                error_message: `Failed to generate audio: ${err.message}`,
              }
            : audio,
        ),
      )
      setError("Failed to generate audio. Please try again later.")
    } finally {
      setGeneratingTTS(false)
      setTimeout(() => setSuccessMessage(""), 5000)
      setTimeout(() => setError(""), 5000)
    }
  }

  const getUsageColor = (used, limit) => {
    const percentage = (used / limit) * 100
    if (percentage >= 90) return "text-red-500"
    if (percentage >= 70) return "text-yellow-500"
    return "text-green-500"
  }

  const getProgressColor = (used, limit) => {
    const percentage = (used / limit) * 100
    if (percentage >= 90) return "bg-red-500"
    if (percentage >= 70) return "bg-yellow-500"
    return "bg-green-500"
  }

  const renderVoiceList = (voices, type) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {voices.length === 0 ? (
        <div className="col-span-full text-center py-12">
          <div className="bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Mic className="h-8 w-8 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="text-gray-500 dark:text-gray-400">
            {type === "my" ? "You haven't uploaded any voices yet." : "No public voices available."}
          </p>
        </div>
      ) : (
        voices.map((voice) => (
          <motion.div
            key={voice.id}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200"
            whileHover={{ scale: 1.02 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg">
                <Mic className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 dark:text-white truncate">{voice.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  {voice.is_cloned && (
                    <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-2 py-1 rounded-full">
                      Cloned
                    </span>
                  )}
                  {voice.is_public && (
                    <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-1 rounded-full">
                      Public
                    </span>
                  )}
                </div>
              </div>
            </div>
            {/* Audio Player */}
            {voice.audio_url && (
              <div className="mb-4">
                <div className="flex items-center space-x-3 mb-2">
                  <button
                    onClick={() => handlePlayPause(voice.id, voice.audio_url)}
                    className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full hover:from-purple-600 hover:to-blue-600 transition-all duration-200 transform hover:scale-110"
                  >
                    {playingAudio === voice.id ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
                  </button>
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                      <span>{formatTime(audioProgress[voice.id]?.currentTime || 0)}</span>
                      <span>{formatTime(audioProgress[voice.id]?.duration || 0)}</span>
                    </div>
                    <div
                      className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 cursor-pointer"
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect()
                        const clickX = e.clientX - rect.left
                        const width = rect.width
                        const duration = audioProgress[voice.id]?.duration || 0
                        const seekTime = (clickX / width) * duration
                        handleSeek(voice.id, seekTime)
                      }}
                    >
                      <div
                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-1.5 rounded-full transition-all duration-200"
                        style={{
                          width: `${audioProgress[voice.id]?.progress || 0}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <button
                    onClick={() => handleSpeedChange(voice.id)}
                    className="text-xs bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    {audioSpeeds[voice.id] || 1}x
                  </button>
                  <button
                    onClick={() => handleDownloadAudio(voice.audio_url, `${voice.name}.wav`)}
                    className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1"
                  >
                    <Download size={12} /> Download
                  </button>
                </div>
              </div>
            )}
            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(voice.created_at).toLocaleDateString()}
              </div>
              <div className="flex items-center space-x-2">
                {type === "my" && (
                  <button
                    onClick={() => handleDeleteVoice(voice.id, voice.audio_url)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors duration-200"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={() => {
                    setSelectedVoiceForTTS(voice)
                    setTtsLanguage("en")
                    setTtsText("")
                    setGeneratedAudioUrl(null)
                    setSelectedTab("generate")
                  }}
                  className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors text-xs flex items-center gap-1"
                >
                  <Volume2 size={14} /> Use for TTS
                </button>
              </div>
            </div>
          </motion.div>
        ))
      )}
    </div>
  )

  const renderGeneratedAudiosList = () => {
    const allVoices = [...myVoices, ...publicVoices]
    const filteredAndSortedAudios = generatedAudiosList
      .filter((audio) => (generatedAudioFilterVoice ? audio.voice_id === generatedAudioFilterVoice : true))
      .sort((a, b) => {
        const dateA = new Date(a.created_at || a.timestamp)
        const dateB = new Date(b.created_at || b.timestamp)
        return generatedAudioSortOrder === "desc" ? dateB - dateA : dateA - dateB
      })

    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Your Generated Audios</h3>
          <div className="flex-grow"></div>
          <button
            onClick={handleRefreshAudios}
            disabled={refreshingAudios}
            className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshingAudios ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <select
            value={generatedAudioFilterVoice}
            onChange={(e) => setGeneratedAudioFilterVoice(e.target.value)}
            className="p-2 text-sm rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:ring-1 focus:ring-purple-500 outline-none text-gray-900 dark:text-white"
            title="Filter by Voice"
          >
            <option value="">All Voices</option>
            {allVoices.map((voice) => (
              <option key={voice.id} value={voice.id}>
                {voice.name}
              </option>
            ))}
          </select>
          <select
            value={generatedAudioSortOrder}
            onChange={(e) => setGeneratedAudioSortOrder(e.target.value)}
            className="p-2 text-sm rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:ring-1 focus:ring-purple-500 outline-none text-gray-900 dark:text-white"
            title="Sort by Date"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>

        {loadingGeneratedAudios && (
          <div className="text-center py-8 text-gray-600 dark:text-gray-400">
            <Loader2 className="animate-spin inline-block mr-2" size={24} /> Loading generated audios...
          </div>
        )}

        {!loadingGeneratedAudios && filteredAndSortedAudios.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <History className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400">No generated audios found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredAndSortedAudios.map((audio) => (
              <motion.div
                key={audio.id}
                className={`bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border transition-all duration-200 ${
                  audio.status === "failed"
                    ? "border-red-200 dark:border-red-800"
                    : audio.status === "processing" || audio.status === "queued"
                      ? "border-yellow-200 dark:border-yellow-800"
                      : "border-gray-200 dark:border-gray-700"
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                    {audio.voices?.name || audio.voice_name || "Unknown Voice"}
                  </span>
                  <div className="flex items-center gap-2">
                    {(audio.status === "queued" || audio.status === "processing") && (
                      <div className="flex items-center gap-1">
                        <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />
                        <span className="text-xs text-yellow-600 dark:text-yellow-400 capitalize">{audio.status}</span>
                      </div>
                    )}
                    {audio.status === "completed" && (
                      <div className="flex items-center gap-1">
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-xs text-green-600 dark:text-green-400">Completed</span>
                      </div>
                    )}
                    {audio.status === "failed" && (
                      <div className="flex items-center gap-1">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <span className="text-xs text-red-600 dark:text-red-400">Failed</span>
                      </div>
                    )}
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Clock size={12} /> {new Date(audio.created_at || audio.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="mb-4 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg max-h-24 overflow-y-auto">
                  <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">"{audio.text_input}"</p>
                </div>

                {audio.status === "completed" && audio.audio_url && audio.audio_url.trim() !== "" && (
                  <div className="mb-4">
                    <div className="flex items-center space-x-3 mb-2">
                      <button
                        onClick={() => handlePlayPause(audio.id, audio.audio_url)}
                        className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-full hover:from-green-600 hover:to-blue-600 transition-all duration-200 transform hover:scale-110"
                      >
                        {playingAudio === audio.id ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4 ml-0.5" />
                        )}
                      </button>
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                          <span>{formatTime(audioProgress[audio.id]?.currentTime || 0)}</span>
                          <span>{formatTime(audioProgress[audio.id]?.duration || 0)}</span>
                        </div>
                        <div
                          className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 cursor-pointer"
                          onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect()
                            const clickX = e.clientX - rect.left
                            const width = rect.width
                            const duration = audioProgress[audio.id]?.duration || 0
                            const seekTime = (clickX / width) * duration
                            handleSeek(audio.id, seekTime)
                          }}
                        >
                          <div
                            className="bg-gradient-to-r from-green-500 to-blue-500 h-1.5 rounded-full transition-all duration-200"
                            style={{
                              width: `${audioProgress[audio.id]?.progress || 0}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <button
                        onClick={() => handleSpeedChange(audio.id)}
                        className="text-xs bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        {audioSpeeds[audio.id] || 1}x
                      </button>
                      <button
                        onClick={() => handleDownloadAudio(audio.audio_url, `generated-audio-${audio.id}.wav`)}
                        className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1"
                      >
                        <Download size={12} /> Download
                      </button>
                    </div>
                    <a
                      href={audio.audio_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-2"
                    >
                      <LinkIcon size={12} /> Direct Link
                    </a>
                  </div>
                )}

                {audio.status === "failed" && (
                  <div className="text-red-500 text-sm flex items-start gap-2 py-3 bg-red-50 dark:bg-red-900/20 rounded-lg p-3 mb-4">
                    <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Generation Failed</p>
                      <p className="text-xs mt-1">{audio.error_message || "Unknown error occurred."}</p>
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Language: {audio.language || "en"}</div>
                  <button
                    onClick={() => handleDeleteGeneratedAudio(audio.id, audio.audio_url)}
                    disabled={audio.status === "processing" || audio.status === "queued"}
                    className="px-3 py-1.5 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors text-xs flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Voice Library & Generation
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your voice collection and generate audio with AI</p>
        </div>

        {/* Usage Stats */}
        {usage && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Volume2 className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Audio Generation</span>
                </div>
                <span
                  className={`text-sm font-semibold ${
                    usage.audioGeneration
                      ? getUsageColor(usage.audioGeneration.used, usage.audioGeneration.limit)
                      : "text-gray-500"
                  }`}
                >
                  {usage.audioGeneration ? Math.max(0, usage.audioGeneration.limit - usage.audioGeneration.used) : 0}{" "}
                  left
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    usage.audioGeneration
                      ? getProgressColor(usage.audioGeneration.used, usage.audioGeneration.limit)
                      : "bg-gray-400"
                  }`}
                  style={{
                    width: usage.audioGeneration
                      ? `${Math.min(100, (usage.audioGeneration.used / usage.audioGeneration.limit) * 100)}%`
                      : "0%",
                  }}
                ></div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Video Generation</span>
                </div>
                <span
                  className={`text-sm font-semibold ${
                    usage.videoGeneration
                      ? getUsageColor(usage.videoGeneration.used, usage.videoGeneration.limit)
                      : "text-gray-500"
                  }`}
                >
                  {usage.videoGeneration ? Math.max(0, usage.videoGeneration.limit - usage.videoGeneration.used) : 0}{" "}
                  left
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    usage.videoGeneration
                      ? getProgressColor(usage.videoGeneration.used, usage.videoGeneration.limit)
                      : "bg-gray-400"
                  }`}
                  style={{
                    width: usage.videoGeneration
                      ? `${Math.min(100, (usage.videoGeneration.used / usage.videoGeneration.limit) * 100)}%`
                      : "0%",
                  }}
                ></div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Conversations</span>
                </div>
                <span
                  className={`text-sm font-semibold ${
                    usage.conversation
                      ? getUsageColor(usage.conversation.used, usage.conversation.limit)
                      : "text-gray-500"
                  }`}
                >
                  {usage.conversation ? Math.max(0, usage.conversation.limit - usage.conversation.used) : 0} left
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    usage.conversation
                      ? getProgressColor(usage.conversation.used, usage.conversation.limit)
                      : "bg-gray-400"
                  }`}
                  style={{
                    width: usage.conversation
                      ? `${Math.min(100, (usage.conversation.used / usage.conversation.limit) * 100)}%`
                      : "0%",
                  }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Global Error/Success Messages */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg relative mb-6 text-sm flex items-center gap-2"
              role="alert"
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </motion.div>
          )}
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg relative mb-6 text-sm flex items-center gap-2"
              role="alert"
            >
              <Check size={16} />
              <span>{successMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center border-b border-gray-300 dark:border-gray-700 mb-8">
          {[
            { key: "my", label: "My Voices", icon: Mic },
            { key: "public", label: "Public Voices", icon: Users },
            { key: "upload", label: "Upload Voice", icon: Upload },
            { key: "generate", label: "Generate Audio", icon: Volume2 },
            { key: "generated", label: "Generated Audios", icon: History },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-t-lg transition-all duration-200 ${
                selectedTab === key
                  ? "bg-white dark:bg-gray-800 text-purple-700 dark:text-purple-300 border-b-2 border-purple-600 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
              onClick={() => setSelectedTab(key)}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-600 dark:text-gray-400">
            <Loader2 className="animate-spin inline-block mr-2" size={32} />
            <p className="mt-4">Loading voices...</p>
          </div>
        ) : (
          <>
            {selectedTab === "my" && renderVoiceList(myVoices, "my")}
            {selectedTab === "public" && renderVoiceList(publicVoices, "public")}
            {selectedTab === "upload" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="max-w-2xl mx-auto"
              >
                <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
                    Upload New Voice for Cloning
                  </h3>
                  <form onSubmit={handleVoiceUpload} className="space-y-6">
                    <div>
                      <label
                        htmlFor="voiceName"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        Voice Name
                      </label>
                      <input
                        type="text"
                        id="voiceName"
                        value={voiceName}
                        onChange={(e) => setVoiceName(e.target.value)}
                        required
                        className="w-full p-3 text-sm rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 outline-none text-gray-900 dark:text-white"
                        placeholder="e.g., My AI Voice, Professional Narrator"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="audioFile"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        Audio File (MP3, WAV, FLAC - Max 5MB, Recommended 10s+)
                      </label>
                      <input
                        type="file"
                        id="audioFile"
                        accept="audio/mp3,audio/wav,audio/flac"
                        onChange={handleFileUpload}
                        required
                        className="w-full p-3 text-sm rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 outline-none text-gray-900 dark:text-white file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-500 file:text-white hover:file:bg-purple-600"
                      />
                      {audioFile && (
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 truncate">{audioFile.name}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="isPublicVoice"
                        checked={isPublicVoice}
                        onChange={(e) => setIsPublicVoice(e.target.checked)}
                        className="h-4 w-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <label htmlFor="isPublicVoice" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Make this voice public for others to use
                      </label>
                    </div>
                    {uploading && uploadProgress > 0 && (
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-purple-600 to-pink-600 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                        <p className="text-xs text-center mt-2 text-gray-500 dark:text-gray-400">
                          {uploadProgress}% uploaded
                        </p>
                      </div>
                    )}
                    <button
                      type="submit"
                      disabled={uploading}
                      className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold text-base hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="animate-spin h-5 w-5" /> Uploading...
                        </>
                      ) : (
                        <>
                          <Upload size={20} /> Upload Voice
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </motion.div>
            )}
            {selectedTab === "generate" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="max-w-2xl mx-auto"
              >
                <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
                    Generate Audio from Text
                  </h3>
                  <form onSubmit={handleGenerateTTS} className="space-y-6">
                    <div>
                      <label
                        htmlFor="ttsVoiceSelect"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        Select Voice
                      </label>
                      <select
                        id="ttsVoiceSelect"
                        value={selectedVoiceForTTS ? selectedVoiceForTTS.id : ""}
                        onChange={(e) => {
                          const voice = [...myVoices, ...publicVoices].find((v) => v.id === e.target.value)
                          setSelectedVoiceForTTS(voice)
                          setGeneratedAudioUrl(null)
                        }}
                        className="w-full p-3 text-sm rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 outline-none text-gray-900 dark:text-white"
                      >
                        <option value="">-- Select a voice --</option>
                        <optgroup label="My Voices">
                          {myVoices.map((voice) => (
                            <option key={voice.id} value={voice.id}>
                              {voice.name}
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="Public Voices">
                          {publicVoices.map((voice) => (
                            <option key={voice.id} value={voice.id}>
                              {voice.name}
                            </option>
                          ))}
                        </optgroup>
                      </select>
                      {selectedVoiceForTTS && (
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          Selected: <span className="font-medium">{selectedVoiceForTTS.name}</span>
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="ttsLanguageSelect"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        Select Language
                      </label>
                      <select
                        id="ttsLanguageSelect"
                        value={ttsLanguage}
                        onChange={(e) => {
                          setTtsLanguage(e.target.value)
                          setGeneratedAudioUrl(null)
                        }}
                        className="w-full p-3 text-sm rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 outline-none text-gray-900 dark:text-white"
                      >
                        {SUPPORTED_TTS_LANGUAGES.map((lang) => (
                          <option key={lang.code} value={lang.code}>
                            {lang.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor="ttsText"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        Text to Generate (Max 1000 characters)
                      </label>
                      <textarea
                        id="ttsText"
                        value={ttsText}
                        onChange={(e) => setTtsText(e.target.value)}
                        rows="5"
                        maxLength={1000}
                        className="w-full p-3 text-sm rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 outline-none text-gray-900 dark:text-white"
                        placeholder="Enter the text you want your selected voice to speak..."
                      ></textarea>
                      <div className="text-right text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {ttsText.length}/1000 characters
                      </div>
                    </div>
                    {generatedAudioUrl && !generatingTTS && (
                      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                          Last Generated Audio:
                        </p>
                        <audio
                          controls
                          src={generatedAudioUrl}
                          ref={audioPlayerRef}
                          className="w-full rounded-md"
                        ></audio>
                      </div>
                    )}
                    <button
                      type="submit"
                      disabled={
                        generatingTTS ||
                        !selectedVoiceForTTS ||
                        !ttsText.trim() ||
                        (usage && usage.audioGeneration && usage.audioGeneration.remaining <= 0)
                      }
                      className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold text-base hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {generatingTTS ? (
                        <>
                          <Loader2 className="animate-spin h-5 w-5" /> Generating...
                        </>
                      ) : (
                        <>
                          <Play size={20} /> Generate Audio
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </motion.div>
            )}
            {selectedTab === "generated" && renderGeneratedAudiosList()}
          </>
        )}

        {/* Custom Confirmation Modal */}
        <AnimatePresence>
          {showConfirmModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={handleCancelConfirm}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl max-w-sm w-full relative text-center border border-gray-200 dark:border-gray-700"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Confirm Action</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-6">{confirmMessage}</p>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={handleConfirm}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={handleCancelConfirm}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Custom Info Modal */}
        <AnimatePresence>
          {showInfoModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={() => setShowInfoModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl max-w-sm w-full relative text-center border border-gray-200 dark:border-gray-700"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Information</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-6">{infoMessage}</p>
                <button
                  onClick={() => setShowInfoModal(false)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                >
                  OK
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default VoicesPage
