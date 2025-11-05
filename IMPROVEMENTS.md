# Recommended Code Improvements

## 1. Secure API Implementation (High Priority)

### Create Server-Side API Routes

**File: `app/api/neynar/following/route.ts`**
```typescript
import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY // Remove NEXT_PUBLIC_
const USER_FID = process.env.USER_FID // Remove NEXT_PUBLIC_

export async function GET(request: NextRequest) {
  try {
    const response = await axios.get('https://api.neynar.com/v2/farcaster/user/following', {
      headers: {
        'Content-Type': 'application/json',
        'api_key': NEYNAR_API_KEY,
      },
      params: {
        fid: USER_FID,
        limit: 200,
        viewer_fid: USER_FID
      }
    })
    return NextResponse.json({ users: response.data.users || [] })
  } catch (error) {
    console.error('Error fetching following:', error)
    return NextResponse.json(
      { error: 'Failed to fetch following' },
      { status: 500 }
    )
  }
}
```

**File: `app/api/neynar/unfollow/route.ts`**
```typescript
import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY
const SIGNER_UUID = process.env.SIGNER_UUID

export async function POST(request: NextRequest) {
  try {
    const { targetFid } = await request.json()
    
    // Verify request (add authentication here)
    
    // Check Neynar API docs for correct unfollow endpoint
    const response = await axios.post(
      'https://api.neynar.com/v2/farcaster/follow',
      {
        signer_uuid: SIGNER_UUID,
        target_fid: targetFid,
        // Add action: 'unfollow' if needed by API
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'api_key': NEYNAR_API_KEY,
        }
      }
    )
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error unfollowing user:', error)
    return NextResponse.json(
      { error: 'Failed to unfollow user' },
      { status: 500 }
    )
  }
}
```

### Update Client Code

**Update `lib/neynar.ts`** to use API routes instead of direct calls:
```typescript
async getFollowingFeed(fid?: number, limit: number = 200) {
  const response = await fetch('/api/neynar/following')
  const data = await response.json()
  return data.users || []
}

async unfollowUser(targetFid: number): Promise<void> {
  await fetch('/api/neynar/unfollow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ targetFid })
  })
}
```

## 2. Fix Unfollow Endpoint

**Issue**: Current implementation may not use correct Neynar API endpoint.

**Action Required**: 
1. Check Neynar API documentation for correct unfollow endpoint
2. It may be DELETE request or POST with different action parameter
3. Verify authentication method required

**Reference**: Check https://docs.neynar.com for latest API documentation

## 3. Implement Webhook Signature Verification

**File: `app/api/webhooks/neynar/route.ts`** (update)
```typescript
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-neynar-signature')
    const webhookSecret = process.env.WEBHOOK_SECRET
    
    if (!webhookSecret || !signature) {
      return NextResponse.json(
        { error: 'Missing signature or secret' },
        { status: 401 }
      )
    }
    
    // Verify signature (check Neynar docs for exact method)
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(body)
      .digest('hex')
    
    if (signature !== expectedSignature) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }
    
    const data = JSON.parse(body)
    const { type, data: eventData } = data
    
    // Handle webhook events
    switch (type) {
      case 'user.follow':
        // Handle follow event
        break
      case 'user.unfollow':
        // Handle unfollow event
        break
      case 'cast.created':
        // Handle new cast event
        break
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
```

## 4. Add Error Handling & User Feedback

**Update `app/unfollow/page.tsx`**:
```typescript
const [error, setError] = useState<string | null>(null)

const handleUnfollow = async (fid: number) => {
  try {
    setError(null)
    setUnfollowing(prev => new Set(prev).add(fid))
    const neynarService = new NeynarService()
    await neynarService.unfollowUser(fid)
    
    // Show success message
    setUsers(prev => prev.filter(user => user.fid !== fid))
  } catch (error) {
    console.error('Error unfollowing user:', error)
    setError('Failed to unfollow user. Please try again.')
    // Could add toast notification here
  } finally {
    setUnfollowing(prev => {
      const newSet = new Set(prev)
      newSet.delete(fid)
      return newSet
    })
  }
}

// Add error display in JSX:
{error && (
  <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded mb-4">
    {error}
  </div>
)}
```

## 5. Add Rate Limiting

**Install package**: `npm install @upstash/ratelimit @upstash/redis`

**File: `lib/rateLimit.ts`**:
```typescript
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'),
})
```

**Add to API routes**:
```typescript
import { ratelimit } from '@/lib/rateLimit'

export async function POST(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1'
  const { success } = await ratelimit.limit(ip)
  
  if (!success) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    )
  }
  
  // ... rest of handler
}
```

## 6. Add Caching

**Install**: `npm install @tanstack/react-query`

**Update data fetching**:
```typescript
import { useQuery } from '@tanstack/react-query'

const { data: users, isLoading } = useQuery({
  queryKey: ['following'],
  queryFn: async () => {
    const neynarService = new NeynarService()
    return await neynarService.getFollowingFeed()
  },
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
})
```

## 7. Add TypeScript Types

**File: `types/neynar.ts`**:
```typescript
export interface NeynarUser {
  fid: number
  username: string
  display_name: string
  pfp_url: string
  follower_count: number
  following_count: number
  verifications: string[]
  active_status: 'active' | 'inactive'
  viewer_context?: {
    following: boolean
    followed_by: boolean
  }
}

export interface NeynarApiResponse<T> {
  result?: T
  error?: string
}

export interface NeynarFollowingResponse {
  users: NeynarUser[]
}
```

## 8. Add Confirmation Dialogs

**Install**: `npm install react-hot-toast` or use a dialog library

**Update unfollow handler**:
```typescript
const handleUnfollow = async (fid: number) => {
  const user = users.find(u => u.fid === fid)
  const confirmed = window.confirm(
    `Are you sure you want to unfollow ${user?.display_name || user?.username}?`
  )
  
  if (!confirmed) return
  
  // ... rest of unfollow logic
}
```

## 9. Improve Neynar Score Implementation

If Neynar provides an actual score endpoint, replace the mock implementation:

```typescript
async getNeynarScore(fid: number): Promise<number> {
  try {
    // Replace with actual Neynar API endpoint if available
    const response = await axios.get(`${this.baseUrl}/farcaster/user/score`, {
      headers: this.getHeaders(),
      params: { fid }
    })
    return response.data.result?.score || 0.5
  } catch (error) {
    console.error('Error fetching Neynar score:', error)
    return 0.5
  }
}
```

## 10. Add Pagination

For users with many follows, implement pagination:

```typescript
async getFollowingFeed(fid?: number, limit: number = 200, cursor?: string) {
  const params: any = {
    fid: fid || process.env.NEXT_PUBLIC_USER_FID,
    limit,
    viewer_fid: process.env.NEXT_PUBLIC_USER_FID
  }
  
  if (cursor) {
    params.cursor = cursor
  }
  
  const response = await axios.get(`${this.baseUrl}/farcaster/user/following`, {
    headers: this.getHeaders(),
    params
  })
  
  return {
    users: response.data.users || [],
    nextCursor: response.data.next?.cursor
  }
}
```

## Priority Order

1. **🔴 Critical**: Secure API keys (move to server-side)
2. **🔴 Critical**: Fix unfollow endpoint
3. **🟡 High**: Implement webhook signature verification
4. **🟡 High**: Add error handling
5. **🟢 Medium**: Add rate limiting
6. **🟢 Medium**: Add caching
7. **🟢 Medium**: Add TypeScript types
8. **🔵 Low**: Add confirmation dialogs
9. **🔵 Low**: Improve Neynar score
10. **🔵 Low**: Add pagination
