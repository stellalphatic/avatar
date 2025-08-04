import React, { useState, Fragment, useEffect } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Popover, Transition } from '@headlessui/react';

// Import necessary icons
import { LogOut, Sun, Moon, CreditCard, X, Menu, Settings } from 'lucide-react';
import { navConfig, bottomNavConfig } from '../config/navConfig';

// A single, unified NavItem component with enhanced styling
const NavItem = ({ to, icon, text, isExpanded, isExact = false, onClick }) => {
  return (
    <NavLink
      to={to}
      end={isExact} // Use the isExact prop passed from navConfig
      onClick={onClick}
      // px-3 for overall padding, gap-x-3 for space between icon and text
      className={({ isActive }) =>
        `flex items-center h-10 px-3 rounded-lg text-sm font-medium transition-all duration-200 group relative overflow-hidden gap-x-3
        ${isActive
          ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 shadow-md'
          : 'text-gray-700 dark:text-gray-300'
        }
        hover:bg-gray-100 dark:hover:bg-gray-700/50`
      }
    >
      {/* Icon container with fixed width/height to prevent shifting */}
      <div className={`flex-shrink-0 w-6 h-6 flex items-center justify-center transition-colors duration-200
        ${({ isActive }) => isActive
          ? 'text-pink-600 dark:text-pink-400'
          : 'text-gray-500 dark:text-gray-400 group-hover:text-pink-600 dark:group-hover:text-pink-400'
        }`}>
        {React.cloneElement(icon, { size: 18 })}
      </div>
      <motion.span
        // Removed marginLeft animation. maxWidth handles the expansion.
        // flex-shrink-0 is crucial to prevent this span from pushing the icon.
        animate={{
          opacity: isExpanded ? 1 : 0,
          maxWidth: isExpanded ? '150px' : '0px', // Animate maxWidth for smooth reveal
        }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="whitespace-nowrap overflow-hidden text-sm flex-shrink-0" // Added flex-shrink-0
      >
        {text}
      </motion.span>
    </NavLink>
  );
};

// NavHeader component for section titles
const NavHeader = ({ text, isExpanded }) => (
  <motion.h3
    animate={{ opacity: isExpanded ? 1 : 0 }}
    transition={{ duration: 0.1 }}
    // Adjusted px-3 for consistency with NavItem padding
    className="px-3 mt-4 mb-2 text-[10px] font-semibold uppercase text-gray-400 dark:text-gray-500 tracking-wider overflow-hidden whitespace-nowrap"
  >
    {isExpanded ? text : ''}
  </motion.h3>
);

export default function Sidebar({ isMobileOpen, setMobileOpen }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false); // Close mobile menu on route change
  }, [location, setMobileOpen]);

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  const getInitials = (email) => {
    if (!email) return 'MP';
    const name = email.split('@')[0];
    return name.substring(0, 2).toUpperCase();
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsExpanded(false);
      } else {
        setIsExpanded(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const sidebarContent = (
    <div
      className="flex flex-col h-full bg-white dark:bg-gray-900 rounded-r-xl shadow-lg
                   border-r border-gray-200 dark:border-gray-800"
      onMouseEnter={() => window.innerWidth >= 768 && setIsExpanded(true)}
      onMouseLeave={() => window.innerWidth >= 768 && setIsExpanded(false)}
    >
      {/* Logo Section */}
      <div className="flex-shrink-0 flex items-center justify-start h-16 px-4">
        <Link to="/dashboard" className="flex items-center gap-2 overflow-hidden">
          <img
            src="/MetaPresence.png"
            alt="MetaPresence Logo"
            className={`flex-shrink-0 transition-all duration-200 ease-in-out
              ${isExpanded ? 'h-9 w-auto' : 'h-6 w-auto'}`}
          />
          <motion.span
            animate={{ maxWidth: isExpanded ? '180px' : '0px', opacity: isExpanded ? 1 : 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="font-semibold text-lg whitespace-nowrap overflow-hidden text-gray-800 dark:text-white"
          >
            MetaPresence
          </motion.span>
        </Link>
        {isMobileOpen && (
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 ml-auto"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-grow flex flex-col p-3 space-y-1">
        {navConfig.map((section, sectionIndex) => (
          <React.Fragment key={`section-${sectionIndex}`}>
            {/* Add a divider before sections with titles, except the very first section */}
            {section.title && sectionIndex > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-800 pt-2 mt-2"></div>
            )}
            {/* Render NavHeader if title exists */}
            {section.title && <NavHeader text={section.title} isExpanded={isExpanded} />}
            {/* Render links for all sections */}
            {section.links && section.links.map((link, linkIndex) => (
              <NavItem key={`link-${sectionIndex}-${linkIndex}`} {...link} isExpanded={isExpanded} onClick={() => setMobileOpen(false)} />
            ))}
          </React.Fragment>
        ))}
        {/* Add a divider before the bottomNavConfig if navConfig has items */}
        {navConfig.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-800 pt-2 mt-2"></div>
        )}
      </nav>

      {/* Bottom Section: User Profile and Logout */}
      <div className="flex-shrink-0 p-3 mt-auto border-t border-gray-200 dark:border-gray-800">
        {bottomNavConfig.map((item, index) => (
          <NavItem key={`bottom-${index}`} {...item} isExpanded={isExpanded} onClick={() => setMobileOpen(false)} />
        ))}

        <Popover className="relative mt-1">
          <Popover.Button className="w-full mt-1 flex items-center h-12 px-3 rounded-lg text-sm font-medium transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none group">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white shadow-sm">
              {getInitials(user?.email)}
            </div>
            <motion.span
              animate={{ opacity: isExpanded ? 1 : 0, maxWidth: isExpanded ? '150px' : '0px', marginLeft: isExpanded ? '0.75rem' : '0rem' }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="whitespace-nowrap overflow-hidden text-left text-gray-800 dark:text-gray-200 font-semibold"
            >
              {user?.email ? user.email.split('@')[0] : 'Guest'}
            </motion.span>
          </Popover.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <Popover.Panel className="absolute bottom-full mb-2 left-2 z-10 w-56 p-1.5 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-600">
              <div className="p-2">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.email ? user.email.split('@')[0] : 'Guest'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email || 'Not logged in'}</p>
              </div>
              <div className="p-2">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-2">Theme</p>
                <div className="flex items-center justify-around bg-gray-100 dark:bg-gray-900/50 rounded-md p-1">
                  <button
                    onClick={() => toggleTheme('light')}
                    className={`p-1.5 rounded-md flex-1 text-center ${theme === 'light' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-800 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                  >
                    <Sun size={14} className="mx-auto" />
                  </button>
                  <button
                    onClick={() => toggleTheme('dark')}
                    className={`p-1.5 rounded-md flex-1 text-center ${theme === 'dark' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-800 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                  >
                    <Moon size={14} className="mx-auto" />
                  </button>
                </div>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-600 my-1"></div>
              {/* Updated Billing link to point to settings page with hash */}
              <Link to="/dashboard/settings#billing" onClick={() => setMobileOpen(false)} className="block w-full text-left p-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700/50 flex items-center gap-3 text-gray-700 dark:text-gray-300">
                <CreditCard size={16} /> Billing
              </Link>
              <Link to="/terms-conditions" onClick={() => setMobileOpen(false)} className="block w-full text-left p-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700/50 flex items-center gap-3 text-gray-700 dark:text-gray-300">
                Terms of Service
              </Link>
              <Link to="/privacy-policy" onClick={() => setMobileOpen(false)} className="block w-full text-left p-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700/50 flex items-center gap-3 text-gray-700 dark:text-gray-300">
                Privacy Policy
              </Link>
              <div className="border-t border-gray-200 dark:border-gray-600 my-1"></div>
              <button onClick={handleLogout} className="w-full text-left p-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700/50 flex items-center gap-3 text-red-600 dark:text-red-400">
                <LogOut size={16} /> Log Out
              </button>
            </Popover.Panel>
          </Transition>
        </Popover>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.div
        animate={{ width: isExpanded ? '15rem' : '4.5rem' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="hidden md:block flex-shrink-0 h-screen sticky top-0"
      >
        {sidebarContent}
      </motion.div>

      {/* Mobile Sidebar (Overlay) */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-40 bg-black/50 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '0%' }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 bottom-0 z-50 w-64 md:hidden"
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
