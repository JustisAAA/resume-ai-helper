/**
 * 分页参数处理工具
 */

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationResult {
  page: number;
  limit: number;
  skip: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * 解析分页参数，设置默认值和上限
 * @param pagination 请求中的分页参数
 * @param maxLimit 每页最大条数（默认 100）
 */
export function parsePagination(pagination?: PaginationParams, maxLimit = 100): PaginationResult {
  const page = pagination?.page && pagination.page > 0 ? pagination.page : 1;
  const limit = pagination?.limit && pagination.limit > 0 ? Math.min(pagination.limit, maxLimit) : 20;
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

/**
 * 构建分页元信息
 */
export function buildPagination(page: number, limit: number, total: number): PaginationMeta {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}
