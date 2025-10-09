'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, UserMinus, Calendar, Star, Users } from 'lucide-react'
import { NeynarService } from '@/lib/neynar'
import { UserCard } from '@/components/UserCard'
import { FilterPanel } from '@/components/FilterPanel'
import { LoadingSpinner } from '@/components/LoadingSpinner'

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

interface FilterOptions {
  showNotFollowingBack: boolean
  showLowNeynarScore: boolean
  neynarScoreThreshold: number
  showInactiveUsers: boolean
  inactiveMonths: number
  searchQuery: string
}

export default function UnfollowPage() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [unfollowing, setUnfollowing] = useState<Set<number>>(new Set())
  const [filters, setFilters] = useState<FilterOptions>({
    showNotFollowingBack: false,
    showLowNeynarScore: false,
    neynarScoreThreshold: 0.5,
    showInactiveUsers: false,
    inactiveMonths: 2,
    searchQuery: ''
  })

  useEffect(() => {
    fetchFollowingUsers()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [users, filters])

  const fetchFollowingUsers = async () => {
    try {
      setLoading(true)
      const neynarService = new NeynarService()
      const followingData = await neynarService.getFollowingFeed()
      
      // Process users to add additional data
      const processedUsers = await Promise.all(
        followingData.map(async (user: any) => {
          const neynarScore = await neynarService.getNeynarScore(user.fid)
          const lastPostDate = await neynarService.getLastPostDate(user.fid)
          
          return {
            fid: user.fid,
            username: user.username,
            display_name: user.display_name,
            pfp_url: user.pfp_url,
            follower_count: user.follower_count,
            following_count: user.following_count,
            verifications: user.verifications || [],
            active_status: user.active_status,
            viewer_context: user.viewer_context,
            neynar_score: neynarScore,
            last_post_date: lastPostDate
          }
        })
      )
      
      setUsers(processedUsers)
    } catch (error) {
      console.error('Error fetching following users:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...users]

    // Search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      filtered = filtered.filter(user => 
        user.username.toLowerCase().includes(query) ||
        user.display_name.toLowerCase().includes(query)
      )
    }

    // Not following back filter
    if (filters.showNotFollowingBack) {
      filtered = filtered.filter(user => 
        user.viewer_context && !user.viewer_context.followed_by
      )
    }

    // Low Neynar score filter
    if (filters.showLowNeynarScore) {
      filtered = filtered.filter(user => 
        user.neynar_score && user.neynar_score < filters.neynarScoreThreshold
      )
    }

    // Inactive users filter
    if (filters.showInactiveUsers) {
      const cutoffDate = new Date()
      cutoffDate.setMonth(cutoffDate.getMonth() - filters.inactiveMonths)
      
      filtered = filtered.filter(user => {
        if (!user.last_post_date) return true
        return new Date(user.last_post_date) < cutoffDate
      })
    }

    setFilteredUsers(filtered)
  }

  const handleUnfollow = async (fid: number) => {
    try {
      setUnfollowing(prev => new Set(prev).add(fid))
      const neynarService = new NeynarService()
      await neynarService.unfollowUser(fid)
      
      // Remove user from the list
      setUsers(prev => prev.filter(user => user.fid !== fid))
    } catch (error) {
      console.error('Error unfollowing user:', error)
    } finally {
      setUnfollowing(prev => {
        const newSet = new Set(prev)
        newSet.delete(fid)
        return newSet
      })
    }
  }

  const handleFilterChange = (newFilters: Partial<FilterOptions>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Unfollow Management
          </h1>
          <p className="text-gray-600">
            Manage your follows with advanced filtering options
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Following</p>
                <p className="text-2xl font-semibold text-gray-900">{users.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <UserMinus className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Filtered Results</p>
                <p className="text-2xl font-semibold text-gray-900">{filteredUsers.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Avg Neynar Score</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {users.length > 0 
                    ? (users.reduce((sum, user) => sum + (user.neynar_score || 0), 0) / users.length).toFixed(2)
                    : '0.00'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Panel */}
        <FilterPanel 
          filters={filters}
          onFilterChange={handleFilterChange}
        />

        {/* User List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Following Users ({filteredUsers.length})
            </h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {filteredUsers.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <UserMinus className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try adjusting your filters or search query.
                </p>
              </div>
            ) : (
              filteredUsers.map((user) => (
                <UserCard
                  key={user.fid}
                  user={user}
                  onUnfollow={handleUnfollow}
                  isUnfollowing={unfollowing.has(user.fid)}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}