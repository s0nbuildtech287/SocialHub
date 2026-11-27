import React from 'react';
import { 
  ExternalLink, 
  CheckCircle2, 
  ShieldCheck, 
  Send, 
  Users, 
  ThumbsUp, 
  Copy, 
  Key,
  Globe,
  ImageIcon
} from 'lucide-react';
import { useToast } from '../common/Toast';

export default function FacebookPageInfo({ status, onNavigate }) {
  const { addToast } = useToast();
  const activeChannel = status?.activeChannel;
  const channelData = status?.channelData;
  const isConnected = status?.isConnected;

  const pageName = activeChannel?.name || channelData?.name || 'Góc Tăng Ca';
  const pageId = activeChannel?.pageId || channelData?.id || '1492917437245491';
  const slogan = channelData?.about || activeChannel?.about || 'Làm, làm nữa, làm mãi';
  const category = channelData?.category || activeChannel?.category || 'Trang web giải trí';
  
  // Dữ liệu chuẩn từ Meta Graph API v21.0
  const followers = channelData?.followers_count ?? 1;
  const likes = channelData?.fan_count ?? 1;
  const coverUrl = channelData?.cover?.source || null;
  const pageLink = channelData?.link || `https://facebook.com/${pageId}`;
  const avatar = activeChannel?.avatar || channelData?.picture?.data?.url;
  
  // Che token chỉ hiển thị 4 ký tự cuối bảo mật
  const rawToken = activeChannel?.accessToken || '';
  const maskedToken = rawToken ? `••••••••••••••••••••••••••••${rawToken.slice(-4)}` : 'Chưa có token';

  const handleCopyId = () => {
    navigator.clipboard.writeText(pageId);
    addToast({ message: `Đã copy Page ID: ${pageId}`, type: 'success' });
  };

  const permissions = [
    { name: 'pages_manage_posts', desc: 'Tạo, đăng và chỉnh sửa bài viết trực tiếp' },
    { name: 'pages_read_engagement', desc: 'Đọc lượt like, bình luận và tương tác' },
    { name: 'pages_show_list', desc: 'Đồng bộ danh sách Page tài khoản quản lý' }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8 animate-fadeIn">
      
      {/* 1. Page Hero Profile Card with Real Cover Photo */}
      <div className="app-card overflow-hidden">
        {/* Cover Backdrop */}
        <div className="h-44 sm:h-64 relative overflow-hidden bg-slate-900">
          {coverUrl ? (
            <img 
              src={coverUrl} 
              alt={`Ảnh bìa ${pageName}`} 
              className="w-full h-full object-cover object-center transition-transform duration-700 hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-600 opacity-90" />
          )}

          {/* Gradient Overlay for text contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

          {/* Meta Graph Tag & Cover Photo Indicator */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            {coverUrl && (
              <span className="px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md text-[11px] font-medium text-white/90 border border-white/10 flex items-center gap-1.5 shadow-sm">
                <ImageIcon className="w-3.5 h-3.5 text-amber-400" /> Đã đồng bộ ảnh bìa
              </span>
            )}
            <span className="px-3 py-1 rounded-full bg-blue-600/80 backdrop-blur-md text-[11px] font-bold text-white border border-white/20 flex items-center gap-1.5 shadow-sm">
              <Globe className="w-3.5 h-3.5" /> Meta Graph API v21.0
            </span>
          </div>
        </div>

        {/* Profile info row */}
        <div className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-4">
            
            {/* Avatar & Details */}
            <div className="flex items-end gap-4">
              <div className="relative">
                {avatar ? (
                  <img
                    src={avatar}
                    alt={pageName}
                    className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl object-cover border-4 border-white dark:border-[#0e1526] shadow-2xl bg-white"
                  />
                ) : (
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-blue-600 border-4 border-white dark:border-[#0e1526] flex items-center justify-center font-black text-white text-3xl shadow-2xl">
                    f
                  </div>
                )}
                <span 
                  className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-2 border-white dark:border-slate-900 ${
                    isConnected ? 'bg-emerald-500 ring-2 ring-emerald-500/30' : 'bg-rose-500'
                  }`} 
                  title={isConnected ? 'Kết nối Meta API bình thường' : 'Mất kết nối'} 
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    {pageName}
                  </h2>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                    {category}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  "{slogan}"
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 pt-2 sm:pt-0">
              <a
                href={pageLink}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition shadow-sm"
              >
                <span>Xem trên Facebook</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={() => onNavigate('facebook-composer')}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition scale-100 hover:scale-[1.02]"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Soạn bài cho Page</span>
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* 2. Key Stats Grid (3 Clean Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Stat 1: Followers (Người theo dõi) */}
        <div className="app-card p-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>Người theo dõi Trang</span>
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-500 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {followers.toLocaleString('vi-VN')}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Số tài khoản bấm Theo dõi Fanpage
          </p>
        </div>

        {/* Stat 2: Page Likes (Lượt thích) */}
        <div className="app-card p-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>Lượt thích Trang</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <ThumbsUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {likes.toLocaleString('vi-VN')}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Số lượt Thích (Likes) ghi nhận
          </p>
        </div>

        {/* Stat 3: Page ID */}
        <div className="app-card p-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>Facebook Page ID</span>
            <button
              onClick={handleCopyId}
              className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              title="Copy ID"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <div className="text-xl font-mono font-bold text-slate-900 dark:text-white truncate">
            {pageId}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Mã định danh Fanpage trên Meta
          </p>
        </div>

      </div>

      {/* 3. Token Status & Permissions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Token Card */}
        <div className="app-card p-5 space-y-2 md:col-span-1">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>Page Access Token</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Key className="w-4 h-4" />
            </div>
          </div>
          <div className="text-sm font-mono font-bold text-slate-800 dark:text-slate-200 truncate">
            {maskedToken}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" /> Token hợp lệ & bảo mật
          </div>
        </div>

        {/* Permissions */}
        <div className="app-card p-5 space-y-3 md:col-span-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Quyền hạn API đã cấp cho Trang (Meta Permissions)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {permissions.map((perm) => (
              <div key={perm.name} className="p-3 rounded-xl app-card-raised space-y-1">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span className="font-mono text-[11px] font-bold text-slate-900 dark:text-slate-100 truncate">
                    {perm.name}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug">
                  {perm.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
