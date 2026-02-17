import { NextRequest, NextResponse } from 'next/server'
import { NeynarService } from '@/lib/neynar'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Verify webhook signature if needed
    const signature = request.headers.get('x-neynar-signature')
    const webhookSecret = process.env.WEBHOOK_SECRET
    
    if (webhookSecret && signature) {
      // Add signature verification logic here
      // This is a placeholder - implement proper signature verification
    }

    // Handle different webhook events
    const { type, data } = body
    
    switch (type) {
      case 'user.follow':
        console.log('User follow event:', data)
        // Handle follow event
        break
        
      case 'user.unfollow':
        console.log('User unfollow event:', data)
        // Handle unfollow event
        break
        
      case 'cast.created':
        console.log('Cast created event:', data)
        // Handle new cast event - update last post date
        break
        
      default:
        console.log('Unknown webhook event:', type, data)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Neynar webhook endpoint' })
}