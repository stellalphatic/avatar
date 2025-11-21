import { useState } from "react"
import { motion } from "framer-motion"
import { Check, ArrowRight } from "lucide-react"
import { useTheme } from "../contexts/ThemeContext"
import { useNavigate } from "react-router-dom"

const PricingSection = () => {
  const { theme } = useTheme()
  const navigate = useNavigate()
  const [billingCycle, setBillingCycle] = useState("monthly")

  const plans = [
    {
      name: "Starter",
      monthlyPrice: "$39",
      yearlyPrice: "$31",
      description: "Perfect for individuals getting started",
      features: [
        "Unlimited videos",
        "Videos up to 30-mins",
        "1080p video export",
        "Fast video processing",
        "200 minutes of AI Conversational Video per month",
        "8 Custom Video Avatar",
        "true Stock Avatar Access"
      ],
      popular: false
    },
    {
      name: "Growth",
      monthlyPrice: "$299",
      yearlyPrice: "$233",
      description: "Great for growing businesses",
      features: [
        "Everything in Starter, plus:",
        "800 minutes of AI Conversational Video per month",
        "20 Custom Video Avatar",
        "4k video export",
        "Priority processing",
        "Advanced analytics",
        "API access"
      ],
      popular: true
    },
    {
      name: "Pro",
      monthlyPrice: "$699",
      yearlyPrice: "$545",
      description: "For professionals and teams",
      features: [
        "Everything in Growth, plus:",
        "1500 minutes of AI Conversational Video per month",
        "50 Custom Video Avatar",
        "White-label options",
        "Dedicated support",
        "Custom integrations",
        "SLA guarantee"
      ],
      popular: false
    }
  ]

  return (
    <section id="pricing" className={`py-32 px-4 ${theme === "dark" ? "bg-black" : "bg-white"}`}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Plans that fit your scale
            </span>
          </h2>
          <p className={`text-xl mb-8 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
            Choose the perfect plan for your needs
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-4 p-2 rounded-full bg-gray-800 border border-gray-700">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                billingCycle === "monthly"
                  ? "bg-purple-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Monthly billing
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                billingCycle === "yearly"
                  ? "bg-purple-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Yearly (save up to 22%)
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className={`relative rounded-2xl p-8 ${
                plan.popular
                  ? "bg-gradient-to-br from-purple-600 to-pink-600 text-white"
                  : theme === "dark"
                  ? "bg-gray-900 border border-gray-800"
                  : "bg-white border border-gray-200 shadow-xl"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-yellow-500 text-black text-xs font-bold rounded-full">
                  MOST POPULAR
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className={`text-2xl font-bold mb-2 ${plan.popular ? "text-white" : theme === "dark" ? "text-white" : "text-gray-900"}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm mb-6 ${plan.popular ? "text-white/80" : theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                  {plan.description}
                </p>
                <div className="mb-2">
                  <span className={`text-5xl font-bold ${plan.popular ? "text-white" : "bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"}`}>
                    {billingCycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice}
                  </span>
                  <span className={`text-lg ${plan.popular ? "text-white/80" : theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                    /month
                  </span>
                </div>
                {billingCycle === "yearly" && (
                  <p className={`text-xs ${plan.popular ? "text-white/60" : theme === "dark" ? "text-gray-500" : "text-gray-500"}`}>
                    Billed annually
                  </p>
                )}
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${plan.popular ? "text-white" : "text-purple-600"}`} />
                    <span className={`text-sm ${plan.popular ? "text-white/90" : theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/auth")}
                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                  plan.popular
                    ? "bg-white text-purple-600 hover:bg-gray-100"
                    : "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg"
                }`}
              >
                Get Started
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default PricingSection
