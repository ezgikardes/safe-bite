import React, { useEffect, useState } from "react";
import { TriggerContext } from "./TriggerContext";

export function TriggerProvider({ children }: { children: React.ReactNode }) {
  const [savedTriggers, setSavedTriggers] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("myTriggers") ?? "[]");
    } catch {
      return [];
    }
  });
  useEffect(() => {
    localStorage.setItem("myTriggers", JSON.stringify(savedTriggers));
  }, [savedTriggers]);

  function addTrigger(newTrigger: string) {
    setSavedTriggers([...savedTriggers, newTrigger]);
  }

  function removeTrigger(trigger: string) {
    setSavedTriggers(savedTriggers.filter((t) => t !== trigger));
  }

  return (
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
