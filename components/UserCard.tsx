import { UserMinus, Calendar, Star, Users, CheckCircle, XCircle } from 'lucide-react'

interface User {
  fid: number
  username: string
  display_name: string
  pfp_url: string
  follower_count: number
  following_count: number
  verifications: string[]
  active_status: string
  viewer_context?: {
    following: boolean
    followed_by: boolean
  }
  neynar_score?: number
  last_post_date?: string
}

interface UserCardProps {
  user: User
  onUnfollow: (fid: number) => void
  isUnfollowing: boolean
}

export function UserCard({ user, onUnfollow, isUnfollowing }: UserCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getDaysSinceLastPost = (dateString: string) => {
    const lastPost = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - lastPost.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const getNeynarScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600'
    if (score >= 0.6) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="px-6 py-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <img
              className="h-12 w-12 rounded-full"
              src={user.pfp_url}
              alt={user.display_name}
            />
          </div>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.display_name}
              </p>
              <span className="text-sm text-gray-500">@{user.username}</span>
              {user.verifications.length > 0 && (
                <CheckCircle className="h-4 w-4 text-blue-500" />
              )}
            </div>
            
            <div className="flex items-center space-x-4 mt-1">
              {/* Followers/Following */}
              <div className="flex items-center space-x-1 text-sm text-gray-500">
                <Users className="h-4 w-4" />
                <span>{user.follower_count.toLocaleString()} followers</span>
              </div>

              {/* Mutual Follow Status */}
              {user.viewer_context && (
                <div className="flex items-center space-x-1 text-sm">
                  {user.viewer_context.followed_by ? (
                    <div className="flex items-center space-x-1 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span>Follows you back</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1 text-red-600">
                      <XCircle className="h-4 w-4" />
                      <span>Doesn't follow back</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Additional Info */}
            <div className="flex items-center space-x-4 mt-2">
              {/* Neynar Score */}
              {user.neynar_score !== undefined && (
                <div className="flex items-center space-x-1 text-sm">
                  <Star className="h-4 w-4" />
                  <span className={getNeynarScoreColor(user.neynar_score)}>
                    Score: {user.neynar_score.toFixed(2)}
                  </span>
                </div>
              )}

              {/* Last Post Date */}
              {user.last_post_date && (
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Last post: {getDaysSinceLastPost(user.last_post_date)} days ago
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Unfollow Button */}
        <div className="flex-shrink-0">
          <button
            onClick={() => onUnfollow(user.fid)}
            disabled={isUnfollowing}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUnfollowing ? (
              <>
                <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                Unfollowing...
              </>
            ) : (
              <>
                <UserMinus className="h-4 w-4 mr-1" />
                Unfollow
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}