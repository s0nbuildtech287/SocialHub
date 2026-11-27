import React from 'react';

export default function Logo({ className = 'w-8 h-8', showText = false, textClassName = '' }) {
  return (
    <div className="flex items-center gap-2.5 shrink-0 select-none">
      <img
        src="/logo.svg"
        alt="SocialHub Logo"
        className={`${className} object-contain transition-transform duration-300 hover:scale-105 drop-shadow-md`}
      />
      {showText && (
        <div className={`flex flex-col text-left ${textClassName}`}>
          <span className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900 dark:text-white leading-none">
            Social<span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">Hub</span>
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold tracking-wider uppercase mt-0.5">
            Omnichannel
          </span>
        </div>
      )}
    </div>
  );
}
