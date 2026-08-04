import { useContext } from "react";
import { TriggerContext } from "../context/TriggerContext";

export function useTriggers() {
  const context = useContext(TriggerContext);
  if (!context)
    throw new Error("useTriggers must be used within TriggerProvider");
  return context;
}
