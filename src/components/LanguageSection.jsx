import { motion } from "framer-motion";
import { Globe } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

const LanguageSection = () => {
  const { theme } = useTheme();

  const languages = [
    { name: "English", flag: "🇬🇧" },
    { name: "Spanish", flag: "🇪🇸" },
    { name: "French", flag: "🇫🇷" },
    { name: "German", flag: "🇩🇪" },
    { name: "Chinese", flag: "🇨🇳" },
    { name: "Japanese", flag: "🇯🇵" },
    { name: "Korean", flag: "🇰🇷" },
    { name: "Arabic", flag: "🇸🇦" },
    { name: "Russian", flag: "🇷🇺" },
    { name: "Portuguese", flag: "🇵🇹" },
    { name: "Italian", flag: "🇮🇹" },
    { name: "Hindi", flag: "🇮🇳" },
    { name: "Bengali", flag: "🇧🇩" },
    { name: "Turkish", flag: "🇹🇷" },
    { name: "Vietnamese", flag: "🇻🇳" },
    { name: "Thai", flag: "🇹🇭" },
    { name: "Greek", flag: "🇬🇷" },
    { name: "Dutch", flag: "🇳🇱" },
    { name: "Ukrainian", flag: "🇺🇦" },
    { name: "Swahili", flag: "🇰🇪" },
    { name: "Javanese", flag: "🇮🇩" },
    { name: "Tamil", flag: "🇮🇳" },
    { name: "Burmese", flag: "🇲🇲" },
    { name: "Amharic", flag: "🇪🇹" },
  ];

  return (
    <section
      className={`py-32 px-4 ${theme === "dark" ? "bg-black" : "bg-white"}`}
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/10 border border-blue-600/20 mb-6">
            <Globe className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-600">
              Built using OpenAI API
            </span>
          </div>

          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Real-Time Multilingual
            </span>
            <br />
            <span className={theme === "dark" ? "text-white" : "text-gray-900"}>
              Digital Avatar
            </span>
          </h2>

          <p
            className={`text-xl mb-4 ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Language Support
          </p>
          <p
            className={`text-lg ${
              theme === "dark" ? "text-gray-500" : "text-gray-500"
            }`}
          >
            Speak any language and respond instantly.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-16 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
        >
          {languages.map((language, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.02 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className={`p-6 rounded-xl text-center cursor-pointer transition-all ${
                theme === "dark"
                  ? "bg-gray-800 hover:bg-gray-750 border border-gray-700"
                  : "bg-white hover:bg-gray-50 shadow-lg hover:shadow-xl border border-gray-200"
              }`}
            >
              <div className="text-5xl mb-3">{language.flag}</div>
              <div
                className={`text-sm font-medium ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                {language.name}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default LanguageSection;
