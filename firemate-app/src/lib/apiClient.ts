/**
 * 统一的 API 错误处理工具
 */

/**
 * API 响应错误
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public isNetworkError: boolean = false
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * 处理 fetch 响应
 */
export async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = '请求失败';
    try {
      const data = await response.json();
      message = data.error || data.message || message;
    } catch {
      message = response.statusText || message;
    }
    throw new ApiError(message, response.status);
  }

  // 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

/**
 * 统一的网络请求函数
 */
export async function apiRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': '00000000-0000-0000-0000-000000000001', // TODO: 使用实际用户ID
        ...options.headers,
      },
    });

    return handleApiResponse<T>(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    // 网络错误
    throw new ApiError('网络连接失败，请检查网络', 0, true);
  }
}

/**
 * 统一处理 Store 中的错误
 * 返回错误消息，调用方可以自行决定如何处理（显示提示/抛出等）
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return '发生未知错误';
}
