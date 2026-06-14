export function sanitizeError(error: unknown): unknown {
  if (error instanceof Error) {
    const sanitized: Record<string, unknown> = {
      name: error.name,
      message: error.message,
    };
    if ('response' in error) {
      const resp = (error as any).response;
      sanitized.response = {
        status: resp?.status,
        statusText: resp?.statusText,
        data: resp?.data,
      };
    }
    return sanitized;
  }
  return error;
}
