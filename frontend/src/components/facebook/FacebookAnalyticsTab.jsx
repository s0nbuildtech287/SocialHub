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
  Image as ImageIcon,
  Film,
  FileText,
  Layers,
  Flame,
  Filter,
  Clock,
  CalendarDays
} from 'lucide-react';

export default function FacebookAnalyticsTab({ onNavigate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeMetric, setActiveMetric] = useState('views'); // 'views' | 'engagement' | 'followers'
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Quản lý bộ lọc loại nội dung & ngày năng suất
  const [selectedContentType, setSelectedContentType] = useState('all'); // 'all' | 'post' | 'story' | 'reel'
  const [dateFilterMode, setDateFilterMode] = useState('all'); // 'all' | 'today' | '7days' | '28days' | 'custom'
  const [customDate, setCustomDate] = useState('');
  const [groupByDay, setGroupByDay] = useState(true);

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
    views: 160,
    viewsGrowth: '+100%',
    engagement: 186,
    engagementGrowth: '+100%',
    followers: 4141,
    followersGrowth: '+100%',
    weeklyProgress: 19,
    dateRange: '28 ngày qua'
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

  const allPosts = posts || [];
  const postCounts = {
    all: allPosts.length,
    post: allPosts.filter(p => p.type === 'post').length,
    story: allPosts.filter(p => p.type === 'story').length,
    reel: allPosts.filter(p => p.type === 'reel').length,
  };

  const now = new Date();
  const filteredPosts = allPosts.filter(p => {
    if (selectedContentType !== 'all' && p.type !== selectedContentType) {
      return false;
    }
    if (!p.created_time) return true;
    const pDate = new Date(p.created_time);
    if (dateFilterMode === 'today') {
      return pDate.toDateString() === now.toDateString();
    }
    if (dateFilterMode === 'yesterday') {
      const y = new Date();
      y.setDate(now.getDate() - 1);
      return pDate.toDateString() === y.toDateString();
    }
    if (dateFilterMode === '7days') {
      const d7 = new Date();
      d7.setDate(now.getDate() - 7);
      return pDate >= d7;
    }
    if (dateFilterMode === '28days') {
      const d28 = new Date();
      d28.setDate(now.getDate() - 28);
      return pDate >= d28;
    }
    if (dateFilterMode === 'custom' && customDate) {
      const pDateStr = pDate.toISOString().split('T')[0];
      return pDateStr === customDate;
    }
    return true;
  });

  // Gom nhóm theo ngày
  const groupedByDate = filteredPosts.reduce((acc, post) => {
    const d = new Date(post.created_time);
    const dateKey = d.toLocaleDateString('vi-VN', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    if (!acc[dateKey]) {
      acc[dateKey] = {
        dateStr: dateKey,
        rawDate: d,
        items: []
      };
    }
    acc[dateKey].items.push(post);
    return acc;
  }, {});

  const groupedDaysList = Object.values(groupedByDate).sort((a, b) => b.rawDate - a.rawDate);

  // Thống kê năng suất ngày
  const uniqueActiveDays = new Set(allPosts.map(p => new Date(p.created_time).toDateString())).size;
  const avgPerDay = uniqueActiveDays > 0 ? (allPosts.length / uniqueActiveDays).toFixed(1) : 0;

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

      {/* 2. Nội dung (Bài viết, Story 24h & Reels chia theo định dạng và theo ngày) */}
      <div className="app-card p-6 sm:p-7 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Nội dung đã xuất bản</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-black bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                {postCounts.all} nội dung
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Quản lý chi tiết bài viết, tin 24h story và thước phim reels theo ngày để theo dõi năng suất đăng đều đặn.
            </p>
          </div>
          <button 
            onClick={() => onNavigate('facebook-composer')}
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm transition cursor-pointer self-start sm:self-auto"
          >
            + Tạo bài mới
          </button>
        </div>

        {/* THANH ĐO NĂNG SUẤT ĐĂNG ĐỀU ĐẶN */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-emerald-500/10 border border-blue-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Tổng nội dung đã đăng</div>
              <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                {postCounts.all} <span className="text-[11px] font-normal text-slate-500">mục</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shrink-0">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Số ngày có xuất bản</div>
              <div className="text-base sm:text-lg font-black text-amber-600 dark:text-amber-400">
                {uniqueActiveDays} ngày <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">({avgPerDay} mục/ngày)</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Độ đều đặn xuất bản</div>
              <div className="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <span>Rất tích cực & đều đặn 🔥</span>
              </div>
            </div>
          </div>
        </div>

        {/* TAB CHỌN ĐỊNH DẠNG NỘI DUNG */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <button
            onClick={() => setSelectedContentType('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              selectedContentType === 'all'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Tất cả</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 text-white font-black">{postCounts.all}</span>
          </button>

          <button
            onClick={() => setSelectedContentType('post')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              selectedContentType === 'post'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>📝 Bài viết</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 text-white font-black">{postCounts.post}</span>
          </button>

          <button
            onClick={() => setSelectedContentType('story')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              selectedContentType === 'story'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>⚡ Tin 24h Story</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 text-white font-black">{postCounts.story}</span>
          </button>

          <button
            onClick={() => setSelectedContentType('reel')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              selectedContentType === 'reel'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>🎬 Thước phim Reel</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 text-white font-black">{postCounts.reel}</span>
          </button>
        </div>

        {/* BỘ LỌC THỜI GIAN & CHẾ ĐỘ HIỂN THỊ */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1 mr-1">
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Lọc theo ngày:</span>
            </span>

            {[
              { id: 'all', label: 'Tất cả ngày' },
              { id: 'today', label: 'Hôm nay' },
              { id: '7days', label: '7 ngày qua' },
              { id: '28days', label: '28 ngày qua' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => {
                  setDateFilterMode(f.id);
                  setCustomDate('');
                }}
                className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                  dateFilterMode === f.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {f.label}
              </button>
            ))}

            {/* Custom Date Picker */}
            <input
              type="date"
              value={customDate}
              onChange={(e) => {
                setCustomDate(e.target.value);
                setDateFilterMode('custom');
              }}
              className="px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-medium text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
              title="Chọn ngày cụ thể"
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => setGroupByDay(!groupByDay)}
              className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition cursor-pointer border ${
                groupByDay
                  ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-800'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Gom theo từng ngày</span>
              <span className={`w-2 h-2 rounded-full ${groupByDay ? 'bg-blue-500' : 'bg-slate-400'}`} />
            </button>
          </div>
        </div>

        {/* DANH SÁCH BÀI VIẾT THEO NGÀY */}
        {filteredPosts.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400">
            Không tìm thấy nội dung nào trong khung thời gian hoặc phân loại đã chọn.
          </div>
        ) : groupByDay ? (
          /* HIỂN THỊ GOM NHÓM THEO TỪNG NGÀY (THEO DÕI NĂNG SUẤT ĐỀU ĐẶN) */
          <div className="space-y-6">
            {groupedDaysList.map((group) => {
              const dayPostsCount = group.items.filter(p => p.type === 'post').length;
              const dayStoriesCount = group.items.filter(p => p.type === 'story').length;
              const dayReelsCount = group.items.filter(p => p.type === 'reel').length;

              return (
                <div key={group.dateStr} className="space-y-3">
                  {/* Header ngày & thống kê năng suất của ngày đó */}
                  <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-500 shrink-0" />
                      <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white capitalize">
                        {group.dateStr}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        Năng suất ngày: <b>{group.items.length} nội dung</b>
                      </span>

                      <div className="flex items-center gap-1">
                        {dayPostsCount > 0 && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            {dayPostsCount} bài
                          </span>
                        )}
                        {dayStoriesCount > 0 && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400">
                            {dayStoriesCount} story
                          </span>
                        )}
                        {dayReelsCount > 0 && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400">
                            {dayReelsCount} reel
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Danh sách các bài đăng trong ngày */}
                  <div className="space-y-3 pl-2 sm:pl-3 border-l-2 border-blue-500/30">
                    {group.items.map((post) => (
                      <div 
                        key={post.id}
                        className="app-card-raised p-4 sm:p-5 flex flex-col sm:flex-row items-start gap-4 hover:border-blue-500/40 transition"
                      >
                        {/* Image / Video Thumbnail */}
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
                              {post.type === 'story' ? (
                                <Sparkles className="w-5 h-5 text-purple-400" />
                              ) : post.type === 'reel' ? (
                                <Film className="w-5 h-5 text-rose-400" />
                              ) : (
                                <ImageIcon className="w-5 h-5 text-slate-400" />
                              )}
                              <span className="text-[10px] font-medium">{post.typeLabel || 'Nội dung'}</span>
                            </div>
                          </div>
                        ) : post.type === 'story' ? (
                          <div className="w-full sm:w-28 h-28 rounded-xl bg-purple-500/10 border border-purple-500/20 shrink-0 flex flex-col items-center justify-center text-purple-500 gap-1 p-2 text-center">
                            <Sparkles className="w-5 h-5 text-purple-500" />
                            <span className="text-[10px] font-bold">Tin 24h Story</span>
                          </div>
                        ) : post.type === 'reel' ? (
                          <div className="w-full sm:w-28 h-28 rounded-xl bg-rose-500/10 border border-rose-500/20 shrink-0 flex flex-col items-center justify-center text-rose-500 gap-1 p-2 text-center">
                            <Film className="w-5 h-5 text-rose-500" />
                            <span className="text-[10px] font-bold">Thước phim Reel</span>
                          </div>
                        ) : (
                          <div className="w-full sm:w-28 h-28 rounded-xl bg-blue-500/10 border border-blue-500/20 shrink-0 flex flex-col items-center justify-center text-blue-500 gap-1 p-2 text-center">
                            <FileText className="w-5 h-5 text-blue-500" />
                            <span className="text-[10px] font-bold">Bài viết Text</span>
                          </div>
                        )}

                        {/* Details */}
                        <div className="flex-1 space-y-2 min-w-0">
                          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1.5 font-medium">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              {new Date(post.created_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black flex items-center gap-1 ${
                              post.type === 'story'
                                ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30'
                                : post.type === 'reel'
                                ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                                : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                            }`}>
                              {post.type === 'story' && <Sparkles className="w-3 h-3" />}
                              {post.type === 'reel' && <Film className="w-3 h-3" />}
                              {post.type === 'post' && <FileText className="w-3 h-3" />}
                              <span>{post.typeLabel || (post.type === 'story' ? 'Tin 24h Story' : post.type === 'reel' ? 'Thước phim Reel' : 'Bài viết')}</span>
                            </span>
                          </div>

                          <p className="text-xs sm:text-sm text-slate-900 dark:text-slate-100 line-clamp-3 font-normal whitespace-pre-line leading-relaxed">
                            {post.message || (post.type === 'story' ? '(Tin dạng ảnh 24h trên Facebook Story)' : post.type === 'reel' ? '(Thước phim ngắn Facebook Reel)' : '(Bài viết đăng tải)')}
                          </p>

                          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/60 dark:border-slate-800/80">
                            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-slate-600 dark:text-slate-300 font-semibold">
                              <span>Lượt xem: <b>{post.views || 0}</b></span>
                              <span>Thích: <b className="text-blue-600 dark:text-blue-400 font-bold">{post.likesCount || 0}</b></span>
                              <span>Bình luận: <b>{post.commentsCount || 0}</b></span>
                              <span>Chia sẻ: <b>{post.sharesCount || 0}</b></span>
                              <span>Lượt tương tác: <b className="text-emerald-600 dark:text-emerald-400 font-bold">{post.engagement || post.likesCount || 0}</b></span>
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
                </div>
              );
            })}
          </div>
        ) : (
          /* HIỂN THỊ DANH SÁCH PHẲNG LIÊN TỤC */
          <div className="space-y-4">
            {filteredPosts.map((post) => (
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
                      {post.type === 'story' ? (
                        <Sparkles className="w-5 h-5 text-purple-400" />
                      ) : post.type === 'reel' ? (
                        <Film className="w-5 h-5 text-rose-400" />
                      ) : (
                        <ImageIcon className="w-5 h-5 text-slate-400" />
                      )}
                      <span className="text-[10px] font-medium">{post.typeLabel || 'Nội dung'}</span>
                    </div>
                  </div>
                ) : post.type === 'story' ? (
                  <div className="w-full sm:w-28 h-28 rounded-xl bg-purple-500/10 border border-purple-500/20 shrink-0 flex flex-col items-center justify-center text-purple-500 gap-1 p-2 text-center">
                    <Sparkles className="w-5 h-5 text-purple-500" />
                    <span className="text-[10px] font-bold">Tin 24h Story</span>
                  </div>
                ) : post.type === 'reel' ? (
                  <div className="w-full sm:w-28 h-28 rounded-xl bg-rose-500/10 border border-rose-500/20 shrink-0 flex flex-col items-center justify-center text-rose-500 gap-1 p-2 text-center">
                    <Film className="w-5 h-5 text-rose-500" />
                    <span className="text-[10px] font-bold">Thước phim Reel</span>
                  </div>
                ) : (
                  <div className="w-full sm:w-28 h-28 rounded-xl bg-blue-500/10 border border-blue-500/20 shrink-0 flex flex-col items-center justify-center text-blue-500 gap-1 p-2 text-center">
                    <FileText className="w-5 h-5 text-blue-500" />
                    <span className="text-[10px] font-bold">Bài viết Text</span>
                  </div>
                )}

                {/* Details */}
                <div className="flex-1 space-y-2 min-w-0">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(post.created_time).toLocaleString('vi-VN')}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black flex items-center gap-1 ${
                      post.type === 'story'
                        ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30'
                        : post.type === 'reel'
                        ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                        : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                    }`}>
                      {post.type === 'story' && <Sparkles className="w-3 h-3" />}
                      {post.type === 'reel' && <Film className="w-3 h-3" />}
                      {post.type === 'post' && <FileText className="w-3 h-3" />}
                      <span>{post.typeLabel || (post.type === 'story' ? 'Tin 24h Story' : post.type === 'reel' ? 'Thước phim Reel' : 'Bài viết')}</span>
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-900 dark:text-slate-100 line-clamp-3 font-normal whitespace-pre-line leading-relaxed">
                    {post.message || (post.type === 'story' ? '(Tin dạng ảnh 24h trên Facebook Story)' : post.type === 'reel' ? '(Thước phim ngắn Facebook Reel)' : '(Bài viết đăng tải)')}
                  </p>

                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/60 dark:border-slate-800/80">
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-slate-600 dark:text-slate-300 font-semibold">
                      <span>Lượt xem: <b>{post.views || 0}</b></span>
                      <span>Thích: <b className="text-blue-600 dark:text-blue-400 font-bold">{post.likesCount || 0}</b></span>
                      <span>Bình luận: <b>{post.commentsCount || 0}</b></span>
                      <span>Chia sẻ: <b>{post.sharesCount || 0}</b></span>
                      <span>Lượt tương tác: <b className="text-emerald-600 dark:text-emerald-400 font-bold">{post.engagement || post.likesCount || 0}</b></span>
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
