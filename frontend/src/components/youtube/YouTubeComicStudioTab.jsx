import React, { useState } from 'react';
import axios from 'axios';
import { 
  Youtube, 
  BookOpen, 
  Sparkles, 
  Copy, 
  Check, 
  Music, 
  Image as ImageIcon, 
  FileText, 
  Lightbulb, 
  ExternalLink, 
  RefreshCw,
  Layers,
  Send,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Mic,
  Sliders,
  ChevronRight,
  Bookmark,
  Share2,
  Film,
  Download,
  UploadCloud,
  User,
  Globe,
  AlertTriangle,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Edit3,
  BarChart3,
  Users,
  Eye,
  Video,
  CheckCircle2,
  Loader2
} from 'lucide-react';

// Thư viện các câu chuyện ngụ ngôn mẫu chuẩn
const CURATED_FABLES = [
  {
    id: 'fable_apple_tree',
    title: "THE OLD WOMAN AND THE APPLE TREE",
    vietnameseTitle: "Bà Cụ 80 Tuổi Và Cây Táo",
    topic: "Lòng tốt vị tha và giá trị truyền lại cho đời sau",
    summary: "Một câu chuyện ấm áp về việc trồng những mầm cây mà chính bản thân ta có thể không bao giờ kịp nếm quả ngọt, nhưng người đi sau sẽ được hưởng bóng mát và trái lành.",
    panels: [
      {
        panelNumber: 1,
        title: "Bà cụ gieo mầm",
        sceneDescription: "Một cụ bà 80 tuổi tóc bạc, đeo kính, mặc áo len tím đang cặm cụi vun đất trồng một cây táo non trong khu vườn nhà.",
        dialogue: "A woman of eighty was planting an apple tree in her garden.",
        vietnameseDialogue: "Một bà cụ tám mươi tuổi đang cặm cụi trồng một cây táo non trong vườn."
      },
      {
        panelNumber: 2,
        title: "Lời hoài nghi của người hàng xóm",
        sceneDescription: "Người hàng xóm trung niên đội mũ beret đứng khoanh tay nhìn với vẻ thắc mắc.",
        dialogue: "Neighbor: 'Apple trees take ten years to bear fruit. Why bother?'",
        vietnameseDialogue: "Người hàng xóm: 'Cây táo mất mười năm mới có quả. Bà trồng làm chi cho nhọc sức?'"
      },
      {
        panelNumber: 3,
        title: "Câu trả lời bình thản",
        sceneDescription: "Bà cụ mỉm cười hiền từ, người hàng xóm tiếp tục hỏi xoáy vào sự hữu hạn của đời người.",
        dialogue: "Woman: 'I know.'\nNeighbor: 'But you won't live to taste a single apple.'",
        vietnameseDialogue: "Bà cụ: 'Tôi biết chứ.'\nNgười hàng xóm: 'Nhưng bà đâu thể sống đến ngày nếm quả táo nào.'"
      },
      {
        panelNumber: 4,
        title: "Cú lật ngược tư duy (The Wisdom)",
        sceneDescription: "Bà cụ chống tay lên hông, tươi cười chỉ vào giỏ táo ngọt bên cạnh. Người hàng xóm đứng lặng người suy nghĩ.",
        dialogue: "Woman: 'I'm eating apples right now—from a tree my grandfather planted. Someone had to go first.'\nThe neighbor stood in silence.",
        vietnameseDialogue: "Bà cụ: 'Hiện giờ tôi đang ăn táo từ cây ông nội tôi đã trồng. Phải có ai đó đi trước chứ.'\nNgười hàng xóm đứng lặng người suy nghĩ."
      },
      {
        panelNumber: 5,
        title: "Dòng thời gian (Year 1, 5, 10)",
        sceneDescription: "3 khung nhỏ thể hiện dòng chảy thời gian: Năm thứ 1 cây non bé xíu -> Năm thứ 5 cây cao lớn -> Năm thứ 10 cây trĩu quả đỏ rực rỡ.",
        dialogue: "YEAR 1  •  YEAR 5  •  YEAR 10",
        vietnameseDialogue: "Năm thứ nhất... Năm thứ năm... Và năm thứ mười."
      },
      {
        panelNumber: 6,
        title: "Lũ trẻ thưởng thức trái ngọt",
        sceneDescription: "Một nhóm trẻ em thơ ngây đang vui vẻ ăn những quả táo chín mọng, thơm lừng.",
        dialogue: "No act of goodness is wasted just because you won't see its end.",
        vietnameseDialogue: "Không một sự tử tế nào là vô ích, chỉ vì bạn chẳng thể tận mắt nhìn thấy hồi kết."
      },
      {
        panelNumber: 7,
        title: "Hoàng hôn và sự cống hiến",
        sceneDescription: "Bà cụ đứng nhìn về phía hoàng hôn vàng ấm áp, bình yên và thanh thản.",
        dialogue: "Most of us only plant what we expect to harvest ourselves. But the most meaningful things in life—the ones that outlast us—are always planted by someone who never asked to be thanked.",
        vietnameseDialogue: "Phần lớn chúng ta chỉ gieo trồng những gì mình mong thu hoạch. Nhưng những điều ý nghĩa nhất cuộc đời, luôn được gieo bởi người không cầu mong được cảm ơn."
      }
    ],
    bottomPunchline: "You don't have to see the end to make a beginning worth something. Someone will eat the fruit you plant today.",
    vietnamesePunchline: "Bạn không cần thấy hồi kết để khởi đầu có ý nghĩa. Rồi sẽ có người được ăn quả ngọt mà bạn gieo ngày hôm nay.",
    imagePrompt: `A full-page vertical comic strip, aspect ratio 9:16, warm storybook illustration style, soft digital painting, cozy aesthetic with gentle golden lighting, wholesome European graphic novel style. Arranged in sequential panels from top to bottom with neat white borders. Top header in bold friendly typography: "THE OLD WOMAN AND THE APPLE TREE". Panels show a kind 80-year-old grandmother planting an apple tree, talking to a skeptical neighbor, a time-lapse of the growing apple tree (Year 1, Year 5, Year 10), joyful children eating apples, and a golden sunset view. Clear speech bubbles with readable dialogue. Bottom section features an inspirational quote with a small sprouting seedling illustration: "You don't have to see the end to make a beginning worth something. Someone will eat the fruit you plant today." Masterpiece storytelling art. --ar 9:16 --v 6.1`,
    bgm: "Idea 10 - Gibran Alcocer (Emotional Nostalgic Piano)"
  },
  {
    id: 'fable_potter_hands',
    title: "THE POTTER'S HANDS",
    vietnameseTitle: "Đôi Tay Người Thợ Gốm",
    topic: "1,000 lần thất bại âm thầm tạo nên bậc thầy",
    summary: "Người đời chỉ nhìn vào chiếc bát gốm hoàn hảo mà quên rằng nó được đúc kết từ đống mảnh vỡ của hàng nghìn lần vụng về thất bại.",
    panels: [
      {
        panelNumber: 1,
        title: "Cậu học trò tìm đến người thầy",
        sceneDescription: "Một cậu bé học việc bước vào xưởng gốm ấm áp, hỏi người nghệ nhân già râu bạc với ánh mắt ngưỡng mộ.",
        dialogue: "This is a story about a man who failed 1,000 times.\nA young student once visited a master potter and asked: 'How did you become so skilled?'",
        vietnameseDialogue: "Cậu học trò tìm đến người thợ gốm già và hỏi: 'Thưa thầy, làm sao thầy đạt được tay nghề giỏi như vậy?'"
      },
      {
        panelNumber: 2,
        title: "Góc tối của những thất bại",
        sceneDescription: "Người thầy chỉ vào góc xưởng chất đầy những bình gốm nứt, mẻ, biến dạng.",
        dialogue: "The old man pointed to a corner of the workshop—piled high with broken, cracked, uneven pots.\nStudent: 'But those are all failures.'",
        vietnameseDialogue: "Người thợ già chỉ vào góc xưởng chất đầy những bình gốm vỡ vụn.\nCậu bé: 'Nhưng đó toàn là đồ hỏng mà thầy.'"
      },
      {
        panelNumber: 3,
        title: "Đó là những bài học",
        sceneDescription: "Người thợ già mỉm cười đôn hậu.",
        dialogue: "'No,' the potter smiled. 'Those are all lessons.'",
        vietnameseDialogue: "'Không,' người thợ gốm mỉm cười. 'Đó toàn là những bài học đấy con ạ.'"
      },
      {
        panelNumber: 4,
        title: "Bản chất của kỹ năng",
        sceneDescription: "Ông giơ lên chiếc bát gốm tròn trịa, láng mịn không một tì vết.",
        dialogue: "'The hands that made those pots are the same hands that made this one.'",
        vietnameseDialogue: "'Đôi bàn tay làm hỏng những chiếc bình kia, cũng chính là đôi bàn tay làm nên chiếc bát này.'"
      },
      {
        panelNumber: 5,
        title: "Hơi ấm từ lò nung",
        sceneDescription: "Ông trao chiếc bát vào tay cậu bé, khói ấm bốc lên nhẹ nhàng.",
        dialogue: "He placed a perfect bowl in the student's hands. Still warm from the kiln.",
        vietnameseDialogue: "Ông đặt chiếc bát gốm hoàn hảo còn ấm hơi lửa vào tay cậu học trò."
      },
      {
        panelNumber: 6,
        title: "Mặt sau của thành công",
        sceneDescription: "Khung đối lập: Chiếc bát hoàn hảo được trưng bày đối lập với đống vỡ vụn bị giấu kín.",
        dialogue: "We celebrate the perfect bowl. We hide the broken ones. But the broken ones are the whole story.",
        vietnameseDialogue: "Người đời thường ngợi ca chiếc bát hoàn hảo và giấu đi những mảnh vỡ. Nhưng mảnh vỡ mới là toàn bộ câu chuyện."
      },
      {
        panelNumber: 7,
        title: "Đúc kết cho người đang nỗ lực",
        sceneDescription: "Cậu bé ngồi trước đống đất sét, ánh lửa lò nung chiếu rọi gương mặt đầy quyết tâm.",
        dialogue: "Every skill you admire in someone else was built on a pile of quiet failures they never showed you.",
        vietnameseDialogue: "Mọi kỹ năng phi thường bạn ngưỡng mộ ở người khác đều được dựng xây từ hàng nghìn thất bại thầm lặng."
      }
    ],
    bottomPunchline: "You are not behind. You are mid-pile. Keep throwing.",
    vietnamesePunchline: "Bạn không hề chậm trễ. Bạn chỉ đang ở giữa đống mảnh vỡ bài học. Hãy kiên trì tiến lên.",
    imagePrompt: `A full-page vertical comic strip, aspect ratio 9:16, warm storybook illustration style, soft digital painting, cozy aesthetic with gentle golden lighting, reminiscent of modern graphic novels. Sequential panels reading from top to bottom with neat white borders. Top header in bold typography: "THE POTTER'S HANDS". Panels show an old kind master potter with glasses and a young boy in a pottery workshop with piles of broken cracked pots and one glowing perfect bowl. Clear speech bubbles with dialogue. Bottom quote: "You are not behind. You are mid-pile. Keep throwing." Warm fireplace lighting, emotional atmosphere. --ar 9:16 --v 6.1`,
    bgm: "Experience - Ludovico Einaudi (Inspiring Crescendo Piano)"
  },
  {
    id: 'fable_pale_blue_spark',
    title: "THE PALE BLUE SPARK",
    vietnameseTitle: "Tia Sáng Xanh Nhạt (Bụi Sao & Tình Yêu)",
    topic: "Lòng trắc ẩn, buông bỏ lòng tham và tình người giữa vũ trụ bao la",
    summary: "Hai phi hành gia Orion và Jax trôi dạt ngoài không gian nhìn về Trái Đất. Giữa lằn ranh sinh tử khi bình oxy cạn kiệt, họ nhận ra của cải trần tục chẳng là gì so với lòng trắc ẩn và sự sẻ chia.",
    panels: [
      {
        panelNumber: 1,
        title: "Trái Đất và biên giới",
        sceneDescription: "Hai phi hành gia lơ lửng ngoài không gian nhìn về Trái Đất xanh bé nhỏ.",
        dialogue: "Look at Earth. We killed ourselves fighting for its borders.",
        vietnameseDialogue: "Nhìn Trái Đất kìa. Chúng ta đã tàn sát lẫn nhau vì những đường biên giới của nó."
      },
      {
        panelNumber: 2,
        title: "Lòng tham trần tục",
        sceneDescription: "Jax nhìn vào máy tính bảng chứa các biểu đồ mỏ vàng và quyền lực.",
        dialogue: "If we survived, I'd grab more gold mines. Power is everything down there.",
        vietnameseDialogue: "Nếu chúng ta sống sót, tôi sẽ chiếm thêm nhiều mỏ vàng. Dưới đó quyền lực là tất cả."
      },
      {
        panelNumber: 3,
        title: "Chân lý vũ trụ",
        sceneDescription: "Orion nhìn Jax với ánh mắt thấu suốt.",
        dialogue: "Gold cannot buy oxygen here. Greed blinds us to the real universe.",
        vietnameseDialogue: "Vàng không thể mua được oxy ở đây. Lòng tham làm chúng ta mù quáng trước vũ trụ thực sự."
      },
      {
        panelNumber: 4,
        title: "Sự giằng xé",
        sceneDescription: "Jax tức giận nắm chặt chiếc máy tính bảng.",
        dialogue: "Without wealth, life is meaningless! Everyone fights for themselves!",
        vietnameseDialogue: "Không có sự giàu có, cuộc sống thật vô nghĩa! Ai cũng đấu tranh cho riêng mình!"
      },
      {
        panelNumber: 5,
        title: "Tình yêu để lại dấu vết",
        sceneDescription: "Orion chỉ tay về phía hành tinh xanh xa xôi lấp lánh.",
        dialogue: "From up here, borders vanish. Only love and kindness leave a trace.",
        vietnameseDialogue: "Từ trên này, mọi biên giới đều biến mất. Chỉ có tình yêu và lòng tốt mới để lại dấu vết."
      },
      {
        panelNumber: 6,
        title: "Sự thức tỉnh trong lặng im",
        sceneDescription: "Jax buông tay, để chiếc máy tính bảng trôi dạt vào không gian sâu thẳm.",
        dialogue: "Jax stands in absolute silence, watching his earthly obsessions float away forever.",
        vietnameseDialogue: "Jax đứng trong sự im lặng tuyệt đối, nhìn những nỗi ám ảnh trần tục trôi đi mãi mãi."
      },
      {
        panelNumber: 7,
        title: "Đồng hồ oxy cạn kiệt",
        sceneDescription: "Đồng hồ áp suất của Orion an toàn ở vạch xanh, còn đồng hồ của Jax đã chạm vạch đỏ nguy cấp.",
        dialogue: "Orion's gauge is safe, but Jax's emergency oxygen tank is running completely dry.",
        vietnameseDialogue: "Đồng hồ của Orion an toàn, nhưng bình oxy dự phòng của Jax đã cạn kiệt hoàn toàn."
      },
      {
        panelNumber: 8,
        title: "Hành động hy sinh",
        sceneDescription: "Orion tháo dây van oxy của mình nối sang cho Jax trong sự kinh ngạc của bạn.",
        dialogue: "What are you doing? You'll die!",
        vietnameseDialogue: "Cậu đang làm gì thế? Cậu sẽ chết mất!"
      },
      {
        panelNumber: 9,
        title: "Chúng ta là bụi sao",
        sceneDescription: "Orion mỉm cười thanh thản và hạnh phúc.",
        dialogue: "We are stardust. Compassion is the only legacy that truly matters.",
        vietnameseDialogue: "Chúng ta đều là bụi sao. Lòng trắc ẩn mới là di sản duy nhất thực sự quan trọng."
      },
      {
        panelNumber: 10,
        title: "Bàn tay nắm chặt",
        sceneDescription: "Jax rưng rưng nắm chặt bàn tay của Orion, cùng ngắm nhìn Trái Đất.",
        dialogue: "Jax holds Orion's hand tightly as they gaze peacefully at the blue planet together.",
        vietnameseDialogue: "Jax nắm chặt tay Orion khi họ cùng nhau bình yên ngắm nhìn hành tinh xanh."
      },
      {
        panelNumber: 11,
        title: "Tình yêu vượt không gian",
        sceneDescription: "Hai phi hành gia phát sáng ấm áp giữa bầu trời sao vĩnh cửu.",
        dialogue: "In the end, love outweighs the entire universe.",
        vietnameseDialogue: "Cuối cùng, tình yêu lớn hơn cả toàn bộ vũ trụ."
      }
    ],
    bottomPunchline: "In the vastness of space, we finally learn that what we own matters less than who we love.",
    vietnamesePunchline: "Giữa không gian bao la, cuối cùng chúng ta nhận ra những gì ta sở hữu không quan trọng bằng những người ta yêu thương.",
    imagePrompt: `A dense 11-panel vertical comic sheet, aspect ratio 9:16, warm storybook illustration style, deep space watercolor palette, cozy celestial golden lighting. Sequential panels showing two astronauts Orion and Jax, looking at Earth, sharing an oxygen tube, and holding hands in peace. Clear speech bubbles. Bottom quote: "In the vastness of space, we finally learn that what we own matters less than who we love." --ar 9:16 --v 6.1`,
    bgm: "Cornfield Chase - Hans Zimmer (Interstellar OST)"
  }
];

const BGM_PRESETS = [
  { id: 'nostalgic_piano', name: 'Nostalgic Piano', desc: 'Hoài niệm, êm đềm & sâu lắng', audioUrl: 'http://localhost:5000/assets/bgm/nostalgic_piano.mp3', tag: 'Cảm Xúc' },
  { id: 'emotional_crescendo', name: 'Emotional Crescendo', desc: 'Bừng sáng, cao trào (như Experience)', audioUrl: 'http://localhost:5000/assets/bgm/emotional_crescendo.mp3', tag: 'Truyền Lửa' },
  { id: 'warm_acoustic', name: 'Warm Cozy Acoustic', desc: 'Ấm cúng, mộc mạc & thư giãn', audioUrl: 'http://localhost:5000/assets/bgm/warm_acoustic.mp3', tag: 'Mộc Mạc' },
  { id: 'deep_reflection', name: 'Deep Night Reflection', desc: 'Trầm lắng, chiêm nghiệm về đêm', audioUrl: 'http://localhost:5000/assets/bgm/deep_reflection.mp3', tag: 'Triết Lý' }
];

const VOICE_CATALOG = [
  {
    group: '🇻🇳 Giọng Tiếng Việt (Tự nhiên, truyền cảm)',
    voices: [
      { id: 'vi-VN-NamMinhNeural', name: '🇻🇳 Nam Minh (Nam Việt - Trầm ấm, truyền cảm)' },
      { id: 'vi-VN-HoaiMyNeural', name: '🇻🇳 Hoài My (Nữ Việt - Dịu dàng, cảm xúc)' }
    ]
  },
  {
    group: '🇺🇸🇬🇧 Giọng Nam Tiếng Anh',
    voices: [
      { id: 'en-US-GuyNeural', name: '🇺🇸 Guy (Nam Mỹ - Trẻ trung, diễn cảm)' },
      { id: 'en-US-AndrewNeural', name: '🇺🇸 Andrew (Nam Mỹ - Sôi nổi, ấm áp)' },
      { id: 'en-GB-RyanNeural', name: '🇬🇧 Ryan (Nam Anh - Quý phái, điềm tĩnh)' },
      { id: 'en-US-BrianNeural', name: '🇺🇸 Brian (Nam Mỹ - Mạnh mẽ, hiện đại)' },
      { id: 'en-US-ChristopherNeural', name: '🇺🇸 Christopher (Nam Mỹ - Trầm ấm kinh điển)' },
      { id: 'en-GB-ThomasNeural', name: '🇬🇧 Thomas (Nam Anh - Đậm chất cổ tích/BBC)' }
    ]
  },
  {
    group: '🇺🇸🇬🇧 Giọng Nữ Tiếng Anh',
    voices: [
      { id: 'en-US-AriaNeural', name: '🇺🇸 Aria (Nữ Mỹ - Nhẹ nhàng, sâu sắc)' },
      { id: 'en-US-AvaNeural', name: '🇺🇸 Ava (Nữ Mỹ - Điềm đạm, ấm áp)' },
      { id: 'en-GB-SoniaNeural', name: '🇬🇧 Sonia (Nữ Anh - Thanh lịch, tinh tế)' },
      { id: 'en-US-EmmaNeural', name: '🇺🇸 Emma (Nữ Mỹ - Tươi vui, tự nhiên)' }
    ]
  }
];

export default function YouTubeComicStudioTab() {
  const [activeTab, setActiveTab] = useState('generator'); // 'generator' | 'video-maker' | 'library' | 'music-guide'
  const [topicInput, setTopicInput] = useState('');
  const [storyLanguage, setStoryLanguage] = useState('vi'); // 'vi' (Tiếng Việt) | 'en' (Tiếng Anh)
  const [generating, setGenerating] = useState(false);
  const [currentStory, setCurrentStory] = useState(() => {
    try {
      const saved = localStorage.getItem('socialhub_last_comic_story');
      if (saved) return JSON.parse(saved);
    } catch {}
    // Mặc định chọn THE PALE BLUE SPARK (Orion & Jax)
    return CURATED_FABLES[2] || CURATED_FABLES[0];
  });
  const [isScanningImage, setIsScanningImage] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);
  const [notification, setNotification] = useState(null);

  // 1-Click Video Render States
  const [videoImageFile, setVideoImageFile] = useState(null);
  const [videoImagePreview, setVideoImagePreview] = useState(null);
  const [videoAudioFile, setVideoAudioFile] = useState(null);
  const [videoDuration, setVideoDuration] = useState(35);
  const [renderMode, setRenderMode] = useState('panels'); // 'panels' | 'scroll'
  
  // Audio & Voice States
  const [audioMode, setAudioMode] = useState('ai_voice'); // 'ai_voice' | 'silent' | 'custom_audio'
  const [enableBgm, setEnableBgm] = useState(true);
  const [bgmSourceType, setBgmSourceType] = useState('preset'); // 'preset' | 'upload'
  const [customBgmFile, setCustomBgmFile] = useState(null);
  const [selectedBgm, setSelectedBgm] = useState('nostalgic_piano');
  const [bgmVolume, setBgmVolume] = useState(20); // 20%
  const [ttsLanguage, setTtsLanguage] = useState('vi'); // 'vi' | 'en'
  const [editableDialogues, setEditableDialogues] = useState([]);
  const [isDialogueListOpen, setIsDialogueListOpen] = useState(false);
  const [voiceCast, setVoiceCast] = useState({
    charA: 'vi-VN-NamMinhNeural',
    charB: 'vi-VN-HoaiMyNeural',
    narrator: 'vi-VN-NamMinhNeural'
  });
  const [playingBgmId, setPlayingBgmId] = useState(null);
  const audioRef = React.useRef(null);
  const [playingVoiceId, setPlayingVoiceId] = useState(null);
  const voiceAudioRef = React.useRef(null);

  // Hàm sinh danh sách lời thoại chuẩn theo ngôn ngữ được chọn
  const buildStoryDialogues = (story, lang = 'vi') => {
    let panels = story?.panels;
    const isVi = lang === 'vi';
    if (!panels || panels.length === 0) {
      if (isVi) {
        return [
          { panelNumber: 1, title: 'Bắt đầu', speaker: 'charA', text: 'Này bạn, bạn đang vội vã đi tìm điều gì thế?' },
          { panelNumber: 2, title: 'Nghi vấn', speaker: 'charB', text: 'Tôi tìm thành công, tôi sợ mình sẽ bỏ lỡ cơ hội.' },
          { panelNumber: 3, title: 'Đối thoại', speaker: 'charA', text: 'Cây sồi trăm năm cần thời gian bén rễ sâu trong lòng đất.' },
          { panelNumber: 4, title: 'Phản biện', speaker: 'charB', text: 'Nhưng ngoài kia ai cũng đang chạy rất nhanh.' },
          { panelNumber: 5, title: 'Trí tuệ', speaker: 'charA', text: 'Chạy nhanh mà lạc hướng thì đích đến chỉ là sự mệt mỏi.' },
          { panelNumber: 6, title: 'Lặng im', speaker: 'charB', text: '' },
          { panelNumber: 7, title: 'Năm 1', speaker: 'charA', text: 'Năm tháng đi qua sẽ chứng minh giá trị của sự kiên định.' },
          { panelNumber: 8, title: 'Năm 5', speaker: 'charB', text: 'Tôi bắt đầu hiểu ra bài học của sự tĩnh lặng.' },
          { panelNumber: 9, title: 'Năm 10', speaker: 'charA', text: 'Mỗi ngày tích lũy một chút chính là con đường vững chắc nhất.' },
          { panelNumber: 10, title: 'Bình yên', speaker: 'charB', text: 'Cảm ơn bạn, tôi sẽ kiên nhẫn bước tiếp con đường của mình.' },
          { panelNumber: 11, title: 'Quote Chốt Hạ', speaker: 'narrator', text: 'Bình an trong tâm chính là khởi đầu của mọi kỳ tích.' }
        ];
      } else {
        return [
          { panelNumber: 1, title: 'Start', speaker: 'charA', text: 'Where are you rushing in such a hurry, young friend?' },
          { panelNumber: 2, title: 'Question', speaker: 'charB', text: 'I am looking for quick success before time runs out.' },
          { panelNumber: 3, title: 'Wisdom', speaker: 'charA', text: 'A great oak takes decades to quietly root deep into the earth.' },
          { panelNumber: 4, title: 'Debate', speaker: 'charB', text: 'But everyone around me seems to be moving so fast.' },
          { panelNumber: 5, title: 'Truth', speaker: 'charA', text: 'Moving fast in the wrong direction only leads to exhaustion.' },
          { panelNumber: 6, title: 'Silence', speaker: 'charB', text: '' },
          { panelNumber: 7, title: 'Year 1', speaker: 'charA', text: 'Quiet persistence always outlasts fleeting hype.' },
          { panelNumber: 8, title: 'Year 5', speaker: 'charB', text: 'I think I finally understand the true value of patience.' },
          { panelNumber: 9, title: 'Year 10', speaker: 'charA', text: 'Small steady steps each day build an unshakable future.' },
          { panelNumber: 10, title: 'Peace', speaker: 'charB', text: 'Thank you, I will walk with peace and determination.' },
          { panelNumber: 11, title: 'Quote Footer', speaker: 'narrator', text: 'True strength begins with stillness of the mind.' }
        ];
      }
    }

    const list = panels.map((p, idx) => {
      let raw = '';
      if (isVi) {
        raw = p.vietnameseDialogue || (story.language === 'vi' ? (p.dialogue || p.dialogueOrNarration) : '') || p.vietnameseDialogue || p.dialogue || p.dialogueOrNarration || '';
      } else {
        raw = p.englishDialogue || (story.language === 'en' ? (p.dialogue || p.dialogueOrNarration) : '') || p.dialogue || p.dialogueOrNarration || '';
      }

      let speaker = 'charA';
      const low = (raw || '').toLowerCase();
      if (
        low.includes('narrator:') || low.includes('caption:') ||
        low.includes('dẫn chuyện:') || low.includes('người kể:') || low.includes('chú thích:')
      ) {
        speaker = 'narrator';
      } else if (
        low.includes('maya:') || low.includes('woman:') || low.includes('girl:') || low.includes('mother:') ||
        low.includes('bà lão:') || low.includes('bà cụ:') || low.includes('cô bé:') || low.includes('cô gái:') || low.includes('người mẹ:') ||
        low.includes('nữ:') || low.includes('chị:') || low.includes('em gái:')
      ) {
        speaker = 'charB';
      } else if (
        low.includes('leo:') || low.includes('man:') || low.includes('boy:') || low.includes('neighbor:') ||
        low.includes('ông lão:') || low.includes('cậu bé:') || low.includes('chàng trai:') || low.includes('người thợ:') ||
        low.includes('người cha:') || low.includes('người thầy:') || low.includes('học trò:') || low.includes('nam:')
      ) {
        speaker = 'charA';
      } else {
        speaker = idx % 2 === 0 ? 'charA' : 'charB';
      }

      // Loại bỏ tiền tố tên nhân vật (ví dụ "Bà lão: ", "Student: ")
      let cleanText = (raw || '').replace(/^[^:]+:\s*/, '');
      // Loại bỏ toàn bộ phần trong ngoặc đơn (...) hoặc ngoặc vuông [...]
      cleanText = cleanText.replace(/\(.*?\)/g, '').replace(/\[.*?\]/g, '').replace(/["'“”]/g, '').trim();

      return {
        panelNumber: p.panelNumber || (idx + 1),
        title: p.title || `Khung ${idx + 1}`,
        speaker,
        text: cleanText
      };
    });

    const punchline = isVi
      ? (story.vietnamesePunchline || (story.language === 'vi' ? story.bottomPunchline : '') || story.bottomPunchline || '')
      : (story.englishPunchline || (story.language === 'en' ? story.bottomPunchline : '') || story.bottomPunchline || '');

    if (punchline) {
      const cleanPunch = punchline
        .replace(/\(.*?\)/g, '')
        .replace(/\[.*?\]/g, '')
        .replace(/["'“”]/g, '')
        .trim();
      list.push({
        panelNumber: list.length + 1,
        title: isVi ? 'Quote Chốt Hạ' : 'Quote Footer',
        speaker: 'narrator',
        text: cleanPunch
      });
    }
    return list;
  };

  // Tự động khởi tạo & đồng bộ lời thoại khi currentStory hoặc ttsLanguage thay đổi
  React.useEffect(() => {
    const list = buildStoryDialogues(currentStory, ttsLanguage);
    setEditableDialogues(list);
  }, [currentStory, ttsLanguage]);

  // Chuyển đổi ngôn ngữ đọc lồng tiếng và tự động chỉnh bộ diễn viên tương ứng
  const handleSwitchTtsLanguage = (newLang) => {
    setTtsLanguage(newLang);
    if (newLang === 'vi') {
      setVoiceCast({
        charA: 'vi-VN-NamMinhNeural',
        charB: 'vi-VN-HoaiMyNeural',
        narrator: 'vi-VN-NamMinhNeural'
      });
    } else {
      setVoiceCast({
        charA: 'en-US-GuyNeural',
        charB: 'en-US-AriaNeural',
        narrator: 'en-US-ChristopherNeural'
      });
    }
    const newList = buildStoryDialogues(currentStory, newLang);
    setEditableDialogues(newList);
  };

  // Cập nhật câu thoại thủ công từng dòng
  const handleUpdateDialogueText = (index, newText) => {
    setEditableDialogues(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], text: newText };
      return copy;
    });
  };

  const handleUpdateDialogueSpeaker = (index, newSpeaker) => {
    setEditableDialogues(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], speaker: newSpeaker };
      return copy;
    });
  };

  const handleResetDialogues = () => {
    const list = buildStoryDialogues(currentStory, ttsLanguage);
    setEditableDialogues(list);
  };

  // Kiểm tra cảnh báo lệch ngôn ngữ giữa giọng đọc và câu thoại
  const checkLanguageMismatch = () => {
    const hasViVoice = [voiceCast.charA, voiceCast.charB, voiceCast.narrator].some(v => v?.includes('vi-VN'));
    const hasEnVoice = [voiceCast.charA, voiceCast.charB, voiceCast.narrator].some(v => v?.includes('en-') || v?.includes('en_'));
    
    const allTexts = (editableDialogues || []).map(d => d.text).filter(Boolean).join(' ');
    const hasVnDiacritics = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(allTexts);
    const enWordMatches = allTexts.match(/\b(the|and|is|in|it|you|that|he|was|for|on|are|with|as|his|they|at|be|this|have|from|tree|apple|potter|workshop|fable|student)\b/gi);
    const hasManyEnWords = enWordMatches && enWordMatches.length >= 2;

    if (hasViVoice && hasManyEnWords && !hasVnDiacritics) {
      return {
        mismatch: true,
        type: 'vi_voice_en_text',
        message: 'Cảnh báo: Giọng đọc đang chọn là Tiếng Việt (Nam Minh / Hoài My) nhưng lời thoại là Tiếng Anh. AI sẽ phát âm từ tiếng Anh theo kiểu tiếng Việt gây khó hiểu!',
        actionText: '🇻🇳 Tự động đổi câu thoại sang Tiếng Việt chuẩn'
      };
    }
    if (hasEnVoice && hasVnDiacritics) {
      return {
        mismatch: true,
        type: 'en_voice_vi_text',
        message: 'Cảnh báo: Giọng đọc đang chọn là Tiếng Anh nhưng lời thoại có dấu Tiếng Việt!',
        actionText: '🇬🇧 Tự động đổi câu thoại sang Tiếng Anh'
      };
    }
    return { mismatch: false };
  };

  // Play / Pause preview audio for Voice
  const togglePlayVoice = (voiceId) => {
    if (playingVoiceId === voiceId) {
      if (voiceAudioRef.current) {
        voiceAudioRef.current.pause();
      }
      setPlayingVoiceId(null);
    } else {
      if (voiceAudioRef.current) {
        voiceAudioRef.current.pause();
      }
      if (audioRef.current) {
        audioRef.current.pause();
        setPlayingBgmId(null);
      }
      const audio = new Audio(`http://localhost:5000/assets/voices/${voiceId}.mp3`);
      audio.volume = 0.9;
      audio.onended = () => setPlayingVoiceId(null);
      audio.onerror = () => setPlayingVoiceId(null);
      audio.play().catch(() => {});
      voiceAudioRef.current = audio;
      setPlayingVoiceId(voiceId);
    }
  };

  const [renderingVideo, setRenderingVideo] = useState(false);
  const [renderedResult, setRenderedResult] = useState(null);

  // Play / Pause preview audio for BGM
  const togglePlayBgm = (bgm) => {
    if (playingBgmId === bgm.id) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlayingBgmId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(bgm.audioUrl);
      audio.volume = 0.5;
      audio.onended = () => setPlayingBgmId(null);
      audio.play().catch(() => {});
      audioRef.current = audio;
      setPlayingBgmId(bgm.id);
    }
  };

  // Trích xuất danh sách thoại của từng khung hình kèm gán nhân vật tự động (hàm tương thích ngược)
  const getStoryDialogues = () => {
    if (editableDialogues && editableDialogues.length > 0) {
      return editableDialogues;
    }
    return buildStoryDialogues(currentStory, ttsLanguage);
  };

  // Quét và trích xuất lời thoại trực tiếp từ ảnh bằng AI Vision
  const handleScanComicImage = async (fileToScan) => {
    const targetFile = fileToScan || videoImageFile;
    if (!targetFile) {
      alert('Vui lòng chọn hoặc tải lên file ảnh trước!');
      return;
    }
    setIsScanningImage(true);
    setNotification(null);
    try {
      const formData = new FormData();
      formData.append('image', targetFile);
      const res = await axios.post('/api/youtube/scan-comic-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data?.success && res.data.story) {
        const scanned = res.data.story;
        setCurrentStory(scanned);
        try {
          localStorage.setItem('socialhub_last_comic_story', JSON.stringify(scanned));
        } catch {}
        const list = buildStoryDialogues(scanned, ttsLanguage);
        setEditableDialogues(list);
        setNotification({
          type: 'success',
          message: `✨ AI đã đọc chính xác 100% câu chuyện từ ảnh: "${scanned.title}" (${list.length} khung thoại)! Giọng đọc giờ đây khớp từng từ từng chữ.`
        });
      }
    } catch (err) {
      console.error('Lỗi scan ảnh:', err);
      const errText = err.response?.data?.error || err.message;
      setNotification({
        type: 'error',
        message: `Lỗi quét ảnh: ${errText}. Mẹo: Bạn có thể chọn trực tiếp câu chuyện từ menu "Kịch bản câu chuyện đang gắn với video" bên dưới để Render ngay!`
      });
    } finally {
      setIsScanningImage(false);
    }
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoImageFile(file);
      setVideoImagePreview(URL.createObjectURL(file));
      setRenderedResult(null);
      // Tự động quét luôn kịch bản từ ảnh mới tải lên
      handleScanComicImage(file);
    }
  };

  const handleAudioFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoAudioFile(file);
    }
  };

  const handleRenderVideo = async (e) => {
    e.preventDefault();
    if (!videoImageFile) {
      alert('Vui lòng chọn hoặc kéo thả 1 file ảnh tranh truyện dọc 9:16!');
      return;
    }
    setRenderingVideo(true);
    try {
      const formData = new FormData();
      formData.append('image', videoImageFile);
      formData.append('duration', videoDuration);
      formData.append('mode', renderMode);
      formData.append('audioMode', audioMode);

      // Xử lý BGM (Nhạc nền)
      if (enableBgm) {
        if (bgmSourceType === 'upload' && customBgmFile) {
          formData.append('bgmFile', customBgmFile);
          formData.append('bgmPreset', 'custom');
        } else {
          formData.append('bgmPreset', selectedBgm);
        }
        formData.append('bgmVolume', (bgmVolume / 100).toFixed(2));
      } else {
        formData.append('bgmPreset', 'none');
      }

      if (audioMode === 'ai_voice') {
        formData.append('voiceCast', JSON.stringify(voiceCast));
        formData.append('panelDialogues', JSON.stringify(getStoryDialogues()));
      } else if (audioMode === 'custom_audio') {
        if (videoAudioFile) {
          formData.append('audio', videoAudioFile);
        }
      }

      const res = await axios.post('/api/youtube/render-shorts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data?.success) {
        setRenderedResult(res.data);
      }
    } catch (err) {
      alert('Lỗi render video: ' + (err.response?.data?.error || err.message));
    } finally {
      setRenderingVideo(false);
    }
  };

  // Sinh kịch bản qua API backend
  const handleGenerateStory = async (e) => {
    if (e) e.preventDefault();
    if (!topicInput.trim()) return;

    setGenerating(true);
    setNotification(null);
    try {
      const res = await axios.post('/api/youtube/comic-script', {
        topic: topicInput.trim(),
        language: storyLanguage
      });
      if (res.data?.story) {
        const enrichedStory = { ...res.data.story, language: storyLanguage };
        setCurrentStory(enrichedStory);
        handleSwitchTtsLanguage(storyLanguage);
        setNotification({
          type: 'success',
          message: `Đã sáng tác xong kịch bản (${storyLanguage === 'vi' ? '🇻🇳 Tiếng Việt' : '🇬🇧 Tiếng Anh'}): "${enrichedStory.title || enrichedStory.vietnameseTitle}"! Hãy kéo xuống xem kịch bản và lấy Prompt vẽ tranh bên dưới.`
        });
        setTimeout(() => {
          const el = document.getElementById('story-board');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } catch (err) {
      console.error('Lỗi tạo truyện tranh:', err);
      setNotification({
        type: 'error',
        message: 'Lỗi sinh kịch bản AI: ' + (err.response?.data?.error || err.message)
      });
    } finally {
      setGenerating(false);
    }
  };

  // Copy helper
  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Hàm tự động tổng hợp toàn bộ phân cảnh, lời thoại và câu chốt thành 1 Prompt vẽ tranh hoàn chỉnh 100%
  const getComprehensiveImagePrompt = (story) => {
    if (!story) return '';
    const title = story.title || 'THE FABLE';
    const panels = story.panels || [];
    const isVi = (story.language === 'vi') || storyLanguage === 'vi';

    // Ghép từng panel theo định dạng đánh số
    const panelsText = panels.map((p, idx) => {
      const pNum = p.panelNumber || (idx + 1);
      const desc = p.sceneDescription || p.title || '';
      let dial = p.dialogue || p.dialogueOrNarration || '';
      if (typeof dial === 'string') {
        dial = dial.split('\n')[0].replace(/\(.*?\)/g, '').replace(/["']/g, '').trim();
      } else {
        dial = '';
      }
      return `- Panel ${pNum}: ${desc}${dial ? ` (speech bubble: "${dial}")` : ''}`;
    }).join('\n');

    const quote = (story.bottomPunchline || '').replace(/["']/g, '').trim();

    return `A dense 11-panel vertical comic sheet, aspect ratio 9:16, classic European vintage storybook illustration, warm matte watercolor on textured parchment paper, Ghibli and classic Pixar aesthetic, cozy earthy tones with gentle rustic golden lighting, strictly NOT anime, NOT webtoon.

The page is strictly structured as an 11-panel sequential comic page arranged in a dense 2-column grid (paired panels across 5 rows, plus a 3-panel time lapse row) with thin neat borders on a warm off-white background, exactly like the classic Apple Tree fable comic.

Top header in bold retro storybook typography: "${title}".

Panels sequence (2 characters having a meaningful dialogue${isVi ? ' with Vietnamese speech bubbles' : ''}):
${panelsText}

Clear readable speech bubbles and small narrative caption boxes with legible typography inside each panel. Expressive gentle characters talking directly to each other.

Bottom footer features a wide inspirational quote with a small delicate central icon: "${quote}".

Masterpiece vintage fable comic sheet, 11 panels. --ar 9:16 --v 6.1`;
  };

  // Copy prompt kèm chủ đề cụ thể để đem sang web chatbot (ChatGPT, Claude, Grok...)
  const handleCopyPromptForWeb = () => {
    const topic = topicInput.trim() || 'Bài học sâu sắc về sự kiên trì và cuộc sống';
    const isVi = storyLanguage === 'vi';
    const promptText = isVi ? `Bạn là một nhà biên kịch truyện tranh ngụ ngôn ngắn (Fable Comic Writer) chuyên sản xuất nội dung cảm động, truyền cảm hứng trên YouTube Shorts & TikTok cho khán giả Việt Nam.

Nhiệm vụ: Viết một câu chuyện ngụ ngôn sâu sắc bằng TIẾNG VIỆT về chủ đề: "${topic}"
Phong cách: Tương tự như câu chuyện kinh điển "THE OLD WOMAN AND THE APPLE TREE" (Bà lão 80 tuổi trồng cây táo có 11 khung tranh).

QUY TẮC BẮT BUỘC:
1. LUÔN CÓ 2 NHÂN VẬT ĐỐI THOẠI TRỰC TIẾP:
   - Nhân vật A (Người thông thái/chính trực/kiên trì): Ví dụ Bà lão, Người thợ già, Người thầy, Người làm vườn... Đại diện cho đạo đức, sự tử tế và cái nhìn sâu xa.
   - Nhân vật B (Người hoài nghi/thực dụng/bốc đồng): Ví dụ Cậu học trò, Người hàng xóm, Người qua đường... Đại diện cho sự nóng vội, hoài nghi hoặc thực dụng.
2. BẮT BUỘC CÓ ĐỦ 10 ĐẾN 12 KHUNG TRANH (PANELS) THEO LƯỚI 2 CỘT:
   - Panel 1 & 2: Bối cảnh Nhân vật A đang kiên trì làm việc + Nhân vật B bước đến hỏi lý do ("Tại sao phải tốn công?").
   - Panel 3 & 4: Nhân vật A đáp bình thản + Nhân vật B phản biện ("Nhưng bạn sẽ chẳng kịp thấy thành quả đâu").
   - Panel 5 & 6: Cú lật ngược tư duy đắt giá (The Wisdom) của Nhân vật A + Nhân vật B đứng im lặng suy ngẫm (Stood in silence).
   - Panel 7, 8, 9: Dòng chảy thời gian 3 ô nhỏ (Năm 1, Năm 5, Năm 10) hoặc 3 giai đoạn trưởng thành âm thầm / bài học nhân quả qua năm tháng.
   - Panel 10 & 11: Hoa trái ngọt ngào để lại cho thế hệ sau hoặc khung cảnh hoàng hôn ấm áp chiêm nghiệm cuộc đời.
3. LỜI THOẠI HOÀN TOÀN BẰNG TIẾNG VIỆT:
   - Dưới 12 từ mỗi ô thoại, cực kỳ súc tích, mộc mạc và dễ đọc trên điện thoại.
   - Định dạng: Tên nhân vật: "Lời thoại tiếng Việt"

Yêu cầu định dạng xuất ra:
- Viết 100% bằng Tiếng Việt (Tiêu đề, phân cảnh, lời thoại và câu danh ngôn ở đáy trang).
- Cuối bài xuất thêm 1 Prompt tiếng Anh hoàn chỉnh (11 panels, 2 columns, style warm storybook vintage watercolor, --ar 9:16) kèm chỉ dẫn vẽ các bong bóng thoại tiếng Việt để dán vào Midjourney / Ideogram.` : `Bạn là một nhà biên kịch truyện tranh ngụ ngôn ngắn (Fable Comic Writer) chuyên sản xuất nội dung cảm động, truyền cảm hứng trên YouTube Shorts & TikTok.

Nhiệm vụ: Viết một câu chuyện ngụ ngôn sâu sắc về chủ đề: "${topic}"
Phong cách: Tương tự như câu chuyện kinh điển "THE OLD WOMAN AND THE APPLE TREE" (Bà lão 80 tuổi trồng cây táo có 11 khung tranh).

QUY TẮC BẮT BUỘC:
1. LUÔN CÓ 2 NHÂN VẬT ĐỐI THOẠI TRỰC TIẾP:
   - Nhân vật A (Người thông thái/kiên trì): Ví dụ Bà lão, Người thợ già, Người làm vườn.
   - Nhân vật B (Người hoài nghi/đặt câu hỏi): Ví dụ Người hàng xóm thắc mắc, Cậu học trò, Người qua đường.
2. BẮT BUỘC CÓ ĐỦ 10 ĐẾN 12 KHUNG TRANH (PANELS) THEO LƯỚI 2 CỘT:
   - Panel 1 & 2: Bối cảnh Nhân vật A đang kiên trì làm việc + Nhân vật B bước đến hỏi lý do ("Tại sao phải tốn công?").
   - Panel 3 & 4: Nhân vật A đáp bình thản + Nhân vật B phản biện ("Nhưng bạn sẽ chẳng kịp thấy nó thành quả đâu").
   - Panel 5 & 6: Cú lật ngược tư duy đắt giá (The Wisdom) của Nhân vật A + Nhân vật B đứng im lặng suy ngẫm (Stood in silence).
   - Panel 7, 8, 9: Dòng chảy thời gian 3 ô nhỏ (Year 1, Year 5, Year 10) hoặc 3 giai đoạn trưởng thành âm thầm.
   - Panel 10 & 11: Hoa trái ngọt ngào để lại cho thế hệ sau hoặc khung cảnh hoàng hôn ấm áp chiêm nghiệm cuộc đời.
3. LỜI THOẠI TIẾNG ANH NGẮN GỌN (Dưới 12 từ mỗi ô thoại, cực kỳ súc tích dễ đọc).

Yêu cầu định dạng:
- Viết bằng tiếng Anh ngắn gọn kèm bản dịch tiếng Việt bên dưới.
- Cuối bài xuất thêm 1 Prompt tiếng Anh hoàn chỉnh (11 panels, 2 columns, style warm storybook vintage watercolor, --ar 9:16) để tôi dán vào Midjourney / Ideogram vẽ nguyên trang truyện có sẵn bong bóng thoại.`;

    navigator.clipboard.writeText(promptText);
    setCopiedKey('web_prompt_dynamic');
    setNotification({
      type: 'success',
      message: `Đã copy Prompt (${isVi ? '🇻🇳 Tiếng Việt' : '🇬🇧 Tiếng Anh'}) cho chủ đề: "${topic}"! Bạn chỉ việc mở ChatGPT hoặc Claude và bấm Ctrl+V để chatbot viết ngay.`
    });
    setTimeout(() => setCopiedKey(null), 3500);
  };

  // Prompt đẻ 15 ý tưởng câu chuyện triệu view cho ChatGPT / Claude
  const getBrainstormIdeasPrompt = () => {
    return `Bạn là chuyên gia sáng tạo nội dung YouTube Shorts triệu view về thể loại truyện tranh ngụ ngôn triết lý (Fable Comics 9:16).

Nhiệm vụ: Hãy lên cho tôi danh sách 15 chủ đề câu chuyện ngụ ngôn cảm động, giàu tính nhân văn và bài học nhân sinh sâu sắc nhất theo phong cách "The Old Woman and The Apple Tree" và "The Potter's Hands".

Yêu cầu mỗi chủ đề gồm:
1. Tên chủ đề ngắn gọn bằng tiếng Việt.
2. Hai nhân vật đối thoại (Ai là người thông thái? Ai là người hoài nghi/thực dụng?).
3. Tình huống xung đột chính.
4. Cú lật ngược tư duy (The Wisdom plot twist) khiến người xem phải sững sờ suy ngẫm.
5. Câu slogan chốt hạ (Punchline) bằng tiếng Việt và tiếng Anh thật ý nghĩa.

Hãy ưu tiên các chủ đề chạm vào cảm xúc người xem: sự hy sinh thầm lặng, lòng trung thực, không so sánh mình với người khác, sự kiên trì trong bóng tối, và luật nhân quả cuộc đời.`;
  };

  // Prompt kịch bản đầy đủ cho chatbot bên ngoài
  const getExternalChatbotPrompt = () => {
    const topic = topicInput.trim() || (currentStory && currentStory.topic) || 'Sự kiên trì vượt qua nghịch cảnh';
    const isVi = (currentStory && currentStory.language === 'vi') || storyLanguage === 'vi';
    if (isVi) {
      return `Bạn là một nhà biên kịch truyện tranh ngụ ngôn ngắn (Fable Comic Writer) chuyên sản xuất nội dung cảm động, truyền cảm hứng trên YouTube Shorts & TikTok cho khán giả Việt Nam.

Nhiệm vụ: Viết một câu chuyện ngụ ngôn sâu sắc bằng TIẾNG VIỆT về chủ đề: "${topic}"
Câu chuyện phải được chia thành một trang truyện tranh dọc (Vertical Comic Strip 9:16) gồm 10 đến 12 khung hình (Panels), tuân theo đúng cấu trúc sau:

1. Tiêu đề (Header): Ngắn gọn bằng tiếng Việt, viết hoa.
2. Panel 1 & 2 (Bối cảnh): Giới thiệu nhân vật chính và một hành động kiên trì / đáng ngưỡng mộ. Nhân vật thứ hai bước đến hoài nghi.
3. Panel 3 & 4 (Xung đột / Đối thoại): Cuộc tranh luận giữa cái nhìn thực dụng và sự tử tế/kiên định.
4. Panel 5 & 6 (Bước ngoặt trí tuệ - The Wisdom): Cú lật ngược tư duy đắt giá khiến đối phương sững sờ suy ngẫm.
5. Panel 7, 8, 9 (Dòng chảy thời gian): Minh chứng bài học nhân quả theo năm tháng (Năm 1, Năm 5, Năm 10).
6. Panel 10 & 11 (Thông điệp đúc kết): Kết cục ấm áp, sự thanh thản trong tâm hồn.
7. Câu chốt cuối ảnh (Bottom Punchline): 1 câu danh ngôn tiếng Việt in đậm truyền động lực sâu sắc.

Yêu cầu định dạng: Lời thoại hoàn toàn bằng Tiếng Việt ngắn gọn, súc tích (dưới 12 từ mỗi ô thoại). Xuất kèm Prompt tiếng Anh để vẽ nguyên trang truyện bằng Midjourney / Ideogram.`;
    }
    return `Bạn là một nhà biên kịch truyện tranh ngụ ngôn ngắn (Fable Comic Writer) chuyên sản xuất nội dung cảm động, truyền cảm hứng trên YouTube Shorts & TikTok.

Nhiệm vụ: Viết một câu chuyện ngụ ngôn sâu sắc về chủ đề: "${topic}"
Câu chuyện phải được chia thành một trang truyện tranh dọc (Vertical Comic Strip 9:16) gồm 6 đến 8 khung hình (Panels), tuân theo đúng cấu trúc sau:

1. Tiêu đề (Header): Ngắn gọn, viết hoa (Ví dụ: THE POTTER'S HANDS, THE OLD WOMAN AND THE APPLE TREE).
2. Panel 1 (Bối cảnh): Giới thiệu nhân vật chính và một hành động kỳ lạ / đáng ngưỡng mộ.
3. Panel 2 & 3 (Xung đột / Nghi vấn): Một người khác (người hàng xóm/học trò/người qua đường) đặt câu hỏi hoài nghi hoặc chỉ ra sự thất bại/vô nghĩa.
4. Panel 4 & 5 (Bước ngoặt trí tuệ - The Wisdom): Lời đáp bình thản nhưng chứa đựng triết lý sâu xa của nhân vật chính.
5. Panel 6 (Dòng chảy thời gian / Bài học): Minh chứng theo năm tháng (Year 1, Year 5, Year 10) hoặc góc nhìn về những thất bại.
6. Panel 7 & 8 (Thông điệp đúc kết): 2-3 câu suy ngẫm nhân sinh ấm áp.
7. Câu chốt cuối ảnh (Bottom Punchline): 1 câu khẩu hiệu in đậm truyền động lực cực mạnh (Ví dụ: "You are not behind. You are mid-pile. Keep throwing.").

Yêu cầu định dạng: Viết bằng tiếng Anh với lời thoại ngắn, súc tích, dễ đọc trên điện thoại. Xuất kèm Prompt tiếng Anh để vẽ nguyên trang truyện bằng Midjourney / Ideogram.`;
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn w-full">
      
      {/* 1. HEADER BANNER */}
      <div className="app-card p-6 sm:p-7 bg-gradient-to-r from-red-600/10 via-amber-500/10 to-orange-500/10 border border-red-500/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-red-600 text-white shadow-md">
                <Youtube className="w-5 h-5" />
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <span>YouTube Shorts Comic Studio</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-600 dark:text-red-400 font-bold border border-red-500/30">
                  Truyện Tranh 9:16
                </span>
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
              Xưởng sáng tạo dòng video triệu view: <b>Truyện ngụ ngôn cuộc sống dạng tranh cuộn dọc (9:16 Storybook Fable Comics)</b>. Tự động sinh kịch bản phân cảnh, prompt vẽ tranh đa khung (Midjourney/Ideogram) và danh sách nhạc BGM viral.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                handleCopy(getBrainstormIdeasPrompt(), 'brainstorm_prompt');
                setNotification({
                  type: 'success',
                  message: 'Đã copy Prompt Đẻ Ý Tưởng! Giờ bạn mở ChatGPT bấm Ctrl+V để nó gợi ý 15 chủ đề ngụ ngôn nhé.'
                });
              }}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition"
              title="Copy prompt bảo ChatGPT đẻ ra 15 chủ đề ngụ ngôn triệu view"
            >
              {copiedKey === 'brainstorm_prompt' ? <Check className="w-4 h-4 text-slate-950" /> : <Lightbulb className="w-4 h-4" />}
              <span>{copiedKey === 'brainstorm_prompt' ? 'Đã copy Prompt Ý Tưởng!' : '💡 Prompt Đẻ Ý Tưởng (ChatGPT)'}</span>
            </button>

            <button
              onClick={() => handleCopy(getExternalChatbotPrompt(), 'master_prompt')}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-950 font-bold text-xs sm:text-sm shadow-md transition"
            >
              {copiedKey === 'master_prompt' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedKey === 'master_prompt' ? 'Đã copy Prompt Kịch Bản!' : 'Copy Prompt Kịch Bản'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. SUB NAVIGATION TABS */}
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs sm:text-sm font-bold overflow-x-auto">
        <button
          onClick={() => setActiveTab('generator')}
          className={`pb-2.5 px-2 transition flex items-center gap-2 shrink-0 ${
            activeTab === 'generator'
              ? 'text-red-500 border-b-2 border-red-500'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Sinh Kịch Bản & Trích Xuất Prompt</span>
        </button>

        <button
          onClick={() => setActiveTab('video-maker')}
          className={`pb-2.5 px-2 transition flex items-center gap-2 shrink-0 ${
            activeTab === 'video-maker'
              ? 'text-red-500 border-b-2 border-red-500'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Film className="w-4 h-4" />
          <span>Xuất Video Shorts Tự Động (Pan & Zoom)</span>
          <span className="px-1.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black tracking-wide animate-pulse">
            Tự Động 100%
          </span>
        </button>

        <button
          onClick={() => setActiveTab('library')}
          className={`pb-2.5 px-2 transition flex items-center gap-2 shrink-0 ${
            activeTab === 'library'
              ? 'text-red-500 border-b-2 border-red-500'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Thư Viện Mẫu Huyền Thoại ({CURATED_FABLES.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('music-guide')}
          className={`pb-2.5 px-2 transition flex items-center gap-2 shrink-0 ${
            activeTab === 'music-guide'
              ? 'text-red-500 border-b-2 border-red-500'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Music className="w-4 h-4" />
          <span>Gu Âm Nhạc BGM Viral</span>
        </button>
      </div>

      {/* 3. TAB 1: GENERATOR & PROMPT EXPORTER */}
      {activeTab === 'generator' && (
        <div className="space-y-6">
          
          {/* Input Box & Quick Topic Pills */}
          <div className="app-card p-5 sm:p-6 space-y-4 border-red-500/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="space-y-0.5">
                <label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <span>Nhập chủ đề hoặc bài học cuộc sống bạn muốn kể:</span>
                </label>
                <p className="text-xs text-slate-500">
                  AI sẽ biến ý tưởng này thành một câu chuyện ngụ ngôn 11 khung tranh cảm động theo chuẩn lưới 2 cột.
                </p>
              </div>

              {/* Nút chọn ngôn ngữ: Tiếng Việt vs Tiếng Anh */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Ngôn ngữ kịch bản:</span>
                <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 shadow-inner">
                  <button
                    type="button"
                    onClick={() => {
                      setStoryLanguage('vi');
                      setVoiceCast({
                        charA: 'vi-VN-NamMinhNeural',
                        charB: 'vi-VN-HoaiMyNeural',
                        narrator: 'vi-VN-NamMinhNeural'
                      });
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                      storyLanguage === 'vi'
                        ? 'bg-red-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span>🇻🇳 Tiếng Việt</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStoryLanguage('en');
                      setVoiceCast({
                        charA: 'en-US-GuyNeural',
                        charB: 'en-US-AriaNeural',
                        narrator: 'en-US-ChristopherNeural'
                      });
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                      storyLanguage === 'en'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span>🇬🇧 Tiếng Anh (English)</span>
                  </button>
                </div>
              </div>
            </div>

            <form onSubmit={handleGenerateStory} className="space-y-3">
              <div className="flex flex-col md:flex-row gap-2.5">
                <input
                  type="text"
                  placeholder="Ví dụ: Về việc không từ bỏ, Chiếc bình nứt biết nở hoa, Cây tre 5 năm bén rễ..."
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
                />

                <div className="flex items-center gap-2 shrink-0">
                  {/* Nút 1: Sinh trực tiếp bằng AI */}
                  <button
                    type="submit"
                    disabled={generating}
                    className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-1.5"
                    title="Dùng trực tiếp AI hệ thống (Gemini)"
                  >
                    <Sparkles className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
                    <span>{generating ? 'Đang sáng tác...' : `⚡ Sinh Kịch Bản ${storyLanguage === 'vi' ? 'Tiếng Việt' : 'Tiếng Anh'}`}</span>
                  </button>

                  {/* Nút 2: Copy Prompt kèm chủ đề sang Web Chatbot */}
                  <button
                    type="button"
                    onClick={handleCopyPromptForWeb}
                    className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-1.5"
                    title="Lấy prompt đã điền sẵn chủ đề này để dán vào ChatGPT / Claude"
                  >
                    {copiedKey === 'web_prompt_dynamic' ? <Check className="w-4 h-4 text-slate-950" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedKey === 'web_prompt_dynamic' ? 'Đã Copy!' : '📋 Lấy Prompt Sang Web Chat'}</span>
                  </button>
                </div>
              </div>

              {/* Quick links to ChatGPT / Claude */}
              <div className="flex items-center justify-between flex-wrap gap-2 pt-1 text-[11px]">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-slate-400 font-semibold">Chủ đề gợi ý:</span>
                  {[
                    "1,000 lần thất bại của người thợ gốm",
                    "Bà lão 80 tuổi trồng cây táo",
                    "Chiếc bình nứt tưới hoa ven đường",
                    "Cây tre mất 5 năm chỉ cắm rễ sâu",
                    "Con bướm và vết rách của cái kén"
                  ].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        setTopicInput(tag);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-red-500/10 hover:text-red-500 text-slate-600 dark:text-slate-300 transition"
                    >
                      {tag}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3 text-slate-500">
                  <span>Mở nhanh:</span>
                  <a
                    href="https://chatgpt.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1"
                  >
                    <span>ChatGPT</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <a
                    href="https://claude.ai"
                    target="_blank"
                    rel="noreferrer"
                    className="text-amber-600 dark:text-amber-400 font-semibold hover:underline flex items-center gap-1"
                  >
                    <span>Claude</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </form>

            {/* Notification / Loading Status */}
            {generating && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2.5 text-xs text-red-600 dark:text-red-400 font-semibold animate-pulse">
                <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                <span>AI đang phân tích cốt truyện, chia 11 khung tranh và viết kịch bản {storyLanguage === 'vi' ? 'Tiếng Việt' : 'Tiếng Anh'} cho bạn... Chờ chút nhé!</span>
              </div>
            )}

            {notification && !generating && (
              <div className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-semibold animate-fadeIn ${
                notification.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
              }`}>
                <span>{notification.message}</span>
                <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-slate-600 ml-2">✕</button>
              </div>
            )}
          </div>

          {/* Current Story Board OR Clean Empty State */}
          {!currentStory ? (
            <div className="app-card p-10 sm:p-14 text-center space-y-4 max-w-xl mx-auto border-dashed border-2">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-500 mx-auto flex items-center justify-center">
                <BookOpen className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Chưa có kịch bản nào được tạo
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                  Hãy nhập chủ đề bạn muốn kể ở trên (hoặc bấm chọn 1 chủ đề gợi ý) rồi bấm <b>"⚡ Sinh Kịch Bản AI"</b> để bắt đầu sáng tạo.
                  <br />
                  Nếu bạn muốn xem lại 2 câu chuyện kinh điển <i>(Người thợ gốm & Cây táo)</i>, hãy chuyển sang tab <b>"Thư Viện Mẫu Huyền Thoại"</b> nhé!
                </p>
              </div>
            </div>
          ) : (
            <div id="story-board" className="space-y-6 animate-fadeIn">
              
              {/* 3-Step Production Guide Callout */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/20 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shrink-0">1</div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">Đọc kịch bản phân cảnh</div>
                    <div className="text-[11px] text-slate-500">Xem diễn biến câu chuyện từ Panel 1 đến Panel 7 bên dưới.</div>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-red-600 text-white font-black text-xs flex items-center justify-center shrink-0">2</div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">Copy Prompt màu vàng</div>
                    <div className="text-[11px] text-slate-500">Dán vào Ideogram.ai hoặc Midjourney để vẽ ảnh dọc 9:16.</div>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-purple-600 text-white font-black text-xs flex items-center justify-center shrink-0">3</div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">Ghép nhạc CapCut</div>
                    <div className="text-[11px] text-slate-500">Lia ảnh từ trên xuống 30s + chèn nhạc piano Idea 10.</div>
                  </div>
                </div>
              </div>

              {/* Story Header Card */}
              <div className="app-card-raised p-6 space-y-4 border-l-4 border-red-500">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">
                        {currentStory.vietnameseTitle || "Truyện Tranh Shorts"}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {currentStory.language === 'vi' || storyLanguage === 'vi' ? '🇻🇳 Lời Thoại Tiếng Việt' : '🇬🇧 English Script'}
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-wide">
                      {currentStory.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => handleCopy(getComprehensiveImagePrompt(currentStory), 'current_prompt')}
                      className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xs transition flex items-center gap-1.5"
                    >
                      {copiedKey === 'current_prompt' ? <Check className="w-4 h-4 text-slate-950" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedKey === 'current_prompt' ? 'Đã copy Prompt Ảnh Chi Tiết!' : 'Copy Prompt Vẽ Tranh (Chi Tiết Tất Cả Khung)'}</span>
                    </button>

                    <button
                      onClick={() => handleCopy(getExternalChatbotPrompt(), 'chat_prompt')}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition flex items-center gap-1.5"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Copy Sang Web Chatbot</span>
                    </button>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed italic">
                  "{currentStory.summary}"
                </p>

                {/* Bottom Punchline Badge */}
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 tracking-wider">
                      Câu chốt hạ cuối tranh (Bottom Punchline):
                    </div>
                    <div className="text-xs sm:text-sm font-black text-slate-900 dark:text-white font-sans">
                      "{currentStory.bottomPunchline}"
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopy(currentStory.bottomPunchline, 'punchline')}
                    className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-500/20"
                    title="Sao chép câu chốt"
                  >
                    {copiedKey === 'punchline' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Panels Sequential Grid */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-red-500" />
                  <span>Cấu Trúc Phân Cảnh (Storyboard Panels):</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {currentStory.panels?.map((panel) => (
                    <div
                      key={panel.panelNumber}
                      className="app-card p-4 space-y-2.5 border-slate-200 dark:border-slate-800 hover:border-red-500/40 transition"
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-md bg-red-500/10 text-red-600 dark:text-red-400 text-[10px] font-black">
                          PANEL {panel.panelNumber}
                        </span>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate max-w-[150px]">
                          {panel.title}
                        </span>
                      </div>

                      <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">Cảnh vẽ: </span>
                        {panel.sceneDescription}
                      </div>

                      <div className="p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/20 text-xs font-medium text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed font-sans">
                        <span className="font-bold text-amber-600 dark:text-amber-400 block text-[10px] uppercase">
                          Lời thoại / Dẫn truyện:
                        </span>
                        {panel.dialogue || panel.dialogueOrNarration}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ready-to-use Midjourney/Ideogram Prompt Box */}
              <div className="app-card p-5 sm:p-6 space-y-3 border-amber-500/30 bg-amber-500/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-amber-500" />
                    <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      Prompt Vẽ Tranh Nguyên Trang Hoàn Chỉnh (Midjourney v6.1 / Ideogram / DALL-E 3)
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopy(getComprehensiveImagePrompt(currentStory), 'full_img_prompt')}
                    className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition flex items-center gap-1"
                  >
                    {copiedKey === 'full_img_prompt' ? <Check className="w-3.5 h-3.5 text-slate-950" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'full_img_prompt' ? 'Đã copy!' : 'Sao chép Prompt Chi Tiết'}</span>
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs leading-relaxed max-h-56 overflow-y-auto border border-slate-800 whitespace-pre-line">
                  {getComprehensiveImagePrompt(currentStory)}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>💡 Tỷ lệ: <b>9:16 dọc</b> • Phong cách: <b>Warm storybook graphic novel</b> • Có khung thoại (speech bubbles)</span>
                  <a
                    href="https://ideogram.ai"
                    target="_blank"
                    rel="noreferrer"
                    className="text-amber-600 dark:text-amber-400 font-semibold hover:underline flex items-center gap-1"
                  >
                    <span>Mở Ideogram.ai để vẽ ngay</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

            </div>
          )}

        </div>
      )}

      {/* 3.2 TAB: 1-CLICK VIDEO MAKER (AUTOMATED PAN & ZOOM SHORTS) */}
      {activeTab === 'video-maker' && (
        <div className="space-y-6">
          <div className="app-card p-6 sm:p-7 space-y-6 border-red-500/20">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-red-600 text-white">
                  <Film className="w-4 h-4" />
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  Tự Động Hóa 100%: Render Video Shorts Pan & Zoom Từ Ảnh Truyện Tranh
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Không cần kéo keyframe thủ công trên CapCut! Hệ thống dùng <b>FFmpeg Server</b> tự động tính toán lia camera từ trên xuống dưới theo nhịp đọc của người xem, phóng to 1.35x và dừng 3 giây ở câu chốt (Bottom quote).
              </p>
            </div>

            <form onSubmit={handleRenderVideo} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Cột 1: Tải ảnh truyện tranh 9:16 */}
                <div className="space-y-3">
                  <label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-red-500" />
                    <span>1. Chọn hoặc kéo thả ảnh truyện tranh dọc 9:16 (*Bắt buộc):</span>
                  </label>

                  {!videoImagePreview ? (
                    <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-red-500 dark:hover:border-red-500 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer bg-slate-50/50 dark:bg-slate-900/30 transition group">
                      <div className="p-3.5 rounded-full bg-red-500/10 text-red-600 group-hover:scale-110 transition">
                        <UploadCloud className="w-7 h-7" />
                      </div>
                      <div className="text-center space-y-1">
                        <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                          Bấm để tải ảnh lên hoặc kéo thả vào đây
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Hỗ trợ định dạng PNG, JPG, WEBP (Khuyên dùng ảnh tỷ lệ 9:16 dọc)
                        </p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-950 flex flex-col items-center p-4">
                      <div className="relative max-h-72 aspect-[9/16] rounded-xl overflow-hidden shadow-lg border border-slate-800">
                        <img
                          src={videoImagePreview}
                          alt="Comic Sheet Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="mt-3 flex flex-col gap-2.5 w-full text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-300 font-mono truncate max-w-[180px]">
                            {videoImageFile?.name}
                          </span>
                          <label className="cursor-pointer text-red-400 hover:text-red-300 font-bold underline">
                            Chọn ảnh khác
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageFileChange}
                              className="hidden"
                            />
                          </label>
                        </div>

                        {/* NÚT AI QUÉT LỜI THOẠI TRỰC TIẾP TỪ ẢNH */}
                        <button
                          type="button"
                          onClick={() => handleScanComicImage()}
                          disabled={isScanningImage || !videoImageFile}
                          className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-black text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-purple-900/40 disabled:opacity-50"
                        >
                          {isScanningImage ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                              <span>AI đang đọc bóng thoại trong ảnh... (2-3s)</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                              <span>✨ AI Quét Lời Thoại Từ Ảnh (Khớp 100%)</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Cột 2: Cài đặt thời lượng & Nhạc nền */}
                <div className="space-y-5 flex flex-col justify-between">
                  
                  {/* BỘ CHỌN KỊCH BẢN TRUYỆN CHO VIDEO NÀY */}
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-blue-500/10 border border-amber-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-amber-500" />
                        <span>Kịch bản câu chuyện đang gắn với video:</span>
                      </label>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400 truncate max-w-[140px]">
                        {currentStory?.vietnameseTitle || currentStory?.title || 'Chưa chọn'}
                      </span>
                    </div>

                    <select
                      value={currentStory?.id || currentStory?.title || 'fable_pale_blue_spark'}
                      onChange={(e) => {
                        const val = e.target.value;
                        const found = CURATED_FABLES.find(f => f.id === val);
                        if (found) {
                          setCurrentStory(found);
                          setEditableDialogues(buildStoryDialogues(found, ttsLanguage));
                        }
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <optgroup label="🚀 KHO TRUYỆN MẪU CHUẨN">
                        {CURATED_FABLES.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.id === 'fable_pale_blue_spark' ? '🚀' : f.id === 'fable_apple_tree' ? '🍏' : '🏺'} {f.title} ({f.vietnameseTitle})
                          </option>
                        ))}
                      </optgroup>
                      {currentStory && !CURATED_FABLES.some(f => f.id === currentStory.id) && (
                        <optgroup label="✨ KỊCH BẢN HIỆN TẠI (Vừa quét từ ảnh hoặc AI sinh)">
                          <option value={currentStory.title || 'custom'}>
                            ✨ {currentStory.title || currentStory.vietnameseTitle || 'Kịch bản riêng'}
                          </option>
                        </optgroup>
                      )}
                    </select>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                      💡 Hãy chọn đúng câu chuyện của tranh bạn tải lên, hoặc bấm nút <b>"AI Quét Lời Thoại Từ Ảnh"</b> để tự động nhận diện 100%!
                    </p>
                  </div>

                  {/* Chế độ Render */}
                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-red-500" />
                      <span>2. Chế độ hiển thị video:</span>
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setRenderMode('panels')}
                        className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                          renderMode === 'panels'
                            ? 'bg-red-500/10 border-red-500 text-slate-900 dark:text-white shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-xs flex items-center gap-1.5">
                            <span>🔍 Zoom Từng Ô Tranh</span>
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-red-600 text-white uppercase">
                            Khuyên dùng
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                          Phóng to từng ô thoại (1, 2, 3... đến Quote) theo thứ tự đọc, chữ to đùng rõ nét, <b>không bao giờ bị cắt viền</b>.
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRenderMode('scroll')}
                        className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                          renderMode === 'scroll'
                            ? 'bg-red-500/10 border-red-500 text-slate-900 dark:text-white shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-xs flex items-center gap-1.5">
                            <span>📜 Cuộn Dọc Toàn Trang</span>
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                            100% Khung
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                          Vừa khít 100% bề ngang, cuộn êm đềm từ đỉnh xuống chân trang, giữ trọn vẹn cả 2 viền chữ.
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* Thời lượng */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span>3. Thời lượng video Shorts:</span>
                      </label>
                      <span className="px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 font-black text-xs">
                        {videoDuration} Giây
                      </span>
                    </div>

                    <input
                      type="range"
                      min="20"
                      max="55"
                      step="5"
                      value={videoDuration}
                      onChange={(e) => setVideoDuration(Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-600"
                    />

                    <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                      <span>20s (Đọc lướt nhanh)</span>
                      <span className="text-red-500 font-bold">35s (Khuyên dùng chuẩn 11 panels)</span>
                      <span>55s (Chậm rãi chiêm nghiệm)</span>
                    </div>
                  </div>

                  {/* 4. Bộ Âm Thanh & Lồng Tiếng Thông Minh */}
                  <div className="space-y-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Music className="w-4 h-4 text-blue-500" />
                        <span>4. Âm thanh & Lồng tiếng (Tùy chọn):</span>
                      </label>
                      <span className="text-[10px] text-slate-400">
                        {audioMode === 'ai_voice' ? '🎙️ Lồng tiếng AI đa nhân vật' : audioMode === 'custom_audio' ? '📁 File riêng' : '🔇 Không tiếng'}
                      </span>
                    </div>

                    {/* 3 Lựa chọn chế độ âm thanh */}
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setAudioMode('silent')}
                        className={`py-2 px-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 ${
                          audioMode === 'silent'
                            ? 'bg-red-500/10 border-red-500 text-red-600 dark:text-red-400 font-bold shadow-xs'
                            : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                        }`}
                      >
                        <VolumeX className="w-4 h-4" />
                        <span className="text-xs">Không Tiếng</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setAudioMode('ai_voice')}
                        className={`py-2 px-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 relative ${
                          audioMode === 'ai_voice'
                            ? 'bg-red-500/10 border-red-500 text-red-600 dark:text-red-400 font-bold shadow-xs'
                            : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                        }`}
                      >
                        <Mic className="w-4 h-4" />
                        <span className="text-xs">Lồng Tiếng AI</span>
                        <span className="absolute -top-1.5 -right-1.5 px-1 py-0.2 rounded-full bg-red-600 text-[8px] text-white font-black uppercase">
                          Mới
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setAudioMode('custom_audio')}
                        className={`py-2 px-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 ${
                          audioMode === 'custom_audio'
                            ? 'bg-red-500/10 border-red-500 text-red-600 dark:text-red-400 font-bold shadow-xs'
                            : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                        }`}
                      >
                        <UploadCloud className="w-4 h-4" />
                        <span className="text-xs">Tải File Lên</span>
                      </button>
                    </div>

                    {/* NỘI DUNG CHẾ ĐỘ 1: LỒNG TIẾNG AI ĐA NHÂN VẬT */}
                    {audioMode === 'ai_voice' && (
                      <div className="space-y-3.5 pt-2 border-t border-slate-200 dark:border-slate-800 animate-fadeIn">
                        
                        {/* LỰA CHỌN NGÔN NGỮ LỒNG TIẾNG */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700">
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-red-500" />
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                              Ngôn ngữ đọc lồng tiếng:
                            </span>
                            <span className="text-[10px] text-slate-400">
                              ({ttsLanguage === 'vi' ? 'Khớp tiếng Việt chuẩn' : 'Khớp tiếng Anh bản xứ'})
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 self-end sm:self-auto">
                            <button
                              type="button"
                              onClick={() => handleSwitchTtsLanguage('vi')}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                                ttsLanguage === 'vi'
                                  ? 'bg-red-600 text-white shadow-xs'
                                  : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                              }`}
                            >
                              <span>🇻🇳 Tiếng Việt</span>
                              {ttsLanguage === 'vi' && <Check className="w-3 h-3" />}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSwitchTtsLanguage('en')}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                                ttsLanguage === 'en'
                                  ? 'bg-red-600 text-white shadow-xs'
                                  : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                              }`}
                            >
                              <span>🇬🇧 Tiếng Anh</span>
                              {ttsLanguage === 'en' && <Check className="w-3 h-3" />}
                            </button>
                          </div>
                        </div>

                        {/* CẢNH BÁO LỆCH NGÔN NGỮ GIỮA GIỌNG VÀ CÂU THOẠI */}
                        {(() => {
                          const check = checkLanguageMismatch();
                          if (!check.mismatch) return null;
                          return (
                            <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-xs flex items-start gap-2.5 animate-fadeIn">
                              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                              <div className="space-y-1.5 flex-1">
                                <p className="text-slate-700 dark:text-slate-200 leading-snug">
                                  {check.message}
                                </p>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleSwitchTtsLanguage(check.type === 'vi_voice_en_text' ? 'vi' : 'en')}
                                    className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-[11px] transition shadow-xs flex items-center gap-1"
                                  >
                                    <span>{check.actionText}</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleSwitchTtsLanguage(check.type === 'vi_voice_en_text' ? 'en' : 'vi')}
                                    className="px-2 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 font-medium text-[11px] transition"
                                  >
                                    {check.type === 'vi_voice_en_text' ? 'Đổi giọng sang Tiếng Anh' : 'Đổi giọng sang Tiếng Việt'}
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })()}

                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-red-500" />
                            <span>Phân vai diễn viên lồng tiếng:</span>
                          </span>
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                            ✓ Khớp 100% từng khung hình
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                          {/* Nhân vật 1 */}
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                              <span>Nhân vật 1 (Chính):</span>
                              <span className="text-[9px] text-slate-400 font-normal">Nam/Nữ tùy chọn</span>
                            </label>
                            <div className="flex items-center gap-1.5">
                              <select
                                value={voiceCast.charA}
                                onChange={(e) => setVoiceCast({ ...voiceCast, charA: e.target.value })}
                                className="flex-1 min-w-0 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-red-500"
                              >
                                {VOICE_CATALOG.map((group) => (
                                  <optgroup key={group.group} label={group.group}>
                                    {group.voices.map((v) => (
                                      <option key={v.id} value={v.id}>{v.name}</option>
                                    ))}
                                  </optgroup>
                                ))}
                              </select>
                              <button
                                type="button"
                                onClick={() => togglePlayVoice(voiceCast.charA)}
                                className={`px-2 py-1.5 rounded-lg border text-xs font-bold transition flex items-center gap-1 shrink-0 ${
                                  playingVoiceId === voiceCast.charA
                                    ? 'bg-red-600 text-white border-red-600 animate-pulse'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                                }`}
                                title="Bấm để nghe thử mẫu giọng này"
                              >
                                {playingVoiceId === voiceCast.charA ? <Pause className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-red-500" />}
                                <span className="text-[10px]">{playingVoiceId === voiceCast.charA ? 'Dừng' : 'Thử'}</span>
                              </button>
                            </div>
                          </div>

                          {/* Nhân vật 2 */}
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                              <span>Nhân vật 2 (Đối thoại):</span>
                              <span className="text-[9px] text-slate-400 font-normal">Nam/Nữ tùy chọn</span>
                            </label>
                            <div className="flex items-center gap-1.5">
                              <select
                                value={voiceCast.charB}
                                onChange={(e) => setVoiceCast({ ...voiceCast, charB: e.target.value })}
                                className="flex-1 min-w-0 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-red-500"
                              >
                                {VOICE_CATALOG.map((group) => (
                                  <optgroup key={group.group} label={group.group}>
                                    {group.voices.map((v) => (
                                      <option key={v.id} value={v.id}>{v.name}</option>
                                    ))}
                                  </optgroup>
                                ))}
                              </select>
                              <button
                                type="button"
                                onClick={() => togglePlayVoice(voiceCast.charB)}
                                className={`px-2 py-1.5 rounded-lg border text-xs font-bold transition flex items-center gap-1 shrink-0 ${
                                  playingVoiceId === voiceCast.charB
                                    ? 'bg-red-600 text-white border-red-600 animate-pulse'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                                }`}
                                title="Bấm để nghe thử mẫu giọng này"
                              >
                                {playingVoiceId === voiceCast.charB ? <Pause className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-red-500" />}
                                <span className="text-[10px]">{playingVoiceId === voiceCast.charB ? 'Dừng' : 'Thử'}</span>
                              </button>
                            </div>
                          </div>

                          {/* Người dẫn chuyện */}
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                              <span>Người dẫn & Quote:</span>
                              <span className="text-[9px] text-slate-400 font-normal">Nam/Nữ tùy chọn</span>
                            </label>
                            <div className="flex items-center gap-1.5">
                              <select
                                value={voiceCast.narrator}
                                onChange={(e) => setVoiceCast({ ...voiceCast, narrator: e.target.value })}
                                className="flex-1 min-w-0 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-red-500"
                              >
                                {VOICE_CATALOG.map((group) => (
                                  <optgroup key={group.group} label={group.group}>
                                    {group.voices.map((v) => (
                                      <option key={v.id} value={v.id}>{v.name}</option>
                                    ))}
                                  </optgroup>
                                ))}
                              </select>
                              <button
                                type="button"
                                onClick={() => togglePlayVoice(voiceCast.narrator)}
                                className={`px-2 py-1.5 rounded-lg border text-xs font-bold transition flex items-center gap-1 shrink-0 ${
                                  playingVoiceId === voiceCast.narrator
                                    ? 'bg-red-600 text-white border-red-600 animate-pulse'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                                }`}
                                title="Bấm để nghe thử mẫu giọng này"
                              >
                                {playingVoiceId === voiceCast.narrator ? <Pause className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-red-500" />}
                                <span className="text-[10px]">{playingVoiceId === voiceCast.narrator ? 'Dừng' : 'Thử'}</span>
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* BẢNG XEM & SỬA CÂU THOẠI TRƯỚC KHI RENDER */}
                        <div className="p-3 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <Edit3 className="w-4 h-4 text-red-500" />
                              <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                                Lời thoại sẽ đọc lồng tiếng ({editableDialogues.length} câu):
                              </span>
                              <span className="text-[10px] px-2 py-0.2 rounded-full font-bold bg-slate-100 dark:bg-slate-800 text-slate-500">
                                {ttsLanguage === 'vi' ? '🇻🇳 Lời Việt' : '🇬🇧 Lời Anh'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={handleResetDialogues}
                                title="Khôi phục câu thoại mặc định"
                                className="text-[11px] text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1 underline"
                              >
                                <RotateCcw className="w-3 h-3" />
                                <span>Gốc</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setIsDialogueListOpen(!isDialogueListOpen)}
                                className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-[11px] flex items-center gap-1"
                              >
                                <span>{isDialogueListOpen ? 'Thu gọn' : 'Xem & Sửa'}</span>
                                {isDialogueListOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                              </button>
                            </div>
                          </div>

                          {/* Xem trước nhanh 2 câu đầu nếu đang thu gọn */}
                          {!isDialogueListOpen && editableDialogues.length > 0 && (
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/40 p-2 rounded-lg truncate">
                              <b>Khung 1:</b> "{editableDialogues[0]?.text}" &bull; <b>Khung 2:</b> "{editableDialogues[1]?.text}" ... <i>(Bấm "Xem & Sửa" để xem/đổi lời từng khung)</i>
                            </div>
                          )}

                          {/* Drawer danh sách đầy đủ khi bấm mở rộng */}
                          {isDialogueListOpen && (
                            <div className="space-y-2 max-h-72 overflow-y-auto pr-1 pt-1 border-t border-slate-100 dark:border-slate-800 animate-fadeIn">
                              {editableDialogues.map((item, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs"
                                >
                                  <span className="w-20 shrink-0 font-bold text-[10px] text-slate-500 text-center bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded">
                                    {item.title || `Khung ${idx + 1}`}
                                  </span>
                                  <select
                                    value={item.speaker}
                                    onChange={(e) => handleUpdateDialogueSpeaker(idx, e.target.value)}
                                    className="w-24 shrink-0 px-1.5 py-1 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-800 dark:text-slate-200"
                                  >
                                    <option value="charA">Nhân vật 1</option>
                                    <option value="charB">Nhân vật 2</option>
                                    <option value="narrator">Dẫn chuyện</option>
                                  </select>
                                  <input
                                    type="text"
                                    value={item.text}
                                    onChange={(e) => handleUpdateDialogueText(idx, e.target.value)}
                                    placeholder="(Không nói gì / Khoảnh khắc tĩnh lặng)"
                                    className="flex-1 min-w-0 px-2 py-1 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-red-500 font-medium"
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                      </div>
                    )}

                    {/* NỘI DUNG CHẾ ĐỘ 2: TẢI FILE RIÊNG */}
                    {audioMode === 'custom_audio' && (
                      <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2 animate-fadeIn">
                        <input
                          type="file"
                          accept="audio/*"
                          onChange={handleAudioFileChange}
                          className="text-xs text-slate-600 dark:text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer"
                        />
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          Tải lên file thu âm giọng đọc của bạn hoặc file nhạc MP3 yêu thích.
                        </p>
                      </div>
                    )}

                    {/* NỘI DUNG CHẾ ĐỘ 3: KHÔNG TIẾNG */}
                    {audioMode === 'silent' && (
                      <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 leading-relaxed animate-fadeIn">
                        Video xuất ra sẽ không có giọng nói. Nếu bạn tích chọn nhạc nền piano bên dưới, video sẽ có nhạc nền êm ái; hoặc để trống hoàn toàn để tự chèn nhạc trend trên TikTok / Shorts.
                      </div>
                    )}

                    {/* PHẦN CHÈN NHẠC NỀN BGM (ÁP DỤNG ĐƯỢC CHO CẢ LỒNG TIẾNG HOẶC KHÔNG TIẾNG) */}
                    <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={enableBgm}
                            onChange={(e) => setEnableBgm(e.target.checked)}
                            className="rounded border-slate-300 text-red-600 focus:ring-red-500"
                          />
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                            <span>🎹 Chèn thêm nhạc nền piano êm dịu (BGM)</span>
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400">
                              Khuyên dùng
                            </span>
                          </span>
                        </label>

                        {enableBgm && (
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-[11px] text-slate-400">Âm lượng BGM:</span>
                            <span className="font-bold text-red-500">{bgmVolume}%</span>
                          </div>
                        )}
                      </div>

                      {enableBgm && (
                        <div className="space-y-3 pl-5 border-l-2 border-red-500/30 animate-fadeIn">
                          
                          {/* Nút chuyển đổi: Nhạc có sẵn vs Tự tải lên */}
                          <div className="flex items-center gap-2 pb-1 text-xs">
                            <button
                              type="button"
                              onClick={() => setBgmSourceType('preset')}
                              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                                bgmSourceType === 'preset'
                                  ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30 shadow-xs'
                                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                              }`}
                            >
                              <span>🎹 4 Bản Piano Có Sẵn</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setBgmSourceType('upload')}
                              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                                bgmSourceType === 'upload'
                                  ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30 shadow-xs'
                                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                              }`}
                            >
                              <UploadCloud className="w-3.5 h-3.5" />
                              <span>📁 Tải Lên File Nhạc MP3 Riêng</span>
                            </button>
                          </div>

                          {/* Tùy chọn A: 4 bản nhạc piano mẫu có nút nghe thử */}
                          {bgmSourceType === 'preset' ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {BGM_PRESETS.map((bgm) => (
                                <div
                                  key={bgm.id}
                                  onClick={() => setSelectedBgm(bgm.id)}
                                  className={`p-2.5 rounded-xl border cursor-pointer transition flex items-center justify-between gap-2 ${
                                    selectedBgm === bgm.id
                                      ? 'bg-red-500/10 border-red-500 shadow-xs'
                                      : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                                  }`}
                                >
                                  <div className="space-y-0.5 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                        {bgm.name}
                                      </span>
                                      <span className="text-[9px] px-1 py-0.2 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 shrink-0">
                                        {bgm.tag}
                                      </span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 truncate">
                                      {bgm.desc}
                                    </p>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      togglePlayBgm(bgm);
                                    }}
                                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-red-600 hover:text-white text-slate-700 dark:text-slate-300 transition shrink-0"
                                    title="Nghe thử bài nhạc này"
                                  >
                                    {playingBgmId === bgm.id ? (
                                      <Pause className="w-3.5 h-3.5 text-red-600 hover:text-white" />
                                    ) : (
                                      <Play className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            /* Tùy chọn B: Tự tải file nhạc nền MP3 riêng */
                            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-dashed border-slate-300 dark:border-slate-700 space-y-2">
                              <input
                                type="file"
                                accept="audio/*"
                                onChange={(e) => setCustomBgmFile(e.target.files?.[0] || null)}
                                className="text-xs text-slate-600 dark:text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-amber-600 file:text-white hover:file:bg-amber-500 cursor-pointer"
                              />
                              {customBgmFile && (
                                <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                                  <Check className="w-4 h-4" />
                                  <span>Đã chọn file nhạc nền: <b>{customBgmFile.name}</b></span>
                                </div>
                              )}
                              <p className="text-[11px] text-slate-400">
                                Hệ thống sẽ tự động hạ nhỏ âm lượng để làm nền êm ái cho giọng đọc theo mức % bạn chọn bên dưới.
                              </p>
                            </div>
                          )}

                          {/* Thanh chỉnh âm lượng nhạc nền */}
                          <div className="flex items-center gap-3 pt-1">
                            <span className="text-[10px] text-slate-400 shrink-0">Độ to nhạc nền:</span>
                            <input
                              type="range"
                              min="10"
                              max="35"
                              step="2"
                              value={bgmVolume}
                              onChange={(e) => setBgmVolume(Number(e.target.value))}
                              className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-600"
                            />
                            <span className="text-[10px] text-slate-400 shrink-0">
                              (18-20% là vừa êm, không lấn giọng)
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Nút hành động Render */}
                  <button
                    type="submit"
                    disabled={renderingVideo || !videoImageFile}
                    className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-sm shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {renderingVideo ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>Đang xử lý Lia Camera Pan & Zoom bằng FFmpeg... (Mất khoảng 3-8 giây)</span>
                      </>
                    ) : (
                      <>
                        <Film className="w-5 h-5" />
                        <span>⚡ Render Video Shorts Tự Động (1080x1920 MP4)</span>
                      </>
                    )}
                  </button>

                </div>

              </div>
            </form>

            {/* KẾT QUẢ VIDEO HOÀN TẤT */}
            {renderedResult && (
              <div className="mt-6 p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-5 animate-fadeIn">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-black text-sm sm:text-base">
                    <Check className="w-5 h-5" />
                    <span>Xuất Video Shorts Thành Công! (Sẵn sàng đăng YouTube Shorts & TikTok)</span>
                  </div>

                  <a
                    href={renderedResult.videoUrl}
                    download="youtube_shorts_fable.mp4"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition shrink-0"
                  >
                    <Download className="w-4 h-4" />
                    <span>Tải Video MP4 Về Máy</span>
                  </a>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                  <div className="max-w-[240px] w-full aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl border-2 border-emerald-500/40 bg-black">
                    <video
                      controls
                      autoPlay
                      loop
                      src={renderedResult.videoUrl}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300 max-w-sm">
                    <div className="font-bold text-slate-900 dark:text-white text-sm">
                      Thông Số Kỹ Thuật Video Xuất Ra:
                    </div>
                    <ul className="space-y-1.5 list-disc pl-4 text-slate-600 dark:text-slate-400">
                      <li><b>Độ phân giải:</b> 1080x1920 Chuẩn Full HD Dọc</li>
                      <li><b>Tốc độ khung hình:</b> 25 FPS mượt mà</li>
                      <li><b>Hiệu ứng:</b> Dynamic Pan & Zoom 1.35x từ đỉnh trang xuống chân trang</li>
                      <li><b>Dừng chân trang:</b> Giữ lại 3 giây cuối cho người xem suy ngẫm câu quote</li>
                      <li><b>Định dạng:</b> H.264 / MP4 tương thích 100% mọi nền tảng</li>
                    </ul>

                    {/* YOUTUBE 1-CLICK PUBLISH SECTION */}
                    <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
                          <Youtube className="w-4 h-4 text-red-500" />
                          <span>Xuất Bản Lên YouTube Shorts:</span>
                        </span>
                        {youtubeChannel ? (
                          <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{youtubeChannel.title}</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-amber-500 font-semibold">Chưa kết nối kênh</span>
                        )}
                      </div>

                      {youtubeChannel ? (
                        <div className="space-y-2">
                          <button
                            onClick={handleUploadToYoutube}
                            disabled={isUploadingYoutube}
                            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs transition shadow-md shadow-red-500/20 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                          >
                            {isUploadingYoutube ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Đang Tự Động Tải Lên YouTube Shorts...</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-4 h-4" />
                                <span>🚀 Đăng 1-Click Lên Kênh YouTube Shorts</span>
                              </>
                            )}
                          </button>

                          {youtubeUploadedVideo && (
                            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-center justify-between animate-fadeIn">
                              <span className="font-bold">Đã đăng thành công lên Shorts!</span>
                              <a
                                href={`https://www.youtube.com/shorts/${youtubeUploadedVideo.videoId}`}
                                target="_blank"
                                rel="noreferrer"
                                className="font-black underline hover:text-emerald-300 flex items-center gap-1"
                              >
                                <span>Xem Video Ngay</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={handleConnectYoutube}
                          className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                        >
                          <Youtube className="w-4 h-4 text-white" />
                          <span>Kết Nối Kênh YouTube (OAuth 2.0) Để Đăng</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* 4. TAB 2: CURATED FABLES LIBRARY */}
      {activeTab === 'library' && (
        <div className="space-y-4">
          <div className="text-xs text-slate-500">
            Tuyển tập các câu chuyện ngụ ngôn đã được kiểm chứng với tỷ lệ tương tác và cảm xúc cao nhất trên YouTube Shorts.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {CURATED_FABLES.map((fable) => (
              <div
                key={fable.id}
                className="app-card-raised p-5 space-y-4 border border-slate-200 dark:border-slate-800 hover:border-red-500/50 transition flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                      {fable.vietnameseTitle}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {fable.panels.length} Khung tranh
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    {fable.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                    {fable.summary}
                  </p>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-[11px] space-y-1">
                    <div className="font-semibold text-slate-700 dark:text-slate-300">
                      Nhạc đề xuất: <span className="text-red-500 font-bold">{fable.bgm}</span>
                    </div>
                    <div className="text-amber-600 dark:text-amber-400 font-mono text-[10px]">
                      Quote: "{fable.bottomPunchline}"
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
                  <button
                    onClick={() => {
                      setCurrentStory(fable);
                      setActiveTab('generator');
                    }}
                    className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <span>Xem Kịch Bản</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      setCurrentStory(fable);
                      setActiveTab('video-maker');
                    }}
                    className="py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition flex items-center justify-center gap-1 shadow-xs"
                    title="Dùng câu chuyện này để xuất video Shorts ngay"
                  >
                    <Film className="w-3.5 h-3.5" />
                    <span>Làm Video</span>
                  </button>

                  <button
                    onClick={() => handleCopy(fable.imagePrompt, `fable_prompt_${fable.id}`)}
                    title="Copy Prompt vẽ ảnh"
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition"
                  >
                    {copiedKey === `fable_prompt_${fable.id}` ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. TAB 3: MUSIC & SOUND DESIGN GUIDE (CORNFIELD CHASE & VIRAL PHILOSOPHY BGM) */}
      {activeTab === 'music-guide' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Header Banner */}
          <div className="app-card p-6 sm:p-7 bg-gradient-to-r from-purple-900/20 via-slate-900/40 to-blue-900/20 border border-purple-500/30 space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-purple-600 text-white shadow-md">
                <Music className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Gu Âm Nhạc BGM Viral: Tinh Thần "Cornfield Chase" & Triết Lý Cuộc Sống</span>
                </h3>
                <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold">
                  Cẩm nang chọn nhạc nền không lời đưa cảm xúc người xem chạm đỉnh cao trào
                </p>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-4xl">
              <b>Cornfield Chase</b> (của Hans Zimmer trong phim <i>Interstellar</i>) là lựa chọn kinh điển cho các video/story mang màu sắc chiêm nghiệm, triết lý, truyền cảm hứng mạnh mẽ và có chiều sâu (vibe vũ trụ, dòng thời gian và sự trưởng thành). Dưới đây là kho nhạc nền tuyển chọn chuẩn xác theo từng sắc thái "bài học" để bạn phối cho video của mình:
            </p>
          </div>

          {/* NHÓM 1: CHIÊM NGHIỆM, TRIẾT LÝ & CHIỀU SÂU */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                  1. Vibe Chiêm Nghiệm, Triết Lý & Chiều Sâu (Giống Cornfield Chase Nhất)
                </h4>
              </div>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/20">
                Cao Trào Cảm Xúc
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Bắt đầu nhẹ nhàng, lặp đi lặp lại rồi dâng trào cảm xúc vỡ òa, cực kỳ hợp để lồng tiếng (voice-over) hoặc chạy chữ cho những câu chuyện đắt giá.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {[
                {
                  title: "Cornfield Chase",
                  artist: "Hans Zimmer (OST Interstellar)",
                  tag: "Kinh Điển",
                  tagColor: "bg-amber-500/10 text-amber-500",
                  desc: "Tiếng đàn organ dồn dập huyền thoại, biểu tượng của thời gian trôi đi không thể lấy lại. Đẩy nhịp tim người xem lên đỉnh điểm ở những khung tranh cuối.",
                  searchKey: "Cornfield Chase Hans Zimmer slowed"
                },
                {
                  title: "Time",
                  artist: "Hans Zimmer (OST Inception)",
                  tag: "Huyền Thoại",
                  tagColor: "bg-red-500/10 text-red-500",
                  desc: "Mở đầu cực tĩnh lặng, sau đó đẩy cao trào dần dần từng nốt nhạc, tạo cảm giác vỡ òa nghẹn ngào ở đoạn kết khi nhân vật đốn ngộ chân lý.",
                  searchKey: "Time Hans Zimmer piano"
                },
                {
                  title: "Experience",
                  artist: "Ludovico Einaudi",
                  tag: "Bừng Sáng",
                  tagColor: "bg-blue-500/10 text-blue-500",
                  desc: "Giai điệu piano kết hợp violin dồn dập, mang lại cảm giác hành trình trưởng thành, vượt qua 1,000 lần thất bại để chạm đến thành công.",
                  searchKey: "Experience Ludovico Einaudi"
                },
                {
                  title: "Nuvole Bianche",
                  artist: "Ludovico Einaudi",
                  tag: "Chữa Lành",
                  tagColor: "bg-purple-500/10 text-purple-500",
                  desc: "Nhẹ nhàng, sâu lắng và hơi man mác buồn, hợp với những bài học về sự buông bỏ, tình người thầm lặng hoặc sự hy sinh vì thế hệ mai sau.",
                  searchKey: "Nuvole Bianche piano"
                },
                {
                  title: "Idea 10 / Idea 22",
                  artist: "Gibran Alcocer",
                  tag: "Top 1 Viral",
                  tagColor: "bg-emerald-500/10 text-emerald-500",
                  desc: "Hiện tượng số 1 trên TikTok/Shorts. Tiếng piano mộc mạc tối giản nhưng chạm thẳng vào đáy lòng, cực kỳ hợp với các câu quote ngắn gọn.",
                  searchKey: "Idea 10 Gibran Alcocer"
                },
                {
                  title: "On the Nature of Daylight",
                  artist: "Max Richter",
                  tag: "Tỉnh Thức",
                  tagColor: "bg-rose-500/10 text-rose-500",
                  desc: "Dàn dây da diết, trầm buồn và sâu thẳm, cực kỳ hợp với những câu chuyện về sự thức tỉnh sau những cú ngã đau đớn của cuộc đời.",
                  searchKey: "On the Nature of Daylight Max Richter"
                }
              ].map((song) => (
                <div
                  key={song.title}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-amber-500/40 transition flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-sm text-slate-900 dark:text-white">
                        {song.title}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${song.tagColor}`}>
                        {song.tag}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500">
                      Nghệ sĩ: <b>{song.artist}</b>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                      {song.desc}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-slate-400 font-mono truncate max-w-[170px]">
                      🔍 {song.searchKey}
                    </span>
                    <button
                      onClick={() => handleCopy(song.searchKey, `song_${song.title}`)}
                      className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-amber-500 hover:text-slate-950 font-bold text-[10px] transition flex items-center gap-1 shrink-0"
                    >
                      {copiedKey === `song_${song.title}` ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === `song_${song.title}` ? 'Đã copy' : 'Copy từ khóa'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* NHÓM 2: TỈNH THỨC, KỶ LUẬT & DARK MOTIVATION */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                  2. Vibe "Tỉnh Thức", Kỷ Luật & Bứt Phá (Dark Motivation / Stoicism)
                </h4>
              </div>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold border border-blue-500/20">
                Kỷ Luật Thép
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Dành cho video về phát triển bản thân, sự cô độc trên hành trình thành công, kiên trì trong bóng tối khi người khác nghi ngờ.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {[
                {
                  title: "Solitude",
                  artist: "Felsmann + Tiley Reinterpretation",
                  tag: "Tập Trung",
                  desc: "Tiếng bass trầm ấm và tiếng piano vang vọng từ xa, tạo cảm giác lạnh lùng, tỉnh táo và cô độc chiến đấu vì lý tưởng.",
                  searchKey: "Solitude Felsmann Tiley slowed"
                },
                {
                  title: "Snowfall",
                  artist: "Øneheart & reidenshi",
                  tag: "Ambient Night",
                  desc: "Giai điệu không gian trôi nổi, hơi u tối nhưng cực kỳ gây nghiện, rất hợp cho các câu thoại chiêm nghiệm vào ban đêm.",
                  searchKey: "Snowfall Oneheart reidenshi"
                },
                {
                  title: "Memory Reboot",
                  artist: "VØJ, Narvent (Slowed)",
                  tag: "Bứt Phá",
                  desc: "Hơi hướng synthwave hoài niệm nhưng đầy sức mạnh, hoàn hảo cho những thước phim nhân vật đứng dậy làm lại từ đầu.",
                  searchKey: "Memory Reboot slowed"
                },
                {
                  title: "Apathy",
                  artist: "Øneheart",
                  tag: "Tự Sự",
                  desc: "Ngắn gọn, sâu lắng, mang đúng chất tự sự một mình đối diện với giông bão cuộc đời.",
                  searchKey: "Apathy Oneheart"
                }
              ].map((song) => (
                <div
                  key={song.title}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-blue-500/40 transition flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-sm text-slate-900 dark:text-white">
                        {song.title}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500">
                        {song.tag}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 truncate">
                      <b>{song.artist}</b>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                      {song.desc}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <button
                      onClick={() => handleCopy(song.searchKey, `song_${song.title}`)}
                      className="w-full py-1 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-blue-600 hover:text-white font-bold text-[10px] transition flex items-center justify-center gap-1"
                    >
                      {copiedKey === `song_${song.title}` ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === `song_${song.title}` ? 'Đã copy từ khóa' : 'Copy từ khóa tìm nhạc'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* NHÓM 3: NHẸ NHÀNG, TÍCH CỰC & BÌNH YÊN (CHỮA LÀNH) */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                  3. Vibe Nhẹ Nhàng, Tích Cực & Bình Yên (Chữa Lành & Đời Thường)
                </h4>
              </div>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                Ấm Áp & Biết Ơn
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Dành cho bài học về lòng tốt vị tha, tình cảm gia đình, sự trân trọng những điều giản dị trong cuộc sống thường nhật.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {[
                {
                  title: "Married Life",
                  artist: "Michael Giacchino (OST Up)",
                  tag: "Đồng Cảm",
                  desc: "Rất dễ tạo sự rung động về dòng thời gian, sự gắn bó và tình người ấm áp.",
                  searchKey: "Married Life Up piano slowed"
                },
                {
                  title: "Mia & Sebastian’s Theme",
                  artist: "Justin Hurwitz (OST La La Land)",
                  tag: "Mộng Mơ",
                  desc: "Lãng mạn nhưng cũng đầy thực tế về sự đánh đổi giữa ước mơ và hiện thực.",
                  searchKey: "Mia and Sebastian theme piano"
                },
                {
                  title: "Comptine d'un autre été",
                  artist: "Yann Tiersen (OST Amélie)",
                  tag: "Cổ Điển",
                  desc: "Tiếng đàn piano Pháp tinh tế, mang lại cảm giác thông tuệ, thanh thản và nhẹ nhõm.",
                  searchKey: "Comptine dun autre ete Yann Tiersen"
                },
                {
                  title: "QKThr",
                  artist: "Aphex Twin",
                  tag: "Hoài Niệm",
                  desc: "Chỉ khoảng 1.5 phút, tiếng đàn mượt mà, cực kỳ hợp làm video ngắn chiêm nghiệm 30-45 giây.",
                  searchKey: "QKThr Aphex Twin slowed"
                }
              ].map((song) => (
                <div
                  key={song.title}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 transition flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-sm text-slate-900 dark:text-white">
                        {song.title}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">
                        {song.tag}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 truncate">
                      <b>{song.artist}</b>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                      {song.desc}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <button
                      onClick={() => handleCopy(song.searchKey, `song_${song.title}`)}
                      className="w-full py-1 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-emerald-600 hover:text-white font-bold text-[10px] transition flex items-center justify-center gap-1"
                    >
                      {copiedKey === `song_${song.title}` ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === `song_${song.title}` ? 'Đã copy từ khóa' : 'Copy từ khóa tìm nhạc'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* MẸO TÌM KIẾM & PHỐI NHẠC TRIỆU VIEW */}
          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 border border-amber-500/30 space-y-3">
            <div className="font-black text-amber-600 dark:text-amber-400 text-sm sm:text-base flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              <span>Bí Quyết Vàng Khi Tìm & Phối Nhạc BGM Trên TikTok / Reels / CapCut:</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700 dark:text-slate-300">
              <div className="p-3.5 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-amber-500/20 space-y-1.5">
                <span className="font-bold text-slate-900 dark:text-white block">
                  🔍 Mẹo tìm kiếm phiên bản "êm ái" nhất:
                </span>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  Khi gõ tên bài hát trong thư viện nhạc của TikTok/Instagram/CapCut, hãy thêm các từ khóa: <b>"slowed"</b>, <b>"reverb"</b> hoặc <b>"piano cover"</b> (Ví dụ: <i>Cornfield Chase slowed</i>, <i>Time Hans Zimmer piano</i>). Các bản phối này có tiết tấu chậm rãi hơn, không bị gắt, giúp tôn vinh giọng đọc lồng tiếng mà không bị lấn át.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-amber-500/20 space-y-1.5">
                <span className="font-bold text-slate-900 dark:text-white block">
                  🎚️ Quy tắc vàng về tỷ lệ âm lượng (Volume Ducking):
                </span>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  Giữ âm lượng giọng đọc ở mức <b>100%</b>, và chỉnh âm lượng nhạc nền ở mức <b>15% - 20%</b>. Ở 3 giây cuối cùng (khi câu danh ngôn xuất hiện), tự động hạ dần âm thanh (Fade-out) để để lại khoảng lặng suy ngẫm trong tâm trí người xem.
                </p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* 6. TAB 5: YOUTUBE CHANNEL & VIEWER ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {youtubeChannel ? (
            <div className="space-y-6">
              {/* CHANNEL PROFILE BANNER */}
              <div className="app-card-raised p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-r from-red-500/10 via-rose-500/5 to-transparent flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
                <div className="flex items-center gap-4">
                  {youtubeChannel.thumbnails?.default?.url ? (
                    <img
                      src={youtubeChannel.thumbnails.default.url}
                      alt={youtubeChannel.title}
                      className="w-16 h-16 rounded-full border-2 border-red-500 shadow-md object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-red-600 text-white flex items-center justify-center font-black text-2xl shadow-md">
                      <Youtube className="w-8 h-8" />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-black text-slate-900 dark:text-white">
                        {youtubeChannel.title}
                      </h2>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Đã kết nối OAuth 2.0</span>
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                      {youtubeChannel.customUrl || youtubeChannel.id} • {youtubeChannel.description || 'Kênh sáng tạo nội dung tự động với SocialHub'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={fetchYoutubeChannel}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Làm mới số liệu</span>
                  </button>
                  <a
                    href="https://studio.youtube.com"
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                  >
                    <span>Mở YouTube Studio</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* STATS OVERVIEW CARDS */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="app-card-raised p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[11px] font-bold">Người Đăng Ký</span>
                    <Users className="w-4 h-4 text-red-500" />
                  </div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    {Number(youtubeChannel.statistics?.subscriberCount || 0).toLocaleString('vi-VN')}
                  </div>
                  <div className="text-[10px] text-emerald-500 font-medium">Subscribers kênh</div>
                </div>

                <div className="app-card-raised p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[11px] font-bold">Tổng Lượt Xem</span>
                    <Eye className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    {Number(youtubeChannel.statistics?.viewCount || 0).toLocaleString('vi-VN')}
                  </div>
                  <div className="text-[10px] text-blue-500 font-medium">Lượt xem toàn kênh</div>
                </div>

                <div className="app-card-raised p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[11px] font-bold">Số Video Đã Đăng</span>
                    <Video className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    {Number(youtubeChannel.statistics?.videoCount || 0).toLocaleString('vi-VN')}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">Videos công khai</div>
                </div>

                <div className="app-card-raised p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[11px] font-bold">Hạn Mức Google API</span>
                    <Sparkles className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    10,000 / ngày
                  </div>
                  <div className="text-[10px] text-amber-500 font-medium">~6 Video Shorts tự động / ngày</div>
                </div>
              </div>

              {/* RECENT SHORTS LIST */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Film className="w-4 h-4 text-red-500" />
                    <span>Video Gần Nhất Trên Kênh</span>
                  </h3>
                  <span className="text-xs text-slate-400">
                    {recentShorts?.length || 0} video được tải về
                  </span>
                </div>

                {recentShorts && recentShorts.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {recentShorts.map((vid) => {
                      const videoId = vid.id?.videoId || vid.id;
                      const snippet = vid.snippet || {};
                      const thumb = snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || snippet.thumbnails?.default?.url;
                      return (
                        <div
                          key={videoId}
                          className="app-card-raised p-3 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 hover:border-red-500/40 transition flex flex-col justify-between"
                        >
                          <div className="space-y-2">
                            <div className="relative aspect-video rounded-xl overflow-hidden bg-black">
                              {thumb && (
                                <img
                                  src={thumb}
                                  alt={snippet.title}
                                  className="w-full h-full object-cover"
                                />
                              )}
                              <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded-md bg-black/80 text-[10px] text-white font-bold flex items-center gap-1">
                                <Youtube className="w-3 h-3 text-red-500" />
                                <span>Shorts</span>
                              </span>
                            </div>

                            <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2" title={snippet.title}>
                              {snippet.title}
                            </h4>

                            <p className="text-[10px] text-slate-400">
                              Đăng lúc: {snippet.publishedAt ? new Date(snippet.publishedAt).toLocaleDateString('vi-VN') : 'Mới đây'}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                            <a
                              href={`https://www.youtube.com/shorts/${videoId}`}
                              target="_blank"
                              rel="noreferrer"
                              className="flex-1 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-[11px] transition flex items-center justify-center gap-1"
                            >
                              <span>Xem trên Shorts</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                            <button
                              onClick={() => handleCopy(`https://www.youtube.com/shorts/${videoId}`, `yt_${videoId}`)}
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs transition cursor-pointer"
                              title="Copy liên kết Shorts"
                            >
                              {copiedKey === `yt_${videoId}` ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-center space-y-3">
                    <Film className="w-10 h-10 text-slate-400 mx-auto" />
                    <div className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      Chưa có video Shorts nào được xuất bản từ SocialHub
                    </div>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      Hãy sang tab <b>"Tạo Video Shorts (FFmpeg)"</b>, tải ảnh truyện tranh hoặc chọn mẫu có sẵn, sau đó bấm nút <b>"🚀 Đăng 1-Click Lên Kênh YouTube Shorts"</b>.
                    </p>
                    <button
                      onClick={() => setActiveTab('video-maker')}
                      className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition cursor-pointer"
                    >
                      Sang Tab Tạo Video Shorts Ngay
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* EMPTY STATE: NOT CONNECTED */
            <div className="max-w-xl mx-auto p-8 rounded-3xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-center space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-red-600/10 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto border border-red-500/20 shadow-md">
                <Youtube className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                  Kết Nối Kênh YouTube Của Bạn
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                  Liên kết kênh YouTube bằng tài khoản Google Cloud của bạn để tự động xuất bản video Shorts Full HD dọc 1-Click và theo dõi dữ liệu người xem, lượt đăng ký trực tiếp trên SocialHub.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-left space-y-2 text-xs">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Quyền lợi khi kết nối:</span>
                </div>
                <ul className="space-y-1.5 list-disc pl-5 text-slate-600 dark:text-slate-400 text-[11px]">
                  <li>Đăng video ngắn 1-click tự động kèm hashtag #Shorts và mô tả chuẩn SEO.</li>
                  <li>Xem trực tiếp số lượng người đăng ký (Subscribers) và tổng lượt xem.</li>
                  <li>10,000 units quota/ngày miễn phí từ Google, không tốn chi phí duy trì.</li>
                </ul>
              </div>

              <button
                onClick={handleConnectYoutube}
                className="w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-sm transition shadow-lg shadow-red-500/25 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Youtube className="w-5 h-5" />
                <span>Đăng Nhập & Kết Nối Kênh YouTube Ngay</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
