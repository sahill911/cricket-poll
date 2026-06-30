"use client";

import { CricketEvent } from "@/types";
import { Users, Clock, TrendingUp, Activity } from "lucide-react";

interface AdminStatsProps {
  event: CricketEvent;
}

function StatCard({
  label,
  value,
  subValue,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  subValue?: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="glass rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className={`text-3xl font-black tabular-nums ${color}`}>{value}</span>
        {subValue && (
          <span className="text-sm text-muted-foreground">{subValue}</span>
        )}
      </div>
    </div>
  );
}

export function AdminStats({ event }: AdminStatsProps) {
  const totalRegistered = event.confirmedCount + event.waitingCount;
  const totalCapacity = event.playerLimit + event.waitlistLimit;
  const fillPct = totalCapacity > 0 ? Math.round((totalRegistered / totalCapacity) * 100) : 0;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <StatCard
        label="Confirmed"
        value={event.confirmedCount}
        subValue={`/ ${event.playerLimit}`}
        icon={Users}
        color="text-green-400"
      />
      <StatCard
        label="Waiting"
        value={event.waitingCount}
        subValue={`/ ${event.waitlistLimit}`}
        icon={Clock}
        color="text-amber-400"
      />
      <StatCard
        label="Total"
        value={totalRegistered}
        subValue={`/ ${totalCapacity}`}
        icon={TrendingUp}
        color="text-blue-400"
      />
      <StatCard
        label="Fill Rate"
        value={`${fillPct}%`}
        icon={Activity}
        color={fillPct === 100 ? "text-red-400" : "text-purple-400"}
      />
    </div>
  );
}
