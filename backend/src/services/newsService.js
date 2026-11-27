import axios from 'axios';
import * as cheerio from 'cheerio';
import { db } from '../db.js';

// Danh sách các nguồn RSS báo chí chất lượng cao
export const NEWS_SOURCES = [
  {
    id: 'cafebiz',
    name: 'CafeBiz - Đời sống & Công sở',
    category: 'Công sở & Doanh nghiệp',
    feedUrl: 'https://cafebiz.vn/rss/cau-chuyen-kinh-doanh.rss',
    color: 'from-orange-500 to-amber-500'
  },
  {
    id: 'vnexpress',
    name: 'VnExpress - Đời sống',
    category: 'Đời sống & Xã hội',
    feedUrl: 'https://vnexpress.net/rss/doi-song.rss',
    color: 'from-rose-500 to-red-600'
  },
  {
    id: 'genk',
    name: 'GenK - Công nghệ số',
    category: 'Công nghệ & Xu hướng',
    feedUrl: 'https://genk.vn/rss/home.rss',
    color: 'from-blue-500 to-indigo-600'
  },
  {
    id: 'dantri',
    name: 'Dân Trí - Kinh doanh',
    category: 'Kinh tế & Thị trường',
    feedUrl: 'https://dantri.com.vn/rss/kinh-doanh.rss',
    color: 'from-emerald-500 to-teal-600'
  }
];

// 1. Quét tin tức RSS từ nguồn báo chí
export async function fetchNewsFeed(sourceId = 'cafebiz', limit = 15) {
  const source = NEWS_SOURCES.find((s) => s.id === sourceId) || NEWS_SOURCES[0];

  try {
    const res = await axios.get(source.feedUrl, {
      timeout: 8000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const $ = cheerio.load(res.data, { xmlMode: true });
    const items = [];

    $('item').each((i, el) => {
      if (i >= limit) return false;

      const title = $(el).find('title').text().replace(/^<!\[CDATA\[|\]\]>$/g, '').trim();
      const link = $(el).find('link').text().trim();
      const pubDate = $(el).find('pubDate').text().trim();
      const rawDesc = $(el).find('description').text().trim();

      // Bóc tách ảnh từ thẻ description hoặc enclosure
      let image = $(el).find('enclosure').attr('url') || '';
      if (!image && rawDesc) {
        const descMatch = rawDesc.match(/src=["'](.*?)["']/);
        if (descMatch && descMatch[1]) {
          image = descMatch[1];
        }
      }

      // Làm sạch mô tả (bỏ các thẻ html)
      const cleanDesc = rawDesc.replace(/<[^>]*>?/gm, '').trim();

      if (title && link) {
        items.push({
          id: Buffer.from(link).toString('base64').slice(0, 16),
          title,
          link,
          pubDate: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
          description: cleanDesc,
          image: image || null,
          sourceName: source.name,
          sourceId: source.id
        });
      }
    });

    return items;
  } catch (err) {
    console.error(`Lỗi khi quét RSS ${source.name}:`, err.message);
    return [];
  }
}

// 2. Cào toàn bộ nội dung từ 1 URL bất kỳ trên Internet
export async function scrapeArticleFromUrl(url) {
  if (!url) throw new Error('Vui lòng cung cấp URL bài viết');

  const isFacebook = url.includes('facebook.com') || url.includes('fb.watch');

  try {
    const res = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': isFacebook 
          ? 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)'
          : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
      }
    });

    const $ = cheerio.load(res.data);

    // Lấy tiêu đề bài viết
    let title = $('meta[property="og:title"]').attr('content') 
      || $('h1').first().text().trim() 
      || $('title').text().trim();

    // Lấy ảnh bài viết
    let image = $('meta[property="og:image"]').attr('content') || null;
    if (!image) {
      image = $('article img').first().attr('src') || $('img').first().attr('src') || null;
    }
    // Chuẩn hóa link ảnh tương đối
    if (image && image.startsWith('/')) {
      const urlObj = new URL(url);
      image = `${urlObj.origin}${image}`;
    }

    // Lấy tóm tắt
    let description = $('meta[property="og:description"]').attr('content') 
      || $('meta[name="description"]').attr('content') 
      || '';

    // Bóc tách nội dung chính (lấy các thẻ p có độ dài đủ lớn)
    const paragraphs = [];
    $('article p, .detail-content p, .content-detail p, .fck_detail p, p').each((_, el) => {
      const text = $(el).text().trim();
      // Bỏ qua các đoạn text quá ngắn hoặc chứa bản quyền, comment
      if (text.length > 35 && !text.includes('Bản quyền') && !text.includes('Copyright')) {
        paragraphs.push(text);
      }
    });

    // Gom tối đa 5-8 đoạn văn chính
    const fullText = paragraphs.slice(0, 8).join('\n\n');

    // Nếu là Facebook và bị trả về trang login
    if (isFacebook && (title.includes('Đăng nhập') || title.includes('Log in') || (!description && !fullText))) {
      throw new Error('Facebook đã chặn truy cập ẩn danh đối với link này. Vui lòng chuyển sang tab "Dán văn bản bài viết" để copy nội dung vào nhé!');
    }

    return {
      title: title || 'Bài viết được chia sẻ',
      image,
      description,
      fullText: fullText || description,
      url
    };
  } catch (err) {
    console.error('Lỗi khi cào dữ liệu từ URL:', err.message);
    if (isFacebook) {
      throw new Error('Facebook yêu cầu đăng nhập đối với link bài viết này. Bạn hãy chuyển sang tab "Dán văn bản bài viết" để copy nội dung vào nhé!');
    }
    throw new Error(`Không thể cào dữ liệu từ trang này (${err.message}). Có thể trang yêu cầu đăng nhập hoặc chặn bot.`);
  }
}

// 3. Sử dụng AI để "xào" tin tức thành bài viết Fanpage
export async function rewriteNewsToSocialPost({ title, description, fullText, tone = 'office_meme', channelName = 'Góc Tăng Ca' }) {
  const settings = db.getSettings();
  const apiKey = settings.geminiApiKey || process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const prompt = `Bạn là một Content Creator chuyên nghiệp, phụ trách sáng tạo nội dung cho Fanpage Facebook "${channelName}".
Nhiệm vụ: Đọc tin tức/bài viết dưới đây và "xào lại" (rewrite) thành 1 bài đăng Facebook cực kỳ thu hút, dễ đọc, giật tít và kích thích tương tác cao giữa cộng đồng dân công sở/bạn đọc trẻ.

THÔNG TIN BÀI GỐC:
- Tiêu đề gốc: ${title}
- Tóm tắt/Nội dung: ${fullText || description}

YÊU CẦU ĐỊNH DẠNG:
- Dòng 1: Tiêu đề giật tít thật cuốn, có emoji phù hợp (ví dụ: 📢 [GÓC TĂNG CA], ☕ ĐỜI SỐNG CÔNG SỞ, 🚨 CÂU CHUYỆN ĐI LÀM...).
- Thân bài: Tóm tắt 3-4 ý chính dễ hiểu nhất, dùng gạch đầu dòng emoji (📌, 👉, 💡), lời văn dí dỏm, thực tế, đúng tâm lý người đi làm.
- Kết bài: 1 câu hỏi tương tác mở kích thích người đọc bình luận (CTA).
- Cuối bài: 4-5 hashtag viral liên quan (ví dụ: #GocTangCa #ChuyenCongSo #DiLam #KinhDoanh).

Chỉ trả về nội dung bài viết hoàn chỉnh, không kèm lời giải thích rườm rà.`;

      const res = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`,
        {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.8
          }
        }
      );

      const generatedText = res.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (generatedText) {
        return {
          success: true,
          caption: generatedText.trim()
        };
      }
    } catch (err) {
      console.error('Lỗi gọi Gemini API khi xào bài:', err.response?.data || err.message);
    }
  }

  // Fallback thông minh nếu chưa có Gemini Key
  const fallbackCaption = `📢 ${title.toUpperCase()}

📌 Tóm tắt nhanh cho anh em đỡ phải đọc dài:
👉 ${description || fullText?.slice(0, 150) || 'Tin tức nóng sốt vừa được ghi nhận...'}

💡 Câu chuyện này các bác ở công ty thấy quen không? Đúng là đi làm trăm chuyện dở khóc dở cười 😂

👇 Anh em có góc nhìn thế nào về vụ này? Thả bình luận bên dưới nhé!

#GocTangCa #ChuyenCongSo #TinTucMoi #DiLamVuiVe`;

  return {
    success: true,
    caption: fallbackCaption
  };
}
