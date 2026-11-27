import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ShoppingBag, 
  ExternalLink, 
  Sparkles, 
  Copy, 
  Check, 
  Search, 
  Filter, 
  Plus, 
  TrendingUp, 
  Trash2,
  DollarSign, 
  Layers, 
  Share2, 
  CheckCircle2, 
  ArrowRight,
  Tag,
  Star,
  Send,
  Link as LinkIcon,
  X,
  PackageOpen,
  Upload,
  Download,
  AlertCircle,
  FileSpreadsheet,
  RefreshCw,
  BarChart2,
  ShieldCheck,
  Zap,
  MousePointerClick,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';

export default function AffiliateHubTab({ onUseProduct, onNavigate }) {
  // Sàn đang chọn: 'shopee' | 'tiktok' | 'overview'
  const [activePlatform, setActivePlatform] = useState('shopee');
  // Phân hệ con trong sàn: 'products' | 'link-studio' | 'conversions' | 'settings'
  const [activeSubTab, setActiveSubTab] = useState('products');

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  // Link Studio State
  const [sourceUrl, setSourceUrl] = useState('');
  const [campaignTag, setCampaignTag] = useState('fb_goctangca');
  const [generatedLink, setGeneratedLink] = useState('');
  const [smartRedirectLink, setSmartRedirectLink] = useState('');
  const [firstCommentTemplate, setFirstCommentTemplate] = useState('');
  const [linkSuccess, setLinkSuccess] = useState(false);

  // Modal Add Product State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdPlatform, setNewProdPlatform] = useState('shopee');
  const [newProdUrl, setNewProdUrl] = useState('');
  const [newProdImage, setNewProdImage] = useState('');
  const [newProdOriginalPrice, setNewProdOriginalPrice] = useState('');
  const [newProdSalePrice, setNewProdSalePrice] = useState('');
  const [newProdCommissionRate, setNewProdCommissionRate] = useState('');
  const [newProdHighlight, setNewProdHighlight] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Modal Import Report State
  const [showImportModal, setShowImportModal] = useState(false);
  const [rawReportData, setRawReportData] = useState('');
  const [importing, setImporting] = useState(false);

  // Fetch dữ liệu từ server
  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, orderRes] = await Promise.all([
        axios.get('/api/affiliate/products'),
        axios.get('/api/affiliate/orders')
      ]);
      setProducts(prodRes.data.products || []);
      setOrders(orderRes.data.orders || []);
    } catch (err) {
      console.error('Lỗi tải dữ liệu affiliate:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Lọc sản phẩm theo sàn đang chọn
  const platformProducts = products.filter(p => {
    if (activePlatform === 'overview') return true;
    return p.platform === activePlatform;
  });

  const filteredProducts = platformProducts.filter(p => {
    const matchSearch = (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                        (p.highlight || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchSearch;
  });

  // Lọc đơn hàng theo sàn
  const platformOrders = orders.filter(o => {
    if (activePlatform === 'overview') return true;
    return o.platform === activePlatform;
  });

  // Thống kê tổng quan sàn
  const totalClicks = platformProducts.reduce((sum, p) => sum + (p.clicks || 0), 0);
  const totalCompletedOrders = platformOrders.filter(o => o.status === 'completed');
  const totalPendingOrders = platformOrders.filter(o => o.status === 'pending');
  const totalRevenue = totalCompletedOrders.reduce((sum, o) => sum + (o.orderValue || 0), 0);
  const totalCommission = totalCompletedOrders.reduce((sum, o) => sum + (o.commission || 0), 0);
  const pendingCommission = totalPendingOrders.reduce((sum, o) => sum + (o.commission || 0), 0);

  // Copy link
  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Trình tạo link & SubID
  const handleGenerateLink = (e) => {
    e.preventDefault();
    if (!sourceUrl.trim()) return;

    const cleanUrl = sourceUrl.trim();
    const subid = `${campaignTag}_${Date.now().toString(36)}`;
    
    // Gắn tham số subid tracking cho Shopee hoặc TikTok
    let affiliateFinal = cleanUrl;
    if (activePlatform === 'shopee') {
      affiliateFinal += (affiliateFinal.includes('?') ? '&' : '?') + `sub_id=${subid}`;
    } else {
      affiliateFinal += (affiliateFinal.includes('?') ? '&' : '?') + `tag=${subid}`;
    }

    // Smart redirect link qua server SocialHub (ghi nhận click)
    const baseUrl = window.location.origin;
    const smartUrl = `${baseUrl}/api/affiliate/r/quick?target=${encodeURIComponent(affiliateFinal)}`;

    setGeneratedLink(affiliateFinal);
    setSmartRedirectLink(smartUrl);
    setFirstCommentTemplate(
      `🛒 Link săn deal chính hãng cho các bác đây nhé (đã áp mã giảm):\n👉 ${affiliateFinal}\n(Số lượng có hạn, tranh thủ chốt sớm nha!)`
    );
    setLinkSuccess(true);
  };

  // Thêm sản phẩm vào kho
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProdName.trim() || !newProdUrl.trim()) return;

    setSubmitting(true);
    try {
      const orig = parseFloat(newProdOriginalPrice) || 0;
      const sale = parseFloat(newProdSalePrice) || 0;
      const rate = parseFloat(newProdCommissionRate) || 0;
      const discount = orig > sale && orig > 0 ? Math.round(((orig - sale) / orig) * 100) : 0;
      const commissionEstimate = sale > 0 && rate > 0 ? Math.round((sale * rate) / 100) : 0;

      const platformNames = {
        shopee: 'Shopee',
        tiktok: 'TikTok Shop'
      };

      const badgeColors = {
        shopee: 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30',
        tiktok: 'bg-pink-500/15 text-pink-600 dark:text-pink-400 border-pink-500/30'
      };

      await axios.post('/api/affiliate/products', {
        name: newProdName.trim(),
        platform: newProdPlatform,
        platformName: platformNames[newProdPlatform] || 'Shopee',
        platformBadgeColor: badgeColors[newProdPlatform] || badgeColors.shopee,
        originalPrice: orig,
        salePrice: sale,
        discount,
        commissionRate: rate,
        commissionEstimate,
        image: newProdImage.trim() || (newProdPlatform === 'shopee' 
          ? 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80'),
        affiliateUrl: newProdUrl.trim(),
        highlight: newProdHighlight.trim()
      });

      setNewProdName('');
      setNewProdUrl('');
      setNewProdImage('');
      setNewProdOriginalPrice('');
      setNewProdSalePrice('');
      setNewProdCommissionRate('');
      setNewProdHighlight('');
      setShowAddModal(false);
      fetchData();
    } catch (err) {
      console.error('Lỗi thêm sản phẩm:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Xóa sản phẩm
  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa sản phẩm này khỏi kho hàng?')) return;
    try {
      await axios.delete(`/api/affiliate/products/${id}`);
      fetchData();
    } catch (err) {
      console.error('Lỗi xóa sản phẩm:', err);
    }
  };

  // Import đơn hàng đối soát
  const handleImportReport = async (e) => {
    e.preventDefault();
    if (!rawReportData.trim()) return;

    setImporting(true);
    try {
      let parsedOrders = [];
      try {
        parsedOrders = JSON.parse(rawReportData);
      } catch (err) {
        // Parse CSV/TSV đơn giản nếu người dùng paste từ Excel
        const lines = rawReportData.trim().split('\n');
        for (let i = 0; i < lines.length; i++) {
          const parts = lines[i].split(/\t|,/);
          if (parts.length >= 3) {
            parsedOrders.push({
              orderSn: parts[0]?.trim() || `SN_${Date.now()}_${i}`,
              productName: parts[1]?.trim() || 'Sản phẩm đối soát',
              orderValue: parseFloat(parts[2]?.replace(/[^0-9.]/g, '')) || 100000,
              commission: parseFloat(parts[3]?.replace(/[^0-9.]/g, '')) || 15000,
              status: parts[4]?.toLowerCase().includes('hủy') ? 'cancelled' : 'completed',
              platform: activePlatform === 'tiktok' ? 'tiktok' : 'shopee',
              orderTime: new Date().toLocaleDateString('vi-VN')
            });
          }
        }
      }

      if (parsedOrders.length > 0) {
        await axios.post('/api/affiliate/orders/import', { orders: parsedOrders });
        setRawReportData('');
        setShowImportModal(false);
        fetchData();
      } else {
        alert('Không nhận diện được định dạng dữ liệu. Vui lòng kiểm tra lại!');
      }
    } catch (err) {
      alert('Lỗi nhập dữ liệu: ' + err.message);
    } finally {
      setImporting(false);
    }
  };

  // Thêm đơn hàng giả lập để trải nghiệm
  const handleAddSampleOrder = async () => {
    try {
      const sample = {
        orderSn: `ORD_${activePlatform.toUpperCase()}_${Date.now().toString().slice(-6)}`,
        productName: activePlatform === 'shopee' ? 'Bình giữ nhiệt Lock&Lock 550ml' : 'Bộ móc chìa khóa Capybara',
        orderValue: activePlatform === 'shopee' ? 280000 : 95000,
        commission: activePlatform === 'shopee' ? 28000 : 14250,
        status: 'completed',
        platform: activePlatform === 'tiktok' ? 'tiktok' : 'shopee',
        orderTime: new Date().toLocaleDateString('vi-VN')
      };
      await axios.post('/api/affiliate/orders', sample);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn w-full">
      
      {/* 1. TOP PLATFORM SWITCHER (SHOPEE vs TIKTOK SHOP vs TỔNG QUAN) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          {/* Shopee Studio Tab */}
          <button
            onClick={() => { setActivePlatform('shopee'); setActiveSubTab('products'); }}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition shrink-0 ${
              activePlatform === 'shopee'
                ? 'bg-[#ee4d2d] text-white shadow-md shadow-orange-500/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <div className="w-5 h-5 rounded-md bg-white text-[#ee4d2d] flex items-center justify-center font-black text-xs">
              S
            </div>
            <span>Shopee Affiliate Studio</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/20">
              {products.filter(p => p.platform === 'shopee').length} SP
            </span>
          </button>

          {/* TikTok Shop Creator Tab */}
          <button
            onClick={() => { setActivePlatform('tiktok'); setActiveSubTab('products'); }}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition shrink-0 ${
              activePlatform === 'tiktok'
                ? 'bg-gradient-to-r from-pink-600 via-rose-600 to-cyan-600 text-white shadow-md shadow-pink-500/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <div className="w-5 h-5 rounded-md bg-black text-white flex items-center justify-center font-black text-xs">
              TT
            </div>
            <span>TikTok Shop Creator</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/20">
              {products.filter(p => p.platform === 'tiktok').length} SP
            </span>
          </button>

          {/* Overview Matrix Tab */}
          <button
            onClick={() => { setActivePlatform('overview'); setActiveSubTab('products'); }}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition shrink-0 ${
              activePlatform === 'overview'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Đối chiếu Đa sàn</span>
          </button>
        </div>

        {/* Action Header Button */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => {
              setNewProdPlatform(activePlatform === 'tiktok' ? 'tiktok' : 'shopee');
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Thêm sản phẩm mới</span>
          </button>
        </div>

      </div>

      {/* 2. SUB-NAVIGATION TABS (CHO TỪNG SÀN) */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto text-xs sm:text-sm font-bold">
          
          <button
            onClick={() => setActiveSubTab('products')}
            className={`pb-2.5 px-2 transition flex items-center gap-2 relative ${
              activeSubTab === 'products'
                ? 'text-amber-500 border-b-2 border-amber-500'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Kho Sản Phẩm ({platformProducts.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('link-studio')}
            className={`pb-2.5 px-2 transition flex items-center gap-2 relative ${
              activeSubTab === 'link-studio'
                ? 'text-amber-500 border-b-2 border-amber-500'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <LinkIcon className="w-4 h-4" />
            <span>Trình Tạo Link & SubID</span>
          </button>

          <button
            onClick={() => setActiveSubTab('conversions')}
            className={`pb-2.5 px-2 transition flex items-center gap-2 relative ${
              activeSubTab === 'conversions'
                ? 'text-amber-500 border-b-2 border-amber-500'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span>Báo Cáo Đơn & Hoa Hồng</span>
            {platformOrders.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500/10 text-emerald-500 font-black">
                {platformOrders.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('settings')}
            className={`pb-2.5 px-2 transition flex items-center gap-2 relative ${
              activeSubTab === 'settings'
                ? 'text-amber-500 border-b-2 border-amber-500'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Kết Nối API & Trạng Thái</span>
          </button>

        </div>

        <button
          onClick={fetchData}
          title="Làm mới dữ liệu"
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-500' : ''}`} />
        </button>
      </div>

      {/* 3. PERFORMANCE STATS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Card 1: Tổng Click */}
        <div className="app-card p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>Lượt click ghi nhận</span>
            <MousePointerClick className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {totalClicks.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <Zap className="w-3 h-3" />
            <span>Bảo toàn 100% cookie</span>
          </div>
        </div>

        {/* Card 2: Đơn hàng thành công */}
        <div className="app-card p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>Đơn hàng chuyển đổi</span>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {totalCompletedOrders.length} <span className="text-xs text-slate-400 font-normal">/ {platformOrders.length}</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            {totalPendingOrders.length} đơn đang chờ duyệt
          </div>
        </div>

        {/* Card 3: Doanh số (GMV) */}
        <div className="app-card p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>Tổng giá trị đơn (GMV)</span>
            <TrendingUp className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {totalRevenue.toLocaleString('vi-VN')}đ
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            Từ các bài đăng mạng xã hội
          </div>
        </div>

        {/* Card 4: Hoa hồng thực nhận */}
        <div className="app-card p-4 space-y-1 bg-gradient-to-br from-amber-500/10 to-orange-500/5 border-amber-500/30">
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 text-xs font-bold">
            <span>Hoa hồng thực nhận</span>
            <DollarSign className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400">
            +{totalCommission.toLocaleString('vi-VN')}đ
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            +{(pendingCommission).toLocaleString('vi-VN')}đ ước tính đang chờ
          </div>
        </div>

      </div>

      {/* 4. CONTENT AREA THEO SUB-TAB */}

      {/* === SUB-TAB 1: KHO SẢN PHẨM === */}
      {activeSubTab === 'products' && (
        <div className="space-y-4">
          
          {/* Search bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder={`Tìm sản phẩm ${activePlatform === 'all' ? 'đa sàn' : activePlatform}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="text-xs text-slate-500">
                Hiển thị: <b>{filteredProducts.length}</b> sản phẩm
              </span>
            </div>
          </div>

          {/* Grid Products or Empty State */}
          {loading ? (
            <div className="py-16 text-center text-xs text-slate-500">Đang tải danh sách sản phẩm...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="app-card p-10 sm:p-14 text-center space-y-4 max-w-xl mx-auto border-dashed border-2">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 mx-auto flex items-center justify-center">
                <PackageOpen className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Chưa có sản phẩm nào cho {activePlatform === 'shopee' ? 'Shopee' : activePlatform === 'tiktok' ? 'TikTok Shop' : 'kho này'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                  Dán link sản phẩm từ ứng dụng {activePlatform === 'shopee' ? 'Shopee' : 'TikTok Shop'} để hệ thống lưu trữ, tự động sinh SubID và tạo bài đăng chốt đơn AI!
                </p>
              </div>
              <button
                onClick={() => {
                  setNewProdPlatform(activePlatform === 'tiktok' ? 'tiktok' : 'shopee');
                  setShowAddModal(true);
                }}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Thêm sản phẩm vào Kho {activePlatform.toUpperCase()}</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {filteredProducts.map((prod) => {
                const smartLink = `${window.location.origin}/api/affiliate/r/${prod.id}`;
                return (
                  <div
                    key={prod.id}
                    className="app-card-raised p-4 flex flex-col justify-between hover:border-amber-500/40 transition group relative overflow-hidden"
                  >
                    <div className="space-y-3">
                      
                      {/* Image & Badges */}
                      <div className="relative w-full h-44 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                        
                        <span className={`absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[10px] font-black border backdrop-blur-md shadow-xs ${
                          prod.platform === 'shopee'
                            ? 'bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/30'
                            : 'bg-pink-500/20 text-pink-600 dark:text-pink-400 border-pink-500/30'
                        }`}>
                          {prod.platformName || (prod.platform === 'shopee' ? 'Shopee' : 'TikTok Shop')}
                        </span>

                        {prod.discount > 0 && (
                          <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white shadow-xs">
                            -{prod.discount}%
                          </span>
                        )}

                        {/* Clicks Badge */}
                        <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-xs text-white text-[10px] font-mono flex items-center gap-1">
                          <MousePointerClick className="w-3 h-3 text-amber-400" />
                          <span>{prod.clicks || 0} clicks</span>
                        </div>
                      </div>

                      {/* Title */}
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition">
                          {prod.name}
                        </h4>
                        {prod.highlight && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                            {prod.highlight}
                          </p>
                        )}
                      </div>

                      {/* Pricing & Commission */}
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
                        <div className="flex items-baseline justify-between">
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-sm font-black text-rose-600 dark:text-rose-400">
                              {prod.salePrice ? `${prod.salePrice.toLocaleString('vi-VN')}đ` : 'Giá linh hoạt'}
                            </span>
                            {prod.originalPrice > 0 && (
                              <span className="text-[10px] text-slate-400 line-through">
                                {prod.originalPrice.toLocaleString('vi-VN')}đ
                              </span>
                            )}
                          </div>

                          {prod.commissionRate > 0 && (
                            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                              Hoa hồng: {prod.commissionRate}%
                            </span>
                          )}
                        </div>

                        {prod.commissionEstimate > 0 && (
                          <div className="pt-1.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px]">
                            <span className="text-slate-500 dark:text-slate-400 font-medium">Nhận về ước tính:</span>
                            <span className="font-black text-emerald-600 dark:text-emerald-400">
                              +{prod.commissionEstimate.toLocaleString('vi-VN')}đ
                            </span>
                          </div>
                        )}
                      </div>

                    </div>

                    {/* Actions */}
                    <div className="pt-3 mt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center gap-2">
                      <button
                        onClick={() => onUseProduct && onUseProduct(prod)}
                        className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xs transition flex items-center justify-center gap-1"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Tạo bài AI</span>
                      </button>

                      {/* Copy Link gốc */}
                      <button
                        onClick={() => handleCopy(prod.affiliateUrl, `url_${prod.id}`)}
                        title="Copy Link Shopee gốc"
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition"
                      >
                        {copiedId === `url_${prod.id}` ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                      </button>

                      {/* Copy Smart Redirect Link (Đếm click) */}
                      <button
                        onClick={() => handleCopy(smartLink, `smart_${prod.id}`)}
                        title="Copy Smart Tracking Link (Tự đếm Click)"
                        className="p-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30 transition"
                      >
                        {copiedId === `smart_${prod.id}` ? <Check className="w-4 h-4 text-emerald-500" /> : <LinkIcon className="w-4 h-4" />}
                      </button>

                      {/* Xóa */}
                      <button
                        onClick={() => handleDeleteProduct(prod.id)}
                        title="Xóa khỏi kho"
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 border border-slate-200 dark:border-slate-700 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* === SUB-TAB 2: TRÌNH TẠO LINK & SUBID TRACKING === */}
      {activeSubTab === 'link-studio' && (
        <div className="app-card p-6 sm:p-7 space-y-6">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-amber-500" />
              <span>Trình Tạo Link & Chiến Dịch SubID ({activePlatform === 'shopee' ? 'Shopee' : 'TikTok Shop'})</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Gắn mã SubID theo từng bài viết và tự động tạo mẫu bình luận ghim (First Comment) né thuật toán bóp reach của Facebook.
            </p>
          </div>

          <form onSubmit={handleGenerateLink} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2 space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Đường dẫn sản phẩm ({activePlatform === 'shopee' ? 'Shopee' : 'TikTok Shop'}):
                </label>
                <input
                  type="text"
                  required
                  placeholder={activePlatform === 'shopee' ? 'https://s.shopee.vn/... hoặc https://shopee.vn/product/...' : 'https://vt.tiktok.com/... hoặc link sản phẩm TikTok Shop'}
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Chiến dịch / Nguồn đăng (SubID):
                </label>
                <select
                  value={campaignTag}
                  onChange={(e) => setCampaignTag(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                >
                  <option value="fb_goctangca_post">Bài đăng Fanpage (Meme)</option>
                  <option value="fb_goctangca_reels">Video Reels Facebook</option>
                  <option value="fb_goctangca_story">Story 24h</option>
                  <option value="tiktok_bio">TikTok Link in Bio</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Tạo Link Tracking & Mẫu Ghim</span>
            </button>
          </form>

          {linkSuccess && (
            <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-4 animate-fadeIn">
              
              {/* Option 1: Link Affiliate trực tiếp */}
              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Link Affiliate Đã Gắn SubID (Dùng trực tiếp):</span>
                  </span>
                  <button
                    onClick={() => handleCopy(generatedLink, 'link_direct')}
                    className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-200 transition flex items-center gap-1"
                  >
                    {copiedId === 'link_direct' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === 'link_direct' ? 'Đã copy' : 'Sao chép'}</span>
                  </button>
                </div>
                <div className="font-mono text-xs text-amber-600 dark:text-amber-400 truncate">
                  {generatedLink}
                </div>
              </div>

              {/* Option 2: Smart Redirect Link (Đếm Click) */}
              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-blue-500/30 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <MousePointerClick className="w-4 h-4 text-blue-500" />
                    <span>Smart Redirect Link (Tự đếm lượt click về SocialHub):</span>
                  </span>
                  <button
                    onClick={() => handleCopy(smartRedirectLink, 'link_smart')}
                    className="px-3 py-1 rounded-lg bg-blue-500/10 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 transition flex items-center gap-1"
                  >
                    {copiedId === 'link_smart' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === 'link_smart' ? 'Đã copy' : 'Sao chép'}</span>
                  </button>
                </div>
                <div className="font-mono text-xs text-blue-600 dark:text-blue-400 truncate">
                  {smartRedirectLink}
                </div>
              </div>

              {/* Mẫu comment ghim */}
              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Mẫu Comment #1 Tự Động (Tránh bóp reach FB):
                  </span>
                  <button
                    onClick={() => handleCopy(firstCommentTemplate, 'comm_tpl')}
                    className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-200 transition flex items-center gap-1"
                  >
                    {copiedId === 'comm_tpl' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === 'comm_tpl' ? 'Đã copy' : 'Copy mẫu comment'}</span>
                  </button>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line font-sans">
                  {firstCommentTemplate}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setNewProdUrl(generatedLink);
                    setNewProdPlatform(activePlatform === 'tiktok' ? 'tiktok' : 'shopee');
                    setShowAddModal(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Lưu sản phẩm này vào Kho</span>
                </button>
                
                <button
                  onClick={() => {
                    if (onUseProduct) {
                      onUseProduct({
                        name: 'Sản phẩm ' + (activePlatform === 'shopee' ? 'Shopee' : 'TikTok Shop'),
                        affiliateUrl: generatedLink,
                        platform: activePlatform
                      });
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>Chuyển sang Soạn bài ngay</span>
                </button>
              </div>

            </div>
          )}

        </div>
      )}

      {/* === SUB-TAB 3: BÁO CÁO ĐƠN HÀNG & HOA HỒNG (CONVERSIONS) === */}
      {activeSubTab === 'conversions' && (
        <div className="app-card p-6 sm:p-7 space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-500" />
                <span>Báo Cáo Đơn Hàng & Đối Soát Hoa Hồng ({activePlatform.toUpperCase()})</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Theo dõi trạng thái từng đơn: Đang chờ duyệt, Hoàn thành hoặc Bị hủy. Hỗ trợ import trực tiếp từ file xuất của Shopee/TikTok.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleAddSampleOrder}
                className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition"
              >
                + Thêm đơn mẫu test
              </button>
              <button
                onClick={() => setShowImportModal(true)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
              >
                <Upload className="w-4 h-4" />
                <span>Nhập Báo Cáo Đối Soát</span>
              </button>
            </div>
          </div>

          {/* Orders Table */}
          {platformOrders.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Chưa có đơn hàng đối soát nào</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Bấm <b>"Nhập Báo Cáo Đối Soát"</b> để dán dữ liệu hoặc tải file Excel từ mục Báo Cáo Chuyển Đổi của Shopee / TikTok Shop vào đây.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
                    <th className="pb-3">Mã đơn hàng</th>
                    <th className="pb-3">Sản phẩm</th>
                    <th className="pb-3">Giá trị đơn</th>
                    <th className="pb-3">Hoa hồng</th>
                    <th className="pb-3">Trạng thái</th>
                    <th className="pb-3">Thời gian</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {platformOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-3 font-mono font-bold text-slate-900 dark:text-white">
                        {ord.orderSn}
                      </td>
                      <td className="py-3 max-w-xs truncate text-slate-700 dark:text-slate-300">
                        {ord.productName}
                      </td>
                      <td className="py-3 font-semibold text-slate-900 dark:text-white">
                        {ord.orderValue ? `${ord.orderValue.toLocaleString('vi-VN')}đ` : '---'}
                      </td>
                      <td className="py-3 font-black text-emerald-600 dark:text-emerald-400">
                        +{ord.commission ? `${ord.commission.toLocaleString('vi-VN')}đ` : '0đ'}
                      </td>
                      <td className="py-3">
                        {ord.status === 'completed' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            Thành công
                          </span>
                        ) : ord.status === 'cancelled' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                            Đã hủy
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            Chờ duyệt
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-slate-500 text-[11px]">
                        {ord.orderTime || new Date(ord.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      )}

      {/* === SUB-TAB 4: KẾT NỐI API & TRẠNG THÁI (SETTINGS) === */}
      {activeSubTab === 'settings' && (
        <div className="app-card p-6 sm:p-7 space-y-6">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-500" />
              <span>Cấu Hình Tích Hợp API & Trạng Thái Cấp Quyền ({activePlatform.toUpperCase()})</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Quản lý khóa bí mật và hướng dẫn kết nối trực tiếp với cổng Open API của {activePlatform === 'shopee' ? 'Shopee' : 'TikTok Shop'}.
            </p>
          </div>

          {activePlatform === 'shopee' ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1 text-slate-800 dark:text-slate-200">
                  <div className="font-bold">Trạng thái tài khoản Shopee hiện tại:</div>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    Shopee mặc định chưa cấp quyền Open API tự động cho tài khoản thường. Trong lúc chờ Shopee mở quyền, bạn hoàn toàn có thể sử dụng tính năng <b>Trình tạo Link & SubID</b> và <b>Smart Redirect Link</b> của SocialHub mà vẫn nhận đủ 100% hoa hồng!
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Shopee App ID:
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: 17300000000 (Để trống nếu chưa có quyền API)"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Shopee Secret Key:
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••••••••••••••••••••••••••"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="pt-2">
                  <a
                    href="https://affiliate.shopee.vn/open_api"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
                  >
                    <span>Truy cập trang yêu cầu mở quyền Open API của Shopee</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-pink-500 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1 text-slate-800 dark:text-slate-200">
                  <div className="font-bold">TikTok Shop Creator Center:</div>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    Hỗ trợ đồng bộ Showcase (Giỏ hàng mẫu) và mã Creator Tracking. Dán link sản phẩm từ TikTok Shop để tạo link Bio và tự động gắn vào bài viết.
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    TikTok Creator Username / ID:
                  </label>
                  <input
                    type="text"
                    placeholder="@goctangca"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* 5. MODAL: THÊM SẢN PHẨM MỚI VÀO KHO */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="app-card w-full max-w-lg p-6 space-y-4 shadow-2xl border border-amber-500/40 relative max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-500" />
                <span>Thêm sản phẩm ({newProdPlatform.toUpperCase()}) vào Kho</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-3.5 text-xs">
              
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tên sản phẩm <span className="text-rose-500">*</span>:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Bình giữ nhiệt Lock&Lock One-Touch 550ml..."
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Sàn thương mại điện tử:
                  </label>
                  <select
                    value={newProdPlatform}
                    onChange={(e) => setNewProdPlatform(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="shopee">Shopee</option>
                    <option value="tiktok">TikTok Shop</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tỷ lệ hoa hồng (%):
                  </label>
                  <input
                    type="number"
                    placeholder="Ví dụ: 12"
                    value={newProdCommissionRate}
                    onChange={(e) => setNewProdCommissionRate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Đường dẫn Affiliate Link <span className="text-rose-500">*</span>:
                </label>
                <input
                  type="text"
                  required
                  placeholder={newProdPlatform === 'shopee' ? 'https://s.shopee.vn/...' : 'https://vt.tiktok.com/...'}
                  value={newProdUrl}
                  onChange={(e) => setNewProdUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Giá gốc (VNĐ):
                  </label>
                  <input
                    type="number"
                    placeholder="Ví dụ: 450000"
                    value={newProdOriginalPrice}
                    onChange={(e) => setNewProdOriginalPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Giá khuyến mãi (VNĐ):
                  </label>
                  <input
                    type="number"
                    placeholder="Ví dụ: 279000"
                    value={newProdSalePrice}
                    onChange={(e) => setNewProdSalePrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Đường dẫn ảnh sản phẩm (Image URL):
                </label>
                <input
                  type="text"
                  placeholder="Dán link ảnh sản phẩm (tùy chọn)..."
                  value={newProdImage}
                  onChange={(e) => setNewProdImage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Điểm nổi bật / Công dụng:
                </label>
                <textarea
                  rows={2}
                  placeholder="Ví dụ: Giữ nhiệt 24h, mở 1 chạm, chống trầy xước..."
                  value={newProdHighlight}
                  onChange={(e) => setNewProdHighlight(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md transition flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>{submitting ? 'Đang lưu...' : 'Lưu vào Kho hàng'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* 6. MODAL: NHẬP BÁO CÁO ĐỐI SOÁT TỪ FILE / TEXT */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="app-card w-full max-w-lg p-6 space-y-4 shadow-2xl border border-emerald-500/40 relative">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-emerald-500" />
                <span>Nhập Dữ Liệu Báo Cáo Đối Soát ({activePlatform.toUpperCase()})</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleImportReport} className="space-y-3 text-xs">
              <p className="text-slate-500 leading-relaxed">
                Copy các dòng từ file Excel báo cáo đơn hàng (Mã đơn, Tên sản phẩm, Giá trị đơn, Hoa hồng, Trạng thái) hoặc dán JSON vào đây:
              </p>

              <textarea
                rows={6}
                required
                placeholder={`Ví dụ dữ liệu từ Excel:\n241127SP01\tBình giữ nhiệt Lock&Lock\t280000\t28000\tThành công\n241127SP02\tMóc khóa Capybara\t95000\t14250\tThành công`}
                value={rawReportData}
                onChange={(e) => setRawReportData(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-[11px] text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={importing}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md transition flex items-center gap-1.5"
                >
                  <Upload className="w-4 h-4" />
                  <span>{importing ? 'Đang nhập...' : 'Xác nhận Nhập dữ liệu'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
