import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Info, Loader2, ChevronDown, AlertCircle } from 'lucide-react'; // Added Loader2, ChevronDown, and AlertCircle
import { useAuth } from '../contexts/AuthContext'; // Assuming useAuth provides supabase
import supabase from '../supabaseClient'; // Direct import for global use
import { useTheme } from '../contexts/ThemeContext'; // Import useTheme for FAQ background

// Helper component for features list item
const FeatureItem = ({ children }) => (
  <li className="flex items-start gap-2 text-gray-700 dark:text-gray-300 text-sm">
    <Check size={16} className="text-green-500 flex-shrink-0 mt-1" />
    <span>{children}</span>
  </li>
);

// Helper component for table cells (features)
const TableFeatureCell = ({ children, isIncluded }) => (
  <td className="p-3 border-b border-gray-200 dark:border-gray-700 text-center">
    {isIncluded ? (
      <Check size={20} className="text-green-500 mx-auto" />
    ) : (
      children || <span className="text-gray-400 dark:text-gray-600">-</span>
    )}
  </td>
);

export const PricingContent = ({ showToggle = true, initialIsYearly = false }) => {
  const { user } = useAuth();
  const [isYearlyBilling, setIsYearlyBilling] = useState(initialIsYearly);
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [errorPlans, setErrorPlans] = useState(null);
  const { theme } = useTheme(); // Get theme from context for FAQ background

  // --- FIX: Moved useState for openFaqIndex to the top level ---
  const [openFaqIndex, setOpenFaqIndex] = useState(null); 

  useEffect(() => {
    const fetchPlans = async () => {
      setLoadingPlans(true);
      setErrorPlans(null);
      try {
        const { data, error } = await supabase
          .from('plans')
          .select('*')
          .order('monthly_price_usd', { ascending: true }); // Order by price for display

        if (error) {
          throw error;
        }
        setPlans(data);
      } catch (err) {
        console.error('Error fetching plans:', err);
        setErrorPlans('Failed to load pricing plans.');
      } finally {
        setLoadingPlans(false);
      }
    };
    fetchPlans();
  }, []);

  const handleCheckout = async (plan) => {
    if (!user) {
      alert('Please log in or sign up first to select a plan.');
      return;
    }
    if (plan.plan_name === "Enterprise") {
      alert('Please contact our sales team for Enterprise plans.');
      return;
    }

    // Determine the price ID based on billing cycle
    const priceId = isYearlyBilling ? plan.two_checkout_product_id_yearly : plan.two_checkout_product_id_monthly; // Assuming these fields exist in your 'plans' table
    if (!priceId) {
      alert('Subscription ID not configured for this plan and billing cycle.');
      return;
    }

    try {
      // This is a placeholder for your actual checkout session creation
      // In a real application, you'd call your backend to create a Stripe/2Checkout session
      alert(`Initiating checkout for ${plan.plan_name} (${isYearlyBilling ? 'Yearly' : 'Monthly'}) with product ID: ${priceId}`);
      // Example: window.location.href = `YOUR_BACKEND_CHECKOUT_URL?priceId=${priceId}&userId=${user.id}`;
    } catch (error) {
      console.error('Client-side error during checkout:', error);
      alert('An unexpected error occurred during checkout.');
    }
  };

  if (loadingPlans) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-700 dark:text-gray-300">
        <Loader2 className="animate-spin mr-2" size={24} /> Loading plans...
      </div>
    );
  }

  if (errorPlans) {
    return (
      <div className="text-center text-red-500 p-4">
        <AlertCircle className="inline-block mr-2" size={20} /> Error: {errorPlans}
      </div>
    );
  }

  // Map Supabase plans to a more UI-friendly format if needed, or use directly
  const displayPlans = plans.map(plan => ({
    ...plan,
    // Add any UI-specific properties if they don't exist in DB
    monthlyPriceDisplay: `$${plan.monthly_price_usd}`,
    yearlyPriceDisplay: plan.yearly_price_usd ? `$${plan.yearly_price_usd}` : null,
    isPopular: plan.plan_name === 'Creator', // Example: Mark 'Creator' as popular
    features: [
      "Unlimited videos", // Example features, replace with actual plan features from DB if available
      "Videos up to 30-mins",
      "1080p video export",
      "Fast video processing",
      `${plan.conversation_minute_limit} minutes of AI Conversational Video per month`,
      `${plan.custom_avatar_creation_limit} Custom Video Avatar`,
      `${plan.stock_avatar_access} Stock Avatar Access`,
      // Add more features based on your 'plans' table 'description' or other fields
    ].filter(Boolean), // Filter out null/undefined features
  }));

  // Example FAQ data (you can fetch this from DB or define in config)
  const faqs = [
    {
      question: "Which plan is right for me?",
      answer: "Our Creator plan is perfect for individuals and small teams getting started. The Team plan offers more features and seats for growing teams. Enterprise is for large organizations with custom needs.",
    },
    {
      question: "What is the difference between a Stock and Custom Avatar?",
      answer: "Stock avatars are pre-made avatars available to all users. Custom avatars are unique avatars created specifically for you, often from your own video footage, offering a personalized touch.",
    },
    {
      question: "How do concurrent conversation limits work?",
      answer: "Concurrent conversation limits define how many AI Digital Twin conversations can be active simultaneously under your account. Exceeding this limit may queue new conversations.",
    },
    {
      question: "How and when are minutes consumed?",
      answer: "Minutes are consumed based on the duration of active AI conversations and video generation. For conversations, minutes are typically counted from the start to the end of the interaction. For video generation, it's based on the length of the generated video.",
    },
    {
      question: "How does pay-as-you-go work?",
      answer: "Pay-as-you-go allows you to exceed your plan's included minutes at a specified rate. This provides flexibility without requiring an immediate plan upgrade if you have occasional higher usage.",
    },
    {
      question: "How do I upgrade?",
      answer: "You can upgrade your plan at any time from your settings page. Your new plan benefits will be applied immediately, and your billing will be adjusted proportionally.",
    },
    {
      question: "Do you offer custom pricing or plans?",
      answer: "Yes, for enterprise-level needs, we offer custom plans tailored to your specific requirements, including custom integrations, dedicated support, and specialized pricing. Please contact our sales team.",
    },
  ];

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg text-gray-800 dark:text-gray-200">
      <h1 className="text-3xl sm:text-4xl font-bold text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6 sm:mb-8">
        Plans that fit your scale
      </h1>

      {showToggle && (
        <div className="flex justify-center mb-6 sm:mb-8">
          <div className="relative inline-flex items-center rounded-lg bg-gray-100 dark:bg-gray-700 p-1">
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
                ${!isYearlyBilling ? 'bg-purple-600 text-white shadow' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
              onClick={() => setIsYearlyBilling(false)}
            >
              Monthly billing
            </button>
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
                ${isYearlyBilling ? 'bg-purple-600 text-white shadow' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
              onClick={() => setIsYearlyBilling(true)}
            >
              Yearly (save up to 22%)
            </button>
          </div>
        </div>
      )}

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-10">
        {displayPlans.map((plan, index) => (
          <motion.div
            key={plan.id || index}
            className={`p-6 border rounded-xl flex flex-col items-center text-center relative
              ${plan.isPopular ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/30' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900'}
              shadow-lg hover:shadow-xl transition-shadow duration-300`}
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            {plan.isPopular && (
              <div className="absolute -top-3 right-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                Most Popular 🔥
              </div>
            )}
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">{plan.description}</h4>
            <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {plan.plan_name}
            </h3>
            <p className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
              {plan.plan_name === "Enterprise"
                ? "Let's Talk"
                : (isYearlyBilling && plan.yearly_price_usd !== null ? plan.yearlyPriceDisplay : plan.monthlyPriceDisplay) + "/month"}
            </p>
            {plan.minSeats && ( // Assuming minSeats is a property for Team plan
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">{plan.minSeats}</p>
            )}
            <ul className="text-left space-y-2 flex-grow mb-6">
              {plan.features.map((feature, idx) => (
                <FeatureItem key={idx}>{feature}</FeatureItem>
              ))}
            </ul>
            <button
              onClick={() => handleCheckout(plan)}
              disabled={plan.plan_name === "Free"} // Disable button for 'Free' plan
              className={`mt-auto w-full px-6 py-3 rounded-lg font-semibold text-base transition-all duration-200
                ${plan.plan_name === "Enterprise"
                  ? "bg-transparent border border-purple-500 text-purple-500 hover:bg-purple-500 hover:text-white"
                  : (plan.plan_name === "Free"
                    ? "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700")
                }`}
            >
              {plan.plan_name === "Enterprise" ? "Contact Sales" : (plan.plan_name === "Free" ? "Current Plan" : "Get Started")}
            </button>
          </motion.div>
        ))}
      </div>

      {/* Compare Plans Table */}
      <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 dark:text-white mb-6 sm:mb-8">
        Compare Plans
      </h2>
      <div className="overflow-x-auto mb-10">
        <table className="min-w-full bg-white dark:bg-gray-900 rounded-lg shadow-md">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
              <th className="p-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300 rounded-tl-lg">Features</th>
              {displayPlans.map(plan => (
                <th key={plan.id} className="p-3 text-center text-sm font-semibold text-gray-600 dark:text-gray-300">
                  {plan.plan_name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Example: General Features */}
            <tr>
              <td className="p-3 font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700">API Access</td>
              {displayPlans.map(plan => (
                <TableFeatureCell key={plan.id} isIncluded={true} /> // Assuming all plans have API access
              ))}
            </tr>
            <tr>
              <td className="p-3 font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700">Watermark-free</td>
              {displayPlans.map(plan => (
                <TableFeatureCell key={plan.id} isIncluded={plan.plan_name !== 'Free'} /> // Free plan has watermark
              ))}
            </tr>
            {/* Add more rows for other features as needed */}
            <tr>
              <td className="p-3 font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700">Video Generation Minutes/month</td>
              {displayPlans.map(plan => (
                <TableFeatureCell key={plan.id}>
                  {plan.video_generation_minute_limit ? `${plan.video_generation_minute_limit} mins` : 'N/A'}
                </TableFeatureCell>
              ))}
            </tr>
            <tr>
              <td className="p-3 font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700">Custom Avatar Creations/month</td>
              {displayPlans.map(plan => (
                <TableFeatureCell key={plan.id}>
                  {plan.custom_avatar_creation_limit ? `${plan.custom_avatar_creation_limit}` : 'N/A'}
                </TableFeatureCell>
              ))}
            </tr>
            {/* Add more rows for other features like 'Stock Replica access', 'Replica training API', 'Conversational Video Interface (CVI)', 'Email Support' etc. */}
          </tbody>
        </table>
      </div>

      {/* Pricing FAQs Section */}
      <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 dark:text-white mb-6 sm:mb-8">
        Pricing FAQs
      </h2>
      <div className="max-w-3xl mx-auto space-y-4">
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
    </div>
  );
};
