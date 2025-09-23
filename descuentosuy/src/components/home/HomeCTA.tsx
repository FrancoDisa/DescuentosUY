export function HomeCTA() {
  return (
    <section className="rounded-3xl bg-white px-6 py-12 shadow-xl sm:px-10">
      <div className="mx-auto flex max-w-4xl flex-col gap-6 text-center">
        <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">¿Tenés un descuento para sumar?</h2>
        <p className="text-base text-gray-600">
          Muy pronto abriremos la sección de comunidad para recibir sugerencias y altas de promociones. Mientras tanto podés escribirnos para priorizar tu banco o tarjeta favorita.
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <a
            href="mailto:hola@descuentosuy.com"
            className="inline-flex items-center justify-center rounded-full bg-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-purple-700"
          >
            Escribir al equipo
          </a>
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLScC9ejemplo"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full border border-purple-200 px-6 py-3 text-sm font-semibold text-purple-700 transition hover:bg-purple-50"
          >
            Recibir novedades
          </a>
        </div>
        <p className="text-xs text-gray-400">
          Al sumarte, te enviaremos actualizaciones sobre nuevas integraciones de bancos y lanzamientos de filtros personalizados.
        </p>
      </div>
    </section>
  );
}
