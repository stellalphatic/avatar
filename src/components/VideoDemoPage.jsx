import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Volume2, VolumeX, Play, Pause } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useTheme } from "../contexts/ThemeContext"

const VideoDemoPage = () => {
  const { theme } = useTheme()
  const navigate = useNavigate()
  const videoRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isMuted, setIsMuted] = useState(false)
  const [showControls, setShowControls] = useState(false)
  const [videoLoaded, setVideoLoaded] = useState(false)
  const hideControlsTimeout = useRef(null)

  // Auto-play video when loaded
  useEffect(() => {
    if (videoRef.current && videoLoaded) {
      videoRef.current.play().catch(err => {
        console.log("Autoplay prevented:", err)
        setIsPlaying(false)
      })
    }
  }, [videoLoaded])

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.code === "Space" || e.key === " ") {
        e.preventDefault()
        togglePlayPause()
      } else if (e.code === "Escape") {
        navigate("/")
      } else if (e.key === "m" || e.key === "M") {
        toggleMute()
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [isPlaying, isMuted, navigate])

  // Show controls on mouse move
  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true)
      clearTimeout(hideControlsTimeout.current)
      hideControlsTimeout.current = setTimeout(() => {
        setShowControls(false)
      }, 3000)
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      clearTimeout(hideControlsTimeout.current)
    }
  }, [])

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
        setIsPlaying(false)
      } else {
        videoRef.current.play()
        setIsPlaying(true)
      }
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleClose = () => {
    navigate("/")
  }

  return (
    <div className="fixed inset-0 z-50 bg-black overflow-hidden">
      {/* Video Element */}
      <video
        ref={videoRef}
        src="/pitch.mp4"
        className="absolute inset-0 w-full h-full object-contain bg-black"
        onLoadedData={() => setVideoLoaded(true)}
        onEnded={() => setIsPlaying(false)}
        onClick={togglePlayPause}
        playsInline
      />

      {/* Loading Indicator */}
      {!videoLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full"
          />
        </div>
      )}

      {/* Controls Overlay */}
      <AnimatePresence>
        {showControls && videoLoaded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 pointer-events-none"
          >
            {/* Top Bar - Close Button */}
            <div className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/80 to-transparent">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <img
                    src="/MetaPresence.png"
                    alt="MetaPresence"
                    className="w-8 h-8 rounded-lg"
                  />
                  <span className="text-white font-bold text-lg">MetaPresence Pitch</span>
                </div>
                <button
                  onClick={handleClose}
                  className="pointer-events-auto p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>

            {/* Center Play/Pause Indicator */}
            {!isPlaying && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-auto"
                onClick={togglePlayPause}
              >
                <div className="w-24 h-24 rounded-full bg-purple-600/90 backdrop-blur-sm flex items-center justify-center shadow-2xl cursor-pointer hover:bg-purple-700/90 transition-colors">
                  <Play className="w-12 h-12 text-white ml-2" fill="white" />
                </div>
              </motion.div>
            )}

            {/* Bottom Right - Volume Control */}
            <div className="absolute bottom-8 right-8 pointer-events-auto">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleMute}
                className="p-4 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-sm transition-colors shadow-xl"
              >
                {isMuted ? (
                  <VolumeX className="w-6 h-6 text-white" />
                ) : (
                  <Volume2 className="w-6 h-6 text-white" />
                )}
              </motion.button>
            </div>

            {/* Bottom Left - Keyboard Shortcuts Help */}
            <div className="absolute bottom-8 left-8 bg-black/60 backdrop-blur-sm rounded-xl p-4 text-white text-sm">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <kbd className="px-2 py-1 bg-white/20 rounded text-xs font-mono">Space</kbd>
                  <span>Play / Pause</span>
                </div>
                <div className="flex items-center gap-3">
                  <kbd className="px-2 py-1 bg-white/20 rounded text-xs font-mono">M</kbd>
                  <span>Mute / Unmute</span>
                </div>
                <div className="flex items-center gap-3">
                  <kbd className="px-2 py-1 bg-white/20 rounded text-xs font-mono">Esc</kbd>
                  <span>Exit</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Paused State Overlay */}
      {!isPlaying && videoLoaded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center"
          onClick={togglePlayPause}
        >
          <div className="text-center text-white">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Pause className="w-20 h-20 mx-auto mb-4 opacity-80" />
            </motion.div>
            <p className="text-xl font-semibold">Video Paused</p>
            <p className="text-sm text-white/60 mt-2">Press Space or click to continue</p>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default VideoDemoPage
