import { createContext } from "react";

interface TriggerContextType {
  triggers: string[];
  addTrigger: (newTrigger: string) => void;
  removeTrigger: (trigger: string) => void;
}

export const TriggerContext = createContext<TriggerContextType | undefined>(
  undefined,
);
