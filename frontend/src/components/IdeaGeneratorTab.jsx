import React, { useState } from 'react';
import axios from 'axios';
import { Sparkles, ArrowRight, Copy, Check, Hash, Image as ImageIcon, Video } from 'lucide-react';

export default function IdeaGeneratorTab({ onUseIdea, hasGeminiKey }) {
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('office_meme');
  const [platform, setPlatform] = useState('facebook_post');
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const toneOptions = [
    { id: 'office_meme', label: '🏢 Meme Công sở / Tăng ca' },
    { id: 'facts_science', label: '🧠 Tri thức / Fact độc lạ' },
    { id: 'pets_cute', label: '🐱 Thú cưng / Boss ngáo' },
    { id: 'genz_lifestyle', label: '⚡ Đời sống Gen Z' },
    { id: 'affiliate_review', label: '🛍️ Review đồ hay / Shopee' }
  ];

  const platformOptions = [
    { id: 'facebook_post', label: '🖼️ Bài đăng Facebook (Meme/Ảnh)', icon: ImageIcon },
    { id: 'reels_shorts', label: '📱 Video ngắn (Reels / Shorts / TikTok)', icon: Video }
  ];

  const handleGenerate = async (customQuery = '') => {
    const q = customQuery || topic;
    setLoading(true);
    try {
      const res = await axios.post('/api/ai/ideas', { topic: q, tone, platform });
      setIdeas(res.data.ideas || []);
    } catch (err) {
      console.error('Lỗi sinh ý tưởng:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      
      {/* Configuration Header Card */}
      <div className="app-card p-6 sm:p-8 space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-700 dark:text-purple-300 text-xs font-semibold border border-purple-500/30 mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Bộ não sáng tạo nội dung Đa Kênh (Gemini AI)
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Sinh ý tưởng & Kịch bản Viral theo phong cách
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Tự động đổi giọng văn theo từng loại Fanpage hoặc kênh YouTube/TikTok của bạn.
          </p>
        </div>

        {/* Tone and Platform Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              1. Chọn phong cách (Tone of Voice):
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {toneOptions.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTone(t.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium border text-left transition truncate ${
                    tone === t.id
                      ? 'bg-amber-500/15 border-amber-500/50 text-amber-800 dark:text-amber-300 font-bold shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/80 dark:hover:bg-slate-800'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              2. Định dạng xuất bản:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {platformOptions.map((p) => {
                const Icon = p.icon;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPlatform(p.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition ${
                      platform === p.id
                        ? 'bg-amber-500/15 border-amber-500/50 text-amber-800 dark:text-amber-300 font-bold shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/80 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{p.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Input topic */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            placeholder="Nhập chủ đề gợi ý (để trống nếu muốn AI tự sáng tạo ý tưởng trending)..."
            className="flex-1 bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl px-4 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-amber-500 transition"
          />
          <button
            onClick={() => handleGenerate()}
            disabled={loading}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Đang tạo...' : 'Tạo ý tưởng'}
          </button>
        </div>
      </div>

      {/* Ideas list */}
      {ideas.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Kết quả sáng tạo ({ideas.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ideas.map((item, idx) => (
              <div
                key={idx}
                className="app-card p-6 flex flex-col justify-between space-y-4 hover:border-amber-500/40 transition group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                      Chủ đề: {item.topic}
                    </span>
                    <button
                      onClick={() => handleCopy(`${item.punchline}\n\n${item.hashtags?.join(' ') || ''}`, idx)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      title="Copy nội dung"
                    >
                      {copiedIndex === idx ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl app-card-raised">
                    <p className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 whitespace-pre-line leading-relaxed">
                      "{item.punchline}"
                    </p>
                  </div>

                  {item.script && (
                    <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-800 dark:text-purple-200 space-y-1">
                      <div className="font-bold flex items-center gap-1"><Video className="w-3.5 h-3.5" /> Kịch bản Video 30s:</div>
                      <div className="whitespace-pre-line text-slate-700 dark:text-slate-300 font-medium">{item.script}</div>
                    </div>
                  )}

                  {item.memeSuggestion && (
                    <div className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400 pt-1">
                      <ImageIcon className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <span><b>Hình ảnh / Meme gợi ý:</b> {item.memeSuggestion}</span>
                    </div>
                  )}

                  {item.hashtags && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {item.hashtags.map((tag, tIdx) => (
                        <span key={tIdx} className="text-[11px] text-slate-500 dark:text-slate-500 font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => onUseIdea({
                      caption: item.punchline,
                      hashtags: item.hashtags?.join(' ') || ''
                    })}
                    className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-amber-500 group-hover:text-slate-950 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition"
                  >
                    Dùng nội dung này để soạn bài <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
