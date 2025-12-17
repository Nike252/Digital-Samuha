import { useState, useEffect } from 'react';
import { authAPI, samuhaAPI } from '../../utils/api';
import { useUI } from '../../context/UIContext';

const useSignUp = (navigate, onSignUpSuccess) => {
  const { showToast } = useUI();
  const [formData, setFormData] = useState({
    phone: '',
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirm_password: '',
    role: '',
    samuha_code: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // 🪄 Magic Auto-Fill Logic
  useEffect(() => {
    const triggerAutoFill = async () => {
      // We only auto-fill if the role is Adhakshya and a code is provided
      if (formData.role === 'adhakshya' && formData.samuha_code.length >= 6) {
        try {
          const res = await samuhaAPI.checkSamuhaCode(formData.samuha_code, formData.role);
          if (res.data?.exists && res.data?.first_name) {
            setFormData(prev => ({
              ...prev,
              first_name: res.data.first_name || prev.first_name,
              last_name: res.data.last_name || prev.last_name,
              phone: res.data.phone || prev.phone,
              email: res.data.email || prev.email
            }));
            showToast(`Welcome back, ${res.data.first_name}! Your details have been auto-filled from your Samuha registration.`, 'info');
          }
        } catch (err) {
          // Silent fail for auto-fill - user just types manually
          console.debug('No auto-fill info found for code:', formData.samuha_code);
        }
      }
    };

    // Debounce the API call slightly
    const timer = setTimeout(triggerAutoFill, 500);
    return () => clearTimeout(timer);
  }, [formData.samuha_code, formData.role]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    setSubmitError('');
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.password.trim()) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Min 8 characters';
    if (formData.password !== formData.confirm_password) newErrors.confirm_password = 'Passwords do not match';
    if (!formData.role) newErrors.role = 'Role is required';
    if (!formData.samuha_code.trim()) newErrors.samuha_code = 'Samuha code is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
      await authAPI.signup(formData);
      showToast('Account created successfully! Please login.', 'success');
      setFormData({ phone: '', first_name: '', last_name: '', email: '', password: '', confirm_password: '', role: '', samuha_code: '' });
      
      if (onSignUpSuccess) onSignUpSuccess();
      else navigate('/login');
    } catch (error) {
      console.error('Sign up error:', error);
      setSubmitError(error.message || 'Failed to sign up.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData, errors, isSubmitting, submitError,
    handleChange, handleSubmit
  };
};

export default useSignUp;
