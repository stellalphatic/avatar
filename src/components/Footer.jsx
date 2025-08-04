// src/components/Footer.jsx
import React from 'react';
import { motion } from 'framer-motion';
import {
  Twitter,
  Linkedin,
  Github,
  Mail,
  MapPin,
  Phone,
  ArrowRight
} from 'lucide-react';
import { SparklesCore } from './ui/SparklesCore';
import { useTheme } from '../contexts/ThemeContext';

const Footer = () => {
  const { theme } = useTheme();

  const footerLinks = {
    Product: [
      { name: 'Features', href: '#' },
      { name: 'Pricing', href: '#pricing' },
      { name: 'API Docs', href: '/api-docs' },
      { name: 'Integrations', href: '#' },
      { name: 'Changelog', href: '#' }
    ],
    Company: [
      { name: 'About Us', href: '#about' },
      { name: 'Careers', href: '#' },
      { name: 'Blog', href: '#' },
      { name: 'Press', href: '#' },
      { name: 'Partners', href: '#' }
    ],
    Resources: [
      { name: 'Documentation', href: '/api-docs' },
      { name: 'Help Center', href: '#' },
      { name: 'Community', href: '#' },
      { name: 'Tutorials', href: '#' },
      { name: 'Webinars', href: '#' }
    ],
    Legal: [
      { name: 'Privacy Policy', href: '#' },
      { name: 'Terms of Service', href: '#' },
      { name: 'Cookie Policy', href: '#' },
      { name: 'GDPR', href: '#' },
      { name: 'Security', href: '#' }
    ]
  };

  const socialLinks = [
    { icon: <Twitter className="w-5 h-5" />, href: '#', name: 'Twitter' },
    { icon: <Linkedin className="w-5 h-5" />, href: '#', name: 'LinkedIn' },
    { icon: <Github className="w-5 h-5" />, href: '#', name: 'GitHub' },
    { icon: <Mail className="w-5 h-5" />, href: 'mailto:contact@avatar.com', name: 'Email' }
  ];

  // Particle colors for SparklesCore in Footer - Adjusted for better visibility
  const footerSparkleColors = theme === 'light'
    ? ["#9333EA", "#C026D3", "#DB2777", "#F43F5E", "#A78BFA", "#FFFFFF", "#E0BBE4"]
    : ["#A855F7", "#D946EF", "#C084FC", "#F472B6", "#FF0077", "#FFFFFF", "#FFD700", "#FFFACD"];

  return (
    <footer className="relative bg-card border-t border-border overflow-hidden">
      {/* Sparkles Core Background for Footer - Increased visibility */}
      <div className="absolute inset-0 w-full h-full z-0 opacity-70"> {/* Increased opacity to 70% */}
        <SparklesCore
          id="tsparticlesfooter"
          background="transparent"
          minSize={1.0} // Increased minSize
          maxSize={2.5} // Increased maxSize
          particleDensity={300} // Increased particle density
          className="w-full h-full"
          particleColor={footerSparkleColors}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
            {/* Company Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center space-x-2 mb-6">
                <img
                  src="/MetaPresence.png"
                  alt="MetaPresence Favicon"
                  className="w-10 h-10 rounded-lg shadow-lg"
                />
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  METAPRESENCE
                </span>
              </div>

              <p className="text-muted-foreground mb-6 max-w-md text-sm"> 
                Revolutionizing digital presence with AI-powered avatars. Create, customize, and deploy your digital twin across any platform.
              </p>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-muted-foreground text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>UET, Lahore</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground text-sm">
                  <Phone className="w-4 h-4" />
                  <span>+1 (234) 567-8910</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground text-sm"> 
                  <Mail className="w-4 h-4" />
                  <span>contact@metapresence.com</span>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex space-x-4">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={social.name}
                    href={social.href}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-9 h-9 bg-muted hover:bg-accent rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors duration-200" // Reduced size
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
              className="lg:pl-12"
            >
              <h3 className="text-lg font-semibold mb-4">Stay Updated</h3> {/* Reduced text size */}
              <p className="text-muted-foreground mb-6 text-sm"> {/* Reduced text size */}
                Get the latest updates on new features, product releases, and AI avatar technology.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm" // Reduced padding/text size
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center gap-2 justify-center text-sm" // Reduced padding/text size
                >
                  Subscribe <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          </div>

          {/* Footer Links */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6"> {/* Reduced gap */}
            {Object.entries(footerLinks).map(([category, links], index) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <h4 className="font-semibold mb-3 text-base"> {/* Reduced text size */}
                  {category}
                </h4>
                <ul className="space-y-2"> {/* Reduced space-y */}
                  {links.map((link) => (
                    <li key={link.name}>
                      <a
                        href={link.href}
                        className="text-muted-foreground hover:text-foreground transition-colors duration-200 text-sm" // Reduced text size
                      >
                        {link.name}
                      </a>
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
          className="py-5 border-t border-border flex flex-col md:flex-row justify-between items-center gap-3" // Reduced padding/gap
        >
          <p className="text-muted-foreground text-xs"> {/* Reduced text size */}
            © 2025 MetaPresence AI. All rights reserved.
          </p>

          <div className="flex items-center gap-4 text-xs text-muted-foreground"> {/* Reduced gap/text size */}
            <span>Made with ❤️ for the future</span>
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div> {/* Reduced size */}
            <span>All systems operational</span>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
