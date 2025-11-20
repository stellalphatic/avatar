import { Brain, Sparkles } from "lucide-react";
import PropTypes from "prop-types";

export default function PersonaSelector({
  personas,
  selectedPersona,
  onSelect,
  theme,
}) {
  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        <Brain size={16} />
        Personality
      </label>

      <div className="grid grid-cols-1 gap-2">
        {personas.map((persona) => (
          <button
            key={persona.id}
            onClick={() => onSelect(persona)}
            className={`text-left p-3 rounded-lg border-2 transition-all ${
              selectedPersona?.id === persona.id
                ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                : theme === "dark"
                ? "border-gray-700 bg-gray-800 hover:border-gray-600"
                : "border-gray-200 bg-gray-50 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`font-semibold ${
                      selectedPersona?.id === persona.id
                        ? "text-purple-600 dark:text-purple-400"
                        : "text-gray-900 dark:text-white"
                    }`}
                  >
                    {persona.name}
                  </span>
                  {persona.is_stock && (
                    <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Sparkles size={10} />
                      Stock
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {persona.description || persona.persona_role}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

PersonaSelector.propTypes = {
  personas: PropTypes.arrayOf(PropTypes.object).isRequired,
  selectedPersona: PropTypes.object,
  onSelect: PropTypes.func.isRequired,
  theme: PropTypes.string.isRequired,
};
