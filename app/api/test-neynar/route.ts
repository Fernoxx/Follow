import { NextRequest, NextResponse } from 'next/server'
import { NeynarService } from '@/lib/neynar'

export async function GET(request: NextRequest) {
  try {
    const neynarService = new NeynarService()
    
    // Test basic API connectivity
    const testFid = process.env.NEXT_PUBLIC_USER_FID
    if (!testFid) {
      return NextResponse.json(
        { error: 'User FID not configured' },
        { status: 400 }
      )
    }

    const user = await neynarService.getUser(parseInt(testFid))
    
    return NextResponse.json({
      success: true,
      message: 'Neynar API connection successful',
      user: {
        fid: user?.fid,
        username: user?.username,
        display_name: user?.display_name
      }
    })
  } catch (error) {
    console.error('Neynar API test error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to connect to Neynar API',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}