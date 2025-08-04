// src/dashboard_pages/DashboardOverview.jsx
import React, { useState, useEffect } from 'react';
import { ArrowRight, ArrowLeft, MessageSquarePlus, UserPlus, Film, KeyRound } from 'lucide-react'; // Added new icons
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase'; // Ensure this path is correct

// Reusable Card component for avatars with enhanced styling
const UseCaseCard = ({ avatar }) => (
  <Link to={`/dashboard/chat?avatarId=${avatar.id}`} className="block group bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700">
    <div className="relative w-full h-44 overflow-hidden">
      <img
        src={avatar.image_url || `https://placehold.co/400x300/E0E7FF/4338CA?text=${encodeURIComponent(avatar.name)}`} // Placeholder with avatar name
        alt={avatar.name}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/400x300/E0E7FF/4338CA?text=${encodeURIComponent(avatar.name)}` }} // Fallback
      />
      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all duration-300"></div>
    </div>
    <div className="p-4 flex justify-between items-center">
      <div>
        <h3 className="font-semibold text-lg text-gray-900 dark:text-white truncate">{avatar.name}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{avatar.persona_role || 'AI Assistant'}</p>
      </div>
      <ArrowRight size={20} className="text-gray-400 group-hover:text-purple-600 transition-colors" />
    </div>
  </Link>
);

// Reusable Action Card component for quick links
const ActionCard = ({ to, icon, title, description }) => (
  <Link to={to} className="block bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 flex flex-col items-center text-center border border-gray-200 dark:border-gray-700">
    <div className="p-3 bg-pink-100 dark:bg-pink-500/20 rounded-full mb-4 text-pink-600 dark:text-pink-400">
      {icon}
    </div>
    <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">{title}</h3>
    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{description}</p>
    <span className="text-sm font-medium text-purple-600 dark:text-purple-400 hover:underline">
      Get Started <ArrowRight size={14} className="inline-block ml-1" />
    </span>
  </Link>
);


const DashboardOverview = () => {
  const [publicAvatars, setPublicAvatars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublicAvatars = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('avatars')
        .select('*')
        .eq('is_public', true)
        .limit(4); // Fetch up to 4 public avatars for the showcase

      if (error) {
        console.error('Error fetching public avatars:', error);
      } else {
        setPublicAvatars(data);
      }
      setLoading(false);
    };

    fetchPublicAvatars();
  }, []);

  return (
    <div className="space-y-10">
      {/* Top Hero Card */}
      <div className="relative p-6 md:p-10 rounded-xl bg-gray-900 text-white shadow-xl overflow-hidden">
        {/* Background gradient/pattern - inspired by competitor's hero section */}
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at top left, rgba(147,51,234,0.3) 0%, transparent 50%), radial-gradient(circle at bottom right, rgba(236,72,153,0.3) 0%, transparent 50%)' }}></div>
        <div className="relative z-10">
          <span className="text-xs font-bold uppercase text-pink-400 bg-pink-900/50 px-2 py-1 rounded-full">MetaPresence CVI</span>
          <h1 className="text-4xl md:text-5xl font-extrabold mt-4 leading-tight">
            Conversational Voice Interface
          </h1>
          <p className="mt-4 text-base md:text-lg text-gray-300 max-w-3xl">
            Create humanlike conversations powered by our state-of-the-art models. Engage users with real-time, dynamic voice interactions.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link to="/dashboard/chat" className="px-6 py-3 text-base font-semibold bg-white text-gray-900 rounded-lg hover:bg-gray-200 transition-colors duration-200 shadow-md">
              Create New Conversation
            </Link>
            <button className="px-6 py-3 text-base font-semibold bg-transparent border border-gray-600 text-white rounded-lg hover:bg-white/10 transition-colors duration-200 shadow-md">
              Learn More
            </button>
          </div>
        </div>
      </div>

      {/* Explore Conversational Use Cases Section */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Explore Conversational Avatars</h2>
          <div className="flex items-center gap-x-2">
            {/* These buttons would typically control a carousel, but for static display, they can be decorative or removed */}
            <button className="p-2 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300">
              <ArrowLeft size={18} />
            </button>
            <button className="p-2 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300">
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {publicAvatars.map(avatar => <UseCaseCard key={avatar.id} avatar={avatar} />)}
          </div>
        )}
      </div>

      {/* Quick Action Cards Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ActionCard
            to="/dashboard/chat"
            icon={<MessageSquarePlus size={24} />}
            title="Create Conversation"
            description="Start a new real-time voice conversation with an AI avatar."
          />
          <ActionCard
            to="/dashboard/avatars/create"
            icon={<UserPlus size={24} />}
            title="Create Avatar"
            description="Clone your voice and likeness to create a custom AI avatar."
          />
          <ActionCard
            to="/dashboard/video/generate" // Placeholder for future
            icon={<Film size={24} />}
            title="Generate AI Video"
            description="Produce dynamic videos with your AI avatars from text or audio."
          />
          <ActionCard
            to="/dashboard/integrations" // Link to integrations page
            icon={<KeyRound size={24} />}
            title="API Keys & Integrations"
            description="Manage your API keys and connect MetaPresence to other services."
          />
        </div>
      </div>

      {/* Help & Community Section (Footer-like) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 p-6 bg-gray-100 dark:bg-gray-800 rounded-xl shadow-inner border border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">Get started with the API</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Intuitive docs and APIs make it easy.</p>
          <a href="/api-docs" target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-4 py-2 text-sm font-medium bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors shadow-sm">
            Read Docs <ArrowRight size={14} className="ml-2" />
          </a>
        </div>
        <div className="text-center">
          <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">Help Center</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Find answers to frequently asked questions or contact our support team.</p>
          <a href="#" className="inline-flex items-center px-4 py-2 text-sm font-medium bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors shadow-sm">
            Get Help <ArrowRight size={14} className="ml-2" />
          </a>
        </div>
        <div className="text-center">
          <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">Join Community</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Connect with our developer community.</p>
          <a href="#" className="inline-flex items-center px-4 py-2 text-sm font-medium bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors shadow-sm">
            Join Discord <ArrowRight size={14} className="ml-2" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
