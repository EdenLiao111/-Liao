import React from 'react';
import { motion } from 'framer-motion';

const HolographicOverlay: React.FC = () => {
  const colorPurple = '#8A2BE2';
  const colorCyan = '#00FFFF';

  // --- Animation Variants ---

  // Pulse: Breathing effect for opacity and scale - Sequential timing
  const pulseVariant = (delay: number) => ({
    animate: {
      opacity: [0.15, 0.4, 0.15],
      scale: [0.98, 1.02, 0.98],
      filter: ['blur(1px)', 'blur(0px)', 'blur(1px)'],
      transition: {
        duration: 6,
        repeat: Infinity,
        delay: delay,
        ease: "easeInOut"
      }
    }
  });

  // Slow continuous rotation
  const rotateLinear = (duration: number) => ({
    animate: {
      rotate: 360,
      transition: {
        duration: duration,
        repeat: Infinity,
        ease: "linear"
      }
    }
  });

  return (
    <div className="absolute inset-0 pointer-events-none z-[5] flex items-center justify-center overflow-hidden mix-blend-screen">
      
      {/* --- 1. LEFT ELEMENT: THE DATA MATRIX (LATTICE) --- */}
      {/* Represents raw input / training data */}
      <motion.div 
        className="absolute"
        style={{ left: '2%', top: '50%', y: '-50%' }}
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.5 }}
      >
        <motion.div variants={pulseVariant(0)} animate="animate">
           <svg width="400" height="800" viewBox="0 0 400 800" overflow="visible">
              <defs>
                  <linearGradient id="gradLattice" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor={colorCyan} stopOpacity="0" />
                      <stop offset="30%" stopColor={colorPurple} stopOpacity="0.4" />
                      <stop offset="70%" stopColor={colorPurple} stopOpacity="0.4" />
                      <stop offset="100%" stopColor={colorCyan} stopOpacity="0" />
                  </linearGradient>
              </defs>
              
              {/* Vertical Data Streams */}
              {Array.from({ length: 12 }).map((_, i) => (
                  <motion.path 
                    key={`v-${i}`}
                    d={`M${i * 35} 100 V700`}
                    stroke="url(#gradLattice)"
                    strokeWidth={Math.random() > 0.5 ? 1 : 0.5}
                    fill="none"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ 
                        pathLength: [0.1, 0.6, 0.1], 
                        opacity: [0.1, 0.3, 0.1],
                        y: [0, 20, 0] 
                    }}
                    transition={{ 
                        duration: 3 + Math.random() * 4, 
                        repeat: Infinity, 
                        ease: "easeInOut",
                        delay: i * 0.2
                    }}
                  />
              ))}

              {/* Horizontal Connector Nodes */}
              {Array.from({ length: 20 }).map((_, i) => (
                  <motion.rect
                    key={`node-${i}`}
                    x={Math.random() * 380}
                    y={150 + Math.random() * 500}
                    width={Math.random() * 40 + 5}
                    height={2}
                    fill={colorCyan}
                    opacity="0.3"
                    animate={{ 
                        opacity: [0, 0.6, 0],
                        scaleX: [0.5, 1.5, 0.5]
                    }}
                    transition={{
                        duration: 2 + Math.random() * 3,
                        repeat: Infinity,
                        delay: Math.random() * 5
                    }}
                  />
              ))}

              {/* Floating Data Blocks */}
              {Array.from({ length: 5 }).map((_, i) => (
                  <motion.rect 
                    key={`block-${i}`}
                    x={0} y={0} width="20" height="20"
                    stroke={colorPurple} fill="none"
                    animate={{ 
                        x: [50, 350, 50],
                        y: [200 + i * 50, 300 + i * 60, 200 + i * 50],
                        opacity: [0, 0.5, 0],
                        rotate: [0, 90, 180]
                    }}
                    transition={{ duration: 10 + i, repeat: Infinity, ease: "linear" }}
                  />
              ))}
           </svg>
        </motion.div>
      </motion.div>


      {/* --- 2. TOP ELEMENT: THE GYROSCOPIC CORE (PROCESSING) --- */}
      {/* Represents the AI Model / Calculation */}
      <motion.div 
        className="absolute"
        style={{ top: '15%', left: '50%', x: '-50%' }}
        initial={{ opacity: 0, y: -100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, delay: 0.5 }}
      >
        <motion.div variants={pulseVariant(2)} animate="animate">
           <svg width="800" height="400" viewBox="0 0 800 400" overflow="visible">
               <defs>
                   <linearGradient id="gradRing" x1="0%" y1="0%" x2="100%" y2="0%">
                       <stop offset="0%" stopColor={colorPurple} stopOpacity="0.1" />
                       <stop offset="50%" stopColor={colorCyan} stopOpacity="0.5" />
                       <stop offset="100%" stopColor={colorPurple} stopOpacity="0.1" />
                   </linearGradient>
               </defs>

               <g transform="translate(400, 200)">
                   {/* Main Orbital Ring 1 */}
                   <motion.ellipse
                      rx="350" ry="100"
                      fill="none" stroke="url(#gradRing)" strokeWidth="1"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                   />
                   
                   {/* Main Orbital Ring 2 (Tilted) */}
                   <motion.ellipse
                      rx="320" ry="80"
                      fill="none" stroke={colorPurple} strokeWidth="0.5" strokeOpacity="0.4"
                      strokeDasharray="10, 20"
                      animate={{ rotate: -360 }}
                      transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
                   />

                   {/* Vertical Core Rings */}
                   <motion.ellipse
                      rx="50" ry="180"
                      fill="none" stroke={colorCyan} strokeWidth="0.5" strokeOpacity="0.3"
                      animate={{ rotateY: 360 }} // Framer motion rotateY works on div, SVG simpler to just rotate 2D
                      // Using basic 2D rotation for SVG simplicity
                      style={{ transformBox: "fill-box", transformOrigin: "center" }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                   />

                   {/* Center Reactor */}
                   <motion.circle 
                      r="40" 
                      fill="none" stroke={colorCyan} strokeWidth="2" strokeDasharray="5, 5"
                      animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                   />
                   <motion.circle 
                      r="20" 
                      fill={colorPurple} opacity="0.2"
                      animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.5, 0.2] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                   />
                   
                   {/* Scanning Beam */}
                   <motion.path
                      d="M-400 0 L400 0"
                      stroke={colorCyan} strokeWidth="1" opacity="0.3"
                      animate={{ opacity: [0, 0.5, 0], scaleY: [1, 5, 1] }}
                      transition={{ duration: 4, repeat: Infinity }}
                   />
               </g>
           </svg>
        </motion.div>
      </motion.div>


      {/* --- 3. RIGHT ELEMENT: THE GENERATIVE CLUSTER (CREATION) --- */}
      {/* Represents the output / crystalized result */}
      <motion.div 
        className="absolute"
        style={{ right: '5%', top: '50%', y: '-50%' }}
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.5, delay: 1.0 }}
      >
        <motion.div variants={pulseVariant(4)} animate="animate">
            <svg width="500" height="600" viewBox="0 0 500 600" overflow="visible">
                <g transform="translate(250, 300)">
                    {/* Central Crystal Form */}
                    <motion.path 
                        d="M0 -150 L120 -50 L80 120 L-80 120 L-120 -50 Z"
                        fill="none" stroke={colorCyan} strokeWidth="1" strokeOpacity="0.5"
                        animate={{ 
                            d: [
                                "M0 -150 L120 -50 L80 120 L-80 120 L-120 -50 Z",
                                "M0 -160 L130 -40 L90 130 L-90 130 L-130 -40 Z",
                                "M0 -150 L120 -50 L80 120 L-80 120 L-120 -50 Z"
                            ],
                            rotate: [0, 10, 0]
                        }}
                        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    />
                    
                    {/* Inner Mesh */}
                    <path d="M0 -150 L0 0 M120 -50 L0 0 M80 120 L0 0 M-80 120 L0 0 M-120 -50 L0 0" stroke={colorPurple} strokeWidth="0.5" opacity="0.3" />
                    
                    {/* Orbiting Satellite Shards */}
                    {[...Array(6)].map((_, i) => {
                        const angle = (i / 6) * Math.PI * 2;
                        const dist = 180;
                        return (
                            <motion.g 
                                key={`shard-${i}`}
                                animate={{ rotate: 360 }}
                                transition={{ duration: 20 + i * 5, repeat: Infinity, ease: "linear" }}
                            >
                                <motion.path
                                    d="M-15 -30 L15 -30 L0 30 Z"
                                    fill={colorPurple} fillOpacity="0.2" stroke={colorCyan} strokeWidth="0.5"
                                    transform={`translate(${Math.cos(angle)*dist}, ${Math.sin(angle)*dist})`}
                                    animate={{ 
                                        scale: [1, 1.2, 1],
                                        rotate: [0, 180, 360]
                                    }}
                                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                                />
                            </motion.g>
                        )
                    })}

                    {/* Expanding Rings */}
                    <motion.circle 
                        r="100" fill="none" stroke={colorPurple} strokeWidth="0.5" opacity="0.2"
                        animate={{ r: [100, 250], opacity: [0.2, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeOut" }}
                    />
                </g>
            </svg>
        </motion.div>
      </motion.div>

    </div>
  );
};

export default HolographicOverlay;