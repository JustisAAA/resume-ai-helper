/**
 * 简历导出PDF工具函数
 * 使用 html2pdf.js 生成PDF，自动处理分页和中文字体
 */

import html2pdf from 'html2pdf.js';

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
