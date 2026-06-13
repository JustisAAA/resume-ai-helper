/**
 * 简历导出PDF工具函数
 * 使用 html2pdf.js 生成PDF，自动处理分页和中文字体
 */

import html2pdf from 'html2pdf.js';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * 通用：将任意文本内容导出为PDF
 * 使用 html2pdf.js 自动分页，避免文字截断，支持中文
 */
export async function exportTextToPdf(
  title: string,
  content: string,
  filename: string = '文档'
): Promise<void> {
  if (!content || !content.trim()) {
    throw new Error('内容为空');
  }

  // 创建临时 DOM 元素来渲染内容
  const container = document.createElement('div');
  container.style.cssText = `
    width: 210mm;
    min-height: 297mm;
    padding: 20mm;
    background: #ffffff;
    color: #1a1a1a;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif;
    font-size: 11pt;
    line-height: 1.8;
    box-sizing: border-box;
  `;

  // 标题
  const titleEl = document.createElement('h1');
  titleEl.style.cssText = `
    font-size: 22pt;
    font-weight: bold;
    text-align: center;
    margin: 0 0 15mm 0;
    color: #1a1a1a;
  `;
  titleEl.textContent = title || '简历';
  container.appendChild(titleEl);

  // 分隔线
  const hr = document.createElement('div');
  hr.style.cssText = `
    border-bottom: 1px solid #ddd;
    margin-bottom: 10mm;
  `;
  container.appendChild(hr);

  // 将内容按行处理，检测标题
  const lines = content.split('\n');
  for (const line of lines) {
    if (!line.trim()) {
      const spacer = document.createElement('div');
      spacer.style.height = '0.8em';
      container.appendChild(spacer);
      continue;
    }

    // 检测是否是标题行
    const isTitle = /^[A-Z\s]+$/.test(line.trim()) ||
                   /教育|工作|项目|技能|经历|个人|自我|荣誉|证书|语言|特长|求职|意向/.test(line);

    const p = document.createElement('p');
    p.style.cssText = isTitle
      ? 'font-size: 13pt; font-weight: bold; margin: 1.2em 0 0.6em 0; color: #1a1a1a; page-break-after: avoid;'
      : 'font-size: 11pt; margin: 0.4em 0; color: #333; text-indent: 0; page-break-inside: avoid;';
    p.textContent = line;
    container.appendChild(p);
  }

  document.body.appendChild(container);

  try {
    const opt = {
      margin: 0,
      filename: `${filename}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: 794, // 210mm @ 96dpi
      },
      jsPDF: {
        unit: 'mm' as const,
        format: 'a4' as const,
        orientation: 'portrait' as const,
      },
      pagebreak: {
        mode: ['css', 'legacy'] as const,
        avoid: 'p' as const,
      },
    };

    await html2pdf().set(opt).from(container).save();
  } finally {
    // 清理临时元素
    document.body.removeChild(container);
  }
}

/**
 * 将简历数据导出为PDF（简洁版）
 * 使用 html2pdf.js 自动分页，支持中文
 */
export async function exportResumeDataToPdf(
  resumeData: {
    title: string;
    content: string;
    optimizedContent?: string;
  },
  filename: string = '简历'
): Promise<void> {
  const content = resumeData.optimizedContent || resumeData.content;
  return exportTextToPdf(resumeData.title, content, filename);
}

/**
 * 将HTML元素导出为PDF
 * @param element HTML元素或元素ID
 * @param filename 文件名（不含扩展名）
 */
export async function exportElementToPdf(
  element: HTMLElement | string,
  filename: string = '简历'
): Promise<void> {
  const targetElement = typeof element === 'string'
    ? document.getElementById(element)
    : element;

  if (!targetElement) {
    throw new Error('找不到要导出的元素');
  }

  const opt = {
    margin: 10,
    filename: `${filename}.pdf`,
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    },
    jsPDF: {
      unit: 'mm' as const,
      format: 'a4' as const,
      orientation: 'portrait' as const,
    },
    pagebreak: {
      mode: ['css', 'legacy'] as const,
    },
  };

  await html2pdf().set(opt).from(targetElement).save();
}

// ══════════════════════════════════════════════════════
// 面试报告 PDF 导出（多页 A4，含页眉页脚）
// ══════════════════════════════════════════════════════

function cropCanvas(source: HTMLCanvasElement, sx: number, sy: number, sw: number, sh: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = sw;
  c.height = sh;
  const ctx = c.getContext('2d');
  ctx?.drawImage(source, sx, sy, sw, sh, 0, 0, sw, sh);
  return c;
}

/** 检测 canvas 某一行是否接近空白（平均亮度 > threshold 即视为空白区） */
function isLineBlank(canvas: HTMLCanvasElement, y: number, threshold = 240): boolean {
  const ctx = canvas.getContext('2d');
  if (!ctx) return false;
  const w = Math.min(canvas.width, 200); // 采样中间200px
  const x0 = Math.max(0, (canvas.width - w) / 2);
  const data = ctx.getImageData(x0, y, w, 1).data;
  let sum = 0;
  for (let i = 0; i < data.length; i += 4) {
    sum += data[i] * 0.3 + data[i + 1] * 0.59 + data[i + 2] * 0.11; // 亮度加权
  }
  return (sum / (data.length / 4)) >= threshold;
}

/** 智能分页：在目标位置附近寻找最佳的自然分页点（两卡片之间的空白区） */
function findBestSplit(canvas: HTMLCanvasElement, targetY: number, maxAdjust = 150): number {
  const totalH = canvas.height;

  // 从 targetY 向上搜索空白行（优先在目标之前分页）
  let bestY = targetY;
  let bestScore = -1;

  for (let y = Math.max(10, targetY - maxAdjust); y <= Math.min(totalH - 10, targetY + maxAdjust); y += 4) {
    const blank = isLineBlank(canvas, y);
    // 越接近 targetY 的空白行得分越高
    const distancePenalty = Math.abs(y - targetY) / maxAdjust;
    const score = (blank ? 1 : 0) - distancePenalty * 0.5;

    if (score > bestScore) {
      bestScore = score;
      bestY = y;
    }
  }

  // 如果没找到足够好的空白区，回退到精确位置
  if (bestScore < 0.3) return targetY;
  return bestY;
}

export interface PDFReportOptions {
  title?: string;
  headerLeft?: string;
  footerText?: string;
  scale?: number;
  margin?: number;
}

/** 在 canvas 上绘制文本（用于渲染中文页眉页脚） */
function drawTextOnCanvas(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  fontSize: number,
  color: string,
  maxWidth?: number
) {
  ctx.save();
  ctx.font = `${fontSize}px "Microsoft YaHei", "PingFang SC", "Hiragino Sans GB", sans-serif`;
  ctx.fillStyle = color;
  if (maxWidth) {
    const metrics = ctx.measureText(text);
    if (metrics.width > maxWidth) {
      // 截断过长文字
      let truncated = text;
      while (ctx.measureText(truncated + '...').width > maxWidth && truncated.length > 1) {
        truncated = truncated.slice(0, -1);
      }
      text = truncated + '...';
    }
  }
  ctx.fillText(text, x, y);
  ctx.restore();
}

/** 将 HTML 元素导出为多页 A4 PDF（页眉页脚用 canvas 渲染，完美支持中文） */
export async function exportReportToPDF(
  element: HTMLElement,
  filename: string,
  options: PDFReportOptions = {}
): Promise<void> {
  const {
    title = '面试报告',
    headerLeft,
    footerText = '© 2024 简历面试AI助手 · 本报告由AI生成，仅供参考',
    scale = 2,
    margin = 10,
  } = options;

  const headerText = headerLeft || `简历面试AI助手 · ${title}`;
  const today = new Date().toLocaleDateString('zh-CN');
  const dpi = 96 * scale; // 物理像素密度

  // 1. 截图内容
  const canvas = await html2canvas(element, {
    scale,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
  });

  const imgWidth = canvas.width;
  const imgHeight = canvas.height;
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pdfW = pdf.internal.pageSize.getWidth();
  const pdfH = pdf.internal.pageSize.getHeight();

  const headerH = 14;
  const footerH = 10;
  const contentW = pdfW - margin * 2;
  const contentH = pdfH - margin * 2 - headerH - footerH;
  const contentScale = contentW / imgWidth;
  const pageContentPx = contentH / contentScale;
  const totalPages = Math.ceil(imgHeight / pageContentPx);

  // 计算页眉页脚在物理像素下的尺寸
  const headerPxW = Math.round((contentW / 25.4) * dpi);
  const headerPxH = Math.round((headerH / 25.4) * dpi);
  const footerPxW = headerPxW;
  const footerPxH = Math.round((footerH / 25.4) * dpi);

  // 2. 逐页生成（智能分页避免切割卡片）
  let currentY = 0;

  for (let page = 0; page < totalPages; page++) {
    if (page > 0) pdf.addPage();

    // --- 页眉 canvas ---
    const headerCanvas = document.createElement('canvas');
    headerCanvas.width = headerPxW;
    headerCanvas.height = headerPxH;
    const hctx = headerCanvas.getContext('2d')!;
    hctx.fillStyle = '#ffffff';
    hctx.fillRect(0, 0, headerPxW, headerPxH);
    drawTextOnCanvas(hctx, headerText, 6 * scale, headerPxH - 14 * scale, 10 * scale, '#888888', headerPxW - 80 * scale);
    drawTextOnCanvas(hctx, today, headerPxW - 60 * scale, headerPxH - 14 * scale, 10 * scale, '#888888');
    hctx.strokeStyle = '#dcdcdc';
    hctx.lineWidth = scale;
    hctx.beginPath();
    hctx.moveTo(0, headerPxH - 4 * scale);
    hctx.lineTo(headerPxW, headerPxH - 4 * scale);
    hctx.stroke();
    pdf.addImage(headerCanvas.toDataURL('image/png'), 'PNG', margin, margin, contentW, headerH);

    // --- 智能分页 ---
    const targetEndY = currentY + pageContentPx;
    const isLastPage = targetEndY >= imgHeight;
    let cropEnd = isLastPage ? imgHeight : findBestSplit(canvas, targetEndY);
    const cropH = cropEnd - currentY;

    const cropped = cropCanvas(canvas, 0, Math.round(currentY), imgWidth, Math.round(cropH));
    pdf.addImage(cropped.toDataURL('image/png'), 'PNG', margin, margin + headerH, contentW, cropH * contentScale);

    currentY = cropEnd;

    // --- 页脚 canvas ---
    const footerCanvas = document.createElement('canvas');
    footerCanvas.width = footerPxW;
    footerCanvas.height = footerPxH;
    const fctx = footerCanvas.getContext('2d')!;
    fctx.fillStyle = '#ffffff';
    fctx.fillRect(0, 0, footerPxW, footerPxH);
    drawTextOnCanvas(fctx, `第 ${page + 1} 页 / 共 ${totalPages} 页`, footerPxW / 2 - 40 * scale, 12 * scale, 9 * scale, '#999999');
    drawTextOnCanvas(fctx, footerText, footerPxW / 2 - 120 * scale, footerPxH - 3 * scale, 8 * scale, '#aaaaaa');
    pdf.addImage(footerCanvas.toDataURL('image/png'), 'PNG', margin, pdfH - margin - footerH, contentW, footerH);

    // 提前结束
    if (currentY >= imgHeight) break;
  }

  const safeName = filename.replace(/[^a-zA-Z0-9\u4e00-\u9fa5_\-]/g, '_');
  pdf.save(`${safeName}_${new Date().toISOString().slice(0, 10)}.pdf`);
}
