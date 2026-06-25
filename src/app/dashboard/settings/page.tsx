'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { TerminalSquare, User, Mail, ShieldAlert, LogOut, Settings, Save, Key, AlertTriangle, Eye, EyeOff, Copy, CheckSquare } from 'lucide-react'

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null) // eslint-disable-line @typescript-eslint/no-explicit-any
  // dbUser removed
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [showKey, setShowKey] = useState(false)
  const [copied, setCopied] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        const { data } = await supabase.from('users').select('*').eq('id', user.id).single()
        if (data) {
          // setDbUser(data) removed
          setName(data.name || '')
        }
      }
    }
    fetchUser()
  }, [supabase])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    try {
      const { error } = await supabase
        .from('users')
        .update({ name })
        .eq('id', user.id)
      
      if (error) throw error
      alert('SYS_MSG: Profile parameters updated successfully.')
    } catch (err: unknown) {
      const error = err as Error
      alert('SYS_ERR: Failed to update profile. ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const copyApiKey = () => {
    navigator.clipboard.writeText('sk_live_51Oxa2x...' + user?.id?.substring(0,8))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDeleteAccount = async () => {
    const confirm = window.confirm("WARNING: This will permanently delete your account and all data. This action CANNOT be reversed. Are you absolutely sure?")
    if (!confirm) return
    
    try {
      const res = await fetch('/api/user/delete', { method: 'DELETE' })
      if (!res.ok) throw new Error('Deletion failed')
      await supabase.auth.signOut({ scope: 'local' })
      alert('SYS_MSG: Account and data permanently erased.')
      window.location.href = '/' // redirect to home which will clear auth state
    } catch (err: unknown) {
      alert('SYS_ERR: Could not delete account.')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans">
      {/* Dashboard Header - Brutalist */}
      <header className="px-6 lg:px-12 h-16 flex items-center border-b-2 border-slate-900 dark:border-slate-700 bg-white dark:bg-slate-900 sticky top-0 z-40">
        <Link className="flex items-center font-black text-xl tracking-tighter uppercase" href="/">
          <TerminalSquare className="w-6 h-6 text-slate-900 dark:text-white mr-2" />
          SYS.WRITER
        </Link>
        <nav className="ml-auto flex items-center gap-4">
          <Link href="/dashboard" className={cn(buttonVariants({ variant: "ghost" }), "font-mono font-bold text-xs uppercase tracking-widest rounded-none hover:bg-slate-100 dark:hover:bg-slate-800 hidden sm:flex")}>
            [Dashboard]
          </Link>
          <Link href="/dashboard/billing" className={cn(buttonVariants({ variant: "ghost" }), "font-mono font-bold text-xs uppercase tracking-widest rounded-none hover:bg-slate-100 dark:hover:bg-slate-800 hidden sm:flex")}>
            [Billing]
          </Link>
          <Link href="/dashboard/settings" className={cn(buttonVariants({ variant: "ghost" }), "font-mono font-bold text-xs uppercase tracking-widest rounded-none hover:bg-slate-100 dark:hover:bg-slate-800 bg-slate-200 dark:bg-slate-800")}>
            [Settings]
          </Link>
          <form action="/auth/signout" method="post" className="border-l-2 border-slate-900 dark:border-slate-700 pl-4 ml-2">
            <Button variant="ghost" size="icon" aria-label="Log out" title="Log out" type="submit" className="rounded-none hover:bg-slate-100 dark:hover:bg-slate-800">
              <LogOut className="w-5 h-5" />
            </Button>
          </form>
        </nav>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-8 space-y-12 mt-8">
        <div className="text-left border-b-4 border-slate-900 dark:border-slate-700 pb-8">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-slate-900 dark:text-white uppercase flex items-center gap-4">
            <Settings className="w-10 h-10 md:w-12 md:h-12" /> SYS.CONFIG
          </h1>
          <p className="text-lg font-mono text-slate-600 dark:text-slate-400 mt-4 uppercase tracking-widest">
            Manage profile, security, and developer integrations.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Profile Card */}
          <Card className="border-2 border-slate-900 dark:border-slate-700 rounded-none shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] bg-white dark:bg-slate-950 flex flex-col">
            <CardHeader className="pb-6 border-b-2 border-slate-900 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 rounded-none">
              <CardTitle className="text-2xl font-bold uppercase tracking-tight flex items-center gap-2">
                <User className="w-5 h-5" /> OPERATOR_PROFILE
              </CardTitle>
              <CardDescription className="mt-2 font-mono text-xs uppercase text-slate-600">Personal identification records</CardDescription>
            </CardHeader>
            <CardContent className="pt-8 flex-1">
              <form id="profile-form" onSubmit={handleSaveProfile} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-xs font-mono font-bold text-slate-900 dark:text-slate-300 uppercase tracking-widest flex items-center">
                    Full Name / Alias
                  </label>
                  <Input 
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter operator designation"
                    className="h-12 bg-slate-50 dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 focus-visible:ring-0 focus-visible:border-blue-600 rounded-none font-mono text-sm shadow-[2px_2px_0px_0px_rgba(15,23,42,0.3)] transition-all"
                  />
                </div>
                <div className="space-y-2 opacity-70">
                  <label className="text-xs font-mono font-bold text-slate-900 dark:text-slate-300 uppercase tracking-widest flex items-center gap-2">
                    <Mail className="w-4 h-4" /> Registered Address
                  </label>
                  <Input 
                    disabled
                    value={user?.email || 'FETCHING...'}
                    className="h-12 bg-slate-200 dark:bg-slate-800 border-2 border-slate-900 dark:border-slate-700 rounded-none font-mono text-sm shadow-none cursor-not-allowed"
                  />
                </div>
              </form>
            </CardContent>
            <CardFooter className="pt-4 pb-8 px-6 border-t-2 border-slate-100 dark:border-slate-800">
              <Button form="profile-form" type="submit" disabled={saving} className="w-full text-sm font-mono font-bold uppercase rounded-none border-2 border-slate-900 bg-blue-600 hover:bg-blue-700 text-white shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] transition-all h-12">
                {saving ? 'UPDATING_RECORDS...' : <><Save className="w-4 h-4 mr-2"/> SAVE_PARAMETERS</>}
              </Button>
            </CardFooter>
          </Card>

          {/* Security Card */}
          <div className="space-y-8">

            <Card className="border-2 border-red-600 rounded-none shadow-[8px_8px_0px_0px_rgba(220,38,38,1)] bg-white dark:bg-slate-950 relative">
              <CardHeader className="pb-4 border-b-2 border-red-600 bg-red-50 dark:bg-red-950/50 rounded-none">
                <CardTitle className="text-xl font-bold uppercase tracking-tight text-red-600 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5" /> DANGER_ZONE
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="font-mono text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-6 leading-relaxed">
                  Permanently terminate your operator session and wipe all stored telemetry and generations from the central mainframe. This action cannot be reversed.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button onClick={handleDeleteAccount} variant="destructive" className="w-full text-xs font-mono font-bold uppercase rounded-none border-2 border-red-900 shadow-[4px_4px_0px_0px_rgba(153,27,27,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(153,27,27,1)] transition-all h-12">
                    TERMINATE_ACCOUNT
                  </Button>
                  <form action="/auth/signout" method="post" className="w-full">
                    <Button type="submit" variant="outline" className="w-full text-xs font-mono font-bold uppercase rounded-none border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] transition-all h-12">
                      SECURE_LOGOUT
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
