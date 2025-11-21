import { useEffect, useMemo, useRef, useState } from 'react'
import { Plus, Trash2, Clock, CheckCircle2, GripVertical, Tag } from 'lucide-react'

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

export default function RoutineEditor({ backendUrl, clientId, remindersEnabled }) {
  const [routines, setRoutines] = useState([])
  const [title, setTitle] = useState('My Morning Routine')
  const [wakeTime, setWakeTime] = useState('06:30')
  const [days, setDays] = useState(['Mon','Tue','Wed','Thu','Fri','Sat','Sun'])
  const [tasks, setTasks] = useState([
    { id: uid(), name: 'Drink water', time: '06:35', duration_minutes: 2, label: 'Health', reminder: false, completed: false },
    { id: uid(), name: 'Stretch', time: '06:40', duration_minutes: 5, label: 'Body', reminder: false, completed: false },
  ])
  const [loading, setLoading] = useState(false)

  const loadRoutines = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/routines?client_id=${clientId}`)
      const data = await res.json()
      setRoutines(data)
      if (data[0]) {
        const r = data[0]
        setTitle(r.title)
        setWakeTime(r.wake_time || '')
        setDays(r.days || days)
        setTasks(r.tasks || [])
      }
    } catch (e) {
      // ignore
    }
  }

  useEffect(() => { loadRoutines() }, [])

  const addTask = () => setTasks(prev => [...prev, { id: uid(), name: '', time: '', duration_minutes: 5, label: '', reminder: false, completed: false }])
  const removeTask = (id) => setTasks(prev => prev.filter(t => t.id !== id))
  const updateTask = (id, patch) => setTasks(prev => prev.map(t => t.id === id ? { ...t, ...patch } : t))

  // Simple drag reorder via pointer events
  const dragId = useRef(null)
  const onDragStart = (id) => { dragId.current = id }
  const onDragEnter = (overId) => {
    const from = tasks.findIndex(t => t.id === dragId.current)
    const to = tasks.findIndex(t => t.id === overId)
    if (from === -1 || to === -1 || from === to) return
    const next = [...tasks]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    setTasks(next)
    dragId.current = overId
  }

  const saveRoutine = async () => {
    setLoading(true)
    try {
      const payload = { title, wake_time: wakeTime, reminders_enabled: remindersEnabled, days, tasks, client_id: clientId }
      if (routines[0]) {
        const rid = routines[0]._id
        await fetch(`${backendUrl}/api/routines/${rid}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
        })
      } else {
        await fetch(`${backendUrl}/api/routines`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
        })
      }
      await loadRoutines()
    } finally { setLoading(false) }
  }

  const toggleComplete = (id) => updateTask(id, { completed: !tasks.find(t => t.id === id)?.completed })

  // Local scheduled notifications (best-effort demo)
  useEffect(() => {
    if (!remindersEnabled || !('Notification' in window)) return
    if (Notification.permission !== 'granted') return
    // Schedule within the next hour only (demo constraint)
    const timeouts = []
    const now = new Date()
    tasks.forEach(t => {
      if (!t.reminder || !t.time) return
      const [hh, mm] = t.time.split(':').map(Number)
      const when = new Date()
      when.setHours(hh, mm, 0, 0)
      const ms = when.getTime() - now.getTime()
      if (ms > 0 && ms < 60 * 60 * 1000) {
        const handle = setTimeout(() => {
          try { new Notification('Routine reminder', { body: t.name || 'Task time' }) } catch {}
        }, ms)
        timeouts.push(handle)
      }
    })
    return () => timeouts.forEach(clearTimeout)
  }, [remindersEnabled, tasks])

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl border border-blue-500/20 bg-slate-900/40 p-4">
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="text-sm text-blue-200/70">Routine Title</label>
                <input value={title} onChange={e=>setTitle(e.target.value)} className="mt-1 w-full rounded-lg bg-slate-800/60 border border-blue-500/20 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"/>
              </div>
              <div>
                <label className="text-sm text-blue-200/70">Wake Time</label>
                <input type="time" value={wakeTime} onChange={e=>setWakeTime(e.target.value)} className="mt-1 w-full rounded-lg bg-slate-800/60 border border-blue-500/20 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"/>
              </div>
            </div>

            <div className="mt-4">
              <label className="text-sm text-blue-200/70">Days</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d => (
                  <button key={d} onClick={()=> setDays(prev => prev.includes(d) ? prev.filter(x=>x!==d) : [...prev, d])}
                    className={`px-3 py-1.5 rounded-lg border text-sm transition ${days.includes(d) ? 'bg-blue-500/20 border-blue-400/40 text-blue-200' : 'bg-slate-800/60 border-blue-500/20 text-blue-200/70 hover:bg-slate-800'}`}>{d}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-blue-500/20 bg-slate-900/40 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-blue-100 font-medium">Tasks</h3>
              <button onClick={addTask} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border bg-blue-500/10 border-blue-400/30 text-blue-200 hover:bg-blue-500/20">
                <Plus size={16}/> Add Task
              </button>
            </div>
            <div className="space-y-3">
              {tasks.map(t => (
                <div key={t.id} className="grid sm:grid-cols-12 gap-3 items-center group">
                  <div className="sm:col-span-1 flex items-center">
                    <button draggable onDragStart={() => onDragStart(t.id)} onDragEnter={() => onDragEnter(t.id)} className="p-2 rounded-lg border bg-slate-800/60 border-blue-500/20 text-blue-300/70 cursor-grab active:cursor-grabbing">
                      <GripVertical size={16} />
                    </button>
                  </div>
                  <button onClick={()=>toggleComplete(t.id)} className={`sm:col-span-1 p-2 rounded-lg border ${t.completed ? 'text-emerald-300 bg-emerald-500/10 border-emerald-400/30' : 'text-blue-200/80 bg-slate-800/60 border-blue-500/20'}`}>
                    <CheckCircle2 size={18}/>
                  </button>
                  <input value={t.name} onChange={e=>updateTask(t.id,{name:e.target.value})} placeholder="Task name" className="sm:col-span-4 rounded-lg bg-slate-800/60 border border-blue-500/20 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"/>
                  <div className="sm:col-span-2 flex items-center gap-2">
                    <Clock size={16} className="text-blue-300/70"/>
                    <input type="time" value={t.time || ''} onChange={e=>updateTask(t.id,{time:e.target.value})} className="flex-1 rounded-lg bg-slate-800/60 border border-blue-500/20 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"/>
                  </div>
                  <div className="sm:col-span-2 flex items-center gap-2">
                    <input type="number" min={1} max={600} value={t.duration_minutes || ''} onChange={e=>updateTask(t.id,{duration_minutes:Number(e.target.value)})} placeholder="min" className="w-full rounded-lg bg-slate-800/60 border border-blue-500/20 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"/>
                  </div>
                  <div className="sm:col-span-2 flex items-center gap-2">
                    <Tag size={16} className="text-blue-300/70"/>
                    <input value={t.label || ''} onChange={e=>updateTask(t.id,{label:e.target.value})} placeholder="Label" className="w-full rounded-lg bg-slate-800/60 border border-blue-500/20 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"/>
                  </div>
                  <div className="sm:col-span-12 flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm text-blue-200/80">
                      <input type="checkbox" checked={t.reminder || false} onChange={e=>updateTask(t.id,{reminder:e.target.checked})} className="accent-emerald-400"/>
                      Reminder for this task
                    </label>
                    <button onClick={()=>removeTask(t.id)} className="p-2 rounded-lg border bg-red-500/10 border-red-400/30 text-red-300 hover:bg-red-500/20">
                      <Trash2 size={16}/>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-blue-500/20 bg-slate-900/40 p-4">
            <h3 className="text-blue-100 font-medium mb-2">Today</h3>
            <div className="space-y-2">
              {tasks.length === 0 && <p className="text-blue-200/60 text-sm">No tasks yet. Add some to get started.</p>}
              {tasks.map(t => (
                <div key={t.id} className={`flex items-center justify-between p-2 rounded-lg border transition-colors ${t.completed ? 'bg-emerald-500/10 border-emerald-400/30' : 'bg-slate-800/60 border-blue-500/20'}`}>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={18} className={t.completed ? 'text-emerald-300' : 'text-blue-300/80'} />
                    <span className={`text-sm ${t.completed ? 'line-through text-emerald-200/80' : 'text-blue-100'}`}>{t.name || 'Untitled task'}</span>
                  </div>
                  <span className="text-xs text-blue-300/60">{t.time || '--:--'}</span>
                </div>
              ))}
            </div>
          </div>

          <button onClick={saveRoutine} disabled={loading} className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border bg-emerald-500/10 border-emerald-400/30 text-emerald-200 hover:bg-emerald-500/20 disabled:opacity-60">
            {loading ? 'Saving...' : 'Save Routine'}
          </button>
        </div>
      </div>
    </div>
  )
}
