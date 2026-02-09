export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5287";

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const text = await response.text();
    const message = text || response.statusText;
    throw new Error(message);
  }

  if (response.status === 204) {
    // No content
    return undefined as unknown as T;
  }

  return (await response.json()) as T;
}

async function get<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    },
    cache: "no-store"
  });
  return handleResponse<T>(response);
}

async function post<TRequest, TResponse>(
  path: string,
  body: TRequest
): Promise<TResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
  return handleResponse<TResponse>(response);
}

async function put<TRequest, TResponse = void>(
  path: string,
  body: TRequest
): Promise<TResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
  return handleResponse<TResponse>(response);
}

async function del<TResponse = void>(path: string): Promise<TResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json"
    }
  });
  return handleResponse<TResponse>(response);
}

export const api = {
  get,
  post,
  put,
  delete: del
};

