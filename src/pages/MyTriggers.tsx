import { useEffect, useState } from "react";
import { AlertTriangle, Plus, X } from "lucide-react";

export default function MyTriggers() {
  // State to store list of trigger ingredients user wants to avoid
  // Lazy initializer with try/catch prevents corrupted localStorage from crashing the app
  const [savedTriggers, setSavedTriggers] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("myTriggers") ?? "[]");
    } catch {
      return [];
    }
  });

  const [newTrigger, setNewTrigger] = useState<string>("");

  // Side effect: automatically save triggers to localStorage whenever the list changes
  useEffect(() => {
    localStorage.setItem("myTriggers", JSON.stringify(savedTriggers));
  }, [savedTriggers]);

  // Add new trigger to list and clear input field
  function addTrigger() {
    setSavedTriggers([...savedTriggers, newTrigger]);
    setNewTrigger("");
  }

  function removeTrigger(trigger: string) {
    setSavedTriggers(savedTriggers.filter((t) => t !== trigger));
  }

  return (
    <div className="space-y-5">
      {/* Page header with title and description */}
      <div>
        <h1 className="text-xl font-bold text-text">My Triggers</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Ingredients you want to avoid. Products containing these will be
          flagged.
        </p>
      </div>

      {/* Input section to add new trigger ingredients */}
      <div className="flex gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-surface px-4 py-3 focus-within:border-primary transition-colors">
          <AlertTriangle className="size-4 text-text-muted shrink-0" />
          {/* Text input - triggers add on Enter key or button click */}
          <input
            value={newTrigger}
            onChange={(e) => setNewTrigger(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTrigger()}
            placeholder="e.g. peanuts, gluten, lactose..."
            className="flex-1 bg-transparent text-sm text-text placeholder:text-text-muted outline-none"
          />
        </div>
        {/* Add button with plus icon */}
        <button
          onClick={addTrigger}
          className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary-hover transition-colors">
          <Plus className="size-4" />
          Ekle
        </button>
      </div>

      {/* Conditional rendering: Show empty state or triggers list */}
      {savedTriggers.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-surface py-10 text-center">
          <div className="rounded-full bg-background p-3">
            <AlertTriangle className="size-6 text-text-muted" />
          </div>
          <p className="text-sm font-medium text-text">No triggers added yet</p>
          <p className="text-sm text-text-secondary">
            Add ingredients you want to avoid above.
          </p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {/* Render each trigger as a removable tag */}
          {savedTriggers.map((t) => (
            <span
              key={t}
              className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-sm text-text">
              {t}
              {/* Remove button for individual trigger */}
              <button
                onClick={() => removeTrigger(t)}
                className="text-text-muted hover:text-text transition-colors">
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
