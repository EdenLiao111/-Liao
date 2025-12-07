import React, { useEffect, useRef, useState } from 'react';
import HolographicOverlay from './HolographicOverlay';

interface CoverPageProps {
  onEnter: () => void;
  isExiting: boolean;
}

const CoverPage: React.FC<CoverPageProps> = ({ onEnter, isExiting }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isButtonHovered, setIsButtonHovered] = useState(false);

  // Particle System
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    let particles: TextParticle[] = [];
    let animationId: number;
    let width = canvas.width;
    let height = canvas.height;
    
    // Config
    const TEXT = "AIGC 作品集";
    // Responsive font size
    const FONT_SIZE = window.innerWidth < 768 ? 60 : 120; 
    
    // Colors
    const COLOR_PRIMARY = '157, 0, 255'; // #9D00FF Fluorescent Purple
    const COLOR_ACCENT = '100, 181, 246'; // #64B5F6 Ice Blue

    let mouse = { x: -1000, y: -1000, radius: 100 };

    class TextParticle {
      x: number;
      y: number;
      targetX: number;
      targetY: number;
      z: number; // Depth for 3D effect
      size: number;
      color: string;
      shape: 'circle' | 'square';
      vx: number;
      vy: number;
      friction: number;
      ease: number;

      constructor(targetX: number, targetY: number) {
        // Start from random screen edges (Gathering effect)
        const startSide = Math.floor(Math.random() * 4);
        if (startSide === 0) { this.x = Math.random() * width; this.y = -50; } // Top
        else if (startSide === 1) { this.x = width + 50; this.y = Math.random() * height; } // Right
        else if (startSide === 2) { this.x = Math.random() * width; this.y = height + 50; } // Bottom
        else { this.x = -50; this.y = Math.random() * height; } // Left

        this.targetX = targetX;
        this.targetY = targetY;
        
        // 3D Simulation properties
        this.z = Math.random() * 2 + 0.5; // 0.5 to 2.5
        this.size = (Math.random() * 2 + 1) * this.z; // Closer particles are bigger
        
        // Color mix
        this.color = Math.random() > 0.8 
          ? `rgba(${COLOR_ACCENT}, ${0.5 + Math.random() * 0.5})` 
          : `rgba(${COLOR_PRIMARY}, ${0.6 + Math.random() * 0.4})`;
        
        this.shape = Math.random() > 0.9 ? 'square' : 'circle';
        
        this.vx = 0;
        this.vy = 0;
        this.friction = 0.92;
        this.ease = 0.05 * Math.random();
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = this.color;
        
        if (this.shape === 'square') {
           ctx.fillRect(this.x, this.y, this.size, this.size);
        } else {
           ctx.beginPath();
           ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
           ctx.fill();
        }
      }

      update(isHoveringText: boolean, isHoveringButton: boolean) {
        // 1. Seek Target
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        
        // Basic easing towards target
        if (!isHoveringText) {
             this.x += dx * (this.ease + 0.02);
             this.y += dy * (this.ease + 0.02);
        }

        // 2. Mouse Interaction (Text Dispersal)
        const mdx = mouse.x - this.x;
        const mdy = mouse.y - this.y;
        const dist = Math.sqrt(mdx * mdx + mdy * mdy);
        
        if (dist < mouse.radius) {
          // Explode/Disperse
          const force = (mouse.radius - dist) / mouse.radius;
          const angle = Math.atan2(mdy, mdx);
          
          this.vx -= Math.cos(angle) * force * 5;
          this.vy -= Math.sin(angle) * force * 5;
          
          // Change to "AI Icons" (squares) momentarily on interaction
          if (Math.random() > 0.95) this.shape = 'square';
        }

        // 3. Button Gravity Field
        if (isHoveringButton) {
           // Pull slightly towards bottom center
           const btnX = width / 2;
           const btnY = height * 0.8;
           const bdx = btnX - this.x;
           const bdy = btnY - this.y;
           const bDist = Math.sqrt(bdx*bdx + bdy*bdy);
           
           if (bDist < 400) {
              this.vx += bdx * 0.0005;
              this.vy += bdy * 0.0005;
           }
        }

        // Physics update
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= this.friction;
        this.vy *= this.friction;

        // Return to circle shape slowly
        if (this.shape === 'square' && Math.random() > 0.99) this.shape = 'circle';
      }
    }

    const init = async () => {
      await document.fonts.ready;
      
      particles = [];
      width = canvas.width;
      height = canvas.height;
      
      ctx.clearRect(0,0, width, height);
      ctx.fillStyle = 'white';
      // Use bold font for better particle density
      ctx.font = `900 ${FONT_SIZE}px 'Rajdhani', sans-serif`; 
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const textX = width / 2;
      const textY = height / 2;
      
      ctx.fillText(TEXT, textX, textY);

      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;
      
      // Density sampling
      const gap = 3; 
      
      for (let y = 0; y < height; y += gap) {
        for (let x = 0; x < width; x += gap) {
          const index = (y * width + x) * 4;
          if (data[index + 3] > 128) {
             particles.push(new TextParticle(x, y));
          }
        }
      }
      ctx.clearRect(0,0, width, height);
    };

    const animate = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      
      // Global Breathing Effect for brightness
      const time = Date.now() * 0.001;
      const breathingAlpha = 0.8 + Math.sin(time) * 0.2;
      ctx.globalAlpha = breathingAlpha;
      
      // Connect Lines (Neural Network style) - Only for close neighbors to save perf
      // We only draw lines for a subset to simulate the network
      ctx.beginPath();
      ctx.strokeStyle = `rgba(${COLOR_PRIMARY}, 0.1)`;
      ctx.lineWidth = 0.5;
      
      // Check if hovering text
      const dx = mouse.x - (width/2);
      const dy = mouse.y - (height/2);
      const distToCenter = Math.sqrt(dx*dx + dy*dy);
      const isHoveringText = distToCenter < 200;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.update(isHoveringText, isButtonHovered);
        p.draw();
      }
      
      animationId = requestAnimationFrame(animate);
    };

    const handleResize = () => {
       if (containerRef.current) {
           canvas.width = containerRef.current.clientWidth;
           canvas.height = containerRef.current.clientHeight;
           init();
       }
    };
    
    // Use window listener to ensure mouse is tracked even if canvas is overlaid
    const handleMouseMove = (e: MouseEvent) => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        }
    };
    
    // External trigger for button hover state
    const setButtonHover = (e: CustomEvent) => {
        setIsButtonHovered(e.detail);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('button-hover' as any, setButtonHover as any);
    
    handleResize();
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('button-hover' as any, setButtonHover as any);
      cancelAnimationFrame(animationId);
    };
  }, [isButtonHovered]);

  const dispatchHover = (hovering: boolean) => {
      window.dispatchEvent(new CustomEvent('button-hover', { detail: hovering }));
      setIsButtonHovered(hovering);
  };

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-screen overflow-hidden bg-black transition-all duration-700 ease-in-out ${isExiting ? 'scale-[0.01] opacity-0 blur-xl' : 'scale-100 opacity-100'}`}
    >
      {/* 1. Background Neural Grid & Gradient */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Deep Purple Radial */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#2a0045] via-black to-black opacity-60"></div>
        {/* Grid Pattern */}
        <div 
            className="absolute inset-0 opacity-20"
            style={{
                backgroundImage: `linear-gradient(rgba(157, 0, 255, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(157, 0, 255, 0.2) 1px, transparent 1px)`,
                backgroundSize: '40px 40px',
                maskImage: 'radial-gradient(circle at center, black 40%, transparent 100%)'
            }}
        ></div>
      </div>

      {/* 1.5 NEW: Holographic Overlay (Behind text, top of background) */}
      <HolographicOverlay />

      {/* 2. Top Left Creator Info */}
      <div className="absolute top-8 left-8 md:top-12 md:left-12 z-20">
        <h3 className="text-[#9D00FF] font-bold text-sm tracking-[0.2em] uppercase drop-shadow-[0_0_8px_rgba(157,0,255,0.8)]">
           AIGC Creator <span className="text-zinc-500 mx-2">/</span> 廖雪娟
        </h3>
      </div>

      {/* 3. Main Canvas (Text & Particles) */}
      <canvas ref={canvasRef} className="absolute inset-0 z-10 w-full h-full" />

      {/* 4. Center Content Overlay */}
      <div className="absolute inset-0 z-30 flex flex-col items-center justify-center pointer-events-none">
         {/* Placeholder for Canvas Text area so we can position elements relative to it */}
         <div className="h-[200px] w-full mb-4"></div>

         {/* Subtitle */}
         <div className="flex flex-col items-center gap-2 animate-in fade-in duration-1000 slide-in-from-bottom-4 delay-500">
            <p className="text-zinc-400 text-xs md:text-sm font-light tracking-[0.5em] uppercase">
               AI-Generated Content <span className="text-[#64B5F6] mx-1">•</span> Creative Practice
            </p>
         </div>
      </div>

      {/* 5. Bottom Button Area */}
      <div className="absolute bottom-[15%] left-0 w-full flex justify-center z-40">
        <button 
          onClick={onEnter}
          onMouseEnter={() => dispatchHover(true)}
          onMouseLeave={() => dispatchHover(false)}
          className="relative group pointer-events-auto"
        >
          {/* Animated Gradient Border Ring */}
          <div className="absolute -inset-1 rounded-sm bg-gradient-to-r from-[#9D00FF] via-[#64B5F6] to-[#9D00FF] opacity-70 blur-sm group-hover:opacity-100 transition-opacity duration-300 animate-spin-slow"></div>
          
          {/* Main Button Body */}
          <div className="relative px-12 py-4 bg-black rounded-sm border border-white/10 overflow-hidden transition-transform duration-300 group-hover:scale-105">
            {/* Gradient Fill on Hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#9D00FF] to-[#00CCFF] opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            
            <div className="flex items-center gap-3">
               <span className="text-white font-bold tracking-[0.3em] text-sm uppercase group-hover:text-[#00CCFF] transition-colors">
                 进入作品集
               </span>
               <span className="text-[#9D00FF] group-hover:translate-x-1 transition-transform duration-300">→</span>
            </div>
          </div>
        </button>
      </div>

      <style>{`
        @keyframes spin-slow {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .animate-spin-slow {
            animation: spin-slow 4s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default CoverPage;