import { useTheme } from "../contexts/ThemeContext";
import { motion } from "framer-motion";
import { ShieldAlert, Ban, Flag, Scale } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function AcceptableUsePolicyPage() {
  const { theme } = useTheme();

  const prohibitedContent = [
    "Images, voice, or likeness of anyone without explicit written consent",
    "Minors (under 18), public figures, or celebrities",
    "Content that defames, harasses, bullies, threatens, or invades the privacy of others",
    "Pornographic, obscene, hateful, violent, discriminatory, or otherwise offensive material",
    "Any content violating copyrights, trademarks, privacy, or other legal rights",
  ];

  const prohibitedActivities = [
    "Impersonate any individual, organization, or entity unlawfully",
    "Commit fraud, misrepresentation, or social engineering",
    "Generate deceptive, fake, or misleading content (including 'deepfakes' intended to deceive)",
    "Circumvent, tamper with, or disable our security or moderation tools",
    "Upload malware, viruses, or malicious code",
    "Attempt to gain unauthorized access to MetaPresence's systems, data, or user accounts",
    "Engage in denial-of-service, scraping, or other attacks against the platform",
  ];

  return (
    <div
      className={`min-h-screen ${
        theme === "dark" ? "bg-gray-950" : "bg-gray-50"
      }`}
    >
      <Navbar />

      <section
        className={`pt-32 pb-20 px-4 ${
          theme === "dark"
            ? "bg-gradient-to-br from-purple-900/20 to-pink-900/20"
            : "bg-gradient-to-br from-purple-50 to-pink-50"
        }`}
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 mb-6">
              <ShieldAlert className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Acceptable Use Policy
              </span>
            </h1>
            <p
              className={`text-xl ${
                theme === "dark" ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Last updated: November 21, 2025
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto space-y-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`p-8 rounded-2xl ${
              theme === "dark"
                ? "bg-gray-900 border border-gray-800"
                : "bg-white shadow-lg"
            }`}
          >
            <h2
              className={`text-3xl font-bold mb-6 ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              Lawful and Responsible Usage
            </h2>
            <p
              className={`text-lg ${
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}
            >
              You agree not to use MetaPresence for any unlawful, abusive,
              fraudulent, or harmful activity. This policy is designed to
              protect our users, platform, and community.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`p-8 rounded-2xl ${
              theme === "dark"
                ? "bg-gray-900 border border-gray-800"
                : "bg-white shadow-lg"
            }`}
          >
            <div className="flex items-start gap-4 mb-6">
              <div className={`p-3 rounded-xl bg-red-900/30 text-red-500`}>
                <Ban className="w-6 h-6" />
              </div>
              <h2
                className={`text-3xl font-bold ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                Prohibited Content
              </h2>
            </div>
            <p
              className={`text-lg mb-6 ${
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}
            >
              You may not upload, generate, or share avatars or digital content
              that contains:
            </p>
            <ul className="space-y-3">
              {prohibitedContent.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-red-600 mt-2"></span>
                  <span
                    className={`text-lg ${
                      theme === "dark" ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`p-8 rounded-2xl ${
              theme === "dark"
                ? "bg-gray-900 border border-gray-800"
                : "bg-white shadow-lg"
            }`}
          >
            <div className="flex items-start gap-4 mb-6">
              <div className={`p-3 rounded-xl bg-red-900/30 text-red-500`}>
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h2
                className={`text-3xl font-bold ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                Prohibited Activities
              </h2>
            </div>
            <p
              className={`text-lg mb-6 ${
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}
            >
              You may not use the Service to:
            </p>
            <ul className="space-y-3">
              {prohibitedActivities.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-red-600 mt-2"></span>
                  <span
                    className={`text-lg ${
                      theme === "dark" ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`p-8 rounded-2xl ${
              theme === "dark"
                ? "bg-gray-900 border border-gray-800"
                : "bg-white shadow-lg"
            }`}
          >
            <div className="flex items-start gap-4 mb-6">
              <div
                className={`p-3 rounded-xl ${
                  theme === "dark" ? "bg-purple-900/30" : "bg-purple-100"
                } text-purple-600`}
              >
                <Scale className="w-6 h-6" />
              </div>
              <h2
                className={`text-3xl font-bold ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                Compliance and Moderation
              </h2>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-purple-600 mt-2"></span>
                <span
                  className={`text-lg ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  All uploaded content is subject to automated and manual
                  moderation
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-purple-600 mt-2"></span>
                <span
                  className={`text-lg ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  MetaPresence may suspend or terminate any account that
                  violates this Policy, our Terms of Service, or applicable law,
                  without notice or refund
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-purple-600 mt-2"></span>
                <span
                  className={`text-lg ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  We cooperate fully with law enforcement and rights holders to
                  investigate any suspected illegal or abusive activity
                </span>
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-8 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 text-white"
          >
            <div className="flex items-center gap-4 mb-4">
              <Flag className="w-8 h-8" />
              <h2 className="text-3xl font-bold">Reporting Violations</h2>
            </div>
            <p className="text-lg mb-4">
              If you discover misuse, copyright infringement, or abusive
              activity on MetaPresence, report it promptly to:
            </p>
            <a
              href="mailto:abuse@metapresence.my"
              className="text-xl font-semibold underline hover:text-purple-200"
            >
              abuse@metapresence.my
            </a>
            <p className="text-lg mt-4">
              We take all reports seriously and will act quickly to address
              valid complaints.
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
