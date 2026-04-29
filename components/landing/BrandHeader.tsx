"use client";

export default function BrandHeader() {
  return (
    <div className="w-full flex justify-center mt-4 mb-2">
      <div className="flex items-center justify-between w-full max-w-6xl px-6 py-3 rounded-full bg-white/90 backdrop-blur-md border border-gray-200 shadow-lg">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold">
            G
          </div>
          <div className="leading-tight">
            <p className="text-xs uppercase tracking-widest text-gray-500">
              Grupo automotor
            </p>
            <p className="font-bold text-gray-900">
              GoMotorsCo
            </p>
          </div>
        </div>

        {/* Menu */}
        <div className="hidden md:flex items-center gap-2 bg-gray-100 p-1 rounded-full">
          {["Autos","Motos","Ciclomotores"].map((item) => (
            <a
              key={item}
              href="#stock"
              className="px-4 py-2 text-sm text-gray-600 rounded-full hover:bg-white hover:text-black transition"
            >
              {item}
            </a>
          ))}
        </div>

        {/* CTA */}
        <a
          href="/preaprobacion"
          className="bg-black text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-gray-900"
        >
          Evaluar
        </a>

      </div>
    </div>
  );
}
