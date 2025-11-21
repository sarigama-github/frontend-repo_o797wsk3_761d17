import { Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function QuoteCard({ backendUrl }) {
  const [quote, setQuote] = useState('Loading inspiration...')

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${backendUrl}/api/quote`)
        const data = await res.json()
        setQuote(data.quote)
      } catch (e) {
        setQuote('Start where you are. Use what you have. Do what you can.')
      }
    }
    load()
  }, [backendUrl])

  return (
    <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-slate-800/60 to-slate-900/60 p-5 text-blue-100">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-300">
          <Sparkles size={18} />
        </div>
        <div>
          <p className="italic leading-relaxed">“{quote}”</p>
          <p className="text-xs text-blue-300/60 mt-2">New quote every day</p>
        </div>
      </div>
    </div>
  )
}
