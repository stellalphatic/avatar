import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, useScroll, AnimatePresence } from 'framer-motion';
import { PricingModal } from './PricingModal';
import { BackgroundBeams } from './ui/BackgroundBeams';
import { SparklesCore } from './ui/SparklesCore';
import { CardContainer, CardBody, CardItem } from './ui/3DCard';
import { TextGenerateEffect } from './ui/TextGenerateEffect';
import {
  Play,
  Video,
  CheckCircle,
  Users,
  MessageSquare,
  Brain,
  Webhook,
  Globe,
  Star,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';
import { useTheme } from '../contexts/ThemeContext';

// Extracted PricingPlans into its own component for better organization
const PricingPlans = ({ setShowPricingModal }) => {
  const plans = [
    {
      title: "Creator",
      description: "For one person",
      price: "$24/month",
      features: [
        "Unlimited videos",
        "Videos up to 30-mins",
        "1080p video export",
        "Fast video processing",
        "1 Custom Video Avatar"
      ],
      isPopular: true
    },
    {
      title: "Team",
      description: "For you and your team",
      price: "$120/month",
      features: [
        "Everything in Creator",
        "2 seats included",
        "2 Custom Video Avatars",
        "4k video export",
        "Faster video processing"
      ],
      isPopular: false
    },
    {
      title: "Enterprise",
      description: "For your organization",
      price: "Let's talk",
      features: [
        "Everything in Team",
        "Everything in Team",
        "Custom integrations",
        "Dedicated account manager",
        "SLA & Uptime guarantees",
        "No video duration max"
      ],
      stripePriceId: null, // Ensure this is explicitly null for Enterprise
      isPopular: false
    }
  ];

  const { theme } = useTheme(); // Use theme for card styling

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
      {plans.map((plan, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 40 }} // Adjusted for overall smaller scale
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, delay: index * 0.08 }} // Slightly faster transition
          whileHover={{ scale: 1.02, boxShadow: theme === 'light' ? '0 10px 25px rgba(0,0,0,0.1)' : '0 10px 25px rgba(168, 85, 247, 0.25)' }} // Adjusted shadow
          className={`relative rounded-xl p-5 border transition-all duration-200 // Adjusted padding
            ${theme === 'light' ? 'bg-white border-gray-200 hover:border-purple-300' : 'bg-card border-border hover:border-purple-500/50'}`}
        >
          {plan.isPopular && (
            <div className="absolute -top-3 right-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              Most Popular 🔥
            </div>
          )}
          <div className="text-center">
            <h4 className={`text-xs mb-1 ${theme === 'light' ? 'text-gray-600' : 'text-muted-foreground'}`}>{plan.description}</h4> {/* Reduced */}
            <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent"> {/* Reduced */}
              {plan.title}
            </h3>
            <p className={`text-3xl font-extrabold mb-5 ${theme === 'light' ? 'text-gray-900' : 'text-foreground'}`}>{plan.price}</p> {/* Reduced */}

            <ul className={`text-left mb-5 space-y-2 ${theme === 'light' ? 'text-gray-700' : 'text-muted-foreground'}`}> {/* Reduced margin */}
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-2 text-sm"> {/* Reduced */}
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  {feature}
                </li>
              ))}
            </ul>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowPricingModal(true)}
              className={`w-full px-5 py-2 rounded-lg font-semibold transition-all duration-200 text-base ${ // Reduced padding/font size
                plan.title === "Enterprise"
                  ? `bg-transparent border ${theme === 'light' ? 'border-purple-500 text-purple-600 hover:bg-purple-100' : 'border-purple-600 text-purple-500 hover:bg-purple-600 hover:text-white'}`
                  : "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
              }`}
            >
              {plan.title === "Enterprise" ? "Contact Sales" : "Get Started"}
            </motion.button>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// Main Home Component
const Home = () => {
  const [showPricingModal, setShowPricingModal] = useState(false);
  const { theme } = useTheme();

  // Mouse position for hero section parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Particle colors for SparklesCore, adjusted for better visibility
  const [sparkleColors, setSparkleColors] = useState([]);

  useEffect(() => {
    if (theme === 'light') {
      // Darker, more visible colors for light theme, plus some white
      setSparkleColors(["#6B21A8", "#9333EA", "#C026D3", "#DB2777", "#F43F5E", "#FFFFFF", "#A78BFA"]);
    } else {
      // Lighter, vibrant colors for dark theme, including white and gold
      setSparkleColors(["#A855F7", "#D946EF", "#C084FC", "#F472B6", "#FF0077", "#FFFFFF", "#FFD700", "#FFFACD"]);
    }
  }, [theme]);

  // Use a state to track screen width for conditional rendering/styles
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 768); // md breakpoint in Tailwind
    };

    // Set initial value
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  const handleMouseMoveHero = (event) => {
    if (isLargeScreen) {
      const rect = event.currentTarget.getBoundingClientRect();
      mouseX.set(event.clientX - rect.left);
      mouseY.set(event.clientY - rect.top);
    }
  };

  const handleMouseLeaveHero = () => {
    if (isLargeScreen) {
      mouseX.set(0);
      mouseY.set(0);
    }
  };

  // Parallax values for hero text - always define useTransform
  const heroTextTranslateX = useTransform(mouseX, [0, window.innerWidth], [-30, 30]);
  const heroTextTranslateY = useTransform(mouseY, [0, window.innerHeight], [-15, 15]);

  const heroParagraphTranslateX = useTransform(mouseX, [0, window.innerWidth], [15, -15]);
  const heroParagraphTranslateY = useTransform(mouseY, [0, window.innerHeight], [7, -7]);


  // Refs for scroll animations
  const aboutRef = useRef(null);
  const featuresRef = useRef(null); // One ref for all features if they scroll together
  const testimonialsRef = useRef(null);
  const pricingRef = useRef(null);
  const footerRef = useRef(null); // Ref for footer to add sparkles

  const { scrollYProgress: aboutScroll } = useScroll({ target: aboutRef, offset: ["start end", "end start"] });
  const { scrollYProgress: featuresScroll } = useScroll({ target: featuresRef, offset: ["start end", "end start"] });
  const { scrollYProgress: testimonialsScroll } = useScroll({ target: testimonialsRef, offset: ["start end", "end start"] });
  const { scrollYProgress: pricingScroll } = useScroll({ target: pricingRef, offset: ["start end", "end start"] });

  // Example: Parallax for background element in About Us
  const aboutImageY = useTransform(aboutScroll, [0, 1], [-100, 100]);

  const detailedFeatures = [
    {
      id: 'virtual-presence',
      title: 'Virtual Presence',
      subtitle: 'Be everywhere at once',
      description: 'Deploy your AI avatar in interviews, meetings, and presentations. Maintain professional presence even when you\'re not physically available.',
      longDescription: 'Transform how you handle professional commitments with AI-powered virtual presence. Your avatar can attend multiple meetings simultaneously, conduct interviews with natural conversation flow, and deliver presentations with your exact mannerisms and speaking style.',
      icon: <Users className="w-10 h-10" />, // Reduced icon size
      gradient: 'from-blue-500 to-cyan-500',
      features: [
        'Real-time meeting participation',
        'Natural conversation flow',
        'Professional appearance',
        'Multi-meeting capability',
        'Calendar integration',
        'Custom backgrounds'
      ],
      image: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    {
      id: 'conversation-recording',
      title: 'Smart Conversation Recording',
      subtitle: 'Never miss important details',
      description: 'Automatically record, transcribe, and summarize your conversations. Get intelligent insights delivered directly to your email.',
      longDescription: 'Advanced AI processes your conversations in real-time, extracting key insights, action items, and important decisions. Receive comprehensive summaries with sentiment analysis and follow-up recommendations.',
      icon: <MessageSquare className="w-10 h-10" />, // Reduced icon size
      gradient: 'from-purple-500 to-pink-500',
      features: [
        'Automatic transcription',
        'Intelligent summarization',
        'Email delivery',
        'Action item extraction',
        'Sentiment analysis',
        'Multi-language support'
      ],
      image: 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    {
      id: 'voice-cloning',
      title: 'Voice & Personality Cloning',
      subtitle: 'Your digital twin, perfected',
      description: 'Create perfect digital replicas with advanced voice synthesis and personality modeling. Your avatar thinks and speaks like you.',
      longDescription: 'Leverage state-of-the-art neural networks to analyze your speech patterns, vocal characteristics, and personality traits. With just **10 seconds of audio**, create an indistinguishable digital version of yourself that can engage in natural, emotionally expressive conversations. Perfect for personal branding, content creation, and professional communication.',
      icon: <Brain className="w-10 h-10" />, // Reduced icon size
      gradient: 'from-green-500 to-emerald-500',
      features: [
        'Voice pattern analysis (10s audio)',
        'Personality modeling & expression',
        'Natural speech synthesis',
        'Emotional range & nuance',
        'Custom training data',
        'Real-time adaptation'
      ],
      image: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    {
      id: 'enterprise-automation',
      title: 'Enterprise Automation',
      subtitle: 'Scale your business',
      description: 'Build custom avatars for specific business tasks. Integrate seamlessly with webhooks, APIs, and existing workflows.',
      longDescription: 'Enterprise-grade automation tools allow you to deploy specialized avatars for customer service, sales, training, and more. Full API access enables seamless integration with your existing business systems.',
      icon: <Webhook className="w-10 h-10" />, // Reduced icon size
      gradient: 'from-orange-500 to-red-500',
      features: [
        'Custom avatar training',
        'Webhook integrations',
        'API access',
        'Workflow automation',
        'Team collaboration',
        'Analytics dashboard'
      ],
      image: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800'
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "CEO, TechStart",
      content: "This AI avatar technology has revolutionized our client meetings. I can be present in multiple meetings simultaneously.",
      rating: 5
    },
    {
      name: "Michael Rodriguez",
      role: "Marketing Director",
      content: "The voice cloning is incredibly accurate. Our customers can't tell the difference between me and my avatar.",
      rating: 5
    },
    {
      name: "Emily Johnson",
      role: "HR Manager",
      content: "Perfect for conducting initial interviews. The conversation summaries save us hours of work every week.",
      rating: 5
    }
  ];

  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);
  const autoPlayIntervalRef = useRef(null);

  const startAutoPlay = () => {
    autoPlayIntervalRef.current = setInterval(() => {
      setCurrentTestimonialIndex((prevIndex) =>
        (prevIndex + 1) % testimonials.length
      );
    }, 4000); 
  };

  const resetAutoPlay = () => {
    clearInterval(autoPlayIntervalRef.current);
    startAutoPlay();
  };

  useEffect(() => {
    startAutoPlay();
    return () => clearInterval(autoPlayIntervalRef.current); // Cleanup on unmount
  }, [testimonials.length]); // Restart if testimonials array changes (unlikely here)


  const handleNextTestimonial = () => {
    setCurrentTestimonialIndex((prevIndex) =>
      (prevIndex + 1) % testimonials.length
    );
    resetAutoPlay(); // Reset timer on manual interaction
  };

  const handlePrevTestimonial = () => {
    setCurrentTestimonialIndex((prevIndex) =>
      (prevIndex - 1 + testimonials.length) % testimonials.length
    );
    resetAutoPlay(); // Reset timer on manual interaction
  };

  return (
    <div className={`min-h-screen ${theme === 'light' ? 'bg-white text-gray-900' : 'bg-background'} overflow-x-hidden relative`}>

      <Navbar />

      {/* Hero Section */}
      <section
        className="relative min-h-screen flex items-center justify-center overflow-hidden py-20"
        onMouseMove={handleMouseMoveHero}
        onMouseLeave={handleMouseLeaveHero}
      >
        <BackgroundBeams className="absolute inset-0 z-10" />
        <div className="absolute inset-0 w-full h-full z-20">
          <SparklesCore
            id="tsparticlesfullpage"
            background="transparent"
            minSize={0.8}
            maxSize={2.0}
            particleDensity={500} // Ensuring a lot of particles
            className="w-full h-full"
            particleColor={sparkleColors}
          />
        </div>

        <div className="relative z-30 text-center px-4 max-w-6xl mx-auto">
          {/* Apply parallax and more pronounced hover to hero text */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            // Conditionally apply parallax style based on screen width
            style={isLargeScreen ? { x: heroTextTranslateX, y: heroTextTranslateY } : {}}
            whileHover={isLargeScreen ? { scale: 1.05, rotateX: 5, rotateY: 5, transition: { duration: 0.3 } } : {}}
            className="relative"
          >
            <TextGenerateEffect
              words="Create Your Digital Twin with AI"
              className={`
                text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-[7rem] 2xl:text-[8rem] font-extrabold mb-4 // Adjusted sizes for better responsiveness
                bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent
                inline-block leading-tight md:leading-tight lg:leading-tight`}
            />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className={`text-sm md:text-base lg:text-lg mb-8 max-w-3xl mx-auto ${theme === 'light' ? 'text-gray-700' : 'text-muted-foreground'}`} // Further reduced size
            // Conditionally apply parallax style based on screen width
            style={isLargeScreen ? { x: heroParagraphTranslateX, y: heroParagraphTranslateY } : {}}
            whileHover={isLargeScreen ? { scale: 1.02, transition: { duration: 0.2 } } : {}} // Added hover effect to paragraph
          >
            Transform your presence with cutting-edge AI avatars. Clone your voice, replicate your personality,
            and be everywhere at once with our revolutionary platform.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-3 justify-center items-center" // Reduced gap
          >
            <motion.button
              whileHover={{ scale: 1.08, boxShadow: theme === 'light' ? '0 10px 25px rgba(168, 85, 247, 0.3)' : "0 10px 25px rgba(168, 85, 247, 0.6)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { /* Implement direct signup or specific modal */ }}
              className="px-5 md:px-7 py-2 md:py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold text-sm md:text-base hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center gap-2" // Reduced padding/font size
            >
              <Play className="w-4 h-4 md:w-5 md:h-5" />
              Start Creating Free
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.08, boxShadow: theme === 'light' ? '0 10px 25px rgba(0, 0, 0, 0.15)' : "0 10px 25px rgba(0, 0, 0, 0.3)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { /* Open demo video modal */ }}
              className={`px-5 md:px-7 py-2 md:py-3 border rounded-xl font-semibold text-sm md:text-base transition-all duration-200 flex items-center gap-2 ${theme === 'light' ? 'text-gray-700 bg-white border-gray-300 hover:bg-gray-100' : 'text-foreground border-border hover:bg-accent'}`} // Reduced padding/font size
            >
              <Video className="w-4 h-4 md:w-5 md:h-5" />
              Watch Demo
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" ref={aboutRef} className={`py-14 md:py-20 px-4 ${theme === 'light' ? 'bg-white' : 'bg-muted/30'}`}> {/* Reduced padding */}
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }} // Adjusted for overall smaller scale
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7 }}
            className="text-center mb-10 md:mb-16" // Reduced margin
          >
            <h2 className={`text-2xl md:text-3xl lg:text-4xl font-bold mb-4 ${theme === 'light' ? 'text-gray-900' : ''}`}> {/* Reduced */}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                About Our Vision
              </span>
            </h2>
            <p className={`text-base md:text-lg max-w-4xl mx-auto ${theme === 'light' ? 'text-gray-700' : 'text-muted-foreground'}`}> {/* Reduced */}
              We're pioneering the future of human-AI interaction, creating technology that doesn't replace humans
              but amplifies their presence and capabilities across digital spaces.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12 items-center mb-14"> {/* Reduced gap/margin */}
            <motion.div
              initial={{ opacity: 0, x: -80 }} // Adjusted for overall smaller scale
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              className="order-2 lg:order-1 relative"
            >
              <CardContainer className="inter-var w-full">
                <CardBody className={`relative group/card w-full h-auto rounded-xl p-5 border ${theme === 'light' ? 'bg-white hover:shadow-lg border-gray-200' : 'dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1]'}`}> {/* Adjusted padding */}
                  <CardItem translateZ="100" className="w-full">
                    <motion.img
                      src="https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800"
                      alt="Global presence concept"
                      className="w-full h-60 md:h-72 object-cover rounded-lg" // Reduced height
                      style={{ y: aboutImageY }}
                    />
                  </CardItem>
                  <CardItem translateZ="50" className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg" />
                </CardBody>
              </CardContainer>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 80 }} // Adjusted for overall smaller scale
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              className="space-y-5 order-1 lg:order-2" // Reduced space-y
            >
              <h3 className={`text-xl md:text-2xl font-bold ${theme === 'light' ? 'text-gray-900' : ''}`}>Redefining Digital Presence</h3> {/* Reduced */}
              <p className={`text-sm md:text-base ${theme === 'light' ? 'text-gray-700' : 'text-muted-foreground'}`}> {/* Reduced */}
                Our mission is to break the barriers of physical presence. Whether you're a CEO managing global teams,
                a content creator reaching worldwide audiences, or a professional juggling multiple commitments,
                our AI avatars ensure you're always present where it matters most.
              </p>
              <div className="space-y-3"> {/* Reduced space-y */}
                {[
                  "Advanced neural networks for realistic avatar generation",
                  "Proprietary voice synthesis technology",
                  "Real-time conversation processing",
                  "Enterprise-grade security and privacy"
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm"> {/* Reduced text size */}
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" /> {/* Reduced icon size */}
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Detailed Features Sections */}
      {detailedFeatures.map((feature, index) => (
        <section
          key={feature.id}
          ref={index === 0 ? featuresRef : null}
          className={`relative py-14 md:py-20 px-4 ${index % 2 === 1 ? (theme === 'light' ? 'bg-white' : 'bg-muted/30') : (theme === 'light' ? 'bg-gray-50' : '')}`}> {/* Reduced padding */}
          {/* Add Sparkles to one of the feature sections, for example, the "Voice & Personality Cloning" section */}
          {feature.id === 'voice-cloning' && (
            <div className="absolute inset-0 w-full h-full z-0 opacity-40">
              <SparklesCore
                id={`sparkles-feature-${feature.id}`}
                background="transparent"
                minSize={0.6}
                maxSize={1.5}
                particleDensity={150}
                className="w-full h-full"
                particleColor={sparkleColors}
              />
            </div>
          )}
          <div className="max-w-7xl mx-auto relative z-10">
            <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12 items-center ${index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''}`}> {/* Reduced gap */}
              {/* Content */}
              <motion.div
                initial={{ opacity: 0, x: index % 2 === 0 ? -70 : 70 }} // Adjusted for overall smaller scale
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.9, ease: "easeOut" }}
                className={`space-y-5 ${index % 2 === 1 ? 'lg:col-start-2' : ''}`} // Reduced space-y
              >
                <motion.div
                  initial={{ rotate: 0 }}
                  whileInView={{ rotate: 360 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 1.2, ease: "easeOut", delay: 0.15 }} // Slightly faster spin
                  className={`w-14 h-14 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center text-white mb-5`} // Reduced size/margin
                >
                  {feature.icon}
                </motion.div>

                <div>
                  <h3 className={`text-2xl md:text-3xl font-bold mb-2 ${theme === 'light' ? 'text-gray-900' : ''}`}>{feature.title}</h3> {/* Reduced */}
                  <p className={`text-base md:text-lg text-purple-600 mb-3 ${theme === 'light' ? 'dark:text-purple-400' : 'dark:text-purple-400'}`}>{feature.subtitle}</p> {/* Reduced */}
                  <p className={`text-sm md:text-base mb-5 ${theme === 'light' ? 'text-gray-700' : 'text-muted-foreground'}`}>{feature.longDescription}</p> {/* Reduced */}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2"> {/* Reduced gap */}
                  {feature.features.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm"> {/* Reduced text size */}
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <motion.a
                  href="/auth"
                  whileHover={{ scale: 1.07, boxShadow: `0 8px 15px ${feature.gradient.replace('from-', '').replace('to-', '')}30` }} // Adjusted shadow
                  whileTap={{ scale: 0.95 }}
                  className={`inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r ${feature.gradient} text-white rounded-lg hover:shadow-lg transition-all duration-200 text-sm`} // Reduced padding/font size
                >
                  Try {feature.title} <ArrowRight className="w-4 h-4" />
                </motion.a>
              </motion.div>

              {/* Image/Visual - Using CardContainer for existing 3D effect */}
              <motion.div
                initial={{ opacity: 0, x: index % 2 === 0 ? 70 : -70 }} // Adjusted for overall smaller scale
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.9, ease: "easeOut" }}
                className={index % 2 === 1 ? 'lg:col-start-1' : ''}
              >
                <CardContainer className="inter-var w-full">
                  <CardBody className={`relative group/card w-full h-auto rounded-xl p-5 border ${theme === 'light' ? 'bg-white hover:shadow-lg border-gray-200' : 'dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1]'}`}> {/* Adjusted padding */}
                    <CardItem translateZ="100" className="w-full">
                      <img
                        src={feature.image}
                        alt={feature.title}
                        className="w-full h-60 md:h-72 object-cover rounded-lg" // Reduced height
                      />
                    </CardItem>
                    <CardItem translateZ="50" className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg" />
                  </CardBody>
                </CardContainer>
              </motion.div>
            </div>
          </div>
        </section>
      ))}

      {/* Testimonials Section */}
      <section id="testimonials" ref={testimonialsRef} className={`py-14 md:py-20 px-4 ${theme === 'light' ? 'bg-white' : 'bg-muted/30'}`}> {/* Reduced padding */}
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }} // Adjusted for overall smaller scale
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7 }}
            className="text-center mb-10 md:mb-14" // Reduced margin
          >
            <h2 className={`text-2xl md:text-3xl lg:text-4xl font-bold mb-4 ${theme === 'light' ? 'text-gray-900' : ''}`}> {/* Reduced */}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Trusted by Professionals
              </span>
            </h2>
            <p className={`text-base md:text-lg max-w-3xl mx-auto ${theme === 'light' ? 'text-gray-700' : 'text-muted-foreground'}`}> {/* Reduced */}
              See how industry leaders are transforming their workflow with AI avatars
            </p>
          </motion.div>

          <div className="relative flex items-center justify-center">
            <motion.button
              onClick={handlePrevTestimonial}
              className={`absolute -left-4 sm:left-0 z-20 p-2 rounded-full bg-card/80 backdrop-blur-sm border border-border ${theme === 'light' ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-400 hover:bg-gray-700'} transition-colors duration-200`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-6 h-6" />
            </motion.button>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentTestimonialIndex} // Key for AnimatePresence to detect change
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="w-full max-w-xl mx-auto" // Center the testimonial
              >
                <CardContainer className="inter-var">
                  <CardBody className={`relative group/card w-full h-auto rounded-xl p-5 border ${theme === 'light' ? 'bg-white hover:shadow-lg border-gray-200' : 'dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1]'}`}>
                    <CardItem translateZ="50" className="flex mb-3">
                      {[...Array(testimonials[currentTestimonialIndex].rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </CardItem>
                    <CardItem
                      translateZ="60"
                      className={`mb-3 italic text-xs md:text-sm ${theme === 'light' ? 'text-gray-700' : 'text-muted-foreground'}`}
                    >
                      "{testimonials[currentTestimonialIndex].content}"
                    </CardItem>
                    <CardItem translateZ="40">
                      <div>
                        <p className={`font-semibold text-sm ${theme === 'light' ? 'text-gray-900' : ''}`}>{testimonials[currentTestimonialIndex].name}</p>
                        <p className={`text-xs ${theme === 'light' ? 'text-gray-700' : 'text-muted-foreground'}`}>{testimonials[currentTestimonialIndex].role}</p>
                      </div>
                    </CardItem>
                  </CardBody>
                </CardContainer>
              </motion.div>
            </AnimatePresence>

            <motion.button
              onClick={handleNextTestimonial}
              className={`absolute -right-4 sm:right-0 z-20 p-2 rounded-full bg-card/80 backdrop-blur-sm border border-border ${theme === 'light' ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-400 hover:bg-gray-700'} transition-colors duration-200`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-6 h-6" />
            </motion.button>
          </div>

          {/* Dot indicators */}
          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentTestimonialIndex(index);
                  resetAutoPlay(); // Reset timer on manual dot interaction
                }}
                className={`w-2.5 h-2.5 rounded-full transition-colors duration-200 ${
                  index === currentTestimonialIndex
                    ? 'bg-purple-600 scale-125'
                    : 'bg-gray-400/50 hover:bg-gray-500'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>

        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" ref={pricingRef} className={`py-14 md:py-20 px-4 ${theme === 'light' ? 'bg-gray-50' : 'bg-muted/30'}`}> {/* Reduced padding */}
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }} // Adjusted for overall smaller scale
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7 }}
            className="text-center mb-10 md:mb-14" // Reduced margin
          >
            <h2 className={`text-2xl md:text-3xl lg:text-4xl font-bold mb-4 ${theme === 'light' ? 'text-gray-900' : ''}`}> {/* Reduced */}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Choose Your Plan
              </span>
            </h2>
            <p className={`text-base md:text-lg max-w-3xl mx-auto ${theme === 'light' ? 'text-gray-700' : 'text-muted-foreground'}`}> {/* Reduced */}
              Select the perfect plan for your digital transformation needs
            </p>
          </motion.div>

          <PricingPlans setShowPricingModal={setShowPricingModal} />
        </div>
      </section>

      <Footer />

      {showPricingModal && (
        <PricingModal onClose={() => setShowPricingModal(false)} />
      )}
    </div>
  );
};

export default Home;
