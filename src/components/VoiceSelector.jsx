import { Volume2 } from "lucide-react";
import PropTypes from "prop-types";

export default function VoiceSelector({
  voices,
  selectedVoice,
  onSelect,
  theme,
}) {
  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        <Volume2 size={16} />
        Voice
      </label>

      <select
        value={selectedVoice?.id || ""}
        onChange={(e) => {
          const voice = voices.find((v) => v.id === e.target.value);
          onSelect(voice);
        }}
        className={`w-full px-4 py-3 ${
          theme === "dark"
            ? "bg-gray-800 border-gray-700 text-white"
            : "bg-gray-50 border-gray-300 text-gray-900"
        } border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500`}
      >
        <option value="">Select a voice...</option>
        {voices.map((voice) => (
          <option key={voice.id} value={voice.id}>
            {voice.name} {voice.is_stock ? "⭐" : ""}
          </option>
        ))}
      </select>
    </div>
  );
}

VoiceSelector.propTypes = {
  voices: PropTypes.arrayOf(PropTypes.object).isRequired,
  selectedVoice: PropTypes.object,
  onSelect: PropTypes.func.isRequired,
  theme: PropTypes.string.isRequired,
};
