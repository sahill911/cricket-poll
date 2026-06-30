"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CricketEvent } from "@/types";
import { toast } from "sonner";
import { PlayCircle, StopCircle, RotateCcw, Loader2, Minus, Plus, Calendar } from "lucide-react";

interface AdminControlsProps {
  event: CricketEvent;
  adminPin: string;
}

async function callAdmin(endpoint: string, adminPin: string, body?: object) {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${adminPin}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

export function AdminControls({ event, adminPin }: AdminControlsProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [playerLimit, setPlayerLimit] = useState(event.playerLimit);
  const [waitlistLimit, setWaitlistLimit] = useState(event.waitlistLimit);

  // Registration opens at — stored as ISO string for the input
  const toLocalDatetimeValue = (ts: { toMillis?: () => number } | null | undefined) => {
    if (!ts) return "";
    const ms = typeof ts.toMillis === "function" ? ts.toMillis() : 0;
    if (!ms) return "";
    const d = new Date(ms);
    // format: YYYY-MM-DDTHH:mm
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const [openTime, setOpenTime] = useState(toLocalDatetimeValue(event.registrationOpensAt as unknown as { toMillis: () => number }));

  const handle = async (key: string, fn: () => Promise<{ success: boolean; error?: string }>) => {
    setLoading(key);
    try {
      const data = await fn();
      if (!data.success) toast.error(data.error ?? "Action failed.");
      else toast.success("Done ✓");
    } catch {
      toast.error("Network error.");
    } finally {
      setLoading(null);
    }
  };

  const isLoading = (key: string) => loading === key;

  return (
    <div className="space-y-4">
      {/* Registration controls */}
      <div className="glass rounded-xl p-5 space-y-4">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Registration
        </h3>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            disabled={!!loading || event.status === "open"}
            onClick={() => handle("open", () => callAdmin("/api/admin/open", adminPin))}
            className="border-green-500/40 text-green-400 hover:bg-green-500/10 gap-2 flex-1 sm:flex-none"
          >
            {isLoading("open") ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlayCircle className="w-4 h-4" />}
            Open Registration
          </Button>

          <Button
            variant="outline"
            disabled={!!loading || event.status === "closed"}
            onClick={() => handle("close", () => callAdmin("/api/admin/close", adminPin))}
            className="border-red-500/40 text-red-400 hover:bg-red-500/10 gap-2 flex-1 sm:flex-none"
          >
            {isLoading("close") ? <Loader2 className="w-4 h-4 animate-spin" /> : <StopCircle className="w-4 h-4" />}
            Close Registration
          </Button>

          <Button
            variant="outline"
            disabled={!!loading}
            onClick={() =>
              handle("reset", () =>
                callAdmin("/api/admin/reset", adminPin, { playerLimit, waitlistLimit, registrationOpensAt: openTime || undefined })
              )
            }
            className="border-blue-500/40 text-blue-400 hover:bg-blue-500/10 gap-2 flex-1 sm:flex-none"
          >
            {isLoading("reset") ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
            Reset for Next Week
          </Button>
        </div>
      </div>

      {/* Registration opens at */}
      <div className="glass rounded-xl p-5 space-y-4">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Schedule — Registration Opens At
        </h3>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[200px] flex flex-col gap-1.5">
            <label className="text-xs text-muted-foreground">Date &amp; Time (local)</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                type="datetime-local"
                value={openTime}
                onChange={(e) => setOpenTime(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-secondary/50 border border-border/60 text-foreground text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all"
              />
            </div>
          </div>
          <Button
            disabled={!!loading || !openTime}
            onClick={() =>
              handle("opentime", () =>
                callAdmin("/api/admin/set-open-time", adminPin, { registrationOpensAt: new Date(openTime).toISOString() })
              )
            }
            className="bg-blue-600 hover:bg-blue-500 text-white gap-2"
          >
            {isLoading("opentime") ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Save Time
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          This is informational — you still manually click &quot;Open Registration&quot; above.
        </p>
      </div>

      {/* Slot limits */}
      <div className="glass rounded-xl p-5 space-y-4">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Slot Limits
        </h3>
        <div className="flex flex-wrap gap-6 items-end">
          <div className="flex flex-col gap-2">
            <label className="text-xs text-muted-foreground">Player Limit</label>
            <div className="flex items-center gap-2">
              <Button size="icon" variant="outline" className="w-8 h-8" onClick={() => setPlayerLimit((v) => Math.max(1, v - 1))}>
                <Minus className="w-3 h-3" />
              </Button>
              <span className="text-lg font-bold w-8 text-center tabular-nums">{playerLimit}</span>
              <Button size="icon" variant="outline" className="w-8 h-8" onClick={() => setPlayerLimit((v) => Math.min(100, v + 1))}>
                <Plus className="w-3 h-3" />
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs text-muted-foreground">Waitlist Limit</label>
            <div className="flex items-center gap-2">
              <Button size="icon" variant="outline" className="w-8 h-8" onClick={() => setWaitlistLimit((v) => Math.max(0, v - 1))}>
                <Minus className="w-3 h-3" />
              </Button>
              <span className="text-lg font-bold w-8 text-center tabular-nums">{waitlistLimit}</span>
              <Button size="icon" variant="outline" className="w-8 h-8" onClick={() => setWaitlistLimit((v) => Math.min(20, v + 1))}>
                <Plus className="w-3 h-3" />
              </Button>
            </div>
          </div>

          <Button
            disabled={!!loading}
            onClick={() => handle("limits", () => callAdmin("/api/admin/set-limits", adminPin, { playerLimit, waitlistLimit }))}
            className="bg-purple-600 hover:bg-purple-500 text-white gap-2"
          >
            {isLoading("limits") ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Apply Limits
          </Button>
        </div>
      </div>
    </div>
  );
}
