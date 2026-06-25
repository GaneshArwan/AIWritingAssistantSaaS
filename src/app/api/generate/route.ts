import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { getGemini, GEMINI_MODEL } from '@/lib/gemini'
import { getUsageStatus, incrementUsage, decrementUsage } from '@/lib/usage'
import { getPrompt, ContentType } from '@/lib/prompts'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const genAI = getGemini()
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { type, input } = (await req.json()) as { type: ContentType; input: string }

    if (!type || !input) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (input.length > 3000) {
      return NextResponse.json({ error: 'Input text is too long (max 3000 characters)' }, { status: 400 })
    }

    const timezone = req.headers.get('x-user-timezone') || 'UTC'
    let usageIncremented = false;

    try {
      // PRE-EMPTIVELY increment usage to prevent race condition attacks (TOCTOU)
      await incrementUsage(user.id, timezone)
      usageIncremented = true;

      const { allowed, reason, limit } = await getUsageStatus(user.id, timezone)

      if (!allowed) {
        // Refund because they are blocked
        await decrementUsage(user.id, timezone)
        usageIncremented = false;
        
        const errMsg = reason === 'daily' 
          ? 'Daily limit reached. Please try again tomorrow.' 
          : 'Monthly limit reached. Please upgrade your plan.'
          
        return NextResponse.json(
          { error: errMsg },
          { status: 403 }
        )
      }

    // Extract IP safely (avoiding spoofing by using strict Vercel headers or Next.js req.ip)
    const rawIp = req.ip ?? req.headers.get('x-vercel-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown'
    const ip = rawIp.split(',')[0].trim()

    // We use the Service Role Key here to bypass RLS
    const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')
    const adminSupabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Abuse Prevention: Disposable Emails & Plus Addressing (for free tier)
    // We check if the limit is 20 (which indicates Free Tier based on current logic)
    if (limit <= 20 && user.email) {
      const emailLower = user.email.toLowerCase()
      if (emailLower.includes('+')) {
        await adminSupabase.from('abuse_logs').insert({ user_id: user.id, email: user.email, ip_address: ip, reason: 'Plus addressing' }).throwOnError()
        // Refund usage since we blocked them
        await decrementUsage(user.id, timezone)
        usageIncremented = false;
        return NextResponse.json(
          { error: 'SYS_ERR_ABUSE: Plus addressing (+) is restricted on the Free Tier.' },
          { status: 403 }
        )
      }
      // Expanded blocklist for disposable emails (ideally replaced by dynamic API like Kickbox in production)
      const disposableDomains = [
        'mailinator.com', '10minutemail.com', 'yopmail.com', 'temp-mail.org', 
        'guerrillamail.com', 'tempmail.com', 'throwawaymail.com', 'tempmail.net',
        'getnada.com', 'maildrop.cc', 'anonaddy.me', 'simplelogin.co',
        'trashmail.com', 'dispostable.com', 'sharklasers.com', 'nada.ltd'
      ]
      const domain = emailLower.split('@')[1]
      if (disposableDomains.some(d => domain === d || domain.endsWith('.' + d))) {
        await adminSupabase.from('abuse_logs').insert({ user_id: user.id, email: user.email, ip_address: ip, reason: 'Disposable email' }).throwOnError()
        // Refund usage since we blocked them
        await decrementUsage(user.id, timezone)
        usageIncremented = false;
        return NextResponse.json(
          { error: 'SYS_ERR_ABUSE: Disposable email providers are not supported on the Free Tier.' },
          { status: 403 }
        )
      }
    }

    // IP Abuse Prevention (Free Tier)
    if (limit <= 20 && ip !== 'unknown' && process.env.NODE_ENV !== 'development') {
      // Anti-DoS: Check if IP is already logged for this user to prevent log bloat
      const { data: existingIp } = await adminSupabase
        .from('ip_logs')
        .select('id')
        .eq('ip_address', ip)
        .eq('user_id', user.id)
        .limit(1)
        
      if (!existingIp || existingIp.length === 0) {
        await adminSupabase.from('ip_logs').insert({ ip_address: ip, user_id: user.id }).throwOnError()
      }
      
      // Count distinct users for this IP
      const { data: ipUsers, error: ipError } = await adminSupabase
        .from('ip_logs')
        .select('user_id')
        .eq('ip_address', ip)
        
      if (ipError) throw ipError;
        
      if (ipUsers) {
        const distinctUsers = new Set(ipUsers.map(r => r.user_id))
        if (distinctUsers.size > 3) {
          // Anti-DoS: Check if already logged in abuse_logs to prevent table bloat
          const { data: existingAbuse } = await adminSupabase
            .from('abuse_logs')
            .select('id')
            .eq('user_id', user.id)
            .eq('reason', 'IP rate limit exceeded')
            .limit(1)
            
          if (!existingAbuse || existingAbuse.length === 0) {
            await adminSupabase.from('abuse_logs').insert({ user_id: user.id, email: user.email, ip_address: ip, reason: 'IP rate limit exceeded' }).throwOnError()
          }
          
          await decrementUsage(user.id, timezone)
          usageIncremented = false;
          return NextResponse.json(
            { error: 'SYS_ERR_ABUSE: Too many free accounts from this network. Upgrade to Pro.' },
            { status: 403 }
          )
        }
      }
    }

    // Call Gemini 3 Flash using Streaming
    const { defaultSafetySettings } = await import('@/lib/gemini')
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL })
    const prompt = getPrompt(type, input)

    try {
      const result = await model.generateContentStream({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        safetySettings: defaultSafetySettings,
      })

      const encoder = new TextEncoder()
      const stream = new ReadableStream({
        async start(controller) {
          let fullText = ''
          try {
            for await (const chunk of result.stream) {
              const chunkText = chunk.text()
              fullText += chunkText
              controller.enqueue(encoder.encode(chunkText))
            }
            
            // Background tasks after stream completes
            const { error: dbError } = await adminSupabase.from('generations').insert({
              user_id: user.id,
              content_type: type,
              input_text: input,
              output_text: fullText,
            })
            if (dbError) console.error('Database Error:', dbError)
            
            controller.close()
          } catch (err: unknown) {
            console.error('Streaming error:', err)
            controller.error(err)
          }
        }
      })

      return new Response(stream, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
      } catch (error: unknown) {
        const err = error as Error
        console.error('AI Generation Setup Error:', err)
        // Refund usage since it failed to start
        await decrementUsage(user.id, timezone).catch(e => console.error('Refund Error:', e))
        usageIncremented = false;
        return NextResponse.json({ error: 'SYS_ERR_GEMINI: ' + (err.message || 'Unknown AI error') }, { status: 502 })
      }
    } catch (innerError: unknown) {
      const iErr = innerError as Error
      if (usageIncremented) {
        console.log('Refunding usage due to inner error:', iErr.message);
        const timezone = req.headers.get('x-user-timezone') || 'UTC'
        await decrementUsage(user.id, timezone).catch(e => console.error('Failed to refund usage on inner error:', e));
      }
      throw innerError;
    }

  } catch (error: unknown) {
    const err = error as Error
    console.error('Generation API Error:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
