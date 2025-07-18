import React from 'react';
import { motion } from 'framer-motion';

const Thumbnail = ({ video, onVideoSelect }) => {
  const fallbackImage = "https://images.unsplash.com/photo-1594736748683-8b82415534b3?q=80&w=800";

  return (
    <motion.div
      className="relative aspect-video cursor-pointer transition-transform duration-200 ease-out group"
      whileHover={{ scale: 1.05 }}
      onClick={() => onVideoSelect(video)}
    >
      <img  
        alt={video.title || 'Video thumbnail'}
        className="rounded-md object-cover w-full h-full bg-gray-800"
        src={video.thumbnail_url || fallbackImage}
        onError={(e) => { e.currentTarget.src = fallbackImage; }}
      />
      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-md"></div>
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 rounded-b-md">
        <p className="text-white text-sm font-semibold truncate">{video.title}</p>
      </div>
    </motion.div>
  );
};

export default Thumbnail;