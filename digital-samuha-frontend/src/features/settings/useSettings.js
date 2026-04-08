import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, samuhaAPI, subscriptionsAPI } from '../../utils/api';

const useSettings = (initialUser) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [user, setUser] = useState(initialUser);
  const [isPremium, setIsPremium] = useState(initialUser?.samuha?.is_premium || false);
  const [subscription, setSubscription] = useState(null);
  const [showTransactionHistory, setShowTransactionHistory] = useState(false);
  const [loading, setLoading] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const [profileData, setProfileData] = useState({
    phone: initialUser?.phone || '',
    first_name: initialUser?.first_name || '',
    last_name: initialUser?.last_name || '',
    email: initialUser?.email || '',
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_new_password: '',
  });

  const [samuhaSettings, setSamuhaSettings] = useState({
    meeting_day: 'Saturday',
    meeting_frequency: 'Monthly',
    absent_fine: 100,
    late_fine: 50,
    loan_interest_rate: 1.0,
    saving_amount: 500,
  });

  const isAdhakshya = user?.role === 'adhakshya';

  useEffect(() => {
    const refreshPremiumStatus = async () => {
      try {
        const [userRes, subRes] = await Promise.allSettled([
          authAPI.getCurrentUser(),
          subscriptionsAPI.getCurrentSubscription()
        ]);
        
        if (userRes.status === 'fulfilled') {
          setUser(userRes.value.data);
          if (userRes.value.data?.samuha?.is_premium) setIsPremium(true);
        }
        if (subRes.status === 'fulfilled') {
          setSubscription(subRes.value.data);
          if (subRes.value.data?.is_premium) setIsPremium(true);
        }
      } catch (e) {
        console.error('Failed to refresh premium status:', e);
      }
    };
    refreshPremiumStatus();
  }, []);

  useEffect(() => {
    if (isAdhakshya) fetchSamuhaSettings();
  }, [isAdhakshya]);

  const fetchSamuhaSettings = async () => {
    try {
      setSettingsLoading(true);
      const response = await samuhaAPI.getSettings();
      // Ensure specific numeric fields have defaults if the backend sends null/blank
      const normalizedData = {
        ...response.data,
        saving_amount: response.data.saving_amount ?? 500,
        absent_fine: response.data.absent_fine ?? 100,
        late_fine: response.data.late_fine ?? 50,
        loan_interest_rate: response.data.loan_interest_rate ?? 1.0
      };
      setSamuhaSettings(normalizedData);
    } catch (error) {
      console.error('Failed to fetch Samuha settings:', error);
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSettingsChange = (e) => {
    const { name, value } = e.target;
    setSamuhaSettings(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage('');
    try {
      await authAPI.updateProfile(profileData);
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage('');
    try {
      await authAPI.updateProfile({ ...profileData, ...passwordData });
      setSuccessMessage('Password updated successfully!');
      setPasswordData({ current_password: '', new_password: '', confirm_new_password: '' });
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to update password' });
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage('');
    try {
      await samuhaAPI.updateSettings(samuhaSettings);
      setSuccessMessage('Samuha rules updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to update Samuha rules' });
    } finally {
      setLoading(false);
    }
  };

  return {
    user, activeTab, setActiveTab, isPremium, subscription, showTransactionHistory, 
    setShowTransactionHistory, loading, settingsLoading, errors, successMessage,
    profileData, passwordData, samuhaSettings, setSamuhaSettings, handleProfileChange,
    handlePasswordChange, handleSettingsChange, handleProfileUpdate,
    handlePasswordUpdate, handleSettingsUpdate, isAdhakshya, navigate
  };
};

export default useSettings;
