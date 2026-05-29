import { NavLink } from "react-router-dom";
import {
  Home,
  Search,
  Heart,
  AlertTriangle,
  ScanLine,
  User,
} from "lucide-react";

// Navigation menu items with routes, labels, and their corresponding icons
const navItems = [
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/scan", label: "Scan", icon: ScanLine, end: false },
  { to: "/search", label: "Search", icon: Search, end: false },
  { to: "/my-favorite-products", label: "Favorites", icon: Heart, end: false },
  { to: "/my-triggers", label: "My Triggers", icon: AlertTriangle, end: false },
];

export default function Sidebar() {
  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-border bg-surface">
      <div className="px-5 py-5">
        <span className="text-xl font-bold text-primary">SafeBite</span>
        <p className="text-xs text-text-muted mt-0.5">Your Health Companion</p>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-0.5">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              // Dynamic styling: active links show primary background with primary text color
              // Inactive links show secondary text with hover effects
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary-light text-primary"
                  : "text-text-secondary hover:bg-background hover:text-text"
              }`
            }>
            <Icon className="size-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-border px-4 py-4">
        <div className="flex items-center gap-3">
          {/* TODO user sign-up feature */}
          <div className="flex size-8 items-center justify-center rounded-full bg-primary-light text-primary">
            <User className="size-4" />
          </div>
          <div>
            <p className="text-sm font-medium text-text leading-none">
              John Doe
            </p>
            <p className="text-xs text-text-muted mt-0.5">Free Member</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
