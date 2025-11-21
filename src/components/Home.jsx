"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Play,
  CheckCircle,
  Users,
  MessageSquare,
  Brain,
  Zap,
  ArrowRight,
  Globe,
  Sparkles,
  Layers,
  Video,
  Mic,
  Settings,
  TrendingUp,
  Clock,
  Shield,
} from "lucide-react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import AvatarWidget from "./AvatarWidget";
import ApiSection from "./ApiSection";
import LanguageSection from "./LanguageSection";
import PricingSection from "./PricingSection";
import { useTheme } from "../contexts/ThemeContext";

gsap.registerPlugin(ScrollTrigger);

const Home = () => {
  const { theme } = useTheme();
  const heroRef = useRef(null);
  const featuresRef = useRef([]);

  // GSAP Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".hero-title", {
        opacity: 0,
        y: 80,
        duration: 1,
        ease: "power4.out",
      });

      gsap.from(".hero-subtitle", {
        opacity: 0,
        y: 50,
        duration: 1,
        delay: 0.3,
        ease: "power3.out",
      });

      gsap.from(".hero-cta", {
        opacity: 0,
        y: 30,
        duration: 0.8,
        delay: 0.6,
        ease: "back.out(1.7)",
      });

      featuresRef.current.forEach((feature, i) => {
        if (feature) {
          gsap.from(feature, {
            scrollTrigger: {
              trigger: feature,
              start: "top 85%",
              end: "bottom 20%",
              toggleActions: "play none none reverse",
            },
            opacity: 0,
            y: 80,
            rotation: i % 2 === 0 ? -5 : 5,
            duration: 1,
            ease: "power3.out",
          });
        }
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const features = [
    {
      icon: <MessageSquare className="w-10 h-10" />,
      title: "Conversational AI Studio",
      description:
        "Access your AI-powered platform instantly after signup. Create conversational avatars, generate AI videos, and manage integrations—all from one unified dashboard.",
      gradient: "from-purple-500 to-pink-500",
      image: "/dashboard.png",
    },
    {
      icon: <Mic className="w-10 h-10" />,
      title: "Real-Time Voice Conversations",
      description:
        "Create humanlike conversations with real-time, dynamic voice interactions powered by state-of-the-art AI models.",
      gradient: "from-pink-500 to-red-500",
      image: "/voice.png",
    },
    {
      icon: <Users className="w-10 h-10" />,
      title: "Avatar Management",
      description:
        "Clone voices and create custom AI avatars in minutes. Manage your avatar library and conversation history effortlessly.",
      gradient: "from-blue-500 to-cyan-500",
      image: "/avatars.png",
    },
    {
      icon: <Video className="w-10 h-10" />,
      title: "AI Video Generation",
      description:
        "Produce dynamic videos with your AI avatars from text or audio. Perfect for demos, training content, and customer engagement.",
      gradient: "from-green-500 to-emerald-500",
      image: "/video-gen.png",
    },
    {
      icon: <Settings className="w-10 h-10" />,
      title: "Enterprise Integration",
      description:
        "Connect MetaPresence to your existing tools. Manage API keys and integrate with CRMs, support platforms, and more.",
      gradient: "from-orange-500 to-yellow-500",
      image: "/integration.png",
    },
  ];

  const useCases = [
    {
      title: "AI Sales Agents",
      company: "Enterprise Solutions",
      description:
        "Deploy AI-powered sales agents that handle customer inquiries, product demos, and lead qualification 24/7.",
      image: "/usecase1.png",
      icon: <TrendingUp className="w-6 h-6" />,
    },
    {
      title: "Customer Support",
      company: "Support Automation",
      description:
        "Provide instant, multilingual customer support with AI avatars that understand context and resolve issues efficiently.",
      image: "/usecase2.png",
      icon: <MessageSquare className="w-6 h-6" />,
    },
    {
      title: "Training & Onboarding",
      company: "L&D Solutions",
      description:
        "Accelerate employee onboarding and training with interactive AI tutors that adapt to individual learning styles.",
      image: "/usecase3.png",
      icon: <Brain className="w-6 h-6" />,
    },
  ];

 const avatarShowcase = [
  { 
    name: "Real-Time Conversations", 
    role: "AI-Powered Voice Interactions", 
    description: "Natural conversations with instant responses",
    video: "/video1.mp4"
  },
  { 
    name: "Voice Cloning", 
    role: "Clone Any Voice in Seconds", 
    description: "Replicate voices with stunning accuracy",
    video: "/video2.mp4"
  },
  { 
    name: "Enterprise Ready", 
    role: "Scale Your Operations", 
    description: "Deploy across teams and platforms",
    video: "/video3.mp4"
  }
]



  return (
    <div
      ref={heroRef}
      className={`min-h-screen ${
        theme === "dark" ? "bg-gray-950" : "bg-white"
      }`}
    >
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 px-4">
        <div
          className={`absolute inset-0 ${
            theme === "dark"
              ? "bg-gradient-to-br from-purple-900/20 via-pink-900/20 to-blue-900/20"
              : "bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50"
          }`}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.15),transparent_70%)]"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-600/10 border border-purple-600/20 mb-8"
          >
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-600">
              Powered by Advanced AI
            </span>
          </motion.div>

          <h1 className="hero-title text-6xl md:text-7xl lg:text-8xl font-black mb-8 leading-tight">
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              Be Everywhere.
            </span>
            <br />
            <span
              className={`${theme === "dark" ? "text-white" : "text-gray-900"}`}
            >
              At The Same Time.
            </span>
          </h1>

          <p
            className={`hero-subtitle text-xl md:text-2xl lg:text-3xl mb-12 max-w-4xl mx-auto ${
              theme === "dark" ? "text-gray-300" : "text-gray-600"
            }`}
          >
            MetaPresence helps sales, HR, and customer success teams automate
            demos, onboarding, and support—using AI assistants trained on your
            knowledge and brand voice.
          </p>

          <div className="hero-cta flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <motion.a
              href="/auth"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group relative px-10 py-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-bold text-lg shadow-2xl hover:shadow-purple-500/50 transition-all overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-3">
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </motion.a>

            <motion.a
              href="#video-demo"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-10 py-5 border-2 rounded-2xl font-bold text-lg flex items-center gap-3 ${
                theme === "dark"
                  ? "border-purple-500 text-purple-400 hover:bg-purple-500/10"
                  : "border-purple-600 text-purple-600 hover:bg-purple-50"
              } transition-all`}
            >
              <Play className="w-6 h-6" />
              Watch Demo Video
            </motion.a>
          </div>

          {/* Trusted By Marquee */}
          <div className="mt-16">
            <p
              className={`text-sm mb-8 ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Trusted by innovative teams worldwide
            </p>
            <CompanyMarquee theme={theme} />
          </div>
        </div>
      </section>

      {/* Avatar Showcase - Unique Overlapping Grid */}
      <section
        id="avatars"
        className={`py-32 px-4 ${
          theme === "dark" ? "bg-gray-900" : "bg-gray-50"
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Your AI Team
              </span>
            </h2>
            <p
              className={`text-xl ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Photorealistic AI avatars ready to work for you
            </p>
          </motion.div>

          <OverlappingAvatarGrid avatars={avatarShowcase} theme={theme} />
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className={`py-32 px-4 ${theme === "dark" ? "bg-black" : "bg-white"}`}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Everything you need
              </span>
            </h2>
            <p
              className={`text-xl ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Create, customize, and deploy your AI avatar
            </p>
          </motion.div>

          <div className="space-y-32">
            {features.map((feature, index) => (
              <div
                key={index}
                ref={(el) => (featuresRef.current[index] = el)}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
                  index % 2 === 1 ? "lg:flex-row-reverse" : ""
                }`}
              >
                <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                  <div
                    className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.gradient} mb-6`}
                  >
                    <div className="text-white">{feature.icon}</div>
                  </div>
                  <h3
                    className={`text-4xl font-bold mb-6 ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {feature.title}
                  </h3>
                  <p
                    className={`text-xl mb-8 ${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {feature.description}
                  </p>
                  <motion.a
                    href="/auth"
                    whileHover={{ x: 5 }}
                    className="inline-flex items-center gap-2 text-lg font-semibold text-purple-600 hover:text-purple-700 transition-colors"
                  >
                    Learn More
                    <ArrowRight className="w-5 h-5" />
                  </motion.a>
                </div>
                <div className={index % 2 === 1 ? "lg:order-1" : ""}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className={`relative rounded-2xl overflow-hidden ${
                      theme === "dark"
                        ? "bg-gray-800 border border-gray-700"
                        : "bg-gray-50 shadow-2xl"
                    } aspect-video`}
                  >
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = `https://via.placeholder.com/800x450/a855f7/ffffff?text=${encodeURIComponent(
                          feature.title
                        )}`;
                      }}
                    />
                  </motion.div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section
        id="use-cases"
        className={`py-32 px-4 ${
          theme === "dark" ? "bg-gray-900" : "bg-gray-50"
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              <span
                className={theme === "dark" ? "text-white" : "text-gray-900"}
              >
                How we empower teams
              </span>
            </h2>
            <p
              className={`text-xl ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Transform your business operations with AI
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {useCases.map((useCase, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                whileHover={{ y: -10 }}
                className={`relative rounded-2xl overflow-hidden ${
                  theme === "dark"
                    ? "bg-gray-800 border border-gray-700"
                    : "bg-white shadow-xl"
                }`}
              >
                <div className="relative h-64">
                  <img
                    src={useCase.image}
                    alt={useCase.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = `https://via.placeholder.com/400x256/a855f7/ffffff?text=${encodeURIComponent(
                        useCase.title
                      )}`;
                    }}
                  />
                  <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-gray-900">
                    {useCase.company}
                  </div>
                </div>
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-purple-600/10 text-purple-600">
                      {useCase.icon}
                    </div>
                    <h3
                      className={`text-xl font-bold ${
                        theme === "dark" ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {useCase.title}
                    </h3>
                  </div>
                  <p
                    className={`text-sm ${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {useCase.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Language Section */}
      <LanguageSection />

      {/* API Section */}
      <ApiSection />

      {/* Pricing Section */}
      <PricingSection />

      {/* CTA Section */}
      <section
        className={`py-32 px-4 ${
          theme === "dark"
            ? "bg-gradient-to-br from-purple-900/20 to-pink-900/20"
            : "bg-gradient-to-br from-purple-50 to-pink-50"
        }`}
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-8">
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Ready to transform your presence?
              </span>
            </h2>
            <p
              className={`text-xl mb-12 ${
                theme === "dark" ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Join innovative teams already using MetaPresence to scale their
              operations
            </p>
            <motion.a
              href="/auth"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-3 px-12 py-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-bold text-xl shadow-2xl hover:shadow-purple-500/50 transition-all"
            >
              Start Building Now
              <ArrowRight className="w-6 h-6" />
            </motion.a>
          </motion.div>
        </div>
      </section>

      <AvatarWidget />
      <Footer />
    </div>
  );
};

// Company Marquee Component
const CompanyMarquee = ({ theme }) => {
  const companies = [
    { name: "AWS", logo: "/aws.png" },
    { name: "Google Cloud", logo: "/gcp.png" },
    { name: "Notion", logo: "/notion.png" },
    { name: "Soloscale", logo: "/soloscale.png" },
    { name: "Confluent", logo: "/confluent.png" },
    { name: "Intercom", logo: "/intercom.png" },
    { name: "Nalain", logo: "/nalain.png" },
    { name: "Clona", logo: "/clona.png" },
  ];

  return (
    <div className="relative w-full overflow-hidden py-12">
      {/* Gradient overlays for smooth fade effect */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-40 z-10 ${
          theme === "dark"
            ? "bg-gradient-to-r from-gray-950 to-transparent"
            : "bg-gradient-to-r from-white to-transparent"
        }`}
      ></div>
      <div
        className={`absolute right-0 top-0 bottom-0 w-40 z-10 ${
          theme === "dark"
            ? "bg-gradient-to-l from-gray-950 to-transparent"
            : "bg-gradient-to-l from-white to-transparent"
        }`}
      ></div>

      {/* Marquee container */}
      <div className="flex animate-marquee">
        {/* Duplicate the array 3 times for seamless loop */}
        {[...companies, ...companies, ...companies].map((company, index) => (
          <div
            key={`${company.name}-${index}`}
            className="flex items-center justify-center mx-10 flex-shrink-0"
          >
            <img
              src={company.logo}
              alt={company.name}
              className={`h-20 w-auto object-contain transition-all duration-300 ${
                theme === "dark"
                  ? "opacity-80 hover:opacity-100 brightness-90 hover:brightness-110"
                  : "opacity-70 hover:opacity-100 brightness-95 hover:brightness-100"
              }`}
              style={{
                maxWidth: "180px",
                minWidth: "150px",
                filter: theme === "dark" ? "invert(0.9)" : "none",
              }}
              onError={(e) => {
                console.error(`Failed to load logo: ${company.logo}`);
                e.target.style.display = "none";
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};


// Overlapping Avatar Grid Component
const OverlappingAvatarGrid = ({ avatars, theme }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const videoRefs = useRef([]);

  const handleMouseEnter = (index) => {
    setHoveredIndex(index);
    if (videoRefs.current[index]) {
      videoRefs.current[index].play();
    }
  };

  const handleMouseLeave = (index) => {
    setHoveredIndex(null);
    if (videoRefs.current[index]) {
      videoRefs.current[index].pause();
      videoRefs.current[index].currentTime = 0;
    }
  };

  return (
    <div className="relative h-[700px] max-w-7xl mx-auto">
      {avatars.map((avatar, index) => {
        const positions = [
          { left: "3%", top: "45%", rotate: "-3deg" },
          { left: "33%", top: "25%", rotate: "2deg" },
          { left: "63%", top: "5%", rotate: "-2deg" },
        ];

        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.2 }}
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={() => handleMouseLeave(index)}
            className="absolute w-[450px] cursor-pointer"
            style={{
              left: positions[index].left,
              top: positions[index].top,
              zIndex: hoveredIndex === index ? 50 : 10 - index,
              transform:
                hoveredIndex === index
                  ? "scale(1.12) rotate(0deg)"
                  : `rotate(${positions[index].rotate})`,
              transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          >
            <div
              className={`relative rounded-2xl overflow-hidden shadow-2xl ${
                theme === "dark"
                  ? "bg-gray-800 border-2 border-gray-700"
                  : "bg-white border-2 border-gray-200"
              } ${hoveredIndex === index ? "shadow-purple-500/50 ring-2 ring-purple-500" : ""}`}
            >
              {/* Horizontal aspect ratio container */}
              <div className="relative aspect-[16/10] bg-gray-900">
                <video
                  ref={(el) => (videoRefs.current[index] = el)}
                  src={avatar.video}
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error(`Failed to load video: ${avatar.video}`)
                    e.target.src = `https://via.placeholder.com/450x281/a855f7/ffffff?text=${encodeURIComponent(
                      avatar.name
                    )}`;
                  }}
                />
                
                {/* Gradient overlay with text */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none">
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <div className="space-y-1">
                      <h3 className="text-white font-bold text-lg tracking-tight drop-shadow-lg">
                        {avatar.name}
                      </h3>
                      <p className="text-white/70 text-xs font-medium drop-shadow-md">
                        {avatar.role}
                      </p>
                      {avatar.description && (
                        <p className="text-white/60 text-xs leading-relaxed drop-shadow-md">
                          {avatar.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Play button overlay (only when not hovering) */}
                {hoveredIndex !== index && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="w-30 h-30 rounded-full bg-purple-600/40 backdrop-blur-sm flex items-center justify-center shadow-xl border-2 border-white/30"
                    >
                      <Play className="w-9 h-9 text-white ml-1" fill="white" fillOpacity="0.9" />
                    </motion.div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};


export default Home;
