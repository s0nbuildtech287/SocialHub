import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export default function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  iconBg = 'bg-amber-500/10 text-amber-500', 
  subtitle, 
  actionLabel, 
  onAction 
}) {
  const isZero = value === 0 || value === '0';

  return (
    <div className="app-card p-5 flex flex-col justify-between relative overflow-hidden group">
      <div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {title}
          </span>
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBg} shadow-xs`}>
            <Icon className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {value}
          </span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs">
        <span className="text-slate-500 dark:text-slate-400 truncate">
          {subtitle}
        </span>

        {isZero && actionLabel && onAction ? (
          <button
            onClick={onAction}
            className="inline-flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400 hover:text-amber-500 dark:hover:text-amber-300 transition shrink-0"
          >
            <span>{actionLabel}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
