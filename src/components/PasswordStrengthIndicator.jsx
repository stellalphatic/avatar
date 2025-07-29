// src/components/PasswordStrengthIndicator.jsx
import React from 'react';
import { motion } from 'framer-motion';

const PasswordStrengthIndicator = ({ password }) => {
    const getStrength = (pwd) => {
        let strength = 0;
        if (pwd.length >= 8) strength += 1;
        if (pwd.match(/[a-z]/) && pwd.match(/[A-Z]/)) strength += 1;
        if (pwd.match(/\d/)) strength += 1;
        if (pwd.match(/[^a-zA-Z0-9]/)) strength += 1;

        if (pwd.length === 0) return 0;
        if (strength <= 1) return 1; // Weak
        if (strength === 2) return 2; // Moderate
        if (strength >= 3) return 3; // Strong
        return 0;
    };

    const strength = getStrength(password);
    const strengthText = ['', 'Weak', 'Moderate', 'Strong'][strength];
    const strengthColor = ['', 'bg-red-500', 'bg-yellow-500', 'bg-green-500'][strength];
    const strengthWidth = ['0%', '33%', '66%', '100%'][strength];

    return (
        <div className="mt-2">
            <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                    className={`h-full rounded-full ${strengthColor}`}
                    initial={{ width: '0%' }}
                    animate={{ width: strengthWidth }}
                    transition={{ duration: 0.3 }}
                />
            </div>
            {password.length > 0 && (
                <p className={`text-xs mt-1 ${strength === 1 ? 'text-red-400' : strength === 2 ? 'text-yellow-400' : 'text-green-400'}`}>
                    {strengthText}
                </p>
            )}
        </div>
    );
};

export default PasswordStrengthIndicator;