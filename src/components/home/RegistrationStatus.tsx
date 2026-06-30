import { CricketEvent } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Lock, Radio, Clock } from "lucide-react";

interface RegistrationStatusProps {
  event: CricketEvent;
}

const STATUS_CONFIG = {
  upcoming: {
    label: "Opening Soon",
    icon: Clock,
    badgeClass: "border-blue-500/40 text-blue-400 bg-blue-500/10",
    dotClass: "bg-blue-400",
  },
  open: {
    label: "Registration Open",
    icon: Radio,
    badgeClass: "border-green-500/40 text-green-400 bg-green-500/10 status-open",
    dotClass: "bg-green-400",
  },
  closed: {
    label: "Registration Closed",
    icon: Lock,
    badgeClass: "border-red-500/40 text-red-400 bg-red-500/10",
    dotClass: "bg-red-400",
  },
} as const;

export function RegistrationStatus({ event }: RegistrationStatusProps) {
  const cfg = STATUS_CONFIG[event.status];
  const Icon = cfg.icon;

  return (
    <div className="flex flex-col items-center gap-3">
      <Badge
        variant="outline"
        className={`px-4 py-1.5 text-sm font-semibold tracking-wide flex items-center gap-2 ${cfg.badgeClass}`}
      >
        <span className={`w-2 h-2 rounded-full ${cfg.dotClass}`} />
        <Icon className="w-3.5 h-3.5" />
        {cfg.label}
      </Badge>

      <p className="text-sm text-muted-foreground">
        {event.weekLabel}
      </p>
    </div>
  );
}
