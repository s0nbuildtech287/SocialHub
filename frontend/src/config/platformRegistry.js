export const PLATFORM_REGISTRY = {
  // Nhóm điều hướng chung
  common: [
    { 
      id: 'dashboard', 
      label: 'Tổng quan', 
      icon: 'LayoutDashboard', 
      badge: null, 
      status: 'active' 
    },
    { 
      id: 'ideas', 
      label: 'Ý tưởng AI', 
      icon: 'Sparkles', 
      badge: null, 
      status: 'active' 
    },
    { 
      id: 'media-library', 
      label: 'Thư viện Media', 
      icon: 'Images', 
      badge: null, 
      status: 'active',
      platform: 'common'
    },
    { 
      id: 'news-radar', 
      label: 'Tin tức', 
      icon: 'Newspaper', 
      badge: 'Hot', 
      status: 'active',
      platform: 'common'
    },
    { 
      id: 'affiliate', 
      label: 'Kho Affiliate', 
      icon: 'ShoppingBag', 
      badge: 'Shopee & TikTok', 
      status: 'active',
      platform: 'common'
    }
  ],

  // Các nền tảng
  platforms: [
    {
      id: 'facebook',
      name: 'Facebook',
      icon: 'Facebook',
      accentColor: 'blue',
      badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      status: 'active',
      defaultOpen: true,
      modules: [
        { 
          id: 'facebook-info', 
          label: 'Thông tin Trang', 
          icon: 'Info', 
          status: 'active' 
        },
        { 
          id: 'facebook-composer', 
          label: 'Soạn bài & Đăng', 
          icon: 'PenSquare', 
          status: 'active' 
        },
        { 
          id: 'facebook-scheduler', 
          label: 'Hẹn giờ đăng', 
          icon: 'CalendarClock', 
          status: 'active' 
        },
        { 
          id: 'facebook-analytics', 
          label: 'Thống kê & Biểu đồ', 
          icon: 'BarChart3', 
          badge: 'Mới',
          status: 'active' 
        },
        { 
          id: 'facebook-autolive', 
          label: 'Auto Live Stream', 
          icon: 'Radio', 
          badge: 'Sắp có', 
          status: 'soon',
          platform: 'facebook',
          description: 'Tự động phát lại video clip có sẵn thành luồng trực tiếp (Live Stream) trên Fanpage để kéo tương tác 24/7.',
          features: [
            'Phát lại video lặp vòng (loop) liên tục không cần treo máy',
            'Tự động bình luận và ghim link chốt đơn Shopee khi live',
            'Lên lịch phát luồng theo khung giờ vàng'
          ]
        }
      ]
    },
    {
      id: 'youtube',
      name: 'YouTube',
      icon: 'Youtube',
      accentColor: 'red',
      badgeColor: 'bg-red-500/10 text-red-400 border-red-500/30',
      status: 'active',
      defaultOpen: true,
      modules: [
        { 
          id: 'youtube-comic-studio', 
          label: 'Truyện Tranh Shorts AI', 
          icon: 'BookOpen', 
          badge: 'Hot', 
          status: 'active',
          platform: 'youtube'
        },
        { 
          id: 'youtube-shorts', 
          label: 'Auto Đăng Shorts', 
          icon: 'Video', 
          badge: 'Sắp có', 
          status: 'soon',
          platform: 'youtube',
          description: 'Tự động xuất bản video ngắn lên YouTube Shorts thông qua YouTube Data API v3.',
          features: [
            'Tối ưu hóa thẻ Tags, Title và SEO mô tả video bằng AI',
            'Chọn khung hình đẹp nhất làm Thumbnail',
            'Đồng bộ video tự động từ kho nội dung Facebook/TikTok'
          ]
        }
      ]
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      icon: 'Music2',
      accentColor: 'pink',
      badgeColor: 'bg-pink-500/10 text-pink-400 border-pink-500/30',
      status: 'soon',
      defaultOpen: false,
      modules: [
        { 
          id: 'tiktok-auto', 
          label: 'Auto Đăng TikTok', 
          icon: 'Share2', 
          badge: 'Sắp có', 
          status: 'soon',
          platform: 'tiktok',
          description: 'Tự động phân phối clip ngắn lên các tài khoản TikTok cá nhân và TikTok Shop.',
          features: [
            'Tự động chọn hashtag thịnh hành (trending) theo ngành hàng',
            'Hẹn giờ đăng theo khung giờ vàng phân phối thuật toán TikTok',
            'Gắn link sản phẩm TikTok Shop tự động'
          ]
        }
      ]
    }
  ],

  // Cấu hình chân trang Sidebar
  system: [
    { 
      id: 'settings', 
      label: 'Kênh & Token', 
      icon: 'Layers', 
      badge: null, 
      status: 'active' 
    },
    { 
      id: 'app-settings', 
      label: 'Cài đặt hệ thống', 
      icon: 'Settings', 
      badge: 'Sắp có', 
      status: 'soon',
      platform: 'system',
      description: 'Tuỳ chỉnh nâng cao: Webhook thông báo Telegram, Proxy xoay IP và sao lưu định kỳ.',
      features: [
        'Nhận thông báo bài đăng và lỗi qua Telegram Bot riêng',
        'Tích hợp proxy xoay IP cho các tác vụ crawl dữ liệu',
        'Sao lưu tự động cơ sở dữ liệu hàng tuần'
      ]
    }
  ]
};

// Hàm tra cứu module theo ID
export function findModuleById(moduleId) {
  for (const item of PLATFORM_REGISTRY.common) {
    if (item.id === moduleId) return { ...item, section: 'Chung' };
  }
  for (const plat of PLATFORM_REGISTRY.platforms) {
    for (const mod of plat.modules) {
      if (mod.id === moduleId) {
        return { ...mod, platformName: plat.name, accentColor: plat.accentColor, section: plat.name };
      }
    }
  }
  for (const item of PLATFORM_REGISTRY.system) {
    if (item.id === moduleId) return { ...item, section: 'Hệ thống' };
  }
  return null;
}
