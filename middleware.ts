import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/signup(.*)',
  '/auth(.*)',
  '/reset-password(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth()
  const pathname = req.nextUrl.pathname

  if (!userId && !isPublicRoute(req)) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  if (userId && !isPublicRoute(req)) {
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { data: profile } = await supabase
      .from('profiles')
      .select('status, role')
      .eq('clerk_user_id', userId)
      .single()

    if (profile?.status === 'pending' || profile?.status === 'suspended') {
      return NextResponse.redirect(new URL('/', req.url))
    }

    if (pathname.startsWith('/admin') && profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/feed', req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
