// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

// Get auth token from localStorage
const getAuthToken = () => {
  const token = localStorage.getItem('access_token')
  // Validate token format (basic check - JWT tokens have 3 parts separated by dots)
  if (token && token.split('.').length !== 3) {
    console.warn('Invalid token format detected')
    return null
  }
  return token
}

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = getAuthToken()
  return !!token
}

// Set auth token in localStorage
export const setAuthToken = (token) => {
  localStorage.setItem('access_token', token)
}

// Remove auth token from localStorage
export const removeAuthToken = () => {
  localStorage.removeItem('access_token')
}

// Make API request with authentication
export const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken()

  const headers = {
    ...options.headers,
  }

  // Add auth token if available
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  // Don't set Content-Type for FormData (browser will set it with boundary)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    })

    const data = await response.json().catch(() => ({})) // Handle empty responses

    if (!response.ok) {
      // Handle validation errors
      if (response.status === 400 && data) {
        // Ultimate error extractor: searches for the first string in a potentially nested structure
        const extractMessage = (obj) => {
          if (typeof obj === 'string') return obj;
          if (Array.isArray(obj)) {
            for (const item of obj) {
              const res = extractMessage(item);
              if (res) return res;
            }
          } else if (typeof obj === 'object' && obj !== null) {
            // Prioritize common error keys
            const priorityKeys = ['detail', 'error', 'message', 'non_field_errors'];
            for (const key of priorityKeys) {
              if (obj[key]) {
                const res = extractMessage(obj[key]);
                if (res) return res;
              }
            }
            // Fallback to searching all keys
            for (const key of Object.keys(obj)) {
              const res = extractMessage(obj[key]);
              if (res) return res;
            }
          }
          return null;
        };

        const message = extractMessage(data) || 'Validation error';
        throw new Error(message);
      }
      // Handle authentication errors
      if (response.status === 401) {
        removeAuthToken()
        
        // Prioritize the backend's specific error message if available
        if (data && (data.detail || data.error)) {
          throw new Error(data.detail || data.error);
        }

        // Fallback for token specific errors
        if (data && (data.code === 'token_not_valid' || data.detail?.includes('token'))) {
          throw new Error('Your session has expired or the token is invalid. Please login again.')
        }
        throw new Error('Authentication required. Please login first.')
      }
      // Handle other errors
      throw new Error(data.detail || data.error || `API Error: ${response.statusText}`)
    }

    return { data, status: response.status }
  } catch (error) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('Network error. Please check if the backend server is running.')
    }
    throw error
  }
}

// Auth API functions
export const authAPI = {
  login: async (phone, password) => {
    const response = await apiRequest('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ phone, password }),
    })
    // Store tokens
    if (response.data.access) {
      setAuthToken(response.data.access)
      if (response.data.refresh) {
        localStorage.setItem('refresh_token', response.data.refresh)
      }
    }
    return response
  },
  signup: async (formData) => {
    const isFormData = formData instanceof FormData
    const response = await apiRequest('/auth/signup/', {
      method: 'POST',
      body: isFormData ? formData : JSON.stringify(formData),
    })
    // Do NOT store tokens - user must login separately
    return response
  },
  getCurrentUser: async () => {
    const response = await apiRequest('/auth/me/', {
      method: 'GET',
    })
    return response
  },
  updateProfile: async (formData) => {
    const response = await apiRequest('/auth/me/', {
      method: 'PUT',
      body: JSON.stringify(formData),
    })
    return response
  },
}

// Specific API functions
export const samuhaAPI = {
  register: async (formData) => {
    // No authentication required - this is the first step
    // Make request without auth token
    const headers = {}

    // Don't set Content-Type for FormData (browser will set it with boundary)
    if (!(formData instanceof FormData)) {
      headers['Content-Type'] = 'application/json'
    }

    try {
      const response = await fetch(`${API_BASE_URL}/samuha/register/`, {
        method: 'POST',
        headers,
        body: formData,
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        // Handle validation errors
        if (response.status === 400 && data) {
          const firstErrorKey = Object.keys(data)[0];
          const errorVal = data[firstErrorKey];
          const message = Array.isArray(errorVal) ? errorVal[0] : (typeof errorVal === 'string' ? errorVal : 'Validation error');
          throw new Error(message);
        }
        // Handle other errors
        throw new Error(data.detail || data.error || `API Error: ${response.statusText}`)
      }

      return { data, status: response.status }
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Network error. Please check if the backend server is running.')
      }
      throw error
    }
  },
  getMembers: async () => {
    return apiRequest('/samuha/members/', { method: 'GET' })
  },
  getPendingList: async () => {
    return apiRequest('/samuha/pending-list/', { method: 'GET' })
  },
  approveSamuha: async (id) => {
    return apiRequest(`/samuha/approve/${id}/`, { method: 'POST' })
  },
  getSamuhaList: async () => {
    return apiRequest('/samuha/list/', { method: 'GET' })
  },
  updateSamuhaStatus: async (id, status) => {
    return apiRequest(`/samuha/${id}/status/`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    })
  },
  updateMemberStatus: async (membershipId, status) => {
    return apiRequest(`/samuha/members/${membershipId}/status/`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    })
  },
  getSettings: async () => {
    return apiRequest('/samuha/settings/', { method: 'GET' })
  },
  updateSettings: async (settingsData) => {
    return apiRequest('/samuha/settings/', {
      method: 'PATCH',
      body: JSON.stringify(settingsData)
    })
  },
  getSamuhaDetails: async () => {
    return apiRequest('/samuha/details/', { method: 'GET' })
  },
  checkSamuhaCode: async (code, role) => {
    return apiRequest(`/samuha/check-code/?code=${code}&role=${role}`, { method: 'GET' })
  },
  getExitPreview: async (membershipId) => {
    return apiRequest(`/samuha/members/${membershipId}/exit-preview/`, { method: 'GET' })
  },
  submitExitRequest: async (reason) => {
    return apiRequest('/samuha/exit-requests/', {
      method: 'POST',
      body: JSON.stringify({ reason })
    })
  },
  getExitRequests: async () => {
    return apiRequest('/samuha/exit-requests/', { method: 'GET' })
  },
  processExitRequest: async (id, status) => {
    return apiRequest(`/samuha/exit-requests/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    })
  },
  updateMemberRole: async (membershipId, role) => {
    return apiRequest(`/samuha/members/${membershipId}/role/`, {
      method: 'PATCH',
      body: JSON.stringify({ role })
    })
  },
  transferLeadership: async (successorId, email = null, citizenshipNo = null) => {
    return apiRequest('/samuha/leadership-transfer/', {
      method: 'POST',
      body: JSON.stringify({ 
        successor_id: successorId,
        email,
        citizenship_no: citizenshipNo 
      })
    })
  }
}


// Attendance API functions
export const attendanceAPI = {
  calculateMeetingFee: async () => {
    return apiRequest('/subscriptions/calculate-meeting-fee/', { method: 'GET' })
  },
  getMeetings: async () => {
    return apiRequest('/attendance/meetings/', { method: 'GET' })
  },
  createMeeting: async (meetingData) => {
    return apiRequest('/attendance/meetings/', {
      method: 'POST',
      body: JSON.stringify(meetingData)
    })
  },
  getAttendance: async (meetingId) => {
    return apiRequest(`/attendance/meetings/${meetingId}/attendance/`, { method: 'GET' })
  },
  saveAttendance: async (meetingId, attendance) => {
    return apiRequest(`/attendance/meetings/${meetingId}/attendance/`, {
      method: 'POST',
      body: JSON.stringify({ attendance })
    })
  },
  endMeeting: async (meetingId, presentUserIds) => {
    return apiRequest(`/attendance/meetings/${meetingId}/end/`, {
      method: 'POST',
      body: JSON.stringify({ present_user_ids: presentUserIds })
    })
  },
  startMeeting: async (meetingId) => {
    return apiRequest(`/attendance/meetings/${meetingId}/start/`, {
      method: 'POST'
    })
  },
  markPresent: async (meetingId) => {
    return apiRequest(`/attendance/meetings/${meetingId}/mark-present/`, {
      method: 'POST'
    })
  },
  deleteMeeting: async (meetingId) => {
    return apiRequest(`/attendance/meetings/${meetingId}/`, {
      method: 'DELETE',
    })
  }
}

// Announcements API functions
export const announcementsAPI = {
  list: async () => {
    const response = await apiRequest('/announcements/', {
      method: 'GET',
    })
    return response
  },
  create: async (formData) => {
    const response = await apiRequest('/announcements/', {
      method: 'POST',
      body: JSON.stringify(formData),
    })
    return response
  },
  update: async (id, formData) => {
    const response = await apiRequest(`/announcements/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(formData),
    })
    return response
  },
  delete: async (id) => {
    const response = await apiRequest(`/announcements/${id}/`, {
      method: 'DELETE',
    })
    return response
  },
}

// Ledger API functions
export const ledgerAPI = {
  getTransactions: async (params = {}) => {
    let query = new URLSearchParams(params).toString();
    const endpoint = query ? `/ledger/transactions/?${query}` : '/ledger/transactions/'
    return apiRequest(endpoint, { method: 'GET' })
  },
  recordTransaction: async (txData) => {
    return apiRequest('/ledger/transactions/', {
      method: 'POST',
      body: JSON.stringify(txData)
    })
  },
  deleteTransaction: async (txId) => {
    return apiRequest(`/ledger/transactions/${txId}/`, {
      method: 'DELETE',
    })
  },
  getLoans: async () => {
    return apiRequest('/ledger/loans/', { method: 'GET' })
  },
  requestLoan: async (loanData) => {
    return apiRequest('/ledger/loans/', {
      method: 'POST',
      body: JSON.stringify(loanData)
    })
  },
  manageLoan: async (loanId, action) => {
    const endpoint = action === 'disburse' 
      ? `/ledger/loans/${loanId}/disburse/` 
      : `/ledger/loans/${loanId}/manage/`;
    return apiRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify({ action })
    })
  },
  predictLoan: async (params) => {
    let endpoint = '/ledger/loans/predict/';
    const queryParams = new URLSearchParams();
    
    if (params.loan_id) queryParams.append('loan_id', params.loan_id);
    if (params.amount) queryParams.append('amount', params.amount);
    if (params.income) queryParams.append('income', params.income);
    if (params.dti) queryParams.append('dti', params.dti);
    if (params.emp_len) queryParams.append('emp_len', params.emp_len);
    
    const queryString = queryParams.toString();
    if (queryString) endpoint += `?${queryString}`;
    
    return apiRequest(endpoint, { method: 'GET' });
  },
  repayLoan: async (loanId, repaymentData) => {
    return apiRequest(`/ledger/loans/${loanId}/repay/`, {
      method: 'POST',
      body: JSON.stringify(repaymentData)
    })
  },


  recordBatchSavings: async (savingsData) => {
    return apiRequest('/ledger/transactions/batch-savings/', {
      method: 'POST',
      body: JSON.stringify(savingsData)
    })
  },
  getStats: async () => {
    return apiRequest('/ledger/transactions/stats/', { method: 'GET' })
  },
  getSamuhaQR: async (samuhaId, amount = null, type = 'saving') => {
    let endpoint = `/ledger/samuha/${samuhaId}/qr/`
    if (amount || type) {
      const params = new URLSearchParams()
      if (amount) params.append('amount', amount)
      if (type) params.append('type', type)
      endpoint += `?${params.toString()}`
    }
    return apiRequest(endpoint, { method: 'GET' })
  },
  verifyPayment: async (paymentData) => {
    return apiRequest('/ledger/payments/verify/', {
      method: 'POST',
      body: JSON.stringify(paymentData)
    })
  },
  distributeFunds: async () => {
    return apiRequest('/ledger/transactions/distribute-funds/', { method: 'POST' })
  },
  dissolveSamuha: async () => {
    return apiRequest('/ledger/transactions/dissolve-samuha/', { method: 'POST' })
  },
  payoutReport: async () => {
    return apiRequest('/ledger/transactions/payout-report/', { method: 'GET' })
  }
}

export const documentsAPI = {
  getDocuments: async () => {
    return apiRequest('/documents/files/', { method: 'GET' })
  },
  uploadDocument: async (formData) => {
    const token = localStorage.getItem('access_token')
    const response = await fetch(`${API_BASE_URL}/documents/files/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    })
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(JSON.stringify(errorData))
    }
    return { data: await response.json() }
  },
  deleteDocument: async (id) => {
    return apiRequest(`/documents/files/${id}/`, { method: 'DELETE' })
  },
  getMeetingReport: async (meetingId) => {
    return apiRequest(`/documents/meetings/${meetingId}/report/`, { method: 'GET' })
  },
  getLatestPayout: async () => {
    return apiRequest('/documents/files/latest-payout/', { method: 'GET' })
  }
}


// Chat API functions
export const chatAPI = {
  getMessages: async () => {
    return apiRequest('/chat/messages/', { method: 'GET' })
  },
  sendMessage: async (contentOrFormData, type = 'text') => {
    const isFormData = contentOrFormData instanceof FormData
    if (isFormData) {
        if (type !== 'text') contentOrFormData.append('type', type);
        return apiRequest('/chat/messages/', {
            method: 'POST',
            body: contentOrFormData
        })
    }
    return apiRequest('/chat/messages/', {
      method: 'POST',
      body: JSON.stringify({ content: contentOrFormData, type })
    })
  },
  askSamuhaAI: async (prompt) => {
    return apiRequest('/chat/ai/', {
      method: 'POST',
      body: JSON.stringify({ prompt })
    })
  },
  startCall: async (roomID) => {
    return apiRequest('/chat/start-call/', {
      method: 'POST',
      body: JSON.stringify({ roomID })
    })
  }
}


// Notification API functions
export const notificationsAPI = {
  getNotifications: async () => {
    return apiRequest('/notifications/', { method: 'GET' })
  },
  markAsRead: async (id) => {
    return apiRequest(`/notifications/${id}/mark-read/`, { method: 'POST' })
  },
  markAllAsRead: async () => {
    return apiRequest('/notifications/mark-all-read/', { method: 'PATCH' })
  }
}

// Subscriptions API functions
export const subscriptionsAPI = {
  getCurrentSubscription: async () => {
    return apiRequest('/subscriptions/status/', { method: 'GET' })
  },
  getAvailablePlans: async () => {
    return apiRequest('/subscriptions/plans/', { method: 'GET' })
  },
  upgradeSamuha: async (planId, paymentToken) => {
    return apiRequest('/subscriptions/upgrade/', {
      method: 'POST',
      body: JSON.stringify({ plan_id: planId, token: paymentToken })
    })
  },
  initiateEsewa: async (planId) => {
    return apiRequest('/subscriptions/esewa/initiate/', {
      method: 'POST',
      body: JSON.stringify({ plan_id: planId })
    })
  },
  verifyEsewa: async (encodedData) => {
    return apiRequest('/subscriptions/esewa/verify/', {
      method: 'POST',
      body: JSON.stringify({ data: encodedData })
    })
  },
  calculateMeetingFee: async () => {
    return apiRequest('/subscriptions/calculate-meeting-fee/', { method: 'GET' })
  },
  initiateMeetingEsewa: async (amount) => {
    return apiRequest('/subscriptions/esewa/initiate-meeting/', {
      method: 'POST',
      body: JSON.stringify({ amount })
    })
  }
}

export default apiRequest


