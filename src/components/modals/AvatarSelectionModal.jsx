import { X, Search, Plus, Sparkles, User } from "lucide-react";
import PropTypes from "prop-types";
import { useState } from "react";

export default function AvatarSelectionModal({
  isOpen,
  onClose,
  avatars,
  selectedAvatar,
  onSelect,
  onCreate,
  theme,
}) {
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  if (!isOpen) return null;

  const filteredAvatars = avatars.filter((avatar) => {
    const matchesSearch = avatar.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "stock" && avatar.is_stock) ||
      (activeTab === "personal" && !avatar.is_stock && !avatar.is_public);
    return matchesSearch && matchesTab;
  });

  const stockAvatars = avatars.filter((a) => a.is_stock);
  const personalAvatars = avatars.filter((a) => !a.is_stock && !a.is_public);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div
        className={`${
          theme === "dark"
            ? "bg-gray-900 border-gray-800"
            : "bg-white border-gray-200"
        } rounded-2xl border shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex animate-slideUp`}
      >
        {/* Left Side - Avatar List */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Pick a Replica
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X size={24} className="text-gray-500" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === "all"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                }`}
              >
                All Replicas
              </button>
              <button
                onClick={() => setActiveTab("personal")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === "personal"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                }`}
              >
                Personal
              </button>
              <button
                onClick={() => setActiveTab("stock")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === "stock"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                }`}
              >
                Stock
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Enter Replica ID to search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-12 pr-4 py-3 ${
                  theme === "dark"
                    ? "bg-gray-800 border-gray-700 text-white"
                    : "bg-gray-50 border-gray-300 text-gray-900"
                } border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500`}
              />
            </div>
          </div>

          {/* Avatar Grid */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Personal Avatars */}
            {activeTab !== "stock" && personalAvatars.length === 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-4">
                  Personal Replicas
                </h3>
                <div
                  onClick={onCreate}
                  className={`p-12 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
                    theme === "dark"
                      ? "border-gray-700 bg-gray-800 hover:border-purple-500"
                      : "border-gray-300 bg-gray-50 hover:border-purple-500"
                  }`}
                >
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Plus size={32} className="text-white" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">Create Replica</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Get started by creating your first custom avatar
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Stock Avatars Grid */}
            {activeTab !== "personal" && stockAvatars.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-4">
                  Stock Replicas ({stockAvatars.length})
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {filteredAvatars
                    .filter((a) => a.is_stock)
                    .map((avatar) => (
                      <AvatarGridCard
                        key={avatar.id}
                        avatar={avatar}
                        isSelected={selectedAvatar?.id === avatar.id}
                        onSelect={() => onSelect(avatar)}
                        theme={theme}
                      />
                    ))}
                </div>
              </div>
            )}

            {/* Personal Avatars Grid */}
            {activeTab !== "stock" && personalAvatars.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-4">
                  Personal Replicas ({personalAvatars.length})
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {filteredAvatars
                    .filter((a) => !a.is_stock)
                    .map((avatar) => (
                      <AvatarGridCard
                        key={avatar.id}
                        avatar={avatar}
                        isSelected={selectedAvatar?.id === avatar.id}
                        onSelect={() => onSelect(avatar)}
                        theme={theme}
                      />
                    ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {filteredAvatars.length === 0 && (
              <div className="text-center py-12">
                <User size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  No avatars found
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Preview */}
        {selectedAvatar && (
          <div
            className={`w-96 border-l ${
              theme === "dark"
                ? "border-gray-800 bg-gray-900"
                : "border-gray-200 bg-gray-50"
            } p-6`}
          >
            <div className="sticky top-6">
              <div className="aspect-video rounded-xl overflow-hidden mb-6 bg-gray-200 dark:bg-gray-800">
                {selectedAvatar.idle_video_url ? (
                  <video
                    src={selectedAvatar.idle_video_url}
                    autoPlay
                    loop
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={selectedAvatar.image_url || "/placeholder.svg"}
                    alt={selectedAvatar.name}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              <h2 className="text-2xl font-bold mb-4">{selectedAvatar.name}</h2>

              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 mb-1">
                    Replica ID
                  </p>
                  <p className="font-mono text-xs bg-gray-200 dark:bg-gray-800 px-3 py-2 rounded">
                    {selectedAvatar.id}
                  </p>
                </div>

                {selectedAvatar.created_at && (
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 mb-1">
                      Created
                    </p>
                    <p>
                      {new Date(selectedAvatar.created_at).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={() => onSelect(selectedAvatar)}
                className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                Select
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AvatarGridCard({ avatar, isSelected, onSelect }) {
  return (
    <div
      onClick={onSelect}
      className={`group relative rounded-xl overflow-hidden cursor-pointer transition-all ${
        isSelected ? "ring-4 ring-purple-500" : ""
      }`}
    >
      {avatar.is_stock && (
        <div className="absolute top-2 right-2 z-10">
          <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
            <Sparkles size={12} />
            PRO
          </span>
        </div>
      )}

      <div className="aspect-video overflow-hidden bg-gray-200 dark:bg-gray-700">
        {avatar.idle_video_url ? (
          <video
            src={avatar.idle_video_url}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
            muted
            loop
          />
        ) : (
          <img
            src={avatar.image_url || "/placeholder.svg"}
            alt={avatar.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
          />
        )}
      </div>

      <div
        className={`absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4`}
      >
        <span className="text-white font-semibold">{avatar.name}</span>
      </div>
    </div>
  );
}

AvatarSelectionModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  avatars: PropTypes.array.isRequired,
  selectedAvatar: PropTypes.object,
  onSelect: PropTypes.func.isRequired,
  onCreate: PropTypes.func.isRequired,
  theme: PropTypes.string.isRequired,
};

AvatarGridCard.propTypes = {
  avatar: PropTypes.object.isRequired,
  isSelected: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
  theme: PropTypes.string.isRequired,
};
