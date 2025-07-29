// src/pages/AuthPage.jsx

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Import the new components
import ThreeDBackground from '../components/ThreeDBackground';
import PasswordStrengthIndicator from '../components/PasswordStrengthIndicator';
import PolicyModal from '../components/PolicyModal';
import {PricingModal} from '../components/PricingModal';

// Assuming these are SVG components from your utils/icons
import { GoogleIcon, GitHubIcon, EyeIcon, EyeOffIcon } from '../utils/icons';

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [showPrivacyModal, setShowPrivacyModal] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [showPricingModal, setShowPricingModal] = useState(false);

    const { signIn, signUp, signInWithOAuth, supabase } = useAuth(); // Removed `user` and `loading: authLoading` as they are not directly used here after refactor
    const navigate = useNavigate();
    const location = useLocation();

    // FIX FOR: Uncaught TypeError: authListener.unsubscribe is not a function
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log("Auth event:", event, "Session:", session); // Debugging line

            if (event === 'SIGNED_IN' && session) {
                const userId = session.user.id;
                let profile;
                let profileError;

                try {
                    ({ data: profile, error: profileError } = await supabase
                        .from('profiles')
                        .select('current_plan')
                        .eq('id', userId)
                        .single());
                } catch (e) {
                    profileError = e;
                    console.error("Error fetching user profile:", e);
                }


                if (profileError && profileError.code !== 'PGRST116') { // PGRST116 is 'No rows found'
                    console.error("Error fetching user profile on auth change:", profileError);
                }

                const queryParams = new URLSearchParams(location.search);
                const isStripeSuccess = queryParams.get('success') === 'true';

                // Check if user has a paid plan or if they just completed Stripe checkout
                if (profile?.current_plan && profile.current_plan !== 'Free Plan' || isStripeSuccess) {
                    navigate('/dashboard', { replace: true });
                } else if (location.pathname === '/auth') {
                    // If on auth page and no paid plan, show pricing modal for new users/upgrades
                    setShowPricingModal(true);
                } else {
                    // For any other scenario (e.g., user navigated directly, but has free plan), go to dashboard
                    navigate('/dashboard', { replace: true });
                }

            } else if (event === 'SIGNED_OUT') {
                // Clear state if user signs out
                setEmail('');
                setPassword('');
                setConfirmPassword('');
                setError('');
                setIsLogin(true);
                setAgreedToTerms(false);
                setShowPassword(false);
                setShowConfirmPassword(false);
                // Ensure no modals are open
                setShowPricingModal(false);
                setShowPrivacyModal(false);
                setShowTermsModal(false);
                navigate('/auth', { replace: true }); // Redirect back to auth page
            } else if (event === 'INITIAL_SESSION' && session) {
                // Handle initial session if user is already logged in when visiting /auth
                const userId = session.user.id;
                let profile;
                let profileError;

                try {
                    ({ data: profile, error: profileError } = await supabase
                        .from('profiles')
                        .select('current_plan')
                        .eq('id', userId)
                        .single());
                } catch (e) {
                    profileError = e;
                    console.error("Error fetching initial session profile:", e);
                }

                if (profileError && profileError.code !== 'PGRST116') {
                    console.error("Error fetching user profile on initial session:", profileError);
                }

                if (profile?.current_plan && profile.current_plan !== 'Free Plan') {
                    navigate('/dashboard', { replace: true });
                } else {
                    // Even if free, if already logged in, go to dashboard. Pricing modal is for sign-up/login flow.
                    navigate('/dashboard', { replace: true });
                }
            }
        });

        // Correct way to unsubscribe:
        return () => {
            if (subscription) {
                subscription.unsubscribe();
            }
        };
    }, [supabase, navigate, location.search, location.pathname]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!isLogin) { // Only for signup
            if (password !== confirmPassword) {
                setError("Passwords do not match.");
                setLoading(false);
                return;
            }
            if (!agreedToTerms) {
                setError("You must agree to the Privacy Policy and Terms & Conditions.");
                setLoading(false);
                return;
            }
            if (password.length < 8) { // Basic strength check
                setError("Password must be at least 8 characters long.");
                setLoading(false);
                return;
            }
        }

        let authResult;

        if (isLogin) {
            authResult = await signIn(email, password);
        } else {
            // Important: redirectTo after email confirmation for sign-up
            authResult = await signUp(email, password, `${window.location.origin}/dashboard`);
        }

        if (authResult.error) {
            setError(authResult.error.message);
            if (authResult.error.message.includes("confirm your email")) {
                setError("Please check your email to confirm your account! You will be redirected after confirmation.");
            } else if (authResult.error.message.includes("User already registered")) {
                setError("This email is already registered. Please log in or use a different email.");
            }
        } else {
            if (!isLogin && !authResult.data.session) {
                // If it's a signup via email and session is null, it means email confirmation is pending
                setError("Account created! Please check your email to confirm your account.");
            } else {
                // For direct login, or OAuth, or if email confirmation automatically signed in
                // The useEffect listener will handle the actual navigation or modal display.
                console.log("Authentication successful, listener will handle redirection.");
            }
        }
        setLoading(false);
    };

    const handleOAuthLogin = async (provider) => {
        setLoading(true);
        setError('');
        // Redirect to /auth so our useEffect listener can process the session
        // and decide whether to show pricing modal or navigate to dashboard.
        const { error } = await signInWithOAuth(provider, `${window.location.origin}/auth`);
        if (error) {
            setError(error.message);
            setLoading(false);
        }
        // No setLoading(false) here as Supabase performs a redirect.
    };

    // Placeholder content for Privacy Policy and Terms & Conditions
    // Consider moving these to a separate constants file or fetching from an API.
    const privacyPolicyContent = `
    <h3 class="text-xl font-bold mb-3">1. Information We Collect</h3>
    <p>We may collect various types of information from and about you and your use of our Service, including:</p>
    <ul class="list-disc list-inside space-y-1 mb-4">
        <li><strong>Personal Information:</strong> Information that can be used to identify you directly or indirectly, such as your name, email address, contact details, or any other information you provide when you register for an account, interact with our support, or provide a specialized knowledge base for your AI Digital Twin.</li>
        <li><strong>Conversational Data:</strong> When your AI Digital Twin interacts with end-users, we collect and process the conversational data generated during these interactions. This includes text, audio, and potentially video (depending on the features you enable) of the conversations.</li>
        <li><strong>Knowledge Base Data:</strong> Information you upload or input to create and customize the specialized knowledge base for your AI Digital Twin. This data is essential for the AI to provide relevant and accurate responses.</li>
        <li><strong>Usage Data:</strong> Information about how you access and use the Service, such as your IP address, browser type, operating system, pages viewed, time spent on pages, and other diagnostic data.</li>
        <li><strong>Cookies and Tracking Technologies:</strong> We use cookies and similar tracking technologies to track the activity on our Service and hold certain information. Cookies are files with a small amount of data that may include an anonymous unique identifier. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our Service.</li>
    </ul>
    <h3 class="text-xl font-bold mb-3">2. How We Use Your Information</h3>
    <p>We use the collected information for various purposes, including:</p>
    <ul class="list-disc list-inside space-y-1 mb-4">
        <li>To Provide and Maintain the Service: Operating, maintaining, and providing all features of the Service, including facilitating the creation and operation of your AI Digital Twins.</li>
        <li>To Improve and Personalize the Service: Understanding how users interact with our Service and AI Digital Twins to enhance user experience, develop new features, and improve the accuracy and effectiveness of the AI. This includes analyzing conversational data to extract insights.</li>
        <li>To Manage Your Account: Registering you as a new user, managing your account, and providing customer support.</li>
        <li>To Communicate with You: Sending you service-related announcements, updates, security alerts, and support messages.</li>
        <li>For Analytics and Research: Performing data analysis, research, and trend analysis to understand usage patterns and optimize our Service.</li>
        <li>To Ensure Security: Detecting, preventing, and addressing technical issues, fraud, or other malicious activities.</li>
        <li>To Comply with Legal Obligations: Meeting our legal and regulatory requirements.</li>
    </ul>
    <h3 class="text-xl font-bold mb-3">3. How We Share Your Information</h3>
    <p>We may share your information in the following situations:</p>
    <ul class="list-disc list-inside space-y-1 mb-4">
        <li><strong>With Service Providers:</strong> We may employ third-party companies and individuals to facilitate our Service, provide the Service on our behalf, perform Service-related services, or assist us in analyzing how our Service is used. These third parties have access to your information only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.</li>
        <li><strong>For Business Transfers:</strong> If Metapresence is involved in a merger, acquisition, or asset sale, your Personal Information may be transferred. We will provide notice before your Personal Information is transferred and becomes subject to a different Privacy Policy.</li>
        <li><strong>For Legal Reasons:</strong> We may disclose your information if required to do so by law or in response to valid requests by public authorities (e.g., a court or a government agency).</li>
        <li><strong>With Your Consent:</strong> We may disclose your personal information for any other purpose with your explicit consent.</li>
    </ul>
    <h3 class="text-xl font-bold mb-3">4. Data Security</h3>
    <p>The security of your data is important to us. We implement reasonable measures to protect your Personal Information from unauthorized access, use, alteration, and disclosure. However, no method of transmission over the Internet or method of electronic storage is 100% secure, and we cannot guarantee absolute security.</p>
    <h3 class="text-xl font-bold mb-3">5. Retention of Data</h3>
    <p>We will retain your Personal Information and other collected data only for as long as is necessary for the purposes set out in this Privacy Policy, including to comply with our legal obligations, resolve disputes, and enforce our legal agreements and policies.</p>
    <h3 class="text-xl font-bold mb-3">6. Your Data Protection Rights</h3>
    <p>Depending on your location, you may have the following rights regarding your personal data:</p>
    <ul class="list-disc list-inside space-y-1 mb-4">
        <li><strong>Right to Access:</strong> Request a copy of the personal data we hold about you.</li>
        <li><strong>Right to Rectification:</strong> Request that we correct any inaccurate or incomplete personal data.</li>
        <li><strong>Right to Erasure (Right to be Forgotten):</strong> Request that we delete your personal data under certain conditions.</li>
        <li><strong>Right to Restrict Processing:</strong> Request that we restrict the processing of your personal data under certain conditions.</li>
        <li><strong>Right to Data Portability:</strong> Request that we transfer the data that we have collected to another organization, or directly to you, under certain conditions.</li>
        <li><strong>Right to Object:</strong> Object to our processing of your personal data under certain conditions.</li>
    </ul>
    <p>To exercise any of these rights, please contact us using the contact details provided below.</p>
    <h3 class="text-xl font-bold mb-3">7. Links to Other Websites</h3>
    <p>Our Service may contain links to other websites that are not operated by us. If you click on a third-party link, you will be directed to that third party's site. We strongly advise you to review the Privacy Policy of every site you visit. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services.</p>
    <h3 class="text-xl font-bold mb-3">8. Children's Privacy</h3>
    <p>Our Service is not intended for use by anyone under the age of 18 ("Children"). We do not knowingly collect personally identifiable information from anyone under the age of 18. If you are a parent or guardian and you are aware that your child has provided us with Personal Information, please contact us. If we become aware that we have collected Personal Information from children without verification of parental consent, we take steps to remove that information from our servers.</p>
    <h3 class="text-xl font-bold mb-3">9. Changes to This Privacy Policy</h3>
    <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date at the top of this Privacy Policy. You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.</p>
    `;

    const termsConditionsContent = `
    <h3 class="text-xl font-bold mb-3">1. Accounts</h3>
    <p>When you create an account with us, you guarantee that you are above the age of 18 and that the information you provide us is accurate, complete, and current at all times. Inaccurate, incomplete, or obsolete information may result in the immediate termination of your account on the Service.</p>
    <p>You are responsible for maintaining the confidentiality of your account and password, including but not limited to the restriction of access to your computer and/or account. You agree to accept responsibility for any and all activities or actions that occur under your account and/or password, whether your password is with our Service or a third-party service. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.</p>
    <h3 class="text-xl font-bold mb-3">2. Services Description</h3>
    <p>Metapresence provides an AI Digital Twin platform that enables users to create and deploy interactive, hyper-realistic AI avatars. Our Service allows you to:</p>
    <ul class="list-disc list-inside space-y-1 mb-4">
        <li>Build and customize AI Digital Twins.</li>
        <li>Upload and integrate specialized knowledge bases to train your AI.</li>
        <li>Engage in conversational interactions with end-users via your AI Digital Twin.</li>
        <li>(Add any other core features specific to Metapresence, e.g., analytics, integrations)</li>
    </ul>
    <h3 class="text-xl font-bold mb-3">3. User Responsibilities & Prohibited Uses</h3>
    <p>You agree to use the Service only for lawful purposes and in a way that does not infringe the rights of, restrict, or inhibit anyone else's use and enjoyment of the Service. Specifically, you agree not to:</p>
    <ul class="list-disc list-inside space-y-1 mb-4">
        <li><strong>Provide Unlawful Content:</strong> Upload, transmit, or otherwise provide any content for your AI's knowledge base or through your use of the Service that is unlawful, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, libelous, invasive of another's privacy, hateful, or racially, ethnically, or otherwise objectionable.</li>
        <li><strong>Impersonation:</strong> Use the Service to impersonate any person or entity, or falsely state or otherwise misrepresent your affiliation with a person or entity.</li>
        <li><strong>Intellectual Property Infringement:</strong> Upload or use any content (including but not limited to text, images, audio, or video for your AI's appearance or knowledge base) that you do not have the legal right to use or that infringes on the intellectual property rights (copyright, trademark, patent, trade secret) of others.</li>
        <li><strong>Malicious Use:</strong> Transmit any viruses, worms, defects, Trojan horses, or any items of a destructive nature.</li>
        <li><strong>Data Misuse:</strong> Collect or store personal data about other users without their express consent.</li>
        <li><strong>Spamming/Harassment:</strong> Use the AI Digital Twin for unsolicited commercial communication ("spam") or for any form of harassment, intimidation, or bullying.</li>
        <li><strong>Violation of Laws:</strong> Use the Service in any manner that violates any applicable local, national, or international law or regulation.</li>
        <li><strong>Circumvention:</strong> Attempt to interfere with, bypass, or disrupt the integrity or performance of the Service or its related systems or networks.</li>
    </ul>
    <p>We reserve the right to remove any content or terminate accounts that violate these Prohibited Uses without prior notice.</p>
    <h3 class="text-xl font-bold mb-3">4. Intellectual Property</h3>
    <ul class="list-disc list-inside space-y-1 mb-4">
        <li><strong>Your Content:</strong> You retain ownership of any content, including knowledge base data, text, images, and audio/video you upload or create using the Service ("Your Content"). By providing Your Content, you grant Metapresence a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, adapt, publish, translate, create derivative works from, distribute, and display Your Content solely for the purpose of operating, improving, and providing the Service to you.</li>
        <li><strong>Service Intellectual Property:</strong> The Service and its original content (excluding Your Content), features, and functionality are and will remain the exclusive property of Metapresence and its licensors. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of Metapresence.</li>
    </ul>
    <h3 class="text-xl font-bold mb-3">5. Fees and Payment</h3>
    <p>Access to certain features of the Service may require a paid subscription. Details of subscription plans, pricing, and features are available on our website.</p>
    <p>By subscribing to a paid plan, you agree to pay Metapresence the specified fees. All fees are in [Your Currency, e.g., MYR/USD] and are non-refundable unless otherwise stated in your specific agreement or by law.</p>
    <p>Payments are billed in advance on a [e.g., monthly, annual] recurring basis. Your subscription will automatically renew unless you cancel it before the end of the current billing period.</p>
    <p>Metapresence reserves the right to change its fees at any time, upon reasonable prior notice posted on our website or sent to you via email.</p>
    <h3 class="text-xl font-bold mb-3">6. Disclaimer of Warranties</h3>
    <p>Your use of the Service is at your sole risk. The Service is provided on an "AS IS" and "AS AVAILABLE" basis. The Service is provided without warranties of any kind, whether express or implied, including, but not limited to, implied warranties of merchantability, fitness for a particular purpose, non-infringement, or course of performance.</p>
    <p>Metapresence does not warrant that a) the Service will function uninterrupted, secure, or available at any particular time or location; b) any errors or defects will be corrected; c) the Service is free of viruses or other harmful components; or d) the results of using the Service will meet your requirements.</p>
    <h3 class="text-xl font-bold mb-3">7. Limitation of Liability</h3>
    <p>In no event shall Metapresence, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the Service; (ii) any conduct or content of any third party on the Service; (iii) any content obtained from the Service; and (iv) unauthorized access, use or alteration of your transmissions or content, whether based on warranty, contract, tort (including negligence) or any other legal theory, whether or not we have been informed of the possibility of such damage, and even if a remedy set forth herein is found to have failed of its essential purpose.</p>
    <h3 class="text-xl font-bold mb-3">8. Indemnification</h3>
    <p>You agree to defend, indemnify, and hold harmless Metapresence and its licensee and licensors, and their employees, contractors, agents, officers, and directors, from and against any and all claims, damages, obligations, losses, liabilities, costs or debt, and expenses (including but not limited to attorney's fees), resulting from or arising out of a) your use and access of the Service, by you or any person using your account and password; b) a breach of these Terms; or c) content posted by you on the Service.</p>
    <h3 class="text-xl font-bold mb-3">9. Termination</h3>
    <p>We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.</p>
    <p>If you wish to terminate your account, you may simply discontinue using the Service or contact us to formally close your account.</p>
    <p>All provisions of the Terms which by their nature should survive termination shall survive termination, including, without limitation, ownership provisions, warranty disclaimers, indemnity, and limitations of liability.</p>
    <h3 class="text-xl font-bold mb-3">10. Governing Law</h3>
    <p>These Terms shall be governed and construed in accordance with the laws of [Your Country/State, e.g., Malaysia], without regard to its conflict of law provisions.</p>
    <p>Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights. If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of these Terms will remain in effect. These Terms constitute the entire agreement between us regarding our Service, and supersede and replace any prior agreements we might have had between us regarding the Service.</p>
    <h3 class="text-xl font-bold mb-3">11. Changes to These Terms</h3>
    <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.</p>
    <p>By continuing to access or use our Service after any revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, you are no longer authorized to use the Service.</p>
    <h3 class="text-xl font-bold mb-3">12. Contact Us</h3>
    <p>If you have any questions about these Terms, please contact us:</p>
    <ul class="list-disc list-inside space-y-1">
        <li>By email: support@metapresence.my</li>
        <li>By visiting this page on our website: <a href="https://metapresence.my/contact" class="text-purple-500 hover:underline" target="_blank" rel="noopener noreferrer">metapresence.my/contact</a></li>
    </ul>
    `;


    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
            <ThreeDBackground /> {/* Replaced ThreeDScene */}

            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="relative z-10 p-8 bg-card rounded-2xl shadow-xl max-w-md w-full border border-border auth-card-glow"
            >
                <h2 className="text-4xl font-bold text-center text-foreground mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {isLogin ? 'Welcome Back to Metapresence!' : 'Join Metapresence Today!'}
                </h2>
                <p className="text-center text-muted-foreground mb-8">
                    {isLogin ? 'Login to access your powerful AI Digital Twins' : 'Create your account to unlock your digital potential'}
                </p>

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
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
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
                        {!isLogin && <PasswordStrengthIndicator password={password} />}
                    </div>

                    {!isLogin && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-muted-foreground mb-2">Confirm Password</label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    id="confirmPassword"
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
                        </motion.div>
                    )}

                    {!isLogin && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="flex items-center space-x-2"
                        >
                            <input
                                type="checkbox"
                                id="agreeTerms"
                                checked={agreedToTerms}
                                onChange={(e) => setAgreedToTerms(e.target.checked)}
                                className="form-checkbox h-4 w-4 text-purple-600 bg-input border-border rounded focus:ring-purple-500"
                            />
                            <label htmlFor="agreeTerms" className="text-sm text-muted-foreground">
                                I agree to the{' '}
                                <button type="button" onClick={() => setShowPrivacyModal(true)} className="text-purple-500 hover:underline">
                                    Privacy Policy
                                </button>{' '}
                                and{' '}
                                <button type="button" onClick={() => setShowTermsModal(true)} className="text-purple-500 hover:underline">
                                    Terms & Conditions
                                </button>
                                .
                            </label>
                        </motion.div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || (!isLogin && (!agreedToTerms || password !== confirmPassword || password.length === 0 || password.length < 8))}
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
                            <button onClick={() => { setIsLogin(false); setError(''); setPassword(''); setConfirmPassword(''); setAgreedToTerms(false); }} className="text-purple-500 hover:underline font-medium">
                                Sign Up
                            </button>
                            <br />
                            <Link to="/auth/forgot-password" className="text-pink-500 hover:underline font-medium mt-2 block">
                                Forgot Password?
                            </Link>
                        </>
                    ) : (
                        <>
                            Already have an account?{' '}
                            <button onClick={() => { setIsLogin(true); setError(''); setPassword(''); setConfirmPassword(''); setAgreedToTerms(false); }} className="text-purple-500 hover:underline font-medium">
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

            <AnimatePresence>
                {showPricingModal && <PricingModal onClose={() => setShowPricingModal(false)} />}
                {showPrivacyModal && <PolicyModal title="Privacy Policy" content={privacyPolicyContent} onClose={() => setShowPrivacyModal(false)} />}
                {showTermsModal && <PolicyModal title="Terms & Conditions" content={termsConditionsContent} onClose={() => setShowTermsModal(false)} />}
            </AnimatePresence>
        </div>
    );
};

export default AuthPage;