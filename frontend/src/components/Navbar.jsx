import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Sparkles, 
  PenSquare, 
  CalendarClock, 
  Settings, 
  CheckCircle2, 
  ChevronDown,
  PlusCircle,
  Share2
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, status, onSwitchChannel }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const tabs = [
    { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'ideas', label: 'Ý tưởng AI', icon: Sparkles },
    { id: 'composer', label: 'Soạn bài & Đăng', icon: PenSquare },
    { id: 'scheduler', label: 'Hẹn giờ', icon: CalendarClock },
    { id: 'settings', label: 'Quản lý Kênh', icon: Settings },
  ];

  const activeChannel = status?.activeChannel;
  const channelData = status?.channelData;
  const channels = status?.channels || [];
  const isConnected = status?.isConnected;

  return (
    <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Channel Selector */}
          <div className="flex items-center gap-3">
            {/* Brand icon */}
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 flex items-center justify-center text-slate-950 font-black text-lg shadow-lg shadow-amber-500/10 shrink-0">
              <Share2 className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>

            {/* Channel dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 transition text-left"
              >
                {activeChannel?.avatar || channelData?.picture?.data?.url ? (
                  <img
                    src={activeChannel?.avatar || channelData?.picture?.data?.url}
                    alt="Channel"
                    className="w-7 h-7 rounded-full object-cover border border-amber-500/80"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center text-[10px] font-bold text-slate-950">
                    FB
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white tracking-tight">
                      {activeChannel?.name || 'Chọn Kênh'}
                    </span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400">
                    <span className="capitalize">{activeChannel?.platform || 'Facebook'}</span>
                    <span>·</span>
                    <span className={isConnected ? 'text-emerald-400' : 'text-rose-400'}>
                      {isConnected ? 'Hoạt động' : 'Chưa kết nối'}
                    </span>
                  </div>
                </div>
              </button>

              {/* Dropdown list */}
              {dropdownOpen && (
                <div className="absolute left-0 mt-2 w-64 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-2 z-50 space-y-1">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1">
                    Danh sách Kênh & Fanpage ({channels.length})
                  </div>
                  {channels.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        onSwitchChannel(c.id);
                        setDropdownOpen(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs text-left transition ${
                        c.id === activeChannel?.id
                          ? 'bg-amber-500/10 text-amber-300 font-bold border border-amber-500/30'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-amber-400 border border-slate-700 shrink-0">
                        {c.platform === 'facebook' ? 'f' : c.platform === 'youtube' ? 'yt' : 'tt'}
                      </div>
                      <div className="truncate flex-1">
                        <div className="truncate">{c.name}</div>
                        <div className="text-[10px] text-slate-500 capitalize">{c.platform}</div>
                      </div>
                      {c.id === activeChannel?.id && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      )}
                    </button>
                  ))}
                  <div className="pt-1 border-t border-slate-800">
                    <button
                      onClick={() => {
                        setActiveTab('settings');
                        setDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-amber-400 hover:bg-slate-800 transition"
                    >
                      <PlusCircle className="w-3.5 h-3.5" /> Thêm Kênh / Fanpage mới
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 sm:gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20 scale-[1.02]'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                  <span className="hidden md:inline">{tab.label}</span>
                </button>
              );
            })}
          </nav>

        </div>
      </div>
    </header>
  );
}
