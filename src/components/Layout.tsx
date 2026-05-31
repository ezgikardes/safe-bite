import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
        <footer className="border-t border-border bg-surface px-6 py-4">
          <p className="text-xs text-text-muted leading-relaxed">
            SafeBite is a self-tracking tool and is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider or registered dietitian about your individual dietary needs.
          </p>
        </footer>
      </div>
    </div>
  );
}
