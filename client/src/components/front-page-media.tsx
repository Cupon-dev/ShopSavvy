import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Download, Gamepad2, Video } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface MediaItem {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  videoUrl?: string;
  mediaType: string;
  position: number;
  isActive: boolean;
  clickAction?: string;
}

export default function FrontPageMedia() {
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

  const { data: mediaItems = [] } = useQuery<MediaItem[]>({
    queryKey: ['/api/front-page-media'],
    enabled: true
  });

  const activeMedia = mediaItems
    .filter(item => item.isActive)
    .sort((a, b) => a.position - b.position);

  const handleMediaClick = (item: MediaItem) => {
    if (item.clickAction) {
      window.location.href = item.clickAction;
    } else {
      setSelectedMedia(item);
    }
  };

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'game':
        return <Gamepad2 className="h-5 w-5" />;
      case 'video':
        return <Video className="h-5 w-5" />;
      default:
        return <Play className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Media */}
      {activeMedia.length > 0 && (
        <div className="relative overflow-hidden rounded-lg">
          <img 
            src={activeMedia[0].imageUrl} 
            alt={activeMedia[0].title}
            className="w-full h-64 md:h-96 object-cover cursor-pointer"
            onClick={() => handleMediaClick(activeMedia[0])}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent">
            <div className="absolute bottom-6 left-6 text-white">
              <h2 className="text-2xl md:text-4xl font-bold mb-2">{activeMedia[0].title}</h2>
              <p className="text-lg mb-4">{activeMedia[0].description}</p>
              <Button 
                onClick={() => handleMediaClick(activeMedia[0])}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {getMediaIcon(activeMedia[0].mediaType)}
                <span className="ml-2">Explore Now</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Media Grid */}
      {activeMedia.length > 1 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {activeMedia.slice(1).map((item) => (
            <Card 
              key={item.id} 
              className="group cursor-pointer hover:shadow-lg transition-all duration-300"
              onClick={() => handleMediaClick(item)}
            >
              <CardContent className="p-0">
                <div className="relative overflow-hidden">
                  <img 
                    src={item.imageUrl} 
                    alt={item.title}
                    className="w-full h-32 md:h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="text-white text-center">
                      {getMediaIcon(item.mediaType)}
                      <p className="mt-2 text-sm font-medium">{item.mediaType.toUpperCase()}</p>
                    </div>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-sm mb-1">{item.title}</h3>
                  <p className="text-xs text-gray-600 line-clamp-2">{item.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Media Modal */}
      {selectedMedia && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="relative">
              <img 
                src={selectedMedia.imageUrl} 
                alt={selectedMedia.title}
                className="w-full h-64 md:h-96 object-cover"
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-4 right-4 bg-black/50 text-white hover:bg-black/70"
                onClick={() => setSelectedMedia(null)}
              >
                ×
              </Button>
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-3">{selectedMedia.title}</h2>
              <p className="text-gray-600 mb-4">{selectedMedia.description}</p>
              {selectedMedia.videoUrl && (
                <div className="aspect-video">
                  <iframe
                    src={selectedMedia.videoUrl}
                    className="w-full h-full rounded"
                    allowFullScreen
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}