import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient as createJSClient } from '@supabase/supabase-js'; // Importamos el cliente JS estándar
import { cookies } from 'next/headers';

// Este cliente es para rutas y operaciones autenticadas, usando la librería SSR
export function createClient(cookieStore: ReturnType<typeof cookies>) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          const store = await cookieStore;
          return store.get(name)?.value;
        },
        async set(name: string, value: string, options: CookieOptions) {
          try {
            const store = await cookieStore;
            store.set({ name, value, ...options });
          } catch {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        async remove(name: string, options: CookieOptions) {
          try {
            const store = await cookieStore;
            store.delete({ name, ...options });
          } catch {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

// Esta función es para acceso público y anónimo en el servidor.
// Usa el cliente JS estándar para evitar problemas con SSR/cookies,
// lo que permite su uso en páginas que también usan searchParams.
export function createPublicClient() {
  return createJSClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
