import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, FormInput, FormFileInput } from '../../components/ui';
import AuthLayout from '../../layouts/AuthLayout';
import { ArrowLeft } from 'lucide-react';
import useSignUp from './useSignUp';

const SignUp = ({ onBack, onSignUpSuccess }) => {
  const navigate = useNavigate();
  const {
    formData, errors, isSubmitting, submitError,
    handleChange, handleSubmit
  } = useSignUp(navigate, onSignUpSuccess);

  const backButton = (
    <button 
      onClick={() => onBack ? onBack() : navigate('/')} 
      className="p-2 -ml-2 text-gray-400 hover:text-gray-900 transition-colors flex items-center gap-1 group"
    >
      <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
      <span className="text-sm font-medium">Back</span>
    </button>
  );

  return (
    <AuthLayout 
      title="Create Account" 
      subtitle="Join your digital community today."
      backButton={backButton}
    >
      {submitError && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 font-medium">{submitError}</div>}
      <div className="mb-6 p-3 bg-blue-50 border border-blue-100 rounded-lg flex gap-3"><span className="text-xl">ℹ️</span><p className="text-sm text-blue-800 leading-relaxed">You need a valid <strong>Samuha Code</strong> from your admin to join.</p></div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
            <FormInput label="First Name" name="first_name" value={formData.first_name} onChange={handleChange} error={errors.first_name} placeholder="Ram" required />
            <FormInput label="Last Name" name="last_name" value={formData.last_name} onChange={handleChange} error={errors.last_name} placeholder="Bahadur" required />
        </div>
        <FormInput label="Phone Number" name="phone" type="tel" value={formData.phone} onChange={handleChange} error={errors.phone} placeholder="98XXXXXXXX" required />
        <div>
           <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
           <select name="role" value={formData.role} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none bg-white text-gray-700 sm:text-sm" required>
             <option value="">Select your role</option>
             <option value="adhakshya">Adhakshya (Admin)</option>
             <option value="co_adhakshya">Co-Adhakshya</option>
             <option value="member">Member</option>
           </select>
           {errors.role && <p className="text-xs text-red-500 mt-1">{errors.role}</p>}
           {formData.role === 'adhakshya' && (
             <div className="mt-2 text-xs text-indigo-600 bg-indigo-50 p-2 rounded-lg border border-indigo-100 flex items-start gap-2">
                <span>💡</span><p><strong>Creating a new Samuha?</strong> You need to <button type="button" onClick={() => window.location.hash = '#registration'} className="underline font-bold hover:text-indigo-800">Register your Samuha</button> first to get a code.</p>
             </div>
           )}
        </div>
         <div className="pt-2 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <label className="text-sm font-medium text-gray-700">Citizenship Verification</label>
              {formData.role === 'adhakshya' && formData.samuha_code && (
                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold animate-pulse">
                  AUTO-SYNC ACTIVE
                </span>
              )}
            </div>
            
            <FormInput 
              label="Citizenship Number" 
              name="citizenship_no" 
              value={formData.citizenship_no} 
              onChange={handleChange} 
              error={errors.citizenship_no} 
              placeholder="XX-XX-XX-XXXXX" 
              required={formData.role !== 'adhakshya'} 
            />
            
            <div className="grid grid-cols-2 gap-3">
                <FormFileInput
                    label="Citizenship (Front)"
                    name="citizenship_front"
                    accept=".jpg,.jpeg,.png"
                    onChange={handleChange}
                    error={errors.citizenship_front}
                    required={formData.role !== 'adhakshya'}
                    helperText={formData.role === 'adhakshya' ? "Optional: We have your photo from registration." : ""}
                />
                <FormFileInput
                    label="Citizenship (Back)"
                    name="citizenship_back"
                    accept=".jpg,.jpeg,.png"
                    onChange={handleChange}
                    error={errors.citizenship_back}
                    required={formData.role !== 'adhakshya'}
                    helperText={formData.role === 'adhakshya' ? "Optional: We have your photo from registration." : ""}
                />
            </div>
            
            {formData.role === 'adhakshya' && (
              <p className="text-[10px] text-gray-400 mt-1 italic">
                * Since you are the founding Adhakshya, we will automatically use the citizenship photos you provided during Samuha registration.
              </p>
            )}
         </div>
         <FormInput label="Samuha Code" name="samuha_code" value={formData.samuha_code} onChange={handleChange} error={errors.samuha_code} placeholder="e.g. SAMUHA-123" required />
        <div className="grid grid-cols-2 gap-3">
            <FormInput label="Password" name="password" type="password" value={formData.password} onChange={handleChange} error={errors.password} placeholder="Min 8 chars" required />
            <FormInput label="Confirm" name="confirm_password" type="password" value={formData.confirm_password} onChange={handleChange} error={errors.confirm_password} placeholder="Confirm" required />
        </div>
        <div className="pt-2">
            <Button type="submit" variant="primary" size="large" disabled={isSubmitting} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all hover:shadow-indigo-300 hover:-translate-y-0.5">{isSubmitting ? 'Creating Account...' : 'Sign Up'}</Button>
        </div>
      </form>
    </AuthLayout>
  );
};

export default SignUp;
