import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

// هذا ملف server-side utility لا يحتاج Dynamic Import
// لأنه يعمل على الخادم وليس في المتصفح
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set(name, value, options)
          } catch (error) {
            // The `cookies()` helper can only be called from a Server Component or Server Action.
            // This error is typically caused by an attempt to set a cookie from a Client Component.
            // Many of these are
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set(name, '', options)
          } catch (error) {
            // The `cookies()` helper can only be called from a Server Component or Server Action.
            // This error is typically caused by by an attempt to set a cookie from a Client Component.
            // Many of these are
          }
        },
      },
    }
  )
}

