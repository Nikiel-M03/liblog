import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from '@/services/supabase'
import type { User } from '@supabase/supabase-js'
import LoginPage from '@/pages/LoginPage'
import SignupPage from '@/pages/SignupPage'
import DashboardPage from '@/pages/DashboardPage'
import StatisticsPage from '@/pages/StatisticsPage'
import LeaderboardPage from '@/pages/LeaderboardPage'
import FriendsPage from '@/pages/FriendsPage'
import Navbar from '@/components/Navbar'
import LoadingSpinner from '@/components/LoadingSpinner'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data } = await supabase.auth.getSession()
        setUser(data?.session?.user || null)
      } catch (err) {
        console.error('Failed to check user:', err)
      } finally {
        setIsLoading(false)
      }
    }

    checkUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => subscription?.unsubscribe()
  }, [])

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <Router>
      {user && <Navbar />}
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />}
        />
        <Route
          path="/signup"
          element={user ? <Navigate to="/dashboard" replace /> : <SignupPage />}
        />
        <Route
          path="/dashboard"
          element={user ? <DashboardPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/statistics"
          element={user ? <StatisticsPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/leaderboard"
          element={user ? <LeaderboardPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/friends"
          element={user ? <FriendsPage /> : <Navigate to="/login" replace />}
        />
        <Route path="*" element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />
      </Routes>
    </Router>
  )
}

export default App
