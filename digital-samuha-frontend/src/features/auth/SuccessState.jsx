import React from 'react';
import { Button } from '../../components/ui';

const SuccessState = ({ successData, onNavigate }) => {
  return (
    <div className="bg-white rounded-[2rem] shadow-xl p-8 md:p-12 text-center border border-indigo-50 animate-in fade-in zoom-in-95 duration-300">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Application Submitted!</h2>
        <p className="text-gray-600 mb-8 max-w-lg mx-auto leading-relaxed">
          Thank you for registering <strong>{successData.samuha_name}</strong>. We have received your application and it is now under review. 
          A confirmation email with your unique Samuha Code will be sent to your registered email address once the registration is approved.
        </p>

        <Button variant="primary" size="large" onClick={() => onNavigate('/')} className="px-12">
          OK
        </Button>
    </div>
  );
};

export default SuccessState;
