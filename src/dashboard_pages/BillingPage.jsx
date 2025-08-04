// src/dashboard_pages/BillingPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Loader2, CheckCircle, HelpCircle } from 'lucide-react';

const UsageMeter = ({ label, used, limit }) => {
    const percentage = limit > 0 ? (used / limit) * 100 : 0;
    return (
        <div className="text-sm">
            <div className="flex justify-between mb-1">
                <span className="font-medium text-gray-600 dark:text-gray-300">{label}</span>
                <span className="text-gray-500 dark:text-gray-400">{used.toFixed(2)} / {limit} minutes used</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-pink-600 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    );
};

const PlanCard = ({ plan, currentPlanName, onSelect }) => (
    <div className={`p-6 rounded-lg border-2 ${currentPlanName === plan.plan_name ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
        <h3 className="font-bold text-lg text-gray-900 dark:text-white">{plan.plan_name}</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{plan.description}</p>
        <div className="my-6">
            <span className="text-4xl font-extrabold">${plan.monthly_price_usd}</span>
            <span className="text-sm font-medium text-gray-500">/mo</span>
        </div>
        <button 
            onClick={() => onSelect(plan.two_checkout_product_id)}
            disabled={currentPlanName === plan.plan_name}
            className="w-full py-2 text-sm font-semibold rounded-md transition-colors disabled:cursor-not-allowed disabled:bg-gray-300 dark:disabled:bg-gray-600 ${currentPlanName === plan.plan_name ? 'bg-pink-600 text-white' : 'bg-gray-800 text-white hover:bg-gray-900 dark:bg-gray-200 dark:text-gray-900 dark:hover:bg-gray-300'}"
        >
            {currentPlanName === plan.plan_name ? 'Current Plan' : 'Choose Plan'}
        </button>
        <ul className="mt-6 space-y-3 text-sm">
            <li className="flex items-center gap-x-3"><CheckCircle size={16} className="text-green-500" /> {plan.conversation_minute_limit} AI conversation minutes</li>
            <li className="flex items-center gap-x-3"><CheckCircle size={16} className="text-green-500" /> {plan.video_generation_minute_limit} video generation minutes</li>
            <li className="flex items-center gap-x-3"><CheckCircle size={16} className="text-green-500" /> {plan.custom_avatar_creation_limit} custom avatar trainings</li>
            {/* Add more features from your plans table */}
        </ul>
    </div>
);

const BillingPage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      // Fetch all available plans
      const { data: plansData, error: plansError } = await supabase
        .from('plans')
        .select('*')
        .order('monthly_price_usd', { ascending: true });

      if (profileError || plansError) {
        console.error('Error fetching billing data:', profileError || plansError);
      } else {
        setProfile(profileData);
        setPlans(plansData);
      }
      setLoading(false);
    };

    if (user) fetchData();
  }, [user]);

  const handlePlanSelection = (productId) => {
    // This is where you would integrate with 2Checkout using their API/SDK
    // For example: TwoCo.checkout.render({ product_id: productId, ... });
    alert(`Redirecting to checkout for product ID: ${productId}`);
  };

  if (loading) return <div className="text-center py-20"><Loader2 className="mx-auto h-10 w-10 animate-spin text-pink-600" /></div>;
  if (!profile) return <div className="text-center py-20 text-red-500">Could not load user profile.</div>;

  return (
    <div className="space-y-8">
        <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Billing</h1>
            <button className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700">Read Docs</button>
        </div>
        
        {/* Current Plan Section */}
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="font-semibold text-gray-800 dark:text-gray-200">Current Plan</h2>
                    <span className="text-pink-600 font-bold text-lg">{profile.current_plan}</span>
                </div>
                <button className="px-4 py-2 text-sm font-semibold text-white bg-pink-600 rounded-md hover:bg-pink-700">Manage Payment Method</button>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200">Billing Cycle Usage</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 hover:text-pink-500 cursor-pointer">Invoice History &rarr;</p>
                </div>
                <div className="space-y-5">
                    <UsageMeter label="Video generation minutes" used={profile.video_generation_minutes_this_month} limit={profile.video_generation_minutes_monthly_limit} />
                    <UsageMeter label="Conversation minutes" used={profile.conversation_minutes_this_month} limit={profile.conversation_minutes_monthly_limit} />
                    <p className="text-sm flex items-center gap-2 text-gray-500 dark:text-gray-400"><HelpCircle size={16}/> No personal avatars available on this plan.</p>
                </div>
            </div>
        </div>

        {/* All Plans Section */}
        <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">All Plans</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {plans.map(plan => (
                    <PlanCard key={plan.id} plan={plan} currentPlanName={profile.current_plan} onSelect={handlePlanSelection} />
                ))}
                {/* Enterprise Card */}
                <div className="p-6 rounded-lg bg-gray-800 text-white flex flex-col justify-between">
                    <div>
                        <h3 className="font-bold text-lg">Enterprise</h3>
                        <p className="text-gray-400 text-sm mt-1">For scaling businesses, starting at $12k annual</p>
                    </div>
                    <div>
                        <h2 className="text-4xl font-extrabold my-6">Let's talk!</h2>
                        <button className="w-full py-2 text-sm font-semibold rounded-md bg-white text-gray-900 hover:bg-gray-200 transition-colors">Contact Sales</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default BillingPage;