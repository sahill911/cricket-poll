"use client";

import { useState } from "react";
import { Registration } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { UserMinus, CheckCircle2, Loader2, Clock, Copy } from "lucide-react";

interface AdminPlayerTableProps {
  confirmed: Registration[];
  waiting: Registration[];
  loading: boolean;
  adminPin: string;
}

async function cancelPlayerApi(registrationId: string, adminPin: string) {
  const res = await fetch("/api/admin/cancel-player", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${adminPin}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ registrationId }),
  });
  return res.json();
}

function PlayerRow({
  reg,
  position,
  adminPin,
}: {
  reg: Registration;
  position: number;
  adminPin: string;
}) {
  const [loading, setLoading] = useState(false);

  const initials = reg.playerName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleCancel = async () => {
    setLoading(true);
    try {
      const data = await cancelPlayerApi(reg.registrationId, adminPin);
      if (!data.success) toast.error(data.error ?? "Failed.");
      else toast.success(`${reg.playerName} removed.`);
    } catch {
      toast.error("Network error.");
    } finally {
      setLoading(false);
    }
  };

  const isConfirmed = reg.status === "confirmed";

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-transparent hover:border-border/50 hover:bg-secondary/30 transition-all group">
      <span className="text-xs font-bold text-muted-foreground w-5 text-center shrink-0">{position}</span>

      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
        isConfirmed ? "bg-green-500/15 text-green-300" : "bg-amber-500/15 text-amber-300"
      }`}>
        {initials}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{reg.playerName}</p>
      </div>

      <Badge
        variant="outline"
        className={isConfirmed
          ? "border-green-500/40 text-green-400 bg-green-500/10 shrink-0"
          : "border-amber-500/40 text-amber-400 bg-amber-500/10 shrink-0"
        }
      >
        {isConfirmed ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
        {isConfirmed ? "Confirmed" : `Wait #${reg.position}`}
      </Badge>

      <Button
        size="icon"
        variant="ghost"
        disabled={loading}
        onClick={handleCancel}
        className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:bg-red-500/10 hover:text-red-300 shrink-0"
        title="Remove player"
      >
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserMinus className="w-3.5 h-3.5" />}
      </Button>
    </div>
  );
}

export function AdminPlayerTable({ confirmed, waiting, loading, adminPin }: AdminPlayerTableProps) {
  const allPlayers = [...confirmed, ...waiting];

  const handleCopyList = () => {
    if (allPlayers.length === 0) {
      toast.error("No players to copy!");
      return;
    }

    const text = allPlayers.map((r) => r.playerName).join(", ");
    navigator.clipboard.writeText(text);
    toast.success("Player list copied to clipboard!");
  };

  return (
    <div className="glass rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">All Players</h3>
          <span className="text-xs text-muted-foreground">({allPlayers.length} registered)</span>
        </div>
        {allPlayers.length > 0 && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleCopyList}
            className="h-7 text-xs border-green-500/30 text-green-400 hover:bg-green-500/10 hover:text-green-300 font-semibold gap-1.5 rounded-lg transition-all"
          >
            <Copy className="w-3 h-3" />
            Copy List
          </Button>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              <Skeleton className="w-5 h-3 rounded shimmer" />
              <Skeleton className="w-8 h-8 rounded-full shimmer" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-3.5 w-32 rounded shimmer" />
              </div>
              <Skeleton className="h-5 w-20 rounded-full shimmer" />
            </div>
          ))}
        </div>
      ) : allPlayers.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No players registered yet.</p>
      ) : (
        <div className="space-y-1">
          {confirmed.map((reg, i) => (
            <PlayerRow key={reg.registrationId} reg={reg} position={i + 1} adminPin={adminPin} />
          ))}
          {waiting.length > 0 && (
            <>
              <div className="h-px bg-border/50 my-2" />
              <p className="text-xs text-amber-400/70 px-4 pb-1 font-medium uppercase tracking-wider">Waiting List</p>
              {waiting.map((reg, i) => (
                <PlayerRow key={reg.registrationId} reg={reg} position={i + 1} adminPin={adminPin} />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
