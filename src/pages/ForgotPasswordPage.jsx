// src/pages/ForgotPasswordPage.jsx

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Ensure this path is correct

// Import the 3D background component for consistency
import ThreeDBackground from '../components/ThreeDBackground';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const { supabase } = useAuth(); // We just need supabase client for this
    const navigate = useNavigate();

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        if (!email) {
            setError('Please enter your email address.');
            setLoading(false);
            return;
        }

        try {
            // Send password reset email using Supabase's built-in function
            const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/update-password`, // This is crucial!
            });

            if (resetError) {
                // Handle specific Supabase errors if needed, e.g., "User not found"
                if (resetError.message.includes("not found")) {
                    setError("No user found with that email address.");
                } else {
                    setError(resetError.message);
                }
            } else {
                setMessage('Password reset email sent! Please check your inbox and spam folder.');
                // Optionally, clear the email field after successful send
                setEmail('');
            }
        } catch (err) {
            console.error("Error sending password reset:", err);
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
            <ThreeDBackground /> {/* Consistent 3D background */}

            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="relative z-10 p-8 bg-card rounded-2xl shadow-xl max-w-md w-full border border-border auth-card-glow"
            >
                <h2 className="text-4xl font-bold text-center text-foreground mb-6 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                    Forgot Password
                </h2>
                <p className="text-center text-muted-foreground mb-8">
                    Enter your email address to receive a password reset link.
                </p>

                {message && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-green-500/20 text-green-400 p-3 rounded-lg mb-4 text-center"
                    >
                        {message}
                    </motion.div>
                )}

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-red-500/20 text-red-400 p-3 rounded-lg mb-4 text-center"
                    >
                        {error}
                    </motion.div>
                )}

                <form onSubmit={handleResetPassword} className="space-y-6">
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
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg font-semibold text-lg hover:from-pink-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>

                <div className="mt-8 text-center text-muted-foreground">
                    <Link to="/auth" className="text-purple-500 hover:underline font-medium">
                        Back to Login
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPasswordPage;