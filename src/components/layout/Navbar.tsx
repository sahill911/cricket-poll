import { APP_NAME } from "@/constants";
import Link from "next/link";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full glass-strong border-b border-border/40">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg group-hover:shadow-green-500/30 transition-shadow">
            <span className="text-sm">🏏</span>
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-sm font-bold text-foreground tracking-tight">{APP_NAME}</span>
            <span className="text-[10px] text-muted-foreground">Friday Night · FCFS</span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          {/* Live indicator */}
          <div className="flex items-center gap-1.5 text-xs text-green-400/70">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="hidden sm:inline">Live</span>
          </div>

          <Link
            href="/admin"
            className="text-xs text-muted-foreground hover:text-foreground border border-border/50 hover:border-border px-3 py-1.5 rounded-lg transition-colors"
          >
            Admin
          </Link>
        </div>
      </div>
    </header>
  );
}
