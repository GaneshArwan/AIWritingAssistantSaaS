'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PenTool, Loader2, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Turnstile } from '@marsidev/react-turnstile'
import disposableDomains from 'disposable-email-domains'

type AuthMode = 'signin' | 'signup' | 'forgot_password'

export default function LoginPage() {
  const supabase = createClient()
  const router = useRouter()
  
  const [mode, setMode] = useState<AuthMode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [turnstileKey, setTurnstileKey] = useState(0)

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode)
    setError('')
    setMessage('')
    setTurnstileToken(null)
    setTurnstileKey(prev => prev + 1)
  }

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) router.push('/dashboard')
    })
    return () => subscription.unsubscribe()
  }, [supabase.auth, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      if (!turnstileToken) {
        throw new Error('Please complete the Cloudflare Turnstile challenge.')
      }

      if (mode === 'signup') {
        // Block + addressing (e.g., user+1@gmail.com)
        if (email.includes('+')) {
          throw new Error('Plus addressing (e.g., user+1@gmail.com) is not allowed for security reasons.')
        }

        // Comprehensive disposable email check using npm package list (~4000+ domains)
        const domain = email.split('@')[1]?.toLowerCase()
        if (disposableDomains.includes(domain)) {
          throw new Error('Temporary or disposable emails are not allowed.')
        }

        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            captchaToken: turnstileToken,
            emailRedirectTo: `${window.location.origin}/auth/callback`
          }
        })
        if (signUpError) throw signUpError
        setMessage('Check your email for the confirmation link!')
      } 
      else if (mode === 'signin') {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
          options: {
            captchaToken: turnstileToken
          }
        })
        if (signInError) throw signInError
        router.push('/dashboard')
      } 
      else if (mode === 'forgot_password') {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          captchaToken: turnstileToken,
          redirectTo: `${window.location.origin}/dashboard`
        })
        if (resetError) throw resetError
        setMessage('If an account exists, a password reset link has been sent to your email.')
      }
    } catch (err: unknown) {
      const error = err as Error
      let displayError = error.message || 'An error occurred. Please try again.'
      
      // Improve Supabase's default vague error message while maintaining anti-enumeration security
      if (displayError === 'Invalid login credentials') {
        displayError = 'Incorrect email or password.'
      } else if (mode === 'signup' && (displayError.includes('Unexpected failure') || displayError.includes('Database error'))) {
        displayError = 'Registration failed. You may have violated our Terms.'
      }
      
      setError(displayError)
    } finally {
      setLoading(false)
      // Reset turnstile token after submission attempt
      setTurnstileToken(null)
      setTurnstileKey(prev => prev + 1)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-12 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
      
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-8 shadow-2xl border border-slate-200 dark:border-slate-800 relative z-10">
        
        <Link href="/" className="absolute top-4 left-4 inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 transition-colors">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back
        </Link>

        <div className="text-center mt-4">
          <Link href="/" className="inline-flex items-center justify-center font-extrabold text-2xl tracking-tight hover:opacity-80 transition-opacity mb-4">
            <span className="bg-gradient-to-br from-blue-600 to-violet-600 bg-clip-text text-transparent mr-2">
              <PenTool className="inline w-8 h-8 text-blue-600" />
            </span>
            AI Writer SaaS
          </Link>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {mode === 'signin' ? 'Welcome back' : mode === 'signup' ? 'Create an account' : 'Reset password'}
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {mode === 'signin' ? 'Sign in to your account' : mode === 'signup' ? 'Join thousands of professional writers' : 'We will send you a reset link'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-8">
          {error && (
            <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-md border border-red-200 dark:border-red-800">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <p>{error}</p>
            </div>
          )}
          {message && (
            <div className="flex items-center gap-2 p-3 text-sm text-green-600 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-200 dark:border-green-800">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <p>{message}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input 
              id="email" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              placeholder="you@example.com"
            />
          </div>

          {mode !== 'forgot_password' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                {mode === 'signin' && (
                  <button type="button" onClick={() => switchMode('forgot_password')} className="text-xs font-semibold text-blue-600 hover:underline">
                    Forgot password?
                  </button>
                )}
              </div>
              <Input 
                id="password" 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                placeholder="••••••••"
                minLength={6}
              />
            </div>
          )}

          {/* Turnstile Widget - Display for all modes since Supabase CAPTCHA requires it globally */}
          <div className="flex justify-center my-4 min-h-[65px]">
            {!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ? (
              <div className="p-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-md text-center w-full">
                <strong>Configuration Error:</strong><br />
                NEXT_PUBLIC_TURNSTILE_SITE_KEY is missing in your .env file.
              </div>
            ) : (
              <Turnstile 
                key={turnstileKey}
                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} 
                onSuccess={(token) => setTurnstileToken(token)}
                options={{ theme: 'auto' }}
              />
            )}
          </div>

          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading || !turnstileToken}>
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            {mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}
          </Button>
        </form>

        <div className="text-center mt-6">
          {mode === 'signin' ? (
            <p className="text-sm text-slate-500">
              Don&apos;t have an account?{' '}
              <button type="button" onClick={() => switchMode('signup')} className="font-semibold text-blue-600 hover:underline">
                Sign up
              </button>
            </p>
          ) : (
            <p className="text-sm text-slate-500">
              Already have an account?{' '}
              <button type="button" onClick={() => switchMode('signin')} className="font-semibold text-blue-600 hover:underline">
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
