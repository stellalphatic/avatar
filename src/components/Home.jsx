import React from 'react';
import { motion } from 'framer-motion';
import { BackgroundBeams } from './ui/BackgroundBeams';
import { SparklesCore } from './ui/SparklesCore';
import { HoverEffect } from './ui/HoverEffect';
import { Play, Mic, Video, Copy, Sparkles, Zap, Shield } from 'lucide-react';
import Navbar from './Navbar';

const Home = () => {
  const subscriptionPlans = [
    {
      title: "Free Plan",
      description: "Perfect for getting started with AI avatar generation",
      price: "$0/month",
      features: [
        "Lorem ipsum dolor sit amet",
        "Consectetur adipiscing elit",
        "Sed do eiusmod tempor",
        "Incididunt ut labore",
        "Dolore magna aliqua"
      ]
    },
    {
      title: "Pro Plan",
      description: "Advanced features for professional content creators",
      price: "$10/month",
      features: [
        "Lorem ipsum dolor sit amet",
        "Consectetur adipiscing elit", 
        "Sed do eiusmod tempor",
        "Incididunt ut labore",
        "Dolore magna aliqua",
        "Ut enim ad minim veniam",
        "Quis nostrud exercitation"
      ]
    },
    {
      title: "Enterprise",
      description: "Full-featured solution for businesses and teams",
      price: "$20/month",
      features: [
        "Lorem ipsum dolor sit amet",
        "Consectetur adipiscing elit",
        "Sed do eiusmod tempor", 
        "Incididunt ut labore",
        "Dolore magna aliqua",
        "Ut enim ad minim veniam",
        "Quis nostrud exercitation",
        "Ullamco laboris nisi",
        "Aliquip ex ea commodo"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <BackgroundBeams className="absolute inset-0" />
        <div className="absolute inset-0 w-full h-full">
          <SparklesCore
            id="tsparticlesfullpage"
            background="transparent"
            minSize={0.6}
            maxSize={1.4}
            particleDensity={100}
            className="w-full h-full"
            particleColor="#a855f7"
          />
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold mb-6"
          >
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              Create Stunning
            </span>
            <br />
            <span className="text-foreground">AI Avatars</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto"
          >
            Transform your content with cutting-edge AI technology. Generate lifelike avatars, 
            clone voices, and create professional videos with our revolutionary platform.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center gap-2"
            >
              <Play className="w-5 h-5" />
              Get Started Free
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 border border-border text-foreground rounded-xl font-semibold text-lg hover:bg-accent transition-all duration-200 flex items-center gap-2"
            >
              <Video className="w-5 h-5" />
              Watch Demo
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Powerful Features
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Experience the future of content creation with our comprehensive AI toolkit
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Mic className="w-8 h-8" />,
                title: "Text-to-Speech",
                description: "Convert text to natural-sounding speech with advanced AI voices"
              },
              {
                icon: <Video className="w-8 h-8" />,
                title: "Video Generation", 
                description: "Create professional videos with AI-generated avatars and scenes"
              },
              {
                icon: <Copy className="w-8 h-8" />,
                title: "Voice Cloning",
                description: "Clone any voice with just a few minutes of sample audio"
              },
              {
                icon: <Sparkles className="w-8 h-8" />,
                title: "Avatar Creation",
                description: "Generate photorealistic avatars from text descriptions"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="p-6 rounded-2xl bg-card border border-border hover:border-purple-500/50 transition-all duration-200"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Choose Your Plan
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Select the perfect plan for your content creation needs
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <HoverEffect items={subscriptionPlans} className="max-w-6xl mx-auto" />
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;