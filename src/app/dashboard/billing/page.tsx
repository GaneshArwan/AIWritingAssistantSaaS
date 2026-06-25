'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Server, Key, Terminal, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

import Link from 'next/link'

export default function BillingPage() {
  const [user, setUser] = useState<Record<string, string | null> | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: userData, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single()
          
        if (error) {
          console.error("Error fetching user data:", error)
        }
        
        setUser(userData || { subscription_tier: 'free' })
      }
      setLoading(false)
    }
    getUser()
  }, [supabase])

  const handleUpgrade = async (plan: 'monthly' | 'yearly') => {
    try {
      setActionLoading(true)
      const res = await fetch('/api/midtrans/checkout', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      if (data.redirectUrl) window.location.href = data.redirectUrl
    } catch (err) {
      console.error(err)
      alert('SYS_ERR_CHECKOUT_FAIL: Please verify Midtrans configuration.')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-slate-300 border-t-blue-600 rounded-none animate-spin mb-4 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]"></div>
          <p className="font-mono text-sm font-bold uppercase tracking-widest text-slate-900 dark:text-slate-100">FETCHING_USER_DATA...</p>
        </div>
      </div>
    )
  }

  let isPro = user?.subscription_tier === 'pro'
  if (isPro && user?.subscription_expires_at) {
    if (new Date(user.subscription_expires_at) < new Date()) {
      isPro = false
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans">
      {/* Dashboard Header - Brutalist */}
      <header className="px-6 lg:px-12 h-16 flex items-center border-b-2 border-slate-900 dark:border-slate-700 bg-white dark:bg-slate-900 sticky top-0 z-40">
        <Link className="flex items-center font-black text-xl tracking-tighter uppercase" href="/">
          <Terminal className="w-6 h-6 text-slate-900 dark:text-white mr-2" />
          SYS.WRITER
        </Link>
        <nav className="ml-auto flex items-center gap-4">
          <Link href="/dashboard" className="font-mono font-bold text-xs uppercase tracking-widest rounded-none hover:bg-slate-100 dark:hover:bg-slate-800 px-3 py-2">
            [Dashboard]
          </Link>
          <Link href="/dashboard/billing" className="font-mono font-bold text-xs uppercase tracking-widest rounded-none hover:bg-slate-100 dark:hover:bg-slate-800 px-3 py-2">
            [Billing]
          </Link>
          <Link href="/dashboard/settings" className="font-mono font-bold text-xs uppercase tracking-widest rounded-none hover:bg-slate-100 dark:hover:bg-slate-800 px-3 py-2">
            [Settings]
          </Link>
          <form action="/auth/signout" method="post" className="border-l-2 border-slate-900 dark:border-slate-700 pl-4 ml-2">
            <Button variant="ghost" size="icon" aria-label="Log out" title="Log out" type="submit" className="rounded-none hover:bg-slate-100 dark:hover:bg-slate-800">
              <Key className="w-5 h-5" />
            </Button>
          </form>
        </nav>
      </header>
      <div className="max-w-5xl mx-auto w-full p-4 md:p-8 space-y-12">
        <div className="text-left border-b-4 border-slate-900 dark:border-slate-700 pb-8 mt-8">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-slate-900 dark:text-white uppercase">
          Billing <span className="text-blue-600">Interface</span>
        </h1>
        <p className="text-lg font-mono text-slate-600 dark:text-slate-400 mt-4 uppercase tracking-widest">
          Manage system allocation and capacity limits.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start mt-8">
        
        {/* Current Plan Card */}
        <Card className="flex flex-col h-full border-2 border-slate-900 dark:border-slate-700 rounded-none shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] dark:shadow-[8px_8px_0px_0px_rgba(51,65,85,1)] bg-white dark:bg-slate-950 relative overflow-visible transition-all">
          <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
            <Server className="w-32 h-32" />
          </div>
          <CardHeader className="relative z-10 pb-6 border-b-2 border-slate-900 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 rounded-none">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl font-bold uppercase tracking-tight">Active_Plan</CardTitle>
                <CardDescription className="mt-2 font-mono text-sm uppercase text-slate-600">Current authorization level</CardDescription>
              </div>
              <Badge variant="outline" className={cn("text-xs font-mono font-bold px-3 py-1 uppercase rounded-none border-2", isPro ? 'bg-green-500 text-slate-900 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]' : 'bg-slate-200 text-slate-600 border-slate-400')}>
                {isPro ? 'PRO_ACTIVE' : 'FREE_TIER'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="relative z-10 pt-8 space-y-6 flex-grow">

            <div className="flex flex-col space-y-2 border-2 border-slate-900 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
              <span className="text-xs font-mono font-bold text-slate-900 dark:text-slate-300 uppercase tracking-widest border-b-2 border-slate-900 dark:border-slate-700 pb-2 mb-2">Monthly Quota</span>
              <div className="flex items-center justify-between">
                <span className="font-mono text-slate-600 dark:text-slate-400">Allocated Credits</span>
                <span className="font-mono font-bold text-xl">{isPro ? '30' : '1'}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="relative z-10 pt-4 pb-8 px-6 mt-auto">
            {isPro ? (
              <div className="w-full text-center flex items-center justify-center h-12 border-2 border-slate-900 bg-green-500 text-slate-900 font-mono font-bold text-sm uppercase shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
                AUTHORIZATION ACTIVE
              </div>
            ) : (
              <div className="w-full text-center flex items-center justify-center h-12">
                 <p className="text-xs font-mono text-slate-500 uppercase">Upgrade required for capacity increase.</p>
              </div>
            )}
          </CardFooter>
        </Card>

        {/* Upgrade Card */}
        <Card id="upgrade-section" className={cn(
          "flex flex-col h-full border-2 rounded-none shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] relative overflow-visible transition-all duration-300",
          isPro ? "border-slate-300 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 opacity-60" : "border-blue-600 bg-white dark:bg-slate-950 dark:border-blue-500 hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[12px_12px_0px_0px_rgba(15,23,42,1)]"
        )}>
          <CardHeader className={cn("pb-6 border-b-2", isPro ? "border-slate-300 dark:border-slate-800" : "border-blue-600 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/10")}>
            <div className="flex justify-between items-center mb-4">
              <Badge variant="outline" className="bg-blue-600 text-white border-slate-900 rounded-none font-mono text-xs uppercase font-bold px-3 py-1 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
                RECOMMENDED
              </Badge>
            </div>
            <CardTitle className="text-3xl font-bold uppercase tracking-tight">PRO_UPGRADE</CardTitle>
            <div className="mt-4 flex flex-col space-y-2">
              <div className="flex items-baseline text-3xl font-extrabold font-mono text-slate-900 dark:text-white">
                Rp 50rb
                <span className="ml-2 text-lg font-medium text-slate-500 dark:text-slate-400">/ 28 Days</span>
              </div>
              <div className="flex items-baseline text-2xl font-extrabold font-mono text-blue-600 dark:text-blue-400">
                Rp 499rb
                <span className="ml-2 text-sm font-medium text-slate-500 dark:text-slate-400">/ 365 Days (Save ~16%)</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-8 flex-grow">
            <ul className="space-y-4 font-mono text-sm">
              {[
                '500 Generation Credits / Month',
                'Priority Processing Queue',
                'Template Access: FULL',
                'Commercial License: GRANTED',
                'Parameter Controls: UNLOCKED',
                'Quota Rollover: MAX 2 MONTHS',
              ].map((feature, i) => (
                <li key={i} className="flex items-start">
                  <Key className="w-5 h-5 text-blue-600 shrink-0 mr-3" />
                  <span className="text-slate-800 dark:text-slate-300 uppercase">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter className="pt-8 pb-8 flex flex-col space-y-4 px-6 border-t-2 border-slate-100 dark:border-slate-800 mt-auto">
            <div className="space-y-4 w-full">
              <Button 
                onClick={() => handleUpgrade('monthly')} 
                disabled={actionLoading} 
                className="w-full text-sm font-mono font-bold uppercase h-12 rounded-none border-2 bg-slate-900 hover:bg-slate-800 text-white border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                UPGRADE / RENEW: 28 DAYS (Rp 50K)
              </Button>
              <Button 
                onClick={() => handleUpgrade('yearly')} 
                disabled={actionLoading} 
                className="w-full text-sm font-mono font-bold uppercase h-14 rounded-none border-2 bg-blue-600 hover:bg-blue-700 text-white border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                UPGRADE / RENEW: 365 DAYS (Rp 499K)
              </Button>
            </div>

            {!isPro && process.env.NODE_ENV === 'development' && (
              <Button 
                onClick={async () => {
                  setActionLoading(true)
                  const res = await fetch('/api/dev/simulate-pro', { method: 'POST' })
                  if (!res.ok) {
                    const err = await res.json()
                    alert("SYS_ERR_BYPASS: " + (err.error || 'Unknown error'))
                    setActionLoading(false)
                    return
                  }
                  window.location.reload()
                }} 
                disabled={actionLoading} 
                variant="outline"
                className="w-full text-xs font-mono font-bold h-10 border-2 border-dashed border-red-500 text-red-600 rounded-none hover:bg-red-50 uppercase"
              >
                [DEV] OVERRIDE_TO_PRO
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
      
      <div className="border-t-4 border-slate-900 dark:border-slate-700 pt-6 mt-12">
        <div className="font-mono text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <Terminal className="w-4 h-4" /> SECURE_PAYMENT_GATEWAY: MIDTRANS_QRIS
        </div>
      </div>
      </div>
    </div>
  )
}
