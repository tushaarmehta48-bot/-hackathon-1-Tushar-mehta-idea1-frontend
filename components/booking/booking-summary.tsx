"use client";

type BookingSummaryProps = {
  labels: {
    heading: string;
    date: string;
    party: string;
    service: string;
    time: string;
    table: string;
  };
  date: string;
  partySize: number;
  serviceName: string | null;
  timeLabel: string | null;
  tableLabel: string | null;
};

export function BookingSummary({
  labels,
  date,
  partySize,
  serviceName,
  timeLabel,
  tableLabel,
}: BookingSummaryProps) {
  const rows = [
    { label: labels.date, value: date },
    { label: labels.party, value: String(partySize) },
    serviceName ? { label: labels.service, value: serviceName } : null,
    timeLabel ? { label: labels.time, value: timeLabel } : null,
    tableLabel ? { label: labels.table, value: tableLabel } : null,
  ].filter(Boolean) as { label: string; value: string }[];

  if (rows.length === 0) {
    return null;
  }

  return (
    <aside className="border border-line/80 bg-cream px-4 py-4">
      <h2 className="font-heading text-lg text-forest">{labels.heading}</h2>
      <dl className="mt-3 space-y-2 text-sm">
        {rows.map((row) => (
          <div key={row.label} className="flex justify-between gap-4 border-b border-line/60 pb-2 last:border-0">
            <dt className="text-muted">{row.label}</dt>
            <dd className="text-right font-medium text-forest">{row.value}</dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}
