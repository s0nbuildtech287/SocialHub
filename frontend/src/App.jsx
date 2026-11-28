import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AppShell from './components/layout/AppShell';
import DashboardView from './components/dashboard/DashboardView';
import IdeaGeneratorTab from './components/IdeaGeneratorTab';
import PostComposerTab from './components/PostComposerTab';
import SchedulerTab from './components/SchedulerTab';
import SettingsTab from './components/SettingsTab';
import FacebookPageInfo from './components/facebook/FacebookPageInfo';
import MediaLibraryTab from './components/media/MediaLibraryTab';
import NewsRadarTab from './components/news/NewsRadarTab';
import FacebookAnalyticsTab from './components/facebook/FacebookAnalyticsTab';
import AffiliateHubTab from './components/affiliate/AffiliateHubTab';
import YouTubeComicStudioTab from './components/youtube/YouTubeComicStudioTab';
import YouTubeChannelHubTab from './components/youtube/YouTubeChannelHubTab';
import PlaceholderPage from './components/common/PlaceholderPage';
import { findModuleById } from './config/platformRegistry';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState('dashboard');
  const [status, setStatus] = useState(null);
  const [prefill, setPrefill] = useState(null);

  const fetchStatus = async () => {
    try {
      const res = await axios.get('/api/status');
      setStatus(res.data);
    } catch (err) {
      console.error('Lỗi lấy trạng thái hệ thống:', err);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleSwitchChannel = async (channelId) => {
    try {
      await axios.post('/api/channels/active', { channelId });
      fetchStatus();
    } catch (err) {
      console.error('Lỗi chuyển kênh:', err);
    }
  };

  const handleSwitchYoutubeChannel = async (channelId) => {
    try {
      await axios.post('/api/youtube/channel/active', { channelId });
      fetchStatus();
    } catch (err) {
      console.error('Lỗi chuyển kênh YouTube:', err);
    }
  };

  const handleConnectNewYoutube = async () => {
    try {
      const res = await axios.get('/api/auth/youtube/url');
      if (res.data?.authUrl) {
        window.location.href = res.data.authUrl;
      }
    } catch (err) {
      alert('Lỗi khởi tạo liên kết Google OAuth: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleUseIdea = (ideaData) => {
    setPrefill(ideaData);
    setCurrentRoute('facebook-composer');
  };

  const handleUseMedia = (mediaItem) => {
    setPrefill((prev) => ({
      ...prev,
      photoUrl: mediaItem.url
    }));
    setCurrentRoute('facebook-composer');
  };

  const handleUseNews = (newsData) => {
    setPrefill({
      caption: newsData.caption,
      photoUrl: newsData.photoUrl
    });
    setCurrentRoute('facebook-composer');
  };

  const handleUseProduct = (product) => {
    const saleText = product.salePrice ? `👉 Giá săn sale: ${product.salePrice.toLocaleString('vi-VN')}đ (-${product.discount}%)\n` : '';
    const defaultCaption = `🔥 [GÓC ĐỒ HAY CHO ANH EM DÂN VĂN PHÒNG] 🔥\n\n${product.name}\n\n${saleText}👉 ${product.highlight || 'Link mình săn deal chính hãng để ở bình luận bên dưới nhé các bác! 👇'}\n\n#Review #DoHay #${product.platform === 'shopee' ? 'Shopee' : product.platform === 'tiktok' ? 'TikTokShop' : product.platform === 'lazada' ? 'Lazada' : 'Affiliate'} #GocTangCa`;
    
    setPrefill({
      caption: defaultCaption,
      photoUrl: product.image,
      shopeeLink: product.affiliateUrl,
      shopeeCommentText: `🛒 Link mua ${product.name} chính hãng trên ${product.platformName || 'sàn'} sale hời đây nhé các bác:\n👉 ${product.affiliateUrl}`
    });
    setCurrentRoute('facebook-composer');
  };

  const activeModule = findModuleById(currentRoute);

  return (
    <AppShell
      currentRoute={currentRoute}
      onNavigate={(routeId) => setCurrentRoute(routeId)}
      status={status}
      onSwitchChannel={handleSwitchChannel}
      onSwitchYoutubeChannel={handleSwitchYoutubeChannel}
      onConnectNewYoutube={handleConnectNewYoutube}
    >
      {/* 1. Tổng quan */}
      {currentRoute === 'dashboard' && (
        <DashboardView
          status={status}
          onNavigate={(routeId) => setCurrentRoute(routeId)}
          onSwitchChannel={handleSwitchChannel}
        />
      )}

      {/* 2. Sáng tạo ý tưởng AI */}
      {currentRoute === 'ideas' && (
        <IdeaGeneratorTab
          onUseIdea={handleUseIdea}
          hasGeminiKey={status?.gemini?.hasKey}
        />
      )}

      {/* 2.1 Thư viện Media & Meme */}
      {currentRoute === 'media-library' && (
        <MediaLibraryTab
          onUseMedia={handleUseMedia}
        />
      )}

      {/* 2.2 Radar Tin tức & Cào dữ liệu */}
      {currentRoute === 'news-radar' && (
        <NewsRadarTab
          onUseNews={handleUseNews}
        />
      )}

      {/* 3. Facebook: Thông tin Trang */}
      {currentRoute === 'facebook-info' && (
        <FacebookPageInfo
          status={status}
          onNavigate={(routeId) => setCurrentRoute(routeId)}
        />
      )}

      {/* 4. Facebook: Soạn bài & Đăng */}
      {currentRoute === 'facebook-composer' && (
        <PostComposerTab
          prefill={prefill}
          status={status}
          onPostSuccess={fetchStatus}
        />
      )}

      {/* 4. Facebook: Hẹn giờ đăng */}
      {currentRoute === 'facebook-scheduler' && (
        <SchedulerTab />
      )}

      {/* 2.3 Kho Tiếp Thị Liên Kết Đa Sàn (Affiliate Hub: Shopee, TikTok Shop, Lazada) */}
      {(currentRoute === 'affiliate' || currentRoute === 'facebook-shopee') && (
        <AffiliateHubTab
          onUseProduct={handleUseProduct}
          onNavigate={(routeId) => setCurrentRoute(routeId)}
        />
      )}

      {/* 5.1 Facebook: Thống kê & Biểu đồ Analytics */}
      {currentRoute === 'facebook-analytics' && (
        <FacebookAnalyticsTab
          onNavigate={(routeId) => setCurrentRoute(routeId)}
        />
      )}

      {/* 5.2 YouTube: Trung Tâm Kênh & Thống Kê Tổng Hợp */}
      {(currentRoute === 'youtube-channel' || currentRoute === 'youtube-shorts') && (
        <YouTubeChannelHubTab 
          status={status}
          onNavigate={(routeId) => setCurrentRoute(routeId)}
          onSwitchYoutubeChannel={handleSwitchYoutubeChannel}
          onConnectNewYoutube={handleConnectNewYoutube}
          onRefreshStatus={fetchStatus}
        />
      )}

      {/* 5.3 YouTube: Xưởng Truyện Tranh Shorts AI */}
      {currentRoute === 'youtube-comic-studio' && (
        <YouTubeComicStudioTab onNavigate={(routeId) => setCurrentRoute(routeId)} />
      )}

      {/* 6. Quản lý Kênh & Token */}
      {currentRoute === 'settings' && (
        <SettingsTab
          status={status}
          onRefreshStatus={fetchStatus}
          onSwitchChannel={handleSwitchChannel}
        />
      )}

      {/* 7. Các module trong lộ trình (Soon) */}
      {activeModule?.status === 'soon' && (
        <PlaceholderPage module={activeModule} />
      )}
    </AppShell>
  );
}
