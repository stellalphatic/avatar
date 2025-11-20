import { useState } from "react";
import { X, Search, Sparkles } from "lucide-react";
import PropTypes from "prop-types";

export default function AvatarSelector({
  isOpen,
  onClose,
  onSelect,
  avatars,
  theme,
}) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredAvatars = avatars.filter((avatar) =>
    avatar.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div
        className={`${
          theme === "dark"
            ? "bg-gray-900 border-gray-800"
            : "bg-white border-gray-200"
        } rounded-2xl border shadow-2xl w-full max-w-5xl max-h-[85vh] overflow-hidden flex flex-col animate-slideUp`}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-800">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Choose Your Avatar
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Select an avatar to start your conversation
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search avatars..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-12 pr-4 py-3 ${
                theme === "dark"
                  ? "bg-gray-800 border-gray-700 text-white"
                  : "bg-gray-50 border-gray-300 text-gray-900"
              } border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all`}
            />
          </div>
        </div>

        {/* Avatar Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredAvatars.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                No avatars found
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredAvatars.map((avatar) => (
                <div
                  key={avatar.id}
                  onClick={() => onSelect(avatar)}
                  className={`group relative ${
                    theme === "dark" ? "bg-gray-800" : "bg-gray-100"
                  } rounded-xl overflow-hidden cursor-pointer hover:scale-105 hover:shadow-xl transition-all duration-300`}
                >
                  {/* Badge for stock avatars */}
                  {avatar.is_stock && (
                    <div className="absolute top-2 right-2 z-10">
                      <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        <Sparkles size={12} />
                        Stock
                      </span>
                    </div>
                  )}

                  {/* Avatar Image */}
                  <div className="aspect-square overflow-hidden bg-gray-200 dark:bg-gray-700">
                    <img
                      src={avatar.image_url || "/placeholder.svg"}
                      alt={avatar.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>

                  {/* Avatar Info */}
                  <div className="p-3">
                    <h3
                      className={`font-semibold truncate ${
                        theme === "dark" ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {avatar.name}
                    </h3>
                    {avatar.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                        {avatar.description}
                      </p>
                    )}
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-600/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                    <button className="bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      Select Avatar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

AvatarSelector.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired,
  avatars: PropTypes.arrayOf(PropTypes.object).isRequired,
  theme: PropTypes.string.isRequired,
};
