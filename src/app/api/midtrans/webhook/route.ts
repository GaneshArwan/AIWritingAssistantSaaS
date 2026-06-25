import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status
    } = body

    // 1. Verify Signature
    const serverKey = process.env.MIDTRANS_SERVER_KEY
    if (!serverKey) {
      console.error('MIDTRANS_SERVER_KEY is missing')
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
    }
    const payload = `${order_id}${status_code}${gross_amount}${serverKey}`
    const expectedSignature = crypto.createHash('sha512').update(payload).digest('hex')

    // Prevent Timing Attacks using timingSafeEqual
    let isSignatureValid = false
    try {
      const expectedBuffer = Buffer.from(expectedSignature, 'hex')
      const signatureBuffer = Buffer.from(signature_key || '', 'hex')
      if (expectedBuffer.length === signatureBuffer.length) {
        isSignatureValid = crypto.timingSafeEqual(expectedBuffer, signatureBuffer)
      }
    } catch (e) {
      isSignatureValid = false
    }

    if (!isSignatureValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })
    }

    const amount = parseFloat(gross_amount)
    let daysToAdd = 0

    if (amount === 50000.00 || amount === 50000) {
      daysToAdd = 28
    } else if (amount === 499000.00 || amount === 499000) {
      daysToAdd = 365
    } else {
      console.warn(`Webhook Ignored: Invalid gross_amount (${gross_amount}) received.`)
      // Return 200 so Midtrans stops retrying this specific payload.
      return NextResponse.json({ message: 'Ignored: Invalid amount' })
    }

    // 2. Check transaction status
    if (transaction_status === 'capture' || transaction_status === 'settlement') {
      // 3. Extract User ID from order_id (Format: PRO-{user_id}-{timestamp})
      const parts = order_id.split('-')
      if (parts[0] !== 'PRO' || parts.length < 3) {
        return NextResponse.json({ error: 'Invalid order format' }, { status: 400 })
      }
      
      const userId = body.custom_field1

      if (!userId) {
        return NextResponse.json({ error: 'Missing user ID in custom_field1' }, { status: 400 })
      }

      // 4. Update Database
      const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')
      const adminSupabase = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )

      // Prevent Replay Attacks
      const { data: userData, error: userError } = await adminSupabase
        .from('users')
        .select('latest_order_id, subscription_expires_at')
        .eq('id', userId)
        .single()

      if (userError) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      if (userData.latest_order_id === order_id) {
        console.log(`Webhook ignored: Order ${order_id} already processed.`)
        return NextResponse.json({ message: 'Already processed' })
      }

      // Calculate new expiry date (Strict Renew from TODAY - Capitalist Logic)
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + daysToAdd)

      await adminSupabase
        .from('users')
        .update({
          subscription_tier: 'pro',
          subscription_expires_at: expiresAt.toISOString(),
          latest_order_id: order_id
        })
        .eq('id', userId)
        .throwOnError()

      console.log(`✅ User ${userId} successfully upgraded to PRO via Midtrans! Expires: ${expiresAt.toISOString()}`)
    }

    return NextResponse.json({ message: 'OK' })
  } catch (error: unknown) {
    console.error('Midtrans Webhook Error:', error)
    return NextResponse.json({ error: 'An error occurred during webhook processing.' }, { status: 500 })
  }
}
