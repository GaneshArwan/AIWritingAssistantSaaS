import { Editor } from '@/components/Editor'
import { buttonVariants } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function GeneratePage() {
  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <Link href="/dashboard" className={cn(buttonVariants({ variant: "outline", size: "icon" }), "rounded-full shrink-0")}>
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center">
            AI Content Studio
            <span className="ml-3 inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900/50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:text-blue-300">
              <Sparkles className="w-3 h-3 mr-1" />
              Gemini 3 Flash
            </span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Feed your ideas into our advanced writing engine and watch them transform into premium content instantly.
          </p>
        </div>
      </div>

      <div className="relative">
        {/* Decorative background glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-violet-500 rounded-[2rem] blur opacity-10 dark:opacity-20 pointer-events-none"></div>
        <div className="relative bg-white dark:bg-slate-900 p-1 sm:p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl">
          <Editor />
        </div>
      </div>
    </div>
  )
}
