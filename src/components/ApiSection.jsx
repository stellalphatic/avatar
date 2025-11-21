import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, Code } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

const ApiSection = () => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState("curl");
  const [copied, setCopied] = useState(false);

  const codeExamples = {
    curl: `curl -X POST "https://api.metapresence.my/v1/generate" \\
  -H "Authorization: Bearer sk_metapresence_xxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "avatar_id": "avatar_123",
    "text": "Hello, how can I help you today?",
    "voice_id": "voice_456"
  }'`,
    javascript: `const response = await fetch('https://api.metapresence.my/v1/generate', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer sk_metapresence_xxx',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    avatar_id: 'avatar_123',
    text: 'Hello, how can I help you today?',
    voice_id: 'voice_456'
  })
});

const data = await response.json();
console.log(data);`,
    python: `import requests

response = requests.post(
    'https://api.metapresence.my/v1/generate',
    headers={
        'Authorization': 'Bearer sk_metapresence_xxx',
        'Content-Type': 'application/json'
    },
    json={
        'avatar_id': 'avatar_123',
        'text': 'Hello, how can I help you today?',
        'voice_id': 'voice_456'
    }
)

data = response.json()
print(data)`,
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(codeExamples[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section
      className={`py-32 px-4 ${
        theme === "dark" ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-600/10 border border-green-600/20 mb-6">
            <Code className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-600">
              Developer Friendly
            </span>
          </div>

          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Quickly build and deploy
            </span>
            <br />
            <span className={theme === "dark" ? "text-white" : "text-gray-900"}>
              AI-powered conversations
            </span>
          </h2>

          <p
            className={`text-xl ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Ready to build? Get started with dead simple APIs.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className={`rounded-2xl overflow-hidden ${
            theme === "dark"
              ? "bg-gray-800 border border-gray-700"
              : "bg-white shadow-2xl"
          }`}
        >
          {/* Tab Headers */}
          <div
            className={`flex border-b ${
              theme === "dark" ? "border-gray-700" : "border-gray-200"
            }`}
          >
            {["curl", "javascript", "python"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 text-sm font-medium transition-all ${
                  activeTab === tab
                    ? "text-purple-600 border-b-2 border-purple-600 bg-purple-600/5"
                    : theme === "dark"
                    ? "text-gray-400 hover:text-gray-300"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab === "curl"
                  ? "cURL"
                  : tab === "javascript"
                  ? "JavaScript"
                  : "Python"}
              </button>
            ))}
          </div>

          {/* Code Display */}
          <div className="relative">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <span
                className={`text-sm font-medium ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                {activeTab === "curl"
                  ? "cURL"
                  : activeTab === "javascript"
                  ? "JavaScript"
                  : "Python"}{" "}
                Example
              </span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCopy}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  theme === "dark"
                    ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </motion.button>
            </div>

            <div
              className={`p-6 overflow-x-auto ${
                theme === "dark" ? "bg-gray-900" : "bg-gray-50"
              }`}
            >
              <pre
                className={`text-sm ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                <code>{codeExamples[activeTab]}</code>
              </pre>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <a
            href="https://docs.metapresence.my"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-lg font-semibold text-purple-600 hover:text-purple-700 transition-colors"
          >
            View Full Documentation
            <motion.span whileHover={{ x: 5 }}>→</motion.span>
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default ApiSection;
