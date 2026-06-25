import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { snap } from '@/lib/midtrans'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body for plan (default to monthly)
    let plan = 'monthly'
    try {
      const body = await req.json()
      if (body.plan === 'yearly') {
        plan = 'yearly'
      }
    } catch (e) {
      // ignore empty body, default to monthly
    }

    // Midtrans has a strict 50-character limit for order_id. 
    // user.id is 36 chars. We use the first 8 chars of user.id + timestamp
    const shortUserId = user.id.split('-')[0]
    const orderId = `PRO-${shortUserId}-${Date.now()}`
    
    const price = plan === 'yearly' ? 499000 : 50000;
    const itemName = plan === 'yearly' ? 'Pro Access (365 Days)' : 'Pro Access (28 Days)';
    const itemId = plan === 'yearly' ? 'pro-365-days' : 'pro-28-days';

    const transactionParams = {
      transaction_details: {
        order_id: orderId,
        gross_amount: price
      },
      customer_details: {
        email: user.email,
        // we can add first_name, last_name, etc. if available
      },
      custom_field1: user.id,
      item_details: [{
        id: itemId,
        price: price,
        quantity: 1,
        name: itemName
      }],
      callbacks: {
        finish: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard/billing?status=success`,
        error: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard/billing?status=error`
      }
    }

    const transaction = await snap.createTransaction(transactionParams)
    
    return NextResponse.json({ redirectUrl: transaction.redirect_url })
  } catch (error: unknown) {
    console.error('Midtrans checkout error:', error)
    return NextResponse.json({ error: 'An error occurred during checkout processing.' }, { status: 500 })
  }
}
