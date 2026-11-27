import React, { useState } from 'react';
import axios from 'axios';
import { 
  Settings, 
  Layers, 
  PlusCircle, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Save, 
  RefreshCw,
  Sparkles,
  Download
} from 'lucide-react';

export default function SettingsTab({ status, onRefreshStatus, onSwitchChannel }) {
  const settings = status?.settings || {};
  const channels = status?.channels || [];
  const activeChannel = status?.activeChannel;

  // Manual add channel
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPageName, setNewPageName] = useState('');
  const [newPageId, setNewPageId] = useState('');
  const [newPageToken, setNewPageToken] = useState('');
  const [newPageTone, setNewPageTone] = useState('office_meme');

  // Auto scan user token
  const [userToken, setUserToken] = useState('');
  const [scanning, setScanning] = useState(false);

  // Gemini Key
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [savingKey, setSavingKey] = useState(false);

  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  // 1. Quét toàn bộ page từ User Token
  const handleScanPages = async () => {
    if (!userToken.trim()) {
      setError('Vui lòng dán User Access Token để quét danh sách Page!');
      return;
    }
    setScanning(true);
    setError('');
    setMsg('');
    try {
      const res = await axios.post('/api/channels/sync-facebook', { userToken: userToken.trim() });
      setMsg(`🎉 Đã tìm thấy và nhập thành công ${res.data.discoveredCount} Fanpage vào hệ thống!`);
      setUserToken('');
      if (onRefreshStatus) onRefreshStatus();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setScanning(false);
    }
  };

  // 2. Thêm Fanpage thủ công
  const handleAddManual = async (e) => {
    e.preventDefault();
    if (!newPageName || !newPageId || !newPageToken) {
      setError('Vui lòng điền đủ Tên Page, Page ID và Page Access Token!');
      return;
    }
    try {
      await axios.post('/api/channels', {
        id: `fb_${newPageId}`,
        platform: 'facebook',
        name: newPageName,
        pageId: newPageId,
        accessToken: newPageToken,
        defaultTone: newPageTone
      });
      setMsg(`🎉 Đã thêm Fanpage "${newPageName}" vào hệ thống!`);
      setNewPageName('');
      setNewPageId('');
      setNewPageToken('');
      setShowAddForm(false);
      if (onRefreshStatus) onRefreshStatus();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  // 3. Xoá kênh
  const handleDeleteChannel = async (id, name) => {
    if (channels.length <= 1) {
      setError('Cần giữ lại ít nhất 1 kênh trong hệ thống!');
      return;
    }
    if (window.confirm(`Bạn có chắc muốn xoá kênh "${name}"?`)) {
      try {
        await axios.delete(`/api/channels/${id}`);
        setMsg(`Đã xoá kênh "${name}"`);
        if (onRefreshStatus) onRefreshStatus();
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      }
    }
  };

  // 4. Lưu Gemini Key
  const handleSaveGeminiKey = async (e) => {
    e.preventDefault();
    setSavingKey(true);
    setMsg('');
    setError('');
    try {
      await axios.post('/api/settings', { geminiApiKey });
      setMsg('✅ Đã lưu Google Gemini API Key!');
      if (onRefreshStatus) onRefreshStatus();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setSavingKey(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-amber-500" />
          Quản lý Kênh & Cấu hình Đa Nền Tảng
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Scale không giới hạn: Thêm nhiều Fanpage Facebook, chuẩn bị cho YouTube Shorts & TikTok.
        </p>
      </div>

      {msg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
          <span className="font-medium">{msg}</span>
        </div>
      )}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-300 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* SECTION 1: DANH SÁCH CÁC KÊNH ĐANG KẾT NỐI */}
      <div className="app-card p-6 sm:p-7 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Danh sách Kênh & Fanpage đã kết nối ({channels.length})</h3>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            {showAddForm ? 'Đóng form' : 'Thêm Page thủ công'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {channels.map((c) => (
            <div
              key={c.id}
              className={`p-4 rounded-2xl border transition flex items-center justify-between ${
                c.id === activeChannel?.id
                  ? 'bg-amber-500/15 border-amber-500/40 text-slate-900 dark:text-white'
                  : 'app-card-raised text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-amber-600 dark:text-amber-400 text-xs">
                  {c.platform === 'facebook' ? 'FB' : c.platform === 'youtube' ? 'YT' : 'TT'}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    {c.name}
                    {c.id === activeChannel?.id && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-extrabold shadow-xs">
                        Đang chọn
                      </span>
                    )}
                  </h4>
                  <p className="text-[11px] text-slate-500">ID: {c.pageId || c.id}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {c.id !== activeChannel?.id && (
                  <button
                    onClick={() => onSwitchChannel(c.id)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition"
                  >
                    Chọn kênh này
                  </button>
                )}
                <button
                  onClick={() => handleDeleteChannel(c.id, c.name)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  title="Xoá kênh"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: FORM THÊM FANPAGE THỦ CÔNG */}
      {showAddForm && (
        <form onSubmit={handleAddManual} className="app-card p-6 space-y-4 animate-fadeIn border-amber-500/30">
          <h4 className="text-sm font-bold text-amber-600 dark:text-amber-400">➕ Thêm Fanpage mới vào Hub:</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Tên Fanpage:</label>
              <input
                type="text"
                value={newPageName}
                onChange={(e) => setNewPageName(e.target.value)}
                placeholder="Ví dụ: Fact Độc Lạ, Chó Mèo Hài..."
                className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Page ID:</label>
              <input
                type="text"
                value={newPageId}
                onChange={(e) => setNewPageId(e.target.value)}
                placeholder="Dãy số ID của trang..."
                className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Page Access Token:</label>
            <input
              type="password"
              value={newPageToken}
              onChange={(e) => setNewPageToken(e.target.value)}
              placeholder="EAAXRjwtZAPrUB..."
              className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md"
          >
            Lưu Fanpage này
          </button>
        </form>
      )}

      {/* SECTION 3: TỰ ĐỘNG QUÉT TẤT CẢ FANPAGE TỪ NICK FACEBOOK */}
      <div className="app-card p-6 sm:p-7 space-y-4">
        <div className="flex items-center gap-2">
          <Download className="w-5 h-5 text-sky-500" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Quét và nhập tự động toàn bộ Fanpage của bạn</h3>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Chỉ cần dán <b>User Access Token</b> vào đây, hệ thống sẽ tự động gọi Meta Graph API để lấy danh sách tất cả các Fanpage bạn đang làm Admin và nạp vào SocialHub cùng lúc!
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="password"
            value={userToken}
            onChange={(e) => setUserToken(e.target.value)}
            placeholder="Dán User Access Token từ Graph API Explorer..."
            className="flex-1 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
          />
          <button
            type="button"
            onClick={handleScanPages}
            disabled={scanning}
            className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 disabled:opacity-50 shadow-md"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${scanning ? 'animate-spin' : ''}`} />
            {scanning ? 'Đang quét...' : 'Quét & Nhập toàn bộ'}
          </button>
        </div>
      </div>

      {/* SECTION 4: GOOGLE GEMINI API KEY */}
      <form onSubmit={handleSaveGeminiKey} className="app-card p-6 sm:p-7 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Google Gemini AI Key (Trí tuệ nhân tạo)</h3>
          </div>
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
            status?.gemini?.hasKey
              ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-400 border border-emerald-500/30'
              : 'bg-amber-500/15 text-amber-800 dark:text-amber-400 border border-amber-500/30'
          }`}>
            {status?.gemini?.hasKey ? '✓ Đã kết nối' : 'Đang dùng mẫu sẵn'}
          </span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Dùng để sinh ý tưởng meme, kịch bản video Reels/Shorts/TikTok cho tất cả các kênh. Lấy miễn phí tại <i>aistudio.google.com</i>.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="password"
            value={geminiApiKey}
            onChange={(e) => setGeminiApiKey(e.target.value)}
            placeholder={status?.gemini?.hasKey ? '•••••••••••••••• (Để trống nếu không đổi)' : 'AIzaSy...'}
            className="flex-1 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-purple-500"
          />
          <button
            type="submit"
            disabled={savingKey}
            className="px-6 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 disabled:opacity-50 shadow-md"
          >
            <Save className="w-4 h-4" />
            {savingKey ? 'Đang lưu...' : 'Lưu Gemini Key'}
          </button>
        </div>
      </form>

    </div>
  );
}
