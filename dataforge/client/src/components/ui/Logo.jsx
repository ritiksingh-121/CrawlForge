export default function Logo({ size = 'sm', showText = true }) {
  const iconSize = size === 'sm' ? 'w-8 h-8' : size === 'md' ? 'w-10 h-10' : 'w-12 h-12';
  const textSize = size === 'sm' ? 'text-sm' : size === 'md' ? 'text-lg' : 'text-xl';

  return (
    <div className="flex items-center gap-2.5">
      <div className={`${iconSize} rounded-lg bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center flex-shrink-0 relative overflow-hidden`}>
        <svg viewBox="0 0 32 32" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 4 L16 12 M16 20 L16 28 M4 16 L12 16 M20 16 L28 16" />
          <path d="M8 8 L12 12 M20 20 L24 24 M24 8 L20 12 M12 20 L8 24" />
          <circle cx="16" cy="16" r="3" fill="currentColor" stroke="none" />
        </svg>
        <div className="absolute inset-0 bg-white/10 rounded-lg" />
      </div>
      {showText && (
          <span className={`${textSize} font-semibold text-ink dark:text-dark-text tracking-tight`}>
            <span className="text-emerald-600 dark:text-emerald-400">crawl</span>Forge
          </span>
      )}
    </div>
  );
}
