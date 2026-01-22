"use client";

export default function EventsBarChart({
  series,
}: {
  series: { date: string; count: number }[];
}) {
  const max = Math.max(...series.map((s) => s.count), 1);

  return (
    <div className="flex items-end gap-2 h-28">
      {series.map((s) => {
        const h = Math.round((s.count / max) * 100);
        return (
          <div key={s.date} className="flex flex-col items-center gap-1 w-8">
            <div
              className="w-full rounded-md bg-sky-500/70 border border-sky-400/30"
              style={{ height: `${h}%` }}
              title={`${s.date}: ${s.count}`}
            />
            <span className="text-[9px] text-slate-500">{s.date.slice(5)}</span>
          </div>
        );
      })}
    </div>
  );
}
