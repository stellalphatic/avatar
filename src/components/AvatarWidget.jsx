import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, X, Lock } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

const AvatarWidget = () => {
  const { theme } = useTheme();
  const [isMinimized, setIsMinimized] = useState(true);

  if (isMinimized) {
    return (
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 2 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-8 right-8 z-50 w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 shadow-2xl hover:shadow-purple-500/50 flex items-center justify-center"
      >
        <Phone className="w-6 h-6 text-white" />
      </motion.button>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 20 }}
        className={`fixed bottom-8 right-8 z-50 w-96 rounded-2xl shadow-2xl overflow-hidden ${
          theme === "dark"
            ? "bg-gray-900 border border-gray-800"
            : "bg-white border border-gray-200"
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-bold text-lg">
                MetaPresence Assistant
              </h3>
              <p className="text-white/80 text-sm">AI-powered conversations</p>
            </div>
            <button
              onClick={() => setIsMinimized(true)}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Coming Soon Content */}
        <div className="p-12 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-purple-600/20 to-pink-600/20 border-2 border-purple-600/30 mb-6"
          >
            <Lock className="w-12 h-12 text-purple-600" />
          </motion.div>

          <h4
            className={`text-2xl font-bold mb-3 ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            Coming Soon
          </h4>
          <p
            className={`text-sm mb-6 ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Real-time voice and text conversations with AI avatars are currently
            in development.
          </p>

          <div
            className={`p-4 rounded-lg ${
              theme === "dark" ? "bg-gray-800" : "bg-gray-50"
            }`}
          >
            <p
              className={`text-xs ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              <strong>Stay tuned!</strong> We're working hard to bring you the
              most advanced AI conversation experience.
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AvatarWidget;
