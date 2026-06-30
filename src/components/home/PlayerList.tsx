import { Registration } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { User } from "lucide-react";

interface PlayerListProps {
  title: string;
  registrations: Registration[];
  loading: boolean;
  emptyMessage: string;
  variant: "confirmed" | "waiting";
  currentRegistrationId?: string | null;
}

function PlayerRow({
  reg,
  index,
  variant,
  isCurrentUser,
}: {
  reg: Registration;
  index: number;
  variant: "confirmed" | "waiting";
  isCurrentUser: boolean;
}) {
  const isConfirmed = variant === "confirmed";

  // Get initials from playerName
  const initials = reg.playerName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className={`player-row flex items-center gap-3 px-4 py-2.5 rounded-lg ${
        isCurrentUser
          ? isConfirmed
            ? "bg-green-500/10 border border-green-500/20"
            : "bg-amber-500/10 border border-amber-500/20"
          : "border border-transparent"
      }`}
    >
      {/* Position number */}
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
          isConfirmed ? "bg-green-500/20 text-green-400" : "bg-amber-500/20 text-amber-400"
        }`}
      >
        {index + 1}
      </div>

      {/* Avatar initials */}
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
          isConfirmed
            ? "bg-green-500/15 text-green-300"
            : "bg-amber-500/15 text-amber-300"
        }`}
      >
        {initials || <User className="w-3 h-3" />}
      </div>

      {/* Name */}
      <span
        className={`text-sm font-medium flex-1 truncate ${
          isCurrentUser ? (isConfirmed ? "text-green-400" : "text-amber-400") : "text-foreground"
        }`}
      >
        {reg.playerName}
        {isCurrentUser && <span className="ml-1.5 text-xs opacity-60">(you)</span>}
      </span>
    </div>
  );
}

export function PlayerList({
  title,
  registrations,
  loading,
  emptyMessage,
  variant,
  currentRegistrationId,
}: PlayerListProps) {
  const accentColor = variant === "confirmed" ? "text-green-400" : "text-amber-400";

  return (
    <div className="glass rounded-2xl p-5 space-y-4">
      <h2 className={`text-base font-bold flex items-center gap-2 ${accentColor}`}>
        <span className="w-1.5 h-4 rounded-full bg-current opacity-70" />
        {title}
        <span className="ml-auto text-xs font-normal text-muted-foreground">
          {registrations.length} player{registrations.length !== 1 ? "s" : ""}
        </span>
      </h2>

      {loading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-1 py-1">
              <Skeleton className="w-7 h-7 rounded-full shimmer" />
              <Skeleton className="w-7 h-7 rounded-full shimmer" />
              <Skeleton className="flex-1 h-4 rounded shimmer" />
            </div>
          ))}
        </div>
      ) : registrations.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">{emptyMessage}</p>
      ) : (
        <div className="space-y-1">
          {registrations.map((reg, i) => (
            <PlayerRow
              key={reg.registrationId}
              reg={reg}
              index={i}
              variant={variant}
              isCurrentUser={reg.registrationId === currentRegistrationId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
