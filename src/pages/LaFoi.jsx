import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { supabase } from '@/lib/customSupabaseClient';
import { Loader2 } from 'lucide-react';
import Header from '@/components/streaming/Header';
import HeroBanner from '@/components/streaming/HeroBanner';
import CategoryGrid from '@/components/streaming/ContentRow';
import VideoPlayerDialog from '@/components/streaming/VideoPlayerDialog';
import { useToast } from '@/components/ui/use-toast';

const LaFoi = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data, error: rpcError } = await supabase.rpc('get_categories_with_videos');

      if (rpcError) {
        console.error("Error fetching streaming data:", rpcError);
        setError("Impossible de charger le contenu. Veuillez réessayer plus tard.");
        toast({
          variant: "destructive",
          title: "Erreur de chargement",
          description: "Le contenu n'a pas pu être chargé depuis le serveur.",
        });
      } else {
        const categoriesWithVideos = data ? data.filter(cat => cat.videos && cat.videos.length > 0) : [];
        setCategories(categoriesWithVideos);
      }
      setLoading(false);
    };

    fetchData();
  }, [toast]);

  const handleVideoSelect = (video) => {
    setSelectedVideo(video);
  };

  const featuredContent = categories[0]?.videos[0];
  const otherCategories = categories;

  const renderContent = () => {
    if (loading) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center">
          <Loader2 className="h-16 w-16 text-red-600 animate-spin" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center text-center text-white p-4">
          <div>
            <h2 className="text-2xl font-bold mb-4">Oops! Une erreur est survenue.</h2>
            <p>{error}</p>
          </div>
        </div>
      );
    }
    
    if (categories.length === 0) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center text-center text-white p-4">
          <div>
            <h2 className="text-2xl font-bold mb-4">Aucun contenu disponible</h2>
            <p>Veuillez revenir plus tard, du nouveau contenu arrive bientôt !</p>
          </div>
        </div>
      );
    }

    return (
       <>
        {featuredContent && <HeroBanner video={featuredContent} onPlay={handleVideoSelect} />}
        <main className="pl-4 md:pl-12 lg:pl-16 py-8 relative z-10">
            {otherCategories.map(category => (
                <CategoryGrid key={category.id} title={category.name} videos={category.videos} onVideoSelect={handleVideoSelect} />
            ))}
        </main>
       </>
    );
  };

  return (
    <>
      <Helmet>
        <title>La Foi - Streaming de contenu inspirant</title>
        <meta name="description" content="Votre plateforme de streaming pour des films, séries et documentaires qui élèvent l'esprit." />
      </Helmet>
      <div className="bg-black text-white min-h-screen">
        <Header />
        {renderContent()}
        <VideoPlayerDialog 
          isOpen={!!selectedVideo} 
          setIsOpen={() => setSelectedVideo(null)} 
          video={selectedVideo} 
        />
      </div>
    </>
  );
};

export default LaFoi;