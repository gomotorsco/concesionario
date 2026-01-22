"use client";

import React from "react";

type Point = { date: string; count: number };

export function MiniLineChart({
  data,
  height = 72,
}: {
  data: Point[];
  height?: number;
}) {
  const w = 360;
  const h = height;

  const max = Math.max(1, ...data.map((p) => p.count));
  const min = 0;

  const padX = 6;
  const padY = 8;

  const xStep = data.length > 1 ? (w - padX * 2) / (data.length - 1) : 1;

  const y = (v: number) => {
    const t = (v - min) / (max - min);
    return h - padY - t * (h - padY * 2);
  };

  const points = data
    .map((p, i) => `${padX + i * xStep},${y(p.count)}`)
    .join(" ");

  return (
    <div className="w-full overflow-hidden">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-[72px]">
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          points={points}
          opacity="0.9"
        />
      </svg>
      <div className="flex justify-between text-[10px] text-slate-500 mt-1">
        <span>{data[0]?.date}</span>
        <span>{data[data.length - 1]?.date}</span>
      </div>
    </div>
  );
}

export function MiniBarChart({
  items,
}: {
  items: { label: string; value: number }[];
}) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <div className="space-y-2">
      {items.map((i) => (
        <div key={i.label} className="space-y-1">
          <div className="flex justify-between text-[11px] text-slate-300">
            <span className="truncate max-w-[70%]">{i.label}</span>
            <span className="text-slate-100">{i.value}</span>
          </div>
          <div className="h-2 rounded bg-slate-900 overflow-hidden border border-slate-800">
            <div
              className="h-full bg-sky-500"
              style={{ width: `${Math.round((i.value / max) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function Funnel({
  pv,
  modal,
  wa,
  lead,
}: {
  pv: number;
  modal: number;
  wa: number;
  lead: number;
}) {
  const safePct = (a: number, b: number) => (b > 0 ? ((a / b) * 100).toFixed(1) : "0.0");

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
      <FunnelBox title="Page views" value={pv} sub="Base" />
      <FunnelBox title="Modal opens" value={modal} sub={`${safePct(modal, pv)}% de PV`} />
      <FunnelBox title="WhatsApp" value={wa} sub={`${safePct(wa, pv)}% de PV`} />
      <FunnelBox title="Leads" value={lead} sub={`${safePct(lead, pv)}% de PV`} />
    </div>
  );
}

function FunnelBox({ title, value, sub }: { title: string; value: number; sub: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
      <p className="text-xs text-slate-400">{title}</p>
      <p className="text-3xl font-semibold text-slate-50">{value}</p>
      <p className="text-[11px] text-slate-500 mt-1">{sub}</p>
    </div>
  );
}
