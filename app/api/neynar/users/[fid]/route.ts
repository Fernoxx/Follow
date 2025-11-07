import { NextRequest, NextResponse } from 'next/server'

import { fetchUser, fetchUserFeed } from '@/lib/neynar.server'

export async function GET(
  _request: NextRequest,
  { params }: { params: { fid: string } },
) {
  const fid = Number(params.fid)

  if (Number.isNaN(fid)) {
    return NextResponse.json({ error: 'Invalid FID' }, { status: 400 })
  }

  try {
    const [userResponse, feedResponse] = await Promise.allSettled([
      fetchUser(fid),
      fetchUserFeed(fid),
    ])

    const user =
      userResponse.status === 'fulfilled' ? userResponse.value.result?.user ?? null : null
    const lastPostTimestamp =
      feedResponse.status === 'fulfilled' && feedResponse.value.casts?.length
        ? feedResponse.value.casts[0].timestamp
        : null

    return NextResponse.json(
      {
        user,
        lastPostTimestamp,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error(`Failed to fetch Neynar user ${fid}:`, error)
    return NextResponse.json(
      {
        error: 'Failed to fetch user details',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 502 },
    )
  }
}
