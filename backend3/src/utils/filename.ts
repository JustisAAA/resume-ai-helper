/**
 * 文件名编码修复工具
 * 
 * multer 在处理 multipart 上传时，默认将文件名以 latin1 编码解析，
 * 导致中文等非 ASCII 文件名变成乱码（如 é«ã 等）。
 * 
 * 此函数尝试将误编码为 latin1 的 utf8 文件名纠正回来。
 * 
 * @param name 原始文件名（可能已被 latin1 误编码）
 * @returns 修复后的文件名
 */
export function fixFilename(name: string): string {
  // 如果文件名中没有扩展 ASCII 字符，说明已经是正确的 UTF-8，无需处理
  if (!/[\x80-\xFF]/.test(name)) return name;

  try {
    // 典型的 utf8→latin1 误编码：将原始字节当作 latin1 字符
    // 再反转为正确的 UTF-8 字符串
    const buf = Buffer.from(name, 'binary');
    const utf8Name = buf.toString('utf8');

    // 修复后多了中文字符 → 说明修复有效
    const origCJK = (name.match(/[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/g) || []).length;
    const fixedCJK = (utf8Name.match(/[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/g) || []).length;

    if (fixedCJK > origCJK) return utf8Name;
  } catch {}

  return name;
}
