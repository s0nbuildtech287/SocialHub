import os
import sys
import json
import cv2
import numpy as np
import subprocess
import shutil

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
        # Minimum panel area: at least 1.8% of page area (prevents stray icons / characters)
        # Minimum dimensions: at least 15% width and 7% height
        if area >= total_area * 0.018 and bw >= w * 0.15 and bh >= h * 0.07:
            # Exclude full page container
            if bw < w * 0.98 and bh < h * 0.75:
                raw_boxes.append((x, y, bw, bh))

    # Helper: Check if inner box is inside an outer box (eliminates faces/objects inside panels)
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
        # If > 55% of inner box is inside outer box, it's an inner detail!
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

    # Sort largest panels first to catch full panel frames before internal items
    raw_boxes = sorted(raw_boxes, key=lambda b: b[2] * b[3], reverse=True)

    filtered = []
    for b in raw_boxes:
        # If b is inside any already selected panel, discard it!
        if any(is_inside(b, p) for p in filtered):
            continue
        # If b has high overlap with an existing panel, discard it
        if any(iou(b, p) > 0.35 for p in filtered):
            continue
        filtered.append(b)

    # Fallback if no panels detected
    if len(filtered) < 2:
        return []

    # Sort strictly in Reading Order (top-to-bottom rows, left-to-right columns)
    row_h = max(h * 0.10, 45)
    filtered = sorted(filtered, key=lambda b: (round(b[1] / row_h), b[0]))
    return filtered

def render_panel_by_panel(image_path, audio_path, output_path, ffmpeg_exe, duration=35):
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError(f"Không thể đọc file ảnh: {image_path}")

    h, w, _ = img.shape
    TW, TH = 1080, 1920
    fps = 25

    panels = detect_panels(img)

    # Fallback if detection fails: 2 columns x 4 rows
    if len(panels) < 2:
        panels = []
        rows = 4
        cols = 2
        rh = int(h * 0.80 / rows)
        rw = int(w / cols)
        for r in range(rows):
            for c in range(cols):
                panels.append((c * rw, int(h * 0.08) + r * rh, rw, rh))

    # Add Quote Footer at the bottom of the comic sheet
    max_panel_bottom = max(p[1] + p[3] for p in panels)
    quote_y = max(max_panel_bottom, int(h * 0.89))
    quote_h = max(int(h * 0.08), h - quote_y)
    footer_box = (int(w * 0.03), quote_y, int(w * 0.94), quote_h)

    all_scenes = panels + [footer_box]
    total_scenes = len(all_scenes)

    # Seconds per scene
    scene_sec = max(2.2, duration / total_scenes)
    frames_per_scene = int(scene_sec * fps)

    # Prepare background
    full_bg = cv2.resize(img, (TW, TH), interpolation=cv2.INTER_LINEAR)
    full_bg = cv2.GaussianBlur(full_bg, (101, 101), 0)
    full_bg = (full_bg * 0.38).astype(np.uint8)

    cmd = [
        ffmpeg_exe, '-y',
        '-f', 'rawvideo',
        '-vcodec', 'rawvideo',
        '-s', f'{TW}x{TH}',
        '-pix_fmt', 'bgr24',
        '-r', str(fps),
        '-i', '-'
    ]

    if audio_path and os.path.exists(audio_path):
        cmd.extend([
            '-i', audio_path,
            '-c:v', 'libx264',
            '-preset', 'veryfast',
            '-pix_fmt', 'yuv420p',
            '-c:a', 'aac',
            '-b:a', '192k',
            '-af', f'afade=t=out:st={duration-3}:d=3',
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

    try:
        for s_idx, (bx, by, bw, bh) in enumerate(all_scenes):
            # Crop with safe 3px margin to preserve clean outer border
            pad_x = 3
            pad_y = 3
            y1 = max(0, by - pad_y)
            y2 = min(h, by + bh + pad_y)
            x1 = max(0, bx - pad_x)
            x2 = min(w, bx + bw + pad_x)
            crop = img[y1:y2, x1:x2]
            ch, cw, _ = crop.shape

            # Target size: width up to 1000px, height up to 1550px
            max_w, max_h = 1000, 1550
            scale = min(max_w / cw, max_h / ch)
            base_w = int(cw * scale)
            base_h = int(ch * scale)
            base_resized = cv2.resize(crop, (base_w, base_h), interpolation=cv2.INTER_LANCZOS4)

            # Panel background (specific blur of this panel for visual cohesion)
            panel_bg = cv2.resize(crop, (TW, TH), interpolation=cv2.INTER_LINEAR)
            panel_bg = cv2.GaussianBlur(panel_bg, (81, 81), 0)
            panel_bg = (panel_bg * 0.40).astype(np.uint8)

            # Subtle Ken Burns zoom (1.00 -> 1.05)
            for f in range(frames_per_scene):
                progress = f / max(1, frames_per_scene - 1)
                z = 1.0 + 0.05 * progress

                cur_w = int(base_w * z)
                cur_h = int(base_h * z)
                zoomed = cv2.resize(base_resized, (cur_w, cur_h), interpolation=cv2.INTER_LINEAR)

                # Add neat white frame border with subtle drop shadow
                bordered = cv2.copyMakeBorder(zoomed, 6, 6, 6, 6, cv2.BORDER_CONSTANT, value=[255, 255, 255])
                bh_f, bw_f, _ = bordered.shape

                # Center on canvas
                canvas = panel_bg.copy()
                pos_x = (TW - bw_f) // 2
                pos_y = (TH - bh_f) // 2

                # Safe placement with boundary checks
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

    except Exception as e:
        if proc.stdin:
            proc.stdin.close()
        proc.kill()
        raise e

    return {
        "success": True,
        "outputPath": output_path,
        "panelsCount": len(panels)
    }

def render_full_width_scroll(image_path, audio_path, output_path, ffmpeg_exe, duration=35):
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError(f"Không thể đọc file ảnh: {image_path}")

    h, w, _ = img.shape
    fps = 25
    TW, TH = 1080, 1920

    # Scale image so that its width is exactly TW (1080)
    scaled_h = int(h * (TW / w))

    if scaled_h <= TH:
        vf = f"scale={TW}:{scaled_h},pad={TW}:{TH}:0:(oh-ih)/2:color=black"
    else:
        total_frames = duration * fps
        hold_frames = fps * 3
        scroll_frames = max(fps * 5, total_frames - hold_frames)
        scroll_dist = scaled_h - TH
        vf = f"scale={TW}:{scaled_h},pad={TW}:{scaled_h}:0:0,crop={TW}:{TH}:0:'if(lte(n,{scroll_frames}), {scroll_dist}*(n/{scroll_frames}), {scroll_dist})'"

    cmd = [
        ffmpeg_exe, '-y',
        '-loop', '1',
        '-i', image_path,
        '-vf', vf,
        '-t', str(duration),
        '-c:v', 'libx264',
        '-preset', 'veryfast',
        '-pix_fmt', 'yuv420p'
    ]

    if audio_path and os.path.exists(audio_path):
        cmd.extend([
            '-i', audio_path,
            '-c:a', 'aac',
            '-b:a', '192k',
            '-af', f'afade=t=out:st={duration-3}:d=3',
            '-shortest'
        ])

    cmd.append(output_path)
    subprocess.run(cmd, check=True)

    return {
        "success": True,
        "outputPath": output_path
    }

if __name__ == '__main__':
    if len(sys.argv) < 6:
        print(json.dumps({"error": "Missing arguments"}))
        sys.exit(1)

    mode = sys.argv[1]
    image_path = sys.argv[2]
    audio_path = sys.argv[3] if sys.argv[3] != 'none' else None
    output_path = sys.argv[4]
    ffmpeg_exe = sys.argv[5]
    duration = int(sys.argv[6]) if len(sys.argv) > 6 else 35

    try:
        if mode == 'scroll':
            res = render_full_width_scroll(image_path, audio_path, output_path, ffmpeg_exe, duration)
        else:
            res = render_panel_by_panel(image_path, audio_path, output_path, ffmpeg_exe, duration)
        print(json.dumps(res))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
