/**
 * API 配置工具
 * 集中管理 API 地址，支持环境变量配置
 * 
 * 使用方式：
 * import { getApiUrl } from '../utils/api';
 * const url = getApiUrl('/auth/login');
 */

// 从环境变量读取 API 基础地址，默认使用空字符串（同源路径）
// Vite 构建时可设置 VITE_API_URL= 使用同源访问
const API_BASE = ((import.meta.env.VITE_API_URL as string) || '').replace(/\/$/, '');

// 确保 URL 拼接正确（去掉尾部的 /）
const BASE = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE;

// 完整的 API 地址（包含 /api 前缀）
export const API_URL = `${BASE}/api`;

/**
 * 获取完整的 API URL
 * @param endpoint - API 端点，以 / 开头，例如 '/auth/login'
 * @returns 完整的 URL，例如 '/api/auth/login'
 * 
 * @example
 * getApiUrl('/auth/login') // => '/api/auth/login'
 * getApiUrl('/resumes')    // => 'http://localhost:3002/api/resumes'
 */
export function getApiUrl(endpoint: string): string {
  // 确保 endpoint 以 / 开头
  if (!endpoint.startsWith('/')) {
    endpoint = '/' + endpoint;
  }
  return `${API_URL}${endpoint}`;
}

/**
 * 获取完整的 API 基础地址（不含 /api 前缀）
 * 用于需要直接拼接的场景
 * @returns API 基础地址，例如 '/'
 */
export function getApiBaseUrl(): string {
  return API_BASE;
}
