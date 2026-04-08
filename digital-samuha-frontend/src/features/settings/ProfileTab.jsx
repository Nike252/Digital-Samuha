import React from 'react';
import Button from '../../components/ui/Button';
import FormInput from '../../components/ui/FormInput';

const ProfileTab = ({ profileData, handleProfileChange, handleProfileUpdate, loading, isDark }) => {
  return (
    <div className={`rounded-3xl border shadow-sm overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500 ${
      isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-100'
    }`}>
      <div className={`p-8 border-b ${
        isDark ? 'border-white/10 bg-gradient-to-r from-blue-500/10 to-transparent' : 'border-gray-50 bg-gradient-to-r from-blue-50/50 to-transparent'
      }`}>
        <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Personal Data</h3>
        <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>This information is visible to other members of your Samuha.</p>
      </div>
      <form onSubmit={handleProfileUpdate} className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput
            label="First Name"
            name="first_name"
            value={profileData.first_name}
            onChange={handleProfileChange}
            placeholder="Indira"
            isDark={isDark}
            required
          />
          <FormInput
            label="Last Name"
            name="last_name"
            value={profileData.last_name}
            onChange={handleProfileChange}
            placeholder="Niroula"
            isDark={isDark}
            required
          />
        </div>
        <FormInput
          label="Email Address"
          name="email"
          type="email"
          value={profileData.email}
          onChange={handleProfileChange}
          placeholder="indira@example.com"
          isDark={isDark}
        />
        <div className="relative">
          <FormInput
            label="Phone Number"
            name="phone"
            type="tel"
            value={profileData.phone}
            onChange={handleProfileChange}
            isDark={isDark}
            required
          />
          <div className={`absolute right-4 bottom-2.5 px-2 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider border ${
            isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
          }`}>
            Verified
          </div>
        </div>
        <div className="pt-4 flex justify-end">
          <Button type="submit" variant="primary" disabled={loading} className={`px-8 shadow-lg ${isDark ? 'shadow-indigo-900/20' : 'shadow-indigo-100'}`}>
            {loading ? 'Updating...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProfileTab;
