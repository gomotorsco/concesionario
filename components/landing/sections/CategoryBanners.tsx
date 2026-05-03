const categories = [
  {
    title: "Automóviles",
    label: "Autos",
    href: "#stock-auto",
    image: "/category-banners/automoviles.png",
    text: "Opciones para ciudad, familia, trabajo y uso diario.",
  },
  {
    title: "Motos",
    label: "Motos",
    href: "#stock-moto",
    image: "/category-banners/motos.png",
    text: "Movilidad ágil, económica y práctica para todos los días.",
  },
  {
    title: "Ciclomotores",
    label: "Movilidad ligera",
    href: "#stock-ciclomotor",
    image: "/category-banners/ciclomotores.png",
    text: "Alternativas eficientes para recorridos cortos y recreación.",
  },
];

export default function CategoryBanners() {
  return (
    <section className="bg-[#f6f1e8] px-5 py-14">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-[#8a7760]">
            Categorías
          </p>
          <h2 className="mt-3 text-4xl font-black tracking-[-0.05em] text-[#151515] md:text-5xl">
            Elija cómo quiere moverse.
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {categories.map((item) => (
            <a
              key={item.title}
              href={item.href}
              className="group relative min-h-[360px] overflow-hidden rounded-[34px] border border-black/10 bg-black shadow-[0_24px_70px_rgba(21,21,21,.13)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_34px_90px_rgba(21,21,21,.24)]"
            >
              <img src={item.image} alt={item.title} className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/38 to-transparent" />

              <div className="absolute left-6 top-6 rounded-full border border-white/20 bg-white/15 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-white backdrop-blur">
                {item.label}
              </div>

              <div className="absolute bottom-6 left-6 right-6">
                <h3 className="text-3xl font-black tracking-[-0.04em] text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/80">{item.text}</p>
                <div className="mt-5 inline-flex rounded-full bg-white px-5 py-3 text-sm font-black text-[#151515]">
                  Ver opciones →
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
