import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Play, Info } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const HeroBanner = ({ video, onPlay }) => {
  const { toast } = useToast();
  const fallbackImage = "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963e?q=80&w=1200";

  if (!video) return null;

  const handleMoreInfo = () => {
    toast({
      title: '🚧 Bientôt disponible !',
      description: "Cette fonctionnalité n'est pas encore implémentée.",
    });
  };

  return (
    <div className="relative h-[56.25vw] min-h-[400px] max-h-[800px]">
      <div className="absolute top-0 left-0 w-full h-full">
        <img 
          className="w-full h-full object-cover" 
          alt={video.title || 'Featured content'}
          src={video.thumbnail_url || fallbackImage}
          onError={(e) => { e.currentTarget.src = fallbackImage; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent"></div>
      </div>

      <div className="absolute bottom-[20%] md:bottom-[30%] left-4 md:left-16 text-white max-w-lg">
        <motion.h2 
          className="text-3xl md:text-5xl lg:text-6xl font-extrabold drop-shadow-lg mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {video.title}
        </motion.h2>
        <motion.p 
          className="text-sm md:text-base line-clamp-3 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {video.description}
        </motion.p>
        <motion.div 
          className="flex space-x-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Button onClick={() => onPlay(video)} className="bg-white text-black hover:bg-white/80 rounded-md font-bold text-lg px-6 py-6">
            <Play className="mr-2 h-6 w-6" fill="black" />
            Lecture
          </Button>
          <Button onClick={handleMoreInfo} className="bg-gray-500/70 text-white hover:bg-gray-500/50 rounded-md font-bold text-lg px-6 py-6">
            <Info className="mr-2 h-6 w-6" />
            Plus d'infos
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default HeroBanner;