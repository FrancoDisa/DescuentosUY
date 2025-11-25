import { Database, MapPin, CreditCard } from 'lucide-react';

const benefits = [
  {
    title: 'Datos sincronizados',
    description: 'Actualizamos teléfonos, horarios y ratings con Google Places para mantener la información confiable.',
    icon: Database,
  },
  {
    title: 'Geolocalización precisa',
    description: 'Ajustá manualmente tu ubicación y vemos la distancia real a cada sucursal en tiempo real.',
    icon: MapPin,
  },
  {
    title: 'Promos por emisor',
    description: 'Agrupamos beneficios por banco, tarjeta y tier para que identifiques de un vistazo lo que te sirve.',
    icon: CreditCard,
  },
];

export function HomeBenefits() {
  return (
    <section id="beneficios" className="py-16">
      <div className="space-y-12 text-center">
        <div className="space-y-4 max-w-3xl mx-auto">
          <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-xs font-semibold text-primary uppercase tracking-wide">
            ¿Por qué DescuentosUY?
          </div>
          <h2 className="font-heading font-bold text-3xl sm:text-4xl text-foreground">
            Una plataforma pensada para decisiones rápidas
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Datos verificados, contexto y herramientas para que aproveches cada beneficio disponible en la ciudad.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          {benefits.map((benefit) => (
            <article
              key={benefit.title}
              className="p-6 rounded-2xl bg-secondary/30 border border-transparent hover:border-primary/20 hover:bg-secondary/50 transition-all text-left space-y-4"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <benefit.icon className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="font-heading font-semibold text-lg text-foreground">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{benefit.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
