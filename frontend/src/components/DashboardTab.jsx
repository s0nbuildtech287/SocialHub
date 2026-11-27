import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Users, 
  Send, 
  Sparkles, 
  ShoppingBag, 
  ThumbsUp, 
  MessageCircle, 
  Share2, 
  ExternalLink,
  RefreshCw,
  Clock,
  Layers,
  Youtube,
  Tv
} from 'lucide-react';

export default function DashboardTab({ status, onNavigate }) {
  const [postsData, setPostsData] = useState({ fbPosts: [], localPosts: [] });
  const [loading, setLoading] = useState(true);

  const activeChannel = status?.activeChannel;
  const channelData = status?.channelData;

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/posts');
      setPostsData(res.data);
    } catch (err) {
      console.error('Lỗi lấy bài viết:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [activeChannel?.id]);

  const totalLocalPosts = postsData.localPosts?.length || 0;
  const totalShopeeLinks = postsData.localPosts?.filter((p) => p.hasShopeeComment)?.length || 0;

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      
      {/* Hero Welcome banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-slate-900 border border-amber-500/20 p-6 sm:p-8">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30">
              ⚡ Trung tâm điều hành Đa Kênh (SocialHub)
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Đang quản lý: {activeChannel?.name || 'Chưa chọn kênh'}
            </h2>
            <p className="text-slate-400 text-sm max-w-xl">
              Nền tảng hỗ trợ scale đa kênh, quản lý nhiều Fanpage cùng lúc, tự động hoá nội dung AI và tiếp thị liên kết Shopee chống bóp tương tác.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('ideas')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold border border-slate-700 transition"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              Tạo ý tưởng AI
            </button>
            <button
              onClick={() => onNavigate('composer')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-bold shadow-lg shadow-amber-500/20 transition scale-100 hover:scale-[1.02]"
            >
              <Send className="w-4 h-4 text-slate-950" />
              Soạn bài đăng
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Người theo dõi</span>
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-white">
            {channelData?.followers_count || channelData?.fan_count || 0}
          </div>
          <div className="mt-1 text-xs text-slate-500">Trên kênh hiện tại</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Bài đã đăng qua Hub</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Send className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-white">
            {totalLocalPosts}
          </div>
          <div className="mt-1 text-xs text-slate-500">Tự động xuất bản</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Link Shopee Affiliate</span>
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-white">
            {totalShopeeLinks}
          </div>
          <div className="mt-1 text-xs text-slate-500">Bình luận đầu tự động</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Tổng số Kênh kết nối</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-purple-400">
            {status?.channels?.length || 1}
          </div>
          <div className="mt-1 text-xs text-slate-500">Fanpage & Kênh mxh</div>
        </div>
      </div>

      {/* Multi-Platform Ecosystem Status */}
      <div className="rounded-3xl bg-slate-900/40 border border-slate-800 p-6">
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">
          Hệ sinh thái nền tảng hỗ trợ
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">f</div>
              <div>
                <h4 className="text-xs font-bold text-white">Facebook Fanpages</h4>
                <p className="text-[11px] text-blue-300">Đăng bài, Reels, Ghim cmt</p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">Đang bật</span>
          </div>

          <div className="p-4 rounded-2xl bg-red-500/5 border border-slate-800 flex items-center justify-between opacity-80">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center"><Youtube className="w-4 h-4" /></div>
              <div>
                <h4 className="text-xs font-bold text-white">YouTube Shorts</h4>
                <p className="text-[11px] text-slate-400">Auto upload & SEO</p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">Sẵn sàng tích hợp</span>
          </div>

          <div className="p-4 rounded-2xl bg-pink-500/5 border border-slate-800 flex items-center justify-between opacity-80">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center font-bold">TikTok</div>
              <div>
                <h4 className="text-xs font-bold text-white">TikTok Content</h4>
                <p className="text-[11px] text-slate-400">Video & Trend Audio</p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">Sẵn sàng tích hợp</span>
          </div>
        </div>
      </div>

      {/* Feed section */}
      <div className="rounded-3xl bg-slate-900/60 border border-slate-800 p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">
              Bài viết gần đây ({activeChannel?.name})
            </h3>
            <p className="text-xs text-slate-400">Dữ liệu trực tiếp từ nguồn cấp dữ liệu mạng xã hội</p>
          </div>
          <button
            onClick={fetchPosts}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-500 text-sm">
            Đang tải dữ liệu bài viết...
          </div>
        ) : postsData.fbPosts.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-500 mx-auto flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <p className="text-slate-400 text-sm">Chưa có bài viết nào trên kênh này.</p>
            <button
              onClick={() => onNavigate('composer')}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300"
            >
              Đăng bài viết đầu tiên ngay →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {postsData.fbPosts.map((post) => (
              <div 
                key={post.id}
                className="rounded-2xl bg-slate-800/40 border border-slate-700/60 p-4 flex flex-col justify-between hover:border-slate-600 transition"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>{new Date(post.created_time).toLocaleString('vi-VN')}</span>
                    {post.permalink_url && (
                      <a
                        href={post.permalink_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-amber-400 hover:underline"
                      >
                        Xem bài gốc <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  <p className="text-sm text-slate-200 line-clamp-3 whitespace-pre-line">
                    {post.message || '(Bài viết ảnh không có caption)'}
                  </p>

                  {post.full_picture && (
                    <img
                      src={post.full_picture}
                      alt="Thumbnail"
                      className="w-full h-44 object-cover rounded-xl border border-slate-700"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center gap-6 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <ThumbsUp className="w-3.5 h-3.5 text-sky-400" />
                    {post.likes?.summary?.total_count || 0}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                    {post.comments?.summary?.total_count || 0}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Share2 className="w-3.5 h-3.5 text-purple-400" />
                    {post.shares?.count || 0}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
