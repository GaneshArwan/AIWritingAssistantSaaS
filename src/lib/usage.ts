import { createClient } from '@/lib/supabase/server'

export const LIMITS = {
  free: { monthly: 1, daily: 1 },
  pro: { monthly: 30, daily: 5 },
}

export function calculateRolloverLimit(currentMonth: string, tier: 'free' | 'pro', usageHistory: { month: string, generation_count: number }[]) {
  const limits = LIMITS[tier]
  if (tier !== 'pro' || !usageHistory || usageHistory.length === 0) {
    return limits.monthly
  }

  const BASE_PRO = limits.monthly
  let minMonth = currentMonth
  const usageMap = new Map<string, number>()
  
  for (const row of usageHistory) {
    if (row.month < minMonth) minMonth = row.month
    usageMap.set(row.month, row.generation_count)
  }

  let iter = minMonth
  let bank: { month: string, remaining: number }[] = []
  
  // Simulate consumption up to M-1
  while (iter < currentMonth) {
    // Expire old quotas: For month `iter`, anything older than `iter - 2` is expired
    // Because Date month is 0-indexed, if im is the month number (1 for Jan),
    // im - 4 correctly targets the 0-indexed month of iter - 3
    const [iy, im] = iter.split('-').map(Number)
    const dExpired = new Date(iy, im - 4, 1)
    const expiredMonth = `${dExpired.getFullYear()}-${String(dExpired.getMonth() + 1).padStart(2, '0')}`
    
    bank = bank.filter(q => q.month > expiredMonth)
    
    // Grant base quota for this historical month
    bank.push({ month: iter, remaining: BASE_PRO })
    
    // Consume usage from oldest to newest (FIFO)
    let used = usageMap.get(iter) || 0
    for (const q of bank) {
      if (used <= 0) break
      if (q.remaining > 0) {
        const deduct = Math.min(q.remaining, used)
        q.remaining -= deduct
        used -= deduct
      }
    }
    
    // Advance to next month
    const dNext = new Date(iy, im, 1) // im is already 0-indexed for the NEXT month! (if im=1 (Jan), im in Date means Feb)
    iter = `${dNext.getFullYear()}-${String(dNext.getMonth() + 1).padStart(2, '0')}`
  }
  
  // Now calculate for currentMonth
  const [cy, cm] = currentMonth.split('-').map(Number)
  const dExpiredCurr = new Date(cy, cm - 4, 1) 
  const expiredMonthCurr = `${dExpiredCurr.getFullYear()}-${String(dExpiredCurr.getMonth() + 1).padStart(2, '0')}`
  
  // Remove expired quotas
  bank = bank.filter(q => q.month > expiredMonthCurr)
  
  // Sum the remaining carried-over quotas
  const carryOver = bank.reduce((sum, q) => sum + q.remaining, 0)
  
  // Active limit = Base (30) + Valid Carry Over
  return BASE_PRO + carryOver
}

export async function getUsageStatus(userId: string, timezone: string = 'UTC') {
  const supabase = await createClient()
  const formatter = new Intl.DateTimeFormat('en-CA', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' })
  const currentDateText = formatter.format(new Date()) // YYYY-MM-DD
  const currentMonth = currentDateText.slice(0, 7) // YYYY-MM

  // Get user tier
  const { data: user } = await supabase
    .from('users')
    .select('subscription_tier, subscription_expires_at')
    .eq('id', userId)
    .maybeSingle()

  let tier = (user?.subscription_tier as keyof typeof LIMITS) || 'free'
  
  // Check if prepaid Pro has expired
  if (tier === 'pro' && user?.subscription_expires_at) {
    if (new Date(user.subscription_expires_at) < new Date()) {
      tier = 'free'
    }
  }

  const limits = LIMITS[tier]
  let activeDailyLimit = limits.daily

  // Fetch all usage for rollover calculation and current status
  const { data: usageHistory, error } = await supabase
    .from('usage')
    .select('month, generation_count, daily_count, last_active_date')
    .eq('user_id', userId)
    .order('month', { ascending: true })

  if (error) {
    console.error('Database error in getUsageStatus:', error)
    throw new Error('SYS_ERR_DB_USAGE_GET: ' + error.message)
  }

  const currentUsageRow = usageHistory?.find(u => u.month === currentMonth)
  const count = currentUsageRow?.generation_count || 0
  const dailyCount = currentUsageRow?.last_active_date === currentDateText ? (currentUsageRow?.daily_count || 0) : 0

  const activeMonthlyLimit = calculateRolloverLimit(currentMonth, tier, usageHistory || [])

  // We use <= because we PRE-EMPTIVELY increment the usage count before checking it to prevent TOCTOU race conditions
  const monthlyAllowed = count <= activeMonthlyLimit
  const dailyAllowed = dailyCount <= activeDailyLimit

  return {
    count,
    dailyCount,
    limit: activeMonthlyLimit,
    dailyLimit: activeDailyLimit,
    allowed: monthlyAllowed && dailyAllowed,
    reason: !monthlyAllowed ? 'monthly' : (!dailyAllowed ? 'daily' : 'allowed')
  }
}

export async function incrementUsage(userId: string, timezone: string = 'UTC') {
  const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')
  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const formatter = new Intl.DateTimeFormat('en-CA', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' })
  const currentDateText = formatter.format(new Date())
  const currentMonth = currentDateText.slice(0, 7)
  
  const { error } = await supabase.rpc('increment_generation_count', {
    target_user_id: userId,
    target_month: currentMonth,
    current_date_text: currentDateText
  })

  if (error) {
    console.error('Failed to increment usage via RPC:', error)
    throw new Error('SYS_ERR_DB_USAGE_INC: ' + error.message)
  }
}

export async function decrementUsage(userId: string, timezone: string = 'UTC') {
  const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')
  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const formatter = new Intl.DateTimeFormat('en-CA', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' })
  const currentDateText = formatter.format(new Date())
  const currentMonth = currentDateText.slice(0, 7)
  
  const { error } = await supabase.rpc('decrement_generation_count', {
    target_user_id: userId,
    target_month: currentMonth,
    current_date_text: currentDateText
  })

  if (error) {
    console.error('Failed to decrement usage via RPC:', error)
    throw new Error('SYS_ERR_DB_USAGE_DEC: ' + error.message)
  }
}
