import React from 'react';

const BillingPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md my-8 text-gray-800 dark:text-gray-200">
      <h1 className="text-3xl font-bold mb-4">Billing Information</h1>
      <p className="text-lg text-gray-600 dark:text-gray-300">
        This page will display your billing history, current plan details, and payment methods.
      </p>
      <p className="text-md text-gray-500 dark:text-gray-400 mt-2">
        Content coming soon!
      </p>
    </div>
  );
};

export default BillingPage;
