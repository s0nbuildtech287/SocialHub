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

export function renderComicToShortsVideo({ imagePath, audioPath = null, duration = 35, mode = 'panels' }) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(imagePath)) {
      return reject(new Error('Không tìm thấy tệp ảnh đầu vào.'));
    }

    const outputName = `shorts_${Date.now()}.mp4`;
    const outputPath = path.join(uploadsDir, outputName);

    // Call Python video_engine:
    // python video_engine.py <mode> <imagePath> <audioPath|none> <outputPath> <ffmpegPath> <duration>
    const pyArgs = [
      pythonScript,
      mode || 'panels',
      imagePath,
      audioPath && fs.existsSync(audioPath) ? audioPath : 'none',
      outputPath,
      ffmpegPath,
      String(duration)
    ];

    const pyProc = spawn('python', pyArgs, {
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
          duration,
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
      reject(new Error('Không thể khởi chạy engine render Python: ' + err.message));
    });
  });
}
