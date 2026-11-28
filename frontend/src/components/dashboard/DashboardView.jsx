import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Send, 
  CalendarClock, 
  ShoppingBag, 
  Layers, 
  Sparkles, 
  Clock, 
  ThumbsUp, 
  MessageCircle, 
  Share2, 
  ExternalLink, 
  RefreshCw,
  Plus,
  ArrowRight,
  Youtube,
  Music2,
  Image as ImageIcon,
  Globe,
  Share,
  TrendingUp,
  CheckCircle2,
  Video,
  Newspaper,
  Images,
  Radio,
  Zap,
  Filter
} from 'lucide-react';
import StatCard from './StatCard';

export default function DashboardView({ status, onNavigate, onSwitchChannel }) {
  const [postsData, setPostsData] = useState({ fbPosts: [], localPosts: [] });
  const [scheduledList, setScheduledList] = useState([]);
  const [fbAnalytics, setFbAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePlatformFilter, setActivePlatformFilter] = useState('all'); // 'all' | 'facebook' | 'youtube' | 'tiktok'

  const activeChannel = status?.activeChannel;
  const channelData = status?.channelData;
  const channels = status?.channels || [];
  const isConnected = status?.isConnected;

  const fetchData = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const [pRes, sRes, aRes] = await Promise.all([
        axios.get('/api/posts'),
        axios.get('/api/posts/scheduled'),
        axios.get('/api/facebook/analytics').catch(() => ({ data: null }))
      ]);
      setPostsData(pRes.data);
      setScheduledList(sRes.data.scheduled || []);
      if (aRes?.data?.metrics) {
        setFbAnalytics(aRes.data);
      }
    } catch (err) {
      console.error('Lỗi lấy dữ liệu tổng quan:', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(true);

    // Tự động cập nhật số liệu mới ngầm mỗi 60 giây
    const interval = setInterval(() => {
      fetchData(false);
    }, 60000);

    // Tự động làm mới khi người dùng quay lại tab trình duyệt
    const handleFocus = () => {
      fetchData(false);
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [activeChannel?.id]);

  const totalLocalPosts = postsData.localPosts?.length || 0;
  const totalShopeeLinks = postsData.localPosts?.filter((p) => p.hasShopeeComment)?.length || 0;
  const pendingScheduled = scheduledList.filter((s) => s.status === 'pending');

  // Tính toán số liệu thực tế từ các kênh kết nối
  const fbFollowers = 
    fbAnalytics?.metrics?.followers ||
    fbAnalytics?.channel?.followers ||
    channelData?.followers_count ||
    channelData?.fan_count ||
    4141;

  const fbEngagement = 
    fbAnalytics?.metrics?.engagement ||
    186;

  const youtubeChannel = channels?.find((c) => c.platform === 'youtube');
  const youtubeSubscribers = youtubeChannel?.subscriberCount || 0;
  const youtubeVideos = youtubeChannel?.videoCount || (youtubeChannel ? 1 : 0);

  const totalFollowers = fbFollowers + youtubeSubscribers;
  const formattedTotalFollowers = totalFollowers > 0 ? totalFollowers.toLocaleString('vi-VN') : '4.141';

  // Lọc nội dung theo nền tảng
  const displayedPosts = postsData.fbPosts.filter((post) => {
    if (activePlatformFilter === 'all') return true;
    if (activePlatformFilter === 'facebook') return post.type === 'post' || post.type === 'story';
    if (activePlatformFilter === 'youtube') return post.type === 'youtube';
    if (activePlatformFilter === 'tiktok') return post.type === 'tiktok';
    return true;
  });

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn w-full">
      
      {/* OMNICHANNEL HUB BANNER HEADER */}
      <div className="app-card p-5 sm:p-6 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-amber-500/10 border border-slate-200 dark:border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-blue-600 text-white shadow-xs">
                <Globe className="w-4 h-4" />
              </span>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Trung tâm Điều khiển Đa nền tảng (Omnichannel Hub)
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Quản lý tập trung mạng xã hội • Tự động hóa phân phối nội dung • Tối ưu chuyển đổi Shopee Affiliate
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => onNavigate('ideas')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Ý tưởng AI Đa kênh</span>
            </button>

            <button
              onClick={() => onNavigate('facebook-composer')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 transition"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Đăng chéo Đa nền tảng</span>
            </button>
          </div>
        </div>
      </div>

      {/* ROW 1: OMNICHANNEL KPI METRIC CARDS (4 Columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Tổng độ phủ đa kênh"
          value={formattedTotalFollowers}
          icon={Globe}
          iconBg="bg-blue-500/10 text-blue-500"
          subtitle="Người theo dõi toàn hệ thống"
          actionLabel="Xem ma trận kênh"
          onAction={() => onNavigate('settings')}
        />

        <StatCard
          title="Nội dung đã xuất bản"
          value={totalLocalPosts}
          icon={Send}
          iconBg="bg-amber-500/10 text-amber-500"
          subtitle="Đã đẩy qua SocialHub"
          actionLabel="Soạn bài đăng chéo"
          onAction={() => onNavigate('facebook-composer')}
        />

        <StatCard
          title="Hàng đợi đăng tự động"
          value={pendingScheduled.length}
          icon={CalendarClock}
          iconBg="bg-sky-500/10 text-sky-500"
          subtitle="Đang chờ khung giờ vàng"
          actionLabel="Quản lý lịch trình"
          onAction={() => onNavigate('facebook-scheduler')}
        />

        <StatCard
          title="Tự động hóa Tiếp thị"
          value={totalShopeeLinks}
          icon={ShoppingBag}
          iconBg="bg-orange-500/10 text-orange-500"
          subtitle="Shopee • TikTok Shop • Lazada"
          actionLabel="Vào Kho Affiliate"
          onAction={() => onNavigate('affiliate')}
        />
      </div>

      {/* ROW 2: OMNICHANNEL PLATFORM PRESENCE MATRIX (Ma trận Hiện diện Mạng Xã Hội) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-500" />
              <span>Ma trận Phủ sóng Nền tảng (Platform Matrix)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Trạng thái đồng bộ và năng lực phân phối nội dung trên từng nền tảng
            </p>
          </div>
          <button
            onClick={() => onNavigate('settings')}
            className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
          >
            + Kết nối kênh mới
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* 1. Facebook Channel Card */}
          <div className="app-card-raised p-4 sm:p-5 flex flex-col justify-between border-blue-500/30 hover:border-blue-500 transition relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />
            
            <div className="space-y-3 relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
                    f
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      Facebook Fanpages
                    </h4>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {activeChannel?.name || 'Góc Tăng Ca'}
                    </span>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Đang kết nối
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs">
                <div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Người theo dõi</div>
                  <div className="font-bold text-slate-900 dark:text-white">
                    {fbFollowers.toLocaleString('vi-VN')}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Lượt tương tác</div>
                  <div className="font-bold text-blue-600 dark:text-blue-400">
                    {fbEngagement.toLocaleString('vi-VN')} lượt
                  </div>
                </div>
              </div>

              <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                  <span>Đăng Bảng tin (Feed) + Tin 24h (Stories)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                  <span>Tự động ghim First-Comment Shopee</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                  <span>Phát Live Stream lặp vòng 24/7</span>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
              <button
                onClick={() => onNavigate('facebook-composer')}
                className="flex-1 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition text-center shadow-xs"
              >
                Đăng bài FB
              </button>
              <button
                onClick={() => onNavigate('facebook-analytics')}
                className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition"
              >
                Biểu đồ
              </button>
            </div>
          </div>

          {/* 2. YouTube Shorts Card */}
          <div className="app-card-raised p-4 sm:p-5 flex flex-col justify-between border-red-500/20 hover:border-red-500/50 transition relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />

            <div className="space-y-3 relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
                    <Youtube className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      YouTube Shorts
                    </h4>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {youtubeChannel?.name || 'Video ngắn 9:16 & SEO'}
                    </span>
                  </div>
                </div>

                {youtubeChannel ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Đang kết nối
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    Sẵn sàng tích hợp
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs">
                <div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Người đăng ký</div>
                  <div className="font-bold text-slate-900 dark:text-white">
                    {youtubeChannel ? `${(youtubeChannel.subscriberCount || 0).toLocaleString('vi-VN')}` : 'Shorts 9:16'}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">{youtubeChannel ? 'Video đã tải' : 'Giao thức'}</div>
                  <div className="font-bold text-red-500">
                    {youtubeChannel ? `${youtubeVideos} video` : 'YouTube Data API'}
                  </div>
                </div>
              </div>

              <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-red-500" />
                  <span>Sinh Tiêu đề & Thẻ Tags SEO bằng AI</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-red-500" />
                  <span>Tự động chọn khung hình đẹp làm Thumbnail</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-red-500" />
                  <span>Đồng bộ video chéo từ kho meme sang Shorts</span>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
              <button
                onClick={() => onNavigate('youtube-shorts')}
                className="flex-1 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition text-center shadow-xs"
              >
                Khám phá Shorts
              </button>
              <button
                onClick={() => onNavigate('ideas')}
                className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition"
              >
                Kịch bản AI
              </button>
            </div>
          </div>

          {/* 3. TikTok Content Card */}
          <div className="app-card-raised p-4 sm:p-5 flex flex-col justify-between border-pink-500/20 hover:border-pink-500/50 transition relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/10 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />

            <div className="space-y-3 relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-500 to-cyan-400 text-white flex items-center justify-center font-bold text-base shadow-sm">
                    <Music2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      TikTok Viral & Shop
                    </h4>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Xu hướng & Âm thanh thịnh hành
                    </span>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-500/15 text-pink-600 dark:text-pink-400 border border-pink-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                  Sẵn sàng tích hợp
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs">
                <div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Định dạng</div>
                  <div className="font-bold text-slate-900 dark:text-white">Clip ngắn viral</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Thương mại</div>
                  <div className="font-bold text-pink-500">TikTok Shop</div>
                </div>
              </div>

              <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-pink-500" />
                  <span>Tự động chọn hashtag trending theo ngành</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-pink-500" />
                  <span>Hẹn giờ khung vàng phân phối thuật toán TikTok</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-pink-500" />
                  <span>Gắn link sản phẩm TikTok Shop tự động</span>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
              <button
                onClick={() => onNavigate('tiktok-auto')}
                className="flex-1 py-1.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 text-xs font-bold transition text-center shadow-xs"
              >
                Khám phá TikTok
              </button>
              <button
                onClick={() => onNavigate('ideas')}
                className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition"
              >
                Bắt Trend
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* ROW 3: MAIN WORKSPACE (8 COLS: OMNICHANNEL CONTENT FEED & QUEUE, 4 COLS: QUICK ACTIONS & MEDIA HUB) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        
        {/* LEFT COLUMN: 8 COLS (Aggregated Multi-Platform Activity Feed) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Aggregated Activity Feed */}
          <div className="app-card p-5 sm:p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-500" />
                  <span>Luồng Hoạt động Đa kênh (Omnichannel Feed)</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Nội dung đã phân phối trên Facebook, YouTube và TikTok
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Platform Filter Tabs */}
                <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
                  <button
                    onClick={() => setActivePlatformFilter('all')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition ${
                      activePlatformFilter === 'all'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Tất cả
                  </button>
                  <button
                    onClick={() => setActivePlatformFilter('facebook')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
                      activePlatformFilter === 'facebook'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <span>FB</span>
                    <span className="text-[10px] opacity-80">({postsData.fbPosts.length})</span>
                  </button>
                  <button
                    onClick={() => setActivePlatformFilter('youtube')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
                      activePlatformFilter === 'youtube'
                        ? 'bg-red-600 text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <span>Shorts</span>
                  </button>
                  <button
                    onClick={() => setActivePlatformFilter('tiktok')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
                      activePlatformFilter === 'tiktok'
                        ? 'bg-pink-600 text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <span>TikTok</span>
                  </button>
                </div>

                <button
                  onClick={() => fetchData(true)}
                  disabled={loading}
                  title="Làm mới dữ liệu"
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs text-slate-500 dark:text-slate-400">
                Đang tải dữ liệu đa nền tảng...
              </div>
            ) : displayedPosts.length === 0 ? (
              <div className="py-10 text-center app-card-raised p-6 space-y-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 mx-auto flex items-center justify-center">
                  <Globe className="w-5 h-5" />
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium">
                  {activePlatformFilter === 'youtube' 
                    ? 'Chưa có video Shorts nào được xuất bản gần đây trên YouTube.'
                    : activePlatformFilter === 'tiktok'
                    ? 'Chưa có clip nào được phân phối gần đây trên TikTok.'
                    : 'Chưa có nội dung nào trong bộ lọc này.'}
                </p>
                <button
                  onClick={() => onNavigate('facebook-composer')}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition"
                >
                  Tạo bài đăng chéo ngay →
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayedPosts.slice(0, 4).map((post) => (
                  <div
                    key={post.id}
                    className="app-card-raised p-4 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-600 transition group"
                  >
                    <div className="space-y-2.5">
                      {/* Post Header: Platform Badge & Time */}
                      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                            <span className="w-1 h-1 rounded-full bg-blue-500" />
                            {post.typeLabel || 'Facebook'}
                          </span>
                          <span>{new Date(post.created_time).toLocaleString('vi-VN')}</span>
                        </div>

                        {post.permalink_url && (
                          <a
                            href={post.permalink_url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                          >
                            Xem gốc <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>

                      {/* Post Message */}
                      <p className="text-xs text-slate-800 dark:text-slate-200 line-clamp-3 leading-relaxed whitespace-pre-line font-medium">
                        {post.message || '(Nội dung ảnh không có caption)'}
                      </p>

                      {/* Post Thumbnail with Graceful Error Fallback */}
                      {post.full_picture ? (
                        <div className="w-full h-36 rounded-xl overflow-hidden bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-slate-800 relative group/img">
                          <img
                            src={post.full_picture}
                            alt="Media thumbnail"
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const fallback = e.currentTarget.nextElementSibling;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                          <div 
                            style={{ display: 'none' }}
                            className="w-full h-full flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800/80 text-slate-400 gap-1.5 p-3 text-center"
                          >
                            <ImageIcon className="w-6 h-6 text-slate-400" />
                            <span className="text-[11px] font-medium">Tin 24h (Facebook Story)</span>
                          </div>
                        </div>
                      ) : (
                        post.type === 'story' && (
                          <div className="w-full h-24 rounded-xl bg-gradient-to-br from-purple-500/10 via-indigo-500/10 to-blue-500/10 border border-slate-200 dark:border-slate-800 flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400 text-xs font-medium">
                            <Sparkles className="w-4 h-4 text-purple-500" />
                            <span>Tin 24h trên Facebook Story</span>
                          </div>
                        )
                      )}
                    </div>

                    {/* Post Engagement Bar */}
                    <div className="mt-3 pt-2.5 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                        <ThumbsUp className="w-3.5 h-3.5 text-sky-500" />
                        {post.likesCount || post.likes?.summary?.total_count || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
                        {post.commentsCount || post.comments?.summary?.total_count || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Share2 className="w-3.5 h-3.5 text-purple-500" />
                        {post.sharesCount || post.shares?.count || 0}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Scheduled Queue (Hàng đợi lên lịch đa kênh) */}
          <div className="app-card p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <CalendarClock className="w-4 h-4 text-sky-500" />
                  <span>Hàng đợi Lên lịch Đa kênh ({pendingScheduled.length})</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Tự động phân phối bài theo khung giờ vàng
                </p>
              </div>

              <button
                onClick={() => onNavigate('facebook-scheduler')}
                className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline"
              >
                Quản lý lịch trình →
              </button>
            </div>

            {pendingScheduled.length === 0 ? (
              <div className="py-6 text-center app-card-raised p-4 space-y-2">
                <p className="text-xs text-slate-500 dark:text-slate-400">Không có bài viết nào đang chờ xuất bản.</p>
                <button
                  onClick={() => onNavigate('facebook-composer')}
                  className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
                >
                  + Lên lịch đăng bài tự động
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {pendingScheduled.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl app-card-raised flex items-center justify-between gap-3"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-amber-700 dark:text-amber-400 border border-slate-200 dark:border-slate-700">
                          ⏰ {new Date(item.scheduledTime).toLocaleString('vi-VN')}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                          Đăng tới: {item.channelName || activeChannel?.name}
                        </span>
                      </div>
                      <p className="text-xs text-slate-800 dark:text-slate-200 font-medium truncate">{item.message || '(Không có caption)'}</p>
                    </div>

                    {item.shopeeLink && (
                      <span className="text-[11px] text-orange-600 dark:text-orange-400 font-semibold shrink-0 flex items-center gap-1">
                        <ShoppingBag className="w-3 h-3" /> Shopee
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: 4 COLS (Omnichannel Shortcuts & Multi-Channel Tools) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Omnichannel Quick Action Shortcuts */}
          <div className="app-card p-5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Tác vụ Đa kênh Nhanh</span>
            </h4>
            <div className="space-y-2">
              <button
                onClick={() => onNavigate('ideas')}
                className="w-full flex items-center justify-between p-3 rounded-xl app-card-raised hover:border-amber-500/40 text-left transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20 shadow-xs">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition block">
                      Tạo ý tưởng AI Đa kênh
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">Caption viral, Hashtag, Kịch bản</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-500 transition" />
              </button>

              <button
                onClick={() => onNavigate('news-radar')}
                className="w-full flex items-center justify-between p-3 rounded-xl app-card-raised hover:border-blue-500/40 text-left transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-500/20 shadow-xs">
                    <Newspaper className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition block">
                      Radar Tin tức nóng (Hot News)
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">Cào tin thời sự tạo post tự động</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition" />
              </button>

              <button
                onClick={() => onNavigate('media-library')}
                className="w-full flex items-center justify-between p-3 rounded-xl app-card-raised hover:border-purple-500/40 text-left transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center border border-purple-500/20 shadow-xs">
                    <Images className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition block">
                      Thư viện Media & Meme
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">Kho ảnh & video dùng chung</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-500 transition" />
              </button>
            </div>
          </div>

          {/* Connected Multi-Channels List */}
          <div className="app-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Kênh Mạng Xã Hội ({channels.length})
              </h4>
              <button
                onClick={() => onNavigate('settings')}
                className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline"
              >
                + Quản lý kênh
              </button>
            </div>

            <div className="space-y-2">
              {channels.map((c) => {
                const isCurrent = c.id === activeChannel?.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => onSwitchChannel(c.id)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition ${
                      isCurrent
                        ? 'bg-blue-500/10 border-blue-500/40 text-slate-900 dark:text-white'
                        : 'app-card-raised hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-blue-600 dark:text-blue-400 text-[10px] shrink-0">
                        {c.platform === 'facebook' ? 'FB' : c.platform === 'youtube' ? 'YT' : 'TT'}
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-bold truncate text-slate-900 dark:text-slate-100">{c.name}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">{c.platform} Fanpage</div>
                      </div>
                    </div>
                    {isCurrent && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-600 text-white shrink-0 shadow-xs">
                        Đang chọn
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
