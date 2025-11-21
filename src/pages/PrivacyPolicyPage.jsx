import { useTheme } from "../contexts/ThemeContext";
import { motion } from "framer-motion";
import { Shield, Lock, Eye, UserCheck, Database, FileText } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function PrivacyPolicyPage() {
  const { theme } = useTheme();

  const sections = [
    {
      icon: <Database className="w-6 h-6" />,
      title: "Information We Collect",
      content: [
        {
          subtitle: "A. Personal Information",
          points: [
            "Name, email address, and contact details provided upon registration or communication",
            "Payment information processed securely via our third-party payment partners (we do not store payment card details directly)",
          ],
        },
        {
          subtitle: "B. Uploaded Content & Usage Data",
          points: [
            "Images, audio, video, or other files submitted for avatar generation",
            "Device information (browser, IP address, OS, referring pages)",
            "Log data such as access times, feature usage, and error reports",
          ],
        },
        {
          subtitle: "C. Cookies & Tracking",
          points: [
            "We use cookies and similar technologies for authentication, preferences, analytics, and improving user experience",
          ],
        },
      ],
    },
    {
      icon: <Eye className="w-6 h-6" />,
      title: "How We Use Your Information",
      content: [
        {
          points: [
            "To deliver and improve our AI digital avatar and digital twin services",
            "To process payments, provide support, and handle requests",
            "To prevent abuse, detect fraud, and maintain platform security",
            "To communicate important updates or marketing (opt-out available at any time)",
            "To comply with legal or regulatory obligations",
          ],
        },
      ],
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "How We Share Data",
      content: [
        {
          subtitle: "Service Providers",
          points: [
            "We may share information with payment processors, cloud providers, and technical support partners needed to operate MetaPresence",
          ],
        },
        {
          subtitle: "Legal Compliance",
          points: [
            "We will disclose data if required by law, regulation, or legal process",
          ],
        },
        {
          subtitle: "No Sale of Data",
          points: [
            "We do not sell, rent, or transfer your personal or likeness data to unrelated third parties for their own marketing",
          ],
        },
      ],
    },
    {
      icon: <UserCheck className="w-6 h-6" />,
      title: "User Rights & Choices",
      content: [
        {
          points: [
            "Access and Correction: You may request access to, or correction of, your personal information at any time",
            "Deletion: Request deletion of your account or uploaded content by emailing privacy@metapresence.my",
            "Opt-Out: Unsubscribe from marketing emails at any time via provided links or by contacting us",
          ],
        },
      ],
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: "Data Security",
      content: [
        {
          points: [
            "We use encryption, access controls, and secure server infrastructure to safeguard your information",
            "No security method is perfect. Users are responsible for keeping passwords confidential and for all account activity",
          ],
        },
      ],
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Data Retention",
      content: [
        {
          points: [
            "Uploaded content and consent records are retained as needed to process your requests, fulfill service obligations, meet legal requirements, and prevent fraud",
            "Account data is deleted on request or upon account closure, subject to applicable law",
          ],
        },
      ],
    },
  ];

  return (
    <div
      className={`min-h-screen ${
        theme === "dark" ? "bg-gray-950" : "bg-gray-50"
      }`}
    >
      <Navbar />

      {/* Hero Section */}
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
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Privacy Policy
              </span>
            </h1>
            <p
              className={`text-xl ${
                theme === "dark" ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Last updated: November 21, 2025
            </p>
            <p
              className={`text-lg mt-4 ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              MetaPresence is committed to protecting your privacy and ensuring
              transparency about how your information is collected, used, and
              protected.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto space-y-16">
          {sections.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
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
                  {section.icon}
                </div>
                <h2
                  className={`text-3xl font-bold ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  {section.title}
                </h2>
              </div>

              {section.content.map((subsection, subIndex) => (
                <div key={subIndex} className="mb-6 last:mb-0">
                  {subsection.subtitle && (
                    <h3
                      className={`text-xl font-semibold mb-3 ${
                        theme === "dark" ? "text-purple-400" : "text-purple-600"
                      }`}
                    >
                      {subsection.subtitle}
                    </h3>
                  )}
                  <ul className="space-y-3">
                    {subsection.points.map((point, pointIndex) => (
                      <li key={pointIndex} className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-purple-600 mt-2"></span>
                        <span
                          className={`text-lg ${
                            theme === "dark" ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          {point}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </motion.div>
          ))}

          {/* Additional Important Sections */}
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
              Childrens Privacy
            </h2>
            <p
              className={`text-lg mb-4 ${
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}
            >
              MetaPresence is not intended for use by children under 18. If we
              learn we have collected data from a minor, it will be deleted
              promptly.
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
            <h2
              className={`text-3xl font-bold mb-6 ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              International Users
            </h2>
            <p
              className={`text-lg mb-4 ${
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Data may be stored and processed in Pakistan, Malaysia, or other
              countries where MetaPresence or its service providers operate, in
              compliance with applicable data-protection laws.
            </p>
          </motion.div>

          {/* Contact Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`p-8 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 text-white`}
          >
            <h2 className="text-3xl font-bold mb-4">Contact Us</h2>
            <p className="text-lg mb-6">
              For questions, concerns, or data requests, please reach out to:
            </p>
            <div className="space-y-2 text-lg">
              <p>
                Email:{" "}
                <a
                  href="mailto:support@metapresence.my"
                  className="underline hover:text-purple-200"
                >
                  support@metapresence.my
                </a>
              </p>
              <p>
                Privacy:{" "}
                <a
                  href="mailto:privacy@metapresence.my"
                  className="underline hover:text-purple-200"
                >
                  privacy@metapresence.my
                </a>
              </p>
              <p>Address: Business Incubation Centre, UET Lahore, Pakistan</p>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
