'use client'

import { useEffect, useState } from 'react'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { Activity, Zap } from 'lucide-react'

export function UsageWidget() {
  const [usage, setUsage] = useState<{ count: number; limit: number; dailyCount: number; dailyLimit: number } | null>(null)
  const [tier, setTier] = useState<string>('free')
  const supabase = createClient()

  useEffect(() => {
    async function fetchUsage() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const currentMonth = new Date().toISOString().slice(0, 7)
      
      const { data: userData } = await supabase
        .from('users')
        .select('subscription_tier, subscription_expires_at')
        .eq('id', user.id)
        .maybeSingle()
      
      let isPro = userData?.subscription_tier === 'pro'
      if (isPro && userData?.subscription_expires_at) {
        if (new Date(userData.subscription_expires_at) < new Date()) {
          isPro = false
        }
      }
      setTier(isPro ? 'pro' : 'free')
      const limits = isPro ? { monthly: 30, daily: 5 } : { monthly: 1, daily: 1 }

      const { data: usageData } = await supabase
        .from('usage')
        .select('generation_count, daily_count, last_active_date')
        .eq('user_id', user.id)
        .eq('month', currentMonth)
        .maybeSingle()
      
      const formatter = new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' })
      const currentDateText = formatter.format(new Date())
      const count = usageData?.generation_count || 0
      const dailyCount = usageData?.last_active_date === currentDateText ? (usageData?.daily_count || 0) : 0

      setUsage({ 
        count, 
        limit: limits.monthly,
        dailyCount,
        dailyLimit: limits.daily
      })
    }

    fetchUsage()
  }, [supabase])

  if (!usage) {
    return (
      <Card className="border-2 border-slate-900 dark:border-slate-700 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] bg-slate-50 dark:bg-slate-950 overflow-hidden relative animate-pulse rounded-none">
        <CardHeader className="pb-4 pt-6 border-b-2 border-slate-900 dark:border-slate-700"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-none w-1/2"></div></CardHeader>
        <CardContent className="pt-6">
          <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-none w-1/4 mb-2"></div>
          <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-none w-1/3 mb-5"></div>
          <div className="h-2.5 bg-slate-200 dark:bg-slate-800 rounded-none w-full"></div>
        </CardContent>
      </Card>
    )
  }

  const percentage = Math.min((usage.count / usage.limit) * 100, 100)
  const isNearLimit = percentage >= 90

  return (
    <Card className="border-2 border-slate-900 dark:border-slate-700 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] dark:shadow-[8px_8px_0px_0px_rgba(51,65,85,1)] bg-white dark:bg-slate-950 overflow-hidden relative rounded-none font-sans">
      <div className={`absolute top-0 left-0 w-full h-1 ${tier === 'pro' ? 'bg-blue-600' : 'bg-slate-900 dark:bg-slate-700'}`}></div>
      <CardHeader className="pb-4 pt-6 border-b-2 border-slate-900 dark:border-slate-700 bg-slate-100 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-mono font-bold tracking-widest uppercase text-slate-900 dark:text-slate-100 flex items-center">
            <Activity className="w-4 h-4 mr-2" />
            SYS.USAGE
          </CardTitle>
          {tier === 'pro' && (
            <span className="flex items-center text-[10px] font-mono font-bold bg-blue-600 text-white px-2 py-0.5 rounded-none border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] uppercase">
              <Zap className="w-3 h-3 mr-1" /> PRO_ACTIVE
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {/* Monthly Limit */}
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-4xl font-mono font-black tracking-tight text-slate-900 dark:text-white leading-none">{usage.count}</span>
          <span className="text-sm font-mono text-slate-500 dark:text-slate-400 font-bold uppercase">/ {usage.limit}</span>
        </div>
        <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400 mb-2 font-bold uppercase tracking-wider">
          Monthly Quota
        </p>
        <Progress 
          value={percentage} 
          className={`h-2 rounded-none border-2 border-slate-900 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 mb-6 ${isNearLimit ? '[&>div]:bg-red-500' : '[&>div]:bg-blue-600 dark:[&>div]:bg-blue-500'}`} 
        />

        {tier === 'pro' && (
          <>
            {/* Daily Limit */}
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-mono font-black tracking-tight text-slate-900 dark:text-white leading-none">{usage.dailyCount}</span>
              <span className="text-sm font-mono text-slate-500 dark:text-slate-400 font-bold uppercase">/ {usage.dailyLimit}</span>
            </div>
            <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400 mb-2 font-bold uppercase tracking-wider">
              Daily Quota
            </p>
            <Progress 
              value={Math.min((usage.dailyCount / usage.dailyLimit) * 100, 100)} 
              className={`h-2 rounded-none border-2 border-slate-900 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 ${usage.dailyCount >= usage.dailyLimit ? '[&>div]:bg-red-500' : '[&>div]:bg-green-500'}`} 
            />
          </>
        )}
        {isNearLimit && tier === 'free' && (
          <div className="mt-6 p-4 bg-red-50 border-2 border-red-600 rounded-none shadow-[4px_4px_0px_0px_rgba(220,38,38,1)]">
            <p className="text-xs font-mono text-red-900 font-bold uppercase text-center leading-relaxed">
              WARNING: Quota Limit Approaching. Upgrade to PRO to maintain uninterrupted service.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
