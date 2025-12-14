import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, FormInput } from '../../components/ui'
import { authAPI } from '../../utils/api'
import AuthLayout from '../../layouts/AuthLayout'
import { ArrowLeft } from 'lucide-react'
import { useUI } from '../../context/UIContext'

const Login = ({ onLoginSuccess, onBack }) => {
  const navigate = useNavigate()
  const { showToast } = useUI()
  const handleBack = () => {
    if (onBack) onBack()
    else navigate('/')
  }
  const [formData, setFormData] = useState({
    phone: '',
    password: ''
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
    setSubmitError('')
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    }
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError('')
    
    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      const response = await authAPI.login(formData.phone, formData.password)
      
      try {
        const userResponse = await authAPI.getCurrentUser()
        const userData = userResponse.data
      
        setFormData({ phone: '', password: '' })
        setErrors({})
        
        if (onLoginSuccess) {
            onLoginSuccess(userData)
        } else {
            handleBack()
        }
      } catch (userError) {
        console.error('Error fetching user info:', userError)
        showToast(`Login successful, but could not load user information: ${userError.message || 'Unknown error'}. Please refresh.`, 'error')
        if (onLoginSuccess) onLoginSuccess(null)
      }
    } catch (error) {
      console.error('Login error:', error)
      setSubmitError(error.message || 'Failed to login. Please check your credentials.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const backButton = (
    <button 
      onClick={handleBack}
      className="p-2 -ml-2 text-gray-400 hover:text-gray-900 transition-colors flex items-center gap-1 group"
    >
      <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
      <span className="text-sm font-medium">Back</span>
    </button>
  )

  return (
    <AuthLayout 
      title="Welcome Back" 
      subtitle="Please enter your details to sign in."
      backButton={backButton}
    >

      {submitError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 font-medium animate-pulse">
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <FormInput
          label="Phone Number"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          error={errors.phone}
          placeholder="98XXXXXXXX"
          required
          className="w-full"
        />

        <div>
            <FormInput
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            placeholder="••••••••"
            required
            className="w-full"
            />
            <div className="flex justify-end mt-1">
                <button type="button" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
                    Forgot Password?
                </button>
            </div>
        </div>

        <div className="pt-2">
            <Button
                type="submit"
                variant="primary"
                size="large"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all hover:shadow-indigo-300 hover:-translate-y-0.5"
            >
                {isSubmitting ? 'Signing in...' : 'Sign In'}
            </Button>
        </div>

      </form>
    </AuthLayout>
  )
}

export default Login
