import { Link, useLocation } from 'react-router-dom'
import { supabase } from '@/services/supabase'
import Button from '@/components/Button'
import clsx from 'clsx'

function Navbar() {
  const location = useLocation()

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  const navItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/statistics', label: 'Statistics' },
    { path: '/leaderboard', label: 'Leaderboard' },
    { path: '/friends', label: 'Friends' },
  ]

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/dashboard" className="text-2xl font-bold text-blue-600">
          LibLog
        </Link>

        <div className="hidden md:flex gap-6">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={clsx(
                'transition-colors duration-200',
                location.pathname === item.path
                  ? 'text-blue-600 font-medium'
                  : 'text-gray-600 hover:text-blue-600',
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <Button variant="secondary" size="sm" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </nav>
  )
}

export default Navbar
