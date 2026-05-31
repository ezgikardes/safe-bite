import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";
import { Barcode } from "lucide-react";

export default function Scan() {
  const navigate = useNavigate();
  const [manualCode, setManualCode] = useState("");
  const [manualError, setManualError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Keeps a reference to the scanner instance so it can be stopped during cleanup.
  const scannerRef = useRef<Html5Qrcode | null>(null);

  // Start the camera scanner when the page mounts; stop it when the user leaves.
  useEffect(() => {
    const scanner = new Html5Qrcode("reader");
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          // On successful scan: stop the camera and navigate to the product page.
          scanner.stop().then(() => navigate(`/product/${decodedText}`));
        },
        () => {
          // Per-frame decode errors are noisy; ignore them.
        },
      )
      .catch(() => setError("Camera access denied or not available."));

    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, [navigate]);

  // Manual entry: validate barcode format, then navigate to the product route.
  function handleManualSubmit(e: { preventDefault: () => void }) {
    e.preventDefault();
    const code = manualCode.trim();
    if (!/^\d{8,13}$/.test(code)) {
      setManualError("Barcode must be 8–13 digits.");
      return;
    }
    setManualError(null);
    navigate(`/product/${code}`);
  }

  return (
    <div className="max-w-md space-y-6">
      <div>
        <h1 className="text-xl font-bold text-text">Scan a Product</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Point your camera at a barcode to get instant safety insights.
        </p>
      </div>

      {/* Camera viewfinder - html5-qrcode injects the live video into #reader */}
      <div className="relative w-full overflow-hidden rounded-2xl border border-border bg-black aspect-square [&_video]:size-full [&_video]:object-cover [&>div]:border-0!">
        <div
          id="reader"
          className="w-full h-full"
        />

        {/* Corner guides overlay (purely decorative) */}
        <span className="pointer-events-none absolute left-6 top-6 size-8 rounded-tl-lg border-l-2 border-t-2 border-primary" />
        <span className="pointer-events-none absolute right-6 top-6 size-8 rounded-tr-lg border-r-2 border-t-2 border-primary" />
        <span className="pointer-events-none absolute bottom-6 left-6 size-8 rounded-bl-lg border-b-2 border-l-2 border-primary" />
        <span className="pointer-events-none absolute bottom-6 right-6 size-8 rounded-br-lg border-b-2 border-r-2 border-primary" />

        {/* Error state covers the camera area if access fails */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface p-6 text-center text-sm text-text-secondary">
            {error}
          </div>
        )}
      </div>

      {/* Manual barcode entry */}
      <form
        onSubmit={handleManualSubmit}
        className="w-full space-y-3 rounded-xl border border-border bg-surface p-4">
        <div className="flex items-center gap-2 text-sm font-medium text-text">
          <Barcode className="size-4 text-primary" />
          Enter barcode manually
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            inputMode="numeric"
            value={manualCode}
            onChange={(e) => {
              setManualCode(e.target.value);
              if (manualError) setManualError(null);
            }}
            placeholder="e.g. 3017620422003"
            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-text placeholder:text-text-muted outline-none focus:border-primary transition-colors"
          />
          <button
            type="submit"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover transition-colors">
            Go
          </button>
        </div>
        {manualError && (
          <p className="text-sm text-red-500">{manualError}</p>
        )}
      </form>
    </div>
  );
}
