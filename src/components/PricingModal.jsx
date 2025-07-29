// src/components/PricingModal.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { XIcon, CheckIcon } from '../utils/icons'; // Assuming these are defined as actual React components

export const PricingModal = ({ onClose }) => {
    const { user, supabase } = useAuth();
    const [isYearlyBilling, setIsYearlyBilling] = useState(false);

    const subscriptionPlans = [
        {
            title: "Creator",
            description: "For one person",
            monthlyPrice: "$24",
            yearlyPrice: "$20",
            features: [
                "Unlimited videos",
                "Videos up to 30-mins",
                "1080p video export",
                "Fast video processing",
                "5 minutes of Avatar IV videos per month",
                "1 Custom Video Avatar",
                "1 Custom Interactive Avatar"
            ],
            stripePriceIdMonthly: import.meta.env.VITE_STRIPE_PRICE_ID_CREATOR_MONTHLY,
            stripePriceIdYearly: import.meta.env.VITE_STRIPE_PRICE_ID_CREATOR_YEARLY,
            isPopular: true
        },
        {
            title: "Team",
            description: "For you and your team",
            monthlyPrice: "$120",
            yearlyPrice: "$99",
            minSeats: "Minimum 2 seats, $720 billed yearly",
            features: [
                "Everything in Creator, plus:",
                "2 seats included",
                "2 Custom Video Avatars",
                "Unlimited videos",
                "Videos up to 30-mins",
                "4k video export",
                "Faster video processing"
            ],
            stripePriceIdMonthly: import.meta.env.VITE_STRIPE_PRICE_ID_TEAM_MONTHLY,
            stripePriceIdYearly: import.meta.env.VITE_STRIPE_PRICE_ID_TEAM_YEARLY,
            isPopular: false
        },
        {
            title: "Enterprise",
            description: "For your organization",
            price: "Let's talk",
            features: [
                "Everything in Team, plus:",
                "Custom integrations",
                "Dedicated account manager",
                "SLA & Uptime guarantees",
                "No video duration max"
            ],
            stripePriceId: null,
            isPopular: false
        }
    ];

    const handleCheckout = async (plan) => {
        if (!user) {
            alert('Please log in or sign up first to select a plan.');
            return;
        }
        if (plan.title === "Enterprise") {
            alert('Please contact our sales team for Enterprise plans.');
            return;
        }

        const priceId = isYearlyBilling ? plan.stripePriceIdYearly : plan.stripePriceIdMonthly;
        if (!priceId) {
            alert('Stripe Price ID not configured for this plan and billing cycle.');
            return;
        }

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                alert('No active session. Please log in again.');
                return;
            }

            const backendUrl = import.meta.env.VITE_BACKEND_REST_URL;
            if (!backendUrl) {
                console.error('VITE_BACKEND_REST_URL is not defined in your .env file.');
                alert('Backend URL is not configured. Please check your environment variables.');
                return;
            }

            const response = await fetch(`${backendUrl}/api/create-checkout-session`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({
                    priceId: priceId,
                    planName: plan.title,
                    billingCycle: isYearlyBilling ? 'yearly' : 'monthly'
                })
            });

            const responseData = await response.json();

            if (!response.ok) {
                console.error('Error from backend:', responseData.error || 'Unknown error');
                alert(`Error: ${responseData.error || 'Failed to create checkout session.'}`);
                return;
            }

            const { url, error } = responseData;

            if (error) {
                console.error('Error from backend (json):', error);
                alert(`Error: ${error}`);
                return;
            }

            if (url) {
                window.location.href = url;
            } else {
                alert('Failed to get Stripe checkout URL.');
            }
        } catch (error) {
            console.error('Client-side error during checkout:', error);
            alert('An unexpected error occurred during checkout.');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm p-4 overflow-y-auto"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="bg-card p-5 sm:p-7 rounded-xl shadow-lg max-w-sm sm:max-w-xl md:max-w-3xl lg:max-w-4xl w-full relative border border-border my-6" // Adjusted max-width, padding, margin
                onClick={e => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground z-50"> {/* Adjusted position */}
                    <XIcon size={22} /> {/* Slightly smaller icon */}
                </button>
                <h2 className="text-xl sm:text-2xl font-bold text-center text-foreground mb-3 sm:mb-5">Plans that fit your scale</h2> {/* Reduced text size */}
                <div className="flex justify-center mb-5 sm:mb-6"> {/* Reduced margin */}
                    <div className="relative inline-flex items-center rounded-lg bg-gray-700 p-1 flex-wrap justify-center text-center">
                        <button
                            className={`px-3 sm:px-4 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${!isYearlyBilling ? 'bg-purple-600 text-white' : 'text-gray-300 hover:text-white'}`}
                            onClick={() => setIsYearlyBilling(false)}
                        >
                            Monthly billing
                        </button>
                        <button
                            className={`px-3 sm:px-4 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${isYearlyBilling ? 'bg-purple-600 text-white' : 'text-gray-300 hover:text-white'}`}
                            onClick={() => setIsYearlyBilling(true)}
                        >
                            Yearly (save up to 22%)
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-7"> {/* Adjusted gap */}
                    {subscriptionPlans.map((plan, index) => (
                        <motion.div
                            key={index}
                            className="p-4 sm:p-5 border border-border rounded-xl bg-background flex flex-col items-center text-center relative" // Adjusted padding
                            whileHover={{ scale: 1.02, boxShadow: "0 6px 15px rgba(0,0,0,0.15)" }} // Adjusted shadow
                            transition={{ type: "spring", stiffness: 250 }} // Softer spring
                        >
                            {plan.isPopular && (
                                <div className="absolute -top-3 right-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full shadow-lg"> {/* Adjusted padding */}
                                    Most Popular 🔥
                                </div>
                            )}
                            <h4 className="text-xs text-muted-foreground mb-1">{plan.description}</h4> {/* Reduced text size */}
                            <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent"> {/* Reduced text size */}
                                {plan.title}
                            </h3>
                            <p className="text-3xl font-extrabold text-foreground mb-4 sm:mb-5"> {/* Reduced text size */}
                                {plan.title === "Enterprise"
                                    ? plan.price
                                    : (isYearlyBilling ? plan.yearlyPrice : plan.monthlyPrice) + "/month"}
                            </p>
                            {plan.minSeats && (
                                <p className="text-xs text-muted-foreground mb-3 sm:mb-4">{plan.minSeats}</p>
                            )}
                            <ul className="text-left text-muted-foreground mb-5 space-y-1.5 flex-grow text-sm"> {/* Reduced margin/space-y/text size */}
                                {plan.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-start gap-1.5"> {/* Reduced gap */}
                                        <CheckIcon className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" /> {feature} {/* Reduced icon size */}
                                    </li>
                                ))}
                            </ul>
                            <button
                                onClick={() => handleCheckout(plan)}
                                disabled={plan.title === "Free Plan"}
                                className={`mt-auto w-full px-4 sm:px-5 py-2 rounded-lg font-semibold text-sm transition-all duration-200 // Reduced padding/font size
                                    ${plan.title === "Enterprise"
                                        ? "bg-transparent border border-purple-600 text-purple-500 hover:bg-purple-600 hover:text-white"
                                        : (plan.title === "Free Plan"
                                            ? "bg-gray-500/20 text-gray-400 cursor-not-allowed"
                                            : "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700")
                                    }`}
                            >
                                {plan.title === "Enterprise" ? "Contact an AE" : "Get Started"}
                            </button>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </motion.div>
    );
};
