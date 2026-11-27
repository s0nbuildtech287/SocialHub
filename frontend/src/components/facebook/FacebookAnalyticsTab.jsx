import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Eye, 
  MessageCircle, 
  Users, 
  ChevronDown, 
  ExternalLink, 
  RefreshCw, 
  Calendar,
  CheckCircle2,
  TrendingUp,
  ArrowUpRight,
  Info,
  Sparkles,
  Image as ImageIcon
} from 'lucide-react';

export default function FacebookAnalyticsTab({ onNavigate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeMetric, setActiveMetric] = useState('views'); // 'views' | 'engagement' | 'followers'
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const fetchAnalytics = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const res = await axios.get('/api/facebook/analytics');
      setData(res.data);
    } catch (err) {
      console.error('Lỗi tải analytics:', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(true);

    // Tự động cập nhật số liệu mới ngầm mỗi 60 giây
    const interval = setInterval(() => {
      fetchAnalytics(false);
    }, 60000);

    // Tự động làm mới khi người dùng chuyển tab và quay lại trang
    const handleFocus = () => {
      fetchAnalytics(false);
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const metrics = data?.metrics || {
    views: 145,
    viewsGrowth: '+100%',
    engagement: 186,
    engagementGrowth: '+100%',
    followers: 5750,
    followersGrowth: '+100%',
    weeklyProgress: 19,
    dateRange: '28 ngày qua: 30 Tháng 10 - 26 Tháng 11'
  };

  const channel = data?.channel || {};
  const posts = data?.posts || [];
  const timeline = data?.timeline28d || [];

  // Chuẩn bị dữ liệu vẽ SVG chart theo tab đang chọn
  const chartHeight = 220;
  const chartWidth = 720;
  
  // Xác định giá trị max theo metric đang chọn
  const maxY = activeMetric === 'followers' ? 6000 : 150;

  const points = timeline.map((d, idx) => {
    const x = (idx / (timeline.length - 1 || 1)) * (chartWidth - 80) + 40;
    const val = d[activeMetric] || 0;
    const y = chartHeight - (val / maxY) * (chartHeight - 40) - 25;
    return { x, y, val, ...d };
  });

  const pathD = points.length > 0
    ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map((p) => `L ${p.x} ${p.y}`).join(' ')
    : '';

  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${chartHeight - 20} L ${points[0].x} ${chartHeight - 20} Z`
    : '';

  const getMetricLabel = () => {
    if (activeMetric === 'views') return 'Lượt xem';
    if (activeMetric === 'engagement') return 'Lượt tương tác';
    return 'Lượt theo dõi';
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn max-w-6xl mx-auto">
      
      {/* 1. Main Facebook Insights Card & Page Status Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Thông tin chi tiết (8 cols) */}
        <div className="lg:col-span-8 app-card p-6 sm:p-7 space-y-6">
          
          {/* Header row: Title & Date dropdown */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Thông tin chi tiết
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Tìm hiểu hiệu quả của Trang.</p>
            </div>

            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition">
                <span>{metrics.dateRange}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
              <button 
                onClick={fetchAnalytics}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
                title="Làm mới"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* 3 Metric Selectable Tabs */}
          <div className="grid grid-cols-3 gap-3">
            
            {/* Tab 1: Lượt xem */}
            <div
              onClick={() => setActiveMetric('views')}
              className={`p-4 rounded-2xl cursor-pointer transition relative ${
                activeMetric === 'views'
                  ? 'border-2 border-blue-500 bg-blue-50/80 dark:bg-blue-500/10 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-2">
                <Eye className="w-4 h-4 text-blue-500" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {metrics.views}
                </span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center">
                  ↑ 100%
                </span>
              </div>
              <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1 mt-1">
                <span>Lượt xem</span>
                <Info className="w-3 h-3 text-slate-400" />
              </div>
            </div>

            {/* Tab 2: Lượt tương tác */}
            <div
              onClick={() => setActiveMetric('engagement')}
              className={`p-4 rounded-2xl cursor-pointer transition relative ${
                activeMetric === 'engagement'
                  ? 'border-2 border-blue-500 bg-blue-50/80 dark:bg-blue-500/10 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-2">
                <MessageCircle className="w-4 h-4 text-blue-500" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {metrics.engagement}
                </span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center">
                  ↑ 100%
                </span>
              </div>
              <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1 mt-1">
                <span>Lượt tương tác</span>
                <Info className="w-3 h-3 text-slate-400" />
              </div>
            </div>

            {/* Tab 3: Lượt theo dõi */}
            <div
              onClick={() => setActiveMetric('followers')}
              className={`p-4 rounded-2xl cursor-pointer transition relative ${
                activeMetric === 'followers'
                  ? 'border-2 border-blue-500 bg-blue-50/80 dark:bg-blue-500/10 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-2">
                <Users className="w-4 h-4 text-blue-500" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {metrics.followers.toLocaleString('vi-VN')}
                </span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center">
                  ↑ 100%
                </span>
              </div>
              <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1 mt-1">
                <span>Lượt theo dõi</span>
                <Info className="w-3 h-3 text-slate-400" />
              </div>
            </div>

          </div>

          {/* SVG Chart Line (Tương thích Dark & Light mode) */}
          <div className="relative pt-4">
            <svg 
              viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
              className="w-full h-56 sm:h-64 overflow-visible"
            >
              <defs>
                <linearGradient id="fbBlueGradientLight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Y-axis Horizontal Grid lines */}
              {[150, 100, 50, 0].map((val, idx) => {
                const y = chartHeight - (val / maxY) * (chartHeight - 40) - 25;
                return (
                  <g key={idx}>
                    <line
                      x1="35"
                      y1={y}
                      x2={chartWidth - 20}
                      y2={y}
                      className="stroke-slate-200 dark:stroke-slate-800"
                      strokeWidth="1"
                    />
                    <text
                      x="25"
                      y={y + 4}
                      textAnchor="end"
                      className="text-[11px] font-bold fill-slate-400 dark:fill-slate-500"
                    >
                      {activeMetric === 'followers' ? Math.round((val / 150) * 6000) : val}
                    </text>
                  </g>
                );
              })}

              {/* Blue Area fill under curve */}
              {areaD && (
                <path d={areaD} fill="url(#fbBlueGradientLight)" />
              )}

              {/* Blue Neon Line */}
              {pathD && (
                <path 
                  d={pathD} 
                  fill="none" 
                  stroke="#3b82f6" 
                  strokeWidth="3.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
              )}

              {/* Data points */}
              {points.map((p, idx) => {
                const isHovered = hoveredPoint?.date === p.date;
                return (
                  <g key={idx}>
                    {p.val > 0 && (
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={isHovered ? 6 : 4.5}
                        className="fill-blue-500 stroke-white dark:stroke-slate-900 cursor-pointer transition-all"
                        strokeWidth="2.5"
                        onMouseEnter={() => setHoveredPoint(p)}
                        onMouseLeave={() => setHoveredPoint(null)}
                      />
                    )}
                  </g>
                );
              })}

              {/* X-axis date labels */}
              {points.filter((_, i) => i % 2 === 0 || i === points.length - 1).map((p, idx) => (
                <text
                  key={idx}
                  x={p.x}
                  y={chartHeight}
                  textAnchor="middle"
                  className="text-[10px] sm:text-[11px] font-bold fill-slate-500 dark:fill-slate-400"
                >
                  {p.date}
                </text>
              ))}
            </svg>

            {/* Hover Tooltip */}
            {hoveredPoint && (
              <div 
                className="absolute top-0 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-slate-950 text-white px-3 py-1.5 rounded-xl border border-slate-700 shadow-2xl text-xs flex items-center gap-2 pointer-events-none z-20 animate-fadeIn"
              >
                <span className="text-slate-400">{hoveredPoint.date}:</span>
                <span className="font-bold text-blue-400">
                  {hoveredPoint.val} {getMetricLabel()}
                </span>
              </div>
            )}
          </div>

        </div>

        {/* Right: Trạng thái Trang (4 cols) */}
        <div className="lg:col-span-4 app-card p-6 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Trạng thái Trang
            </h3>

            {/* Page Profile Row */}
            <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <div className="relative">
                {channel.avatar ? (
                  <img
                    src={channel.avatar}
                    alt={channel.name}
                    className="w-12 h-12 rounded-full object-cover border border-blue-500"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center font-black text-white text-lg">
                    G
                  </div>
                )}
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center border-2 border-white dark:border-slate-900">
                  <CheckCircle2 className="w-3 h-3 stroke-[3]" />
                </div>
              </div>

              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  {channel.name || 'Góc Tăng Ca'}
                </h4>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <span>Tiến độ hàng tuần:</span>
                  <span className="font-bold text-amber-500">{metrics.weeklyProgress}%</span>
                  <span className="inline-block w-2.5 h-2.5 rounded-full border border-amber-500 border-t-transparent animate-spin" />
                </div>
              </div>
            </div>

            {/* Quick Insights List */}
            <div className="space-y-3 pt-2 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Sức khỏe trang:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">Tuyệt vời (100%)</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Lượt theo dõi:</span>
                <span className="font-bold text-slate-900 dark:text-white">{metrics.followers.toLocaleString('vi-VN')}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Đang phân phối:</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">Bình thường</span>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => onNavigate('facebook-composer')}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition"
            >
              + Đăng bài kéo tương tác
            </button>
          </div>
        </div>

      </div>

      {/* 2. Nội dung (Bài viết đã đăng) */}
      <div className="app-card p-6 sm:p-7 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Nội dung</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Truy cập vào bài viết đã đăng và đã lên lịch cũng như tạo nội dung mới, tất cả ở cùng một nơi.
            </p>
          </div>
          <span 
            onClick={() => onNavigate('facebook-composer')}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
          >
            Tạo bài mới
          </span>
        </div>

        {posts.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400">
            Chưa có bài viết nào được ghi nhận.
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div 
                key={post.id}
                className="app-card-raised p-4 sm:p-5 flex flex-col sm:flex-row items-start gap-4 hover:border-blue-500/40 transition"
              >
                {/* Image */}
                {post.full_picture ? (
                  <div className="w-full sm:w-28 h-28 rounded-xl overflow-hidden bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-slate-800 shrink-0 relative group">
                    <img 
                      src={post.full_picture} 
                      alt="Thumbnail bài viết" 
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300" 
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget.nextElementSibling;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                    <div 
                      style={{ display: 'none' }}
                      className="w-full h-full flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-400 gap-1 p-2 text-center"
                    >
                      <ImageIcon className="w-5 h-5 text-slate-400" />
                      <span className="text-[10px] font-medium">Story 24h</span>
                    </div>
                  </div>
                ) : (
                  post.type === 'story' && (
                    <div className="w-full sm:w-28 h-28 rounded-xl bg-purple-500/10 border border-purple-500/20 shrink-0 flex flex-col items-center justify-center text-purple-500 gap-1 p-2 text-center">
                      <Sparkles className="w-5 h-5 text-purple-500" />
                      <span className="text-[10px] font-bold">Story 24h</span>
                    </div>
                  )
                )}

                {/* Details */}
                <div className="flex-1 space-y-2 min-w-0">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(post.created_time).toLocaleString('vi-VN')}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      post.type === 'story'
                        ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                        : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {post.typeLabel || 'Bài viết'}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-900 dark:text-slate-100 line-clamp-3 font-normal whitespace-pre-line leading-relaxed">
                    {post.message || '(Tin dạng ảnh 24h)'}
                  </p>

                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/60 dark:border-slate-800/80">
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-300 font-semibold">
                      <span>Lượt xem: <b>{post.views || 0}</b></span>
                      <span>Lượt tương tác: <b className="text-blue-600 dark:text-blue-400 font-bold">{post.engagement || post.likesCount || 0}</b></span>
                      <span>Bình luận: <b>{post.commentsCount || 0}</b></span>
                      <span>Chia sẻ: <b>{post.sharesCount || 0}</b></span>
                    </div>

                    {post.permalink_url && (
                      <a
                        href={post.permalink_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        <span>Xem trên Facebook</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
}
