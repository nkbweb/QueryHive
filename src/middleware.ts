import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function middleware(req: NextRequest) {
  const response = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (key) => req.cookies.get(key)?.value,
        set: (key, value, options) => {
          response.cookies.set({ name: key, value, ...options })
        },
        remove: (key, options) => {
          response.cookies.set({ name: key, value: '', ...options })
        },
      },
    }
  )

  // 🔥 IMPORTANT: this refreshes session internally
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  const isProtectedRoute =
    req.nextUrl.pathname.startsWith('/ask') ||
    req.nextUrl.pathname.startsWith('/home') ||
    req.nextUrl.pathname.startsWith('/profile')

  const isAuthPage =
    req.nextUrl.pathname.startsWith('/login') ||
    req.nextUrl.pathname.startsWith('/signup')

  if (isProtectedRoute && !user) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (isAuthPage && user) {
    return NextResponse.redirect(new URL('/home', req.url))
  }

  // 🔥 RETURN UPDATED RESPONSE (not new one!)
  return response
}