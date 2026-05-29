import { ScanLine, Barcode } from "lucide-react";

export default function Scan() {
  return (
    <div className="flex max-w-md flex-col items-center gap-6">
      <div>
        <h1 className="text-xl font-bold text-text">Scan a Product</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Point your camera at a barcode to get instant safety insights.
        </p>
      </div>

      {/* Camera viewfinder placeholder */}
      <div className="relative w-full overflow-hidden rounded-2xl border-2 border-dashed border-primary/30 bg-primary-subtle aspect-square flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-center px-6">
          <div className="rounded-full bg-primary-light p-4">
            <ScanLine className="size-10 text-primary" />
          </div>
          <p className="text-sm font-medium text-text">Camera access required</p>
          <p className="text-xs text-text-secondary">
            Camera functionality coming soon. Use manual entry below.
          </p>
        </div>

        {/* Corner guides */}
        <span className="absolute left-6 top-6 size-8 rounded-tl-lg border-l-2 border-t-2 border-primary" />
        <span className="absolute right-6 top-6 size-8 rounded-tr-lg border-r-2 border-t-2 border-primary" />
        <span className="absolute bottom-6 left-6 size-8 rounded-bl-lg border-b-2 border-l-2 border-primary" />
        <span className="absolute bottom-6 right-6 size-8 rounded-br-lg border-b-2 border-r-2 border-primary" />
      </div>

      {/* Manual barcode entry */}
      <div className="w-full rounded-xl border border-border bg-surface p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-text">
          <Barcode className="size-4 text-primary" />
          Enter barcode manually
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="e.g. 3017620422003"
            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-text placeholder:text-text-muted outline-none focus:border-primary transition-colors"
          />
          <button className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover transition-colors">
            Go
          </button>
        </div>
      </div>
    </div>
  );
}
