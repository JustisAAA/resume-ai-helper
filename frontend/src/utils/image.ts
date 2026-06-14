import { getApiBaseUrl } from './api';

const API_BASE = getApiBaseUrl();

/** 将相对路径（如 /uploads/xxx）转为完整 URL */
export function getImageUrl(url: string | undefined): string {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  // API_BASE 为 '/' 时，路径已以 '/' 开头则可直接使用
  if (API_BASE === '/' && url.startsWith('/')) return url;
  const base = API_BASE.replace(/\/$/, '');
  const path = url.startsWith('/') ? url : `/${url}`;
  return `${base}${path}`;
}
