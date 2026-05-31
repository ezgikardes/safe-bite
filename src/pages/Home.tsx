import { Fragment } from "react";
import { Link } from "react-router-dom";
import {
  ScanLine,
  // ChevronRight,
  AlertTriangle,
  ShieldCheck,
  Heart,
} from "lucide-react";

const steps = [
  {
    icon: AlertTriangle,
    title: "Set your triggers",
    description:
      "Common reflux & gastritis triggers come built-in — add your own too.",
  },
  {
    icon: ScanLine,
    title: "Scan or search",
    description: "Use the camera or search any product.",
  },
  {
    icon: ShieldCheck,
    title: "See if it's safe",
    description: "Get an instant safe, caution, or risky badge.",
  },
  {
    icon: Heart,
    title: "Save your favorites",
    description: "Build your trusted list for quick access.",
  },
];

export default function Home() {
  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-primary px-10 py-12 text-white">
        <div className="relative z-10">
          <div className="pr-64">
            <h1 className="text-3xl font-bold leading-tight">
              Can I eat this?
            </h1>
            <p className="mt-3 text-base text-white/80">
              Reflux and gastritis turn every meal into a guessing game. Scan or
              search any product to see if it's safe for you.
            </p>
            <div className="mt-6 flex items-center gap-4">
              <Link
                to="/scan"
                className="flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-primary hover:bg-white/90 transition-colors">
                <ScanLine className="size-4" />
                Start Scanning
              </Link>
              <Link
                to="/search"
                className="text-sm text-white/80 hover:text-white transition-colors">
                Or search →
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute -right-12 -top-12 size-80 rounded-full bg-white/5" />
        <div className="absolute right-24 -bottom-16 size-64 rounded-full bg-white/5" />
        <div className="absolute right-4 top-4 size-40 rounded-full bg-white/5" />
      </div>

      {/* How it works */}
      <div>
        <h2 className="mb-4 text-base font-semibold text-text">How it works</h2>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-stretch lg:gap-0">
          {steps.map(({ icon: Icon, title, description }, index) => (
            <Fragment key={title}>
              <div className="flex-1 rounded-2xl border border-border bg-surface p-4 shadow-card">
                <div className="mb-3 w-fit rounded-full bg-primary-light p-2">
                  <Icon className="size-4 text-primary" />
                </div>
                <p className="text-sm font-semibold text-text">{title}</p>
                <p className="mt-1 text-xs text-text-secondary">
                  {description}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden h-px w-6 self-center bg-border lg:block" />
              )}
            </Fragment>
          ))}
        </div>
      </div>

      {/* Recent Scans */}
      {/* <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-text">
            Your Recent Scans
          </h2>
          <button className="flex items-center gap-1 text-sm text-primary hover:underline">
            View all history
            <ChevronRight className="size-4" />
          </button>
        </div>
        <p className="text-sm text-text-secondary">
          Scan a product to see your history here.
        </p>
      </div> */}
    </div>
  );
}
