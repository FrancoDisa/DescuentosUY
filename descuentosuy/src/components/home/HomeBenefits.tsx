const benefits = [
  {
    title: 'Datos sincronizados',
    description: 'Actualizamos teléfonos, horarios y ratings con Google Places para mantener la información confiable.',
    icon: (
      <svg aria-hidden xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-purple-600">
        <path d="M12 3a9 9 0 100 18 9 9 0 000-18zm3.707 7.293l-4 4a1 1 0 01-1.414 0l-2-2 1.414-1.414L11 12.586l3.293-3.293 1.414 1.414z" />
      </svg>
    ),
  },
  {
    title: 'Geolocalización precisa',
    description: 'Ajustá manualmente tu ubicación y vemos la distancia real a cada sucursal en tiempo real.',
    icon: (
      <svg aria-hidden xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-purple-600">
        <path fillRule="evenodd" d="M11.47 3.84a.75.75 0 011.06 0l7.5 7.5a.75.75 0 01-1.06 1.06l-6.22-6.22v12.69a.75.75 0 01-1.5 0V6.18l-6.22 6.22a.75.75 0 01-1.06-1.06l7.5-7.5z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    title: 'Promos por emisor',
    description: 'Agrupamos beneficios por banco, tarjeta y tier para que identifiques de un vistazo lo que te sirve.',
    icon: (
      <svg aria-hidden xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-purple-600">
        <path fillRule="evenodd" d="M2.25 6A2.25 2.25 0 014.5 3.75h15A2.25 2.25 0 0121.75 6v12a2.25 2.25 0 01-2.25 2.25h-15A2.25 2.25 0 012.25 18V6zm2.25-.75a.75.75 0 00-.75.75V9h18V6a.75.75 0 00-.75-.75h-15zm-.75 12.75V10.5h18V18a.75.75 0 01-.75.75h-15a.75.75 0 01-.75-.75z" clipRule="evenodd" />
      </svg>
    ),
  },
];

export function HomeBenefits() {
  return (
    <section className="rounded-3xl border border-purple-100 bg-purple-50/70 px-6 py-12 sm:px-10">
      <div className="mx-auto max-w-4xl space-y-10 text-center">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-wide text-purple-600">¿Por qué usar DescuentosUY?</p>
          <h2 className="text-3xl font-bold text-gray-900">Una experiencia pensada para planificar tus salidas</h2>
          <p className="text-base text-gray-600">
            Integramos fuentes oficiales, ubicaciones precisas y herramientas para que compares beneficios sin perder tiempo.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit) => (
            <article key={benefit.title} className="flex h-full flex-col gap-4 rounded-2xl bg-white/90 p-6 text-left shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
                {benefit.icon}
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">{benefit.title}</h3>
                <p className="text-sm text-gray-600">{benefit.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
