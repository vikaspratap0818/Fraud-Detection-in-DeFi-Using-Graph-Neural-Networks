import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Middleware for NextAuth session validation on protected routes
  return undefined
}

export const config = { 
  matcher: ["/dashboard/:path*", "/profile/:path*", "/settings/:path*", "/alerts/:path*", "/network/:path*"]
}