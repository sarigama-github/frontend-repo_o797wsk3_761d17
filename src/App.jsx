import { useEffect, useState } from 'react'
import Header from './components/Header'
import QuoteCard from './components/QuoteCard'
import RoutineEditor from './components/RoutineEditor'

function App() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
  // Stable anonymous client id stored in localStorage
  const [clientId] = useState(() => {
    const k = 'morning_client_id'
    let v = localStorage.getItem(k)
    if (!v) { v = Math.random().toString(36).slice(2,10); localStorage.setItem(k, v) }
    return v
  })

  const [remindersEnabled, setRemindersEnabled] = useState(
    localStorage.getItem('reminders_enabled') === 'true'
  )

  useEffect(() => {
    localStorage.setItem('reminders_enabled', String(remindersEnabled))
  }, [remindersEnabled])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(59,130,246,0.15),transparent_40%),radial-gradient(circle_at_80%_100%,rgba(16,185,129,0.12),transparent_40%)] pointer-events-none"/>
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <Header
          remindersEnabled={remindersEnabled}
          onToggleReminders={async () => {
            if (!remindersEnabled && 'Notification' in window) {
              try { await Notification.requestPermission() } catch {}
            }
            setRemindersEnabled(v => !v)
          }}
        />

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 space-y-6">
            <QuoteCard backendUrl={backendUrl} />
            <div className="rounded-2xl border border-blue-500/20 bg-slate-900/40 p-5">
              <h3 className="text-blue-100 font-medium mb-2">Welcome</h3>
              <p className="text-sm text-blue-200/80">Design your ideal morning. Keep it simple. Build consistency with small wins, gentle reminders, and a clear plan every day.</p>
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-blue-500/20 bg-slate-900/40 p-5">
              <h3 className="text-blue-100 font-medium mb-2">How it works</h3>
              <ul className="text-sm text-blue-200/80 space-y-2 list-disc pl-5">
                <li>Create tasks with time, duration, label, and reminders</li>
                <li>Reorder to match your flow</li>
                <li>Save to keep your plan synced</li>
              </ul>
            </div>
          </div>
        </div>

        <RoutineEditor backendUrl={backendUrl} clientId={clientId} remindersEnabled={remindersEnabled} />
      </div>
    </div>
  )
}

export default App
