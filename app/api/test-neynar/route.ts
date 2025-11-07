import { NextResponse } from 'next/server'

import { env } from '@/lib/env.server'
import { fetchUser } from '@/lib/neynar.server'

export async function GET() {
  try {
    const response = await fetchUser(env.USER_FID)
    const user = response.result?.user

    return NextResponse.json({
      success: true,
      message: 'Neynar API connection successful',
      user: user
        ? {
            fid: user.fid,
            username: user.username,
            display_name: user.display_name,
          }
        : null,
    })
  } catch (error) {
    console.error('Neynar API test error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to connect to Neynar API',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}