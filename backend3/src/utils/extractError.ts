/**
 * 从 API 错误响应或 Error 对象中提取人类可读的错误消息
 */
export function extractApiError(error: any, fallback: string): string {
  if (error?.response?.data?.error) return error.response.data.error;
  if (error?.message) return error.message;
  return fallback;
}
