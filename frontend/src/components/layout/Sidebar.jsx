import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Sparkles, 
  PenSquare, 
  CalendarClock, 
  ShoppingBag, 
  Layers, 
  Settings, 
  ChevronDown, 
  ChevronRight, 
  PanelLeftClose, 
  PanelLeft, 
  Facebook, 
  Youtube, 
  Music2, 
  Radio, 
  Video, 
  Share2, 
  Images,
  ExternalLink,
  Info,
  Newspaper,
  BarChart3
} from 'lucide-react';
import { PLATFORM_REGISTRY } from '../../config/platformRegistry';
import ChannelSwitcher from './ChannelSwitcher';
import YouTubeChannelSwitcher from './YouTubeChannelSwitcher';
import Logo from '../common/Logo';

const ICON_MAP = {
  LayoutDashboard,
  Sparkles,
  PenSquare,
  CalendarClock,
  ShoppingBag,
  Layers,
  Settings,
  Info,
  Facebook,
  Youtube,
  Music2,
  Radio,
  Video,
  Share2,
  Images,
  Newspaper,
  BarChart3
};

export default function Sidebar({ 
  currentRoute, 
  onNavigate, 
  status, 
  onSwitchChannel,
  onSwitchYoutubeChannel,
  onConnectNewYoutube,
  isCollapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile
}) {
  const [platformOpen, setPlatformOpen] = useState({
    facebook: true,
    youtube: true,
    tiktok: false
  });

  const togglePlatform = (id) => {
    setPlatformOpen((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderIcon = (name, className) => {
    const Component = ICON_MAP[name] || Sparkles;
    return <Component className={className} />;
  };

  const handleItemClick = (id) => {
    onNavigate(id);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-fadeIn"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col border-r transition-all duration-300 ease-in-out bg-white/95 dark:bg-[#090d16]/95 border-slate-200 dark:border-slate-800/80 backdrop-blur-2xl ${
          mobileOpen ? 'translate-x-0 w-72' : '-translate-x-full md:translate-x-0'
        } ${isCollapsed ? 'md:w-16' : 'md:w-64'}`}
      >
        {/* App Brand Header (Clean & Platform-Agnostic) */}
        <div className="h-16 flex items-center justify-between px-3.5 border-b border-slate-200 dark:border-slate-800/80">
          {!isCollapsed ? (
            <Logo className="w-8 h-8" showText={true} />
          ) : (
            <div className="mx-auto">
              <Logo className="w-8 h-8" showText={false} />
            </div>
          )}

          {/* Desktop collapse toggle icon button */}
          <button
            onClick={onToggleCollapse}
            className="hidden md:flex p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition"
            title={isCollapsed ? 'Mở rộng sidebar' : 'Thu nhỏ sidebar'}
          >
            {isCollapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-2.5 py-4 space-y-5">
          
          {/* GROUP 1: CHUNG */}
          <div className="space-y-1">
            {!isCollapsed && (
              <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Chung
              </div>
            )}
            {PLATFORM_REGISTRY.common.map((item) => {
              const isActive = currentRoute === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold transition group ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  {renderIcon(item.icon, `w-4 h-4 shrink-0 ${isActive ? 'text-slate-950' : 'text-slate-500 group-hover:text-amber-500'}`)}
                  {!isCollapsed && (
                    <div className="flex-1 flex items-center justify-between text-left">
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* GROUP 2: CÁC NỀN TẢNG (PLATFORMS) */}
          <div className="space-y-3">
            {!isCollapsed && (
              <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Nền tảng mạng xã hội
              </div>
            )}

            {PLATFORM_REGISTRY.platforms.map((plat) => {
              const isOpen = platformOpen[plat.id];
              return (
                <div key={plat.id} className="space-y-1">
                  {/* Platform Header */}
                  {!isCollapsed ? (
                    <button
                      onClick={() => togglePlatform(plat.id)}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition group rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        {renderIcon(plat.icon, `w-3.5 h-3.5 ${
                          plat.accentColor === 'blue' ? 'text-blue-500' :
                          plat.accentColor === 'red' ? 'text-red-500' : 'text-pink-500'
                        }`)}
                        <span>{plat.name}</span>
                        {plat.status === 'soon' && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                            Sắp có
                          </span>
                        )}
                      </div>
                      {isOpen ? (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </button>
                  ) : (
                    <div className="w-full py-1 flex justify-center border-t border-slate-200 dark:border-slate-800/60" title={plat.name}>
                      {renderIcon(plat.icon, `w-4 h-4 ${
                        plat.accentColor === 'blue' ? 'text-blue-500' :
                        plat.accentColor === 'red' ? 'text-red-500' : 'text-pink-500'
                      }`)}
                    </div>
                  )}

                  {/* Platform Sub-modules & Dedicated Page Switcher for Facebook */}
                  {(isOpen || isCollapsed) && (
                    <div className={`space-y-1 ${!isCollapsed ? 'pl-2 border-l border-slate-200 dark:border-slate-800/80 ml-3' : ''}`}>
                      
                      {/* Đặt Channel Switcher riêng cho Facebook ngay trong mục Facebook */}
                      {plat.id === 'facebook' && (
                        <ChannelSwitcher
                          status={status}
                          onSwitchChannel={onSwitchChannel}
                          onNavigateSettings={() => handleItemClick('settings')}
                          isCollapsed={isCollapsed}
                        />
                      )}

                      {/* Đặt Channel Switcher riêng cho YouTube ngay trong mục YouTube */}
                      {plat.id === 'youtube' && (
                        <YouTubeChannelSwitcher
                          youtubeChannels={status?.youtubeChannels || []}
                          activeYoutubeChannel={status?.activeYoutubeChannel}
                          onSwitchYoutubeChannel={onSwitchYoutubeChannel}
                          onConnectNew={onConnectNewYoutube}
                          isCollapsed={isCollapsed}
                        />
                      )}

                      {plat.modules.map((mod) => {
                        const isActive = currentRoute === mod.id;
                        return (
                          <button
                            key={mod.id}
                            onClick={() => handleItemClick(mod.id)}
                            title={isCollapsed ? `${plat.name} - ${mod.label}` : undefined}
                            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium transition group ${
                              isActive
                                ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold border border-amber-500/40'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/40'
                            }`}
                          >
                            {renderIcon(mod.icon, `w-3.5 h-3.5 shrink-0 ${isActive ? 'text-amber-500' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`)}
                            {!isCollapsed && (
                              <div className="flex-1 flex items-center justify-between text-left">
                                <span className="truncate">{mod.label}</span>
                                {mod.badge && (
                                  <span className="text-[9px] font-semibold px-1 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700/80 ml-1">
                                    {mod.badge}
                                  </span>
                                )}
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* GROUP 3: HỆ THỐNG */}
          <div className="space-y-1 pt-2 border-t border-slate-200 dark:border-slate-800/80">
            {!isCollapsed && (
              <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Hệ thống
              </div>
            )}
            {PLATFORM_REGISTRY.system.map((item) => {
              const isActive = currentRoute === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold transition group ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  {renderIcon(item.icon, `w-4 h-4 shrink-0 ${isActive ? 'text-slate-950' : 'text-slate-500 group-hover:text-amber-500'}`)}
                  {!isCollapsed && (
                    <div className="flex-1 flex items-center justify-between text-left">
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

        </div>

        {/* Footer info */}
        {!isCollapsed && (
          <div className="p-3 border-t border-slate-200 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>SocialHub Platform</span>
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Hệ thống sẵn sàng
            </span>
          </div>
        )}
      </aside>
    </>
  );
}
