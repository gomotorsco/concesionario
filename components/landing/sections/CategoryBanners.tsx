const categories = [
  {
    title: "Autos",
    text: "Opciones para ciudad, familia, trabajo y uso diario.",
    href: "#stock",
  },
  {
    title: "Motos",
    text: "Movilidad ágil, económica y práctica para diferentes perfiles.",
    href: "#stock",
  },
  {
    title: "Ciclomotores",
    text: "Alternativas eficientes para recorridos urbanos y movilidad ligera.",
    href: "#stock",
  },
];

export default function CategoryBanners() {
  return (
    <section className="gm-premium-container pb-12">
      <div className="grid gap-4 md:grid-cols-3">
        {categories.map((item) => (
          <a
            key={item.title}
            href={item.href}
            className="group overflow-hidden rounded-[28px] border border-[var(--gm-border)] bg-[rgba(255,253,248,.82)] p-6 shadow-[0_18px_55px_rgba(21,21,21,.10)] transition hover:-translate-y-1"
          >
            <div className="mb-10 h-24 rounded-[22px] bg-gradient-to-br from-[var(--gm-soft)] to-transparent" />

            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[var(--gm-muted)]">
              Categoría
            </p>

            <h3 className="mt-2 text-3xl font-black tracking-[-0.05em] text-[var(--gm-text)]">
              {item.title}
            </h3>

            <p className="mt-3 min-h-[52px] text-sm leading-6 text-[var(--gm-muted)]">
              {item.text}
            </p>

            <span className="mt-5 inline-flex text-sm font-black text-[var(--gm-text)]">
              Ver opciones →
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
