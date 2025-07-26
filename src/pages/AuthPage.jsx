// src/pages/AuthPage.jsx

import React, { useState, useEffect } from 'react'; 
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom'; 
import { useAuth } from '../contexts/AuthContext';


import { GoogleIcon, GitHubIcon, XIcon, CheckIcon } from '../utils/icons';


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

            stripePriceId: import.meta.env.VITE_STRIPE_PRICE_ID_FREE 

        },

        {

            title: "Pro Plan",

            description: "Advanced features for professional content creators.",

            price: "$10/month",

            features: ["All free features", "Unlimited avatar generations", "Priority support", "Early access to new features"],

            stripePriceId: import.meta.env.VITE_STRIPE_PRICE_ID_PRO 

        },

        {

            title: "Enterprise",

            description: "Full-featured solution for businesses and teams.",

            price: "$20/month",

            features: ["All Pro features", "Custom integrations", "Dedicated account manager", "SLA & Uptime guarantees"],

            stripePriceId: import.meta.env.VITE_STRIPE_PRICE_ID_ENTERPRISE 

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