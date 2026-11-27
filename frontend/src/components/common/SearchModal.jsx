import React, { useEffect, useState } from 'react';
import { Search, Sparkles, PenSquare, CalendarClock, Layers, Settings, X, ArrowRight } from 'lucide-react';

export default function SearchModal({ isOpen, onClose, onNavigate }) {
  const [query, setQuery] = useState('');

  const quickActions = [
    { id: 'facebook-composer', label: 'Soạn thảo bài viết mới', icon: PenSquare, category: 'Facebook' },
    { id: 'ideas', label: 'Sáng tạo ý tưởng AI', icon: Sparkles, category: 'Nội dung' },
    { id: 'facebook-scheduler', label: 'Xem hàng đợi hẹn giờ', icon: CalendarClock, category: 'Facebook' },
    { id: 'settings', label: 'Quản lý Fanpage & Token', icon: Layers, category: 'Cài đặt' },
    { id: 'facebook-shopee', label: 'Cấu hình Shopee Affiliate', icon: Settings, category: 'Facebook' },
  ];

  const filtered = quickActions.filter((a) =>
    a.label.toLowerCase().includes(query.toLowerCase()) ||
    a.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // handled by parent toggling
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 flex items-center gap-3 border-b border-slate-800">
          <Search className="w-5 h-5 text-amber-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm kiếm tác vụ hoặc module (Ctrl+K)..."
            className="flex-1 bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results */}
        <div className="p-2 max-h-80 overflow-y-auto space-y-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              Không tìm thấy lệnh hoặc module phù hợp.
            </div>
          ) : (
            filtered.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-800 text-left transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 group-hover:bg-amber-500/10 text-amber-400 flex items-center justify-center border border-slate-700 group-hover:border-amber-500/30">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-200 group-hover:text-amber-400">
                        {item.label}
                      </div>
                      <div className="text-[11px] text-slate-500">{item.category}</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-amber-400 transition" />
                </button>
              );
            })
          )}
        </div>

        <div className="p-3 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <span>Dùng phím <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">Esc</kbd> để thoát</span>
          <span>SocialHub Command Palette</span>
        </div>
      </div>
    </div>
  );
}
