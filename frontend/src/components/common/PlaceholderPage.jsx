import React, { useState } from 'react';
import { 
  Bell, 
  Check, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  Layers, 
  Youtube, 
  Radio, 
  Share2, 
  Images,
  Video,
  Settings
} from 'lucide-react';
import { useToast } from './Toast';

export default function PlaceholderPage({ module }) {
  const { addToast } = useToast();
  const [subscribed, setSubscribed] = useState(() => {
    return localStorage.getItem(`notify_${module?.id}`) === 'true';
  });

  const handleNotifyMe = () => {
    const nextState = !subscribed;
    setSubscribed(nextState);
    localStorage.setItem(`notify_${module?.id}`, nextState ? 'true' : 'false');

    if (nextState) {
      addToast({
        message: `🔔 Đã bật thông báo cho module "${module?.label}". Bạn sẽ được ưu tiên trải nghiệm khi tính năng ra mắt!`,
        type: 'info'
      });
    } else {
      addToast({
        message: `Đã hủy nhận thông báo cho "${module?.label}".`,
        type: 'info'
      });
    }
  };

  const getPlatformIcon = (iconName) => {
    switch (iconName) {
      case 'Radio': return Radio;
      case 'Youtube': return Youtube;
      case 'Video': return Video;
      case 'Share2': return Share2;
      case 'Images': return Images;
      case 'Settings': return Settings;
      default: return Sparkles;
    }
  };

  const Icon = getPlatformIcon(module?.icon);

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 animate-fadeIn space-y-8">
      
      {/* Header Banner */}
      <div className="rounded-3xl app-card p-8 sm:p-12 text-center relative overflow-hidden space-y-6">
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center space-y-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-amber-500/20 via-orange-500/10 to-transparent border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-2xl">
            <Icon className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5" /> Tính năng đang phát triển (Lộ trình 2026)
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white dark:text-white">
            {module?.label}
          </h2>

          <p className="max-w-xl text-sm sm:text-base text-slate-400 leading-relaxed">
            {module?.description || 'Tính năng này đang trong lộ trình phát triển để hoàn thiện hệ sinh thái phân phối nội dung đa kênh.'}
          </p>

          <div className="pt-2">
            <button
              onClick={handleNotifyMe}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs sm:text-sm font-bold transition shadow-xl ${
                subscribed
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-amber-500/20 scale-100 hover:scale-[1.02]'
              }`}
            >
              {subscribed ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  Đã đăng ký nhận thông báo
                </>
              ) : (
                <>
                  <Bell className="w-4 h-4" />
                  Báo tôi khi tính năng ra mắt
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Planned Feature Checklist */}
      {module?.features && module.features.length > 0 && (
        <div className="app-card p-6 sm:p-8 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            Các tính năng dự kiến sẽ có mặt:
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {module.features.map((feat, idx) => (
              <div 
                key={idx}
                className="p-4 rounded-2xl app-card-raised flex items-start gap-3"
              >
                <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">
                  {feat}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
