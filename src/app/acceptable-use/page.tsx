import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function AcceptableUsePage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 p-8 md:p-12 border-4 border-slate-900 dark:border-slate-700 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] dark:shadow-[8px_8px_0px_0px_rgba(51,65,85,1)]">
        <Link href="/" className="inline-flex items-center font-mono text-sm font-bold uppercase text-blue-600 hover:text-blue-800 dark:hover:text-blue-400 mb-8 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          BACK TO HOME
        </Link>

        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-slate-900 dark:text-white mb-6 border-b-4 border-slate-900 dark:border-slate-700 pb-4">
          Acceptable Use
        </h1>
        
        <div className="space-y-8 text-slate-800 dark:text-slate-300">
          <p className="font-mono text-sm font-bold uppercase bg-yellow-200 dark:bg-yellow-900/50 p-2 border-2 border-slate-900 dark:border-slate-700 inline-block">
            STRICT ENFORCEMENT
          </p>

          <section>
            <h2 className="text-2xl font-black uppercase tracking-tight mb-4">1. PROHIBITED CONTENT</h2>
            <p className="text-lg leading-relaxed">
              You may not use our AI to generate content that is illegal, harmful, threatening, abusive, harassing, defamatory, or promotes discrimination based on race, sex, religion, nationality, disability, sexual orientation, or age.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black uppercase tracking-tight mb-4">2. AUTOMATION & SPAM</h2>
            <p className="text-lg leading-relaxed">
              Using scripts, bots, or any automated methods to access our API bypassing our official interfaces is strictly forbidden. We actively monitor for programmatic abuse.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black uppercase tracking-tight mb-4">3. PLATFORM ABUSE</h2>
            <p className="text-lg leading-relaxed mb-4">
              Creating multiple free accounts to bypass usage limits is a direct violation of our policies. 
            </p>
            <div className="p-4 bg-slate-100 dark:bg-slate-800 border-l-8 border-slate-900 dark:border-slate-500">
              <p className="text-slate-900 dark:text-slate-200 font-bold uppercase tracking-tight">
                Violators will face immediate account termination without notice and potential IP bans.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
