import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import ParticleBackground from './components/ParticleBackground';
import UploadModal from './components/UploadModal';
import GalleryCarousel from './components/GalleryCarousel';
import MediaViewer from './components/MediaViewer';
import CoverPage from './components/CoverPage';
import { PortfolioItem } from './types';
import { getPortfolioItems, savePortfolioItem, deletePortfolioItem } from './utils/db';

// Static Portfolio Items Configuration
const STATIC_ITEMS: PortfolioItem[] = [
   {
    id: 'static-1',
    type: 'video',
    title: '穿越到异世界我成了天才',
    url: encodeURI('https://res.cloudinary.com/dk28stjwf/video/upload/v1765127404/%E7%A9%BF%E8%B6%8A%E5%88%B0%E5%BC%82%E4%B8%96%E7%95%8C%E6%88%91%E6%88%90%E4%BA%86%E5%A4%A9%E6%89%8D_y7mhl5.mp4'),
    description: 'AIGC Video Art',
    timestamp: Date.now() + 7000
  },
  {
    id: 'static-1',
    type: 'video',
    title: '国风',
    url: encodeURI('https://res.cloudinary.com/dk28stjwf/video/upload/v1765126738/10%E6%9C%8829%E6%97%A5_hcir9n.mp4'),
    description: 'AIGC Video Art',
    timestamp: Date.now() + 6000
  },
  {
    id: 'static-2',
    type: 'video',
    title: '沈星回',
    url: encodeURI('https://res.cloudinary.com/dk28stjwf/video/upload/v1765126675/11%E6%9C%882%E6%97%A5_1_iqzfyu.mp4'),
    description: 'AIGC Video Art',
    timestamp: Date.now() + 5000
  },
  {
    id: 'static-3',
    type: 'video',
    title: 'why not',
    url: encodeURI('https://res.cloudinary.com/dk28stjwf/video/upload/why_not_bagkb1.mp4'),
    description: 'AIGC Video Art',
    timestamp: Date.now() + 4000
  },
  {
    id: 'static-4',
    type: 'video',
    title: '变形记',
    url: encodeURI('https://res.cloudinary.com/dk28stjwf/video/upload/v1765126985/%E5%8F%98%E5%BD%A2%E8%AE%B0__%E5%8E%8B%E7%BC%A9_hdq2cq.mp4'),
    description: 'AIGC Video Art',
    timestamp: Date.now() + 3000
  },
  {
    id: 'static-5',
    type: 'video',
    title: '工位越近，素质越低',
    url: encodeURI('https://res.cloudinary.com/dk28stjwf/video/upload/v1765126559/%E5%B7%A5%E4%BD%8D%E8%B6%8A%E8%BF%91_%E7%B4%A0%E8%B4%A8%E8%B6%8A%E4%BD%8E_ix2h30.mp4'),
    description: 'AIGC Video Art',
    timestamp: Date.now() + 2000
  },
  {
    id: 'static-6',
    type: 'video',
    title: '琉璃山',
    url: encodeURI('https://res.cloudinary.com/dk28stjwf/video/upload/v1765126344/%E7%8E%BB%E7%92%83%E5%B1%B1_hq2bai.mp4'),
    description: 'AIGC Video Art',
    timestamp: Date.now() + 1000
  }
];

const App: React.FC = () => {
  // State
  const [view, setView] = useState<'cover' | 'gallery'>('cover');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [viewingItem, setViewingItem] = useState<PortfolioItem | null>(null);

  // Load items from IndexedDB on mount and merge with Static Items
  useEffect(() => {
    const loadItems = async () => {
      try {
        const loadedItems = await getPortfolioItems();
        // Merge static items with user uploaded items
        // Static items are prepended to appear first
        setItems([...STATIC_ITEMS, ...loadedItems]);
      } catch (e) {
        console.error("Failed to load items", e);
        // Fallback to static items if DB fails
        setItems(STATIC_ITEMS);
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
      // 2. Update Local State 
      // We manually add the new item to the state to avoid a full reload
      setItems(prev => [newItem, ...prev]);
    } catch (e) {
      console.error("Failed to save item", e);
      alert("Failed to save media. Storage might be full.");
    }
  };

  const handleDelete = async (id: string) => {
    // Check if it's a static item
    if (id.startsWith('static-')) {
      alert("Static portfolio items cannot be deleted.");
      return;
    }

    // Optimistic Update: Remove from UI immediately so it feels responsive
    setItems(prev => prev.filter(item => item.id !== id));
    
    try {
      await deletePortfolioItem(id);
    } catch (e) {
      console.error("Failed to delete", e);
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