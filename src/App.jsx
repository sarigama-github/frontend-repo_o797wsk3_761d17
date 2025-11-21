import { useMemo, useState } from 'react'
import Header from './components/Header'
import QuoteCard from './components/QuoteCard'
import RoutineEditor from './components/RoutineEditor'

function App() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
  // Create a simple stable anonymous client id stored in localStorage
  const [clientId] = useState(() => {
    const k = 'morning_client_id'
    let v = localStorage.getItem(k)
    if (!v) { v = Math.random().toString(36).slice(2,10); localStorage.setItem(k, v) }
    return v
  })

  const [remindersEnabled, setRemindersEnabled] = useState(true)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(59,130,246,0.15),transparent_40%),radial-gradient(circle_at_80%_100%,rgba(16,185,129,0.12),transparent_40%)] pointer-events-none"/>
      <div className="relative max-w-5xl mx-auto px-4 py-10">
        <Header
          remindersEnabled={remindersEnabled}
          onToggleReminders={() => setRemindersEnabled(v => !v)}
        />

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-2">
            <QuoteCard backendUrl={backendUrl} />
          </div>
          <div className="md:col-span-1">
            <div className="rounded-2xl border border-blue-500/20 bg-slate-900/40 p-5">
              <h3 className="text-blue-100 font-medium mb-2">How it works</h3>
              <ul className="text-sm text-blue-200/80 space-y-2 list-disc pl-5">
                <li>Create and customize your morning routine</li>
                <li>Save it so it stays the same every day</li>
                <li>Check off tasks as you go</li>
              </ul>
            </div>
          </div>
        </div>

        <RoutineEditor backendUrl={backendUrl} clientId={clientId} />
      </div>
    </div>
  )
}

export default App
