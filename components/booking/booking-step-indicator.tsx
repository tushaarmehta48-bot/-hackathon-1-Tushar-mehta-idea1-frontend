"use client";

type StepKey = "when" | "time" | "table" | "details";

type BookingStepIndicatorProps = {
  /** Flow step; tableType maps to the table milestone in the indicator. */
  active: StepKey | "tableType" | "pay";
  labels: Record<StepKey, string>;
  progressLabel: string;
};

function indicatorStep(active: BookingStepIndicatorProps["active"]): StepKey {
  if (active === "tableType" || active === "table") {
    return "table";
  }
  if (active === "pay") {
    return "details";
  }
  return active;
}

const order: StepKey[] = ["when", "time", "table", "details"];

export function BookingStepIndicator({ active, labels, progressLabel }: BookingStepIndicatorProps) {
  const milestone = indicatorStep(active);
  const activeIndex = order.indexOf(milestone);

  return (
    <nav aria-label={progressLabel} className="mb-8">
      <ol className="flex items-center justify-between gap-1 sm:gap-2">
        {order.map((key, index) => {
          const isComplete = index < activeIndex;
          const isActive = key === milestone;
          return (
            <li key={key} className="flex min-w-0 flex-1 items-center last:flex-none">
              <div className="flex min-w-0 flex-col items-center gap-1.5 sm:flex-row sm:gap-2">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-medium ${
                    isActive
                      ? "border-forest bg-forest text-cream"
                      : isComplete
                        ? "border-olive bg-olive/15 text-forest"
                        : "border-line bg-cream text-muted"
                  }`}
                  aria-current={isActive ? "step" : undefined}
                >
                  {index + 1}
                </span>
                <span
                  className={`hidden truncate text-center text-[0.65rem] uppercase tracking-wide sm:block sm:text-xs ${
                    isActive ? "font-medium text-forest" : "text-muted"
                  }`}
                >
                  {labels[key]}
                </span>
              </div>
              {index < order.length - 1 ? (
                <div
                  className={`mx-1 hidden h-px flex-1 sm:block ${
                    index < activeIndex ? "bg-olive/50" : "bg-line"
                  }`}
                  aria-hidden
                />
              ) : null}
            </li>
          );
        })}
      </ol>
      <p className="mt-3 text-center text-xs uppercase tracking-wide text-forest sm:hidden">
        {labels[milestone]}
      </p>
    </nav>
  );
}
