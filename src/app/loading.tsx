export default function Loading() {
  return (
    <main className="min-h-screen mesh-bg pt-28 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="h-9 w-56 mx-auto bg-white/5 rounded-lg animate-pulse mb-4" />
        <div className="h-4 w-72 mx-auto bg-white/5 rounded animate-pulse mb-10" />
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="glass-card rounded-2xl overflow-hidden">
              <div className="h-36 bg-white/5 animate-pulse" />
              <div className="p-4 space-y-3">
                <div className="h-3 w-1/3 bg-white/5 rounded animate-pulse" />
                <div className="h-4 w-full bg-white/5 rounded animate-pulse" />
                <div className="h-4 w-2/3 bg-white/5 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
