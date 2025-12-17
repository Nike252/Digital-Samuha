import { useState } from 'react';
import { samuhaAPI } from '../../utils/api';

const useSamuhaRegistration = (navigate) => {
  const [formData, setFormData] = useState({
    samuha_name: '',
    province: '',
    district: '',
    municipality: '',
    ward_number: '',
    adhakshya_full_name: '',
    adhakshya_phone: '',
    adhakshya_email: '',
    is_registered_with_government: false,
    proof_document: null
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [successData, setSuccessData] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'file' ? files[0] : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.samuha_name.trim()) newErrors.samuha_name = 'Samuha name is required';
    if (!formData.province.trim()) newErrors.province = 'Province is required';
    if (!formData.district.trim()) newErrors.district = 'District is required';
    if (!formData.municipality.trim()) newErrors.municipality = 'Municipality is required';
    if (!formData.ward_number.trim()) newErrors.ward_number = 'Ward number is required';
    if (!formData.adhakshya_full_name.trim()) newErrors.adhakshya_full_name = 'Adhakshya full name is required';
    if (!formData.adhakshya_phone.trim()) newErrors.adhakshya_phone = 'Adhakshya phone is required';
    if (!formData.adhakshya_email.trim()) {
      newErrors.adhakshya_email = 'Adhakshya email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.adhakshya_email)) {
      newErrors.adhakshya_email = 'Invalid email format';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('samuha_name', formData.samuha_name);
      formDataToSend.append('province', formData.province);
      formDataToSend.append('district', formData.district);
      formDataToSend.append('municipality', formData.municipality);
      formDataToSend.append('ward_number', formData.ward_number);
      formDataToSend.append('adhakshya_full_name', formData.adhakshya_full_name);
      formDataToSend.append('adhakshya_phone', formData.adhakshya_phone);
      formDataToSend.append('adhakshya_email', formData.adhakshya_email);
      formDataToSend.append('is_registered_with_government', formData.is_registered_with_government);
      
      if (formData.proof_document) {
        formDataToSend.append('proof_document', formData.proof_document);
      }

      const response = await samuhaAPI.register(formDataToSend);
      
      setSuccessData({
        samuha_name: response.data.samuha_name,
        samuha_code: response.data.samuha_code,
        status: response.data.status
      });
      
      setFormData({
        samuha_name: '', province: '', district: '', municipality: '', ward_number: '',
        adhakshya_full_name: '', adhakshya_phone: '', adhakshya_email: '',
        is_registered_with_government: false, proof_document: null
      });
      setErrors({});
    } catch (error) {
      console.error('Registration error:', error);
      try {
        const errorData = JSON.parse(error.message);
        if (typeof errorData === 'object') {
          const backendErrors = {};
          Object.keys(errorData).forEach(key => {
            backendErrors[key] = Array.isArray(errorData[key]) ? errorData[key][0] : errorData[key];
          });
          setErrors(backendErrors);
          setSubmitError('Please fix the errors below');
        } else {
          setSubmitError(error.message);
        }
      } catch {
        setSubmitError(error.message || 'Failed to submit registration. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData, errors, isSubmitting, submitError, successData,
    handleChange, handleSubmit
  };
};

export default useSamuhaRegistration;
