import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authAPI, setAuthToken } from '../../utils/api'
import { Shield, Eye, EyeOff, AlertTriangle } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const SuperAdminLogin = ({ onLoginSuccess }) => {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!username.trim() || !password.trim()) {
      setError('Both fields are required.')
      return
    }

    setLoading(true)
    try {
      // Call the dedicated superadmin-only login endpoint
      const res = await fetch(`${API_BASE}/auth/sudo-login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: username.trim(), password })
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.detail || 'Authentication failed.')
      }

      // Store token
      setAuthToken(data.access)
      if (data.refresh) localStorage.setItem('refresh_token', data.refresh)

      // Fetch user info
      const userRes = await authAPI.getCurrentUser()
      if (onLoginSuccess) onLoginSuccess(userRes.data)
    } catch (err) {
      setError(err.message || 'Invalid credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
      {/* Subtle grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
      
      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-indigo-600/20 border border-indigo-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield size={28} className="text-indigo-400" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">System Administration</h1>
          <p className="text-gray-600 text-sm mt-1">Authorized personnel only</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-[#111118] border border-gray-800 rounded-2xl p-6 shadow-2xl">
          
          {error && (
            <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm px-4 py-3 rounded-xl mb-5">
              <AlertTriangle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Identifier</label>
            <input
              type="text"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(''); }}
              className="w-full bg-[#0a0a0f] border border-gray-800 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-colors placeholder-gray-700"
              placeholder="Enter username or phone"
              autoComplete="off"
              spellCheck={false}
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Passphrase</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                className="w-full bg-[#0a0a0f] border border-gray-800 text-white px-4 py-3 pr-12 rounded-xl focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-colors placeholder-gray-700"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            {loading ? 'Authenticating...' : 'Authenticate'}
          </button>
        </form>

        <p className="text-center text-gray-800 text-[11px] mt-6 tracking-wide">
          DIGITAL SAMUHA • RESTRICTED ACCESS
        </p>
      </div>
    </div>
  )
}

export default SuperAdminLogin
