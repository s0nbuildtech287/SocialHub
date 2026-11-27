import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { db } from '../db.js';

function getOAuth2Client() {
  const clientId = process.env.YOUTUBE_CLIENT_ID;
  const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;
  const redirectUri = process.env.YOUTUBE_REDIRECT_URI || 'http://localhost:5000/api/auth/youtube/callback';

  if (!clientId || !clientSecret) {
    throw new Error('Chưa cấu hình YOUTUBE_CLIENT_ID hoặc YOUTUBE_CLIENT_SECRET trong .env');
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

export function getYoutubeAuthUrl() {
  const oauth2Client = getOAuth2Client();
  const scopes = [
    'https://www.googleapis.com/auth/youtube.upload',
    'https://www.googleapis.com/auth/youtube.readonly',
    'https://www.googleapis.com/auth/yt-analytics.readonly',
    'https://www.googleapis.com/auth/userinfo.profile'
  ];

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: scopes
  });
}

export async function handleYoutubeCallback(code) {
  const oauth2Client = getOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
  const channelRes = await youtube.channels.list({
    part: ['snippet', 'statistics'],
    mine: true
  });

  const ch = channelRes.data.items?.[0];
  if (!ch) {
    throw new Error('Không tìm thấy kênh YouTube nào liên kết với tài khoản này');
  }

  const channelData = {
    id: `yt_${ch.id}`,
    channelId: ch.id,
    platform: 'youtube',
    name: ch.snippet.title,
    avatar: ch.snippet.thumbnails?.default?.url || ch.snippet.thumbnails?.medium?.url || '',
    description: ch.snippet.description || '',
    subscriberCount: parseInt(ch.statistics.subscriberCount || 0, 10),
    videoCount: parseInt(ch.statistics.videoCount || 0, 10),
    viewCount: parseInt(ch.statistics.viewCount || 0, 10),
    tokens,
    isActive: true,
    connectedAt: new Date().toISOString()
  };

  db.saveYoutubeChannel(channelData);
  return channelData;
}

export async function uploadYoutubeShorts({ filePath, title, description, tags = [], privacyStatus = 'public', channelId = null }) {
  if (!fs.existsSync(filePath)) {
    throw new Error('Không tìm thấy file video để upload');
  }

  const channels = db.getChannels();
  const ytChannel = channelId 
    ? channels.find(c => c.platform === 'youtube' && (c.id === channelId || c.channelId === channelId))
    : channels.find(c => c.platform === 'youtube' && c.isActive) || channels.find(c => c.platform === 'youtube');

  if (!ytChannel || !ytChannel.tokens) {
    throw new Error('Chưa có kênh YouTube nào được kết nối. Vui lòng bấm "Kết Nối Kênh YouTube" trước.');
  }

  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials(ytChannel.tokens);

  // Auto-save refreshed tokens when Google refreshes them
  oauth2Client.on('tokens', (newTokens) => {
    ytChannel.tokens = { ...ytChannel.tokens, ...newTokens };
    db.saveYoutubeChannel(ytChannel);
  });

  const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

  // Add #Shorts in title & description to ensure YouTube indexes it as Shorts
  let finalTitle = title || 'Inspirational Fable Story';
  if (!finalTitle.includes('#Shorts') && !finalTitle.includes('#shorts')) {
    finalTitle = `${finalTitle.slice(0, 85)} #Shorts`;
  }

  const defaultTags = ['Shorts', 'YouTubeShorts', 'Fable', 'Story', 'Philosophy', 'Animation', 'Comics'];
  const finalTags = Array.from(new Set([...tags, ...defaultTags]));

  const res = await youtube.videos.insert({
    part: ['snippet', 'status'],
    requestBody: {
      snippet: {
        title: finalTitle,
        description: `${description || ''}\n\n#Shorts #Philosophy #LifeLessons #Storybook`,
        tags: finalTags,
        categoryId: '22' // People & Blogs
      },
      status: {
        privacyStatus: privacyStatus || 'public',
        selfDeclaredMadeForKids: false
      }
    },
    media: {
      body: fs.createReadStream(filePath)
    }
  });

  const videoId = res.data.id;
  return {
    success: true,
    videoId,
    videoUrl: `https://www.youtube.com/shorts/${videoId}`,
    title: res.data.snippet?.title,
    channelTitle: res.data.snippet?.channelTitle,
    publishedAt: res.data.snippet?.publishedAt
  };
}

export async function getYoutubeChannelData(channelId = null) {
  const channels = db.getChannels();
  const ytChannel = channelId 
    ? channels.find(c => c.platform === 'youtube' && (c.id === channelId || c.channelId === channelId))
    : channels.find(c => c.platform === 'youtube');

  if (!ytChannel || !ytChannel.tokens) return null;

  try {
    const oauth2Client = getOAuth2Client();
    oauth2Client.setCredentials(ytChannel.tokens);
    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

    const [channelRes, videosRes] = await Promise.all([
      youtube.channels.list({
        part: ['snippet', 'statistics'],
        id: [ytChannel.channelId || ytChannel.id.replace('yt_', '')]
      }),
      youtube.search.list({
        part: ['snippet'],
        channelId: ytChannel.channelId || ytChannel.id.replace('yt_', ''),
        maxResults: 6,
        order: 'date',
        type: ['video']
      })
    ]);

    const ch = channelRes.data.items?.[0];
    const recentVideos = (videosRes.data.items || []).map(v => ({
      id: v.id.videoId,
      title: v.snippet.title,
      publishedAt: v.snippet.publishedAt,
      thumbnail: v.snippet.thumbnails?.medium?.url || v.snippet.thumbnails?.default?.url,
      shortsUrl: `https://www.youtube.com/shorts/${v.id.videoId}`
    }));

    return {
      channel: ch ? {
        title: ch.snippet.title,
        avatar: ch.snippet.thumbnails?.medium?.url,
        subscriberCount: ch.statistics.subscriberCount,
        viewCount: ch.statistics.viewCount,
        videoCount: ch.statistics.videoCount
      } : ytChannel,
      recentVideos
    };
  } catch (err) {
    console.error('Lỗi lấy dữ liệu kênh YouTube:', err.message);
    return null;
  }
}
