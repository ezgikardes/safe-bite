import { useEffect, useState } from "react";

export default function MyTriggers() {
  const [savedTriggers, setSavedTriggers] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("myTriggers") ?? "[]");
    } catch {
      return [];
    }
  });

  const [newTrigger, setNewTrigger] = useState<string>("");

  useEffect(() => {
    localStorage.setItem("myTriggers", JSON.stringify(savedTriggers));
  }, [savedTriggers]);

  function addTrigger() {
    setSavedTriggers([...savedTriggers, newTrigger]);
    setNewTrigger("");
  }

  function removeTrigger(trigger: string) {
    setSavedTriggers(savedTriggers.filter((t) => t !== trigger));
  }

  return (
    <>
      <input
        value={newTrigger}
        onChange={(e) => setNewTrigger(e.target.value)}
      />
      <button onClick={addTrigger}>Ekle</button>
      {savedTriggers.map((t) => (
        <div key={t}>
          <p>{t}</p>
          <button onClick={() => removeTrigger(t)}>x</button>
        </div>
      ))}
    </>
  );
}
