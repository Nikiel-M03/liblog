import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { usePendingRequests, useOutgoingRequests, useAcceptedFriends } from '@/hooks/useFriends'
import {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  cancelFriendRequest,
} from '@/services/friends'
import Input from '@/components/Input'
import Button from '@/components/Button'
import Card from '@/components/Card'

function FriendsPage() {
  const { user } = useAuth()
  const { requests, setRequests } = usePendingRequests(user?.id)
  const { outgoing, setOutgoing } = useOutgoingRequests(user?.id)
  const { friends, setFriends } = useAcceptedFriends(user?.id)
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsLoading(true)

    try {
      const newRequest = await sendFriendRequest(user!.id, email)
      setSuccess(`Friend request sent to ${email}`)
      setEmail('')
      setOutgoing([...outgoing, newRequest])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send request')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAccept = async (friendshipId: string) => {
    try {
      await acceptFriendRequest(friendshipId)
      setRequests(requests.filter((r) => r.id !== friendshipId))
      const accepted = requests.find((r) => r.id === friendshipId)
      if (accepted) {
        setFriends([...friends, accepted])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept request')
    }
  }

  const handleReject = async (friendshipId: string) => {
    try {
      await rejectFriendRequest(friendshipId)
      setRequests(requests.filter((r) => r.id !== friendshipId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject request')
    }
  }

  const handleCancel = async (friendshipId: string) => {
    try {
      await cancelFriendRequest(friendshipId)
      setOutgoing(outgoing.filter((r) => r.id !== friendshipId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel request')
    }
  }

  const handleRemove = async (friendshipId: string) => {
    try {
      await removeFriend(friendshipId)
      setFriends(friends.filter((f) => f.id !== friendshipId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove friend')
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-4xl font-bold text-gray-900">Friends</h1>

        {error && <div className="p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>}
        {success && <div className="p-3 bg-green-100 text-green-700 rounded-lg">{success}</div>}

        <Card title="Send Friend Request">
          <form onSubmit={handleSendRequest} className="space-y-4">
            <Input
              label="Friend's Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="friend@example.com"
              required
            />
            <Button isLoading={isLoading} className="w-full">
              Send Request
            </Button>
          </form>
        </Card>

        {outgoing.length > 0 && (
          <Card title="Sent Requests (Pending)">
            <div className="space-y-3">
              {outgoing.map((request) => {
                const recipient = (request as any).friend
                return (
                  <div key={request.id} className="border-l-4 border-yellow-500 p-4 bg-gray-50 rounded flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-900">{recipient?.display_name || 'Unknown'}</p>
                      <p className="text-sm text-gray-600 mt-1">{recipient?.email}</p>
                      <p className="text-xs text-gray-500 mt-1">Pending...</p>
                    </div>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleCancel(request.id)}
                    >
                      Cancel
                    </Button>
                  </div>
                )
              })}
            </div>
          </Card>
        )}

        {requests.length > 0 && (
          <Card title="Incoming Requests">
            <div className="space-y-3">
              {requests.map((request) => {
                const sender = (request as any).user
                return (
                  <div key={request.id} className="border-l-4 border-blue-600 p-4 bg-gray-50 rounded flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-900">{sender?.display_name || 'Unknown'}</p>
                      <p className="text-sm text-gray-600 mt-1">{sender?.email}</p>
                    </div>
                    <div className="space-x-2">
                      <Button
                        size="sm"
                        onClick={() => handleAccept(request.id)}
                      >
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleReject(request.id)}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        )}

        {friends.length > 0 && (
          <Card title="Friends">
            <div className="space-y-3">
              {friends.map((friendship) => {
                const friendData = (friendship as any).friend
                return (
                  <div key={friendship.id} className="border-l-4 border-blue-600 p-4 bg-gray-50 rounded flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-900">{friendData?.display_name || 'Unknown'}</p>
                      <p className="text-sm text-gray-600 mt-1">{friendData?.email}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleRemove(friendship.id)}
                    >
                      Remove
                    </Button>
                  </div>
                )
              })}
            </div>
          </Card>
        )}

        {requests.length === 0 && outgoing.length === 0 && friends.length === 0 && (
          <Card>
            <p className="text-center text-gray-600">
              No pending requests or friends yet. Send a request to get started!
            </p>
          </Card>
        )}
      </div>
    </div>
  )
}

export default FriendsPage
