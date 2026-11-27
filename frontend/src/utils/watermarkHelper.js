/**
 * Watermark Helper - Tự động đóng dấu bản quyền thương hiệu Fanpage
 * Hỗ trợ tạo watermark dạng Badge góc hoặc Dải băng nhận diện
 */

export async function applyWatermarkToImage(imageSrc, options = {}) {
  const {
    brandName = 'GÓC TĂNG CA',
    subText = '@goctangca',
    position = 'bottom-right', // 'bottom-right' | 'top-right' | 'bottom-bar'
    opacity = 0.9,
    scale = 1.0
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // Hỗ trợ ảnh từ URL ngoài
    img.src = imageSrc;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      const width = img.naturalWidth || img.width;
      const height = img.naturalHeight || img.height;

      canvas.width = width;
      canvas.height = height;

      // 1. Vẽ ảnh gốc
      ctx.drawImage(img, 0, 0, width, height);

      // Kích thước tương đối dựa theo chiều rộng bức ảnh
      const baseUnit = Math.max(width, height) / 1000;
      const padding = 20 * baseUnit;

      ctx.save();
      ctx.globalAlpha = opacity;

      // Kiểu 1: Dải băng nhận diện chân ảnh (Bottom Bar - Phong cách tin tức)
      if (position === 'bottom-bar') {
        const barHeight = Math.max(50, 48 * baseUnit);
        
        // Vẽ dải nền gradient mờ
        const gradient = ctx.createLinearGradient(0, height - barHeight, width, height);
        gradient.addColorStop(0, 'rgba(15, 23, 42, 0.85)');
        gradient.addColorStop(1, 'rgba(2, 6, 23, 0.95)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, height - barHeight, width, barHeight);

        // Viền cam phía trên dải băng
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(0, height - barHeight, width, 3 * baseUnit);

        // Chữ thương hiệu
        const fontSize = Math.max(16, 18 * baseUnit);
        ctx.font = `bold ${fontSize}px system-ui, -apple-system, sans-serif`;
        ctx.fillStyle = '#ffffff';
        ctx.textBaseline = 'middle';
        
        // Icon chấm tròn cam
        ctx.beginPath();
        ctx.arc(padding + 10 * baseUnit, height - barHeight / 2, 5 * baseUnit, 0, Math.PI * 2);
        ctx.fillStyle = '#f59e0b';
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.fillText(brandName, padding + 22 * baseUnit, height - barHeight / 2);

        // Chữ phụ
        const subFontSize = Math.max(12, 13 * baseUnit);
        ctx.font = `500 ${subFontSize}px system-ui, -apple-system, sans-serif`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.textAlign = 'right';
        ctx.fillText(subText, width - padding, height - barHeight / 2);
      } 
      // Kiểu 2: Badge Watermark bo góc (Phong cách Theanh28 / Beatvn)
      else {
        const badgeWidth = Math.max(160, 190 * baseUnit * scale);
        const badgeHeight = Math.max(46, 52 * baseUnit * scale);
        const radius = 12 * baseUnit;

        let x = width - badgeWidth - padding;
        let y = height - badgeHeight - padding;

        if (position === 'top-right') {
          x = width - badgeWidth - padding;
          y = padding;
        } else if (position === 'top-left') {
          x = padding;
          y = padding;
        } else if (position === 'bottom-left') {
          x = padding;
          y = height - badgeHeight - padding;
        }

        // Đổ bóng cho badge
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 12 * baseUnit;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 4 * baseUnit;

        // Vẽ nền badge bo tròn
        ctx.beginPath();
        ctx.roundRect(x, y, badgeWidth, badgeHeight, radius);
        ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
        ctx.fill();

        // Viền cam hổ phách sang trọng
        ctx.lineWidth = 1.5 * baseUnit;
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.7)';
        ctx.stroke();

        ctx.shadowColor = 'transparent';

        // Vẽ Logo Icon (Khối tròn cam nhỏ bên trái badge)
        const iconSize = badgeHeight * 0.65;
        const iconX = x + 10 * baseUnit;
        const iconY = y + (badgeHeight - iconSize) / 2;

        ctx.beginPath();
        ctx.roundRect(iconX, iconY, iconSize, iconSize, 8 * baseUnit);
        const iconGrad = ctx.createLinearGradient(iconX, iconY, iconX + iconSize, iconY + iconSize);
        iconGrad.addColorStop(0, '#f59e0b');
        iconGrad.addColorStop(1, '#ea580c');
        ctx.fillStyle = iconGrad;
        ctx.fill();

        // Vẽ chữ G viết tắt bên trong icon
        ctx.font = `900 ${iconSize * 0.65}px system-ui, sans-serif`;
        ctx.fillStyle = '#0f172a';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('G', iconX + iconSize / 2, iconY + iconSize / 2 + 1);

        // Chữ chính thương hiệu "GÓC TĂNG CA"
        const textX = iconX + iconSize + 8 * baseUnit;
        const titleSize = Math.max(12, 13 * baseUnit * scale);
        ctx.font = `bold ${titleSize}px system-ui, -apple-system, sans-serif`;
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(brandName, textX, y + 9 * baseUnit);

        // Chữ phụ "@goctangca"
        const subSize = Math.max(9, 10 * baseUnit * scale);
        ctx.font = `500 ${subSize}px system-ui, sans-serif`;
        ctx.fillStyle = 'rgba(245, 158, 11, 0.9)';
        ctx.fillText(subText, textX, y + 9 * baseUnit + titleSize + 3 * baseUnit);
      }

      ctx.restore();

      // Xuất kết quả
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Không thể xuất file ảnh'));
            return;
          }
          const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
          resolve({ dataUrl, blob });
        },
        'image/jpeg',
        0.92
      );
    };

    img.onerror = (err) => {
      reject(new Error('Lỗi tải ảnh nguồn để đóng dấu'));
    };
  });
}
