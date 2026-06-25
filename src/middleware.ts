import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 🛡️ IN-MEMORY RATE LIMITER (ANTI-DDOS)
// Note: In Serverless/Edge environments, this state persists across "warm" invocations.
// While it resets on cold boots, it is highly effective at stopping aggressive, bursting DDoS attacks
// from a single IP without burning database read quotas.
const rateLimitMap = new Map<string, { count: number, resetTime: number }>()

// Configuration
const MAX_REQUESTS = 50       // Maximum requests allowed...
const WINDOW_MS = 60 * 1000   // ...per 60 seconds (1 minute)

export function middleware(request: NextRequest) {
  // Apply Anti-DDoS exclusively to API routes to protect compute & database
  if (request.nextUrl.pathname.startsWith('/api/')) {
    
    // Extract IP securely
    const rawIp = request.ip ?? request.headers.get('x-vercel-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown'
    const ip = rawIp.split(',')[0].trim()
    
    if (ip !== 'unknown') {
      const now = Date.now()
      const record = rateLimitMap.get(ip)
      
      if (!record || now > record.resetTime) {
        // First request or window expired: Reset counter
        rateLimitMap.set(ip, { count: 1, resetTime: now + WINDOW_MS })
      } else {
        // Existing window: Increment counter
        record.count++
        
        if (record.count > MAX_REQUESTS) {
          // 🚨 DDoS THREAT DETECTED
          console.warn(`[Anti-DDoS] Blocked IP ${ip}. Requests: ${record.count}/${MAX_REQUESTS}`)
          
          return NextResponse.json(
            { error: 'SYS_ERR_RATE_LIMIT: Too many requests. Please slow down.' },
            { 
              status: 429, 
              headers: { 
                'Retry-After': '60',
                'X-RateLimit-Limit': MAX_REQUESTS.toString(),
                'X-RateLimit-Remaining': '0'
              } 
            }
          )
        }
      }
    }
    
    // Pass Security Headers to all API Responses
    const response = NextResponse.next()
    
    if (ip !== 'unknown') {
      const currentRecord = rateLimitMap.get(ip)
      response.headers.set('X-RateLimit-Limit', MAX_REQUESTS.toString())
      response.headers.set('X-RateLimit-Remaining', Math.max(0, MAX_REQUESTS - (currentRecord?.count || 0)).toString())
    }
    
    return response
  }
  
  return NextResponse.next()
}

// Only match API routes to save compute on static pages
export const config = {
  matcher: '/api/:path*',
}
