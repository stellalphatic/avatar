// src/pages/UpdatePasswordPage.jsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { EyeIcon, EyeOffIcon } from '../utils/icons'; // For show/hide password
import PasswordStrengthIndicator from '../components/PasswordStrengthIndicator'; // For password strength

// Import the 3D background component for consistency
import ThreeDBackground from '../components/ThreeDBackground';

const UpdatePasswordPage = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { supabase } = useAuth();
    const navigate = useNavigate();

    // This useEffect is crucial for Supabase's password reset flow.
    // When a user clicks the password reset link, Supabase redirects them to this page
    // with a "type=recovery" and "access_token" in the URL hash.
    // The onAuthStateChange listener will automatically pick up this session
    // and elevate the user's privileges to allow password update.
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            // Check if the event indicates a password recovery session
            if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
                // If a session exists, it means the user is authenticated with recovery token
                if (session) {
                    setMessage('Please set your new password.');
                } else {
                    setError('Invalid or expired password reset link. Please try again.');
                    setLoading(false);
                }
            } else if (event === 'SIGNED_OUT') {
                // If user signs out during this process (unlikely but good for cleanup)
                setError('Session expired or logged out. Please request a new reset link.');
                setLoading(false);
            }
        });

        return () => {
            if (subscription) {
                subscription.unsubscribe();
            }
        };
    }, [supabase]);


    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        if (password.length === 0 || confirmPassword.length === 0) {
            setError("Password fields cannot be empty.");
            setLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            setLoading(false);
            return;
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters long.");
            setLoading(false);
            return;
        }

        try {
            // Update the user's password. Supabase's `updateUser` automatically uses the
            // session from the recovery link if available.
            const { error: updateError } = await supabase.auth.updateUser({
                password: password,
            });

            if (updateError) {
                setError(updateError.message);
            } else {
                setMessage('Your password has been updated successfully! Redirecting to login...');
                setTimeout(() => {
                    navigate('/auth', { replace: true }); // Redirect to login after success
                }, 3000);
            }
        } catch (err) {
            console.error("Error updating password:", err);
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
            <ThreeDBackground />

            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="relative z-10 p-8 bg-card rounded-2xl shadow-xl max-w-md w-full border border-border auth-card-glow"
            >
                <h2 className="text-4xl font-bold text-center text-foreground mb-6 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                    Set New Password
                </h2>

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

                <form onSubmit={handleUpdatePassword} className="space-y-6">
                    <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-muted-foreground mb-2">New Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="newPassword"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full p-3 pr-10 rounded-lg bg-input border border-border focus:ring-2 focus:ring-purple-500 outline-none transition-all duration-200 text-foreground"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
                            </button>
                        </div>
                        <PasswordStrengthIndicator password={password} />
                    </div>

                    <div>
                        <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-muted-foreground mb-2">Confirm New Password</label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                id="confirmNewPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="w-full p-3 pr-10 rounded-lg bg-input border border-border focus:ring-2 focus:ring-purple-500 outline-none transition-all duration-200 text-foreground"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
                                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                            >
                                {showConfirmPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
                            </button>
                        </div>
                        {password !== confirmPassword && confirmPassword.length > 0 && (
                            <p className="text-red-400 text-xs mt-1">Passwords do not match.</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading || password !== confirmPassword || password.length < 8}
                        className="w-full py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg font-semibold text-lg hover:from-pink-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Updating...' : 'Update Password'}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default UpdatePasswordPage;