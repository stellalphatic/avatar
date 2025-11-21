import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Twitter,
  Linkedin,
  Github,
  Mail,
  MapPin,
  Phone,
  ArrowRight,
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

const Footer = () => {
  const { theme } = useTheme();

  const footerLinks = {
    Product: [
      { name: "Features", href: "/#features" },
      { name: "Pricing", href: "/pricing" },
      { name: "API Docs", href: "https://docs.metapresence.my" },
      { name: "Integrations", href: "/#integrations" },
      { name: "Use Cases", href: "/#use-cases" },
    ],
    Company: [
      { name: "About Us", href: "/#about" },
      { name: "Careers", href: "/careers" },
      { name: "Blog", href: "/blog" },
      { name: "Press Kit", href: "/press" },
      { name: "Contact", href: "/contact" },
    ],
    Resources: [
      { name: "Documentation", href: "https://docs.metapresence.my" },
      { name: "Help Center", href: "/help" },
      { name: "Community", href: "/community" },
      { name: "Tutorials", href: "/tutorials" },
      { name: "API Status", href: "https://status.metapresence.my" },
    ],
    Legal: [
      { name: "Privacy Policy", href: "/privacy-policy" },
      { name: "Terms of Service", href: "/terms-conditions" },
      { name: "Refund Policy", href: "/refund-policy" },
      { name: "Acceptable Use", href: "/acceptable-use" },
      { name: "Cookie Policy", href: "/cookie-policy" },
    ],
  };

  const socialLinks = [
    // {
    //   icon: <Twitter className="w-5 h-5" />,
    //   href: "https://twitter.com/metapresence",
    //   name: "Twitter",
    // },
    {
      icon: <Linkedin className="w-5 h-5" />,
      href: "https://linkedin.com/company/metapresence",
      name: "LinkedIn",
    },
    // {
    //   icon: <Github className="w-5 h-5" />,
    //   href: "https://github.com/metapresence",
    //   name: "GitHub",
    // },
    {
      icon: <Mail className="w-5 h-5" />,
      href: "mailto:contact@metapresence.my",
      name: "Email",
    },
  ];

  return (
    <footer
      className={`relative ${
        theme === "dark"
          ? "bg-gray-950 border-t border-gray-800"
          : "bg-white border-t border-gray-200"
      } overflow-hidden`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
            {/* Company Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center space-x-2 mb-6">
                <img
                  src="/MetaPresence.png"
                  alt="MetaPresence"
                  className="w-10 h-10 rounded-lg shadow-lg"
                />
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  METAPRESENCE
                </span>
              </div>

              <p
                className={`${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                } mb-6 max-w-md text-sm`}
              >
                Revolutionizing digital presence with AI-powered avatars.
                Create, customize, and deploy your digital twin across any
                platform.
              </p>

              <div className="space-y-3 mb-6">
                <div
                  className={`flex items-center gap-3 ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  } text-sm`}
                >
                  <MapPin className="w-4 h-4" />
                  <span>Business Incubation Centre, UET Lahore, Pakistan</span>
                </div>
                <div
                  className={`flex items-center gap-3 ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  } text-sm`}
                >
                  <Phone className="w-4 h-4" />
                  <span>+92 (325) 882-1216</span>
                </div>
                <div
                  className={`flex items-center gap-3 ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  } text-sm`}
                >
                  <Mail className="w-4 h-4" />
                  <span>support@metapresence.my</span>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex space-x-4">
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={`w-10 h-10 ${
                      theme === "dark"
                        ? "bg-gray-800 hover:bg-gray-700"
                        : "bg-gray-100 hover:bg-gray-200"
                    } rounded-lg flex items-center justify-center ${
                      theme === "dark"
                        ? "text-gray-400 hover:text-white"
                        : "text-gray-600 hover:text-gray-900"
                    } transition-colors`}
                    aria-label={social.name}
                  >
                    {social.icon}
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Newsletter Signup */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="lg:pl-12"
            >
              <h3
                className={`text-lg font-semibold mb-4 ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                Stay Updated
              </h3>
              <p
                className={`${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                } mb-6 text-sm`}
              >
                Get the latest updates on new features, product releases, and AI
                avatar technology.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className={`flex-1 px-4 py-3 ${
                    theme === "dark"
                      ? "bg-gray-800 border-gray-700 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  } border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm`}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2 justify-center text-sm font-semibold"
                >
                  Subscribe <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          </div>

          {/* Footer Links */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {Object.entries(footerLinks).map(([category, links], index) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <h4
                  className={`font-semibold mb-4 text-sm ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  {category}
                </h4>
                <ul className="space-y-2">
                  {links.map((link) => (
                    <li key={link.name}>
                      {link.href.startsWith("http") ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`${
                            theme === "dark"
                              ? "text-gray-400 hover:text-white"
                              : "text-gray-600 hover:text-gray-900"
                          } transition-colors text-sm`}
                        >
                          {link.name}
                        </a>
                      ) : (
                        <Link
                          to={link.href}
                          className={`${
                            theme === "dark"
                              ? "text-gray-400 hover:text-white"
                              : "text-gray-600 hover:text-gray-900"
                          } transition-colors text-sm`}
                        >
                          {link.name}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className={`py-6 border-t ${
            theme === "dark" ? "border-gray-800" : "border-gray-200"
          } flex flex-col md:flex-row justify-between items-center gap-4`}
        >
          <p
            className={`${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            } text-xs`}
          >
            © 2025 MetaPresence AI. All rights reserved.
          </p>

          <div
            className={`flex items-center gap-4 text-xs ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            <span>Made with ❤️ for the future</span>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>All systems operational</span>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
