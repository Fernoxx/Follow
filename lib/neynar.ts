export class NeynarService {
  async getFollowingFeed(params?: { fid?: number; limit?: number; cursor?: string }) {
    const searchParams = new URLSearchParams()

    if (params?.fid) {
      searchParams.set('fid', String(params.fid))
    }
    if (params?.limit) {
      searchParams.set('limit', String(params.limit))
    }
    if (params?.cursor) {
      searchParams.set('cursor', params.cursor)
    }

    const response = await fetch(
      `/api/neynar/following${searchParams.toString() ? `?${searchParams}` : ''}`,
      {
        method: 'GET',
        cache: 'no-store',
      },
    )

    if (!response.ok) {
      const details = await safeJson(response)
      throw new Error(details?.error ?? 'Failed to fetch following feed')
    }

    const data = await response.json()
    return {
      users: data.users ?? [],
      nextCursor: data.next?.cursor ?? null,
    }
  }

  async getUserDetails(fid: number) {
    const response = await fetch(`/api/neynar/users/${fid}`, {
      method: 'GET',
      cache: 'no-store',
    })

    if (!response.ok) {
      const details = await safeJson(response)
      throw new Error(details?.error ?? 'Failed to fetch user details')
    }

    return response.json()
  }

  async unfollowUser(targetFid: number): Promise<void> {
    const response = await fetch('/api/neynar/following', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ targetFids: [targetFid] }),
    })

    if (!response.ok) {
      const details = await safeJson(response)
      throw new Error(details?.error ?? 'Failed to unfollow user')
    }
  }
}

async function safeJson(response: Response) {
  try {
    return await response.json()
  } catch {
    return null
  }
}