import { APP_NAME } from "@/constants";

export function Footer() {
  return (
    <footer className="border-t border-border/40 mt-16 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="text-base">🏏</span>
          <span className="font-medium text-foreground/70">{APP_NAME}</span>
          <span>·</span>
          <span>First Come, First Served</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Max 16 players · 2 waiting</span>
        </div>
      </div>
    </footer>
  );
}
