import { CricketEvent } from "@/types";
import { Users, Clock } from "lucide-react";

interface SlotCounterProps {
  event: CricketEvent;
}

function SlotBar({
  current,
  max,
  colorClass,
}: {
  current: number;
  max: number;
  colorClass: string;
}) {
  const pct = max > 0 ? Math.min(100, (current / max) * 100) : 0;
  return (
    <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-700 ease-out ${colorClass}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function SlotCounter({ event }: SlotCounterProps) {
  const confirmedFull = event.confirmedCount >= event.playerLimit;
  const waitingFull = event.waitingCount >= event.waitlistLimit;

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col gap-4">
      {/* Confirmed Slot */}
      <div className="glass rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Users className="w-4 h-4 text-green-400" />
            Confirmed
          </div>
          <div className="flex items-baseline gap-1">
            <span
              className={`text-2xl font-black tabular-nums ${
                confirmedFull ? "text-glow-green" : "text-foreground"
              }`}
            >
              {event.confirmedCount}
            </span>
            <span className="text-sm text-muted-foreground font-medium">/ {event.playerLimit}</span>
          </div>
        </div>
        <SlotBar
          current={event.confirmedCount}
          max={event.playerLimit}
          colorClass="slot-bar"
        />
        {confirmedFull && (
          <p className="text-xs text-green-400/80 text-center font-medium">
            ✓ All confirmed slots filled
          </p>
        )}
      </div>

      {/* Waiting Slot */}
      <div className="glass rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Clock className="w-4 h-4 text-amber-400" />
            Waiting List
          </div>
          <div className="flex items-baseline gap-1">
            <span
              className={`text-2xl font-black tabular-nums ${
                waitingFull ? "text-glow-amber" : "text-foreground"
              }`}
            >
              {event.waitingCount}
            </span>
            <span className="text-sm text-muted-foreground font-medium">/ {event.waitlistLimit}</span>
          </div>
        </div>
        <SlotBar
          current={event.waitingCount}
          max={event.waitlistLimit}
          colorClass="slot-bar slot-bar-amber"
        />
        {waitingFull && (
          <p className="text-xs text-amber-400/80 text-center font-medium">
            ✗ Waiting list full — Registration Closed
          </p>
        )}
      </div>
    </div>
  );
}
