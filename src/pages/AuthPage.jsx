// src/pages/AuthPage.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

import { GoogleIcon, GitHubIcon, XIcon, CheckIcon } from '../utils/icons';

// Mock 3D component (replace with your actual 3D scene)
const ThreeDScene = () => (
    <div className="absolute inset-0 z-0 overflow-hidden">
        <img src="https://via.placeholder.com/1920x1080/4A148C/FFFFFF?text=Interactive+3D+Placeholder" alt="3D Background" className="w-full h-full object-cover animate-pulse" />
        <div className="absolute inset-0 bg-black opacity-50"></div>
    </div>
);

// Pricing Modal Component (can be opened from AuthPage or Dashboard)
const PricingModal = ({ onClose, onPlanSelected }) => {
    // This component no longer contains backend logic,
    // as per your request to remove pricing/subscription code from this page.
    const subscriptionPlans = [
        {
            title: "Free Plan",
            description: "Get started with basic AI avatar generation.",
            price: "$0/month",
            features: ["Limited features", "5 avatar generations/month", "Standard support"]
        },
        {
            title: "Pro Plan",
            description: "Advanced features for professional content creators.",
            price: "$10/month",
            features: ["All free features", "Unlimited avatar generations", "Priority support", "Early access to new features"]
        },
        {
            title: "Enterprise",
            description: "Full-featured solution for businesses and teams.",
            price: "$20/month",
            features: ["All Pro features", "Custom integrations", "Dedicated account manager", "SLA & Uptime guarantees"]
        }
    ];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                className="bg-card p-8 rounded-xl shadow-lg max-w-4xl w-full mx-4 relative border border-border"
                onClick={e => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
                    <XIcon size={24} />
                </button>
                <h2 className="text-3xl font-bold text-center text-foreground mb-8">Choose Your Plan</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {subscriptionPlans.map((plan, index) => (
                        <motion.div
                            key={index}
                            className="p-6 border border-border rounded-xl bg-background flex flex-col items-center text-center"
                            whileHover={{ scale: 1.03, boxShadow: "0 8px 20px rgba(0,0,0,0.2)" }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                                {plan.title}
                            </h3>
                            <p className="text-muted-foreground mb-4">{plan.description}</p>
                            <p className="text-4xl font-extrabold text-foreground mb-6">{plan.price}</p>
                            <ul className="text-left text-muted-foreground mb-6 space-y-2 flex-grow">
                                {plan.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-center gap-2">
                                        <CheckIcon className="w-4 h-4 text-green-500" /> {feature}
                                    </li>
                                ))}
                            </ul>
                            <button
                                onClick={() => alert('This button is for display purposes. Functionality is disabled.')}
                                disabled={plan.title === "Free Plan"}
                                className={`mt-auto px-6 py-3 rounded-lg font-semibold text-lg transition-all duration-200
                                    ${plan.title === "Free Plan"
                                        ? "bg-gray-500/20 text-gray-400 cursor-not-allowed"
                                        : "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
                                    }`}
                            >
                                {plan.title === "Free Plan" ? "Current Plan" : "Select Plan"}
                            </button>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </motion.div>
    );
};

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPricingModal, setShowPricingModal] = useState(false);

    const { signIn, signUp, signInWithOAuth, user } = useAuth();
    const navigate = useNavigate();

    // THIS IS THE CORRECT, SIMPLIFIED REDIRECT LOGIC
    // It runs whenever the 'user' object changes in your AuthContext.
    useEffect(() => {
        if (user) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        let authResult;
        if (isLogin) {
            authResult = await signIn(email, password);
        } else {
            authResult = await signUp(email, password);
        }

        if (authResult.error) {
            setError(authResult.error.message);
        } else {
            // For signup with email confirmation, Supabase doesn't return a session.
            // The user object will be set to null until they confirm their email.
            // The useEffect will handle navigation only when the user object is valid.
            if (!isLogin && authResult.data?.user && !authResult.data.session) {
                setError("Please check your email to confirm your account!");
            }
        }
        setLoading(false);
    };

    const handleOAuthLogin = async (provider) => {
        setLoading(true);
        setError('');
        
        // THIS IS THE CRUCIAL FIX FOR PRODUCTION OAUTH REDIRECTS.
        // It tells Supabase to send the user back to the dashboard of your current domain.
        const redirectToUrl = window.location.origin + '/dashboard';

        const { error } = await signInWithOAuth(provider, {
            redirectTo: redirectToUrl
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        }
    };
    
    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
            <ThreeDScene />

            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="relative z-10 p-8 bg-card rounded-2xl shadow-xl max-w-md w-full border border-border"
            >
                <h2 className="text-4xl font-bold text-center text-foreground mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {isLogin ? 'Welcome Back!' : 'Join AVATAR'}
                </h2>
                <p className="text-center text-muted-foreground mb-8">
                    {isLogin ? 'Login to access your dashboard' : 'Create your account to get started'}
                </p>

                {error && (
                    <div className="bg-red-500/20 text-red-400 p-3 rounded-lg mb-4 text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-muted-foreground mb-2">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full p-3 rounded-lg bg-input border border-border focus:ring-2 focus:ring-purple-500 outline-none transition-all duration-200 text-foreground"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-muted-foreground mb-2">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full p-3 rounded-lg bg-input border border-border focus:ring-2 focus:ring-purple-500 outline-none transition-all duration-200 text-foreground"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold text-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Processing...' : (isLogin ? 'Log In' : 'Sign Up')}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-muted-foreground mb-4">Or continue with</p>
                    <div className="flex justify-center space-x-4">
                        <motion.button
                            onClick={() => handleOAuthLogin('google')}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-3 border border-border rounded-full flex items-center justify-center bg-background hover:bg-accent transition-colors duration-200"
                            aria-label="Login with Google"
                        >
                            <GoogleIcon size={24} className="text-red-500" />
                        </motion.button>
                        <motion.button
                            onClick={() => handleOAuthLogin('github')}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-3 border border-border rounded-full flex items-center justify-center bg-background hover:bg-accent transition-colors duration-200"
                            aria-label="Login with GitHub"
                        >
                            <GitHubIcon size={24} className="text-gray-800 dark:text-white" />
                        </motion.button>
                    </div>
                </div>

                <div className="mt-8 text-center text-muted-foreground">
                    {isLogin ? (
                        <>
                            Don't have an account?{' '}
                            <button onClick={() => setIsLogin(false)} className="text-purple-500 hover:underline font-medium">
                                Sign Up
                            </button>
                        </>
                    ) : (
                        <>
                            Already have an account?{' '}
                            <button onClick={() => setIsLogin(true)} className="text-purple-500 hover:underline font-medium">
                                Log In
                            </button>
                        </>
                    )}
                    <br />
                    <button
                        onClick={() => setShowPricingModal(true)}
                        className="mt-4 text-pink-500 hover:underline font-medium"
                    >
                        View Pricing Plans
                    </button>
                </div>
            </motion.div>

            {showPricingModal && <PricingModal onClose={() => setShowPricingModal(false)} onPlanSelected={() => {}} />}
        </div>
    );
};

export default AuthPage;