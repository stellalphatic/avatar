import { motion } from "framer-motion";
import { Globe } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

const LanguageSection = () => {
  const { theme } = useTheme();

  const languages = [
    { name: "English", flag: "🇬🇧", speakers: "1.5B" },
    { name: "Mandarin Chinese", flag: "🇨🇳", speakers: "1.1B" },
    { name: "Hindi", flag: "🇮🇳", speakers: "600M" },
    { name: "Spanish", flag: "🇪🇸", speakers: "559M" },
    { name: "French", flag: "🇫🇷", speakers: "280M" },
    { name: "Arabic", flag: "🇸🇦", speakers: "274M" },
    { name: "Bengali", flag: "🇧🇩", speakers: "272M" },
    { name: "Russian", flag: "🇷🇺", speakers: "258M" },
    { name: "Portuguese", flag: "🇵🇹", speakers: "252M" },
    { name: "Urdu", flag: "🇵🇰", speakers: "231M" },
    { name: "Indonesian", flag: "🇮🇩", speakers: "199M" },
    { name: "German", flag: "🇩🇪", speakers: "134M" },
    { name: "Japanese", flag: "🇯🇵", speakers: "125M" },
    { name: "Turkish", flag: "🇹🇷", speakers: "88M" },
    { name: "Korean", flag: "🇰🇷", speakers: "81M" },
    { name: "Italian", flag: "🇮🇹", speakers: "67M" },
  ];

  return (
    <section
      className={`py-16 sm:py-32 px-4 ${
        theme === "dark" ? "bg-black" : "bg-white"
      }`}
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
              Built using OpenAI's API
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6 px-4">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Real-Time Multilingual
            </span>
            <br />
            <span className={theme === "dark" ? "text-white" : "text-gray-900"}>
              Digital Avatar
            </span>
          </h2>

          <p
            className={`text-lg sm:text-xl mb-2 px-4 ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Communicate in {languages.length}+ Languages
          </p>
          <p
            className={`text-sm sm:text-base px-4 ${
              theme === "dark" ? "text-gray-500" : "text-gray-500"
            }`}
          >
            Speak any language and respond instantly with natural, human-like
            conversations
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-12 sm:mt-16 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6"
        >
          {languages.map((language, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.03 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className={`p-4 sm:p-6 rounded-xl text-center cursor-pointer transition-all ${
                theme === "dark"
                  ? "bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-purple-500"
                  : "bg-white hover:bg-gray-50 shadow-lg hover:shadow-xl border border-gray-200 hover:border-purple-400"
              }`}
            >
              <div className="text-4xl sm:text-5xl mb-3">{language.flag}</div>
              <div
                className={`text-sm sm:text-base font-semibold mb-1 ${
                  theme === "dark" ? "text-gray-200" : "text-gray-800"
                }`}
              >
                {language.name}
              </div>
              <div
                className={`text-xs ${
                  theme === "dark" ? "text-gray-500" : "text-gray-500"
                }`}
              >
                {language.speakers} speakers
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <p
            className={`text-sm ${
              theme === "dark" ? "text-gray-500" : "text-gray-600"
            }`}
          >
            + Many more languages supported through advanced AI models
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default LanguageSection;
