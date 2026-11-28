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
  ThumbsUp,
  Clock,
  AlertCircle,
  ChevronDown,
  PlusCircle,
  UploadCloud,
  X,
  Loader2
} from 'lucide-react';

export default function YouTubeChannelHubTab({ 
  status, 
  onNavigate, 
  onSwitchYoutubeChannel, 
  onConnectNewYoutube, 
  onRefreshStatus 
}) {
  const [channel, setChannel] = useState(null);
  const [allYtChannels, setAllYtChannels] = useState([]);
  const [channelDropdownOpen, setChannelDropdownOpen] = useState(false);
  const [recentVideos, setRecentVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notification, setNotification] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);

  // Quick Upload Modal States
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [modalFile, setModalFile] = useState(null);
  const [modalPreview, setModalPreview] = useState(null);
  const [modalTitle, setModalTitle] = useState('');
  const [modalDesc, setModalDesc] = useState('');
  const [isUploadingModal, setIsUploadingModal] = useState(false);
  const [modalSuccessResult, setModalSuccessResult] = useState(null);

  const handleSelectModalFile = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setModalFile(file);
      setModalPreview(URL.createObjectURL(file));
      setModalSuccessResult(null);
      if (!modalTitle) {
        setModalTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleUploadFromModal = async () => {
    if (!modalFile) {
      alert('Vui lòng chọn file video MP4 từ máy!');
      return;
    }
    setIsUploadingModal(true);
    setModalSuccessResult(null);
    try {
      const formData = new FormData();
      formData.append('videoFile', modalFile);
      formData.append('title', modalTitle || 'Shorts Animation');
      formData.append('description', modalDesc || 'Uploaded via SocialHub.');
      formData.append('tags', JSON.stringify(['Shorts', 'Fable', 'Story', 'LifeLessons']));
      formData.append('privacyStatus', 'public');

      const res = await axios.post('/api/youtube/upload-shorts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data?.success) {
        setModalSuccessResult(res.data);
        setNotification({
          type: 'success',
          message: `🚀 Video đã đăng thành công lên kênh YouTube Shorts! Video ID: ${res.data.videoId}`
        });
        fetchChannelData();
      }
    } catch (err) {
      alert('Lỗi đăng video: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsUploadingModal(false);
    }
  };

  const fetchChannelData = async (targetId = null) => {
    try {
      setRefreshing(true);
      const url = targetId ? `/api/youtube/channel?channelId=${targetId}` : '/api/youtube/channel';
      const res = await axios.get(url);
      if (res.data?.success && res.data.data) {
        setChannel(res.data.data.channel);
        setRecentVideos(res.data.data.recentVideos || []);
        if (res.data.channels) {
          setAllYtChannels(res.data.channels);
        }
      }
    } catch (err) {
      console.log('Chưa kết nối YouTube hoặc lỗi lấy dữ liệu:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSwitchChannel = async (channelId) => {
    try {
      setRefreshing(true);
      await axios.post('/api/youtube/channel/active', { channelId });
      if (onSwitchYoutubeChannel) {
        onSwitchYoutubeChannel(channelId);
      }
      if (onRefreshStatus) {
        onRefreshStatus();
      }
      await fetchChannelData(channelId);
      setChannelDropdownOpen(false);
      setNotification({
        type: 'success',
        message: 'Đã chuyển đổi kênh thành công!'
      });
    } catch (err) {
      alert('Lỗi chuyển đổi kênh: ' + err.message);
    } finally {
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
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-black transition flex items-center gap-1.5 shadow-md shadow-red-500/25 cursor-pointer"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Đăng Video Lên Kênh</span>
              </button>

              <a
                href="https://studio.youtube.com"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs font-bold transition flex items-center gap-1.5 border border-slate-200 dark:border-slate-700"
              >
                <span>Mở YouTube Studio</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
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
              {(channel.avatar || channel.thumbnails?.high?.url || channel.thumbnails?.medium?.url || channel.thumbnails?.default?.url) ? (
                <img
                  src={channel.avatar || channel.thumbnails?.high?.url || channel.thumbnails?.medium?.url || channel.thumbnails?.default?.url}
                  alt={channel.title}
                  className="w-16 h-16 rounded-full border-2 border-red-500 shadow-md object-cover bg-slate-800"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallbackEl = document.getElementById('yt-avatar-fallback');
                    if (fallbackEl) fallbackEl.style.display = 'flex';
                  }}
                />
              ) : null}
              <div 
                id="yt-avatar-fallback"
                className="w-16 h-16 rounded-full bg-red-600 text-white items-center justify-center font-bold text-xl shadow-md"
                style={{ display: (channel.avatar || channel.thumbnails?.high?.url || channel.thumbnails?.medium?.url || channel.thumbnails?.default?.url) ? 'none' : 'flex' }}
              >
                {channel.title?.charAt(0) || 'Y'}
              </div>
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

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              {/* DROPDOWN CHUYỂN ĐỔI KÊNH */}
              {allYtChannels && allYtChannels.length > 1 && (
                <div className="relative">
                  <button
                    onClick={() => setChannelDropdownOpen(!channelDropdownOpen)}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition flex items-center justify-between gap-2 border border-slate-200 dark:border-slate-700 cursor-pointer shadow-xs"
                  >
                    <span>Kênh: {channel.title}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {channelDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setChannelDropdownOpen(false)} />
                      <div className="absolute right-0 top-full mt-1.5 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl p-2 z-40 space-y-1 animate-fadeIn">
                        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1">
                          Chuyển Kênh YouTube ({allYtChannels.length})
                        </div>
                        {allYtChannels.map((c) => {
                          const isCur = c.name === channel.title || c.id === channel.id;
                          return (
                            <button
                              key={c.id || c.channelId}
                              onClick={() => handleSwitchChannel(c.id || c.channelId)}
                              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs text-left transition cursor-pointer ${
                                isCur
                                  ? 'bg-red-500/10 text-red-600 dark:text-red-400 font-bold border border-red-500/30'
                                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                              }`}
                            >
                              <div className="w-4 h-4 rounded bg-red-600 text-white flex items-center justify-center text-[8px] font-bold shrink-0">
                                <Youtube className="w-2.5 h-2.5" />
                              </div>
                              <span className="truncate flex-1">{c.name}</span>
                              {isCur && <CheckCircle2 className="w-3.5 h-3.5 text-red-500 shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* NÚT THÊM KÊNH MỚI */}
              <button
                onClick={onConnectNewYoutube || handleConnect}
                className="px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer border border-slate-700"
                title="Đăng nhập tài khoản Google để liên kết thêm kênh YouTube khác"
              >
                <PlusCircle className="w-3.5 h-3.5 text-red-400" />
                <span>+ Thêm Kênh Khác</span>
              </button>
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
                {Number(channel?.statistics?.subscriberCount ?? channel?.subscriberCount ?? 0).toLocaleString('vi-VN')}
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
                {Number(channel?.statistics?.viewCount ?? channel?.viewCount ?? 0).toLocaleString('vi-VN')}
              </div>
              <div className="text-[10px] text-blue-500 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Lượt xem toàn kênh realtime</span>
              </div>
            </div>

            <div className="app-card-raised p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold">Tổng Lượt Thích</span>
                <ThumbsUp className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {Number(channel?.statistics?.likeCount ?? channel?.likeCount ?? 0).toLocaleString('vi-VN')}
              </div>
              <div className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Tương tác Like thực tế</span>
              </div>
            </div>

            <div className="app-card-raised p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold">Tổng Số Video Shorts</span>
                <Video className="w-4 h-4 text-purple-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {Number(channel?.statistics?.videoCount ?? channel?.videoCount ?? recentVideos?.length ?? 0).toLocaleString('vi-VN')}
              </div>
              <div className="text-[10px] text-purple-500 font-bold">Video công khai trên kênh</div>
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
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {recentVideos.map((vid) => {
                  const videoId = vid.id?.videoId || vid.id;
                  const title = vid.title || vid.snippet?.title || 'YouTube Shorts';
                  const publishedAt = vid.publishedAt || vid.snippet?.publishedAt;
                  const thumb = vid.thumbnail 
                    || vid.snippet?.thumbnails?.high?.url 
                    || vid.snippet?.thumbnails?.medium?.url 
                    || (videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : null);

                  return (
                    <div
                      key={videoId}
                      className="group relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 shadow-md hover:shadow-xl hover:border-red-500/50 transition-all duration-300 flex flex-col justify-between"
                    >
                      {/* DẠNG DỌC CHUẨN SHORTS 9:16 */}
                      <div className="relative aspect-[9/16] w-full overflow-hidden bg-slate-950 flex flex-col justify-between p-3">
                        {/* ẢNH THUMBNAIL DỌC */}
                        {thumb && (
                          <img
                            src={thumb}
                            alt={title}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              if (videoId && !e.currentTarget.src.includes('hqdefault')) {
                                e.currentTarget.src = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
                              }
                            }}
                          />
                        )}

                        {/* GRADIENT TỐI NỀN */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-black/20 pointer-events-none" />

                        {/* HUY HIỆU SHORTS & NÚT COPY */}
                        <div className="relative z-10 flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-md text-[10px] text-white font-bold flex items-center gap-1 border border-white/10 shadow-sm">
                            <Youtube className="w-3 h-3 text-red-500" />
                            <span>Shorts</span>
                          </span>

                          <button
                            onClick={() => handleCopy(`https://www.youtube.com/shorts/${videoId}`, `yt_${videoId}`)}
                            className="w-7 h-7 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-md text-white flex items-center justify-center transition border border-white/15 cursor-pointer shadow-sm"
                            title="Copy liên kết Shorts"
                          >
                            {copiedKey === `yt_${videoId}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-300" />}
                          </button>
                        </div>

                        {/* TIÊU ĐỀ & THỐNG KÊ REALTIME & NÚT XEM */}
                        <div className="relative z-10 space-y-2 mt-auto">
                          <h4 
                            className="text-xs font-bold text-white line-clamp-2 leading-snug drop-shadow-md group-hover:text-red-400 transition" 
                            title={title}
                          >
                            {title}
                          </h4>

                          {/* SỐ LIỆU TƯƠNG TÁC THỰC TẾ CỦA VIDEO */}
                          <div className="flex items-center justify-between text-[10px] font-bold text-white bg-black/75 px-2 py-1 rounded-lg backdrop-blur-md border border-white/10 shadow-xs">
                            <span className="flex items-center gap-1 text-sky-300" title="Lượt xem thực tế">
                              <Eye className="w-3 h-3 text-sky-400" />
                              <span>{(vid.views ?? vid.statistics?.viewCount ?? 0).toLocaleString('vi-VN')}</span>
                            </span>
                            <span className="flex items-center gap-1 text-emerald-300" title="Lượt thích">
                              <ThumbsUp className="w-3 h-3 text-emerald-400" />
                              <span>{(vid.likes ?? vid.statistics?.likeCount ?? 0).toLocaleString('vi-VN')}</span>
                            </span>
                            <span className="flex items-center gap-1 text-amber-300" title="Bình luận">
                              <MessageSquare className="w-3 h-3 text-amber-400" />
                              <span>{(vid.comments ?? vid.statistics?.commentCount ?? 0).toLocaleString('vi-VN')}</span>
                            </span>
                          </div>

                          <div className="text-[10px] text-slate-300 flex items-center justify-between font-medium">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>{publishedAt ? new Date(publishedAt).toLocaleDateString('vi-VN') : 'Mới xuất bản'}</span>
                            </span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-red-500/20 text-red-300 font-bold">
                              Công khai
                            </span>
                          </div>

                          <a
                            href={`https://www.youtube.com/shorts/${videoId}`}
                            target="_blank"
                            rel="noreferrer"
                            className="w-full py-1.5 px-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-[11px] transition flex items-center justify-center gap-1 shadow-md cursor-pointer"
                          >
                            <span>Xem trên Shorts</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
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

      {/* QUICK UPLOAD VIDEO MODAL */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-red-600 text-white">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Đăng Video MP4 Lên Kênh YouTube Shorts
                  </h3>
                  <p className="text-xs text-slate-500">
                    Kênh đích: <b className="text-red-500">{channel?.title || 'YouTube Channel'}</b>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  1. Chọn file video MP4 từ máy tính của bạn:
                </label>
                <input
                  type="file"
                  accept="video/mp4,video/quicktime,video/*"
                  onChange={handleSelectModalFile}
                  className="w-full text-xs text-slate-600 dark:text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-red-600 file:text-white hover:file:bg-red-500 cursor-pointer p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700"
                />

                {modalPreview && (
                  <div className="max-w-[160px] aspect-[9/16] rounded-xl overflow-hidden border border-red-500/40 bg-black mt-2 shadow-md">
                    <video controls src={modalPreview} className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  2. Tiêu đề video (Tự động thêm #Shorts):
                </label>
                <input
                  type="text"
                  value={modalTitle}
                  onChange={(e) => setModalTitle(e.target.value)}
                  placeholder="Ví dụ: Bài học cuộc sống đắt giá..."
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  3. Mô tả video:
                </label>
                <textarea
                  rows={2}
                  value={modalDesc}
                  onChange={(e) => setModalDesc(e.target.value)}
                  placeholder="Mô tả tóm tắt nội dung..."
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                />
              </div>

              {modalSuccessResult ? (
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-center justify-between">
                  <span className="font-bold">Đã tải lên Shorts thành công!</span>
                  <a
                    href={`https://www.youtube.com/shorts/${modalSuccessResult.videoId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-black underline hover:text-emerald-300 flex items-center gap-1"
                  >
                    <span>Xem Trên YouTube</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleUploadFromModal}
                  disabled={isUploadingModal || !modalFile}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs transition shadow-md shadow-red-500/25 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isUploadingModal ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang tải video lên YouTube Shorts...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>🚀 Bấm Đăng Lên Kênh YouTube Shorts Ngay</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
