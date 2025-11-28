import { X, Search, Plus, Brain } from "lucide-react";
import PropTypes from "prop-types";
import { useState, useMemo } from "react";

export default function PersonaSelectionModal({
  isOpen,
  onClose,
  personas,
  selectedPersona,
  onSelect,
  onCreate,
  theme,
}) {
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ Move useMemo BEFORE the early return
  const filteredPersonas = useMemo(() => {
    if (!personas) return [];

    return personas.filter((persona) => {
      const matchesSearch = persona.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesTab =
        activeTab === "all" ||
        (activeTab === "stock" && persona.is_stock) ||
        (activeTab === "personal" && !persona.is_stock && !persona.is_public);
      return matchesSearch && matchesTab;
    });
  }, [personas, searchTerm, activeTab]);

  const stockPersonas = useMemo(() => {
    return personas?.filter((p) => p.is_stock) || [];
  }, [personas]);

  const personalPersonas = useMemo(() => {
    return personas?.filter((p) => !p.is_stock && !p.is_public) || [];
  }, [personas]);

  // ✅ NOW it's safe to return early
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div
        className={`${
          theme === "dark"
            ? "bg-gray-900 border-gray-800"
            : "bg-white border-gray-200"
        } rounded-2xl border shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col animate-slideUp`}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-800">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Brain className="text-purple-500" size={28} />
              Pick a Persona
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Persona is a customizable set of attributes that powers your
              replica behavior.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setActiveTab("all")}
            className={`flex-1 px-6 py-3 font-medium transition-colors ${
              activeTab === "all"
                ? "text-purple-600 border-b-2 border-purple-600"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            All Replicas
          </button>
          <button
            onClick={() => setActiveTab("personal")}
            className={`flex-1 px-6 py-3 font-medium transition-colors ${
              activeTab === "personal"
                ? "text-purple-600 border-b-2 border-purple-600"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Personal
          </button>
          <button
            onClick={() => setActiveTab("stock")}
            className={`flex-1 px-6 py-3 font-medium transition-colors ${
              activeTab === "stock"
                ? "text-purple-600 border-b-2 border-purple-600"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Stock
          </button>
        </div>

        {/* Search & Create */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Enter Persona ID to search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-12 pr-4 py-3 ${
                  theme === "dark"
                    ? "bg-gray-800 border-gray-700 text-white"
                    : "bg-gray-50 border-gray-300 text-gray-900"
                } border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500`}
              />
            </div>
            <button
              onClick={onCreate}
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Plus size={20} />
              Create Persona
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Personal Personas */}
          {activeTab !== "stock" && personalPersonas.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-4">
                Personal Personas ({personalPersonas.length})
              </h3>
              <div className="space-y-3">
                {filteredPersonas
                  .filter((p) => !p.is_stock)
                  .map((persona) => (
                    <PersonaCard
                      key={persona.id}
                      persona={persona}
                      isSelected={selectedPersona?.id === persona.id}
                      onSelect={() => onSelect(persona)}
                      theme={theme}
                    />
                  ))}
              </div>
            </div>
          )}

          {/* Stock Personas */}
          {activeTab !== "personal" && stockPersonas.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-4">
                Stock Personas ({stockPersonas.length})
              </h3>
              <div className="space-y-3">
                {filteredPersonas
                  .filter((p) => p.is_stock)
                  .map((persona) => (
                    <PersonaCard
                      key={persona.id}
                      persona={persona}
                      isSelected={selectedPersona?.id === persona.id}
                      onSelect={() => onSelect(persona)}
                      theme={theme}
                    />
                  ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {filteredPersonas.length === 0 && (
            <div className="text-center py-12">
              <Brain size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                No personas found
              </p>
              {activeTab === "personal" && (
                <button
                  onClick={onCreate}
                  className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all inline-flex items-center gap-2"
                >
                  <Plus size={20} />
                  Create Your First Persona
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            Select
          </button>
        </div>
      </div>
    </div>
  );
}

function PersonaCard({ persona, isSelected, onSelect, theme }) {
  return (
    <div
      onClick={onSelect}
      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
        isSelected
          ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
          : theme === "dark"
          ? "border-gray-700 bg-gray-800 hover:border-gray-600"
          : "border-gray-200 bg-gray-50 hover:border-gray-300"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3
              className={`font-bold ${
                isSelected ? "text-purple-600" : "text-gray-900 dark:text-white"
              }`}
            >
              {persona.name}
            </h3>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <code className="text-xs font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
              {persona.public_id}
            </code>
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(persona.public_id);
              }}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              title="Copy ID"
            >
              
            </button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            {persona.description || persona.persona_role}
          </p>
          <div className="flex flex-wrap gap-2">
            {persona.category && (
              <span className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded-full">
                {persona.category}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* System Prompt Preview */}
      <div
        className={`mt-4 p-3 rounded-lg ${
          theme === "dark" ? "bg-gray-900" : "bg-white"
        } border ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`}
      >
        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
          System Prompt
        </p>
        <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
          {persona.system_prompt}
        </p>
      </div>
    </div>
  );
}

PersonaSelectionModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  personas: PropTypes.array.isRequired,
  selectedPersona: PropTypes.object,
  onSelect: PropTypes.func.isRequired,
  onCreate: PropTypes.func.isRequired,
  theme: PropTypes.string.isRequired,
};

PersonaCard.propTypes = {
  persona: PropTypes.object.isRequired,
  isSelected: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
  theme: PropTypes.string.isRequired,
};
