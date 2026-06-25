import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 p-8 md:p-12 border-4 border-slate-900 dark:border-slate-700 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] dark:shadow-[8px_8px_0px_0px_rgba(51,65,85,1)]">
        <Link href="/" className="inline-flex items-center font-mono text-sm font-bold uppercase text-blue-600 hover:text-blue-800 dark:hover:text-blue-400 mb-8 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          BACK TO HOME
        </Link>

        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-slate-900 dark:text-white mb-6 border-b-4 border-slate-900 dark:border-slate-700 pb-4">
          Terms of Service
        </h1>
        
        <div className="space-y-8 text-slate-800 dark:text-slate-300">
          <p className="font-mono text-sm font-bold uppercase bg-yellow-200 dark:bg-yellow-900/50 p-2 border-2 border-slate-900 dark:border-slate-700 inline-block">
            LAST UPDATED: JUNE 2026
          </p>

          <section>
            <h2 className="text-2xl font-black uppercase tracking-tight mb-4">1. ACCEPTANCE OF TERMS</h2>
            <p className="text-lg leading-relaxed">
              By accessing and using SYS.WRITER, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black uppercase tracking-tight mb-4">2. PROVISION OF SERVICES</h2>
            <p className="text-lg leading-relaxed">
              We reserve the right to modify, suspend, or discontinue any part of our service at any time without prior notice. We do not guarantee that our AI models will be available 100% of the time.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black uppercase tracking-tight mb-4">3. USER ACCOUNTS</h2>
            <p className="text-lg leading-relaxed">
              You are responsible for maintaining the confidentiality of your account credentials. You must immediately notify us of any unauthorized use of your account.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
