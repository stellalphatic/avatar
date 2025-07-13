// src/pages/AuthPage.jsx
import React, { useState, useEffect } from 'react'; // Added useEffect
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom'; // Added useLocation
import { useAuth } from '../AuthContext';
// Correct way to import icons from lucide-react
import { X, Check } from 'lucide-react'; // Corrected imports

const GitHubIcon = ({ size = 24, className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.08-.731.082-.716.082-.716 1.205.082 1.838 1.235 1.838 1.235 1.07 1.835 2.809 1.305 3.493.998.108-.77.418-1.305.762-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.312.465-2.384 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1-.322 3.292 1.233.955-.265 1.961-.397 2.964-.397.998 0 2.004.132 2.959.397 2.292-1.555 3.292-1.233 3.292-1.233.645 1.653.24 2.873.105 3.176.77.835 1.235 1.908 1.235 3.22 0 4.61-2.801 5.625-5.476 5.92-.42.365-.818 1.096-.818 2.222v3.293c0 .319.192.602.798.577C20.562 21.789 24 17.302 24 12c0-6.627-5.372-12-12-12z"/>
    </svg>
);

const GoogleIcon = ({ size = 24, className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M22.56 12.25c0-.78-.07-1.5-.18-2.2H12v4.26h6.15c-.25 1.18-.84 2.15-1.74 2.76v3.29h4.22c2.47-2.28 3.9-5.64 3.9-9.06z" fill="#4285F4"/>
        <path d="M12 23c3.2 0 5.86-1.07 7.82-2.92l-4.22-3.29c-1.15.77-2.6 1.22-3.6 1.22-2.98 0-5.5-2-6.42-4.63H1.93v3.37c1.78 3.51 5.37 6.03 10.07 6.03z" fill="#34A853"/>
        <path d="M5.58 14.16c-.23-.69-.37-1.42-.37-2.16s.14-1.47.37-2.16V6.5h-3.6C1.45 7.8 1 9.8 1 12s.45 4.2 1.98 5.5z" fill="#FBBC05"/>
        <path d="M12 5.09c1.77 0 3.3.62 4.53 1.76l3.71-3.71C17.82 1.45 15.2 0 12 0 7.37 0 3.78 2.52 1.93 6.03l3.6 2.81c.92-2.63 3.44-4.63 6.47-4.63z" fill="#EA4335"/>
    </svg>
);

// Mock 3D component (replace with your actual 3D scene)
const ThreeDScene = () => (
    <div className="absolute inset-0 z-0 overflow-hidden">
        <img src="https://via.placeholder.com/1920x1080/4A148C/FFFFFF?text=Interactive+3D+Placeholder" alt="3D Background" className="w-full h-full object-cover animate-pulse" />
        <div className="absolute inset-0 bg-black opacity-50"></div>
        {/* You'd integrate your actual Three.js/React-three-fiber component here */}
        {/* Example: <Canvas><ambientLight /><mesh><sphereGeometry /></mesh></Canvas> */}
    </div>
);

// Pricing Modal Component (can be opened from AuthPage or Dashboard)
const PricingModal = ({ onClose, onPlanSelected }) => { // Added onPlanSelected prop for clarity
    const { user, supabase } = useAuth(); // Access user and supabase from AuthContext

    const subscriptionPlans = [
        {
            title: "Free Plan",
            description: "Get started with basic AI avatar generation.",
            price: "$0/month",
            features: ["Limited features", "5 avatar generations/month", "Standard support"],
            stripePriceId: import.meta.env.VITE_STRIPE_PRICE_ID_FREE // CORRECTED: Use VITE_ prefix
        },
        {
            title: "Pro Plan",
            description: "Advanced features for professional content creators.",
            price: "$10/month",
            features: ["All free features", "Unlimited avatar generations", "Priority support", "Early access to new features"],
            stripePriceId: import.meta.env.VITE_STRIPE_PRICE_ID_PRO // CORRECTED: Use VITE_ prefix
        },
        {
            title: "Enterprise",
            description: "Full-featured solution for businesses and teams.",
            price: "$20/month",
            features: ["All Pro features", "Custom integrations", "Dedicated account manager", "SLA & Uptime guarantees"],
            stripePriceId: import.meta.env.VITE_STRIPE_PRICE_ID_ENTERPRISE // CORRECTED: Use VITE_ prefix
        }
    ];

    const handleCheckout = async (plan) => {
        if (!user) {
            alert('Please log in or sign up first to select a plan.');
            return;
        }

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                alert('No active session. Please log in again.');
                return;
            }

            // CORRECTED: Use environment variable for backend URL
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
                    'Authorization': `Bearer ${session.access_token}` // Send JWT
                },
                body: JSON.stringify({ priceId: plan.stripePriceId, planName: plan.title })
            });

            const responseData = await response.json(); // Get the full response

            if (!response.ok) { // Check for HTTP errors (status codes 4xx, 5xx)
                console.error('Error from backend:', responseData.error || 'Unknown error');
                alert(`Error: ${responseData.error || 'Failed to create checkout session.'}`);
                return;
            }

            const { url, error } = responseData; // Destructure after checking response.ok

            if (error) { // Redundant if response.ok is checked, but good for explicit errors from backend
                console.error('Error from backend (json):', error);
                alert(`Error: ${error}`);
                return;
            }

            // Redirect to Stripe Checkout page
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
                className="bg-card p-8 rounded-xl shadow-lg max-w-4xl w-full mx-4 relative border border-border"
                onClick={e => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
                    <X size={24} />
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
                                        <Check className="w-4 h-4 text-green-500" /> {feature}
                                    </li>
                                ))}
                            </ul>
                            <button
                                onClick={() => handleCheckout(plan)}
                                disabled={plan.title === "Free Plan"} // Disable button for Free Plan
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
    const [showPricingModal, setShowPricingModal] = useState(false); // State for pricing modal

    const { signIn, signUp, signInWithOAuth, user, loading: authLoading, supabase } = useAuth(); // Destructure user, authLoading, supabase
    const navigate = useNavigate();
    const location = useLocation(); // Get current URL location

    // Effect to check user's plan and show modal if needed
    useEffect(() => {
        const checkUserPlan = async () => {
            // Only proceed if user is logged in and auth data is loaded
            if (user && !authLoading) {
                // Fetch the user's profile to check their plan
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('current_plan')
                    .eq('id', user.id)
                    .single();

                if (profileError) {
                    console.error("Error fetching user profile:", profileError);
                    // You might want to handle this error gracefully, maybe a generic error message
                    return;
                }

                // If user is logged in and has a "Free Plan", show pricing modal
                // Or if there's no plan recorded (e.g., first login after signup without explicit plan)
                if (profile && profile.current_plan === 'Free Plan') {
                    setShowPricingModal(true);
                }
            }
        };

        // Only trigger checkUserPlan if navigating to /dashboard directly after login/signup
        // or if explicitly on AuthPage and user becomes defined.
        // This prevents the modal from popping up unnecessarily if user is already on dashboard
        // and just navigating around.
        if (user && !authLoading && location.pathname === '/dashboard') {
            checkUserPlan();
        } else if (user && !authLoading && location.pathname === '/auth' && !isLogin) {
            // If it's a new signup, always show modal
            setShowPricingModal(true);
        }

    }, [user, authLoading, supabase, navigate, isLogin, location.pathname]); // Dependencies for useEffect

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
            console.log('Auth successful:', authResult.data);
            if (!isLogin && authResult.data?.user && !authResult.data.session) {
                // For signup, if email confirmation is required but not yet confirmed
                setError("Please check your email to confirm your account!");
            } else {
                // After successful login/signup, navigate to dashboard
                // The useEffect will then check the user's plan and potentially show the modal
                navigate('/dashboard');
            }
        }
        setLoading(false);
    };

    const handleOAuthLogin = async (provider) => {
        setLoading(true);
        setError('');
        const { error } = await signInWithOAuth(provider);
        if (error) {
            setError(error.message);
            setLoading(false); // Make sure to reset loading on error
        }
        // No setLoading(false) here because signInWithOAuth initiates a redirect,
        // and the AuthContext's onAuthStateChange listener will handle the user state update
        // and the useEffect will trigger the plan check.
    };

    // This function is still here but its logic is now mainly handled by the useEffect
    const handleSelectPlan = () => {
        // This function might be called if you want to perform actions after a user
        // interacts with the modal, but the primary navigation/Stripe redirect
        // is now handled by handleCheckout within the modal.
        setShowPricingModal(false); // Close the modal
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
            <ThreeDScene /> {/* Your 3D background */}

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
                            {/* CHANGE THIS LINE */}
                            <GoogleIcon size={24} className="text-red-500" /> {/* Corrected: use GoogleIcon */}
                        </motion.button>
                        <motion.button
                            onClick={() => handleOAuthLogin('github')}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-3 border border-border rounded-full flex items-center justify-center bg-background hover:bg-accent transition-colors duration-200"
                            aria-label="Login with GitHub"
                        >
                            {/* CHANGE THIS LINE */}
                            <GitHubIcon size={24} className="text-gray-800 dark:text-white" /> {/* Corrected: use GitHubIcon */}
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
                    {/* The "View Pricing Plans" button remains for explicit access */}
                    <button
                        onClick={() => setShowPricingModal(true)}
                        className="mt-4 text-pink-500 hover:underline font-medium"
                    >
                        View Pricing Plans
                    </button>
                </div>
            </motion.div>

            {/* Render the PricingModal if showPricingModal is true */}
            {showPricingModal && <PricingModal onClose={() => setShowPricingModal(false)} onPlanSelected={handleSelectPlan} />}
        </div>
    );
};

export default AuthPage;

// The Check icon component is no longer needed here as it's imported from lucide-react directly.
// const Check = ({ size = 24, color = "currentColor", ...props }) => (
//     <svg
//       xmlns="http://www.w3.org/2000/svg"
//       width={size}
//       height={size}
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke={color}
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//       {...props}
//     >
//       <polyline points="20 6 9 17 4 12" />
//     </svg>
//   );