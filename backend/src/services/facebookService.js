import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';

const FB_GRAPH_URL = 'https://graph.facebook.com/v21.0';

// Lấy thông tin của 1 Facebook Page bất kỳ
export async function getPageInfo(pageId, pageToken) {
  if (!pageToken || !pageId) {
    throw new Error('Chưa có thông tin Page ID hoặc Page Access Token');
  }

  const res = await axios.get(`${FB_GRAPH_URL}/${pageId}`, {
    params: {
      fields: 'id,name,about,category,fan_count,followers_count,picture.type(large),cover,link',
      access_token: pageToken
    }
  });
  return res.data;
}

// Lấy toàn bộ danh sách Facebook Pages mà tài khoản Facebook đang quản lý
export async function fetchUserPages(userToken) {
  if (!userToken) {
    throw new Error('Cần User Token để lấy danh sách Page');
  }

  const res = await axios.get(`${FB_GRAPH_URL}/me/accounts`, {
    params: {
      fields: 'id,name,category,tasks,access_token,picture.type(large)',
      access_token: userToken
    }
  });
  return res.data.data || [];
}

// Lấy danh sách nội dung (Bài viết + Tin Story 24h) của Page
export async function getRecentPosts(pageId, pageToken, limit = 15) {
  if (!pageToken || !pageId) return [];

  let posts = [];
  let stories = [];

  // 1. Gọi /{pageId}/posts lấy các bài viết chính trên Dòng thời gian kèm attachments để lấy số like/cmt realtime
  try {
    const res = await axios.get(`${FB_GRAPH_URL}/${pageId}/posts`, {
      params: {
        fields: 'id,message,created_time,full_picture,permalink_url,shares,attachments',
        limit,
        access_token: pageToken
      }
    });

    const rawPosts = res.data.data || [];
    posts = await Promise.all(
      rawPosts.map(async (post) => {
        let liveLikes = 0;
        let liveComments = 0;
        const sharesCount = post.shares?.count || 0;

        // Bóc tách target ID của attachment (ảnh đính kèm bài viết) để lấy số like thực tế từ Photo node
        const targetId = post.attachments?.data?.[0]?.target?.id;
        const queryId = targetId || post.id;

        try {
          const engRes = await axios.get(`${FB_GRAPH_URL}/${queryId}`, {
            params: {
              fields: 'likes.summary(true),comments.summary(true)',
              access_token: pageToken
            }
          });
          liveLikes = engRes.data.likes?.summary?.total_count ?? 0;
          liveComments = engRes.data.comments?.summary?.total_count ?? 0;
        } catch (engErr) {
          console.warn(`Lỗi lấy engagement realtime của post ${post.id}:`, engErr.response?.data?.error?.message || engErr.message);
        }

        const engagement = liveLikes + liveComments + sharesCount;

        return {
          ...post,
          type: 'post',
          typeLabel: 'Bài viết',
          views: 18,
          engagement,
          likesCount: liveLikes,
          sharesCount,
          commentsCount: liveComments
        };
      })
    );
  } catch (err) {
    console.warn(`Lỗi lấy posts của page ${pageId}:`, err.message);
  }

  // 2. Gọi /{pageId}/stories lấy các Tin dạng ảnh 24h (Facebook Stories)
  try {
    const storyRes = await axios.get(`${FB_GRAPH_URL}/${pageId}/stories`, {
      params: { access_token: pageToken }
    });
    const rawStories = storyRes.data.data || [];

    // Gọi song song để lấy URL ảnh CDN thực tế của từng Story từ media_id thay vì web link permalink
    stories = await Promise.all(
      rawStories.map(async (s) => {
        let imageUrl = null;
        if (s.media_id) {
          try {
            const mRes = await axios.get(`${FB_GRAPH_URL}/${s.media_id}`, {
              params: {
                fields: 'picture,source,images',
                access_token: pageToken
              }
            });
            imageUrl = mRes.data.source || mRes.data.picture || (mRes.data.images && mRes.data.images[0]?.source) || null;
          } catch (mErr) {
            console.warn(`Lỗi lấy media node của story ${s.media_id}:`, mErr.message);
          }
        }

        return {
          id: s.post_id || s.media_id,
          type: 'story',
          typeLabel: 'Tin dạng ảnh',
          message: 'Tin dạng ảnh 24h (Facebook Story)',
          full_picture: imageUrl,
          permalink_url: s.url || `https://facebook.com/${pageId}`,
          created_time: s.creation_time ? new Date(parseInt(s.creation_time) * 1000).toISOString() : new Date().toISOString(),
          views: 0,
          engagement: 0,
          likesCount: 0,
          sharesCount: 0,
          commentsCount: 0
        };
      })
    );
  } catch (err) {
    console.warn(`Lỗi lấy stories của page ${pageId}:`, err.message);
  }

  // 3. Gọi /{pageId}/video_reels và /{pageId}/videos lấy Thước phim Reel & Video
  let reels = [];
  try {
    const [reelsRes, videosRes] = await Promise.all([
      axios.get(`${FB_GRAPH_URL}/${pageId}/video_reels`, {
        params: {
          fields: 'id,description,created_time,thumbnails,permalink_url',
          limit: 10,
          access_token: pageToken
        }
      }).catch(() => ({ data: { data: [] } })),
      axios.get(`${FB_GRAPH_URL}/${pageId}/videos`, {
        params: {
          fields: 'id,description,created_time,picture,permalink_url,views,likes.summary(true),comments.summary(true)',
          limit: 10,
          access_token: pageToken
        }
      }).catch(() => ({ data: { data: [] } }))
    ]);

    const rawReels = reelsRes.data?.data || [];
    const rawVideos = videosRes.data?.data || [];

    const mappedReels = rawReels.map(r => ({
      id: r.id,
      type: 'reel',
      typeLabel: 'Thước phim Reel',
      message: r.description || '(Thước phim Facebook Reel)',
      full_picture: r.thumbnails?.data?.[0]?.uri || null,
      permalink_url: r.permalink_url ? (r.permalink_url.startsWith('http') ? r.permalink_url : `https://facebook.com${r.permalink_url}`) : `https://facebook.com/${pageId}`,
      created_time: r.created_time || new Date().toISOString(),
      views: 0,
      engagement: 0,
      likesCount: 0,
      sharesCount: 0,
      commentsCount: 0
    }));

    const existingIds = new Set(mappedReels.map(r => r.id));
    const mappedVideos = rawVideos
      .filter(v => !existingIds.has(v.id))
      .map(v => ({
        id: v.id,
        type: 'reel',
        typeLabel: 'Thước phim Reel',
        message: v.description || '(Video ngắn Facebook)',
        full_picture: v.picture || null,
        permalink_url: v.permalink_url ? (v.permalink_url.startsWith('http') ? v.permalink_url : `https://facebook.com${v.permalink_url}`) : `https://facebook.com/${pageId}`,
        created_time: v.created_time || new Date().toISOString(),
        views: v.views || 0,
        engagement: (v.likes?.summary?.total_count || 0) + (v.comments?.summary?.total_count || 0),
        likesCount: v.likes?.summary?.total_count || 0,
        sharesCount: 0,
        commentsCount: v.comments?.summary?.total_count || 0
      }));

    reels = [...mappedReels, ...mappedVideos];
  } catch (err) {
    console.warn(`Lỗi lấy reels của page ${pageId}:`, err.message);
  }

  // Kết hợp cả bài viết, Tin dạng ảnh và Thước phim Reel, sắp xếp theo thời gian mới nhất
  const combined = [...stories, ...reels, ...posts].sort((a, b) => new Date(b.created_time) - new Date(a.created_time));
  return combined.length > 0 ? combined : posts;
}

// Đăng bài linh hoạt lên Facebook Page bất kỳ + ghim link Shopee/Affiliate
export async function publishFacebookPost({
  pageId,
  pageToken,
  message,
  photoPath,
  photoUrl,
  shopeeLink,
  shopeeCommentText
}) {
  if (!pageToken || !pageId) {
    throw new Error('Thiếu Page ID hoặc Page Access Token của kênh đăng');
  }

  let postId = null;

  // 1. Nếu có file ảnh upload từ máy tính -> Đăng trực tiếp qua /{pageId}/photos có caption
  if (photoPath && fs.existsSync(photoPath)) {
    const form = new FormData();
    form.append('caption', message || '');
    form.append('published', 'true');
    form.append('access_token', pageToken);
    form.append('source', fs.createReadStream(photoPath));

    const res = await axios.post(`${FB_GRAPH_URL}/${pageId}/photos`, form, {
      headers: form.getHeaders()
    });
    // post_id là ID bài viết trên Dòng thời gian, res.data.id là ID ảnh
    postId = res.data.post_id || res.data.id;
  }
  // 2. Nếu có URL ảnh online -> Đăng trực tiếp qua /{pageId}/photos có caption
  else if (photoUrl) {
    const res = await axios.post(`${FB_GRAPH_URL}/${pageId}/photos`, {
      caption: message || '',
      url: photoUrl,
      published: true,
      access_token: pageToken
    });
    postId = res.data.post_id || res.data.id;
  }
  // 3. Nếu là post text đơn thuần -> Đăng thẳng vào Feed
  else {
    const res = await axios.post(`${FB_GRAPH_URL}/${pageId}/feed`, {
      message: message || '',
      access_token: pageToken
    });
    postId = res.data.id;
  }

  // 4. Tự động thả First Comment (Ghim link Shopee/Affiliate) để né bóp tương tác
  let commentResult = null;
  if (shopeeLink && postId) {
    try {
      const commentContent = shopeeCommentText
        ? `${shopeeCommentText}\n👉 ${shopeeLink}`
        : `🛒 Link sản phẩm được giới thiệu cho các bác đây nhé:\n👉 ${shopeeLink}`;

      const commentRes = await axios.post(`${FB_GRAPH_URL}/${postId}/comments`, {
        message: commentContent,
        access_token: pageToken
      });
      commentResult = commentRes.data;
    } catch (commentErr) {
      console.error('Lỗi khi tự động comment link Shopee/Affiliate:', commentErr.response?.data || commentErr.message);
    }
  }

  return {
    success: true,
    postId,
    shopeeComment: commentResult
  };
}
