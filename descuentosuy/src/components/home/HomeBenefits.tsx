const benefits = [
  {
    title: 'Datos sincronizados',
    description: 'Actualizamos teléfonos, horarios y ratings con Google Places para mantener la información confiable.',
    icon: (
      <svg aria-hidden xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-brand-600">
        <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    title: 'Geolocalización precisa',
    description: 'Ajustá manualmente tu ubicación y vemos la distancia real a cada sucursal en tiempo real.',
    icon: (
      <svg aria-hidden xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-brand-600">
        <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    title: 'Promos por emisor',
    description: 'Agrupamos beneficios por banco, tarjeta y tier para que identifiques de un vistazo lo que te sirve.',
    icon: (
      <svg aria-hidden xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-brand-600">
        <path d="M4.5 3.75a3 3 0 00-3 3v.75h21v-.75a3 3 0 00-3-3h-15z" />
        <path fillRule="evenodd" d="M22.5 9.75h-21v7.5a3 3 0 003 3h15a3 3 0 003-3v-7.5zm-18 3.75a.75.75 0 01.75-.75h6a.75.75 0 010 1.5h-6a.75.75 0 01-.75-.75zm.75 2.25a.75.75 0 000 1.5h3a.75.75 0 000-1.5h-3z" clipRule="evenodd" />
      </svg>
    ),
  },
];

export function HomeBenefits() {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm sm:p-12">
      <div className="mx-auto max-w-5xl space-y-10 text-center">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">¿Por qué DescuentosUY?</p>
          <h2 className="text-3xl font-bold text-gray-900 lg:text-4xl">Todo lo que necesitás en un solo lugar</h2>
          <p className="mx-auto max-w-2xl text-base text-gray-600">
            Información actualizada y herramientas para que encuentres los mejores beneficios cerca tuyo.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          {benefits.map((benefit) => (
            <article key={benefit.title} className="space-y-4 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-brand-50">
                {benefit.icon}
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-gray-900">{benefit.title}</h3>
                <p className="text-sm leading-relaxed text-gray-600">{benefit.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
