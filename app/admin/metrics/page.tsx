import Link from "next/link";

async function getMetrics(range: "7d" | "30d" = "7d") {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/api/admin/metrics?range=${range}`, {
    cache: "no-store",
  });

  // fallback si NEXT_PUBLIC_SITE_URL no existe (cuando corre local)
  if (!res.ok) {
    const res2 = await fetch(`http://localhost:3000/api/admin/metrics?range=${range}`, {
      cache: "no-store",
    }).catch(() => null);

    if (!res2 || !res2.ok) throw new Error("No se pudieron cargar métricas.");
    return res2.json();
  }

  return res.json();
}

export default async function AdminMetricsPage() {
  const metrics = await getMetrics("7d");

  const totalsByType = metrics.totalsByType || {};
  const totalEvents = metrics.totalEvents || 0;

  return (
    <main className="min-h-screen bg-[#0b1220] text-white px-6 py-10">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Métricas internas</h1>
            <p className="text-white/70 text-sm">
              Rango: {metrics.range} · Desde: {String(metrics.since).slice(0, 10)} · Total eventos: {totalEvents}
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              className="rounded-lg bg-white/10 hover:bg-white/15 px-3 py-2 text-sm"
              href="/admin/metrics"
            >
              Refrescar
            </Link>
          </div>
        </header>

        {/* Cards */}
        <section className="grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
            <p className="text-white/60 text-xs">Leads</p>
            <p className="text-2xl font-semibold">{totalsByType["lead_submit"] ?? 0}</p>
          </div>

          <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
            <p className="text-white/60 text-xs">Clicks WhatsApp (total)</p>
            <p className="text-2xl font-semibold">{totalsByType["whatsapp_click"] ?? 0}</p>
          </div>

          <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
            <p className="text-white/60 text-xs">WhatsApp por vehículo</p>
            <p className="text-2xl font-semibold">{totalsByType["whatsapp_click_vehicle"] ?? 0}</p>
          </div>

          <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
            <p className="text-white/60 text-xs">Interés en vehículo</p>
            <p className="text-2xl font-semibold">{totalsByType["vehicle_interest"] ?? 0}</p>
          </div>
        </section>

        {/* Top vehículos */}
        <section className="rounded-2xl bg-white/5 border border-white/10 p-5">
          <h2 className="text-lg font-semibold mb-3">Top vehículos por WhatsApp</h2>

          {metrics.topVehicles?.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-white/70">
                  <tr>
                    <th className="text-left py-2">Vehículo</th>
                    <th className="text-right py-2">Clicks</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.topVehicles.map((v: any, idx: number) => (
                    <tr key={idx} className="border-t border-white/10">
                      <td className="py-2">{v.vehicle_name || "Sin nombre"}</td>
                      <td className="py-2 text-right font-semibold">{v.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-white/70 text-sm">Todavía no hay clicks por vehículo en este rango.</p>
          )}
        </section>

        <section className="text-white/60 text-xs">
          Nota: esto es un dashboard básico. Si querés gráfico, filtro por rango (7/30/90), y breakdown por origen, lo armamos.
        </section>
      </div>
    </main>
  );
}
