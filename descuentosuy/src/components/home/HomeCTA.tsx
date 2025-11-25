import { Mail, Send } from 'lucide-react';

export function HomeCTA() {
  return (
    <section className="relative overflow-hidden bg-foreground rounded-3xl px-8 py-16 text-background sm:px-12 lg:py-20">
      <div className="relative mx-auto max-w-4xl text-center space-y-12">
        <div className="space-y-6">
          <h2 className="font-heading font-bold text-3xl sm:text-4xl lg:text-5xl">
            Sé parte de la <span className="text-primary">comunidad</span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted">
            Ayudanos a crecer juntos. Compartí promociones, sugerencias o contanos qué más te gustaría ver.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <a
            href="mailto:hola@descuentosuy.com"
            className="group relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 p-8 text-left transition-all hover:bg-white/10 hover:border-primary/50"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                <Mail className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="font-heading font-semibold text-xl text-background">Enviar sugerencias</h3>
                <p className="text-sm text-muted leading-relaxed">
                  Compartinos promociones o ideas para mejorar la plataforma
                </p>
              </div>
            </div>
          </a>

          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLScC9ejemplo"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 p-8 text-left transition-all hover:bg-white/10 hover:border-primary/50"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                <Send className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="font-heading font-semibold text-xl text-background">Suscribirte</h3>
                <p className="text-sm text-muted leading-relaxed">
                  Recibí notificaciones de nuevas promociones y actualizaciones
                </p>
              </div>
            </div>
          </a>
        </div>

        <p className="text-sm text-muted/60">
          Tu participación hace que DescuentosUY sea mejor para todos 🎉
        </p>
      </div>
    </section>
  );
}
