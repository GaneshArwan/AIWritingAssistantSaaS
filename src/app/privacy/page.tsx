import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 p-8 md:p-12 border-4 border-slate-900 dark:border-slate-700 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] dark:shadow-[8px_8px_0px_0px_rgba(51,65,85,1)]">
        <Link href="/" className="inline-flex items-center font-mono text-sm font-bold uppercase text-blue-600 hover:text-blue-800 dark:hover:text-blue-400 mb-8 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          BACK TO HOME
        </Link>

        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-slate-900 dark:text-white mb-6 border-b-4 border-slate-900 dark:border-slate-700 pb-4">
          Privacy Policy
        </h1>
        
        <div className="space-y-8 text-slate-800 dark:text-slate-300">
          <p className="font-mono text-sm font-bold uppercase bg-yellow-200 dark:bg-yellow-900/50 p-2 border-2 border-slate-900 dark:border-slate-700 inline-block">
            LAST UPDATED: JUNE 2026
          </p>

          <section>
            <h2 className="text-2xl font-black uppercase tracking-tight mb-4">1. INFORMATION WE COLLECT</h2>
            <p className="text-lg leading-relaxed">
              We collect information you provide directly to us, such as your email address when you create an account, and usage data generated when you interact with our AI writing services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black uppercase tracking-tight mb-4">2. HOW WE USE YOUR INFORMATION</h2>
            <p className="text-lg leading-relaxed">
              We use the information we collect to provide, maintain, and improve our services, as well as to communicate with you regarding your account and subscription status.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black uppercase tracking-tight mb-4">3. ACCOUNT DELETION & COOLING-OFF PERIOD</h2>
            <p className="text-lg leading-relaxed mb-4">
              You have the right to request the termination of your account at any time through your account settings. Upon termination, your personal data and generated content will be permanently deleted from our primary servers.
            </p>
            <div className="p-6 bg-red-100 dark:bg-red-900/20 border-4 border-red-600 dark:border-red-500">
              <strong className="block text-red-700 dark:text-red-400 font-black uppercase text-xl tracking-tight mb-2">
                IMPORTANT: 6-MONTH COOLING-OFF POLICY
              </strong>
              <p className="text-red-900 dark:text-red-200 text-lg font-medium leading-relaxed">
                To prevent abuse of our platform and free tier limitations, <strong>email addresses associated with deleted accounts are placed on a strict 6-month cooling-off period.</strong> During this 6-month period, you will not be able to register a new account using the same email address.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black uppercase tracking-tight mb-4">4. SECURITY</h2>
            <p className="text-lg leading-relaxed">
              We implement industry-standard security measures to protect your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
