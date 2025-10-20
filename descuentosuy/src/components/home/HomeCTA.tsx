export function HomeCTA() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-brand-200/50 bg-gradient-to-br from-white via-brand-50/30 to-accent-50/20 px-6 py-12 shadow-2xl shadow-brand-500/10 sm:px-10">
      <div className="absolute -right-24 top-0 h-48 w-48 rounded-full bg-brand-200/20 blur-3xl" aria-hidden />
      <div className="absolute -left-24 bottom-0 h-48 w-48 rounded-full bg-accent-200/20 blur-3xl" aria-hidden />

      <div className="relative mx-auto flex max-w-4xl flex-col gap-6 text-center">
        <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl">¿Tenés un descuento para sumar?</h2>
        <p className="text-base leading-relaxed text-gray-600 lg:text-lg">
          Muy pronto abriremos la sección de comunidad para recibir sugerencias y altas de promociones. Mientras tanto podés escribirnos para priorizar tu banco o tarjeta favorita.
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <a
            href="mailto:hola@descuentosuy.com"
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-brand-600 to-accent-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-brand-500/30 transition-all duration-200 hover:from-brand-700 hover:to-accent-700 hover:shadow-xl hover:shadow-brand-500/40 active:scale-95"
          >
            Escribir al equipo
          </a>
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLScC9ejemplo"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full border-2 border-brand-200 bg-white px-6 py-3 text-base font-semibold text-brand-700 shadow-sm transition-all duration-200 hover:border-brand-300 hover:bg-brand-50 hover:shadow-md active:scale-95"
          >
            Recibir novedades
          </a>
        </div>
        <p className="text-sm text-gray-500">
          Al sumarte, te enviaremos actualizaciones sobre nuevas integraciones de bancos y lanzamientos de filtros personalizados.
        </p>
      </div>
    </section>
  );
}
