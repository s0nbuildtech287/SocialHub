import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Youtube,
  BarChart3,
  Users,
  Eye,
  Video,
  Film,
  Sparkles,
  ExternalLink,
  RefreshCw,
  Copy,
  Check,
  CheckCircle2,
  BookOpen,
  Music2,
  MessageSquare,
  Clock,
  AlertCircle
} from 'lucide-react';

export default function YouTubeChannelHubTab({ onNavigate }) {
  const [channel, setChannel] = useState(null);
  const [recentVideos, setRecentVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notification, setNotification] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);

  const fetchChannelData = async () => {
    try {
      setRefreshing(true);
      const res = await axios.get('/api/youtube/channel');
      if (res.data?.success && res.data.data) {
        setChannel(res.data.data.channel);
        setRecentVideos(res.data.data.recentVideos || []);
      }
    } catch (err) {
      console.log('Chưa kết nối YouTube hoặc lỗi lấy dữ liệu:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchChannelData();

    // Kiểm tra callback từ Google OAuth
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('youtube_connected') === 'true') {
      fetchChannelData();
      setNotification({
        type: 'success',
        message: '🎉 Chúc mừng! Kết nối kênh YouTube thành công qua OAuth 2.0. Toàn bộ xưởng nội dung đã sẵn sàng xuất bản.'
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleConnect = async () => {
    try {
      const res = await axios.get('/api/auth/youtube/url');
      if (res.data?.authUrl) {
        window.location.href = res.data.authUrl;
      }
    } catch (err) {
      alert('Lỗi khởi tạo liên kết Google OAuth: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* NOTIFICATION TOAST */}
      {notification && (
        <div className={`p-4 rounded-2xl flex items-center justify-between text-xs sm:text-sm font-bold shadow-md transition animate-fadeIn ${
          notification.type === 'success'
            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
            : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30'
        }`}>
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-xs opacity-75 hover:opacity-100 underline ml-4 cursor-pointer"
          >
            Đóng
          </button>
        </div>
      )}

      {/* TOP BANNER */}
      <div className="app-card-raised p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-r from-red-500/10 via-rose-500/5 to-transparent flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-red-600 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-red-500/25 shrink-0">
            <Youtube className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                YouTube: Trung Tâm Kênh & Thống Kê
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                Data API v3
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
              Trung tâm điều hành hợp nhất: Quản lý người đăng ký, lượt xem toàn kênh và nhận video tự động từ tất cả các xưởng nội dung (Truyện tranh, Nhạc Lofi, Reup Comment).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            onClick={fetchChannelData}
            disabled={refreshing}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Làm mới số liệu</span>
          </button>

          {channel ? (
            <a
              href="https://studio.youtube.com"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black transition flex items-center gap-1.5 shadow-md shadow-red-500/20"
            >
              <span>Mở YouTube Studio</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          ) : (
            <button
              onClick={handleConnect}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-black transition flex items-center gap-2 shadow-md shadow-red-500/20 cursor-pointer"
            >
              <Youtube className="w-4 h-4" />
              <span>Kết Nối Kênh YouTube</span>
            </button>
          )}
        </div>
      </div>

      {/* BODY CONTENT: CONNECTED OR EMPTY STATE */}
      {channel ? (
        <div className="space-y-6">
          {/* CHANNEL IDENTITY CARD */}
          <div className="app-card-raised p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              {channel.thumbnails?.default?.url ? (
                <img
                  src={channel.thumbnails.default.url}
                  alt={channel.title}
                  className="w-16 h-16 rounded-full border-2 border-red-500 shadow-md object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
                  {channel.title?.charAt(0) || 'Y'}
                </div>
              )}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                    {channel.title}
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>OAuth 2.0 Đã Sẵn Sàng</span>
                  </span>
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-2">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {channel.customUrl || channel.id}
                  </span>
                  <span>•</span>
                  <a
                    href={`https://www.youtube.com/${channel.customUrl || 'channel/' + channel.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-red-500 hover:underline flex items-center gap-1 font-bold"
                  >
                    <span>Xem Kênh Công Khai</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 max-w-sm">
              <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Trạng thái kết nối Google Cloud:</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Tokens tự động gia hạn (Refresh Token). Hỗ trợ upload Shorts Full HD và tự động đồng bộ thống kê.
              </p>
            </div>
          </div>

          {/* 4 CORE STATS CARDS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="app-card-raised p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold">Người Đăng Ký</span>
                <Users className="w-4 h-4 text-red-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {Number(channel.statistics?.subscriberCount || 0).toLocaleString('vi-VN')}
              </div>
              <div className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Subscribers thực tế</span>
              </div>
            </div>

            <div className="app-card-raised p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold">Tổng Lượt Xem</span>
                <Eye className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {Number(channel.statistics?.viewCount || 0).toLocaleString('vi-VN')}
              </div>
              <div className="text-[10px] text-blue-500 font-bold">Lượt xem toàn kênh</div>
            </div>

            <div className="app-card-raised p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold">Tổng Số Video</span>
                <Video className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {Number(channel.statistics?.videoCount || 0).toLocaleString('vi-VN')}
              </div>
              <div className="text-[10px] text-slate-500 font-medium">Video công khai</div>
            </div>

            <div className="app-card-raised p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold">Hạn Mức Google API</span>
                <Sparkles className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                10,000 / ngày
              </div>
              <div className="text-[10px] text-amber-500 font-bold">~6 Video Shorts tự động / ngày</div>
            </div>
          </div>

          {/* RECENT PUBLISHED VIDEOS */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Film className="w-5 h-5 text-red-500" />
                  <span>Video Xuất Bản Gần Nhất Trên Kênh</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Danh sách video từ các xưởng sáng tạo đã đẩy lên kênh YouTube của bạn.
                </p>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                {recentVideos?.length || 0} video được tải về
              </span>
            </div>

            {recentVideos && recentVideos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {recentVideos.map((vid) => {
                  const videoId = vid.id?.videoId || vid.id;
                  const snippet = vid.snippet || {};
                  const thumb = snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || snippet.thumbnails?.default?.url;
                  return (
                    <div
                      key={videoId}
                      className="app-card-raised p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 hover:border-red-500/40 transition flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="relative aspect-video rounded-xl overflow-hidden bg-black shadow-inner">
                          {thumb && (
                            <img
                              src={thumb}
                              alt={snippet.title}
                              className="w-full h-full object-cover"
                            />
                          )}
                          <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded-md bg-black/85 text-[10px] text-white font-bold flex items-center gap-1 shadow-sm">
                            <Youtube className="w-3 h-3 text-red-500" />
                            <span>Shorts</span>
                          </span>
                        </div>

                        <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 leading-relaxed" title={snippet.title}>
                          {snippet.title}
                        </h4>

                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{snippet.publishedAt ? new Date(snippet.publishedAt).toLocaleDateString('vi-VN') : 'Mới đây'}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2.5 border-t border-slate-200 dark:border-slate-800">
                        <a
                          href={`https://www.youtube.com/shorts/${videoId}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-[11px] transition flex items-center justify-center gap-1"
                        >
                          <span>Xem trên Shorts</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <button
                          onClick={() => handleCopy(`https://www.youtube.com/shorts/${videoId}`, `yt_${videoId}`)}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs transition cursor-pointer"
                          title="Copy liên kết Shorts"
                        >
                          {copiedKey === `yt_${videoId}` ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-center space-y-3">
                <Film className="w-10 h-10 text-slate-400 mx-auto" />
                <div className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  Chưa có video Shorts nào được xuất bản từ SocialHub
                </div>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Hãy sang <b>"Xưởng Truyện Tranh Shorts AI"</b> tạo câu chuyện đầu tiên và bấm Đăng 1-Click lên kênh ngay!
                </p>
                <button
                  onClick={() => onNavigate && onNavigate('youtube-comic-studio')}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition cursor-pointer"
                >
                  Mở Xưởng Truyện Tranh Shorts Ngay
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* EMPTY STATE: NOT CONNECTED */
        <div className="max-w-xl mx-auto p-8 rounded-3xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-red-600/10 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto border border-red-500/20 shadow-md">
            <Youtube className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              Kết Nối Kênh YouTube Của Bạn
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              Liên kết kênh YouTube với SocialHub bằng Google Cloud OAuth 2.0 để tự động xuất bản video Shorts từ các xưởng sáng tạo và theo dõi chỉ số người xem trực tiếp trên một màn hình duy nhất.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-left space-y-2 text-xs">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Quyền lợi khi kết nối:</span>
            </div>
            <ul className="space-y-1.5 list-disc pl-5 text-slate-600 dark:text-slate-400 text-[11px]">
              <li>Đăng video 1-click tự động từ Xưởng Truyện Tranh, Xưởng Nhạc Lofi, Xưởng Reup.</li>
              <li>Theo dõi trực tiếp số người đăng ký (Subscribers) và tổng lượt xem toàn kênh.</li>
              <li>10,000 units quota/ngày miễn phí từ Google, không phát sinh chi phí duy trì.</li>
            </ul>
          </div>

          <button
            onClick={handleConnect}
            className="w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-sm transition shadow-lg shadow-red-500/25 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Youtube className="w-5 h-5" />
            <span>Đăng Nhập & Kết Nối Kênh YouTube Ngay</span>
          </button>
        </div>
      )}

      {/* ROADMAP: CONTENT STUDIOS FOR YOUTUBE */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Hệ Thống Xưởng Sản Xuất Video Cho Kênh YouTube</span>
            </h3>
            <p className="text-xs text-slate-500">
              Mỗi xưởng phụ trách 1 phân khúc nội dung, đều có thể xuất bản trực tiếp lên kênh YouTube của bạn.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* STUDIO 1: COMIC SHORTS */}
          <div className="app-card-raised p-4 rounded-2xl border border-red-500/30 bg-gradient-to-br from-red-500/5 to-transparent space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="p-2 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400">
                  <BookOpen className="w-5 h-5" />
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Đang Hoạt Động
                </span>
              </div>
              <h4 className="text-sm font-black text-slate-900 dark:text-white">
                Xưởng Truyện Tranh Shorts AI
              </h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                Tự động sinh kịch bản ngụ ngôn triết lý 11 khung tranh, quét ảnh bằng AI Vision và render video cuộn dọc 9:16 kèm giọng lồng tiếng đa vai.
              </p>
            </div>
            <button
              onClick={() => onNavigate && onNavigate('youtube-comic-studio')}
              className="w-full py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Mở Xưởng Truyện Tranh</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* STUDIO 2: LOFI / MUSIC */}
          <div className="app-card-raised p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 flex flex-col justify-between opacity-85 hover:opacity-100 transition">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="p-2 rounded-xl bg-pink-500/10 text-pink-600 dark:text-pink-400">
                  <Music2 className="w-5 h-5" />
                </span>
              </div>
              <h4 className="text-sm font-black text-slate-900 dark:text-white">
                Xưởng Video Âm Nhạc / Lofi
              </h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                Tự động tạo video âm nhạc thư giãn, lofi chill, piano học tập kèm hiệu ứng visualizer sóng nhạc và luồng phát lặp vòng liên tục.
              </p>
            </div>
            <div className="py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-400 text-center font-bold text-xs">
              Sắp ra mắt
            </div>
          </div>

          {/* STUDIO 3: REUP / REDDIT COMMENTS */}
          <div className="app-card-raised p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 flex flex-col justify-between opacity-85 hover:opacity-100 transition">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <MessageSquare className="w-5 h-5" />
                </span>
              </div>
              <h4 className="text-sm font-black text-slate-900 dark:text-white">
                Xưởng Reup & Đọc Comment
              </h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                Cào các chủ đề bàn luận hot trên mạng xã hội, tạo video chụp ảnh bình luận kết hợp giọng đọc AI và nhạc nền lôi cuốn người xem.
              </p>
            </div>
            <div className="py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-400 text-center font-bold text-xs">
              Sắp ra mắt
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
