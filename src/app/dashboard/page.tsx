import { UsageWidget } from '@/components/UsageWidget'
import { PastGenerations } from '@/components/PastGenerations'
import { Button, buttonVariants } from '@/components/ui/button'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { SquareTerminal, Plus, LogOut, TerminalSquare } from 'lucide-react'

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans">
      {/* Dashboard Header - Brutalist */}
      <header className="px-6 lg:px-12 h-16 flex items-center border-b-2 border-slate-900 dark:border-slate-700 bg-white dark:bg-slate-900 sticky top-0 z-40">
        <Link className="flex items-center font-black text-xl tracking-tighter uppercase" href="/">
          <TerminalSquare className="w-6 h-6 text-slate-900 dark:text-white mr-2" />
          SYS.WRITER
        </Link>
        <nav className="ml-auto flex items-center gap-4">
          <Link href="/dashboard" className={cn(buttonVariants({ variant: "ghost" }), "font-mono font-bold text-xs uppercase tracking-widest rounded-none hover:bg-slate-100 dark:hover:bg-slate-800")}>
            [Dashboard]
          </Link>
          <Link href="/dashboard/billing" className={cn(buttonVariants({ variant: "ghost" }), "font-mono font-bold text-xs uppercase tracking-widest rounded-none hover:bg-slate-100 dark:hover:bg-slate-800")}>
            [Billing]
          </Link>
          <Link href="/dashboard/settings" className={cn(buttonVariants({ variant: "ghost" }), "font-mono font-bold text-xs uppercase tracking-widest rounded-none hover:bg-slate-100 dark:hover:bg-slate-800")}>
            [Settings]
          </Link>
          <form action="/auth/signout" method="post" className="border-l-2 border-slate-900 dark:border-slate-700 pl-4 ml-2">
            <Button variant="ghost" size="icon" aria-label="Log out" title="Log out" type="submit" className="rounded-none hover:bg-slate-100 dark:hover:bg-slate-800">
              <LogOut className="w-5 h-5" />
            </Button>
          </form>
        </nav>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 space-y-12">
        
        {/* Welcome Banner - Brutalist */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-white dark:bg-slate-900 p-8 md:p-10 border-2 border-slate-900 dark:border-slate-700 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] dark:shadow-[8px_8px_0px_0px_rgba(51,65,85,1)] rounded-none relative overflow-visible">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <SquareTerminal className="w-48 h-48" />
          </div>
          <div className="relative z-10 border-l-8 border-blue-600 pl-6">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">
              STATUS: <span className="text-blue-600">ONLINE</span>
            </h1>
            <p className="font-mono text-slate-600 dark:text-slate-400 mt-4 text-sm font-bold tracking-widest uppercase max-w-xl">
              Systems nominal. Ready to initialize 5-minute generation sprint. Proceed to editor module.
            </p>
          </div>
          <Link href="/dashboard/generate" className={cn(buttonVariants({ size: "lg" }), "relative z-10 w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-mono font-bold uppercase tracking-widest py-8 px-8 rounded-none border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] transition-all")}>
            <Plus className="w-5 h-5 mr-3" />
            INITIATE_SPRINT
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-start">
          <div className="lg:col-span-1">
            <UsageWidget />
          </div>
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between border-b-2 border-slate-900 dark:border-slate-700 pb-2">
              <h2 className="text-sm font-mono font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center">
                <SquareTerminal className="w-4 h-4 mr-2" /> LOG::RECENT_ACTIVITY
              </h2>
            </div>
            <PastGenerations />
          </div>
        </div>
      </main>
    </div>
  )
}
