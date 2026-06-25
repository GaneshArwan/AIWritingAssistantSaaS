'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import ReactMarkdown from 'react-markdown'
import { Loader2, AlertTriangle, Terminal, Copy, CheckSquare, Settings2, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

type ContentType = 'blog' | 'email' | 'social' | 'product'

export function Editor() {
  const [type, setType] = useState<ContentType>('blog')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copiedText, setCopiedText] = useState(false)
  const [copiedMd, setCopiedMd] = useState(false)

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!input) return
    
    setLoading(true)
    setError('')
    
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-timezone': Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
        },
        body: JSON.stringify({ type, input }),
      })
      
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'SYS_ERR_GENERATION_FAILED')
      }
      
      setOutput('')
      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let done = false
      let currentOutput = ''
      
      if (reader) {
        while (!done) {
          const { value, done: readerDone } = await reader.read()
          done = readerDone
          if (value) {
            currentOutput += decoder.decode(value, { stream: true })
            setOutput(currentOutput)
          }
        }
      }
    } catch (err: unknown) {
      const error = err as Error
      console.error('Generation Error:', error)
      setError(error.message || 'SYS_ERR_UNKNOWN')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full font-sans">
      
      {/* Configuration Panel - Industrial / Brutalist */}
      <div className="lg:col-span-4 h-full flex flex-col">
        <Card className="h-full border-2 border-slate-900 dark:border-slate-700 rounded-none shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] dark:shadow-[8px_8px_0px_0px_rgba(51,65,85,1)] bg-white dark:bg-slate-950 relative overflow-visible transition-all">
          <CardHeader className="pb-4 border-b-2 border-slate-900 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 rounded-none">
            <CardTitle className="text-xl flex items-center font-bold tracking-tight uppercase">
              <Settings2 className="w-5 h-5 mr-2" />
              SYS.CONFIG
            </CardTitle>
            <CardDescription className="font-mono text-xs text-slate-500 uppercase tracking-wider">
              Define Generation Parameters
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-6 relative z-10 flex-1 flex flex-col">
            <form onSubmit={handleGenerate} className="space-y-6 flex-1 flex flex-col">
              
              <div className="space-y-2">
                <label htmlFor="content-type" className="text-xs font-mono font-bold text-slate-900 dark:text-slate-300 uppercase tracking-widest flex items-center">
                  [01] Format_Type
                </label>
                <div className="relative">
                  <Select value={type} onValueChange={(val: ContentType | null) => {
                    if (val) setType(val)
                  }}>
                    <SelectTrigger id="content-type" aria-label="Select Content Type" className="h-12 bg-slate-50 dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 focus:ring-0 focus:border-blue-600 rounded-none font-mono text-sm shadow-[2px_2px_0px_0px_rgba(15,23,42,0.3)]">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="rounded-none border-2 border-slate-900 dark:border-slate-700 font-mono text-sm">
                      <SelectItem value="blog" className="py-3 cursor-pointer">/blog_post</SelectItem>
                      <SelectItem value="email" className="py-3 cursor-pointer">/email_campaign</SelectItem>
                      <SelectItem value="social" className="py-3 cursor-pointer">/social_update</SelectItem>
                      <SelectItem value="product" className="py-3 cursor-pointer">/product_desc</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2 flex-1 flex flex-col">
                <label htmlFor="input-text" className="text-xs font-mono font-bold text-slate-900 dark:text-slate-300 uppercase tracking-widest flex items-center justify-between">
                  <span>[02] Input_Context</span>
                  <span className="text-slate-500">{input.length} B</span>
                </label>
                <Textarea
                  id="input-text"
                  placeholder="Enter initialization parameters here..."
                  className="flex-1 min-h-[300px] resize-none bg-slate-50 dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 focus:ring-0 focus:border-blue-600 rounded-none p-4 font-mono text-sm leading-relaxed shadow-[4px_4px_0px_0px_rgba(15,23,42,0.1)] transition-all"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
              </div>

              {error && (
                <div className="flex items-start gap-3 p-4 text-sm text-red-700 bg-red-100 border-2 border-red-700 rounded-none font-mono">
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="font-bold uppercase">{error}</p>
                </div>
              )}

              <Button 
                type="submit"
                size="lg"
                className={cn(
                  "w-full h-14 text-base font-bold uppercase tracking-widest rounded-none border-2 transition-all duration-200 mt-auto",
                  loading || !input 
                    ? "bg-slate-200 text-slate-500 border-slate-300 dark:bg-slate-800 dark:text-slate-600 dark:border-slate-700 cursor-not-allowed" 
                    : "bg-blue-600 hover:bg-blue-700 text-white border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] hover:translate-x-[2px] hover:translate-y-[2px]"
                )}
                disabled={loading || !input}
              >
                {loading ? (
                  <><Loader2 className="mr-3 h-5 w-5 animate-spin" /> EXECUTING...</>
                ) : (
                  <><Terminal className="mr-3 w-5 h-5" /> INITIALIZE_RUN</>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Output Panel - Industrial Terminal */}
      <div className="lg:col-span-8 h-full flex flex-col">
        <Card className="h-full border-2 border-slate-900 dark:border-slate-700 rounded-none shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] dark:shadow-[8px_8px_0px_0px_rgba(51,65,85,1)] bg-slate-50 dark:bg-slate-950 flex flex-col overflow-hidden relative">
          
          {/* Output Header */}
          <div className="border-b-2 border-slate-900 dark:border-slate-700 px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between bg-slate-200 dark:bg-slate-900 rounded-none gap-4">
            <div className="flex items-center space-x-4">
              <div className="flex space-x-2">
                <div className="w-4 h-4 border-2 border-slate-900 dark:border-slate-700 bg-red-500"></div>
                <div className="w-4 h-4 border-2 border-slate-900 dark:border-slate-700 bg-yellow-500"></div>
                <div className="w-4 h-4 border-2 border-slate-900 dark:border-slate-700 bg-green-500"></div>
              </div>
              <span className="font-mono text-sm font-bold uppercase tracking-widest text-slate-700 dark:text-slate-300">
                OUT::TERMINAL
              </span>
            </div>
            
            {output && (
              <div className="flex space-x-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    const plainText = output.replace(/[*_~`#]/g, '')
                    navigator.clipboard.writeText(plainText)
                    setCopiedText(true)
                    setTimeout(() => setCopiedText(false), 2000)
                  }}
                  className={cn(
                    "rounded-none border-2 border-slate-900 h-9 px-4 font-mono text-xs font-bold uppercase transition-all shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[1px_1px_0px_0px_rgba(15,23,42,1)]",
                    copiedText ? "bg-green-500 text-slate-900" : "bg-white text-slate-900 hover:bg-slate-100"
                  )}
                >
                  {copiedText ? <CheckSquare className="w-4 h-4 mr-2" /> : <FileText className="w-4 h-4 mr-2" />}
                  TXT
                </Button>
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={() => {
                    navigator.clipboard.writeText(output)
                    setCopiedMd(true)
                    setTimeout(() => setCopiedMd(false), 2000)
                  }}
                  className={cn(
                    "rounded-none border-2 border-slate-900 h-9 px-4 font-mono text-xs font-bold uppercase transition-all shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[1px_1px_0px_0px_rgba(15,23,42,1)]",
                    copiedMd ? "bg-green-500 text-slate-900" : "bg-blue-600 text-white hover:bg-blue-700"
                  )}
                >
                  {copiedMd ? <CheckSquare className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                  MD
                </Button>
              </div>
            )}
          </div>

          {/* Content Body */}
          <div className="flex-1 relative p-8 md:p-12 overflow-y-auto bg-white dark:bg-slate-950">
            {loading && !output ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/10 dark:bg-slate-950/80 backdrop-blur-sm z-10">
                <div className="w-16 h-16 border-4 border-slate-300 border-t-blue-600 rounded-none animate-spin mb-6 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]"></div>
                <h3 className="font-mono text-xl font-bold uppercase tracking-widest text-slate-900 dark:text-slate-100">Processing</h3>
                <p className="mt-2 font-mono text-sm text-blue-600 dark:text-blue-400 animate-pulse uppercase">Please wait...</p>
              </div>
            ) : output ? (
              <div className="prose prose-slate dark:prose-invert max-w-none 
                prose-headings:font-bold prose-headings:tracking-tight
                prose-h1:text-3xl prose-h1:border-b-2 prose-h1:border-slate-900 prose-h1:pb-2
                prose-h2:text-2xl prose-h2:mt-8 
                prose-h3:text-xl
                prose-p:leading-relaxed prose-p:text-slate-700 dark:prose-p:text-slate-300
                prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:font-semibold prose-a:underline-offset-4
                prose-strong:text-slate-900 dark:prose-strong:text-white
                prose-ul:list-square prose-li:marker:text-blue-600
                prose-blockquote:border-l-4 prose-blockquote:border-blue-600 prose-blockquote:bg-slate-50 dark:prose-blockquote:bg-slate-900 prose-blockquote:px-4 prose-blockquote:py-1 prose-blockquote:font-medium
                prose-code:text-blue-700 prose-code:bg-blue-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-none prose-code:border prose-code:border-blue-200
                dark:prose-code:text-blue-300 dark:prose-code:bg-blue-900/30 dark:prose-code:border-blue-800
                animate-in fade-in slide-in-from-bottom-4 duration-500">
                <ReactMarkdown>{output}</ReactMarkdown>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-40 space-y-6">
                <Terminal className="w-16 h-16 text-slate-900 dark:text-slate-400" />
                <div>
                  <h3 className="font-mono text-xl font-bold uppercase tracking-widest text-slate-900 dark:text-slate-300">Awaiting Input</h3>
                  <p className="mt-2 font-mono text-sm text-slate-600 dark:text-slate-500 max-w-sm mx-auto uppercase">
                    System standby. Fill parameters and execute run.
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
