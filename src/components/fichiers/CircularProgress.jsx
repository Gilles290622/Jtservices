import React from 'react';
import { motion } from 'framer-motion';

const CircularProgress = ({ progress = 0, size = 120, strokeWidth = 10, usedStorage, totalStorage }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      <div style={{ width: size, height: size }} className="relative">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            className="text-slate-200"
            fill="transparent"
            stroke="currentColor"
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            className="text-blue-600"
            fill="transparent"
            stroke="currentColor"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-slate-800">{`${Math.round(progress)}%`}</span>
        </div>
      </div>
      <div className="text-center mt-2">
        <p className="text-sm text-slate-600">
          <span className="font-semibold text-slate-800">{usedStorage}</span> / {totalStorage}
        </p>
      </div>
    </div>
  );
};

export default CircularProgress;