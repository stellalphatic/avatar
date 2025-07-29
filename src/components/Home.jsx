// src/components/Home.jsx
import React from 'react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { PricingModal } from './PricingModal';
import { BackgroundBeams } from './ui/BackgroundBeams';
import { SparklesCore } from './ui/SparklesCore';
import { HoverEffect } from './ui/HoverEffect';
import { CardContainer, CardBody, CardItem } from './ui/3DCard';
import { TextGenerateEffect } from './ui/TextGenerateEffect';
import { 
  Play, 
  Mic, 
  Video, 
  Copy, 
  Sparkles, 
  Zap, 
  Shield, 
  Users, 
  Mail, 
  Webhook,
  Brain,
  Camera,
  MessageSquare,
  Globe,
  Star,
  ArrowRight,
  CheckCircle,
  Calendar,
  FileText,
  Headphones,
  Bot,
  Building,
  Code
} from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';

const Home = () => {
  const [showPricingModal, setShowPricingModal] = useState(false);

  const PricingPlans = () => {
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
          "Custom integrations",
          "Dedicated account manager",
          "SLA & Uptime guarantees",
          "No video duration max"
        ],
        isPopular: false
      }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {plans.map((plan, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: index * 0.1 }}
            className="relative bg-card rounded-xl p-6 border border-border hover:border-purple-500/50 transition-all duration-200"
          >
            {plan.isPopular && (
              <div className="absolute -top-3 right-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                Most Popular 🔥
              </div>
            )}
            <div className="text-center">
              <h4 className="text-sm text-muted-foreground mb-1">{plan.description}</h4>
              <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                {plan.title}
              </h3>
              <p className="text-4xl font-extrabold text-foreground mb-6">{plan.price}</p>
              
              <ul className="text-left text-muted-foreground mb-6 space-y-2">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    {feature}
                  </li>
                ))}
              </ul>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowPricingModal(true)}
                className={`w-full px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                  plan.title === "Enterprise"
                    ? "bg-transparent border border-purple-600 text-purple-500 hover:bg-purple-600 hover:text-white"
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

  const subscriptionPlans = [
    {
      title: "Free Plan",
      description: "Perfect for getting started with AI avatar generation",
      price: "$0/month",
      features: [
        "5 AI avatar generations per month",
        "Basic voice synthesis",
        "Standard video quality",
        "Email support",
        "Community access"
      ]
    },
    {
      title: "Pro Plan",
      description: "Advanced features for professional content creators",
      price: "$29/month",
      features: [
        "Unlimited AI avatar generations",
        "Advanced voice cloning", 
        "4K video quality",
        "Meeting integration",
        "Email summaries",
        "Priority support",
        "API access"
      ]
    },
    {
      title: "Enterprise",
      description: "Full-featured solution for businesses and teams",
      price: "$99/month",
      features: [
        "Everything in Pro",
        "Custom avatar training",
        "Webhook integrations",
        "Team collaboration",
        "Advanced analytics",
        "Dedicated support",
        "Custom branding",
        "SLA guarantee",
        "On-premise deployment"
      ]
    }
  ];

  const detailedFeatures = [
    {
      id: 'virtual-presence',
      title: 'Virtual Presence',
      subtitle: 'Be everywhere at once',
      description: 'Deploy your AI avatar in interviews, meetings, and presentations. Maintain professional presence even when you\'re not physically available.',
      longDescription: 'Transform how you handle professional commitments with AI-powered virtual presence. Your avatar can attend multiple meetings simultaneously, conduct interviews with natural conversation flow, and deliver presentations with your exact mannerisms and speaking style.',
      icon: <Users className="w-12 h-12" />,
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
      icon: <MessageSquare className="w-12 h-12" />,
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
      subtitle: 'Your digital twin',
      description: 'Create perfect digital replicas with advanced voice synthesis and personality modeling. Your avatar thinks and speaks like you.',
      longDescription: 'State-of-the-art neural networks analyze your speech patterns, vocal characteristics, and personality traits to create an indistinguishable digital version of yourself that can engage in natural conversations.',
      icon: <Brain className="w-12 h-12" />,
      gradient: 'from-green-500 to-emerald-500',
      features: [
        'Voice pattern analysis',
        'Personality modeling',
        'Natural speech synthesis',
        'Emotional expression',
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
      icon: <Webhook className="w-12 h-12" />,
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

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <TextGenerateEffect 
              words="Create Your Digital Twin with AI"
              className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6"
            />
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl lg:text-2xl text-muted-foreground mb-8 max-w-4xl mx-auto"
          >
            Transform your presence with cutting-edge AI avatars. Clone your voice, replicate your personality, 
            and be everywhere at once with our revolutionary platform.
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
              className="px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold text-base md:text-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center gap-2"
            >
              <Play className="w-4 h-4 md:w-5 md:h-5" />
              Start Creating Free
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 md:px-8 py-3 md:py-4 border border-border text-foreground rounded-xl font-semibold text-base md:text-lg hover:bg-accent transition-all duration-200 flex items-center gap-2"
            >
              <Video className="w-4 h-4 md:w-5 md:h-5" />
              Watch Demo
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="py-16 md:py-24 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12 md:mb-20"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                About Our Vision
              </span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-4xl mx-auto">
              We're pioneering the future of human-AI interaction, creating technology that doesn't replace humans 
              but amplifies their presence and capabilities across digital spaces.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 items-center mb-16">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="order-2 lg:order-1"
            >
              <CardContainer className="inter-var w-full">
                <CardBody className="bg-gray-50 relative group/card dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-full h-auto rounded-xl p-6 border">
                  <CardItem translateZ="100" className="w-full">
                    <div className="w-full h-64 md:h-80 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <Globe className="w-16 h-16 md:w-24 md:h-24 text-white" />
                    </div>
                  </CardItem>
                </CardBody>
              </CardContainer>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6 order-1 lg:order-2"
            >
              <h3 className="text-2xl md:text-3xl font-bold">Redefining Digital Presence</h3>
              <p className="text-base md:text-lg text-muted-foreground">
                Our mission is to break the barriers of physical presence. Whether you're a CEO managing global teams, 
                a content creator reaching worldwide audiences, or a professional juggling multiple commitments, 
                our AI avatars ensure you're always present where it matters most.
              </p>
              <div className="space-y-4">
                {[
                  "Advanced neural networks for realistic avatar generation",
                  "Proprietary voice synthesis technology",
                  "Real-time conversation processing",
                  "Enterprise-grade security and privacy"
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm md:text-base">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Detailed Features Sections */}
      {detailedFeatures.map((feature, index) => (
        <section key={feature.id} className={`py-16 md:py-24 px-4 ${index % 2 === 1 ? 'bg-muted/30' : ''}`}>
          <div className="max-w-7xl mx-auto">
            <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 items-center ${index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''}`}>
              {/* Content */}
              <motion.div
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className={`space-y-6 ${index % 2 === 1 ? 'lg:col-start-2' : ''}`}
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center text-white mb-6`}>
                  {feature.icon}
                </div>
                
                <div>
                  <h3 className="text-3xl md:text-4xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-lg md:text-xl text-purple-600 dark:text-purple-400 mb-4">{feature.subtitle}</p>
                  <p className="text-base md:text-lg text-muted-foreground mb-6">{feature.longDescription}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {feature.features.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>

                <motion.a
                  href="/login"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r ${feature.gradient} text-white rounded-lg hover:shadow-lg transition-all duration-200`}
                >
                  Try {feature.title} <ArrowRight className="w-4 h-4" />
                </motion.a>
              </motion.div>

              {/* Image/Visual */}
              <motion.div
                initial={{ opacity: 0, x: index % 2 === 0 ? 50 : -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className={index % 2 === 1 ? 'lg:col-start-1' : ''}
              >
                <CardContainer className="inter-var w-full">
                  <CardBody className="bg-gray-50 relative group/card dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-full h-auto rounded-xl p-6 border">
                    <CardItem translateZ="100" className="w-full">
                      <img
                        src={feature.image}
                        alt={feature.title}
                        className="w-full h-64 md:h-80 object-cover rounded-lg"
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
      <section className="py-16 md:py-24 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Trusted by Professionals
              </span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              See how industry leaders are transforming their workflow with AI avatars
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
              >
                <CardContainer className="inter-var">
                  <CardBody className="bg-gray-50 relative group/card dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-full h-auto rounded-xl p-6 border">
                    <CardItem translateZ="50" className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                      ))}
                    </CardItem>
                    <CardItem
                      translateZ="60"
                      className="text-muted-foreground mb-4 italic text-sm md:text-base"
                    >
                      "{testimonial.content}"
                    </CardItem>
                    <CardItem translateZ="40">
                      <div>
                        <p className="font-semibold text-sm md:text-base">{testimonial.name}</p>
                        <p className="text-xs md:text-sm text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </CardItem>
                  </CardBody>
                </CardContainer>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 md:py-24 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Choose Your Plan
              </span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Select the perfect plan for your digital transformation needs
            </p>
          </motion.div>

          <PricingPlans />
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