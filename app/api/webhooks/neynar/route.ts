import crypto from 'crypto'

import { NextRequest, NextResponse } from 'next/server'

import { env } from '@/lib/env.server'

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get('x-neynar-signature')

    if (env.WEBHOOK_SECRET) {
      if (!signature) {
        return NextResponse.json(
          { error: 'Missing Neynar signature header' },
          { status: 401 },
        )
      }

      const expectedSignature = crypto
        .createHmac('sha256', env.WEBHOOK_SECRET)
        .update(rawBody)
        .digest('hex')

      if (!timingSafeEqual(signature, expectedSignature)) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    const body = JSON.parse(rawBody)

    const { type, data } = body

    switch (type) {
      case 'user.follow':
        console.log('User follow event:', data)
        break

      case 'user.unfollow':
        console.log('User unfollow event:', data)
        break

      case 'cast.created':
        console.log('Cast created event:', data)
        break

      default:
        console.log('Unhandled Neynar webhook event:', type, data)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Neynar webhook endpoint' })
}

function timingSafeEqual(signature: string, expectedSignature: string) {
  const sigBuffer = Buffer.from(signature, 'utf8')
  const expectedBuffer = Buffer.from(expectedSignature, 'utf8')

  if (sigBuffer.length !== expectedBuffer.length) {
    return false
  }

  return crypto.timingSafeEqual(sigBuffer, expectedBuffer)
}