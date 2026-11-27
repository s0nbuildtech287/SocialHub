import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import SearchModal from '../common/SearchModal';
import { ToastProvider } from '../common/Toast';
import { ThemeProvider } from '../../context/ThemeContext';

export default function AppShell({ 
  currentRoute, 
  onNavigate, 
  status, 
  onSwitchChannel, 
  children 
}) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Auto-collapse on medium screens (768px - 1023px)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && window.innerWidth < 1024) {
        setIsCollapsed(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleToggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('sidebar_collapsed', next ? 'true' : 'false');
      return next;
    });
  };

  return (
    <ThemeProvider>
      <ToastProvider>
        <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-main)] flex flex-col relative selection:bg-amber-500/30 selection:text-amber-200">
          
          {/* Ambient subtle glow effects */}
          <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
            <div className="absolute -top-40 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-[140px]" />
            <div className="absolute top-1/2 -right-40 w-96 h-96 bg-blue-600/5 rounded-full blur-[150px]" />
          </div>

          {/* Sidebar */}
          <Sidebar
            currentRoute={currentRoute}
            onNavigate={onNavigate}
            status={status}
            onSwitchChannel={onSwitchChannel}
            isCollapsed={isCollapsed}
            onToggleCollapse={handleToggleCollapse}
            mobileOpen={mobileOpen}
            onCloseMobile={() => setMobileOpen(false)}
          />

          {/* Main Full-Width Content Container */}
          <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out relative z-10 ${
            isCollapsed ? 'md:pl-16' : 'md:pl-64'
          }`}>
            
            {/* Topbar */}
            <Topbar
              currentRoute={currentRoute}
              onNavigate={onNavigate}
              onOpenSearch={() => setSearchOpen(true)}
              onOpenMobile={() => setMobileOpen(true)}
              status={status}
            />

            {/* Page Canvas (Full-width with generous breathing room) */}
            <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
              {children}
            </main>

            {/* Minimal footer */}
            <footer className="border-t border-slate-800/60 py-4 px-6 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
              <span>SocialHub Platform · Vận hành đa kênh tự động hoá</span>
              <span>Phiên bản v2.0 (Design System 2026)</span>
            </footer>

          </div>

          {/* Quick Search Command Palette */}
          <SearchModal
            isOpen={searchOpen}
            onClose={() => setSearchOpen(false)}
            onNavigate={onNavigate}
          />

        </div>
      </ToastProvider>
    </ThemeProvider>
  );
}
