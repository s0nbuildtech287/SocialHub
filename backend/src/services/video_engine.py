import os
import sys
import json
import asyncio
import re
import cv2
import numpy as np
import subprocess
import shutil

try:
    import edge_tts
except ImportError:
    edge_tts = None

def detect_panels(img):
    h, w, _ = img.shape
    total_area = w * h

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 40, 120)
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
    dilated = cv2.dilate(edges, kernel, iterations=1)
    contours, _ = cv2.findContours(dilated, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)

    raw_boxes = []
    for c in contours:
        x, y, bw, bh = cv2.boundingRect(c)
        area = bw * bh
        if area >= total_area * 0.018 and bw >= w * 0.15 and bh >= h * 0.07:
            if bw < w * 0.98 and bh < h * 0.75:
                raw_boxes.append((x, y, bw, bh))

    def is_inside(inner, outer):
        ix1, iy1, iw, ih = inner
        ox1, oy1, ow, oh = outer
        x1 = max(ix1, ox1)
        y1 = max(iy1, oy1)
        x2 = min(ix1 + iw, ox1 + ow)
        y2 = min(iy1 + ih, oy1 + oh)
        if x2 <= x1 or y2 <= y1:
            return False
        inter = (x2 - x1) * (y2 - y1)
        return (inter / (iw * ih)) > 0.55

    def iou(b1, b2):
        x1 = max(b1[0], b2[0])
        y1 = max(b1[1], b2[1])
        x2 = min(b1[0]+b1[2], b2[0]+b2[2])
        y2 = min(b1[1]+b1[3], b2[1]+b2[3])
        if x2 <= x1 or y2 <= y1:
            return 0
        inter = (x2 - x1) * (y2 - y1)
        union = b1[2]*b1[3] + b2[2]*b2[3] - inter
        return inter / union

    raw_boxes = sorted(raw_boxes, key=lambda b: b[2] * b[3], reverse=True)

    filtered = []
    for b in raw_boxes:
        if any(is_inside(b, p) for p in filtered):
            continue
        if any(iou(b, p) > 0.35 for p in filtered):
            continue
        filtered.append(b)

    if len(filtered) < 2:
        return []

    row_h = max(h * 0.10, 45)
    filtered = sorted(filtered, key=lambda b: (round(b[1] / row_h), b[0]))
    return filtered

def get_audio_duration(file_path, ffmpeg_exe):
    cmd = [ffmpeg_exe, '-i', file_path]
    res = subprocess.run(cmd, stderr=subprocess.PIPE, stdout=subprocess.PIPE, text=True)
    for line in res.stderr.splitlines():
        if 'Duration:' in line:
            parts = line.split('Duration:')[1].split(',')[0].strip().split(':')
            return float(parts[0])*3600 + float(parts[1])*60 + float(parts[2])
    return 3.0

async def generate_tts_clip(text, voice, out_path, rate='-2%'):
    for attempt in range(3):
        try:
            comm = edge_tts.Communicate(text, voice, rate=rate)
            await comm.save(out_path)
            if os.path.exists(out_path) and os.path.getsize(out_path) > 300:
                return True
        except Exception as e:
            if attempt < 2:
                await asyncio.sleep(0.4)
            else:
                print(f"Warning: TTS failed for '{text[:25]}' ({voice}): {e}", file=sys.stderr)
    return False

def render_sync_video(config):
    image_path = config['imagePath']
    output_path = config['outputPath']
    ffmpeg_exe = config.get('ffmpegPath', 'ffmpeg')
    duration = int(config.get('duration', 35))
    mode = config.get('mode', 'panels')
    audio_mode = config.get('audioMode', 'silent') # 'ai_voice' | 'custom_audio' | 'silent'
    bgm_preset = config.get('bgmPreset', 'none') # 'nostalgic_piano', 'emotional_crescendo', 'warm_acoustic', 'deep_reflection', 'none'
    bgm_volume = float(config.get('bgmVolume', 0.20))
    custom_bgm_path = config.get('customBgmPath', None)
    custom_audio_path = config.get('customAudioPath', None)

    voice_cast = config.get('voiceCast', {
        'charA': 'en-US-GuyNeural',
        'charB': 'en-US-AriaNeural',
        'narrator': 'en-US-ChristopherNeural'
    })
    panel_dialogues = config.get('panelDialogues', [])

    include_intro = config.get('includeIntro', True)
    if isinstance(include_intro, str):
        include_intro = include_intro.lower() not in ('false', '0', 'no')
    intro_duration = float(config.get('introDuration', 1.8))
    intro_sec = float(intro_duration) if (include_intro and intro_duration > 0) else 0.0

    img = cv2.imread(image_path)
    if img is None:
        raise ValueError(f"Khong the doc file anh: {image_path}")

    h, w, _ = img.shape
    TW, TH = 1080, 1920
    fps = 25

    panels = detect_panels(img)
    if len(panels) < 2:
        rows, cols = 4, 2
        rh = int(h * 0.80 / rows)
        rw = int(w / cols)
        panels = [(c * rw, int(h * 0.08) + r * rh, rw, rh) for r in range(rows) for c in range(cols)]

    max_panel_bottom = max(p[1] + p[3] for p in panels)
    quote_y = max(max_panel_bottom, int(h * 0.89))
    quote_h = max(int(h * 0.08), h - quote_y)
    footer_box = (int(w * 0.03), quote_y, int(w * 0.94), quote_h)

    # all_scenes chỉ gồm các ô tranh + ô quote kết bài (không chèn cảnh chờ 2.2s để video xem được ngay)
    all_scenes = panels + [footer_box]
    total_scenes = len(all_scenes)

    # Chuẩn bị ảnh bìa toàn cảnh (Cover Thumbnail) từ ảnh tranh gốc
    cover_max_w, cover_max_h = 1000, 1550
    cover_scale = min(cover_max_w / w, cover_max_h / h)
    cover_bw, cover_bh = int(w * cover_scale), int(h * cover_scale)
    cover_resized = cv2.resize(img, (cover_bw, cover_bh), interpolation=cv2.INTER_LANCZOS4)
    cover_bg = cv2.resize(img, (TW, TH), interpolation=cv2.INTER_LINEAR)
    cover_bg = cv2.GaussianBlur(cover_bg, (81, 81), 0)
    cover_bg = (cover_bg * 0.35).astype(np.uint8)

    cover_bordered = cv2.copyMakeBorder(cover_resized, 6, 6, 6, 6, cv2.BORDER_CONSTANT, value=[255, 255, 255])
    cbh, cbw, _ = cover_bordered.shape
    cover_canvas = cover_bg.copy()
    cpos_x, cpos_y = (TW - cbw) // 2, (TH - cbh) // 2
    cdst_y1 = max(0, cpos_y)
    cdst_x1 = max(0, cpos_x)
    cdst_y2 = min(TH, cpos_y + cbh)
    cdst_x2 = min(TW, cpos_x + cbw)
    cover_canvas[cdst_y1:cdst_y2, cdst_x1:cdst_x2] = cover_bordered[0:cdst_y2-cdst_y1, 0:cdst_x2-cdst_x1]

    # Lưu file thumbnail ảnh bìa độc lập để YouTube API set thumbnail hoặc người dùng tải về
    thumb_path = os.path.splitext(output_path)[0] + "_thumb.jpg"
    try:
        cv2.imwrite(thumb_path, cover_canvas, [int(cv2.IMWRITE_JPEG_QUALITY), 95])
    except Exception as te:
        print(f"Warning: could not save thumb_path: {te}", file=sys.stderr)

    temp_dir = os.path.join(os.path.dirname(output_path), f"temp_sync_{int(np.random.randint(100000, 999999))}")
    os.makedirs(temp_dir, exist_ok=True)

    final_audio_track = None

    try:
        # 1. PROCESS AUDIO
        if audio_mode == 'ai_voice' and edge_tts is not None:
            # If panel_dialogues is empty or smaller than scenes, auto-fallback to meaningful dialogue
            if not panel_dialogues or len(panel_dialogues) == 0:
                is_vi = any('vi-VN' in str(v) for v in voice_cast.values())
                if is_vi:
                    default_texts = [
                        ("charA", "Này bạn, bạn đang vội vã đi tìm điều gì thế?"),
                        ("charB", "Tôi tìm thành công, tôi sợ mình sẽ bỏ lỡ cơ hội."),
                        ("charA", "Cây sồi trăm năm cần thời gian bén rễ sâu trong lòng đất."),
                        ("charB", "Nhưng ngoài kia ai cũng đang chạy rất nhanh."),
                        ("charA", "Chạy nhanh mà lạc hướng thì đích đến chỉ là sự mệt mỏi."),
                        ("charB", ""),
                        ("charA", "Năm tháng đi qua sẽ chứng minh giá trị của sự kiên định."),
                        ("charB", "Tôi bắt đầu hiểu ra bài học của sự tĩnh lặng."),
                        ("charA", "Mỗi ngày tích lũy một chút chính là con đường vững chắc nhất."),
                        ("charB", "Cảm ơn bạn, tôi sẽ kiên nhẫn bước tiếp con đường của mình."),
                        ("narrator", "Bình an trong tâm chính là khởi đầu của mọi kỳ tích.")
                    ]
                else:
                    default_texts = [
                        ("charA", "Where are you rushing in such a hurry, young friend?"),
                        ("charB", "I am looking for quick success before time runs out."),
                        ("charA", "A great oak takes decades to quietly root deep into the earth."),
                        ("charB", "But everyone around me seems to be moving so fast."),
                        ("charA", "Moving fast in the wrong direction only leads to exhaustion."),
                        ("charB", ""),
                        ("charA", "Quiet persistence always outlasts fleeting hype."),
                        ("charB", "I think I finally understand the true value of patience."),
                        ("charA", "Small steady steps each day build an unshakable future."),
                        ("charB", "Thank you, I will walk with peace and determination."),
                        ("narrator", "True strength begins with stillness of the mind.")
                    ]
                dialogues_to_use = [
                    {"speaker": default_texts[i % len(default_texts)][0], "text": default_texts[i % len(default_texts)][1]}
                    for i in range(total_scenes)
                ]
            else:
                dialogues_to_use = panel_dialogues

            # Generate per-scene TTS audio (khớp 1-1 với từng ô truyện và quote)
            scene_durations = []
            audio_files = []

            # Nếu bật mở đầu toàn cảnh: Chèn khoảng đệm im lặng tương ứng để phát nhạc nền và hiện ảnh bìa
            if intro_sec > 0:
                intro_clip = os.path.join(temp_dir, 'scene_intro_silence.mp3')
                cmd_intro = [ffmpeg_exe, '-y', '-f', 'lavfi', '-i', 'anullsrc=r=24000:cl=mono', '-t', str(intro_sec), '-c:a', 'libmp3lame', intro_clip]
                subprocess.run(cmd_intro, check=True, stderr=subprocess.DEVNULL)
                audio_files.append(intro_clip)

            for s_idx in range(total_scenes):
                clip_p = os.path.join(temp_dir, f'scene_{s_idx:02d}.mp3')
                dia = dialogues_to_use[s_idx] if s_idx < len(dialogues_to_use) else {}
                text = dia.get('text', '').strip()
                speaker = dia.get('speaker', 'narrator')
                voice = voice_cast.get(speaker, voice_cast.get('narrator', 'en-US-ChristopherNeural'))

                # Clean text: remove stage directions, translations, or parenthetical commentary
                text = re.sub(r'\(.*?\)', '', text)
                text = re.sub(r'\[.*?\]', '', text)
                text = text.replace('"', '').replace("'", '').replace('“', '').replace('”', '').strip()

                if not text:
                    # Pure silence for reflective moment without AI speaking strange placeholder words
                    cmd_silence = [ffmpeg_exe, '-y', '-f', 'lavfi', '-i', 'anullsrc=r=24000:cl=mono', '-t', '2.2', '-c:a', 'libmp3lame', clip_p]
                    subprocess.run(cmd_silence, check=True, stderr=subprocess.DEVNULL)
                else:
                    # If Character A and B share the same voice (e.g. 2 males), slightly shift speed/rate so they sound like 2 distinct people
                    rate = '-2%'
                    if speaker == 'charB' and voice_cast.get('charA') == voice_cast.get('charB'):
                        rate = '+6%'
                    ok = asyncio.run(generate_tts_clip(text, voice, clip_p, rate=rate))
                    if not ok or not os.path.exists(clip_p) or os.path.getsize(clip_p) < 100:
                        cmd_silence = [ffmpeg_exe, '-y', '-f', 'lavfi', '-i', 'anullsrc=r=24000:cl=mono', '-t', '2.5', '-c:a', 'libmp3lame', clip_p]
                        subprocess.run(cmd_silence, check=True, stderr=subprocess.DEVNULL)

                dur_clip = get_audio_duration(clip_p, ffmpeg_exe)
                scene_durations.append(dur_clip)
                audio_files.append(clip_p)

            # Concat audio clips
            list_file = os.path.join(temp_dir, 'voice_list.txt')
            with open(list_file, 'w', encoding='utf-8') as f:
                for af in audio_files:
                    f.write(f"file '{os.path.basename(af)}'\n")

            voice_combined = os.path.join(temp_dir, 'voice_combined.mp3')
            cmd_c = [ffmpeg_exe, '-y', '-f', 'concat', '-safe', '0', '-i', 'voice_list.txt', '-c', 'copy', voice_combined]
            subprocess.run(cmd_c, cwd=temp_dir, check=True, stderr=subprocess.DEVNULL)
            final_audio_track = voice_combined

        elif audio_mode == 'custom_audio' and custom_audio_path and os.path.exists(custom_audio_path):
            final_audio_track = custom_audio_path
            scene_sec = max(2.2, duration / total_scenes)
            scene_durations = [scene_sec] * total_scenes
        else:
            scene_sec = max(2.2, duration / total_scenes)
            scene_durations = [scene_sec] * total_scenes

        # 2. RESOLVE BGM (Background Music)
        bgm_file = None
        if custom_bgm_path and os.path.exists(custom_bgm_path):
            bgm_file = custom_bgm_path
        elif bgm_preset and bgm_preset != 'none':
            assets_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../assets/bgm'))
            candidate = os.path.join(assets_dir, f"{bgm_preset}.mp3")
            if os.path.exists(candidate):
                bgm_file = candidate

        # Mix voice and BGM if both exist
        mixed_audio = None
        total_audio_duration = intro_sec + sum(scene_durations)

        if final_audio_track and bgm_file:
            mixed_audio = os.path.join(temp_dir, 'mixed_voice_bgm.aac')
            cmd_mix = [
                ffmpeg_exe, '-y',
                '-i', final_audio_track,
                '-stream_loop', '-1', '-i', bgm_file,
                '-filter_complex', f'[0:a]volume=1.0[v];[1:a]volume={bgm_volume},afade=t=out:st={max(1, total_audio_duration-3)}:d=3[m];[v][m]amix=inputs=2:duration=first[outa]',
                '-map', '[outa]',
                '-c:a', 'aac',
                '-b:a', '192k',
                mixed_audio
            ]
            subprocess.run(cmd_mix, check=True, stderr=subprocess.DEVNULL)
            final_audio_track = mixed_audio

        elif not final_audio_track and bgm_file:
            # Only BGM music (no voice)
            final_audio_track = bgm_file

        # 3. RENDER VIDEO FRAMES
        cmd = [
            ffmpeg_exe, '-y',
            '-f', 'rawvideo',
            '-vcodec', 'rawvideo',
            '-s', f'{TW}x{TH}',
            '-pix_fmt', 'bgr24',
            '-r', str(fps),
            '-i', '-'
        ]

        if final_audio_track and os.path.exists(final_audio_track):
            cmd.extend([
                '-i', final_audio_track,
                '-c:v', 'libx264',
                '-preset', 'veryfast',
                '-pix_fmt', 'yuv420p',
                '-c:a', 'aac',
                '-b:a', '192k',
                '-shortest',
                output_path
            ])
        else:
            cmd.extend([
                '-c:v', 'libx264',
                '-preset', 'veryfast',
                '-pix_fmt', 'yuv420p',
                output_path
            ])

        proc = subprocess.Popen(cmd, stdin=subprocess.PIPE, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

        # Ghi các frame ảnh bìa toàn cảnh vào phần mở đầu video (1.8s) để YouTube Shorts bắt làm ảnh đại diện trên Shorts Feed & Tab Shorts
        intro_frames_count = int(intro_sec * fps) if intro_sec > 0 else 2
        for f in range(intro_frames_count):
            proc.stdin.write(cover_canvas.tobytes())

        for s_idx, (bx, by, bw, bh) in enumerate(all_scenes):
            pad_x, pad_y = 3, 3
            y1, y2 = max(0, by - pad_y), min(h, by + bh + pad_y)
            x1, x2 = max(0, bx - pad_x), min(w, bx + bw + pad_x)
            crop = img[y1:y2, x1:x2]
            ch, cw, _ = crop.shape

            max_w, max_h = 1000, 1550
            scale = min(max_w / cw, max_h / ch)
            base_w, base_h = int(cw * scale), int(ch * scale)
            base_resized = cv2.resize(crop, (base_w, base_h), interpolation=cv2.INTER_LANCZOS4)

            panel_bg = cv2.resize(crop, (TW, TH), interpolation=cv2.INTER_LINEAR)
            panel_bg = cv2.GaussianBlur(panel_bg, (81, 81), 0)
            panel_bg = (panel_bg * 0.40).astype(np.uint8)

            dur = scene_durations[s_idx]
            frames_count = int(dur * fps)

            for f in range(frames_count):
                progress = f / max(1, frames_count - 1)
                z = 1.0 + 0.05 * progress
                cur_w, cur_h = int(base_w * z), int(base_h * z)
                zoomed = cv2.resize(base_resized, (cur_w, cur_h), interpolation=cv2.INTER_LINEAR)
                bordered = cv2.copyMakeBorder(zoomed, 6, 6, 6, 6, cv2.BORDER_CONSTANT, value=[255, 255, 255])
                bh_f, bw_f, _ = bordered.shape

                canvas = panel_bg.copy()
                pos_x, pos_y = (TW - bw_f) // 2, (TH - bh_f) // 2

                src_y1 = max(0, -pos_y)
                src_x1 = max(0, -pos_x)
                dst_y1 = max(0, pos_y)
                dst_x1 = max(0, pos_x)
                dst_y2 = min(TH, pos_y + bh_f)
                dst_x2 = min(TW, pos_x + bw_f)
                src_y2 = src_y1 + (dst_y2 - dst_y1)
                src_x2 = src_x1 + (dst_x2 - dst_x1)

                if dst_y2 > dst_y1 and dst_x2 > dst_x1:
                    canvas[dst_y1:dst_y2, dst_x1:dst_x2] = bordered[src_y1:src_y2, src_x1:src_x2]

                proc.stdin.write(canvas.tobytes())

        proc.stdin.close()
        proc.wait()

    finally:
        if os.path.exists(temp_dir):
            shutil.rmtree(temp_dir, ignore_errors=True)

    return {
        "success": True,
        "outputPath": output_path,
        "thumbnailPath": thumb_path if os.path.exists(thumb_path) else None,
        "panelsCount": len(panels),
        "totalDuration": intro_sec + sum(scene_durations)
    }

if __name__ == '__main__':
    # Accept JSON config file if passed: python video_engine.py --config config.json
    if len(sys.argv) == 3 and sys.argv[1] == '--config':
        with open(sys.argv[2], 'r', encoding='utf-8') as f:
            cfg = json.load(f)
        try:
            res = render_sync_video(cfg)
            print(json.dumps(res))
        except Exception as e:
            print(json.dumps({"error": str(e)}))
            sys.exit(1)
        sys.exit(0)

    # Legacy CLI interface:
    mode = sys.argv[1] if len(sys.argv) > 1 else 'panels'
    image_path = sys.argv[2] if len(sys.argv) > 2 else ''
    audio_path = sys.argv[3] if len(sys.argv) > 3 and sys.argv[3] != 'none' else None
    output_path = sys.argv[4] if len(sys.argv) > 4 else ''
    ffmpeg_exe = sys.argv[5] if len(sys.argv) > 5 else 'ffmpeg'
    duration = int(sys.argv[6]) if len(sys.argv) > 6 else 35

    cfg = {
        'mode': mode,
        'imagePath': image_path,
        'outputPath': output_path,
        'ffmpegPath': ffmpeg_exe,
        'duration': duration,
        'audioMode': 'custom_audio' if audio_path else 'silent',
        'customAudioPath': audio_path
    }

    try:
        res = render_sync_video(cfg)
        print(json.dumps(res))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
