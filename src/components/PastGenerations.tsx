'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { TerminalSquare, Clock } from 'lucide-react'

interface Generation {
  id: string;
  content_type: string;
  input_text: string;
  created_at: string;
}

export function PastGenerations() {
  const [generations, setGenerations] = useState<Generation[] | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function fetchGenerations() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setGenerations([])
        return
      }

      const { data } = await supabase
        .from('generations')
        .select('id, content_type, input_text, created_at')
        .eq('user_id', user.id) // IMPORTANT: Prevent leaking other users' data!
        .order('created_at', { ascending: false })
        .limit(10)
      
      if (data) {
        setGenerations(data as Generation[])
      } else {
        setGenerations([])
      }
    }

    fetchGenerations()
  }, [supabase])

  return (
    <div className="border-2 border-slate-900 dark:border-slate-700 bg-white dark:bg-slate-950 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] dark:shadow-[8px_8px_0px_0px_rgba(51,65,85,1)] rounded-none overflow-hidden font-sans">
      <Table>
        <TableHeader className="bg-slate-100 dark:bg-slate-900 border-b-2 border-slate-900 dark:border-slate-700">
          <TableRow className="border-none hover:bg-transparent">
            <TableHead className="font-mono text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-slate-300 py-4 px-6">Type</TableHead>
            <TableHead className="font-mono text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-slate-300 py-4">Parameters</TableHead>
            <TableHead className="font-mono text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-slate-300 py-4 px-6 text-right">Timestamp</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {generations === null ? (
            Array.from({ length: 3 }).map((_, i) => (
              <TableRow key={`skeleton-${i}`} className="animate-pulse border-b-2 border-slate-100 dark:border-slate-800">
                <TableCell className="px-6"><div className="h-6 w-16 bg-slate-200 dark:bg-slate-800 rounded-none"></div></TableCell>
                <TableCell><div className="h-4 w-48 bg-slate-200 dark:bg-slate-800 rounded-none"></div></TableCell>
                <TableCell className="px-6 text-right"><div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded-none ml-auto"></div></TableCell>
              </TableRow>
            ))
          ) : generations.length === 0 ? (
            <TableRow className="hover:bg-transparent border-none">
              <TableCell colSpan={3} className="text-center py-16">
                <div className="flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
                  <TerminalSquare className="w-12 h-12 mb-4 text-slate-300 dark:text-slate-700" />
                  <p className="font-mono text-sm font-bold uppercase tracking-widest text-slate-900 dark:text-white">NO_RECORDS_FOUND</p>
                  <p className="text-xs font-mono mt-2 uppercase">Initiate generation sequence to populate logs.</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            generations.map((gen) => (
              <TableRow key={gen.id} className="border-b-2 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                <TableCell className="px-6 py-4">
                  <Badge variant="secondary" className="uppercase font-mono text-[10px] font-bold bg-white text-slate-900 border-2 border-slate-900 rounded-none shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:bg-slate-800 dark:text-white dark:border-slate-600">
                    /{gen.content_type}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-[200px] sm:max-w-[300px]">
                  <div className="flex items-center space-x-3 text-slate-700 dark:text-slate-300 font-mono text-sm">
                    <span className="text-blue-600 font-bold">{">"}</span>
                    <span className="truncate font-medium">{gen.input_text}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right px-6 py-4">
                  <div className="inline-flex items-center font-mono text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                    <Clock className="w-3.5 h-3.5 mr-2 shrink-0" />
                    {new Date(gen.created_at).toLocaleDateString(undefined, { 
                      month: '2-digit', 
                      day: '2-digit', 
                      year: '2-digit' 
                    })}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
