import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Images, 
  Upload, 
  Plus, 
  Trash2, 
  Search, 
  Tag, 
  Copy, 
  ExternalLink, 
  Send, 
  Sparkles, 
  Link as LinkIcon, 
  X, 
  Check, 
  FolderHeart,
  AlertCircle
} from 'lucide-react';
import { useToast } from '../common/Toast';

const TAGS = [
  'Tất cả',
  'Meme Công sở',
  'Đời sống Gen Z',
  'Fact & Tri thức',
  'Shopee / Review'
];

export default function MediaLibraryTab({ onUseMedia }) {
  const { addToast } = useToast();
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTag, setActiveTag] = useState('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal thêm link URL / Google Drive
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [titleInput, setTitleInput] = useState('');
  const [tagInput, setTagInput] = useState('Meme Công sở');
  const [submittingUrl, setSubmittingUrl] = useState(false);

  // File upload input ref
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/media');
      setMediaList(res.data.media || []);
    } catch (err) {
      console.error('Lỗi lấy danh sách media:', err);
      addToast({ message: 'Không thể tải danh sách media', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  // Upload file từ máy tính
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('photo', file);
    formData.append('title', file.name.replace(/\.[^/.]+$/, ''));
    formData.append('tag', activeTag !== 'Tất cả' ? activeTag : 'Meme Công sở');

    try {
      setUploading(true);
      const res = await axios.post('/api/media/upload', formData);
      if (res.data.success) {
        addToast({ message: 'Đã tải ảnh lên thư viện thành công!', type: 'success' });
        fetchMedia();
      }
    } catch (err) {
      addToast({ message: err.response?.data?.error || 'Lỗi upload ảnh', type: 'error' });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Thêm ảnh từ URL hoặc link Google Drive
  const handleAddUrl = async (e) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    try {
      setSubmittingUrl(true);
      const res = await axios.post('/api/media/link', {
        url: urlInput.trim(),
        title: titleInput.trim() || 'Meme mới',
        tag: tagInput
      });

      if (res.data.success) {
        addToast({ message: 'Đã thêm ảnh vào thư viện!', type: 'success' });
        setUrlInput('');
        setTitleInput('');
        setShowUrlModal(false);
        fetchMedia();
      }
    } catch (err) {
      addToast({ message: err.response?.data?.error || 'Lỗi thêm link ảnh', type: 'error' });
    } finally {
      setSubmittingUrl(false);
    }
  };

  // Xóa ảnh khỏi thư viện
  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa ảnh này khỏi thư viện?')) return;
    try {
      await axios.delete(`/api/media/${id}`);
      addToast({ message: 'Đã xóa ảnh khỏi thư viện', type: 'success' });
      setMediaList((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      addToast({ message: 'Lỗi khi xóa ảnh', type: 'error' });
    }
  };

  // Copy URL ảnh
  const handleCopyUrl = (url) => {
    const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl);
    addToast({ message: 'Đã copy link ảnh!', type: 'success' });
  };

  // Lọc media
  const filteredList = mediaList.filter((item) => {
    const matchesTag = activeTag === 'Tất cả' || item.tag === activeTag;
    const matchesSearch = !searchQuery.trim() || 
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tag?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTag && matchesSearch;
  });

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      
      {/* 1. Header Banner */}
      <div className="app-card p-6 sm:p-8 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 relative z-10 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <FolderHeart className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
              Tài nguyên Đa Kênh
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Thư viện Meme & Hình ảnh
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Kho lưu trữ meme công sở, hình ảnh viral và ảnh sản phẩm Shopee. Lưu một lần, tái sử dụng đăng bài 1-chạm lên bất kỳ Fanpage nào.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-3 relative z-10 shrink-0">
          <a
            href="https://imgflip.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-700 dark:text-purple-300 font-bold text-xs border border-purple-500/30 transition shadow-sm hover:scale-[1.02]"
            title="Mở kho meme khổng lồ và công cụ chế meme trực tuyến trên Imgflip.com"
          >
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span>Mở Imgflip.com</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
          </a>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            <span>{uploading ? 'Đang tải lên...' : 'Tải ảnh từ máy'}</span>
          </button>

          <button
            onClick={() => setShowUrlModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 transition"
          >
            <LinkIcon className="w-4 h-4" />
            <span>Thêm từ URL / Drive</span>
          </button>
        </div>
      </div>

      {/* 1.1 Quick Tools & Bookmark Bar (Imgflip Shortcuts) */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-purple-500/10 via-amber-500/5 to-slate-900/40 border border-purple-500/20 shadow-xs">
        <div className="flex items-center gap-2.5">
          <span className="text-base">⚡</span>
          <div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Kho công cụ Meme ngoài: </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">Truy cập nhanh Imgflip để chế ảnh, tạo caption rồi lưu vào kho</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a
            href="https://imgflip.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-sm transition hover:scale-[1.02]"
          >
            <span>🔥 Imgflip.com</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <a
            href="https://imgflip.com/memegenerator"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition"
          >
            <span>Meme Generator (Chế chữ)</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>
          <a
            href="https://imgflip.com/memes"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition"
          >
            <span>Kho mẫu Meme Hot</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>
        </div>
      </div>

      {/* 2. Filters & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Tags */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-none">
          {TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                activeTag === tag
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-900/60 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm meme theo tên..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-amber-500"
          />
        </div>

      </div>

      {/* 3. Media Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-64 rounded-2xl bg-slate-200 dark:bg-slate-800/40 animate-pulse" />
          ))}
        </div>
      ) : filteredList.length === 0 ? (
        <div className="app-card p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <Images className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              Chưa có meme nào trong danh mục này
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Hãy bấm "Tải ảnh từ máy" hoặc "Thêm từ URL" để bắt đầu tích lũy kho meme triệu view của bạn.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredList.map((item) => {
            const displayUrl = item.url.startsWith('http') ? item.url : item.url;
            return (
              <div
                key={item.id}
                className="app-card group overflow-hidden flex flex-col hover:border-amber-500/50 transition duration-300"
              >
                {/* Image Preview Container */}
                <div className="relative aspect-video sm:aspect-square bg-slate-950 overflow-hidden">
                  <img
                    src={displayUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    loading="lazy"
                  />
                  
                  {/* Tag badge */}
                  <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-bold text-white/90 border border-white/10">
                    {item.tag}
                  </span>

                  {/* Hover Overlay with Quick Actions */}
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 p-4">
                    <button
                      onClick={() => onUseMedia(item)}
                      className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition scale-95 group-hover:scale-100"
                      title="Chọn meme này để đăng bài"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Đăng ngay</span>
                    </button>

                    <button
                      onClick={() => handleCopyUrl(item.url)}
                      className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white backdrop-blur-md transition"
                      title="Copy link ảnh"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 rounded-xl bg-rose-500/80 hover:bg-rose-500 text-white backdrop-blur-md transition"
                      title="Xóa meme này"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Info Footer */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1" title={item.title}>
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {new Date(item.createdAt).toLocaleDateString('vi-VN')} · {item.source === 'upload' ? 'Upload nội bộ' : 'Link Web / Drive'}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Modal thêm ảnh từ URL / Google Drive */}
      {showUrlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="app-card w-full max-w-lg p-6 sm:p-7 space-y-5 relative">
            <button
              onClick={() => setShowUrlModal(false)}
              className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-amber-500" />
                Thêm ảnh từ URL hoặc Google Drive
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Hệ thống tự động nhận diện và chuyển đổi link Google Drive chia sẻ thành link ảnh trực tiếp.
              </p>
            </div>

            <form onSubmit={handleAddUrl} className="space-y-4">
              {/* Imgflip Tip & Link */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs">
                <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                  <Sparkles className="w-4 h-4 text-purple-500 shrink-0" />
                  <span>Chế meme online trên Imgflip rồi copy link ảnh dán vào đây:</span>
                </div>
                <a
                  href="https://imgflip.com/memegenerator"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] shrink-0 flex items-center gap-1 shadow-xs transition"
                >
                  <span>Mở Imgflip</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Đường dẫn ảnh (URL hoặc link Google Drive công khai)
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://drive.google.com/file/d/... hoặc https://.../meme.jpg"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Tên gợi nhớ của Meme
                </label>
                <input
                  type="text"
                  placeholder="VD: Meme đi làm muộn, Meme sếp gọi..."
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Chủ đề / Phân loại (Tag)
                </label>
                <select
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="Meme Công sở">Meme Công sở</option>
                  <option value="Đời sống Gen Z">Đời sống Gen Z</option>
                  <option value="Fact & Tri thức">Fact & Tri thức</option>
                  <option value="Shopee / Review">Shopee / Review</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUrlModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submittingUrl}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition disabled:opacity-50"
                >
                  {submittingUrl ? 'Đang lưu...' : 'Lưu vào Thư viện'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
