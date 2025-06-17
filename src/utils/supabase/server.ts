import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() { // جعل الدالة async
  const cookieStore = await cookies() // إضافة await هنا

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
            cookieStore.set(name, value, options) // تم تصحيح طريقة الاستدعاء هنا
          } catch (error) {
            // The `cookies()` helper can only be called from a Server Component or Server Action.
            // This error is typically caused by an attempt to set a cookie from a Client Component.
            // Many of these are
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set(name, '', options) // تم تصحيح طريقة الاستدعاء هنا
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
