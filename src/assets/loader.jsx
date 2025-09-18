import React from 'react';
import { motion } from 'framer-motion';

const Loader = ({ size = 'md', color = 'blue' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const colorClasses = {
    blue: 'border-blue-600',
    purple: 'border-purple-600',
    green: 'border-green-600',
    gray: 'border-gray-600'
  };

  return (
    <div className="flex items-center justify-center">
      <motion.div
        className={`${sizeClasses[size]} border-2 ${colorClasses[color]} border-t-transparent rounded-full`}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }}
      />
    </div>
  );
};

// Typing dots loader for chat messages
export const TypingLoader = () => {
  return (
    <div className="flex space-x-1 items-center">
      <motion.div
        className="w-2 h-2 bg-gray-400 rounded-full"
        animate={{ y: [-2, 2, -2] }}
        transition={{
          duration: 0.6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="w-2 h-2 bg-gray-400 rounded-full"
        animate={{ y: [-2, 2, -2] }}
        transition={{
          duration: 0.6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.1
        }}
      />
      <motion.div
        className="w-2 h-2 bg-gray-400 rounded-full"
        animate={{ y: [-2, 2, -2] }}
        transition={{
          duration: 0.6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.2
        }}
      />
    </div>
  );
};

// Pulse loader
export const PulseLoader = ({ color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-600',
    purple: 'bg-purple-600',
    green: 'bg-green-600',
    gray: 'bg-gray-600'
  };

  return (
    <div className="flex space-x-2">
      <motion.div
        className={`w-3 h-3 ${colorClasses[color]} rounded-full`}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className={`w-3 h-3 ${colorClasses[color]} rounded-full`}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.2
        }}
      />
      <motion.div
        className={`w-3 h-3 ${colorClasses[color]} rounded-full`}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.4
        }}
      />
    </div>
  );
};

export default Loader;