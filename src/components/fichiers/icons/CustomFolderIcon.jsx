import React from 'react';

const CustomFolderIcon = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 100 100"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="folderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#4f8dff', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#2a6de8', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    <path
      fill="url(#folderGradient)"
      d="M 10,30 L 10,85 C 10,87.76 12.24,90 15,90 L 85,90 C 87.76,90 90,87.76 90,85 L 90,40 C 90,37.24 87.76,35 85,35 L 45,35 C 42,35 40,33 40,30 L 40,25 C 40,22.24 37.76,20 35,20 L 15,20 C 12.24,20 10,22.24 10,25 L 10,30 Z"
    />
    <path
      fill="#ffffff"
      opacity="0.1"
      d="M 15,20 L 35,20 C 37.76,20 40,22.24 40,25 L 40,28 C 40,25.24 37.76,23 35,23 L 15,23 C 12.24,23 10,25.24 10,28 L 10,25 C 10,22.24 12.24,20 15,20 Z"
    />
  </svg>
);

export default CustomFolderIcon;