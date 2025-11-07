'use strict'

import { env } from '@/lib/env.server'

const API_BASE_URL = 'https://api.neynar.com/v2'

type FetchOptions = {
  path: string
  init?: RequestInit
  searchParams?: Record<string, string | number | boolean | undefined>
}

async function request<T>({ path, init, searchParams }: FetchOptions): Promise<T> {
  const url = new URL(path, API_BASE_URL)

  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value))
      }
    })
  }

  const response = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': env.NEYNAR_API_KEY,
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
  })

  if (!response.ok) {
    const errorBody = await safeJson(response)
    const error = new Error(
      `Neynar API request failed (${response.status} ${response.statusText})`,
    ) as Error & { status?: number; body?: unknown }
    error.status = response.status
    error.body = errorBody
    throw error
  }

  return response.json() as Promise<T>
}

async function safeJson(response: Response) {
  try {
    return await response.json()
  } catch {
    return null
  }
}

export async function fetchFollowing({
  fid,
  limit = 200,
  cursor,
}: {
  fid?: number | string
  limit?: number
  cursor?: string
}) {
  return request<{
    users: any[]
    next?: { cursor?: string }
  }>({
    path: '/farcaster/user/following',
    searchParams: {
      fid: fid ?? env.USER_FID,
      limit,
      viewer_fid: env.USER_FID,
      cursor,
    },
  })
}

export async function fetchUser(fid: number | string) {
  return request<{
    result?: { user?: any }
  }>({
    path: '/farcaster/user',
    searchParams: {
      fid,
      viewer_fid: env.USER_FID,
    },
  })
}

export async function fetchUserFeed(fid: number | string) {
  return request<{
    casts?: Array<{ timestamp: string }>
  }>({
    path: '/farcaster/feed/user',
    searchParams: {
      fid,
      limit: 1,
      with_recasts: false,
    },
  })
}

export async function unfollowUsers(targetFids: number[]) {
  return request<{
    success: boolean
    details?: Array<{ success: boolean; target_fid: number }>
  }>({
    path: '/farcaster/user/follow/',
    init: {
      method: 'DELETE',
      body: JSON.stringify({
        signer_uuid: env.SIGNER_UUID,
        target_fids: targetFids,
      }),
    },
  })
}
