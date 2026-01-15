import { useMemo } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useAcceptedFriends } from '@/hooks/useFriends'
import { useTotalHours } from '@/hooks/useLogs'
import { getTotalHoursByUser } from '@/services/logs'
import { useState, useEffect } from 'react'
import Card from '@/components/Card'

interface LeaderboardEntry {
  userId: string
  displayName: string
  totalHours: number
  totalMinutes: number
}

function LeaderboardPage() {
  const { user } = useAuth()
  const { friends } = useAcceptedFriends(user?.id)
  const { hours: userHours } = useTotalHours(user?.id)
  const [friendsHours, setFriendsHours] = useState<Record<string, LeaderboardEntry>>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchFriendHours = async () => {
      try {
        const hours: Record<string, LeaderboardEntry> = {}

        for (const friendship of friends) {
          const friendId = friendship.friend_id
          const friendData = friendship.friend as any
          const totalHours = await getTotalHoursByUser(friendId)

          hours[friendId] = {
            userId: friendId,
            displayName: friendData.display_name || friendData.email,
            totalHours: totalHours.totalHours,
            totalMinutes: totalHours.totalMinutes,
          }
        }

        setFriendsHours(hours)
      } catch (err) {
        console.error('Failed to fetch friend hours:', err)
      } finally {
        setIsLoading(false)
      }
    }

    if (friends.length > 0) {
      fetchFriendHours()
    } else {
      setIsLoading(false)
    }
  }, [friends])

  const leaderboard = useMemo(() => {
    if (!user) return []
    
    const entries: LeaderboardEntry[] = [
      {
        userId: user.id,
        displayName: 'You',
        totalHours: userHours.totalHours,
        totalMinutes: userHours.totalMinutes,
      },
      ...Object.values(friendsHours),
    ]

    return entries.sort((a, b) => b.totalMinutes - a.totalMinutes)
  }, [user, userHours, friendsHours])

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <p>Loading leaderboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-4xl font-bold">Leaderboard</h1>

        {leaderboard.length === 1 ? (
          <Card>
            <p className="text-center text-gray-600">
              Add friends to see the leaderboard. Visit the Friends page to get started!
            </p>
          </Card>
        ) : (
          <Card>
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Rank</th>
                  <th className="text-left py-3 px-4">Name</th>
                  <th className="text-right py-3 px-4">Total Hours</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry, index) => (
                  <tr
                    key={entry.userId}
                    className={`border-b ${
                      entry.userId === user?.id ? 'bg-blue-50 dark:bg-blue-900' : ''
                    }`}
                  >
                    <td className="py-3 px-4">
                      <span className="text-lg font-bold text-gray-600">#{index + 1}</span>
                    </td>
                    <td className="py-3 px-4">{entry.displayName}</td>
                    <td className="text-right py-3 px-4 font-semibold">
                      {entry.totalHours}h {entry.totalMinutes % 60}m
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </div>
    </div>
  )
}

export default LeaderboardPage
