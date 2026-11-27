import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, '../data');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const channelsFile = path.join(dataDir, 'channels.json');
const postsFile = path.join(dataDir, 'posts.json');
const scheduledFile = path.join(dataDir, 'scheduled.json');
const settingsFile = path.join(dataDir, 'settings.json');
const mediaFile = path.join(dataDir, 'media.json');
const affiliateFile = path.join(dataDir, 'affiliate.json');
const affiliateOrdersFile = path.join(dataDir, 'affiliate_orders.json');

function readFile(file, defaultValue = []) {
  try {
    if (fs.existsSync(file)) {
      return JSON.parse(fs.readFileSync(file, 'utf8'));
    }
  } catch (err) {
    console.error(`Error reading ${file}:`, err.message);
  }
  return defaultValue;
}

function writeFile(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
}

// Khởi tạo thư viện Media mặc định nếu chưa có
function initDefaultMedia() {
  const media = readFile(mediaFile, null);
  if (!media || media.length === 0) {
    const defaultMedia = [
      {
        id: 'media_1',
        title: 'Meme Tăng ca đến sáng',
        url: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80',
        tag: 'Meme Công sở',
        source: 'url',
        createdAt: new Date().toISOString()
      },
      {
        id: 'media_2',
        title: 'Deadline dí chạy tụt quần',
        url: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=800&q=80',
        tag: 'Meme Công sở',
        source: 'url',
        createdAt: new Date().toISOString()
      },
      {
        id: 'media_3',
        title: 'Tâm trạng chiều thứ 6',
        url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80',
        tag: 'Đời sống Gen Z',
        source: 'url',
        createdAt: new Date().toISOString()
      }
    ];
    writeFile(mediaFile, defaultMedia);
    return defaultMedia;
  }
  return media;
}

// Khởi tạo kênh mặc định nếu chưa có
function initDefaultChannels() {
  const channels = readFile(channelsFile, null);
  if (!channels || channels.length === 0) {
    const defaultList = [
      {
        id: 'fb_1492917437245491',
        platform: 'facebook',
        name: 'Góc Tăng Ca',
        pageId: '1492917437245491',
        accessToken: process.env.FB_PAGE_TOKEN || 'EAAXRjwtZAPrUBTI4iEKe4toP0JijYKZBktwty1mFuUztA2OTBVV6fhtZBTroNhKxuV85IaQzbyd8AKKjzLy3DGQgRdHKIjNLXW0TEfGVJRhJVA5HZCAmn3zUT1Jw8yQwY9ItfyDuxTs1QychGqifJyAOikBwUocwr4EZBNB8g2LFhGQw1RAgL1P7aN3RjBrGuMlYowy9ODceZA1oVQgpZBc5AoJVgFaO3QxvZBJkSEoqwCaI',
        avatar: '',
        about: 'Làm, làm nữa, làm mãi',
        category: 'Trang web giải trí',
        defaultTone: 'office_meme',
        isActive: true,
        createdAt: new Date().toISOString()
      }
    ];
    writeFile(channelsFile, defaultList);
    return defaultList;
  }
  return channels;
}

export const db = {
  // Channels Management
  getChannels: () => {
    return initDefaultChannels();
  },
  getActiveChannel: () => {
    const channels = initDefaultChannels();
    return channels.find((c) => c.isActive) || channels[0];
  },
  setActiveChannel: (channelId) => {
    const channels = initDefaultChannels();
    channels.forEach((c) => {
      c.isActive = c.id === channelId;
    });
    writeFile(channelsFile, channels);
    return channels.find((c) => c.isActive);
  },
  addOrUpdateChannel: (channelData) => {
    const channels = initDefaultChannels();
    const existingIdx = channels.findIndex((c) => c.id === channelData.id || (c.platform === channelData.platform && c.pageId === channelData.pageId));
    if (existingIdx >= 0) {
      channels[existingIdx] = { ...channels[existingIdx], ...channelData };
    } else {
      channels.push({
        id: channelData.id || `${channelData.platform}_${Date.now()}`,
        createdAt: new Date().toISOString(),
        isActive: channels.length === 0,
        ...channelData
      });
    }
    writeFile(channelsFile, channels);
    return channels;
  },
  deleteChannel: (channelId) => {
    let channels = initDefaultChannels();
    channels = channels.filter((c) => c.id !== channelId);
    if (channels.length > 0 && !channels.some((c) => c.isActive)) {
      channels[0].isActive = true;
    }
    writeFile(channelsFile, channels);
    return channels;
  },

  // Posts Management
  getPosts: (channelId = null) => {
    const posts = readFile(postsFile);
    if (channelId) {
      return posts.filter((p) => p.channelId === channelId);
    }
    return posts;
  },
  addPost: (post) => {
    const posts = readFile(postsFile);
    posts.unshift({
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      ...post
    });
    writeFile(postsFile, posts);
    return posts[0];
  },

  // Scheduled Posts
  getScheduled: (channelId = null) => {
    const list = readFile(scheduledFile);
    if (channelId) {
      return list.filter((s) => s.channelId === channelId);
    }
    return list;
  },
  addScheduled: (item) => {
    const list = readFile(scheduledFile);
    list.push({
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      status: 'pending',
      ...item
    });
    writeFile(scheduledFile, list);
    return list[list.length - 1];
  },
  updateScheduledStatus: (id, status, error = null) => {
    const list = readFile(scheduledFile);
    const item = list.find((s) => s.id === id);
    if (item) {
      item.status = status;
      if (error) item.error = error;
      writeFile(scheduledFile, list);
    }
  },

  // Global Settings (Gemini API Key, etc.)
  getSettings: () => {
    return readFile(settingsFile, {
      geminiApiKey: process.env.GEMINI_API_KEY || ''
    });
  },
  saveSettings: (newSettings) => {
    const cur = readFile(settingsFile, {});
    const updated = { ...cur, ...newSettings };
    writeFile(settingsFile, updated);
    return updated;
  },

  // Media & Meme Library
  getMedia: (tag = null) => {
    initDefaultMedia();
    const list = readFile(mediaFile, []);
    if (tag && tag !== 'all') {
      return list.filter((m) => m.tag === tag);
    }
    return list;
  },
  addMedia: (item) => {
    initDefaultMedia();
    const list = readFile(mediaFile, []);
    const newItem = {
      id: `media_${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...item
    };
    list.unshift(newItem);
    writeFile(mediaFile, list);
    return newItem;
  },
  deleteMedia: (id) => {
    initDefaultMedia();
    const list = readFile(mediaFile, []);
    const filtered = list.filter((m) => m.id !== id);
    writeFile(mediaFile, filtered);
    return filtered;
  },

  // Affiliate Products
  getAffiliateProducts: (platform = null) => {
    const list = readFile(affiliateFile, []);
    if (platform && platform !== 'all') {
      return list.filter((p) => p.platform === platform);
    }
    return list;
  },
  addAffiliateProduct: (item) => {
    const list = readFile(affiliateFile, []);
    const newItem = {
      id: `aff_${Date.now()}`,
      createdAt: new Date().toISOString(),
      clicks: 0,
      ...item
    };
    list.unshift(newItem);
    writeFile(affiliateFile, list);
    return newItem;
  },
  incrementProductClicks: (id) => {
    const list = readFile(affiliateFile, []);
    const item = list.find((p) => p.id === id);
    if (item) {
      item.clicks = (item.clicks || 0) + 1;
      item.lastClickedAt = new Date().toISOString();
      writeFile(affiliateFile, list);
    }
    return item;
  },
  deleteAffiliateProduct: (id) => {
    const list = readFile(affiliateFile, []);
    const filtered = list.filter((p) => p.id !== id);
    writeFile(affiliateFile, filtered);
    return filtered;
  },

  // Affiliate Orders & Conversion Reports
  getAffiliateOrders: (platform = null) => {
    const list = readFile(affiliateOrdersFile, []);
    if (platform && platform !== 'all') {
      return list.filter((o) => o.platform === platform);
    }
    return list;
  },
  addAffiliateOrder: (order) => {
    const list = readFile(affiliateOrdersFile, []);
    const newOrder = {
      id: order.id || `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: order.createdAt || new Date().toISOString(),
      ...order
    };
    list.unshift(newOrder);
    writeFile(affiliateOrdersFile, list);
    return newOrder;
  },
  importAffiliateOrders: (newOrders = []) => {
    let list = readFile(affiliateOrdersFile, []);
    for (const ord of newOrders) {
      const idx = list.findIndex(o => o.orderSn === ord.orderSn || o.id === ord.id);
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...ord, updatedAt: new Date().toISOString() };
      } else {
        list.unshift({
          id: ord.id || `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          createdAt: ord.createdAt || new Date().toISOString(),
          ...ord
        });
      }
    }
    writeFile(affiliateOrdersFile, list);
    return list;
  }
};
