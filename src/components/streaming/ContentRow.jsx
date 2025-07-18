import React from 'react';
import Thumbnail from './Thumbnail';

const CategoryGrid = ({ title, videos, onVideoSelect }) => {
  if (!videos || videos.length === 0) return null;

  return (
    <div className="h-auto space-y-3 my-6 md:my-10">
      <h2 className="text-xl md:text-2xl font-semibold text-gray-200 hover:text-white transition-colors cursor-pointer">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
        {videos.map(video => (
          <Thumbnail key={video.id} video={video} onVideoSelect={onVideoSelect} />
        ))}
      </div>
    </div>
  );
};

export default CategoryGrid;