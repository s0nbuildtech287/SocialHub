import React, { useState } from 'react';
import { 
  Menu, 
  Search, 
  Plus, 
  Sun, 
  Moon, 
  ChevronRight,
  ChevronDown,
  Facebook,
  Youtube,
  Music2,
  Sparkles
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { findModuleById } from '../../config/platformRegistry';

export default function Topbar({ 
  currentRoute, 
  onNavigate, 
  onOpenSearch, 
  onOpenMobile 
}) {
  const { theme, toggleTheme } = useTheme();
  const moduleInfo = findModuleById(currentRoute);
  const [createMenuOpen, setCreateMenuOpen] = useState(false);

  return (
    <header className="h-16 sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-[#070a11]/80 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between gap-4 transition-colors">
      
      {/* Left: Mobile hamburger & Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Dynamic Breadcrumbs */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <span className="font-semibold text-slate-500 dark:text-slate-400">SocialHub</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600" />
          {moduleInfo?.section && (
            <>
              <span className="font-medium text-slate-500 dark:text-slate-400">{moduleInfo.section}</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600" />
            </>
          )}
          <span className="font-bold text-slate-900 dark:text-slate-100">{moduleInfo?.label || 'Tổng quan'}</span>
        </nav>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        
        {/* Search trigger (Ctrl+K) */}
        <button
          onClick={onOpenSearch}
          className="hidden sm:flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700 transition"
        >
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span>Tìm nhanh...</span>
          <kbd className="px-1.5 py-0.5 rounded text-[10px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 shadow-xs">
            Ctrl+K
          </kbd>
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 hover:border-slate-300 dark:hover:border-slate-700 transition shadow-xs"
          title={theme === 'dark' ? 'Chuyển sang Giao diện Sáng' : 'Chuyển sang Giao diện Tối'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* Multi-Platform Create Action Dropdown */}
        <div className="relative">
          <button
            onClick={() => setCreateMenuOpen(!createMenuOpen)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition scale-100 hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span className="hidden sm:inline">Tạo nội dung</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          {createMenuOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setCreateMenuOpen(false)} />
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl p-2 z-40 space-y-1 animate-fadeIn">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-2 py-1">
                  Chọn nền tảng xuất bản
                </div>

                <button
                  onClick={() => {
                    onNavigate('facebook-composer');
                    setCreateMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition"
                >
                  <div className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold">
                    f
                  </div>
                  <div className="flex-1">
                    <div>Bài đăng Facebook</div>
                    <div className="text-[10px] text-slate-400">Post ảnh, Shopee cmt</div>
                  </div>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
                    Bật
                  </span>
                </button>

                <button
                  onClick={() => {
                    onNavigate('youtube-shorts');
                    setCreateMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition"
                >
                  <div className="w-6 h-6 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center">
                    <Youtube className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1">
                    <div>YouTube Shorts</div>
                    <div className="text-[10px] text-slate-400">Video ngắn tự động</div>
                  </div>
                  <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                    Sắp có
                  </span>
                </button>

                <button
                  onClick={() => {
                    onNavigate('tiktok-auto');
                    setCreateMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition"
                >
                  <div className="w-6 h-6 rounded-lg bg-pink-500/10 text-pink-500 flex items-center justify-center">
                    <Music2 className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1">
                    <div>TikTok Video</div>
                    <div className="text-[10px] text-slate-400">Clip trending TikTok</div>
                  </div>
                  <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                    Sắp có
                  </span>
                </button>

                <div className="pt-1 border-t border-slate-200 dark:border-slate-800">
                  <button
                    onClick={() => {
                      onNavigate('ideas');
                      setCreateMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-amber-600 dark:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition"
                  >
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Lên ý tưởng AI trước</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

      </div>
    </header>
  );
}
