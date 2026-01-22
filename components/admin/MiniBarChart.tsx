"use client";

type Item = { key: string; count: number };

export default function MiniBarChart({
  title,
  items,
  height = 120,
}: {
  title: string;
  items: Item[];
  height?: number;
}) {
  const max = Math.max(1, ...items.map((i) => i.count));

  return (
    <div className="bg-slate-950/50 border border-slate-800 p-4 rounded-xl">
      <p className="text-xs text-slate-400 mb-3">{title}</p>
      {items.length === 0 ? (
        <p className="text-xs text-slate-500">Sin datos.</p>
      ) : (
        <div className="flex items-end gap-2" style={{ height }}>
          {items.map((it) => {
            const h = Math.round((it.count / max) * (height - 24));
            return (
              <div key={it.key} className="flex-1 min-w-[34px]">
                <div
                  className="w-full rounded-md bg-sky-600/70 border border-sky-500/40"
                  style={{ height: h }}
                  title={`${it.key}: ${it.count}`}
                />
                <div className="mt-2 text-[10px] text-slate-400 truncate">
                  {it.key}
                </div>
                <div className="text-[10px] text-slate-200">{it.count}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
