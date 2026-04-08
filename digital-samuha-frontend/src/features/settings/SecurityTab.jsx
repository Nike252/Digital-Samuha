import React from 'react';
import { Lock } from 'lucide-react';
import Button from '../../components/ui/Button';
import FormInput from '../../components/ui/FormInput';

const SecurityTab = ({ 
  user, 
  passwordData, 
  handlePasswordChange, 
  handlePasswordUpdate, 
  loading, 
  isDark 
}) => {
  return (
    <div className={`rounded-3xl border shadow-sm overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500 ${
      isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-100'
    }`}>
      <div className={`p-8 border-b ${
        isDark ? 'border-white/10 bg-gradient-to-r from-indigo-500/10 to-transparent' : 'border-gray-50 bg-gradient-to-r from-indigo-50/50 to-transparent'
      }`}>
        <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Security Credentials</h3>
        <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Keep your account secure by using a strong password.</p>
      </div>
      <form onSubmit={handlePasswordUpdate} className="p-8 space-y-6">
        <div className={`p-6 rounded-2xl border flex items-center justify-between ${
          isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50/50 border-gray-100'
        }`}>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl shadow-sm ${isDark ? 'bg-white/5' : 'bg-white'}`}>
              <Lock size={20} className="text-indigo-600" />
            </div>
            <div>
              <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Login ID</p>
              <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Your phone number is your identifier</p>
            </div>
          </div>
          <span className={`text-sm font-mono font-bold ${isDark ? 'text-indigo-400' : 'text-gray-600'}`}>{user?.phone}</span>
        </div>

        <div className="space-y-4">
          <FormInput
            label="Current Password"
            name="current_password"
            type="password"
            value={passwordData.current_password}
            onChange={handlePasswordChange}
            placeholder="••••••••"
            isDark={isDark}
            required
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              label="New Password"
              name="new_password"
              type="password"
              value={passwordData.new_password}
              onChange={handlePasswordChange}
              placeholder="Min 8 characters"
              isDark={isDark}
              required
            />
            <FormInput
              label="Confirm Password"
              name="confirm_new_password"
              type="password"
              value={passwordData.confirm_new_password}
              onChange={handlePasswordChange}
              placeholder="Repeat new password"
              isDark={isDark}
              required
            />
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <Button type="submit" variant="primary" disabled={loading} className={`px-8 shadow-lg ${isDark ? 'shadow-indigo-900/20' : 'shadow-indigo-100'}`}>
            {loading ? 'Updating...' : 'Update Password'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SecurityTab;
