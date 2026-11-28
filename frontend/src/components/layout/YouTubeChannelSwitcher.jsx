import React, { useState } from 'react';
import { 
  ChevronDown, 
  PlusCircle, 
  CheckCircle2, 
  Youtube
} from 'lucide-react';

export default function YouTubeChannelSwitcher({ 
  youtubeChannels = [], 
  activeYoutubeChannel, 
  onSwitchYoutubeChannel, 
  onConnectNew, 
  isCollapsed 
}) {
  const [open, setOpen] = useState(false);
  const isConnected = !!activeYoutubeChannel;
  const avatar = activeYoutubeChannel?.avatar;

  return (
    <div className="relative px-2 py-1.5">
      {isCollapsed ? (
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="w-10 h-10 mx-auto rounded-xl relative flex items-center justify-center border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 transition cursor-pointer"
          title={`Kênh YouTube: ${activeYoutubeChannel?.name || 'Chưa kết nối'}`}
        >
          {avatar ? (
            <img src={avatar} alt="Avatar" className="w-full h-full rounded-xl object-cover" />
          ) : (
            <Youtube className="w-4 h-4 text-red-500" />
          )}
          <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-950 ${
            isConnected ? 'bg-emerald-500' : 'bg-amber-500'
          }`} />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-100/80 dark:bg-slate-900/90 hover:bg-slate-200/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition text-left group cursor-pointer"
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="relative shrink-0">
              {avatar ? (
                <img
                  src={avatar}
                  alt="Avatar"
                  className="w-7 h-7 rounded-lg object-cover border border-red-500/40"
                />
              ) : (
                <div className="w-7 h-7 rounded-lg bg-red-600 flex items-center justify-center font-bold text-white text-[10px]">
                  <Youtube className="w-3.5 h-3.5" />
                </div>
              )}
              <span className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-white dark:border-slate-950 ${
                isConnected ? 'bg-emerald-500' : 'bg-amber-500'
              }`} />
            </div>

            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-red-500 transition">
                {activeYoutubeChannel?.name || 'Kết Nối Kênh YouTube'}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                {isConnected ? '✓ Đã kết nối OAuth 2.0' : 'Chưa kết nối'}
              </div>
            </div>
          </div>

          <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition shrink-0" />
        </button>
      )}

      {/* Dropdown Menu */}
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute left-2 right-2 top-full mt-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 shadow-2xl p-2 z-40 space-y-1 animate-fadeIn">
            <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-2 py-1">
              Chọn Kênh YouTube ({youtubeChannels.length})
            </div>
            
            <div className="max-h-52 overflow-y-auto space-y-1">
              {youtubeChannels.map((c) => {
                const isActive = (c.id === activeYoutubeChannel?.id || c.channelId === activeYoutubeChannel?.channelId);
                return (
                  <button
                    key={c.id || c.channelId}
                    onClick={() => {
                      onSwitchYoutubeChannel && onSwitchYoutubeChannel(c.id || c.channelId);
                      setOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-xl text-xs text-left transition cursor-pointer ${
                      isActive
                        ? 'bg-red-500/10 text-red-600 dark:text-red-400 font-bold border border-red-500/30'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {c.avatar ? (
                      <img src={c.avatar} alt={c.name} className="w-5 h-5 rounded-md object-cover shrink-0" />
                    ) : (
                      <div className="w-5 h-5 rounded-md bg-red-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                        <Youtube className="w-3 h-3" />
                      </div>
                    )}
                    <div className="truncate flex-1">
                      <div className="truncate">{c.name}</div>
                    </div>
                    {isActive && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    )}
                  </button>
                );
              })}

              {youtubeChannels.length === 0 && (
                <div className="p-3 text-center text-xs text-slate-400">
                  Chưa có kênh YouTube nào được kết nối
                </div>
              )}
            </div>

            <div className="pt-1.5 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => {
                  setOpen(false);
                  onConnectNew && onConnectNew();
                }}
                className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>+ Kết Nối Thêm Kênh Mới</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
