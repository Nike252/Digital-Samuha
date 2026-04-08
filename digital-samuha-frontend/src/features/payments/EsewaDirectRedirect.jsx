import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const EsewaDirectRedirect = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const data = location.state;
    
    if (!data || !data.amount) {
      navigate('/dashboard');
      return;
    }

    // Auto trigger eSewa form post
    const form = document.createElement('form');
    form.setAttribute('method', 'POST');
    form.setAttribute('action', 'https://rc-epay.esewa.com.np/api/epay/main/v2/form');

    // Prefer officially generated values from the backend
    const uuid = data.transaction_uuid || `${data.type}-${Date.now()}`;
    // E-Sewa requires the amount passed in the form to EXACTLY match the amount the signature was hashed with.
    // If backend provides a normalized total_amount string passing that, use it. Otherwise, use what was passed.
    const amountStr = data.total_amount || data.amount.toString();
    
    // In a real scenario, this signature must be generated on the backend.
    const hash = data.signature || btoa(`total_amount=${amountStr},transaction_uuid=${uuid},product_code=EPAYTEST`);

    const inputs = {
      'amount': amountStr,
      'tax_amount': '0',
      'total_amount': amountStr,
      'transaction_uuid': uuid,
      'product_code': 'EPAYTEST',
      'product_service_charge': '0',
      'product_delivery_charge': '0',
      'success_url': `${window.location.origin}/payment-success`,
      'failure_url': `${window.location.origin}/dashboard?payment=failed`,
      'signed_field_names': 'total_amount,transaction_uuid,product_code',
      'signature': hash
    };

    for (const [key, value] of Object.entries(inputs)) {
       const hiddenField = document.createElement('input');
       hiddenField.setAttribute('type', 'hidden');
       hiddenField.setAttribute('name', key);
       hiddenField.setAttribute('value', value);
       form.appendChild(hiddenField);
    }

    document.body.appendChild(form);
    form.submit();
    
  }, [location, navigate]);

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50">
       <img src="https://esewa.com.np/common/images/esewa_logo.png" alt="eSewa" className="h-16 mb-8 animate-pulse" />
       <div className="w-12 h-12 border-4 border-[#60bb46] border-t-transparent rounded-full animate-spin" />
       <p className="mt-6 text-gray-500 font-bold tracking-widest uppercase text-sm">Redirecting to Secure Gateway</p>
    </div>
  );
};

export default EsewaDirectRedirect;
