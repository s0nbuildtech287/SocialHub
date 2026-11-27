import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Send, 
  Upload, 
  ShoppingBag, 
  CalendarClock, 
  Eye, 
  CheckCircle2, 
  AlertCircle,
  ThumbsUp,
  MessageCircle,
  Share2,
  Pin,
  Layers,
  X,
  Images,
  Check,
  ShieldCheck,
  Sparkles,
  Copy
} from 'lucide-react';
import { applyWatermarkToImage } from '../utils/watermarkHelper';

const MEME_PROMPT_TEMPLATE = `Bạn là một chuyên gia sáng tạo nội dung mạng xã hội (Content Creator & Meme Lord) chuyên phụ trách trang Fanpage "Góc Tăng Ca" — một cộng đồng cực kỳ nổi tiếng dành cho dân văn phòng, lập trình viên, nhân viên công sở và người đi làm tại Việt Nam.

Tôi sẽ gửi kèm một bức ảnh meme (hoặc ảnh tình huống). Hãy phân tích ngữ cảnh của bức ảnh và sáng tạo nội dung theo đúng phong cách văn hóa công sở Việt Nam: hài hước, châm biếm nhẹ nhàng, trúng "tim đen", đồng cảm với nỗi khổ đi làm, OT, deadline, sếp dí, hết tiền, săn sale, hóng cuối tuần.

Hãy cung cấp cho tôi 3 phương án khác nhau. Với MỖI phương án, hãy trình bày rõ ràng theo đúng cấu trúc sau:

---
### PHƯƠNG ÁN [Số]: [Tên chủ đề ngắn]
1. 🖼️ CHỮ GẮN TRÊN ẢNH (In-image Caption):
   - Tiêu đề to trên cùng ảnh (Top text): (Ngắn gọn, in hoa, cực kỳ bắt mắt)
   - Nhãn dán trên các nhân vật/khung hình (Label text): (Ví dụ: Khung trái là gì, khung phải là gì...)

2. 📝 CAPTION ĐĂNG BÀI (Facebook Post Caption):
   - Câu hook 1-2 dòng: Đánh thẳng vào tâm trạng, mặn mòi, tự trào, dí dỏm.
   - Thân bài (1-2 câu): Kể khổ ngắn gọn hoặc đặt câu hỏi kéo tương tác (kêu gọi thả tim/haha/comment).
   - Hashtag: 4-5 hashtag trending (ví dụ: #GocTangCa #DanVanPhong #Deadline #CuoiTuan...)
---

Yêu cầu về văn phong:
- Ngôn ngữ: Tiếng Việt tự nhiên, dùng từ ngữ thịnh hành của Gen Z và dân văn phòng (OT, deadline, ting ting, ví tiền, báo thủ, sếp dí, trầm cảm...).
- Ngắn gọn, súc tích, không viết văn mẫu dài dòng triết lý. Trọng tâm là sự hài hước và tính lan truyền (viral).`;

export default function PostComposerTab({ prefill, status, onPostSuccess }) {
  const [caption, setCaption] = useState(prefill?.caption ? `${prefill.caption}\n\n${prefill.hashtags || ''}` : '');
  const [photoType, setPhotoType] = useState('upload'); // 'upload' | 'url' | 'library'
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoUrl, setPhotoUrl] = useState('');
  const [libraryMedia, setLibraryMedia] = useState([]);
  const [loadingMedia, setLoadingMedia] = useState(false);

  // Watermark nhận diện thương hiệu
  const [enableWatermark, setEnableWatermark] = useState(true);
  const [watermarkPos, setWatermarkPos] = useState('bottom-right'); // 'bottom-right' | 'top-right' | 'bottom-bar'
  const [watermarkedPreview, setWatermarkedPreview] = useState(null);
  const [watermarkedBlob, setWatermarkedBlob] = useState(null);
  const [isWatermarking, setIsWatermarking] = useState(false);

  // Modal Prompt Meme AI
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [promptCopied, setPromptCopied] = useState(false);

  // Nhận dữ liệu prefill (từ Ý tưởng AI hoặc từ Thư viện Media)
  useEffect(() => {
    if (prefill?.photoUrl) {
      setPhotoType('url');
      setPhotoUrl(prefill.photoUrl);
      setPhotoPreview(prefill.photoUrl);
      setPhotoFile(null);
    }
    if (prefill?.caption) {
      setCaption(prefill.caption + (prefill.hashtags ? `\n\n${prefill.hashtags}` : ''));
    }
    if (prefill?.shopeeLink) {
      setShopeeLink(prefill.shopeeLink);
      setEnableShopee(true);
    }
    if (prefill?.shopeeCommentText) {
      setShopeeCommentText(prefill.shopeeCommentText);
    }
  }, [prefill]);

  // Load danh sách media khi chuyển sang tab Thư viện
  useEffect(() => {
    if (photoType === 'library' && libraryMedia.length === 0) {
      setLoadingMedia(true);
      axios.get('/api/media')
        .then((res) => setLibraryMedia(res.data.media || []))
        .catch((err) => console.error('Lỗi lấy media:', err))
        .finally(() => setLoadingMedia(false));
    }
  }, [photoType]);
  
  // Shopee
  const [enableShopee, setEnableShopee] = useState(true);
  const [shopeeLink, setShopeeLink] = useState('');
  const [shopeeCommentText, setShopeeCommentText] = useState('🛒 Link sản phẩm được nhắc đến cho các bác đây nhé:');
  
  // Schedule
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduleTime, setScheduleTime] = useState('');

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Tự động tắt thông báo thành công sau 5 giây
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => {
        setSuccessMsg('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  // Tự động tắt thông báo lỗi sau 6 giây nếu có
  useEffect(() => {
    if (errorMsg) {
      const timer = setTimeout(() => {
        setErrorMsg('');
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg]);

  const currentTargetChannel = status?.activeChannel;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
      setPhotoUrl('');
    }
  };

  // Tự động đóng dấu Watermark khi ảnh hoặc cấu hình thay đổi
  useEffect(() => {
    let isCancelled = false;

    if (!photoPreview || !enableWatermark) {
      setWatermarkedPreview(null);
      setWatermarkedBlob(null);
      return;
    }

    setIsWatermarking(true);
    const channelName = currentTargetChannel?.name || 'GÓC TĂNG CA';
    const subHandle = '@' + channelName.toLowerCase().replace(/[^a-z0-9]/g, '');

    applyWatermarkToImage(photoPreview, {
      brandName: channelName.toUpperCase(),
      subText: subHandle,
      position: watermarkPos,
      opacity: 0.95
    })
      .then(({ dataUrl, blob }) => {
        if (!isCancelled) {
          setWatermarkedPreview(dataUrl);
          setWatermarkedBlob(blob);
        }
      })
      .catch((err) => {
        console.warn('Lỗi render watermark:', err);
        if (!isCancelled) {
          setWatermarkedPreview(null);
          setWatermarkedBlob(null);
        }
      })
      .finally(() => {
        if (!isCancelled) setIsWatermarking(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [photoPreview, enableWatermark, watermarkPos, currentTargetChannel?.name]);

  const handlePublish = async () => {
    if (!caption.trim() && !photoFile && !photoUrl && !watermarkedBlob) {
      setErrorMsg('Vui lòng nhập nội dung bài viết hoặc chọn ảnh!');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const formData = new FormData();
      formData.append('channelId', currentTargetChannel?.id || '');
      formData.append('message', caption);

      // Nếu đã đóng dấu watermark thành công -> gửi file ảnh có watermark
      if (enableWatermark && watermarkedBlob) {
        const watermarkedFile = new File([watermarkedBlob], 'post_watermarked.jpg', { type: 'image/jpeg' });
        formData.append('photo', watermarkedFile);
      } else if (photoFile) {
        formData.append('photo', photoFile);
      } else if (photoUrl) {
        formData.append('photoUrl', photoUrl);
      }

      if (enableShopee && shopeeLink.trim()) {
        formData.append('shopeeLink', shopeeLink.trim());
        formData.append('shopeeCommentText', shopeeCommentText);
      }

      if (isScheduled) {
        if (!scheduleTime) {
          setErrorMsg('Vui lòng chọn thời gian hẹn giờ!');
          setLoading(false);
          return;
        }
        formData.append('scheduledTime', scheduleTime);
        await axios.post('/api/posts/schedule', formData);
        setSuccessMsg(`🎉 Đã lên lịch đăng bài thành công cho kênh ${currentTargetChannel?.name}!`);
      } else {
        await axios.post('/api/posts/publish', formData);
        setSuccessMsg(`🎉 Đã đăng bài thành công lên kênh ${currentTargetChannel?.name}!`);
        if (enableShopee && shopeeLink.trim()) {
          setSuccessMsg(`🎉 Đã đăng bài và tự động ghim bình luận Shopee lên ${currentTargetChannel?.name}!`);
        }
      }

      if (onPostSuccess) onPostSuccess();
    } catch (err) {
      setErrorMsg(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const addEmoji = (emoji) => {
    setCaption((prev) => prev + ' ' + emoji);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Messages */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-sm flex items-center justify-between gap-3 shadow-sm animate-fadeIn">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
            <span className="font-semibold">{successMsg}</span>
          </div>
          <button
            onClick={() => setSuccessMsg('')}
            className="p-1.5 rounded-lg hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 transition"
            title="Đóng thông báo"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-300 text-sm flex items-center justify-between gap-3 shadow-sm animate-fadeIn">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
            <span className="font-semibold">{errorMsg}</span>
          </div>
          <button
            onClick={() => setErrorMsg('')}
            className="p-1.5 rounded-lg hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 transition"
            title="Đóng thông báo"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Composer Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="app-card p-6 sm:p-7 space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  ✍️ Soạn thảo bài viết
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Xuất bản bài viết trực tiếp hoặc lên lịch tự động cho kênh đang chọn</p>
              </div>
            </div>

            {/* Caption Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <span>Nội dung Caption</span>
                  <span className="text-slate-500 font-normal">({caption.length} ký tự)</span>
                </label>

                {/* Nút mở kho Prompt Meme */}
                <button
                  type="button"
                  onClick={() => setShowPromptModal(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 text-xs font-bold transition shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Prompt Tạo Meme AI</span>
                </button>
              </div>

              <textarea
                rows={5}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Nhập nội dung bài viết..."
                className="w-full bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-amber-500 transition leading-relaxed"
              />
              {/* Emoji quick insert */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-xs text-slate-500 mr-1">Chèn nhanh:</span>
                {[':)))', '🥲', '☕', '💼', '💻', '💸', '🏃‍♂️', '💀', '🛒', '🔥'].map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => addEmoji(em)}
                    className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs text-slate-700 dark:text-slate-300 transition"
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>

            {/* Media Upload */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Hình ảnh đính kèm
              </label>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPhotoType('upload')}
                  className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition ${
                    photoType === 'upload'
                      ? 'bg-amber-500/15 border-amber-500/50 text-amber-800 dark:text-amber-300 font-bold'
                      : 'bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Tải ảnh từ máy
                </button>
                <button
                  type="button"
                  onClick={() => setPhotoType('url')}
                  className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition ${
                    photoType === 'url'
                      ? 'bg-amber-500/15 border-amber-500/50 text-amber-800 dark:text-amber-300 font-bold'
                      : 'bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Dán URL ảnh
                </button>
                <button
                  type="button"
                  onClick={() => setPhotoType('library')}
                  className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition flex items-center justify-center gap-1.5 ${
                    photoType === 'library'
                      ? 'bg-amber-500/15 border-amber-500/50 text-amber-800 dark:text-amber-300 font-bold'
                      : 'bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Images className="w-3.5 h-3.5" />
                  <span>Kho Meme</span>
                </button>
              </div>

              {photoType === 'upload' && (
                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-amber-500/60 rounded-2xl cursor-pointer bg-slate-50 dark:bg-slate-950/40 transition">
                  <Upload className="w-8 h-8 text-slate-400 mb-2" />
                  <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold">Bấm để chọn file ảnh hoặc kéo thả vào đây</span>
                  <span className="text-[11px] text-slate-500 mt-1">Hỗ trợ JPG, PNG, WEBP, GIF</span>
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              )}

              {photoType === 'url' && (
                <input
                  type="text"
                  value={photoUrl}
                  onChange={(e) => {
                    setPhotoUrl(e.target.value);
                    setPhotoPreview(e.target.value);
                    setPhotoFile(null);
                  }}
                  placeholder="https://example.com/image.jpg hoặc link Google Drive"
                  className="w-full bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                />
              )}

              {photoType === 'library' && (
                <div className="space-y-2">
                  {loadingMedia ? (
                    <div className="grid grid-cols-3 gap-2">
                      {[1, 2, 3].map((n) => (
                        <div key={n} className="h-20 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
                      ))}
                    </div>
                  ) : libraryMedia.length === 0 ? (
                    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
                      Chưa có meme nào trong Thư viện. Hãy vào mục Thư viện Media để tải lên.
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-56 overflow-y-auto p-1">
                      {libraryMedia.map((m) => {
                        const isSelected = photoUrl === m.url || photoPreview === m.url;
                        return (
                          <div
                            key={m.id}
                            onClick={() => {
                              setPhotoUrl(m.url);
                              setPhotoPreview(m.url);
                              setPhotoFile(null);
                            }}
                            className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition group ${
                              isSelected
                                ? 'border-amber-500 ring-2 ring-amber-500/30'
                                : 'border-slate-200 dark:border-slate-800 hover:border-amber-500/50'
                            }`}
                          >
                            <img
                              src={m.url}
                              alt={m.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition"
                            />
                            {isSelected && (
                              <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-md">
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </div>
                            )}
                            <div className="absolute inset-x-0 bottom-0 p-1 bg-black/60 backdrop-blur-xs text-[9px] text-white truncate font-medium">
                              {m.title}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Watermark Branding Card - Tự động hiện khi có ảnh */}
              {photoPreview && (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-slate-900/40 to-slate-950 border border-amber-500/30 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-500 flex items-center justify-center">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                          <span>Đóng dấu thương hiệu</span>
                          <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-md font-semibold">Watermark</span>
                        </h4>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400">
                          In Logo "{currentTargetChannel?.name || 'Góc Tăng Ca'}" bảo vệ bản quyền như các page lớn
                        </p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={enableWatermark}
                      onChange={(e) => setEnableWatermark(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-500 cursor-pointer accent-amber-500"
                    />
                  </div>

                  {enableWatermark && (
                    <div className="space-y-2.5 pt-2 border-t border-slate-200/50 dark:border-slate-800/80">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">Chọn vị trí & kiểu logo:</span>
                        {isWatermarking && (
                          <span className="text-[10px] text-amber-500 animate-pulse font-medium">⚡ Đang kết xuất...</span>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setWatermarkPos('bottom-right')}
                          className={`py-1.5 px-2 rounded-xl text-xs font-semibold border transition text-center ${
                            watermarkPos === 'bottom-right'
                              ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold shadow-sm'
                              : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-amber-500/40'
                          }`}
                        >
                          ↘ Góc dưới phải
                        </button>
                        <button
                          type="button"
                          onClick={() => setWatermarkPos('top-right')}
                          className={`py-1.5 px-2 rounded-xl text-xs font-semibold border transition text-center ${
                            watermarkPos === 'top-right'
                              ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold shadow-sm'
                              : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-amber-500/40'
                          }`}
                        >
                          ↗ Góc trên phải
                        </button>
                        <button
                          type="button"
                          onClick={() => setWatermarkPos('bottom-bar')}
                          className={`py-1.5 px-2 rounded-xl text-xs font-semibold border transition text-center ${
                            watermarkPos === 'bottom-bar'
                              ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold shadow-sm'
                              : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-amber-500/40'
                          }`}
                        >
                          ▬ Dải băng tin tức
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Multi-Platform Affiliate Box */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-orange-500/10 via-pink-500/5 to-transparent border border-orange-500/30 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-orange-500/20 text-orange-500 flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Tiếp thị liên kết Đa sàn (Shopee, TikTok Shop, Lazada - Tự động ghim Comment #1)
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      Đăng bài không chứa link ➡️ Ngay lập tức thả comment chứa link để né bóp tương tác 100%
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={enableShopee}
                  onChange={(e) => setEnableShopee(e.target.checked)}
                  className="w-4 h-4 rounded text-orange-500 cursor-pointer"
                />
              </div>

              {enableShopee && (
                <div className="space-y-3 pt-1">
                  <div>
                    <label className="text-[11px] text-slate-600 dark:text-slate-400 block mb-1">Đường dẫn Affiliate (Shopee, TikTok Shop, Lazada):</label>
                    <input
                      type="text"
                      value={shopeeLink}
                      onChange={(e) => setShopeeLink(e.target.value)}
                      placeholder="Dán link tiếp thị từ Shopee, TikTok Shop hoặc Lazada..."
                      className="w-full bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-600 dark:text-slate-400 block mb-1">Lời nhắn kèm link:</label>
                    <input
                      type="text"
                      value={shopeeCommentText}
                      onChange={(e) => setShopeeCommentText(e.target.value)}
                      className="w-full bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Schedule Option */}
            <div className="pt-1 flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={isScheduled}
                  onChange={(e) => setIsScheduled(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 cursor-pointer"
                />
                <CalendarClock className="w-4 h-4 text-amber-500" />
                <span>Lên lịch hẹn giờ đăng</span>
              </label>

              {isScheduled && (
                <input
                  type="datetime-local"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-amber-500"
                />
              )}
            </div>

            {/* Publish Button */}
            <button
              onClick={handlePublish}
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:opacity-95 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 transition disabled:opacity-50 scale-100 hover:scale-[1.01]"
            >
              <Send className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {loading
                ? 'Đang xử lý...'
                : isScheduled
                ? `Lên lịch đăng bài (${currentTargetChannel?.name})`
                : `Đăng ngay lên ${currentTargetChannel?.name}`}
            </button>

          </div>
        </div>

        {/* Right: Live Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <Eye className="w-4 h-4 text-sky-500" />
            <span>Xem trước giao diện ({currentTargetChannel?.name})</span>
          </div>

          {/* Facebook Post Card Mockup */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl">
            {/* Post Header */}
            <div className="p-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60">
              <div className="flex items-center gap-3">
                {currentTargetChannel?.avatar ? (
                  <img
                    src={currentTargetChannel.avatar}
                    alt="Avatar"
                    className="w-10 h-10 rounded-full border border-amber-500 object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center font-bold text-slate-950">
                    {currentTargetChannel?.name?.slice(0, 2).toUpperCase() || 'CH'}
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 leading-tight">
                    {currentTargetChannel?.name || 'Tên Kênh'}
                  </h4>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                    <span>Vừa xong</span>
                    <span>·</span>
                    <span>🌐</span>
                  </div>
                </div>
              </div>
              <span className="text-slate-400 text-lg">···</span>
            </div>

            {/* Post Content */}
            <div className="p-4 space-y-3">
              <p className="text-sm text-slate-800 dark:text-slate-100 whitespace-pre-line leading-relaxed font-normal">
                {caption || 'Nội dung bài viết sẽ hiển thị tại đây...'}
              </p>
            </div>

            {/* Post Image */}
            {photoPreview ? (
              <div className="relative w-full bg-black flex items-center justify-center max-h-96 overflow-hidden group">
                <img 
                  src={enableWatermark && watermarkedPreview ? watermarkedPreview : photoPreview} 
                  alt="Preview" 
                  className="w-full object-cover transition duration-300" 
                />
                {enableWatermark && (
                  <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-slate-950/85 backdrop-blur-md border border-amber-500/40 text-[10px] font-bold text-amber-400 flex items-center gap-1 shadow-lg pointer-events-none">
                    <ShieldCheck className="w-3 h-3 text-amber-400" />
                    <span>Watermark {currentTargetChannel?.name || 'Góc Tăng Ca'}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-48 bg-slate-100 dark:bg-slate-950/60 border-y border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-slate-500 dark:text-slate-600 text-xs">
                <span>(Chưa có ảnh được chọn)</span>
              </div>
            )}

            {/* Post Reactions Bar */}
            <div className="px-4 py-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px]">👍</span>
                <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-[10px]">😆</span>
                <span>Bạn và 86 người khác</span>
              </span>
              <span>18 bình luận</span>
            </div>

            {/* Post Action Buttons */}
            <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-1 text-xs text-slate-600 dark:text-slate-300 font-semibold text-center">
              <button className="py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center gap-1.5">
                <ThumbsUp className="w-3.5 h-3.5" /> Thích
              </button>
              <button className="py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5" /> Bình luận
              </button>
              <button className="py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center gap-1.5">
                <Share2 className="w-3.5 h-3.5" /> Chia sẻ
              </button>
            </div>

            {/* Pinned First Comment (Shopee Preview) */}
            {enableShopee && shopeeLink && (
              <div className="p-4 bg-slate-50 dark:bg-slate-950/90 border-t border-slate-200 dark:border-slate-800/80 space-y-2">
                <div className="flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-bold">
                  <Pin className="w-3 h-3" /> Đã ghim bình luận
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-amber-500 shrink-0 flex items-center justify-center text-[10px] font-bold text-slate-950">
                    {currentTargetChannel?.name?.slice(0, 2).toUpperCase() || 'CH'}
                  </div>
                  <div className="flex-1 bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-transparent rounded-2xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-200 space-y-1 shadow-xs">
                    <span className="font-bold text-slate-900 dark:text-slate-100 block">
                      {currentTargetChannel?.name || 'Tên Kênh'}
                    </span>
                    <p className="whitespace-pre-line text-slate-700 dark:text-slate-300">
                      {shopeeCommentText}
                    </p>
                    <a
                      href={shopeeLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-orange-600 dark:text-orange-400 hover:underline font-bold block truncate"
                    >
                      👉 {shopeeLink}
                    </a>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* MODAL POPUP: PROMPT TẠO MEME & CAPTION CHUẨN GÓC TĂNG CA */}
      {showPromptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="app-card w-full max-w-2xl max-h-[90vh] flex flex-col p-6 space-y-4 shadow-2xl border border-amber-500/40 relative">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <span>Prompt Tạo Meme AI (Chuẩn Vibe Góc Tăng Ca)</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Dán prompt này vào <b>ChatGPT / Claude / Gemini</b> kèm ảnh meme của bạn để nhận chữ trên ảnh và caption chuẩn phong cách!
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowPromptModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Prompt Content Preview */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              <div className="relative">
                <textarea
                  readOnly
                  rows={12}
                  value={MEME_PROMPT_TEMPLATE}
                  className="w-full p-4 rounded-xl font-mono text-xs leading-relaxed bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 select-all focus:outline-none"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setCaption(
                    `Sáng thứ 6 gáy to như chúa tể tiệc tùng, chiều thứ 6 về đến phòng trọ chỉ muốn hoá đá trên giường 🥲\nCó bác nào cùng hội "già trước tuổi" cuối tuần không giơ tay cái nào...\n\n#GocTangCa #ThuSau #CuoiTuan #DanVanPhong`
                  );
                  setShowPromptModal(false);
                }}
                className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline"
              >
                + Điền thử Caption mẫu vào bài viết
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setShowPromptModal(false)}
                  className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition"
                >
                  Đóng
                </button>

                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(MEME_PROMPT_TEMPLATE);
                    setPromptCopied(true);
                    setTimeout(() => setPromptCopied(false), 2500);
                  }}
                  className="flex-1 sm:flex-none px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
                >
                  {promptCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{promptCopied ? 'Đã sao chép Prompt!' : 'Sao chép Prompt (1-Click)'}</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
