import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { signUp } from '@/services/auth'
import Input from '@/components/Input'
import Button from '@/components/Button'
import Card from '@/components/Card'

function SignupPage() {
  const navigate = useNavigate()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsLoading(true)

    try {
      await signUp(email, password, displayName)
      setShowConfirmation(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed')
    } finally {
      setIsLoading(false)
    }
  }

  if (showConfirmation) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Card className="w-full max-w-md">
          <h1 className="text-3xl font-bold mb-6 text-center">LibLog</h1>
          <div className="space-y-4">
            <div className="p-4 bg-blue-100 text-blue-800 rounded-lg">
              <p className="font-semibold mb-2">Confirm your email</p>
              <p className="text-sm">
                We've sent a confirmation email to <strong>{email}</strong>. Please check your inbox and click
                the confirmation link to activate your account.
              </p>
            </div>
            <p className="text-sm text-gray-600">Once confirmed, you can log in to your account.</p>
            <Button className="w-full" onClick={() => navigate('/login')}>
              Go to Login
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center">LibLog</h1>

        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Display Name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="John Doe"
            required
          />

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          <Input
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          <Button isLoading={isLoading} className="w-full">
            Sign Up
          </Button>
        </form>

        <p className="mt-6 text-center text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline font-medium">
            Login
          </Link>
        </p>
      </Card>
    </div>
  )
}

export default SignupPage
