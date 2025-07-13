// src/components/PricingModal.jsx 
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

import { XIcon, CheckIcon } from '../utils/icons';

export const PricingModal = ({ onClose }) => {
    const { user, supabase } = useAuth();
    const [isYearlyBilling, setIsYearlyBilling] = useState(false); // New state for billing toggle

    const subscriptionPlans = [
        {
            title: "Creator",
            description: "For one person", // Mimicking competitor
            monthlyPrice: "$24",
            yearlyPrice: "$20", // $24 * 12 * (1 - 0.22) / 12 = ~ $20
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
            monthlyPrice: "$120", // Example pricing
            yearlyPrice: "$99",
            minSeats: "Minimum 2 seats, $720 billed yearly", // Mimicking competitor
            features: [
                "Everything in Creator, plus:",
                "2 seats included",
                "2 Custom Video Avatars",
                "Unlimited videos", // Listed again for clarity on competitor's site
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
            price: "Let's talk", // Custom for enterprise
            features: [
                "Everything in Team, plus:",
                "Custom integrations",
                "Dedicated account manager",
                "SLA & Uptime guarantees",
                "No video duration max"
            ],
            stripePriceId: null, // No direct Stripe checkout for enterprise
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
            // Implement a contact form or redirect to a contact page
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
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                className="bg-card p-8 rounded-xl shadow-lg max-w-5xl w-full mx-4 relative border border-border"
                onClick={e => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
                    <XIcon size={24} />
                </button>
                <h2 className="text-3xl font-bold text-center text-foreground mb-4">Plans that fit your scale</h2>
                <div className="flex justify-center mb-8">
                    <div className="relative inline-flex items-center rounded-lg bg-gray-700 p-1">
                        <button
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${!isYearlyBilling ? 'bg-purple-600 text-white' : 'text-gray-300 hover:text-white'}`}
                            onClick={() => setIsYearlyBilling(false)}
                        >
                            Monthly billing
                        </button>
                        <button
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${isYearlyBilling ? 'bg-purple-600 text-white' : 'text-gray-300 hover:text-white'}`}
                            onClick={() => setIsYearlyBilling(true)}
                        >
                            Yearly (save up to 22%)
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {subscriptionPlans.map((plan, index) => (
                        <motion.div
                            key={index}
                            className="p-6 border border-border rounded-xl bg-background flex flex-col items-center text-center relative"
                            whileHover={{ scale: 1.03, boxShadow: "0 8px 20px rgba(0,0,0,0.2)" }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            {plan.isPopular && (
                                <div className="absolute -top-3 right-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                                    Most Popular 🔥
                                </div>
                            )}
                            <h4 className="text-sm text-muted-foreground mb-1">{plan.description}</h4>
                            <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                                {plan.title}
                            </h3>
                            <p className="text-4xl font-extrabold text-foreground mb-6">
                                {plan.title === "Enterprise"
                                    ? plan.price
                                    : (isYearlyBilling ? plan.yearlyPrice : plan.monthlyPrice) + "/month"}
                            </p>
                            {plan.minSeats && (
                                <p className="text-xs text-muted-foreground mb-4">{plan.minSeats}</p>
                            )}
                            <ul className="text-left text-muted-foreground mb-6 space-y-2 flex-grow">
                                {plan.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-center gap-2">
                                        <CheckIcon className="w-4 h-4 text-green-500" /> {feature}
                                    </li>
                                ))}
                            </ul>
                            <button
                                onClick={() => handleCheckout(plan)}
                                disabled={plan.title === "Free Plan"} // You might remove "Free Plan" if not offered explicitly
                                className={`mt-auto px-6 py-3 rounded-lg font-semibold text-lg transition-all duration-200
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