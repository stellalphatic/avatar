import React from 'react';
import { PricingContent } from '../components/PricingContent'; // Import the new content component

const PricingPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <PricingContent showToggle={true} />
      </div>
    </div>
  );
};

export default PricingPage;
