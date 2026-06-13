import { getApiBaseUrl } from './api';

const API_BASE = getApiBaseUrl();

/** 将相对路径（如 /uploads/xxx）转为完整 URL */
export function getImageUrl(url: string | undefined): string {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${API_BASE}${url}`;
}
