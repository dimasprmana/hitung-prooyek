export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

export class ApiError extends Error {
  constructor(message, { status = 0, data = null } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

async function parseResponse(response) {
  const text = await response.text()
  if (!text) return null

  try {
    return JSON.parse(text)
  } catch {
    throw new ApiError('Response API tidak valid.', {
      status: response.status,
      data: text,
    })
  }
}

export async function request(path, options = {}) {
  const { method = 'GET', body, headers = {}, ...rest } = options
  const url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`

  let response

  try {
    response = await fetch(url, {
      method,
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      ...rest,
    })
  } catch {
    throw new ApiError('Backend API tidak dapat dihubungi.', { status: 0 })
  }

  const data = await parseResponse(response)

  if (!response.ok) {
    throw new ApiError(data?.message || `Request gagal (${response.status}).`, {
      status: response.status,
      data,
    })
  }

  return data
}
