import React from 'react';
import { X, Play } from 'lucide-react';
import { PortfolioItem } from '../types';

interface MediaViewerProps {
  item: PortfolioItem | null;
  onClose: () => void;
}

const MediaViewer: React.FC<MediaViewerProps> = ({ item, onClose }) => {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl animate-in fade-in duration-200">
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 z-50 p-2 text-zinc-400 hover:text-white transition-colors bg-black/50 rounded-full"
      >
        <X size={32} />
      </button>

      <div className="w-full h-full max-w-7xl max-h-screen p-4 md:p-12 flex flex-col items-center justify-center">
        <div className="relative w-full h-full flex items-center justify-center">
          {item.type === 'video' ? (
            <video 
              src={item.url} 
              className="max-w-full max-h-full shadow-2xl rounded-sm focus:outline-none" 
              controls 
              autoPlay
            />
          ) : (
             <img 
               src={item.url} 
               alt={item.title} 
               className="max-w-full max-h-full object-contain shadow-2xl rounded-sm"
             />
          )}
        </div>
        
        <div className="mt-8 text-center max-w-2xl">
          <h2 className="text-2xl text-white font-light tracking-widest uppercase mb-2">{item.title}</h2>
          {item.description && (
            <p className="text-zinc-400 font-light">{item.description}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MediaViewer;
