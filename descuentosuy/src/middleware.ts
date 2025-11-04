import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Middleware de Supabase para Next.js
 *
 * IMPORTANTE: Este middleware está preparado para cuando se implemente autenticación.
 * Actualmente, la aplicación NO tiene autenticación, pero este middleware:
 *
 * 1. Sigue las mejores prácticas de @supabase/ssr
 * 2. Actualiza automáticamente las sesiones de usuario (cuando existan)
 * 3. No afecta el rendimiento actual (operaciones muy ligeras)
 * 4. Estará listo cuando se agregue login/signup en el futuro
 *
 * Según la documentación oficial de Supabase SSR:
 * "Middleware is Mandatory: Session refresh logic must be implemented
 * within the middleware pattern."
 */
export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANTE: Esta llamada refresca las sesiones automáticamente.
  // Actualmente no hay usuarios autenticados, por lo que simplemente retorna null
  // sin afectar el rendimiento. Cuando se agregue autenticación, esto:
  // - Refrescará tokens expirados automáticamente
  // - Mantendrá las sesiones activas
  // - Manejará sign-outs desde otros dispositivos
  await supabase.auth.getUser()

  // TODO FUTURO: Cuando se implemente autenticación, descomentar este bloque
  // para proteger rutas específicas:
  //
  // if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
  //   const url = request.nextUrl.clone()
  //   url.pathname = '/login'
  //   return NextResponse.redirect(url)
  // }

  return supabaseResponse
}

// Configuración del matcher
// Excluye archivos estáticos para mejor rendimiento
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - archivos con extensiones comunes (images, etc)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
