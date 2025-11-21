import { Bell, Sun, Settings } from 'lucide-react'

export default function Header({ onToggleReminders, remindersEnabled }) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-yellow-500/10 text-yellow-400">
          <Sun size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Morning Routine</h1>
          <p className="text-sm text-blue-200/70">Win the morning, win the day</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onToggleReminders}
          className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
            remindersEnabled
              ? 'bg-emerald-500/10 border-emerald-400/30 text-emerald-300 hover:bg-emerald-500/20'
              : 'bg-slate-800/50 border-blue-500/20 text-blue-200/80 hover:bg-slate-800'
          }`}
        >
          <Bell size={18} />
          <span className="text-sm hidden sm:inline">Reminders {remindersEnabled ? 'On' : 'Off'}</span>
        </button>
        <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border bg-slate-800/50 border-blue-500/20 text-blue-200/80 hover:bg-slate-800">
          <Settings size={18} />
          <span className="text-sm hidden sm:inline">Settings</span>
        </button>
      </div>
    </div>
  )
}
