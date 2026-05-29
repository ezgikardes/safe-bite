import { Link } from "react-router-dom";
import { ScanLine, ChevronRight } from "lucide-react";

export default function Home() {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-primary px-8 py-8 text-white">
        <div className="relative z-10 max-w-sm">
          <h1 className="text-2xl font-bold leading-tight">Can I eat this?</h1>
          <p className="mt-2 text-sm text-white/80">
            Scan any food item to get instant safety insights based on your personal health triggers.
          </p>
          <div className="mt-5 flex items-center gap-3">
            <Link
              to="/scan"
              className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-primary hover:bg-white/90 transition-colors"
            >
              <ScanLine className="size-4" />
              Start Scanning
            </Link>
            <Link to="/search" className="text-sm text-white/80 hover:text-white transition-colors">
              Or search →
            </Link>
          </div>
        </div>
        <div className="absolute -right-8 -top-8 size-48 rounded-full bg-white/5" />
        <div className="absolute -right-4 bottom-0 size-32 rounded-full bg-white/5" />
      </div>

      {/* Recent Scans */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-text">Your Recent Scans</h2>
          <button className="flex items-center gap-1 text-sm text-primary hover:underline">
            View all history
            <ChevronRight className="size-4" />
          </button>
        </div>
        <p className="text-sm text-text-secondary">Scan a product to see your history here.</p>
      </div>
    </div>
  );
}
