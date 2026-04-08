import { useState, useEffect } from 'react';
import { subscriptionsAPI } from '../../utils/api';

const usePaymentVerification = (searchParams) => {
  const [status, setStatus] = useState('verifying'); // verifying, success, failed
  
  useEffect(() => {
    const encodedData = searchParams.get('data');
    if (!encodedData) {
      setStatus('failed');
      return;
    }

    const verifyPayment = async () => {
      try {
        // Send the raw base64 encoded data to the backend for verification
        await subscriptionsAPI.verifyEsewa(encodedData);
        setStatus('success');
      } catch (err) {
        console.error("Payment verification failed", err);
        setStatus('failed');
      }
    };

    verifyPayment();
  }, [searchParams]);

  return { status };
};

export default usePaymentVerification;
