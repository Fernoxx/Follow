import { NextRequest, NextResponse } from 'next/server'

import { fetchFollowing, unfollowUsers } from '@/lib/neynar.server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const limit = Number(searchParams.get('limit') ?? '200')
  const cursor = searchParams.get('cursor') ?? undefined
  const fid = searchParams.get('fid') ?? undefined

  try {
    const data = await fetchFollowing({
      fid,
      limit: Number.isNaN(limit) ? 200 : Math.min(Math.max(limit, 1), 200),
      cursor: cursor || undefined,
    })

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('Error fetching following from Neynar:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch following users',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 502 },
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const targetFids = Array.isArray(body?.targetFids)
      ? body.targetFids.map((fid: unknown) => Number(fid)).filter((fid: number) => !Number.isNaN(fid))
      : []

    if (targetFids.length === 0) {
      return NextResponse.json(
        { error: 'targetFids must be a non-empty array of numeric FIDs' },
        { status: 400 },
      )
    }

    const result = await unfollowUsers(targetFids)

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error('Error unfollowing users via Neynar:', error)
    return NextResponse.json(
      {
        error: 'Failed to unfollow users',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 502 },
    )
  }
}
