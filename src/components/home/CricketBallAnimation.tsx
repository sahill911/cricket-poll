"use client";

import { useEffect } from "react";

export function CricketBallAnimation({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 1500); // 1.5s flight duration
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none bg-transparent overflow-hidden">
      {/* High-Speed Cricket Ball Container */}
      <div className="absolute w-20 h-20 animate-[ballFlightPath_1.5s_cubic-bezier(0.25,1,0.5,1)_forwards]">
        <svg 
          width="100%" 
          height="100%" 
          viewBox="0 0 64 64" 
          className="overflow-visible filter drop-shadow-[0_0_12px_rgba(239,68,68,0.5)] animate-[ballSpin_1.5s_linear_infinite]"
        >
          <defs>
            {/* 3D Ball Shading */}
            <radialGradient id="ballShade" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="45%" stopColor="#b91c1c" />
              <stop offset="85%" stopColor="#7f1d1d" />
              <stop offset="100%" stopColor="#450a0a" />
            </radialGradient>
          </defs>

          {/* Ball Sphere */}
          <circle cx="32" cy="32" r="28" fill="url(#ballShade)" stroke="#7f1d1d" strokeWidth="1" />
          
          {/* White Stitched Seam (3D Curving effect) */}
          <path 
            d="M 32,4 A 28,28 0 0,0 32,60" 
            fill="none" 
            stroke="white" 
            strokeWidth="2.5" 
            strokeDasharray="3.5,3" 
          />
          {/* Seam borders */}
          <path 
            d="M 29,4 A 28,28 0 0,0 29,60" 
            fill="none" 
            stroke="white" 
            strokeWidth="0.8" 
            opacity="0.3" 
          />
          <path 
            d="M 35,4 A 28,28 0 0,0 35,60" 
            fill="none" 
            stroke="white" 
            strokeWidth="0.8" 
            opacity="0.3" 
          />
        </svg>
      </div>

      <style jsx global>{`
        @keyframes ballFlightPath {
          /* Starts bottom-left, offscreen */
          0% {
            left: -100px;
            bottom: -100px;
            transform: scale(0.6);
            opacity: 0.2;
          }
          15% {
            opacity: 1;
          }
          /* High-speed flight arc across the website screen */
          100% {
            left: 100vw;
            bottom: 75vh;
            transform: scale(1.3);
            opacity: 0;
          }
        }

        @keyframes ballSpin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(-360deg);
          }
        }
      `}</style>
    </div>
  );
}
