'use client'

import { useState } from 'react'
import { Play, Lock, Check, Circle } from 'lucide-react'

type Video = { id: string; title: string; duration_seconds: number; is_preview: boolean }

export default function CourseLessons({
  courseId,
  videos,
  hasAccess,
  enrolled,
  initialCompleted,
  initialProgress,
}: {
  courseId: string
  videos: Video[]
  hasAccess: boolean
  enrolled: boolean
  initialCompleted: string[]
  initialProgress: number
}) {
  const [completed, setCompleted] = useState<Set<string>>(new Set(initialCompleted))
  const [progress, setProgress] = useState(initialProgress)
  const [busy, setBusy] = useState<string | null>(null)

  const toggle = async (videoId: string) => {
    if (!enrolled || busy) return
    const isDone = completed.has(videoId)
    setBusy(videoId)
    try {
      const res = await fetch('/api/courses/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, videoId, completed: !isDone }),
      })
      const data = await res.json()
      if (res.ok) {
        const next = new Set(completed)
        isDone ? next.delete(videoId) : next.add(videoId)
        setCompleted(next)
        setProgress(data.progress ?? progress)
      }
    } finally {
      setBusy(null)
    }
  }

  return (
    <div>
      {enrolled && (
        <div className="mb-5">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-300">تقدّمك في الكورس</span>
            <span className="font-bold text-primary-400">{progress}%</span>
          </div>
          <div className="h-2.5 bg-dark-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-l from-primary-500 to-gold-400 transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          {progress >= 100 && <p className="text-green-400 text-xs mt-2">🎉 أكملت الكورس! تم إصدار شهادتك.</p>}
        </div>
      )}

      <div className="space-y-2">
        {videos.map((video, idx) => {
          const accessible = hasAccess || video.is_preview
          const done = completed.has(video.id)
          return (
            <div key={video.id} className={`glass-card rounded-xl p-4 flex items-center gap-4 ${accessible ? 'hover:bg-white/5' : 'opacity-60'}`}>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${accessible ? 'bg-primary-500' : 'bg-dark-600 border border-white/10'}`}>
                {accessible ? <Play size={15} /> : <Lock size={14} />}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">{idx + 1}. {video.title}</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {video.is_preview && <span className="text-green-400 ml-2">معاينة مجانية</span>}
                  {Math.floor(video.duration_seconds / 60)} دقيقة
                </div>
              </div>
              {enrolled && accessible && (
                <button
                  onClick={() => toggle(video.id)}
                  disabled={busy === video.id}
                  className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${done ? 'bg-green-500/15 border-green-500/30 text-green-400' : 'border-white/10 text-gray-400 hover:text-white'}`}
                  title={done ? 'تم الإكمال' : 'وضع كمكتمل'}
                >
                  {done ? <Check size={13} /> : <Circle size={13} />}
                  {done ? 'مكتمل' : 'إكمال'}
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
