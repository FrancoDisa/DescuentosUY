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
    <section className="relative overflow-hidden rounded-3xl border border-brand-200/50 bg-gradient-to-br from-brand-50 via-white to-accent-50/30 px-6 py-12 shadow-xl shadow-brand-500/5 sm:px-10">
      <div className="absolute -right-20 top-0 h-40 w-40 rounded-full bg-brand-200/20 blur-3xl" aria-hidden />
      <div className="absolute -left-20 bottom-0 h-40 w-40 rounded-full bg-accent-200/20 blur-3xl" aria-hidden />

      <div className="relative mx-auto max-w-4xl space-y-10 text-center">
        <div className="space-y-3">
          <p className="text-sm font-bold uppercase tracking-wide text-brand-600">¿Por qué usar DescuentosUY?</p>
          <h2 className="text-3xl font-bold text-gray-900 lg:text-4xl">Una experiencia pensada para planificar tus salidas</h2>
          <p className="text-base text-gray-600 lg:text-lg">
            Integramos fuentes oficiales, ubicaciones precisas y herramientas para que compares beneficios sin perder tiempo.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit) => (
            <article key={benefit.title} className="group flex h-full flex-col gap-4 rounded-2xl border border-brand-100/50 bg-white/95 p-6 text-left shadow-lg shadow-brand-500/5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-500/10">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-brand-100 to-accent-100 shadow-md transition-transform duration-300 group-hover:scale-110">
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
