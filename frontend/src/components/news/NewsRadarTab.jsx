import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Newspaper, 
  Sparkles, 
  ExternalLink, 
  Send, 
  RefreshCw, 
  Link as LinkIcon, 
  Clock, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle,
  Copy,
  Zap,
  FileText,
  HelpCircle,
  Eye,
  Flame,
  Activity,
  TrendingUp,
  Search
} from 'lucide-react';
import { useToast } from '../common/Toast';

export default function NewsRadarTab({ onUseNews }) {
  const { addToast } = useToast();
  
  // Nguồn tin RSS
  const [sources, setSources] = useState([]);
  const [activeSource, setActiveSource] = useState('cafebiz');
  const [newsItems, setNewsItems] = useState([]);
  const [loadingNews, setLoadingNews] = useState(false);

  // Scraper Mode: 'url' (Link báo/web) | 'text' (Dán text FB) | 'spy' (Spy Fanpage đối thủ)
  const [inputMode, setInputMode] = useState('url');
  
  // Form Dán Link
  const [urlInput, setUrlInput] = useState('');
  
  // Form Dán Text
  const [rawText, setRawText] = useState('');
  const [rawTitle, setRawTitle] = useState('');

  // Form Spy Fanpage
  const [spyUrl, setSpyUrl] = useState('https://www.facebook.com/Theanh28/');
  const [spying, setSpying] = useState(false);
  const [spyResult, setSpyResult] = useState(null);
  
  const [scraping, setScraping] = useState(false);
  const [scrapedResult, setScrapedResult] = useState(null);

  // Trạng thái AI đang xào bài từ 1 item trong danh sách
  const [rewritingId, setRewritingId] = useState(null);

  // Load danh sách nguồn báo
  useEffect(() => {
    axios.get('/api/news/sources')
      .then((res) => {
        setSources(res.data.sources || []);
      })
      .catch((err) => console.error('Lỗi lấy nguồn tin:', err));
  }, []);

  // Load tin tức theo nguồn
  const fetchFeed = async (sourceId) => {
    setLoadingNews(true);
    try {
      const res = await axios.get(`/api/news/feed?source=${sourceId}&limit=12`);
      setNewsItems(res.data.items || []);
    } catch (err) {
      console.error('Lỗi tải tin tức:', err);
      addToast({ message: 'Không thể tải tin tức từ nguồn này', type: 'error' });
    } finally {
      setLoadingNews(false);
    }
  };

  useEffect(() => {
    fetchFeed(activeSource);
  }, [activeSource]);

  // Xử lý cào bài từ URL bất kỳ và xào luôn bằng AI
  const handleScrapeAndRewrite = async (e) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    setScraping(true);
    setScrapedResult(null);

    try {
      const scrapeRes = await axios.post('/api/news/scrape', { url: urlInput.trim() });
      const article = scrapeRes.data.article;

      const rewriteRes = await axios.post('/api/news/rewrite', {
        title: article.title,
        description: article.description,
        fullText: article.fullText
      });

      setScrapedResult({
        original: article,
        caption: rewriteRes.data.caption
      });

      addToast({ message: 'Đã cào dữ liệu và tạo bài viết AI thành công!', type: 'success' });
    } catch (err) {
      addToast({ 
        message: err.response?.data?.error || 'Lỗi khi cào dữ liệu từ trang này', 
        type: 'error' 
      });
    } finally {
      setScraping(false);
    }
  };

  // Xử lý xào bài trực tiếp từ đoạn text copy được
  const handleRewriteRawText = async (e) => {
    e.preventDefault();
    if (!rawText.trim()) return;

    setScraping(true);
    setScrapedResult(null);

    try {
      const rewriteRes = await axios.post('/api/news/rewrite', {
        title: rawTitle.trim() || 'Chuyện công sở & Đời sống',
        description: rawText.slice(0, 150),
        fullText: rawText
      });

      setScrapedResult({
        original: {
          title: rawTitle.trim() || 'Nội dung dán trực tiếp',
          description: rawText.slice(0, 100),
          image: null
        },
        caption: rewriteRes.data.caption
      });

      addToast({ message: 'AI đã xào lại bài viết thành công!', type: 'success' });
    } catch (err) {
      addToast({ message: 'Lỗi khi xử lý bài viết', type: 'error' });
    } finally {
      setScraping(false);
    }
  };

  // Xử lý Spy Fanpage đối thủ
  const handleSpyFacebook = async (e) => {
    if (e) e.preventDefault();
    if (!spyUrl.trim()) return;

    setSpying(true);
    setSpyResult(null);

    try {
      const res = await axios.post('/api/news/spy-facebook', {
        pageUrl: spyUrl.trim(),
        maxScrolls: 6
      });
      setSpyResult(res.data);
      addToast({ 
        message: `Đã quét xong: Phát hiện ${res.data.todayCount} bài viết hôm nay!`, 
        type: 'success' 
      });
    } catch (err) {
      addToast({ 
        message: err.response?.data?.error || 'Không thể quét dữ liệu từ Fanpage này', 
        type: 'error' 
      });
    } finally {
      setSpying(false);
    }
  };

  // Xử lý xào bài 1-chạm từ danh sách tin tức có sẵn
  const handleRewriteFeedItem = async (item) => {
    setRewritingId(item.id);
    try {
      const res = await axios.post('/api/news/rewrite', {
        title: item.title,
        description: item.description,
        fullText: item.description
      });

      addToast({ message: 'AI đã tạo bài viết xong! Đang chuyển sang Soạn bài...', type: 'success' });
      
      onUseNews({
        caption: res.data.caption,
        photoUrl: item.image,
        sourceUrl: item.link
      });
    } catch (err) {
      addToast({ message: 'Không thể xào bài viết này', type: 'error' });
    } finally {
      setRewritingId(null);
    }
  };

  // Đưa bài viết đã xào sang trang Soạn bài
  const handleApplyScraped = () => {
    if (!scrapedResult) return;
    onUseNews({
      caption: scrapedResult.caption,
      photoUrl: scrapedResult.original?.image,
      sourceUrl: scrapedResult.original?.url
    });
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      
      {/* 1. Header Banner */}
      <div className="app-card p-6 sm:p-8 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 relative z-10 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-orange-500/10 text-orange-500">
              <Newspaper className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-orange-500">
              Radar Tin Tức & Spy Fanpage
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Tin Tức & Bắt Trend Tự Động
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Quét tin tức tự động từ CafeBiz, GenK, VnExpress hoặc chạy bot Chrome ngầm để <b>Spy tần suất đăng bài của Theanh28, Beatvn</b> và dùng Gemini AI "xào" thành bài đăng riêng.
          </p>
        </div>

        <div className="flex items-center gap-2 relative z-10 shrink-0">
          <button
            onClick={() => fetchFeed(activeSource)}
            disabled={loadingNews}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingNews ? 'animate-spin' : ''}`} />
            <span>Làm mới tin</span>
          </button>
        </div>
      </div>

      {/* 2. Hộp Công cụ Đa năng (3 Tabs: Link báo, Text FB, Spy Fanpage) */}
      <div className="app-card p-6 sm:p-7 space-y-5 border-l-4 border-l-amber-500">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800/80 pb-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Công cụ Thu thập & Xào bài Thông minh
            </h3>
          </div>

          {/* Mode Switcher 3 Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold overflow-x-auto">
            <button
              type="button"
              onClick={() => setInputMode('url')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 shrink-0 ${
                inputMode === 'url'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>Dán Link Báo/Web</span>
            </button>
            <button
              type="button"
              onClick={() => setInputMode('text')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 shrink-0 ${
                inputMode === 'text'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Dán Text từ Facebook</span>
            </button>
            <button
              type="button"
              onClick={() => setInputMode('spy')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 shrink-0 ${
                inputMode === 'spy'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5 text-amber-500" />
              <span>🕵️ Spy Fanpage Đối Thủ</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Dán Link Báo/Web */}
        {inputMode === 'url' && (
          <form onSubmit={handleScrapeAndRewrite} className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <LinkIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="url"
                  required
                  placeholder="Dán link bài báo vào đây (VD: https://cafebiz.vn/... hoặc https://genk.vn/...)"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>
              <button
                type="submit"
                disabled={scraping}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition disabled:opacity-50 shrink-0"
              >
                <Sparkles className={`w-4 h-4 ${scraping ? 'animate-spin' : ''}`} />
                <span>{scraping ? 'Đang cào & phân tích...' : 'Cào & Xào bài với AI'}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              💡 Tự động bóc tách bài viết và ảnh minh họa gốc chuẩn kích thước.
            </p>
          </form>
        )}

        {/* Tab 2: Dán Text từ Facebook */}
        {inputMode === 'text' && (
          <form onSubmit={handleRewriteRawText} className="space-y-3">
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Tiêu đề gợi nhớ (không bắt buộc)"
                value={rawTitle}
                onChange={(e) => setRawTitle(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-amber-500"
              />
              <textarea
                rows={4}
                required
                placeholder="Dán nội dung status/bài viết copy từ Facebook hoặc Threads vào đây..."
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-amber-500 leading-relaxed"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                ✨ Gemini AI sẽ viết lại 100% bằng ngôn từ hài hước của Góc Tăng Ca
              </span>
              <button
                type="submit"
                disabled={scraping}
                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition disabled:opacity-50"
              >
                <Sparkles className={`w-4 h-4 ${scraping ? 'animate-spin' : ''}`} />
                <span>{scraping ? 'AI đang viết lại...' : 'Viết lại bằng AI ngay'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: Spy Fanpage Đối Thủ (Bot Chrome) */}
        {inputMode === 'spy' && (
          <form onSubmit={handleSpyFacebook} className="space-y-4">
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Eye className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="url"
                    required
                    placeholder="Dán link Fanpage cần spy (VD: https://www.facebook.com/Theanh28/)"
                    value={spyUrl}
                    onChange={(e) => setSpyUrl(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-amber-500 font-medium"
                  />
                </div>
                <button
                  type="submit"
                  disabled={spying}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition disabled:opacity-50 shrink-0"
                >
                  <Flame className={`w-4 h-4 ${spying ? 'animate-bounce' : ''}`} />
                  <span>{spying ? 'Bot Chrome đang cuộn trang...' : 'Bắt đầu Spy & Đếm bài hôm nay 🕵️'}</span>
                </button>
              </div>

              {/* Nút chọn nhanh */}
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <span className="text-[11px] text-slate-500 font-semibold">Gợi ý nhanh:</span>
                {[
                  { label: 'Theanh28', url: 'https://www.facebook.com/Theanh28/' },
                  { label: 'Beatvn', url: 'https://www.facebook.com/beatvn.network/' },
                  { label: 'Kênh 14', url: 'https://www.facebook.com/K14vn/' },
                  { label: 'VTV24', url: 'https://www.facebook.com/tintucvtv24/' }
                ].map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => { setSpyUrl(p.url); }}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-300 transition"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Dashboard kết quả Spy */}
            {spyResult && (
              <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/30 space-y-4 animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 rounded-xl app-card-raised space-y-1">
                    <span className="text-[11px] text-slate-500 font-semibold">Tên Fanpage theo dõi</span>
                    <div className="text-base font-black text-slate-900 dark:text-white truncate">
                      {spyResult.pageName}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl app-card-raised space-y-1 border-l-2 border-l-amber-500">
                    <span className="text-[11px] text-slate-500 font-semibold">Số bài vừa đăng hôm nay</span>
                    <div className="text-2xl font-black text-amber-500">
                      ~{spyResult.todayCount} bài
                    </div>
                  </div>

                  <div className="p-4 rounded-xl app-card-raised space-y-1">
                    <span className="text-[11px] text-slate-500 font-semibold">Tần suất xuất bản</span>
                    <div className="text-sm font-bold text-emerald-500 flex items-center gap-1.5">
                      <Activity className="w-4 h-4 animate-pulse" />
                      <span>Cực kỳ dày đặc (~10 - 15m / bài)</span>
                    </div>
                  </div>
                </div>

                {/* Danh sách bài viết vừa spy được */}
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Các bài viết mới nhất bot vừa bắt được:
                  </h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {spyResult.todayPosts?.map((post, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3 group"
                      >
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2 text-[10px] font-bold text-amber-500">
                            <Clock className="w-3 h-3" />
                            <span>{post.timeStr}</span>
                          </div>
                          <p className="text-xs text-slate-800 dark:text-slate-200 line-clamp-2 leading-relaxed">
                            {post.caption}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <a
                            href={post.link || spyUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition"
                            title="Mở xem bài viết gốc trên Facebook"
                          >
                            <span>Xem bài</span>
                            <ExternalLink className="w-3 h-3 text-slate-400" />
                          </a>

                          <button
                            onClick={() => {
                              setRawText(post.caption);
                              setInputMode('text');
                              addToast({ message: 'Đã chuyển nội dung bài viết sang tab Dán Text để AI xào lại!', type: 'success' });
                            }}
                            className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500 text-amber-600 dark:text-amber-400 hover:text-slate-950 font-bold text-xs transition"
                            title="Mang bài này sang AI để viết lại"
                          >
                            Xào bài này ⚡
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </form>
        )}

        {/* Kết quả cào từ link hoặc xào từ text */}
        {scrapedResult && (
          <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/30 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Đã tạo bài viết Facebook mới thành công!
              </span>
              <button
                onClick={handleApplyScraped}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition scale-100 hover:scale-[1.02]"
              >
                <span>Đưa vào Soạn bài ngay</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
              {scrapedResult.original?.image && (
                <div className="md:col-span-4 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 aspect-video md:aspect-square bg-slate-950">
                  <img
                    src={scrapedResult.original.image}
                    alt={scrapedResult.original.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className={`${scrapedResult.original?.image ? 'md:col-span-8' : 'md:col-span-12'} space-y-3`}>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Tiêu đề bài gốc:</span>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {scrapedResult.original.title}
                  </h4>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-amber-500 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Bản thảo Facebook do AI sáng tạo:
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                    {scrapedResult.caption}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Radar Tin Tức Tuyển Chọn */}
      <div className="space-y-4">
        
        {/* Nguồn báo Tabs */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
            {sources.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSource(s.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-2 ${
                  activeSource === s.id
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-900/60 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                }`}
              >
                <span>{s.name}</span>
              </button>
            ))}
          </div>

          <span className="text-xs text-slate-500 dark:text-slate-400">
            Tự động cập nhật từ RSS Feed
          </span>
        </div>

        {/* Lưới tin tức Card */}
        {loadingNews ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-72 rounded-2xl bg-slate-200 dark:bg-slate-800/40 animate-pulse" />
            ))}
          </div>
        ) : newsItems.length === 0 ? (
          <div className="app-card p-12 text-center text-slate-500 text-xs">
            Không tìm thấy tin tức nào từ nguồn này. Hãy thử chọn nguồn báo khác.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {newsItems.map((item) => (
              <div
                key={item.id}
                className="app-card overflow-hidden flex flex-col justify-between group hover:border-amber-500/40 transition duration-300"
              >
                <div>
                  {/* Thumbnail */}
                  {item.image ? (
                    <div className="relative aspect-video bg-slate-950 overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        loading="lazy"
                      />
                      <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-bold text-white/90 border border-white/10">
                        {item.sourceName.split('-')[0].trim()}
                      </span>
                    </div>
                  ) : (
                    <div className="h-32 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-slate-600">
                      <Newspaper className="w-8 h-8 opacity-40" />
                    </div>
                  )}

                  {/* Body Content */}
                  <div className="p-5 space-y-2">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{new Date(item.pubDate).toLocaleString('vi-VN')}</span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-amber-500 transition">
                      {item.title}
                    </h4>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="p-5 pt-0 border-t border-slate-100 dark:border-slate-800/60 mt-3 flex items-center justify-between gap-2">
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
                  >
                    <span>Bài gốc</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <button
                    onClick={() => handleRewriteFeedItem(item)}
                    disabled={rewritingId === item.id}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition scale-95 group-hover:scale-100 disabled:opacity-50"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${rewritingId === item.id ? 'animate-spin' : ''}`} />
                    <span>{rewritingId === item.id ? 'Đang xào bài...' : 'Xào bài với AI ⚡'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
