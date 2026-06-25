import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { TerminalSquare, Zap, HardDrive, CheckSquare, ChevronRight } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans selection:bg-blue-500 selection:text-white">
      {/* Header - Brutalist */}
      <header className="px-6 lg:px-12 h-20 flex items-center border-b-2 border-slate-900 dark:border-slate-700 bg-white dark:bg-slate-950 sticky top-0 z-50">
        <Link className="flex items-center justify-center font-black text-2xl tracking-tighter uppercase hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 px-3 py-1 transition-colors border-2 border-transparent hover:border-slate-900 dark:hover:border-white" href="#">
          <TerminalSquare className="inline w-6 h-6 mr-3" />
          SYS.WRITER
        </Link>
        <nav className="ml-auto hidden md:flex items-center gap-8">
          <Link className="font-mono text-xs font-bold uppercase tracking-widest hover:bg-blue-600 hover:text-white px-2 py-1 transition-colors" href="#features">
            [Features]
          </Link>
          <Link className="font-mono text-xs font-bold uppercase tracking-widest hover:bg-blue-600 hover:text-white px-2 py-1 transition-colors" href="#pricing">
            [Pricing]
          </Link>
          <div className="flex items-center gap-4 ml-4 border-l-2 border-slate-900 dark:border-slate-700 pl-8">
            <Link href="/login">
              <Button variant="ghost" className="font-mono text-xs font-bold uppercase tracking-widest rounded-none hover:bg-slate-200 dark:hover:bg-slate-800">AUTH::LOGIN</Button>
            </Link>
            <Link href="/login">
              <Button className="font-mono text-xs font-bold uppercase tracking-widest rounded-none border-2 border-slate-900 bg-blue-600 text-white hover:bg-blue-700 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] transition-all">
                INIT_SYSTEM
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      <main className="flex-1 border-x-2 border-slate-900 dark:border-slate-700 max-w-[1400px] mx-auto w-full bg-white dark:bg-slate-950">
        {/* HERO SECTION */}
        <section className="relative w-full py-24 md:py-32 lg:py-48 overflow-hidden border-b-2 border-slate-900 dark:border-slate-700 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9IiNFMkU4RjAiIGZpbGwtb3BhY2l0eT0iMC40Ii8+PC9zdmc+')] dark:bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9IiMzMzQxNTUiIGZpbGwtb3BhY2l0eT0iMC40Ii8+PC9zdmc+')]">
          
          <div className="container px-6 md:px-12 mx-auto space-y-10 relative z-10">
            <div className="inline-flex items-center border-2 border-slate-900 bg-yellow-300 dark:bg-yellow-500 text-slate-900 px-4 py-2 font-mono text-xs font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] mb-8">
              <Zap className="w-4 h-4 mr-2" />
              ENGINE: GEMINI 3 FLASH
            </div>
            
            <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-[10rem] font-black tracking-tighter uppercase leading-[0.9] text-slate-900 dark:text-white">
              WRITE.<br/>
              <span className="text-blue-600">FASTER.</span><br/>
              SCALE.
            </h1>
            
            <div className="border-l-8 border-slate-900 dark:border-slate-700 pl-6 max-w-[750px]">
              <p className="text-slate-700 dark:text-slate-300 font-mono text-lg md:text-xl leading-relaxed uppercase tracking-wide font-bold">
                A writing terminal for professionals. Generate copy quickly and scale your content.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start gap-6 pt-12">
              <Link href="/login">
                <Button size="lg" className="h-16 px-10 font-mono text-lg font-black uppercase tracking-widest bg-blue-600 hover:bg-blue-700 text-white rounded-none border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] transition-all flex items-center">
                  START_RUN <ChevronRight className="ml-3 w-6 h-6" />
                </Button>
              </Link>
              <Link href="#pricing">
                <Button size="lg" variant="outline" className="h-16 px-10 font-mono text-lg font-black uppercase tracking-widest rounded-none border-2 border-slate-900 bg-white text-slate-900 hover:bg-slate-100 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] transition-all">
                  VIEW_PRICING
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section id="features" className="w-full py-24 md:py-32 border-b-2 border-slate-900 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
          <div className="container px-6 md:px-12 mx-auto">
            <div className="mb-20 border-b-4 border-slate-900 dark:border-slate-700 pb-8">
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase">CORE_MODULES</h2>
              <p className="font-mono text-slate-600 dark:text-slate-400 text-sm font-bold uppercase tracking-widest mt-4">System architecture designed for maximum output.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-2 border-slate-900 dark:border-slate-700 bg-slate-900 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)]">
              {[
                {
                  icon: <TerminalSquare className="w-12 h-12 text-slate-900 dark:text-white" />,
                  title: "MULTI-TEMPLATE_SUPPORT",
                  description: "Templates for Blogs, Emails, Social, and Product descriptions."
                },
                {
                  icon: <Zap className="w-12 h-12 text-slate-900 dark:text-white" />,
                  title: "FAST_EXECUTION",
                  description: "Fast processing using Gemini 3 Flash."
                },
                {
                  icon: <HardDrive className="w-12 h-12 text-slate-900 dark:text-white" />,
                  title: "DASHBOARD",
                  description: "Usage monitoring and generation logs."
                }
              ].map((feature, i) => (
                <div key={i} className={`p-10 md:p-12 bg-white dark:bg-slate-950 ${i !== 2 ? 'border-b-2 md:border-b-0 md:border-r-2' : ''} border-slate-900 dark:border-slate-700`}>
                  <div className="mb-8">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-tight mb-4">{feature.title}</h3>
                  <p className="font-mono text-sm font-bold text-slate-600 dark:text-slate-400 uppercase leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PRICING SECTION */}
        <section id="pricing" className="w-full py-24 md:py-32 bg-white dark:bg-slate-950">
          <div className="container px-6 md:px-12 mx-auto">
            <div className="mb-20 border-b-4 border-slate-900 dark:border-slate-700 pb-8">
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase">LICENSE_TIERS</h2>
              <p className="font-mono text-slate-600 dark:text-slate-400 text-sm font-bold uppercase tracking-widest mt-4">Transparent resource allocation protocols.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-[1200px] mx-auto">
              {/* Free Tier */}
              <div className="flex flex-col p-8 lg:p-12 border-2 border-slate-900 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
                <div className="border-b-2 border-slate-900 dark:border-slate-700 pb-8 mb-8">
                  <h3 className="text-2xl font-black uppercase mb-4">DEV_ENVIRONMENT</h3>
                  <p className="font-mono text-sm font-bold text-slate-600 dark:text-slate-400 uppercase">Evaluation License</p>
                  <div className="mt-8">
                    <span className="text-5xl font-black font-mono">Rp 0</span>
                    <span className="block font-mono font-bold text-slate-600 uppercase mt-2">/ month</span>
                  </div>
                </div>
                
                <ul className="flex-grow space-y-6 mb-12 font-mono text-sm font-bold uppercase text-slate-700 dark:text-slate-300">
                  {['1 API call / month', 'Base templates loaded', 'Community support via forum'].map((item, i) => (
                    <li key={i} className="flex items-start">
                      <CheckSquare className="w-5 h-5 text-slate-900 dark:text-white mr-4 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href="/login" className="block mt-auto">
                  <Button className="w-full h-16 font-mono text-sm font-black uppercase tracking-widest rounded-none border-2 border-slate-900 bg-white text-slate-900 hover:bg-slate-100 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] transition-all">
                    INIT_DEV_ACCOUNT
                  </Button>
                </Link>
              </div>

              {/* Pro Tier (Monthly) */}
              <div className="flex flex-col p-8 lg:p-12 border-2 border-blue-600 bg-white dark:bg-slate-950 shadow-[8px_8px_0px_0px_rgba(37,99,235,1)] relative">
                <div className="absolute -top-4 -right-4 bg-yellow-300 text-slate-900 border-2 border-slate-900 font-mono text-xs font-black uppercase px-3 py-1 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] transform rotate-3 z-10">
                  PRODUCTION_RECOMMENDED
                </div>
                <div className="border-b-2 border-slate-900 dark:border-slate-700 pb-8 mb-8">
                  <h3 className="text-2xl font-black uppercase mb-4 text-blue-600">PRO_MONTHLY</h3>
                  <p className="font-mono text-sm font-bold text-slate-600 dark:text-slate-400 uppercase">Commercial License</p>
                  <div className="mt-8">
                    <span className="text-5xl font-black font-mono">Rp 50rb</span>
                    <span className="block font-mono font-bold text-slate-600 uppercase mt-2">/ 28 days</span>
                  </div>
                </div>
                
                <ul className="flex-grow space-y-6 mb-12 font-mono text-sm font-bold uppercase text-slate-700 dark:text-slate-300">
                  {['30 API calls / month', 'Rollover up to 2 months', 'Commercial Use Authorized', 'SLA: 99.9% Uptime', 'Beta Feature Access'].map((item, i) => (
                    <li key={i} className="flex items-start">
                      <CheckSquare className="w-5 h-5 text-blue-600 mr-4 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href="/login" className="block mt-auto">
                  <Button className="w-full h-16 font-mono text-sm font-black uppercase tracking-widest rounded-none border-2 border-slate-900 bg-white text-blue-600 hover:bg-slate-100 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] transition-all">
                    UPGRADE_MONTHLY
                  </Button>
                </Link>
              </div>

              {/* Pro Tier (Yearly) */}
              <div className="flex flex-col p-8 lg:p-12 border-4 border-slate-900 bg-yellow-300 dark:bg-yellow-500 text-slate-900 shadow-[16px_16px_0px_0px_rgba(15,23,42,1)] relative z-10 transform md:-translate-y-4">
                <div className="absolute -top-5 -right-5 bg-blue-600 text-white border-2 border-slate-900 font-mono text-xs font-black uppercase px-3 py-1 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] transform rotate-3">
                  BEST_VALUE
                </div>
                <div className="border-b-2 border-slate-900 pb-8 mb-8">
                  <h3 className="text-2xl font-black uppercase mb-4 text-slate-900">PRO_YEARLY</h3>
                  <p className="font-mono text-sm font-bold text-slate-800 uppercase">Commercial License (365d)</p>
                  <div className="mt-8">
                    <span className="text-5xl font-black font-mono">Rp 499rb</span>
                    <span className="block font-mono font-bold text-slate-800 uppercase mt-2">/ 365 days</span>
                  </div>
                </div>
                
                <ul className="flex-grow space-y-6 mb-12 font-mono text-sm font-bold uppercase text-slate-800">
                  {['30 API calls / month', 'Rollover up to 2 months', 'Save Rp 101.000 / year', 'Commercial Use Authorized', 'Priority Server Queue'].map((item, i) => (
                    <li key={i} className="flex items-start">
                      <CheckSquare className="w-5 h-5 text-slate-900 mr-4 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href="/login" className="block mt-auto">
                  <Button className="w-full h-16 font-mono text-sm font-black uppercase tracking-widest rounded-none border-2 border-slate-900 bg-slate-900 text-white hover:bg-slate-800 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] transition-all">
                    UPGRADE_YEARLY
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="py-16 md:py-24 border-t-2 border-slate-900 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 z-10">
        <div className="container px-6 md:px-12 mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-16">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 font-black text-2xl uppercase mb-6">
                 <TerminalSquare className="w-8 h-8 text-slate-900 dark:text-white" />
                 <span>SYS.WRITER</span>
              </div>
              <p className="font-mono text-sm font-bold text-slate-600 dark:text-slate-400 max-w-sm uppercase leading-relaxed tracking-wide">
                A simple, fast, and secure content writing tool. Built to help you write better content without the bloat.
              </p>
            </div>
            <div>
              <h4 className="font-black text-lg uppercase tracking-tight mb-6">Product</h4>
              <ul className="space-y-4 font-mono text-sm font-bold uppercase text-slate-600 dark:text-slate-400">
                <li><Link href="#features" className="hover:text-blue-600 transition-colors">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-blue-600 transition-colors">Pricing</Link></li>
                <li><Link href="/docs" className="hover:text-blue-600 transition-colors">Documentation</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-black text-lg uppercase tracking-tight mb-6">Legal</h4>
              <ul className="space-y-4 font-mono text-sm font-bold uppercase text-slate-600 dark:text-slate-400">
                <li><Link href="/privacy" className="hover:text-blue-600 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-blue-600 transition-colors">Terms of Service</Link></li>
                <li><Link href="/acceptable-use" className="hover:text-blue-600 transition-colors">Acceptable Use</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t-2 border-slate-900 dark:border-slate-700 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="font-mono text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
              © {new Date().getFullYear()} GANESH ARWAN. ALL RIGHTS RESERVED.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
