'use client';

export default function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-6xl'
  };

  return (
    <div className={`font-semibold ${sizes[size]} select-none tracking-tight`}>
      <span className="text-gray-900 dark:text-white">emla</span>
      <span className="relative inline-block text-blue-600 dark:text-blue-400">
        <span className="relative">
          q
          {/* Q'nun kuyruğuna hafif büyüteç vurgusu */}
          <svg 
            className="absolute -bottom-0.5 -right-0.5 opacity-60" 
            width="0.35em" 
            height="0.35em" 
            viewBox="0 0 20 20"
          >
            <circle cx="10" cy="10" r="2" fill="currentColor"/>
            <line x1="12" y1="12" x2="16" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </span>
      </span>
    </div>
  );
}