import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testTheanh28() {
  console.log('🚀 Đang khởi động Chrome ngầm để vào Theanh28...');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new', // Chạy ngầm không mở cửa sổ
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
    
    // Giả lập màn hình Desktop chuẩn
    await page.setViewport({ width: 1280, height: 900 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

    console.log('🌐 Đang tải trang https://www.facebook.com/Theanh28/ ...');
    await page.goto('https://www.facebook.com/Theanh28/', { 
      waitUntil: 'networkidle2', 
      timeout: 30000 
    });

    console.log('⏳ Đã tải xong trang ban đầu, đang kiểm tra popup...');

    // 1. Tự động đóng popup đăng nhập nếu Facebook hiện ra
    try {
      const closeSelector = '[aria-label="Đóng"], [aria-label="Close"], div[role="button"][tabindex="0"]';
      await page.waitForSelector(closeSelector, { timeout: 3000 });
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('[aria-label="Đóng"], [aria-label="Close"]'));
        btns.forEach(b => b.click());
      });
      console.log('✅ Đã đóng popup đăng nhập của Facebook.');
    } catch {
      console.log('ℹ️ Không có popup chặn hoặc đã tự ẩn.');
    }

    // 2. Cuộn trang 4-5 lần để tải thêm bài viết
    console.log('📜 Đang cuộn trang để nạp thêm các bài viết...');
    for (let i = 0; i < 5; i++) {
      await page.evaluate(() => window.scrollBy(0, 1500));
      await new Promise(r => setTimeout(r, 1500));
    }

    // 3. Bóc tách danh sách các bài viết
    const postsData = await page.evaluate(() => {
      // Tìm các container bài viết trên Facebook Feed
      const articles = document.querySelectorAll('div[role="feed"] > div, div[role="article"]');
      const results = [];

      articles.forEach((art) => {
        const text = art.innerText || '';
        // Lấy đoạn mở đầu (150 ký tự đầu tiên)
        const lines = text.split('\n').filter(l => l.trim().length > 10);
        if (lines.length > 0) {
          // Tìm mốc thời gian (VD: "X giờ", "X phút", "Vừa xong", "Hôm qua")
          const timeMatch = text.match(/(\d+\s*(giờ|phút|ngày|tháng|h|m)|Vừa xong|Hôm qua)/i);
          results.push({
            preview: lines[0]?.slice(0, 80),
            timeStr: timeMatch ? timeMatch[0] : 'Không rõ'
          });
        }
      });

      return results;
    });

    console.log(`\n🎉 KẾT QUẢ THỬ NGHIỆM: Tìm thấy ${postsData.length} phần tử bài viết trên dòng thời gian:`);
    postsData.slice(0, 10).forEach((p, idx) => {
      console.log(` ${idx + 1}. [${p.timeStr}] ${p.preview}...`);
    });

  } catch (err) {
    console.error('❌ Lỗi:', err.message);
  } finally {
    await browser.close();
    console.log('🏁 Đã đóng trình duyệt.');
  }
}

testTheanh28();
