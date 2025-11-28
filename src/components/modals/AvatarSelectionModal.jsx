import { useState } from "react";
// import { useTheme } from "../../contexts/ThemeContext";
import { X, Search,  Plus, Copy, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PropTypes from "prop-types";

export default function AvatarSelectionModal({
  isOpen,
  onClose,
  onSelect,
  avatars,
  selectedAvatar,
  onCreateNew,
}) {
  // const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedId, setCopiedId] = useState(null);

  const filteredAvatars = avatars.filter(
    (avatar) =>
      avatar.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      avatar.public_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const copyPublicId = (e, publicId) => {
    e.stopPropagation();
    navigator.clipboard.writeText(publicId);
    setCopiedId(publicId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Select Avatar
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Choose an avatar for your conversation
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Search & Create */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search avatars by name or ID..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={onCreateNew}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 font-medium"
              >
                <Plus className="w-4 h-4" />
                Create New
              </button>
            </div>
          </div>

          {/* Avatar Grid */}
          <div className="p-6 overflow-y-auto max-h-[500px]">
            {filteredAvatars.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 dark:text-gray-500 mb-2">
                  <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No avatars found</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAvatars.map((avatar) => (
                  <motion.div
                    key={avatar.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`relative group cursor-pointer rounded-xl overflow-hidden border-2 transition-all ${
                      selectedAvatar?.id === avatar.id
                        ? "border-blue-500 ring-2 ring-blue-500/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-blue-400"
                    }`}
                    onClick={() => onSelect(avatar)}
                  >
                    {/* Avatar Image */}
                    <div className="aspect-square bg-gray-100 dark:bg-gray-900 relative overflow-hidden">
                      {avatar.image_url ? (
                        <img
                          src={avatar.image_url}
                          alt={avatar.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <span className="text-4xl font-bold">
                            {avatar.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}

                      {/* Selected Indicator */}
                      {selectedAvatar?.id === avatar.id && (
                        <div className="absolute top-2 right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-4 bg-white dark:bg-gray-800">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                        {avatar.name}
                      </h3>
                      
                      {/* ✅ Public ID Display */}
                      <div className="flex items-center gap-2 mt-2">
                        <code className="text-xs font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded flex-1 truncate">
                          {avatar.public_id || "No ID"}
                        </code>
                        {avatar.public_id && (
                          <button
                            onClick={(e) => copyPublicId(e, avatar.public_id)}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                            title="Copy ID"
                          >
                            {copiedId === avatar.public_id ? (
                              <CheckCircle2 className="w-3 h-3 text-green-500" />
                            ) : (
                              <Copy className="w-3 h-3 text-gray-400" />
                            )}
                          </button>
                        )}
                      </div>

                      {avatar.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
                          {avatar.description}
                        </p>
                      )}

                      {/* Badges */}
                      <div className="flex gap-2 mt-2">
                        {avatar.is_stock && (
                          <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded">
                            Stock
                          </span>
                        )}
                        {avatar.is_public && (
                          <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded">
                            Public
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

AvatarSelectionModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired,
  avatars: PropTypes.array.isRequired,
  selectedAvatar: PropTypes.object,
  onCreateNew: PropTypes.func.isRequired,
};
