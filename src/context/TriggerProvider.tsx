// Holds the global trigger list and syncs it with localStorage.
import React, { useEffect, useState } from "react";
import { TriggerContext } from "./TriggerContext";

export function TriggerProvider({ children }: { children: React.ReactNode }) {
  // State to store list of trigger ingredients
  const [savedTriggers, setSavedTriggers] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("myTriggers") ?? "[]");
    } catch {
      return [];
    }
  });
  // Side effect: save triggers to localStorage whenever the list changes
  useEffect(() => {
    localStorage.setItem("myTriggers", JSON.stringify(savedTriggers));
  }, [savedTriggers]);

  // Add new trigger to list
  function addTrigger(newTrigger: string) {
    setSavedTriggers([...savedTriggers, newTrigger]);
  }

  function removeTrigger(trigger: string) {
    setSavedTriggers(savedTriggers.filter((t) => t !== trigger));
  }

  return (
    // Wrap the app with this so any component can read or update triggers via useTriggers().
    <TriggerContext.Provider
      value={{
        triggers: savedTriggers,
        addTrigger,
        removeTrigger,
      }}>
      {children}
    </TriggerContext.Provider>
  );
}
