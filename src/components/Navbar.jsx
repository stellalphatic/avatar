// src/components/Navbar.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import { Menu, X, Moon, Sun } from 'lucide-react'; // Import Moon and Sun icons
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth(); // Get user and signOut from AuthContext
  const navigate = useNavigate(); // Initialize useNavigate

  // Function to handle scrolling to sections
  const handleScrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setIsOpen(false); // Close mobile menu after clicking a link
    }
  };

  // Original nav links, now using 'id' for scroll-to-section
  const navLinks = [
    { name: 'About', id: 'about' },
    { name: 'Pricing', id: 'pricing' },
    { name: 'API Docs', href: '/api-docs' },
  ];

  const handleLogout = async () => {
    const { error } = await signOut();
    if (!error) {
      navigate('/'); // Redirect to home after logout
    } else {
      console.error('Logout error:', error.message);
    }
  };

  return (
    <nav className={`fixed w-full z-50 transition-colors duration-300 ${
        theme === 'light' ? 'bg-white/80 backdrop-blur-md border-b border-gray-200' : 'bg-background/80 backdrop-blur-md border-b border-border'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo / Brand */}
          <Link to="/" className="flex items-center space-x-2">
            <motion.img
              src="/MetaPresence_Favicon.jpeg" // Path to your favicon in the public folder
              alt="MetaPresence Favicon"
              className="w-8 h-8 rounded-full shadow-lg"
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }} // Subtle continuous rotation for brand
              transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
            />
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              METAPRESENCE
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              link.id ? ( // If it has an ID, it's an internal scroll link
                <motion.button
                  key={link.name}
                  onClick={() => handleScrollToSection(link.id)}
                  className={`text-sm font-medium transition-colors duration-200 ${
                    theme === 'light' ? 'text-gray-600 hover:text-purple-600' : 'text-muted-foreground hover:text-foreground'
                  }`}
                  whileHover={{ y: -2 }}
                >
                  {link.name}
                </motion.button>
              ) : ( // Otherwise, it's an external link
                <motion.a
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-medium transition-colors duration-200 ${
                    theme === 'light' ? 'text-gray-600 hover:text-purple-600' : 'text-muted-foreground hover:text-foreground'
                  }`}
                  whileHover={{ y: -2 }}
                >
                  {link.name}
                </motion.a>
              )
            ))}

            {/* Theme Toggle */}
            <motion.button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-transparent hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle theme"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />} {/* Reverted to Lucide icons */}
            </motion.button>

            {/* Conditional Auth Buttons */}
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-200 ${
                    theme === 'light' ? 'text-purple-600 hover:text-purple-700' : 'text-purple-400 hover:text-purple-300'
                  }`}
                >
                  Dashboard
                </Link>
                <motion.button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Log Out
                </motion.button>
              </>
            ) : (
              <>
                <Link
                  to="/auth"
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-200 ${
                    theme === 'light' ? 'text-purple-600 hover:text-purple-700' : 'text-purple-400 hover:text-purple-300'
                  }`}
                >
                  Log In
                </Link>
                <Link
                  to="/auth"
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Toggle Button */}
          <div className="flex md:hidden items-center">
            <motion.button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-transparent hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors mr-2"
              aria-label="Toggle theme"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />} {/* Reverted to Lucide icons */}
            </motion.button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`inline-flex items-center justify-center p-2 rounded-md ${
                theme === 'light' ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-400 hover:bg-gray-700'
              } focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500`}
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <motion.div
        initial={false}
        animate={isOpen ? "open" : "closed"}
        variants={{
          open: { opacity: 1, height: "auto" },
          closed: { opacity: 0, height: 0 }
        }}
        transition={{ duration: 0.3 }}
        className={`md:hidden ${isOpen ? 'block' : 'hidden'} ${theme === 'light' ? 'bg-white border-t border-gray-200' : 'bg-card border-t border-border'}`}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navLinks.map((link) => (
            link.id ? (
              <button
                key={link.name}
                onClick={() => handleScrollToSection(link.id)}
                className={`block px-3 py-2 rounded-md text-base font-medium text-left ${
                  theme === 'light' ? 'text-gray-700 hover:bg-gray-100' : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                {link.name}
              </button>
            ) : (
              <Link
                key={link.name}
                to={link.href}
                className={`block px-3 py-2 rounded-md text-base font-medium text-left ${
                  theme === 'light' ? 'text-gray-700 hover:bg-gray-100' : 'text-muted-foreground hover:bg-muted'
                }`}
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            )
          ))}
          {user ? (
            <>
              <Link
                to="/dashboard"
                className={`block w-full text-center px-3 py-2 rounded-md text-base font-medium ${
                  theme === 'light' ? 'text-purple-600 hover:bg-gray-100' : 'text-purple-400 hover:bg-muted'
                }`}
                onClick={() => setIsOpen(false)}
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full text-center px-3 py-2 mt-4 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white text-base font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/auth"
                className={`block w-full text-center px-3 py-2 rounded-md text-base font-medium ${
                  theme === 'light' ? 'text-purple-600 hover:bg-gray-100' : 'text-purple-400 hover:bg-muted'
                }`}
                onClick={() => setIsOpen(false)}
              >
                Log In
              </Link>
              <Link
                to="/auth"
                className="block w-full text-center px-3 py-2 mt-4 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white text-base font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
                onClick={() => setIsOpen(false)}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </motion.div>
    </nav>
  );
};

export default Navbar;