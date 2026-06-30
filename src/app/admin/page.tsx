"use client";

import { useState, useEffect, useCallback } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AdminStats } from "@/components/admin/AdminStats";
import { AdminControls } from "@/components/admin/AdminControls";
import { AdminPlayerTable } from "@/components/admin/AdminPlayerTable";
import { useEvent } from "@/hooks/useEvent";
import { useRegistrations } from "@/hooks/useRegistrations";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Activity, KeyRound, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

const PIN_SESSION_KEY = "cricket_admin_pin";

// ── PIN Gate Component ────────────────────────────────────────────────────────

function PinGate({ onSuccess }: { onSuccess: (pin: string) => void }) {
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPin, setShowPin] = useState(false);

  const verify = async () => {
    if (!pin.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      const data = await res.json();
      if (data.success) {
        sessionStorage.setItem(PIN_SESSION_KEY, pin);
        onSuccess(pin);
      } else {
        toast.error("Incorrect PIN. Try again.");
        setPin("");
      }
    } catch {
      toast.error("Network error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="glass rounded-2xl p-8 w-full max-w-sm space-y-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto">
            <KeyRound className="w-7 h-7 text-amber-400" />
          </div>
          <div>
            <h1 className="text-xl font-black text-foreground">Admin Access</h1>
            <p className="text-sm text-muted-foreground mt-1">Enter your admin PIN to continue</p>
          </div>

          <div className="relative">
            <input
              type={showPin ? "text" : "password"}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && verify()}
              placeholder="Enter PIN..."
              className="w-full px-4 py-3 pr-12 rounded-xl bg-secondary/50 border border-border/60 text-foreground placeholder:text-muted-foreground text-center text-xl tracking-widest focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition-all"
              disabled={loading}
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPin(!showPin)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <Button
            onClick={verify}
            disabled={loading || !pin.trim()}
            className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-3 rounded-xl gap-2 transition-all"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            Enter Admin Panel
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
}

// ── Main Admin Page ───────────────────────────────────────────────────────────

export default function AdminPage() {
  const [adminPin, setAdminPin] = useState<string | null>(null);
  const { event, loading: eventLoading, error: eventError } = useEvent();
  const { confirmed, waiting, loading: regsLoading } = useRegistrations(event?.id);

  // Check sessionStorage for saved PIN on mount
  useEffect(() => {
    const saved = sessionStorage.getItem(PIN_SESSION_KEY);
    if (saved) setAdminPin(saved);
  }, []);

  const signOut = useCallback(() => {
    sessionStorage.removeItem(PIN_SESSION_KEY);
    setAdminPin(null);
  }, []);

  if (!adminPin) {
    return <PinGate onSuccess={setAdminPin} />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-10 space-y-8">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-foreground">Admin Panel</h1>
              <p className="text-sm text-muted-foreground">{event?.weekLabel ?? "No active event"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-green-400/70">
              <Activity className="w-3.5 h-3.5 animate-pulse" />
              <span>Realtime</span>
            </div>
            <button
              onClick={signOut}
              className="text-xs text-muted-foreground hover:text-foreground border border-border/50 hover:border-border px-3 py-1.5 rounded-lg transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* ── Error ───────────────────────────────────────────────────────── */}
        {eventError && (
          <div className="flex items-center gap-2 text-red-400 text-sm glass rounded-xl px-4 py-3">
            {eventError}
          </div>
        )}

        {/* ── Stats ───────────────────────────────────────────────────────── */}
        {eventLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl shimmer" />)}
          </div>
        ) : event ? (
          <AdminStats event={event} />
        ) : (
          <div className="glass rounded-xl p-6 text-center text-muted-foreground text-sm">
            No event found. Use &quot;Reset for Next Week&quot; below to create one.
          </div>
        )}

        {/* ── Controls ────────────────────────────────────────────────────── */}
        {event && <AdminControls event={event} adminPin={adminPin} />}

        {/* ── Player Table ─────────────────────────────────────────────────── */}
        {event && (
          <AdminPlayerTable
            confirmed={confirmed}
            waiting={waiting}
            loading={regsLoading}
            adminPin={adminPin}
          />
        )}

        {/* ── No event ────────────────────────────────────────────────────── */}
        {!event && !eventLoading && (
          <div className="glass rounded-xl p-6 space-y-4 text-center">
            <p className="text-muted-foreground text-sm">No event configured. Create the first event:</p>
            <button
              onClick={async () => {
                try {
                  const res = await fetch("/api/admin/reset", {
                    method: "POST",
                    headers: {
                      Authorization: `Bearer ${adminPin}`,
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({}),
                  });
                  const data = await res.json();
                  if (!data.success) toast.error(data.error);
                  else toast.success("Event created!");
                } catch { toast.error("Network error."); }
              }}
              className="px-6 py-2.5 bg-green-500 text-black font-bold rounded-xl hover:bg-green-400 transition-colors"
            >
              🏏 Initialize First Event
            </button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
