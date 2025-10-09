import axios from 'axios'

export class NeynarService {
  private apiKey: string
  private baseUrl: string = 'https://api.neynar.com/v2'

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_NEYNAR_API_KEY || ''
    if (!this.apiKey) {
      console.warn('Neynar API key not found. Please set NEXT_PUBLIC_NEYNAR_API_KEY environment variable.')
    }
  }

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      'api_key': this.apiKey,
    }
  }

  /**
   * Fetch user's following feed
   * Based on: https://docs.neynar.com/reference/fetch-user-following-feed
   */
  async getFollowingFeed(fid?: number, limit: number = 200) {
    try {
      const response = await axios.get(`${this.baseUrl}/farcaster/user/following`, {
        headers: this.getHeaders(),
        params: {
          fid: fid || process.env.NEXT_PUBLIC_USER_FID,
          limit,
          viewer_fid: process.env.NEXT_PUBLIC_USER_FID
        }
      })
      return response.data.users || []
    } catch (error) {
      console.error('Error fetching following feed:', error)
      throw error
    }
  }

  /**
   * Get user's Neynar score
   * This is a placeholder implementation as the exact endpoint may vary
   */
  async getNeynarScore(fid: number): Promise<number> {
    try {
      // This is a mock implementation - replace with actual Neynar API call
      // The actual endpoint might be different based on Neynar's API
      const response = await axios.get(`${this.baseUrl}/farcaster/user`, {
        headers: this.getHeaders(),
        params: {
          fid,
          viewer_fid: process.env.NEXT_PUBLIC_USER_FID
        }
      })
      
      // Mock score calculation based on follower count and verification status
      const user = response.data.result?.user
      if (!user) return 0.5
      
      let score = 0.5
      if (user.follower_count > 1000) score += 0.2
      if (user.follower_count > 10000) score += 0.1
      if (user.verifications && user.verifications.length > 0) score += 0.1
      if (user.active_status === 'active') score += 0.1
      
      return Math.min(score, 1.0)
    } catch (error) {
      console.error('Error fetching Neynar score:', error)
      return 0.5 // Default score
    }
  }

  /**
   * Get user's last post date
   */
  async getLastPostDate(fid: number): Promise<string | null> {
    try {
      const response = await axios.get(`${this.baseUrl}/farcaster/feed/user`, {
        headers: this.getHeaders(),
        params: {
          fid,
          limit: 1,
          with_recasts: false
        }
      })
      
      const casts = response.data.casts || []
      if (casts.length > 0) {
        return casts[0].timestamp
      }
      return null
    } catch (error) {
      console.error('Error fetching last post date:', error)
      return null
    }
  }

  /**
   * Unfollow a user
   */
  async unfollowUser(targetFid: number): Promise<void> {
    try {
      await axios.post(`${this.baseUrl}/farcaster/follow`, {
        signer_uuid: process.env.NEXT_PUBLIC_SIGNER_UUID,
        target_fid: targetFid
      }, {
        headers: this.getHeaders()
      })
    } catch (error) {
      console.error('Error unfollowing user:', error)
      throw error
    }
  }

  /**
   * Get user details
   */
  async getUser(fid: number) {
    try {
      const response = await axios.get(`${this.baseUrl}/farcaster/user`, {
        headers: this.getHeaders(),
        params: {
          fid,
          viewer_fid: process.env.NEXT_PUBLIC_USER_FID
        }
      })
      return response.data.result?.user
    } catch (error) {
      console.error('Error fetching user:', error)
      throw error
    }
  }

  /**
   * Check if user follows another user
   */
  async checkFollowStatus(followerFid: number, targetFid: number): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseUrl}/farcaster/follows`, {
        headers: this.getHeaders(),
        params: {
          fid: followerFid,
          target_fid: targetFid
        }
      })
      return response.data.result?.follows || false
    } catch (error) {
      console.error('Error checking follow status:', error)
      return false
    }
  }
}