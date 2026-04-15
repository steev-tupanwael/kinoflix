'use client'

export function VersionBadge() {
  const commitId = process.env.NEXT_PUBLIC_GIT_COMMIT_SHA || 'unknown';
  const isDev = process.env.NODE_ENV === 'development';

  return (
    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 shadow-sm w-fit">
      {/* Indikator Mode */}
      <span className="relative flex h-2 w-2">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isDev ? 'bg-yellow-400' : 'bg-green-400'}`}></span>
        <span className={`relative inline-flex rounded-full h-2 w-2 ${isDev ? 'bg-yellow-500' : 'bg-green-500'}`}></span>
      </span>

      {/* Teks Versi */}
      <span className="text-[10px] font-mono uppercase text-slate-600 tracking-tighter">
        BUILD: <span className="font-bold text-slate-900">{commitId}</span>
      </span>

      {isDev && (
        <span className="text-[9px] bg-yellow-200 text-yellow-800 px-1.5 rounded font-bold uppercase">
          Dev
        </span>
      )}
    </div>
  );
}
