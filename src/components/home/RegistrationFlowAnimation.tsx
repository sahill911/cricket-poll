"use client";

import { useEffect, useState } from "react";

interface FlowAnimationProps {
  buttonRect: DOMRect;
  cardRect: DOMRect;
  playerName: string;
  targetCount: number; // Count of the list they registered for
  isWaiting: boolean;
  onBallImpact: () => void; // Triggered when scoreboard updates
  onComplete: () => void;
}

export function RegistrationFlowAnimation({
  playerName,
  targetCount,
  isWaiting,
  onBallImpact,
  onComplete,
}: FlowAnimationProps) {
  const [step, setStep] = useState<'zoom' | 'lights' | 'walk' | 'scoreboard' | 'cheer' | 'avatar'>('zoom');
  const [displayedCount, setDisplayedCount] = useState(targetCount > 0 ? targetCount - 1 : 0);

  const initials = playerName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  useEffect(() => {
    // Cinematic Step Timings
    const timers = [
      setTimeout(() => setStep('lights'), 500),       // 0.5s: Floodlights turn on
      setTimeout(() => setStep('walk'), 1000),       // 1.0s: Silhouette walks in
      setTimeout(() => {
        setStep('scoreboard');
        setDisplayedCount(targetCount);              // 2.2s: Scoreboard updates
        onBallImpact();                              // Notify parent to sync count
      }, 2200),
      setTimeout(() => setStep('cheer'), 2800),       // 2.8s: Crowd cheers / ripples
      setTimeout(() => setStep('avatar'), 3400),      // 3.4s: Avatar appears
      setTimeout(() => onComplete(), 4200),           // 4.2s: Done
    ];

    return () => timers.forEach(clearTimeout);
  }, [targetCount, onBallImpact, onComplete]);

  // Particles for scoreboard confetti (green for confirmed, amber for waitlist)
  const particles = [...Array(30)].map((_, i) => {
    const angle = (i * 360) / 30 + Math.random() * 12;
    const distance = 50 + Math.random() * 80;
    const delay = Math.random() * 0.15;
    return { id: i, angle, distance, delay };
  });

  return (
    <div className="fixed inset-0 z-[120] bg-slate-950/98 backdrop-blur-md flex flex-col items-center justify-center overflow-hidden transition-all duration-700 animate-[screenZoom_0.6s_ease-out_forwards]">
      
      {/* 1. FLOODLIGHTS (Beams) */}
      {(step !== 'zoom') && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Left Floodlight */}
          <div className={`absolute top-0 left-0 w-[45vw] h-[90vh] origin-top-left rotate-[25deg] bg-gradient-to-br blur-md opacity-0 animate-[lightTurnOn_0.8s_ease-out_forwards] ${
            isWaiting 
              ? "from-amber-500/20 via-amber-500/5 to-transparent" 
              : "from-green-500/25 via-green-500/5 to-transparent"
          }`} />
          {/* Right Floodlight */}
          <div className={`absolute top-0 right-0 w-[45vw] h-[90vh] origin-top-right rotate-[-25deg] bg-gradient-to-bl blur-md opacity-0 animate-[lightTurnOn_0.8s_ease-out_forwards_0.2s] ${
            isWaiting 
              ? "from-amber-500/20 via-amber-500/5 to-transparent" 
              : "from-green-500/25 via-green-500/5 to-transparent"
          }`} />
          
          {/* Spotlight Source Bubbles */}
          <div className="absolute top-2 left-[10vw] w-12 h-6 bg-white/40 blur-sm rounded-full" />
          <div className="absolute top-2 right-[10vw] w-12 h-6 bg-white/40 blur-sm rounded-full" />
        </div>
      )}

      {/* 2. STADIUM RETRO SCOREBOARD */}
      {(step === 'scoreboard' || step === 'cheer' || step === 'avatar') && (
        <div className="absolute top-16 scale-90 sm:scale-100 flex flex-col items-center gap-2 z-20">
          <div className={`border-4 bg-black px-8 py-4 rounded-xl font-mono text-center shadow-lg animate-[scoreboardPop_0.5s_cubic-bezier(0.175,0.885,0.32,1.275)_forwards] ${
            isWaiting 
              ? "border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.3)]" 
              : "border-green-500 shadow-[0_0_30px_rgba(16,185,129,0.3)]"
          }`}>
            <div className={`text-[10px] uppercase tracking-widest font-black ${
              isWaiting ? "text-amber-500/60" : "text-green-500/60"
            }`}>
              {isWaiting ? "WAITING LIST SPOTS" : "CONFIRMED PLAYERS"}
            </div>
            <div className={`text-5xl font-black mt-1 flex items-center justify-center gap-2 tracking-wider ${
              isWaiting ? "text-amber-400" : "text-green-400"
            }`}>
              <span>{String(displayedCount).padStart(2, '0')}</span>
              <span className={isWaiting ? "text-amber-950" : "text-green-950"}>/</span>
              <span className={isWaiting ? "text-amber-700" : "text-green-700"}>
                {isWaiting ? "02" : "16"}
              </span>
            </div>
          </div>

          {/* Confetti Explosion from Scoreboard */}
          {step === 'scoreboard' && (
            <div className="relative w-2 h-2">
              {particles.map((p) => (
                <div
                  key={p.id}
                  className={`absolute w-2.5 h-2.5 rounded-full animate-[confettiBurst_1.2s_cubic-bezier(0.1,0.8,0.3,1)_forwards] ${
                    isWaiting ? "bg-amber-400" : "bg-green-400"
                  }`}
                  style={{
                    "--angle": `${p.angle}deg`,
                    "--dist": `${p.distance}px`,
                    animationDelay: `${p.delay}s`,
                  } as React.CSSProperties}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. CENTER STAGE ARENA */}
      <div className="relative w-[300px] h-[350px] flex items-center justify-center mt-20">
        
        {/* Walking Silhouette Batter */}
        {(step === 'walk' || step === 'lights') && (
          <div className="absolute bottom-10 animate-[playerWalk_1.8s_ease-out_forwards] flex flex-col items-center">
            <svg width="120" height="180" viewBox="0 0 120 180" className="overflow-visible text-slate-800">
              {/* Head */}
              <circle cx="60" cy="40" r="16" fill="currentColor" />
              
              {/* Torso */}
              <line x1="60" y1="56" x2="60" y2="120" stroke="currentColor" strokeWidth="6" />
              
              {/* Left Leg (Walking) */}
              <line 
                x1="60" 
                y1="120" 
                x2="40" 
                y2="170" 
                stroke="currentColor" 
                strokeWidth="6" 
                strokeLinecap="round"
                className="animate-[legSwingLeft_0.6s_ease-in-out_infinite]"
              />
              
              {/* Right Leg (Walking) */}
              <line 
                x1="60" 
                y1="120" 
                x2="80" 
                y2="170" 
                stroke="currentColor" 
                strokeWidth="6" 
                strokeLinecap="round"
                className="animate-[legSwingRight_0.6s_ease-in-out_infinite]"
              />
              
              {/* Arms carrying bat on shoulder */}
              <line x1="60" y1="75" x2="85" y2="60" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
              <line x1="60" y1="75" x2="40" y2="70" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
              
              {/* Bat on shoulder */}
              <path d="M75,65 L115,25 L120,30 L80,70 Z" fill="#475569" stroke="#334155" strokeWidth="1.5" />
            </svg>
          </div>
        )}

        {/* 4. CROWD CHEER RIPPLES */}
        {step === 'cheer' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`absolute w-24 h-24 rounded-full border-4 animate-[cheerRipple_1s_ease-out_infinite] ${
              isWaiting ? "border-amber-500/40" : "border-green-500/40"
            }`} />
            <div className="absolute w-24 h-24 rounded-full border-4 border-white/20 animate-[cheerRipple_1s_ease-out_infinite_0.3s]" />
          </div>
        )}

        {/* 5. FINISHED PLAYER AVATAR POP-UP */}
        {step === 'avatar' && (
          <div className="absolute bottom-12 flex flex-col items-center gap-4 animate-[avatarReveal_0.6s_cubic-bezier(0.34,1.56,0.64,1)_forwards]">
            {/* Avatar Bubble */}
            <div className={`w-28 h-28 rounded-full border-4 flex items-center justify-center text-3xl font-black shadow-inner ${
              isWaiting
                ? "from-amber-500/20 to-amber-500/10 border-amber-400 text-amber-300 shadow-[0_0_40px_rgba(245,158,11,0.3)]"
                : "from-green-500/20 to-emerald-500/10 border-green-400 text-green-300 shadow-[0_0_40px_rgba(16,185,129,0.3)]"
            }`}>
              {initials}
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-foreground">{playerName}</h3>
              <p className={`text-xs font-semibold uppercase tracking-wider mt-1 ${
                isWaiting ? "text-amber-400" : "text-green-400"
              }`}>
                {isWaiting ? "JOINED WAITING LIST" : "LOCKED IN!"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* STADIUM LIGHT BEAM OVERLAY CSS */}
      <style jsx global>{`
        @keyframes screenZoom {
          0% { transform: scale(0.95); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }

        @keyframes lightTurnOn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }

        @keyframes scoreboardPop {
          0% { transform: scale(0.6); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }

        @keyframes playerWalk {
          0% {
            transform: translateX(-150px) scale(0.85);
            opacity: 0;
          }
          15% {
            opacity: 1;
          }
          100% {
            transform: translateX(0) scale(1);
            opacity: 1;
          }
        }

        @keyframes legSwingLeft {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-25deg); }
        }

        @keyframes legSwingRight {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(25deg); }
        }

        @keyframes cheerRipple {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(3.5); opacity: 0; }
        }

        @keyframes confettiBurst {
          0% { transform: translate(0, 0) scale(1); opacity: 1; }
          100% {
            transform: translate(
              calc(cos(var(--angle)) * var(--dist)),
              calc(sin(var(--angle)) * var(--dist) + 40px)
            ) scale(0.3);
            opacity: 0;
          }
        }

        @keyframes avatarReveal {
          0% { transform: scale(0.5) translateY(30px); opacity: 0; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
