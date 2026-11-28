import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ffmpegBinary = path.join(__dirname, '../../bin/ffmpeg.exe');
const ffmpegPath = fs.existsSync(ffmpegBinary) ? ffmpegBinary : 'ffmpeg';
const uploadsDir = path.join(__dirname, '../../uploads');
const pythonScript = path.join(__dirname, 'video_engine.py');

export function renderComicToShortsVideo(options = {}) {
  return new Promise((resolve, reject) => {
    const {
      imagePath,
      audioPath = null,
      duration = 35,
      mode = 'panels',
      includeIntro = true,
      introDuration = 2.2,
      audioMode = 'silent', // 'silent' | 'ai_voice' | 'custom_audio'
      bgmPreset = 'none', // 'nostalgic_piano' | 'emotional_crescendo' | 'warm_acoustic' | 'deep_reflection' | 'none'
      bgmVolume = 0.20,
      customBgmPath = null,
      voiceCast = null,
      panelDialogues = []
    } = options;

    if (!fs.existsSync(imagePath)) {
      return reject(new Error('Không tìm thấy tệp ảnh đầu vào.'));
    }

    const outputName = `shorts_${Date.now()}.mp4`;
    const outputPath = path.join(uploadsDir, outputName);

    const config = {
      mode: mode || 'panels',
      imagePath,
      outputPath,
      ffmpegPath,
      duration: parseInt(duration, 10) || 35,
      includeIntro: includeIntro !== false && includeIntro !== 'false',
      introDuration: parseFloat(introDuration) || 2.2,
      audioMode: audioMode || (audioPath ? 'custom_audio' : 'silent'),
      customAudioPath: audioPath && fs.existsSync(audioPath) ? audioPath : null,
      bgmPreset: bgmPreset || 'none',
      bgmVolume: parseFloat(bgmVolume) || 0.20,
      customBgmPath: customBgmPath && fs.existsSync(customBgmPath) ? customBgmPath : null,
      voiceCast: voiceCast || {
        charA: 'en-US-GuyNeural',
        charB: 'en-US-AriaNeural',
        narrator: 'en-US-ChristopherNeural'
      },
      panelDialogues: Array.isArray(panelDialogues) ? panelDialogues : []
    };

    const configPath = path.join(uploadsDir, `config_${Date.now()}_${Math.random().toString(36).substring(7)}.json`);
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');

    const pyProc = spawn('python', [pythonScript, '--config', configPath], {
      windowsHide: true
    });

    let stdoutData = '';
    let stderrData = '';

    pyProc.stdout.on('data', (chunk) => {
      stdoutData += chunk.toString();
    });

    pyProc.stderr.on('data', (chunk) => {
      stderrData += chunk.toString();
    });

    pyProc.on('close', (code) => {
      if (fs.existsSync(configPath)) {
        try { fs.unlinkSync(configPath); } catch {}
      }

      if (code !== 0 || !fs.existsSync(outputPath)) {
        console.error('Lỗi Python video_engine:', stderrData || stdoutData);
        return reject(new Error(stderrData || stdoutData || 'Lỗi render video từ engine'));
      }

      try {
        const result = JSON.parse(stdoutData.trim().split('\n').pop() || '{}');
        resolve({
          success: true,
          filename: outputName,
          videoUrl: `/uploads/${outputName}`,
          duration: result.totalDuration || duration,
          size: fs.statSync(outputPath).size,
          mode,
          panelsCount: result.panelsCount || null
        });
      } catch {
        resolve({
          success: true,
          filename: outputName,
          videoUrl: `/uploads/${outputName}`,
          duration,
          size: fs.statSync(outputPath).size,
          mode
        });
      }
    });

    pyProc.on('error', (err) => {
      if (fs.existsSync(configPath)) {
        try { fs.unlinkSync(configPath); } catch {}
      }
      reject(new Error('Không thể khởi chạy engine render Python: ' + err.message));
    });
  });
}
