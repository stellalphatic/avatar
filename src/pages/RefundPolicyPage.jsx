import { useTheme } from "../contexts/ThemeContext";
import { motion } from "framer-motion";
import { DollarSign, XCircle, CheckCircle, Mail } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function RefundPolicyPage() {
  const { theme } = useTheme();

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
              <DollarSign className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Refund Policy
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
            <div className="flex items-start gap-4 mb-6">
              <div className={`p-3 rounded-xl bg-red-900/30 text-red-500`}>
                <XCircle className="w-6 h-6" />
              </div>
              <h2
                className={`text-3xl font-bold ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                Digital Product Policy — No Refunds
              </h2>
            </div>
            <p
              className={`text-lg mb-4 ${
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}
            >
              All sales with MetaPresence are final. Due to the customized,
              instantly processed nature of digital avatar and digital twin
              generation, we do not offer refunds, returns, or exchanges for
              products or services once an order has been submitted and
              processing has begun.
            </p>
            <p
              className={`text-lg ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              This policy is standard among digital and AI-generated content
              providers.
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
              <div className={`p-3 rounded-xl bg-green-900/30 text-green-500`}>
                <CheckCircle className="w-6 h-6" />
              </div>
              <h2
                className={`text-3xl font-bold ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                Exceptions — Technical Issues Only
              </h2>
            </div>
            <p
              className={`text-lg mb-4 ${
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Refunds will only be considered under the following limited
              circumstances:
            </p>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-purple-600 mt-2"></span>
                <span
                  className={`text-lg ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  The digital avatar or service was not delivered due to a
                  proven technical fault on our side
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-purple-600 mt-2"></span>
                <span
                  className={`text-lg ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  You were charged more than once for the same transaction
                </span>
              </li>
            </ul>
            <p
              className={`text-lg ${
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}
            >
              If you believe you meet one of these criteria, contact us at
              support@metapresence.my within 7 days of purchase. We reserve the
              right to investigate, and will reprocess or resolve the issue at
              our sole discretion.
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
              Responsibility
            </h2>
            <p
              className={`text-lg ${
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}
            >
              It is the buyers responsibility to review product details,
              examples, or previews before completing payment. By proceeding
              with a purchase, you confirm your understanding and acceptance
              that no refunds will be issued once the order is placed.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-8 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 text-white"
          >
            <div className="flex items-center gap-4 mb-4">
              <Mail className="w-8 h-8" />
              <h2 className="text-3xl font-bold">Contact</h2>
            </div>
            <p className="text-lg mb-4">
              For any questions related to billing or technical support, please
              email:
            </p>
            <a
              href="mailto:support@metapresence.my"
              className="text-xl font-semibold underline hover:text-purple-200"
            >
              support@metapresence.my
            </a>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
