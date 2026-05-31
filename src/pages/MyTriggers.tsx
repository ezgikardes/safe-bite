import { AlertTriangle, Plus, X } from "lucide-react";
import { useTriggers } from "../hooks/useTriggers";
import { useForm } from "react-hook-form";

type FormValues = {
  trigger: string;
};

export default function MyTriggers() {
  const { triggers: savedTriggers, addTrigger, removeTrigger } = useTriggers();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ reValidateMode: "onSubmit" });

  function handleAdd(data: FormValues) {
    addTrigger(data.trigger);
    reset();
  }

  return (
    <div className="space-y-5">
      <form
        onSubmit={handleSubmit(handleAdd)}
        className="space-y-5">
        {/* Page header with title and description */}
        <div>
          <h1 className="text-xl font-bold text-text">My Triggers</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Add your personal trigger ingredients. Products containing them will
            be flagged as risky.
          </p>
          <p className="mt-2 text-xs text-text-muted">
            Common reflux &amp; gastritis triggers (coffee, chocolate, citrus,
            onion, garlic…) are always checked, even when this list is empty.
          </p>
        </div>

        {/* Input section to add new trigger ingredients */}
        <div className="flex gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-surface px-4 py-3 focus-within:border-primary transition-colors">
            <AlertTriangle className="size-4 text-text-muted shrink-0" />
            {/* Text input - triggers add on Enter key or button click */}
            <input
              {...register("trigger", {
                required: "Please enter a trigger ingredient.",
                validate: (value) =>
                  savedTriggers.includes(value)
                    ? "You've already added this trigger."
                    : true,
              })}
              autoComplete="off"
              placeholder="e.g. peanut, yoghurt, wheat..."
              className="flex-1 bg-transparent text-sm text-text placeholder:text-text-muted outline-none"
            />
          </div>
          {/* Add button with plus icon */}
          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary-hover transition-colors">
            <Plus className="size-4" />
            Add trigger
          </button>
        </div>
        {errors.trigger && (
          <p className="text-sm text-red-500">{errors.trigger.message}</p>
        )}

        {/* Conditional rendering: Show empty state or triggers list */}
        {savedTriggers.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-surface py-10 text-center">
            <div className="rounded-full bg-background p-3">
              <AlertTriangle className="size-6 text-text-muted" />
            </div>
            <p className="text-sm font-medium text-text">
              No triggers added yet
            </p>
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
                  type="button"
                  className="text-text-muted hover:text-text transition-colors">
                  <X className="size-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </form>
    </div>
  );
}
