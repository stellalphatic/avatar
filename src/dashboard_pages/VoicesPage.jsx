"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "../contexts/AuthContext"
import { Mic, Upload, Check, Loader2, Play, Trash2, AlertCircle, Volume2, History, Clock, LinkIcon } from "lucide-react"
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
      console.error("Error fetching voices:", err.message)
      setError(`Failed to load voices: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const fetchGeneratedAudios = async () => {
    if (!user) return
    setLoadingGeneratedAudios(true)
    setError("")
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/audio-generation/history`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        })

        if (response.ok) {
          const result = await response.json()
          if (result.success) {
            setGeneratedAudiosList(result.data.audios || [])
          }
        }
      }
    } catch (err) {
      console.error("Error fetching generated audios:", err.message)
      setError(`Failed to load generated audios: ${err.message}`)
    } finally {
      setLoadingGeneratedAudios(false)
    }
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
      console.error("Error uploading voice:", err.message)
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
        console.error("Error deleting voice:", err.message)
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
          const {
            data: { session },
          } = await supabase.auth.getSession()

          if (session) {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/audio-generation/${audioId}`, {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${session.access_token}`,
              },
            })

            if (response.ok) {
              setSuccessMessage("Generated audio deleted successfully.")
              fetchGeneratedAudios()
            } else {
              const error = await response.json()
              throw new Error(error.message || "Failed to delete audio")
            }
          }
        } catch (err) {
          console.error("Error deleting generated audio:", err.message)
          setError(`Failed to delete generated audio: ${err.message}`)
        } finally {
          setTimeout(() => setError(""), 5000)
          setTimeout(() => setSuccessMessage(""), 5000)
        }
      },
    )
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
    if (!authToken) {
      setError("Authentication token is missing. Please log in again.")
      return
    }

    // Check usage limits
    if (usage && usage.audioGeneration.remaining <= 0) {
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
      status: "generating",
      audio_url: null,
      error: null,
      voices: { name: selectedVoiceForTTS.name },
    }

    setGeneratedAudiosList((prev) => {
      const newList = [newTempAudio, ...prev]
      return newList
    })
    setSelectedTab("generated")

    try {
      const backendApiBaseUrl = import.meta.env.VITE_BACKEND_API_URL
      console.log("Sending request to backend audio generation:", {
        voiceId: selectedVoiceForTTS.id,
        text: ttsText,
        language: ttsLanguage,
      })

      const response = await fetch(`${backendApiBaseUrl}/audio-generation/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          voiceId: selectedVoiceForTTS.id,
          text: ttsText,
          language: ttsLanguage,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setGeneratedAudiosList((prev) =>
          prev.map((audio) =>
            audio.id === tempAudioId
              ? {
                  ...audio,
                  status: "failed",
                  error_message: result.message || `Failed to generate audio (Status: ${response.status}).`,
                }
              : audio,
          ),
        )
        setError(result.message || `Failed to generate audio (Status: ${response.status}).`)
        console.error("Backend audio generation error:", result)
        return
      }

      if (result.success && result.data && result.data.record) {
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

        // Refresh usage stats
        fetchUsageStats()

        // Start polling for completion if status is generating
        if (result.data.record.status === "generating") {
          pollAudioCompletion(result.data.record.id)
        }
      } else {
        setGeneratedAudiosList((prev) =>
          prev.map((audio) =>
            audio.id === tempAudioId
              ? { ...audio, status: "failed", error_message: "Backend did not return a valid record." }
              : audio,
          ),
        )
        setError("Backend did not return a valid record.")
      }
    } catch (err) {
      console.error("Error generating TTS via backend:", err)
      setGeneratedAudiosList((prev) =>
        prev.map((audio) =>
          audio.id === tempAudioId
            ? {
                ...audio,
                status: "failed",
                error_message: `Failed to generate audio: ${err.message}. Please check server logs.`,
              }
            : audio,
        ),
      )
      setError("Failed to generate audio. Please check server logs and ensure the voice service is running.")
    } finally {
      setGeneratingTTS(false)
      setTimeout(() => setSuccessMessage(""), 5000)
      setTimeout(() => setError(""), 5000)
    }
  }

  // Poll for audio completion
  const pollAudioCompletion = async (recordId) => {
    const maxAttempts = 30 // 30 attempts with 2 second intervals = 1 minute max
    let attempts = 0

    const poll = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session) {
          const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/audio-generation/history`, {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          })

          if (response.ok) {
            const result = await response.json()
            if (result.success) {
              const updatedRecord = result.data.audios.find((audio) => audio.id === recordId)
              if (updatedRecord) {
                setGeneratedAudiosList((prev) =>
                  prev.map((audio) =>
                    audio.id === recordId
                      ? { ...updatedRecord, voices: { name: updatedRecord.voices?.name || "Unknown Voice" } }
                      : audio,
                  ),
                )

                if (updatedRecord.status === "completed" || updatedRecord.status === "failed") {
                  return // Stop polling
                }
              }
            }
          }
        }

        attempts++
        if (attempts < maxAttempts) {
          setTimeout(poll, 2000) // Poll every 2 seconds
        } else {
          // Mark as failed after timeout
          setGeneratedAudiosList((prev) =>
            prev.map((audio) =>
              audio.id === recordId ? { ...audio, status: "failed", error_message: "Generation timed out" } : audio,
            ),
          )
        }
      } catch (error) {
        console.error("Error polling audio completion:", error)
        attempts++
        if (attempts < maxAttempts) {
          setTimeout(poll, 2000)
        }
      }
    }

    setTimeout(poll, 2000) // Start polling after 2 seconds
  }

  const renderVoiceList = (voices, type) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {voices.length === 0 ? (
        <p className="col-span-full text-center text-sm text-gray-500 dark:text-gray-400 py-4">
          {type === "my" ? "You haven't uploaded any voices yet." : "No public voices available."}
        </p>
      ) : (
        voices.map((voice) => (
          <motion.div
            key={voice.id}
            className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col text-sm"
            whileHover={{ scale: 1.02, boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)" }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Mic size={20} className="text-purple-600" />
              <h4 className="text-base font-semibold text-gray-900 dark:text-white flex-grow truncate">{voice.name}</h4>
              {voice.is_cloned && (
                <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full">Cloned</span>
              )}
            </div>
            {voice.description && (
              <p className="text-gray-600 dark:text-gray-400 text-xs mb-2 line-clamp-2">{voice.description}</p>
            )}
            <audio controls src={voice.audio_url} className="w-full mb-3 rounded-md"></audio>
            <div className="flex justify-end gap-2 mt-auto">
              {type === "my" && (
                <button
                  onClick={() => handleDeleteVoice(voice.id, voice.audio_url)}
                  className="px-3 py-1 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors text-xs flex items-center gap-1"
                >
                  <Trash2 size={14} /> Delete
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
                className="px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors text-xs flex items-center gap-1"
              >
                <Volume2 size={14} /> Use for TTS
              </button>
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
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Your Generated Audios</h3>
          <div className="flex-grow"></div>
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
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-4">
            No generated audios found matching your criteria.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAndSortedAudios.map((audio) => (
              <motion.div
                key={audio.id}
                className={`bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow-sm border ${
                  audio.status === "failed" ? "border-red-500" : "border-gray-200 dark:border-gray-700"
                } flex flex-col`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                    {audio.voices?.name || audio.voice_name || "Unknown Voice"}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Clock size={12} /> {new Date(audio.created_at || audio.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-gray-800 dark:text-gray-200 mb-3 line-clamp-2">"{audio.text_input}"</p>
                {audio.status === "generating" && (
                  <div className="flex items-center justify-center py-3">
                    <Loader2 className="animate-spin h-5 w-5 text-purple-600 mr-2" />
                    <span className="text-purple-600 dark:text-purple-400 text-sm">Generating...</span>
                  </div>
                )}
                {audio.status === "completed" && audio.audio_url && (
                  <>
                    <audio controls src={audio.audio_url} className="w-full mb-3 rounded-md"></audio>
                    <a
                      href={audio.audio_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-1"
                    >
                      <LinkIcon size={12} /> Direct Link
                    </a>
                  </>
                )}
                {audio.status === "failed" && (
                  <div className="text-red-500 text-sm flex items-center gap-1 py-3">
                    <AlertCircle size={16} />
                    <span>Generation Failed: {audio.error_message || "Unknown error."}</span>
                  </div>
                )}
                <div className="flex justify-end mt-auto">
                  <button
                    onClick={() => handleDeleteGeneratedAudio(audio.id, audio.audio_url)}
                    disabled={audio.status === "generating"}
                    className="px-3 py-1 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors text-xs flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 my-8">
      <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6 text-center">
        Voice Library & Generation
      </h2>

      {/* Usage Display */}
      {usage && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-300">Audio Generation Usage</h3>
            <span className="text-xs text-blue-600 dark:text-blue-400">{usage.currentPlan} Plan</span>
          </div>
          <div className="flex items-center justify-between text-sm text-blue-700 dark:text-blue-300 mb-2">
            <span>Used: {usage.audioGeneration.used}</span>
            <span>Limit: {usage.audioGeneration.limit}</span>
          </div>
          <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${usage.audioGeneration.percentage}%` }}
            />
          </div>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
            {usage.audioGeneration.remaining} generation{usage.audioGeneration.remaining !== 1 ? "s" : ""} remaining
            this month
          </p>
        </div>
      )}

      {/* Global Error/Success Messages */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 px-4 py-3 rounded-md relative mb-4 text-sm flex items-center gap-2"
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
            className="bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-4 py-3 rounded-md relative mb-4 text-sm flex items-center gap-2"
            role="alert"
          >
            <Check size={16} />
            <span>{successMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab Navigation */}
      <div className="flex flex-wrap justify-center border-b border-gray-300 dark:border-gray-700 mb-8">
        <button
          className={`px-4 py-2 text-sm sm:text-base font-medium rounded-t-lg transition-colors duration-200 ${selectedTab === "my" ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-b-2 border-purple-600" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
          onClick={() => setSelectedTab("my")}
        >
          My Voices
        </button>
        <button
          className={`px-4 py-2 text-sm sm:text-base font-medium rounded-t-lg transition-colors duration-200 ${selectedTab === "public" ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-b-2 border-purple-600" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
          onClick={() => setSelectedTab("public")}
        >
          Public Voices
        </button>
        <button
          className={`px-4 py-2 text-sm sm:text-base font-medium rounded-t-lg transition-colors duration-200 ${selectedTab === "upload" ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-b-2 border-purple-600" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
          onClick={() => setSelectedTab("upload")}
        >
          Upload New Voice
        </button>
        <button
          className={`px-4 py-2 text-sm sm:text-base font-medium rounded-t-lg transition-colors duration-200 ${selectedTab === "generate" ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-b-2 border-purple-600" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
          onClick={() => setSelectedTab("generate")}
        >
          Generate Audio (TTS)
        </button>
        <button
          className={`px-4 py-2 text-sm sm:text-base font-medium rounded-t-lg transition-colors duration-200 ${selectedTab === "generated" ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-b-2 border-purple-600" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
          onClick={() => setSelectedTab("generated")}
        >
          <History size={16} className="inline-block mr-1" /> Generated Audios
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-600 dark:text-gray-400">
          <Loader2 className="animate-spin inline-block mr-2" size={24} /> Loading voices...
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
              className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700 max-w-2xl mx-auto"
            >
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-5 text-center">
                Upload New Voice for Cloning
              </h3>
              <form onSubmit={handleVoiceUpload} className="space-y-4">
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
                    className="w-full p-2 text-sm rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:ring-1 focus:ring-purple-500 outline-none text-gray-900 dark:text-white"
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
                    className="w-full p-2 text-sm rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:ring-1 focus:ring-purple-500 outline-none text-gray-900 dark:text-white file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-500 file:text-white hover:file:bg-purple-600"
                  />
                  {audioFile && (
                    <p className="mt-2 text-xs text-center mt-2 text-gray-500 truncate">{audioFile.name}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isPublicVoice"
                    checked={isPublicVoice}
                    onChange={(e) => setIsPublicVoice(e.target.checked)}
                    className="h-4 w-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label htmlFor="isPublicVoice" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Make this voice public?
                  </label>
                </div>
                {uploading && uploadProgress > 0 && (
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                    <p className="text-xs text-center mt-1 text-gray-500 dark:text-gray-400">
                      {uploadProgress}% uploaded
                    </p>
                  </div>
                )}
                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold text-base hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
            </motion.div>
          )}
          {selectedTab === "generate" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700 max-w-2xl mx-auto"
            >
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-5 text-center">
                Generate Audio from Text
              </h3>
              <form onSubmit={handleGenerateTTS} className="space-y-4">
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
                    className="w-full p-2 text-sm rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:ring-1 focus:ring-purple-500 outline-none text-gray-900 dark:text-white"
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
                    className="w-full p-2 text-sm rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:ring-1 focus:ring-purple-500 outline-none text-gray-900 dark:text-white"
                  >
                    {SUPPORTED_TTS_LANGUAGES.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="ttsText" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Text to Generate
                  </label>
                  <textarea
                    id="ttsText"
                    value={ttsText}
                    onChange={(e) => setTtsText(e.target.value)}
                    rows="5"
                    className="w-full p-2 text-sm rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:ring-1 focus:ring-purple-500 outline-none text-gray-900 dark:text-white"
                    placeholder="Enter the text you want your selected voice to speak..."
                  ></textarea>
                </div>
                {generatedAudioUrl && !generatingTTS && (
                  <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Last Generated Audio:</p>
                    <audio controls src={generatedAudioUrl} ref={audioPlayerRef} className="w-full rounded-md"></audio>
                  </div>
                )}
                <button
                  type="submit"
                  disabled={
                    generatingTTS ||
                    !selectedVoiceForTTS ||
                    !ttsText.trim() ||
                    (usage && usage.audioGeneration.remaining <= 0)
                  }
                  className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold text-base hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-sm w-full relative text-center border border-gray-200 dark:border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Confirm Action</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-6">{confirmMessage}</p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={handleConfirm}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
                >
                  Confirm
                </button>
                <button
                  onClick={handleCancelConfirm}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm"
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
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-sm w-full relative text-center border border-gray-200 dark:border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Information</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-6">{infoMessage}</p>
              <button
                onClick={() => setShowInfoModal(false)}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm"
              >
                OK
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default VoicesPage
