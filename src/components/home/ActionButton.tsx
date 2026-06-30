"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CricketEvent, LocalPlayerState } from "@/types";
import { UserPlus, UserMinus, Loader2 } from "lucide-react";

interface ActionButtonProps {
  event: CricketEvent;
  localState: LocalPlayerState | null;
  onRegister: (name: string) => Promise<boolean>;
  onCancel: () => Promise<void>;
  onBallRelease?: (btnRect: DOMRect) => void;
  isAnimating?: boolean;
}

export function ActionButton({
  event,
  localState,
  onRegister,
  onCancel,
}: ActionButtonProps) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || name.trim().length < 2) return;
    setLoading(true);
    try {
      await onRegister(name);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    setLoading(true);
    try {
      await onCancel();
    } finally {
      setLoading(false);
    }
  };

  // Already registered
  if (localState) {
    const isWaiting = localState.status === "waiting";
    const initials = localState.playerName
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

    return (
      <div className="flex flex-col items-center gap-4 w-full max-w-sm mx-auto animate-[avatarPopIn_0.5s_cubic-bezier(0.34,1.56,0.64,1)_forwards]">
        {/* Sleek Player Avatar Card */}
        <div className="w-full glass rounded-2xl p-5 border border-border/80 flex flex-col items-center text-center gap-3 relative overflow-hidden shadow-xl">
          {/* Glowing Green/Amber indicator */}
          <div className={`absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${
            isWaiting 
              ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
              : "border-green-500/30 bg-green-500/10 text-green-400 pulse-ring"
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isWaiting ? "bg-amber-400" : "bg-green-400"}`} />
            {isWaiting ? "Waiting List" : "Confirmed"}
          </div>

          {/* Initials Avatar Bubble */}
          <div className={`w-16 h-16 rounded-full flex items-center justify-center text-lg font-black shadow-inner border-2 ${
            isWaiting
              ? "bg-amber-500/10 border-amber-500/30 text-amber-300 shadow-amber-500/5"
              : "bg-green-500/10 border-green-500/30 text-green-300 shadow-green-500/5"
          }`}>
            {initials}
          </div>

          <div className="space-y-1">
            <h4 className="text-base font-bold text-foreground leading-tight">{localState.playerName}</h4>
            <p className="text-xs text-muted-foreground">
              {isWaiting ? "We'll notify you if a slot opens up!" : "You are locked in for Friday night!"}
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          disabled={loading}
          onClick={handleCancel}
          className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 transition-all gap-2 rounded-xl"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserMinus className="w-4 h-4" />}
          Cancel My Registration
        </Button>

        <style jsx global>{`
          @keyframes avatarPopIn {
            0% {
              transform: scale(0.85);
              opacity: 0;
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }
        `}</style>
      </div>
    );
  }

  // Registration not open
  if (event.status !== "open") {
    return (
      <div className="w-full max-w-sm mx-auto">
        <Button
          size="lg"
          disabled
          className="w-full py-6 text-base rounded-xl opacity-50 cursor-not-allowed"
        >
          {event.status === "upcoming" ? "Registration Open Soon" : "Registration Closed"}
        </Button>
      </div>
    );
  }

  // Registration open — show name input
  return (
    <div className="w-full max-w-sm mx-auto flex flex-col gap-3">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleRegister()}
        placeholder="Enter your name..."
        maxLength={40}
        className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border/60 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/30 transition-all"
        disabled={loading}
        autoFocus
      />
      <Button
        size="lg"
        disabled={loading || name.trim().length < 2}
        onClick={handleRegister}
        className="w-full bg-green-500 hover:bg-green-400 text-black font-bold py-6 text-base rounded-xl gap-2 transition-all hover:shadow-xl hover:shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <UserPlus className="w-5 h-5" />
        )}
        Join the Game
      </Button>
      <p className="text-xs text-muted-foreground text-center">
        Use the same name your teammates know you by
      </p>
    </div>
  );
}
