import { useTheme } from "../contexts/ThemeContext";
import { motion } from "framer-motion";
import {
  FileText,
  AlertCircle,
  Scale,
  UserX,
  CreditCard,
  Lock,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function TermsConditionsPage() {
  const { theme } = useTheme();

  const sections = [
    {
      icon: <FileText className="w-6 h-6" />,
      title: "About MetaPresence",
      content:
        "MetaPresence provides tools for businesses, professionals, and creators worldwide to generate and deploy AI digital avatars and digital twins, automating tasks like product demos, onboarding, and customer support.",
    },
    {
      icon: <UserX className="w-6 h-6" />,
      title: "Eligibility & User Accounts",
      points: [
        "You must be at least 18 years old to use MetaPresence",
        "Users must provide accurate, current information and maintain confidentiality of account credentials",
        "You are responsible for all activity on your account",
      ],
    },
    {
      icon: <AlertCircle className="w-6 h-6" />,
      title: "Acceptable Use",
      points: [
        "You may not upload content, images, or voice samples you do not own or do not have explicit, written consent to use",
        "You may not upload or generate avatars of anyone under 18, public figures, or anyone without their explicit consent",
        "You may not use MetaPresence to harass, defraud, impersonate, or harm others",
        "All use must comply with our Acceptable Use Policy and Consent & Moderation Policy",
      ],
    },
    {
      icon: <Scale className="w-6 h-6" />,
      title: "User Content & Rights",
      points: [
        "You retain rights to all content you upload (images, audio, video, etc.)",
        "By using our Service, you grant MetaPresence a non-exclusive, worldwide license to use, process, and generate output from your content as needed to deliver services",
        "We do not sell or license user images or avatars to third parties for unrelated purposes",
      ],
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Generated Content & Service Delivery",
      points: [
        "All digital avatars, voice outputs, and related AI-generated content are provided 'as is.' Output may not always be entirely accurate or realistic",
        "Delivery times for digital products may vary based on current demand and processing capacity",
        "You are responsible for compliance and lawful use of all generated content",
      ],
    },
    {
      icon: <CreditCard className="w-6 h-6" />,
      title: "Payments & Refunds",
      points: [
        "All payments are processed securely via approved payment providers. MetaPresence does not directly store credit card information",
        "See our Refund Policy for eligibility and process",
        "All prices and fees are stated clearly on our Pricing page",
      ],
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: "Privacy & Data Security",
      points: [
        "MetaPresence is committed to safeguarding your privacy and personal data. Details on data collection and protection are set in our Privacy Policy",
        "We use industry-standard security protocols, but no system is 100% secure. Use strong passwords and safeguard your account credentials",
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
              <Scale className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Terms of Service
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
              Welcome to MetaPresence! These Terms of Service govern your use of
              our AI-powered digital avatar platform. By using MetaPresence, you
              agree to these Terms and our Privacy Policy.
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

              {section.content && (
                <p
                  className={`text-lg ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {section.content}
                </p>
              )}

              {section.points && (
                <ul className="space-y-3">
                  {section.points.map((point, pointIndex) => (
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
              )}
            </motion.div>
          ))}

          {/* Additional Sections */}
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
              Account Suspension & Termination
            </h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-purple-600 mt-2"></span>
                <span
                  className={`text-lg ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  MetaPresence reserves the right to suspend or terminate any
                  account that violates these Terms, our Acceptable Use Policy,
                  or applicable laws
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-purple-600 mt-2"></span>
                <span
                  className={`text-lg ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Users may delete their account by contacting
                  support@metapresence.my
                </span>
              </li>
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
            <h2
              className={`text-3xl font-bold mb-6 ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              Disclaimers & Limitations of Liability
            </h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-purple-600 mt-2"></span>
                <span
                  className={`text-lg ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  MetaPresence provides the Service as is and makes no
                  warranties regarding availability or fitness for a particular
                  purpose
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-purple-600 mt-2"></span>
                <span
                  className={`text-lg ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  To the maximum extent allowed by law, MetaPresence disclaims
                  liability for any indirect, incidental, or consequential
                  damages arising from use or inability to use the Service
                </span>
              </li>
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
            <h2
              className={`text-3xl font-bold mb-6 ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              Governing Law
            </h2>
            <p
              className={`text-lg ${
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}
            >
              These Terms are governed by the laws of Pakistan, without regard
              to conflict of law principles.
            </p>
          </motion.div>

          {/* Contact Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-8 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 text-white"
          >
            <h2 className="text-3xl font-bold mb-4">Contact & Legal Notices</h2>
            <p className="text-lg mb-6">
              If you have any questions or concerns, please contact:
            </p>
            <div className="space-y-2 text-lg">
              <p className="font-semibold">MetaPresence</p>
              <p>
                Email:{" "}
                <a
                  href="mailto:support@metapresence.my"
                  className="underline hover:text-purple-200"
                >
                  support@metapresence.my
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
