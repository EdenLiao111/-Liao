import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import ParticleBackground from './components/ParticleBackground';
import UploadModal from './components/UploadModal';
import GalleryCarousel from './components/GalleryCarousel';
import MediaViewer from './components/MediaViewer';
import CoverPage from './components/CoverPage';
import { PortfolioItem } from './types';
import { getPortfolioItems, savePortfolioItem, deletePortfolioItem } from './utils/db';

const App: React.FC = () => {
  // State
  const [view, setView] = useState<'cover' | 'gallery'>('cover');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [viewingItem, setViewingItem] = useState<PortfolioItem | null>(null);

  // Load items from IndexedDB on mount
  useEffect(() => {
    const loadItems = async () => {
      try {
        const loadedItems = await getPortfolioItems();
        setItems(loadedItems);
      } catch (e) {
        console.error("Failed to load items", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadItems();
  }, []);

  // Actions
  const handleEnterGallery = () => {
    setIsTransitioning(true);
    // 500ms implode animation
    setTimeout(() => {
      setView('gallery');
      setIsTransitioning(false); 
    }, 500);
  };

  const handleUpload = async (newItem: PortfolioItem, file: File) => {
    try {
      // 1. Save to DB
      await savePortfolioItem(newItem, file);
      // 2. Update Local State (Create a temporary URL for immediate display if needed, 
      // but savePortfolioItem already expects us to handle the UI update)
      // We re-fetch or just prepend. Prepending is faster.
      setItems(prev => [newItem, ...prev]);
    } catch (e) {
      console.error("Failed to save item", e);
      alert("Failed to save media. Storage might be full.");
    }
  };

  const handleDelete = async (id: string) => {
    // Optimistic Update: Remove from UI immediately so it feels responsive
    setItems(prev => prev.filter(item => item.id !== id));
    
    try {
      await deletePortfolioItem(id);
      // If successful, we are good.
    } catch (e) {
      console.error("Failed to delete", e);
      // Optional: Revert state if delete fails? 
      // For this app, it's better to just log it, as re-adding is complex without refetching.
      // Ideally we reload from DB if it failed.
      alert("Error deleting item from storage. Please refresh.");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#9D00FF] selection:text-white overflow-hidden relative">
      <ParticleBackground />

      {/* Page 1: Cover */}
      {view === 'cover' && (
        <div className={`fixed inset-0 z-30 ${isTransitioning ? 'animate-implode' : ''}`}>
           <CoverPage onEnter={handleEnterGallery} isExiting={isTransitioning} />
        </div>
      )}

      {/* Page 2: Gallery */}
      {view === 'gallery' && (
        <div className={`fixed inset-0 z-20 animate-explode flex flex-col`}>
          
          {/* Header */}
          <header className="absolute top-0 left-0 w-full z-40 px-6 py-6 flex justify-between items-end bg-gradient-to-b from-black/90 to-transparent pointer-events-none">
            <h1 className="text-xl font-bold tracking-tighter pointer-events-auto select-none text-white">
              AIGC <span className="text-[#9D00FF]">PORTFOLIO</span>
            </h1>
            <button 
              onClick={() => setIsUploadOpen(true)}
              className="pointer-events-auto flex items-center gap-2 px-6 py-2 bg-black/50 border border-zinc-800 text-white text-xs font-bold tracking-widest hover:border-[#00CCFF] hover:text-[#00CCFF] transition-all backdrop-blur-md uppercase"
            >
              <Plus size={14} />
              <span>Add Entry</span>
            </button>
          </header>

          {/* Main Content - Carousel */}
          <main className="flex-grow w-full h-full relative">
            {isLoading ? (
               <div className="flex items-center justify-center h-full text-[#00CCFF]">Loading Assets...</div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-zinc-800 relative z-50">
                <div className="text-6xl font-black opacity-20 tracking-widest">EMPTY SPACE</div>
                <button 
                  onClick={() => setIsUploadOpen(true)}
                  className="mt-8 text-[#00CCFF] text-sm tracking-widest hover:opacity-80 transition-opacity uppercase"
                >
                  [ Initialize Content ]
                </button>
              </div>
            ) : (
              <GalleryCarousel 
                items={items} 
                onViewItem={setViewingItem} 
                onDeleteItem={handleDelete} 
              />
            )}
          </main>

          {/* Footer Overlay */}
          <div className="absolute bottom-8 left-0 w-full text-center pointer-events-none z-40">
             <p className="text-zinc-600 text-[10px] tracking-[0.5em] uppercase">
                &larr; Drag / Scroll &rarr;
             </p>
          </div>
        </div>
      )}

      {/* Modals */}
      <UploadModal 
        isOpen={isUploadOpen} 
        onClose={() => setIsUploadOpen(false)} 
        onUpload={handleUpload} 
      />

      <MediaViewer 
        item={viewingItem} 
        onClose={() => setViewingItem(null)} 
      />
    </div>
  );
};

export default App;