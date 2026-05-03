export default function Footer() {
  return (
    <footer className="border-t border-black/10 bg-[#151515] px-5 py-14 text-white">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-3">

        <div>
          <h3 className="text-lg font-black">GoMotorsCo</h3>
          <p className="mt-3 text-sm text-white/60">
            Automóviles, motos y ciclomotores con financiación y asesoría profesional.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-black uppercase tracking-[0.2em] text-white/50">
            Navegación
          </h4>
          <ul className="mt-4 space-y-2 text-sm text-white/70">
            <li><a href="#stock">Vehículos</a></li>
            <li><a href="/preaprobacion">Financiación</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-black uppercase tracking-[0.2em] text-white/50">
            Contacto
          </h4>
          <p className="mt-4 text-sm text-white/70">
            Cra 7 No 155 - 80 Interior 2 Oficina 122<br/>
            North Point Offices, Bogotá
          </p>
        </div>

      </div>

      <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-white/40">
        © {new Date().getFullYear()} GoMotorsCo. Todos los derechos reservados.
      </div>
    </footer>
  );
}
