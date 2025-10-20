export function HomeCTA() {
  return (
    <section className="rounded-xl border border-brand-200 bg-gradient-to-br from-brand-50 to-blue-50 px-8 py-12 shadow-sm sm:px-12">
      <div className="mx-auto max-w-3xl space-y-6 text-center">
        <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">¿Tenés un descuento para compartir?</h2>
        <p className="text-base leading-relaxed text-gray-600 lg:text-lg">
          Ayudanos a crecer la plataforma. Envianos sugerencias de promociones o contanos qué banco o tarjeta te gustaría ver.
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <a
            href="mailto:hola@descuentosuy.com"
            className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
          >
            Contactar al equipo
          </a>
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLScC9ejemplo"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-6 py-3 text-base font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
          >
            Suscribirte a novedades
          </a>
        </div>
        <p className="text-sm text-gray-500">
          Te mantendremos al tanto de nuevas funcionalidades y descuentos agregados.
        </p>
      </div>
    </section>
  );
}
