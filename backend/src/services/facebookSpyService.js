import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

export async function scrapePagePosts(pageUrl = 'https://www.facebook.com/Theanh28/', maxScrolls = 6) {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-notifications',
      '--disable-geolocation',
      '--lang=vi-VN,vi'
    ]
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

    await page.goto(pageUrl, { waitUntil: 'networkidle2', timeout: 35000 });

    // Đóng popup đăng nhập nếu có
    try {
      await page.waitForSelector('[aria-label="Đóng"], [aria-label="Close"]', { timeout: 3000 });
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('[aria-label="Đóng"], [aria-label="Close"]'));
        btns.forEach(b => b.click());
      });
    } catch {}

    // Lấy tên Page
    const pageName = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      return h1 ? h1.innerText.trim() : 'Fanpage';
    });

    // Cuộn trang để tải thêm bài viết
    for (let i = 0; i < maxScrolls; i++) {
      await page.evaluate(() => window.scrollBy(0, 1800));
      await new Promise(r => setTimeout(r, 1200));
    }

    // Bóc tách bài viết chuẩn xác + Lấy link bài viết
    const posts = await page.evaluate((targetPageName, basePageUrl) => {
      const articles = document.querySelectorAll('div[role="feed"] > div, div[role="article"]');
      const list = [];
      const seenCaptions = new Set();

      articles.forEach((art) => {
        const text = art.innerText || '';
        if (text.length < 25) return;

        // Bóc tách thời gian đăng bài
        const timeMatch = text.match(/(\d+\s*(giờ|phút|ngày|tháng|h|m)|Vừa xong|Hôm qua)/i);
        const timeStr = timeMatch ? timeMatch[0] : 'Vừa xong';

        // 1. Thử lấy từ các khối văn bản div[dir="auto"] (nơi Facebook chứa caption bài đăng)
        const textElements = Array.from(art.querySelectorAll('div[dir="auto"]'));
        let foundCaption = '';

        for (const el of textElements) {
          const t = el.innerText?.trim() || '';
          if (
            t.length > 10 &&
            t !== targetPageName &&
            !t.includes('verified badge') &&
            !t.includes('Accounts with a') &&
            !t.includes('Meta Verified') &&
            !t.includes('Thích') &&
            !t.includes('Bình luận') &&
            !t.includes('Chia sẻ') &&
            !t.match(/^(vừa xong|\d+\s*(h|m|phút|giờ))/i)
          ) {
            foundCaption = t;
            break;
          }
        }

        // 2. Fallback nếu không tìm thấy qua div[dir="auto"]
        if (!foundCaption) {
          const lines = text
            .split('\n')
            .map(l => l.trim())
            .filter(l => 
              l.length > 10 && 
              l !== targetPageName &&
              !l.includes('verified badge') &&
              !l.includes('Accounts with a') &&
              !l.includes('Meta Verified') &&
              !l.includes('Online status') &&
              !l.includes('Người theo dõi') &&
              !l.includes('Đang theo dõi') &&
              !l.includes('Gửi tin nhắn') &&
              !l.includes('Tất cả cảm xúc') &&
              !l.includes('Thích') && 
              !l.includes('Bình luận') && 
              !l.includes('Chia sẻ') &&
              !l.includes('Thursday') &&
              !l.includes('Wednesday') &&
              !l.includes('Friday') &&
              !l.includes('Saturday') &&
              !l.includes('Sunday') &&
              !l.includes('Monday') &&
              !l.includes('Tuesday') &&
              !l.includes('Thứ ')
            );
          foundCaption = lines[0] || '';
        }

        // 3. Tìm link trực tiếp của bài viết (permalink)
        let postLink = '';
        const allLinks = Array.from(art.querySelectorAll('a[href]'));
        for (const a of allLinks) {
          const href = a.getAttribute('href') || '';
          if (href.includes('/posts/') || href.includes('/videos/') || href.includes('/watch') || href.includes('photo.php') || href.includes('fbid=')) {
            postLink = href.startsWith('http') ? href : `https://www.facebook.com${href}`;
            // Cắt bỏ tracking parameter rườm rà
            postLink = postLink.split('?')[0];
            break;
          }
        }

        // Nếu chưa có, lấy link từ thẻ thời gian
        if (!postLink) {
          for (const a of allLinks) {
            const linkText = a.innerText || '';
            if (linkText.match(/(\d+\s*(giờ|phút|ngày|tháng|h|m)|Vừa xong)/i)) {
              const href = a.getAttribute('href') || '';
              if (href) {
                postLink = href.startsWith('http') ? href : `https://www.facebook.com${href}`;
                postLink = postLink.split('?')[0];
                break;
              }
            }
          }
        }

        if (foundCaption && !seenCaptions.has(foundCaption)) {
          seenCaptions.add(foundCaption);
          list.push({
            caption: foundCaption.slice(0, 220),
            timeStr,
            link: postLink || basePageUrl
          });
        }
      });

      return list;
    }, pageName, pageUrl);

    // Lọc các bài viết được đăng hôm nay
    const todayPosts = posts.filter(p => {
      const t = p.timeStr.toLowerCase();
      return t.includes('phút') || t.includes('m') || t.includes('giờ') || t.includes('h') || t.includes('vừa xong');
    });

    return {
      success: true,
      pageName,
      pageUrl,
      totalScanned: posts.length,
      todayCount: todayPosts.length > 0 ? todayPosts.length : posts.length,
      todayPosts: todayPosts.length > 0 ? todayPosts : posts
    };

  } finally {
    await browser.close();
  }
}
