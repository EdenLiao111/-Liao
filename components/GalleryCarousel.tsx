import React, { useRef, useEffect, useState } from 'react';
import { PortfolioItem } from '../types';
import PortfolioItemCard from './PortfolioItemCard';

interface GalleryCarouselProps {
  items: PortfolioItem[];
  onViewItem: (item: PortfolioItem) => void;
  onDeleteItem: (id: string) => void;
}

const GalleryCarousel: React.FC<GalleryCarouselProps> = ({ items, onViewItem, onDeleteItem }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  // Update layout metrics on resize
  useEffect(() => {
    const updateMetrics = () => {
      if (scrollContainerRef.current) {
        setContainerWidth(scrollContainerRef.current.clientWidth);
      }
    };

    window.addEventListener('resize', updateMetrics);
    updateMetrics();

    return () => window.removeEventListener('resize', updateMetrics);
  }, []);

  // Track scroll position to calculate distance from center for each card
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      setScrollProgress(scrollContainerRef.current.scrollLeft);
    }
  };

  return (
    <div className="w-full h-full flex items-center bg-black/20">
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="w-full h-full flex items-center overflow-x-auto snap-x snap-mandatory hide-scrollbar pt-20 pb-20"
        style={{ 
            scrollBehavior: 'smooth',
            paddingLeft: '35vw',
            paddingRight: '35vw'
        }}
      >
        {items.map((item, index) => {
          const itemWidthVw = 30;
          const itemWidthPx = (window.innerWidth * itemWidthVw) / 100;
          const gap = 24; 
          
          // Calculate center positions logic
          const itemAbsolutePos = (index * (itemWidthPx + gap)); 
          const distanceFromCenter = scrollProgress - itemAbsolutePos;
          let distanceFactor = distanceFromCenter / (itemWidthPx * 1.0);
          distanceFactor = Math.max(-2, Math.min(2, distanceFactor));
          
          return (
            <div 
              key={item.id} 
              // Added hover:z-[100] to ensure the hovered card is ALWAYS on top, allowing buttons to be clicked
              className="flex-shrink-0 w-[30vw] h-[60vh] mr-6 last:mr-0 snap-center perspective-1000 transition-all duration-300 hover:z-[100] relative"
              style={{
                 zIndex: Math.round(10 - Math.abs(distanceFactor))
              }}
            >
              <PortfolioItemCard 
                item={item}
                onClick={onViewItem}
                onDelete={onDeleteItem}
                offsetFactor={distanceFactor} 
              />
            </div>
          );
        })}
      </div>
      
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default GalleryCarousel;