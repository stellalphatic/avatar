import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext'; // <--- ADDED THIS IMPORT
import supabase from '../supabaseClient'; // Direct import for global use
import { Loader2, AlertCircle, CheckCircle, ChevronDown, CreditCard, User, Gauge, Video, Users, Info } from 'lucide-react'; // Added Info icon for FAQs
import { PricingContent } from '../components/PricingContent'; // Re-use pricing content

const SettingsPage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [plans, setPlans] = useState([]); // State to store all plans
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateMessage, setUpdateMessage] = useState('');
  const [username, setUsername] = useState(''); // Managed state for username input
  const { theme } = useTheme(); // Get theme from context for FAQ background

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) {
          throw profileError;
        }
        setProfile(profileData);
        setUsername(profileData?.username || ''); // Set username for input field

        // Fetch all plans
        const { data: plansData, error: plansError } = await supabase
          .from('plans')
          .select('*')
          .order('monthly_price_usd', { ascending: true }); // Order by price

        if (plansError) {
          throw plansError;
        }
        setPlans(plansData);

      } catch (err) {
        console.error('Error fetching user data or plans:', err);
        setError('Failed to load settings details: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [user?.id]); // Depend on user.id to re-fetch if user changes

  const handleUpdateUsername = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setUpdateMessage('');

    if (!username.trim()) {
      setError('Username cannot be empty.');
      setLoading(false);
      return;
    }

    try {
      const { data, error: updateError } = await supabase
        .from('profiles')
        .update({ username: username.trim(), updated_at: new Date().toISOString() })
        .eq('id', user.id)
        .select() // Select the updated row to get the latest data
        .single();

      if (updateError) {
        throw updateError;
      }
      setProfile(data); // Update local profile state with fresh data
      setUpdateMessage('Username updated successfully!');
    } catch (err) {
      console.error('Error updating username:', err);
      setError('Failed to update username: ' + err.message);
    } finally {
      setLoading(false);
      setTimeout(() => setUpdateMessage(''), 3000); // Clear message after 3 seconds
      setTimeout(() => setError(''), 3000); // Clear error after 3 seconds
    }
  };

  // Function to handle managing subscription (placeholder for Stripe Portal)
  const handleManageSubscription = () => {
    alert('Redirecting to Stripe Customer Portal to manage your subscription!');
    // In a real app, you'd integrate with your backend to generate a Stripe Customer Portal URL
    // window.open('YOUR_STRIPE_CUSTOMER_PORTAL_URL', '_blank');
  };

  // FAQ data (can be moved to a config file if it grows large)
  const faqs = [
    {
      question: "What is my current plan?",
      answer: `Your current plan is ${profile?.current_plan || 'Free'}. You can see detailed usage metrics above.`,
    },
    {
      question: "How do I upgrade or change my plan?",
      answer: "You can upgrade or change your plan by selecting a new plan in the 'All Plans' section below. Your new plan benefits will be applied immediately.",
    },
    {
      question: "How are conversation minutes calculated?",
      answer: "Conversation minutes are calculated based on the duration your AI Digital Twin is actively engaged in a conversation with a user. This includes both speaking and listening time.",
    },
    {
      question: "What happens if I exceed my limits?",
      answer: "If you exceed your plan's limits, you may be charged on a pay-as-you-go basis, or certain features might be temporarily restricted until the next billing cycle or plan upgrade. Refer to the 'Compare Plans' section for overage details.",
    },
    {
      question: "Can I cancel my subscription?",
      answer: "Yes, you can cancel your subscription at any time. Your plan will remain active until the end of your current billing period. You can manage your subscription through the 'Manage Payment Method' link.",
    },
  ];

  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  // const { theme } = useTheme(); // Already destructured above

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  if (loading) return <div className="text-center text-gray-700 dark:text-gray-300 p-8"><Loader2 className="animate-spin inline-block mr-2" size={24} /> Loading settings...</div>;
  if (error) return <div className="text-center text-red-500 p-8 flex items-center justify-center"><AlertCircle size={20} className="mr-2"/> Error: {error}</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-4 sm:p-8 rounded-2xl bg-white dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-800 max-w-6xl mx-auto my-8"
    >
      <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 sm:mb-6">
        Account Settings
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
        Manage your profile, subscription, and preferences.
      </p>

      <div className="space-y-10">
        {/* User Information Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <User size={24} /> User Information
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-2">Email: <span className="font-semibold text-gray-900 dark:text-white">{user?.email}</span></p>
          <form onSubmit={handleUpdateUsername} className="space-y-4 mt-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-3 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 outline-none transition-all duration-200 text-gray-900 dark:text-white"
                placeholder="Your username"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Updating...' : 'Update Username'}
            </button>
            <AnimatePresence>
              {updateMessage && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-green-500 mt-2 flex items-center gap-2"
                >
                  <CheckCircle size={16} />{updateMessage}
                </motion.p>
              )}
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-red-500 mt-2 flex items-center gap-2"
                >
                  <AlertCircle size={16}/>{error}
                </motion.p>
              )}
            </AnimatePresence>
          </form>
        </motion.div>

        {/* Current Plan & Usage Section */}
        <motion.div
          id="billing" // Anchor for direct link from sidebar
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <CreditCard size={24} /> Current Plan & Usage
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                Your current plan: <span className="font-semibold text-purple-600 dark:text-pink-400 capitalize">{profile?.current_plan || 'Free'}</span>
              </p>
              <button
                onClick={handleManageSubscription}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold text-sm hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
              >
                Manage Payment Method
              </button>
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Gauge size={20} /> Billing Cycle Usage
              </h3>
              <p className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Video size={18} className="text-blue-500" /> Video Generation: <span className="font-semibold">{profile?.video_generation_minutes_this_month || 0} / {profile?.video_generation_minutes_monthly_limit || 0} minutes</span>
              </p>
              <p className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Users size={18} className="text-green-500" /> Conversation: <span className="font-semibold">{profile?.conversation_minutes_this_month || 0} / {profile?.conversation_minutes_monthly_limit || 0} minutes</span>
              </p>
              <p className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <User size={18} className="text-purple-500" /> Custom Avatars: <span className="font-semibold">{profile?.custom_avatar_creations_this_month || 0} / {profile?.custom_avatar_creations_monthly_limit || 0} creations</span>
              </p>
            </div>
          </div>
        </motion.div>

        {/* All Plans Section (re-using PricingContent) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 dark:text-white mb-6">
            Explore All Plans
          </h2>
          {/* Render PricingContent directly, without the yearly toggle if desired */}
          <PricingContent showToggle={false} />
        </motion.div>

        {/* FAQs Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Info size={24} /> Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                initial={false}
                animate={{ backgroundColor: openFaqIndex === index ? (theme === 'dark' ? '#1f2937' : '#f3f4f6') : (theme === 'dark' ? '#111827' : '#ffffff') }}
                transition={{ duration: 0.2 }}
              >
                <button
                  className="flex justify-between items-center w-full p-4 text-left font-semibold text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                  onClick={() => toggleFaq(index)}
                >
                  {faq.question}
                  <motion.span
                    animate={{ rotate: openFaqIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown size={20} />
                  </motion.span>
                </button>
                <AnimatePresence>
                  {openFaqIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="px-4 pb-4 text-gray-700 dark:text-gray-300"
                    >
                      <p>{faq.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default SettingsPage;
