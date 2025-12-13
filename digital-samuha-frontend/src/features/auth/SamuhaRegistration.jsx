import React from 'react';
import { useNavigate } from 'react-router-dom';
import useSamuhaRegistration from './useSamuhaRegistration';
import SuccessState from './SuccessState';
import RegistrationForm from './RegistrationForm';

const SamuhaRegistration = () => {
  const navigate = useNavigate();
  const {
    formData, errors, isSubmitting, submitError, successData,
    handleChange, handleSubmit
  } = useSamuhaRegistration(navigate);

  return (
    <div className="min-h-screen bg-gray-50/80 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-sm mb-6 text-indigo-600">
             <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M16 12L12 16L8 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 8V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
             </svg>
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Register a Samuha</h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">Start your digital community journey. Fill in the details below to get your Samuha verified and running.</p>
        </div>

        {successData ? (
          <SuccessState successData={successData} onNavigate={navigate} />
        ) : (
          <RegistrationForm {...{ formData, handleChange, handleSubmit, errors, submitError, isSubmitting, onCancel: () => navigate('/') }} />
        )}
      </div>
    </div>
  );
};

export default SamuhaRegistration;
