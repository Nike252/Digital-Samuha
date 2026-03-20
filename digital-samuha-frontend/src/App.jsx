import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { UIProvider } from './context/UIContext'
import Landing from './features/auth/Landing'
import SamuhaRegistration from './features/auth/SamuhaRegistration'
import Login from './features/auth/Login'
import SignUp from './features/auth/SignUp'
import SuperAdminLogin from './features/auth/SuperAdminLogin'
import AdhakshyaDashboard from './features/dashboard/AdhakshyaDashboard'
import CoAdhakshyaDashboard from './features/dashboard/CoAdhakshyaDashboard'
import MemberDashboard from './features/dashboard/MemberDashboard'
import SuperAdminDashboard from './features/superadmin/SuperAdminDashboard'
import GroupChat from './features/chat/GroupChat'
import Settings from './features/settings/Settings'
import Members from './features/members/Members'
import Attendance from './features/attendance/Attendance'
import Ledger from './features/ledger/Ledger'
import Documents from './features/documents/Documents'
import SamuhaBot from './features/bot/SamuhaBot'
import QuickDepositForm from './features/ledger/QuickDepositForm'
import PremiumMeetingRoom from './features/meetings/PremiumMeetingRoom'
import EsewaDirectRedirect from './features/payments/EsewaDirectRedirect'
import PaymentSuccess from './features/payments/PaymentSuccess'
import MeetingPaymentInitiator from './features/payments/MeetingPaymentInitiator'
import { CallProvider } from './context/CallContext'
import FloatingCallWidget from './features/meetings/FloatingCallWidget'
import { isAuthenticated, authAPI, removeAuthToken, setAuthToken } from './utils/api'
import AppLoader from './components/ui/AppLoader'
import './App.css'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      if (isAuthenticated()) {
        const response = await authAPI.getCurrentUser()
        setUser(response.data)
        // If on landing page and logged in, redirect to dashboard
        if (location.pathname === '/' || location.pathname === '/login') {
            navigate('/dashboard')
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error)
      removeAuthToken()
    } finally {
      setLoading(false)
    }
  }

  const handleLoginSuccess = (userData) => {
    setUser(userData)
    navigate('/dashboard')
  }

  const handleLogout = () => {
    setUser(null)
    removeAuthToken()
    navigate('/')
  }

  // Role-based Dashboard Router
  const DashboardRouter = () => {
    if (!user) return <Navigate to="/login" />
    
    // Superuser check first
    if (user.is_superuser) {
      return <SuperAdminDashboard user={user} onLogout={handleLogout} />;
    }

    switch (user.role) {
      case 'adhakshya':
        return <AdhakshyaDashboard user={user} onLogout={handleLogout} onNavigate={navigate} currentPath={location.pathname} />
      case 'co_adhakshya':
        return <CoAdhakshyaDashboard user={user} onLogout={handleLogout} onNavigate={navigate} currentPath={location.pathname} />
      case 'member':
        return <MemberDashboard user={user} onLogout={handleLogout} onNavigate={navigate} currentPath={location.pathname} />
      default:
        return <MemberDashboard user={user} onLogout={handleLogout} onNavigate={navigate} currentPath={location.pathname} />
    }
  }

  // Role-based Settings Router
  const SettingsRouter = () => {
    if (!user) return <Navigate to="/login" />
    return <Settings user={user} onLogout={handleLogout} />
  }

  // Magic Login Handler
  const MagicLogin = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const nextPath = searchParams.get('next') || '/dashboard';

    useEffect(() => {
      if (token) {
        setAuthToken(token);
        checkAuthStatus(); // Re-verify and fetch user data
      }
    }, [token]);

    // Redirect once user is authenticated
    useEffect(() => {
      if (user) {
        navigate(nextPath);
      }
    }, [user, nextPath]);

    if (!token) return <Navigate to="/login" />;
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#0f1115] text-white">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-indigo-400 font-bold animate-pulse">Establishing Secure Connection...</p>
        <p className="text-gray-500 text-sm mt-2">Authenticated. Redirecting...</p>
      </div>
    );
  };

  if (loading) return <AppLoader />

  return (
    <UIProvider>
      <CallProvider>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<SamuhaRegistration />} />
        <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
        <Route path="/signup" element={<SignUp onSignUpSuccess={() => navigate('/login')} />} />
        <Route path="/sudo" element={<SuperAdminLogin onLoginSuccess={handleLoginSuccess} />} />
        <Route path="/magic-login" element={<MagicLogin />} />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={<DashboardRouter />} />
        <Route path="/chat" element={user ? <GroupChat user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />
        <Route path="/settings" element={<SettingsRouter />} />
        <Route path="/members" element={user ? <Members user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />
        <Route path="/attendance" element={user ? <Attendance user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />
        <Route path="/ledger" element={user ? <Ledger user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />
        <Route path="/docs" element={
          user && ['adhakshya', 'co_adhakshya', 'member'].includes(user.role) ? (
            <Documents user={user} onLogout={handleLogout} />
          ) : (
            <Navigate to="/dashboard" />
          )
        } />
        <Route path="/ai-chat" element={user ? <SamuhaBot user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />
        <Route path="/quick-deposit/:samuhaId" element={<QuickDepositForm />} />
        <Route path="/premium-meeting/:roomID" element={user ? <PremiumMeetingRoom user={user} /> : <Navigate to="/login" />} />
        <Route path="/payment-success" element={user ? <PaymentSuccess user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />
        <Route path="/pay-direct/esewa/:samuhaId" element={user ? <EsewaDirectRedirect /> : <Navigate to="/login" />} />
        <Route path="/pay-meeting/:samuhaId" element={user ? <MeetingPaymentInitiator user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <FloatingCallWidget />
      </CallProvider>
    </UIProvider>
  )
}

export default App