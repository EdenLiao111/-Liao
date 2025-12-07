import React, { useState, useEffect, useRef } from 'react';
import { Play, Trash2 } from 'lucide-react';
import { PortfolioItem } from '../types';

interface PortfolioItemCardProps {
  item: PortfolioItem;
  onClick: (item: PortfolioItem) => void;
  onDelete: (id: string) => void;
  offsetFactor: number; // -1 (left), 0 (center), 1 (right)
}

const PortfolioItemCard: React.FC<PortfolioItemCardProps> = ({ item, onClick, onDelete, offsetFactor }) => {
  const [isHovered, setIsHovered] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Visual Styles Calculation
  let scale = 1.0;
  let blur = 0;
  let opacity = 1.0;
  let zIndex = 1;

  if (isHovered) {
      // Hover State (Super Focus): Max size, clear, on top
      scale = 1.15;
      blur = 0;
      opacity = 1;
      zIndex = 50; 
  } else {
      // Carousel State
      const absOffset = Math.abs(offsetFactor);
      
      // Center item (absOffset close to 0)
      if (absOffset < 0.2) {
          scale = 1.0; // Standard size
          blur = 0;    // Clear visibility
          opacity = 1; 
          zIndex = 20;
      } else {
          // Side items
          scale = 1.0 - (absOffset * 0.15); 
          blur = absOffset * 3; 
          opacity = 1 - (absOffset * 0.5);
          zIndex = 1;
      }
  }

  // Effect: Handle Video Playback (Strictly Hover Only)
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    if (isHovered) {
        // Only play if hovered
        el.play().catch(() => {});
    } else {
        // Pause otherwise (even if centered)
        el.pause();
        el.currentTime = 0;
    }
  }, [isHovered]);

  
  // Particle Ripple & Star Effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize canvas to match container + bleed
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    // Particle Definition
    interface Particle {
        x: number;
        y: number;
        vx: number;
        vy: number;
        size: number;
        life: number;
        type: 'ripple' | 'ambient';
        twinkleOffset: number;
        color: string;
    }

    let particles: Particle[] = [];
    
    // Mouse state for ripple
    let mouseX = -1000;
    let mouseY = -1000;

    const createRipple = (x: number, y: number) => {
      const count = 3;
      for(let i=0; i<count; i++) {
         particles.push({
           x: x,
           y: y,
           vx: (Math.random() - 0.5) * 6,
           vy: (Math.random() - 0.5) * 6,
           size: Math.random() * 2 + 0.5,
           life: 1.0,
           type: 'ripple',
           twinkleOffset: 0,
           color: '#00CCFF'
         });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
        createRipple(mouseX, mouseY);
    };
    
    if (isHovered) {
        canvas.addEventListener('mousemove', handleMouseMove);
    }

    let animationId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Ambient particles (Stars)
      if (!isHovered) {
         if (Math.random() > 0.85) { // High spawn rate
             const rand = Math.random();
             let color = '#FFFFFF'; // White (Stars)
             if (rand > 0.7) color = '#00FFFF'; // Cyan
             else if (rand > 0.4) color = '#D946EF'; // Bright Purple

             particles.push({
                x: canvas.width/2 + (Math.random()-0.5) * canvas.width * 1.5, 
                y: canvas.height/2 + (Math.random()-0.5) * canvas.height * 1.5,
                vx: (Math.random() - 0.5) * (Math.abs(offsetFactor) * 4), 
                vy: (Math.random() - 0.5) * (Math.abs(offsetFactor) * 4),
                size: Math.random() * 2.5 + 1.0, // SIZE INCREASED: 1px to 3.5px
                life: 1.0, 
                type: 'ambient',
                twinkleOffset: Math.random() * 100,
                color: color
             });
         }
      }

      const time = Date.now() * 0.005;

      for(let i=particles.length-1; i>=0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        
        if (p.type === 'ripple') {
            p.life -= 0.03;
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.life * 0.8;
        } else {
            // Ambient (Star logic)
            p.life -= 0.005; 
            
            // Twinkle math
            const twinkle = Math.sin(time + p.twinkleOffset) * 0.5 + 0.5; 
            const opacity = 0.5 + (twinkle * 0.5); // Min 0.5 opacity (Brighter)
            
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.life * opacity;
        }
        
        if(p.life <= 0) {
            particles.splice(i, 1);
            continue;
        }

        ctx.beginPath();
        if (p.type === 'ambient') {
            // Star circle
            ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
            ctx.fill();
            
            // Optional: Draw a subtle glow for large stars
            if (p.size > 2) {
                ctx.globalAlpha = ctx.globalAlpha * 0.3;
                ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI*2);
                ctx.fill();
            }
        } else {
            ctx.fillRect(p.x, p.y, p.size, p.size);
        }
      }
      
      animationId = requestAnimationFrame(render);
    };
    
    render();
    return () => {
        cancelAnimationFrame(animationId);
        canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isHovered, offsetFactor]);

  const handleDeleteClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation(); // CRITICAL: Stop event from bubbling to card click
      
      // Use window.confirm before deleting
      if (window.confirm("Are you sure you want to delete this artwork?")) {
          onDelete(item.id);
      }
  };

  return (
    <div 
      className="relative w-full h-full transition-all duration-300 ease-out"
      style={{
        transform: `scale(${scale})`,
        filter: `blur(${blur}px)`,
        opacity: opacity,
        zIndex: zIndex
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onClick(item)}
    >
      {/* Particle Canvas Layer */}
      <canvas ref={canvasRef} className="absolute inset-[-50px] w-[calc(100%+100px)] h-[calc(100%+100px)] pointer-events-none z-0" />

      {/* Main Card Container */}
      <div className="relative w-full h-full bg-zinc-950 overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.8)] border border-white/5 z-10 group cursor-pointer">
        
        {/* Media */}
        <div className="absolute inset-0 w-full h-full bg-zinc-900">
          {item.type === 'image' ? (
            <img 
              src={item.url} 
              alt={item.title} 
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <video 
              ref={videoRef}
              src={item.url} 
              className="w-full h-full object-cover"
              muted
              loop
              playsInline
            />
          )}
           <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-40' : 'opacity-80'}`} />
        </div>

        {/* Delete Button - High Z-Index Container */}
        {isHovered && (
            <div 
                className="absolute top-4 right-4 z-[999] animate-in fade-in slide-in-from-top-2 duration-200"
                style={{ pointerEvents: 'auto' }} // Ensure clicks register
                onMouseDown={(e) => e.stopPropagation()} // Stop drag initiation
            >
                <button
                    onClick={handleDeleteClick}
                    className="flex items-center justify-center w-10 h-10 bg-red-500/20 text-red-500 rounded-full hover:bg-red-600 hover:text-white transition-all backdrop-blur-md border border-red-500/30 hover:shadow-[0_0_15px_rgba(239,68,68,0.5)] cursor-pointer"
                    title="Delete Item"
                >
                    <Trash2 size={18} />
                </button>
            </div>
        )}

        {/* Play Icon - Show if it's a video and NOT playing (not hovered) */}
        {item.type === 'video' && !isHovered && (
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/50">
             <Play size={40} fill="currentColor" />
           </div>
        )}

        {/* Info */}
        <div className="absolute bottom-0 left-0 w-full p-6 z-20 pointer-events-none">
            <h3 className={`text-xl md:text-2xl font-bold tracking-tighter uppercase text-white mb-1 transition-all duration-300 ${isHovered ? 'translate-y-0 text-glow' : 'translate-y-0 opacity-80'}`}>
              {item.title}
            </h3>
            
            <div className={`overflow-hidden transition-all duration-300 ${isHovered ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}>
                <p className="text-zinc-500 text-[10px] md:text-xs font-medium tracking-widest uppercase border-l border-[#00CCFF] pl-3 mt-2">
                  {item.description}
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioItemCard;