"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { RegistrationStatus } from "@/components/home/RegistrationStatus";
import { SlotCounter } from "@/components/home/SlotCounter";
import { ActionButton } from "@/components/home/ActionButton";
import { PlayerList } from "@/components/home/PlayerList";
import { CricketBallAnimation } from "@/components/home/CricketBallAnimation";
import { useEvent } from "@/hooks/useEvent";
import { useRegistrations } from "@/hooks/useRegistrations";
import { usePlayer } from "@/hooks/usePlayer";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";

export default function HomePage() {
  const { event, loading: eventLoading, error: eventError } = useEvent();
  const { confirmed, waiting, loading: regsLoading } = useRegistrations(event?.id);
  const { localState, registerPlayer, cancelPlayer } = usePlayer(event?.id);
  const [showAnimation, setShowAnimation] = useState(false);

  const handleRegister = async (playerName: string): Promise<boolean> => {
    if (!event) return false;
    const result = await registerPlayer(playerName, event.id);
    if (result.success) {
      setShowAnimation(true);
      toast.success(`Welcome ${playerName}! You're in 🏏`);
      return true;
    } else {
      toast.error(result.error ?? "Registration failed.");
      return false;
    }
  };

  const handleCancel = async () => {
    const result = await cancelPlayer();
    if (result.success) {
      toast.success("Registration cancelled.");
    } else {
      toast.error(result.error ?? "Cancellation failed.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-10 space-y-10">
        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <section className="text-center space-y-5">
          <div className="space-y-2">
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight gradient-text">
              Friday Night Cricket
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg">
              First Come, First Served · 16 spots only
            </p>
          </div>

          {eventError ? (
            <div className="flex items-center justify-center gap-2 text-red-400 text-sm glass rounded-xl px-4 py-3 max-w-sm mx-auto">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {eventError}
            </div>
          ) : eventLoading ? (
            <div className="flex flex-col items-center gap-3">
              <Skeleton className="h-8 w-48 rounded-full shimmer" />
              <Skeleton className="h-4 w-32 rounded shimmer" />
            </div>
          ) : event ? (
            <RegistrationStatus event={event} />
          ) : null}
        </section>

        {/* ── Slot Counter ──────────────────────────────────────────────────── */}
        {event && !eventLoading && (
          <section>
            <SlotCounter event={event} />
          </section>
        )}

        {/* ── Action Button ─────────────────────────────────────────────────── */}
        {event && !eventLoading && (
          <section className="flex justify-center">
            <ActionButton
              event={event}
              localState={localState}
              onRegister={handleRegister}
              onCancel={handleCancel}
              onBallRelease={() => {}}
              isAnimating={false}
            />
          </section>
        )}

        {/* ── Player Lists ──────────────────────────────────────────────────── */}
        {event && (
          <section className="grid sm:grid-cols-2 gap-4">
            <PlayerList
              title="Confirmed Players"
              registrations={confirmed}
              loading={regsLoading}
              emptyMessage="No players yet. Be the first!"
              variant="confirmed"
              currentRegistrationId={localState?.registrationId}
            />
            <PlayerList
              title="Waiting List"
              registrations={waiting}
              loading={regsLoading}
              emptyMessage="Waiting list is empty."
              variant="waiting"
              currentRegistrationId={localState?.registrationId}
            />
          </section>
        )}
      </main>

      {/* Floating Registration Flow Animation Overlay */}
      {showAnimation && (
        <CricketBallAnimation onClose={() => setShowAnimation(false)} />
      )}

      <Footer />
    </div>
  );
}
