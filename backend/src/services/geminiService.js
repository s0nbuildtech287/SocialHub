import axios from 'axios';
import { db } from '../db.js';

const TONES_CONFIG = {
  office_meme: {
    label: 'Meme Công sở / Tăng ca',
    desc: 'Hài hước, cộc lốc, cay đắng, châm biếm deadline, sếp, đi muộn, hết tiền, kết thúc bằng :)))',
    defaultHashtag: '#CongSo #GocTangCa #Deadline #DanVanPhong'
  },
  facts_science: {
    label: 'Tri thức / Fact độc lạ',
    desc: 'Bí ẩn khoa học, sự thật ít người biết, tâm lý học con người, giật tít tò mò, giữ chân người xem',
    defaultHashtag: '#KhamPha #TriThuc #KyLa #BanCoBiet'
  },
  pets_cute: {
    label: 'Thú cưng / Boss ngáo',
    desc: 'Đáng yêu, hài hước, lồng tiếng góc nhìn chó mèo trách móc con sen, biểu cảm ngáo ngơ',
    defaultHashtag: '#BossVaSen #MeoNgao #ChoCung #PetMemes'
  },
  genz_lifestyle: {
    label: 'Đời sống Gen Z / Trend',
    desc: 'Bắt trend mạng xã hội, tình yêu gà bông, drama học đường, tiền bạc, hài dí dỏm',
    defaultHashtag: '#GenZ #DoiSong #Trending #HaiHuoc'
  },
  affiliate_review: {
    label: 'Review / Giới thiệu đồ hay',
    desc: 'Khen chê chân thực, giải quyết vấn đề đời sống hàng ngày, kích thích tò mò bấm link mua hàng',
    defaultHashtag: '#ReviewCoTam #DoHayHo #ShopeeReview #GiaiCuuDoiSong'
  }
};

const PLATFORMS_CONFIG = {
  facebook_post: 'Bài đăng ảnh/meme Facebook (Caption ngắn, giật punchline)',
  reels_shorts: 'Kịch bản Video ngắn 30-60s cho Facebook Reels / YouTube Shorts / TikTok (Hook 3s đầu, thân bài, Call to action)',
  tiktok_video: 'Ý tưởng video TikTok (Trending sound, hiệu ứng, text overlay)'
};

export async function generateContentIdeas({ topic = '', tone = 'office_meme', platform = 'facebook_post' }) {
  const settings = db.getSettings();
  const apiKey = settings.geminiApiKey;
  const currentTone = TONES_CONFIG[tone] || TONES_CONFIG.office_meme;
  const currentPlatform = PLATFORMS_CONFIG[platform] || PLATFORMS_CONFIG.facebook_post;

  // Fallback nếu chưa có key Gemini
  if (!apiKey) {
    return [
      {
        topic: topic || 'Chủ đề hot trong ngày',
        punchline: topic 
          ? `Về chuyện ${topic}: Người ta thì chill chill tận hưởng, còn mình thì bục mặt cày cuốc :)))`
          : 'Hôm nay đi làm muộn đúng 1 phút và cái kết bị trừ lương cả buổi :)))',
        memeSuggestion: 'Meme nhân vật hoạt hình mặt đơ hoặc mèo bất lực',
        hashtags: currentTone.defaultHashtag.split(' '),
        script: platform !== 'facebook_post' ? '0-3s: Hook giật mình nhìn đồng hồ.\n3-15s: Đứng chờ thang máy nghẹt thở.\n15-30s: Chấm công lúc 8h01 và cái kết :)))' : null
      },
      {
        topic: 'Cuối tháng tài khoản báo động',
        punchline: 'Nhìn số dư tài khoản tưởng mã OTP, cày nốt hôm nay mai ăn mì gói :)))',
        memeSuggestion: 'Capybara trùm chăn ôm ống heo rỗng',
        hashtags: ['#TienLuong', '#HetTien', '#CuocSong'],
        script: null
      }
    ];
  }

  try {
    const prompt = `Bạn là chuyên gia sáng tạo nội dung mạng xã hội đa nền tảng (Facebook, TikTok, YouTube).
Nhiệm vụ: Tạo ra 4 ý tưởng nội dung ${topic ? `về chủ đề: "${topic}"` : 'được quan tâm nhiều nhất'}.

Yêu cầu định dạng:
- Phong cách / Tone: ${currentTone.label} (${currentTone.desc}).
- Định dạng xuất bản: ${currentPlatform}.
- Văn phong: Ngắn gọn, dí dỏm, văn hóa mạng Việt Nam, tự nhiên, không sáo rỗng.

Trả về DUY NHẤT định dạng JSON mảng (không bọc text ngoài json):
[
  {
    "topic": "Tên chủ đề ngắn",
    "punchline": "Nội dung caption hoặc Hook giật người xem",
    "memeSuggestion": "Mô tả hình ảnh hoặc meme template phù hợp",
    "hashtags": ["#Tag1", "#Tag2"],
    "script": "${platform !== 'facebook_post' ? 'Kịch bản ngắn 3 cảnh quay kèm giọng đọc' : ''}"
  }
]`;

    const res = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.85,
          responseMimeType: 'application/json'
        }
      }
    );

    const text = res.data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text) {
      return JSON.parse(text);
    }
  } catch (err) {
    console.error('Lỗi Gemini API:', err.response?.data || err.message);
  }

  // Fallback
  return [
    {
      topic: topic || 'Ý tưởng linh hoạt',
      punchline: `${topic || 'Chuyện hôm nay'} - Cười một cái cho đời bớt áp lực nào các bác :)))`,
      memeSuggestion: 'Meme hài hước phản ánh sự đối lập',
      hashtags: currentTone.defaultHashtag.split(' ')
    }
  ];
}

function cleanAndParseJson(raw) {
  if (!raw) return null;
  let str = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  try {
    return JSON.parse(str);
  } catch (e1) {
    // Remove trailing commas before } or ]
    const withoutTrailingCommas = str.replace(/,\s*([}\]])/g, '$1');
    try {
      return JSON.parse(withoutTrailingCommas);
    } catch (e2) {
      console.error('Lỗi parse JSON Gemini:', e1.message);
      return null;
    }
  }
}

export async function generateComicStoryScript({ topic = 'Sự kiên trì và những thất bại âm thầm', style = 'fable' }) {
  const settings = db.getSettings();
  const apiKey = settings.geminiApiKey;

  if (!apiKey) {
    throw new Error('Chưa cấu hình Gemini API Key trong hệ thống. Vui lòng bấm nút màu vàng "Lấy Prompt Sang Web Chat" để dán vào ChatGPT!');
  }

  const prompt = `Bạn là đạo diễn và biên kịch hàng đầu thế giới về thể loại truyện tranh ngắn ngụ ngôn cuộc sống (Moral Storybook Fable Comics) định dạng 9:16 dọc trên YouTube Shorts / TikTok.

NHIỆM VỤ CỐT LÕI:
Sáng tạo một câu chuyện ngụ ngôn cảm động, giàu triết lý và tạo động lực sâu sắc DỰA TRÊN ĐÚNG CHỦ ĐỀ: "${topic}".
LƯU Ý: Phải sáng tạo nhân vật, đồ vật và tình huống hoàn toàn mới xoay quanh chủ đề "${topic}". KHÔNG ĐƯỢC lặp lại câu chuyện cây táo hay người thợ gốm.

QUY TẮC BẮT BUỘC (KHÔNG ĐƯỢC LÀM SAI):
1. BẮT BUỘC CÓ 2 NHÂN VẬT ĐỐI THOẠI QUA LẠI:
   - Nhân vật A (Người có lương tâm / thông thái / chính trực): Đại diện cho đạo đức, sự tử tế và cái nhìn sâu sắc.
   - Nhân vật B (Người hoài nghi / thực dụng / bị cám dỗ): Đại diện cho lòng tham hoặc sự bồng bột của con người.
2. BẮT BUỘC PHẢI CÓ TỪ 10 ĐẾN 12 KHUNG TRANH (PANELS) - KHÔNG ĐƯỢC ÍT HƠN:
   - Panel 1 & 2: Tình huống phát sinh liên quan trực tiếp đến "${topic}" + Nhân vật B đưa ra ý kiến thực dụng.
   - Panel 3 & 4: Nhân vật A can ngăn, giải thích + Nhân vật B phản biện, tranh cãi.
   - Panel 5 & 6: Cú lật ngược tư duy đắt giá (The Wisdom) của Nhân vật A (bài học triết lý sâu sắc) + Nhân vật B sững sờ, đứng im lặng suy ngẫm (Stood in silence).
   - Panel 7, 8, 9: Dòng chảy thời gian 3 ô nhỏ hoặc hành động biến chuyển / bài học nhân quả được chứng minh.
   - Panel 10 & 11: Kết cục ấm áp, sự thanh thản trong tâm hồn hoặc cái giá của sự lựa chọn.
3. LỜI THOẠI TIẾNG ANH NGẮN GỌN (Dưới 12 từ mỗi ô thoại, cực kỳ súc tích dễ đọc).

Yêu cầu xuất ra định dạng JSON DUY NHẤT:
{
  "title": "TIÊU ĐỀ TIẾNG ANH (IN HOA, NGẮN GỌN)",
  "vietnameseTitle": "Tiêu đề tiếng Việt",
  "summary": "Tóm tắt 1-2 câu về ý nghĩa câu chuyện",
  "panels": [
    {
      "panelNumber": 1,
      "title": "Tên phân cảnh",
      "sceneDescription": "Mô tả chi tiết hình ảnh, nét mặt, bối cảnh cho họa sĩ vẽ",
      "dialogueOrNarration": "Lời thoại hoặc lời dẫn tiếng Anh ngắn (kèm dịch tiếng Việt)"
    }
  ],
  "bottomPunchline": "Câu chốt hạ in đậm ở đáy trang truyện (1 câu tiếng Anh cực kỳ truyền cảm hứng và sâu sắc)",
  "bgmSuggestions": [
    {
      "title": "Tên bài nhạc",
      "artist": "Nghệ sĩ",
      "vibe": "Mô tả cảm xúc nhạc",
      "searchQuery": "Từ khóa tìm kiếm YouTube"
    }
  ]
}`;

  // Thử gọi tối đa 2 lần nếu Google trả về 503 (High demand)
  let lastError = null;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const res = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`,
        {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.8,
            responseMimeType: 'application/json'
          }
        },
        { timeout: 25000 }
      );

      const text = res.data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        const parsed = cleanAndParseJson(text);
        if (parsed && (parsed.title || parsed.panels)) {
          return parsed;
        }
      }
    } catch (err) {
      lastError = err;
      const status = err.response?.status;
      console.warn(`Lần ${attempt} gọi Gemini API thất bại (status: ${status}):`, err.response?.data?.error?.message || err.message);
      if (attempt < 2 && (status === 503 || status === 429)) {
        // Nghỉ 1.5 giây rồi thử lại
        await new Promise(r => setTimeout(r, 1500));
      }
    }
  }

  // Nếu cả 2 lần đều không thành công, báo lỗi thật chứ không trả dữ liệu mock gây hiểu nhầm
  const errMsg = lastError?.response?.data?.error?.message || lastError?.message || 'Không thể kết nối máy chủ Google AI';
  throw new Error(`Google AI đang bị nghẽn (${errMsg}). Bạn hãy bấm nút màu vàng "📋 Lấy Prompt Sang Web Chat" để dán vào ChatGPT nhé!`);
}
