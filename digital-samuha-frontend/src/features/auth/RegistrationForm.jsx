import React from 'react';
import { Button, FormInput, FormFileInput, FormCheckbox } from '../../components/ui';
import { NEPAL_DATA } from '../../utils/nepalData';

const RegistrationForm = ({ 
  formData, 
  handleChange, 
  handleSubmit, 
  errors, 
  submitError, 
  isSubmitting, 
  onCancel 
}) => {
  return (
    <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-gray-100">
       <div className="bg-gray-50/50 px-8 py-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Application Form</h3>
            <button onClick={onCancel} className="text-sm text-gray-500 hover:text-indigo-600 font-medium transition-colors">
              Cancel & Exit
            </button>
       </div>

       <div className="p-8 md:p-10">
          {submitError && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <div className="text-red-500 mt-0.5">⚠️</div>
              <div className="text-sm text-red-700 font-medium leading-relaxed">{submitError}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="space-y-6">
               <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">1</div>
                  <h2 className="text-xl font-bold text-gray-900">Samuha Details</h2>
               </div>
               
               <div className="pl-0 sm:pl-11 space-y-5">
                 <FormInput
                    label="Samuha Name"
                    name="samuha_name"
                    value={formData.samuha_name}
                    onChange={handleChange}
                    error={errors.samuha_name}
                    placeholder="e.g.  Shree Pashupati Mahila Samuha"
                    required
                    className="text-lg"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormInput 
                      label="Province" 
                      name="province" 
                      type="select"
                      value={formData.province} 
                      onChange={handleChange} 
                      error={errors.province} 
                      placeholder="Select Province" 
                      options={NEPAL_DATA.provinces}
                      required 
                    />
                    <FormInput 
                      label="District" 
                      name="district" 
                      type="select"
                      value={formData.district} 
                      onChange={handleChange} 
                      error={errors.district} 
                      placeholder="Select District" 
                      options={formData.province ? NEPAL_DATA.districts[formData.province] : []}
                      disabled={!formData.province}
                      required 
                    />
                    <FormInput 
                      label="Municipality" 
                      name="municipality" 
                      type={formData.district && NEPAL_DATA.municipalities[formData.district] ? "select" : "text"}
                      value={formData.municipality} 
                      onChange={handleChange} 
                      error={errors.municipality} 
                      placeholder={formData.district && NEPAL_DATA.municipalities[formData.district] ? "Select Municipality" : "e.g. Kathmandu Metro"} 
                      options={formData.district ? (NEPAL_DATA.municipalities[formData.district] || []) : []}
                      disabled={!formData.district}
                      required 
                    />
                    <FormInput 
                      label="Ward No." 
                      name="ward_number" 
                      type="select"
                      value={formData.ward_number} 
                      onChange={handleChange} 
                      error={errors.ward_number} 
                      placeholder="Select Ward" 
                      options={NEPAL_DATA.wardNumbers}
                      required 
                    />
                  </div>
               </div>
            </div>

            <div className="border-t border-gray-100"></div>

            <div className="space-y-6">
               <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">2</div>
                  <h2 className="text-xl font-bold text-gray-900">Adhakshya (Chairperson)</h2>
               </div>
               <div className="pl-11 space-y-5">
                  <FormInput label="Full Name" name="adhakshya_full_name" value={formData.adhakshya_full_name} onChange={handleChange} error={errors.adhakshya_full_name} placeholder="e.g. Ram Bahadur Thapa" required />
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <FormInput label="Phone Number" name="adhakshya_phone" type="tel" value={formData.adhakshya_phone} onChange={handleChange} error={errors.adhakshya_phone} placeholder="98XXXXXXXX" required />
                      <FormInput label="Email Address" name="adhakshya_email" type="email" value={formData.adhakshya_email} onChange={handleChange} error={errors.adhakshya_email} placeholder="ram@example.com" required />
                   </div>
                   <div className="pt-4 space-y-5">
                      <FormInput label="Citizenship Number" name="adhakshya_citizenship_no" value={formData.adhakshya_citizenship_no} onChange={handleChange} error={errors.adhakshya_citizenship_no} placeholder="XX-XX-XX-XXXXX" required />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <FormFileInput
                          label="Citizenship Photo (Front)"
                          name="adhakshya_citizenship_front"
                          accept=".jpg,.jpeg,.png"
                          onChange={handleChange}
                          error={errors.adhakshya_citizenship_front}
                          required
                          helperText="Clear photo of the front side"
                        />
                        <FormFileInput
                          label="Citizenship Photo (Back)"
                          name="adhakshya_citizenship_back"
                          accept=".jpg,.jpeg,.png"
                          onChange={handleChange}
                          error={errors.adhakshya_citizenship_back}
                          required
                          helperText="Clear photo of the back side"
                        />
                      </div>
                   </div>
                </div>
            </div>

            <div className="border-t border-gray-100"></div>

            <div className="space-y-6">
               <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">3</div>
                  <h2 className="text-xl font-bold text-gray-900">Verification</h2>
               </div>
               <div className="pl-0 sm:pl-11 space-y-6">
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <FormCheckbox
                      label={<span className="font-medium text-gray-800">Is this Samuha registered with the local government?</span>}
                      name="is_registered_with_government"
                      checked={formData.is_registered_with_government}
                      onChange={handleChange}
                    />
                  </div>
                  <FormFileInput
                    label="Upload Supporting Document (Optional)"
                    name="proof_document"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleChange}
                    value={formData.proof_document}
                    helperText="Upload registration certificate or minutes (minut) of the first meeting."
                  />
               </div>
            </div>

            <div className="pt-6">
              <Button type="submit" variant="primary" size="large" disabled={isSubmitting} className="w-full py-4 text-lg font-bold shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transform transition-all hover:-translate-y-1">
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                    Submitting Registration...
                  </div>
                ) : 'Submit Samuha Registration'}
              </Button>
              <p className="text-center text-xs text-gray-400 mt-4">By submitting, you agree to Digital Samuha's Terms of Service and Privacy Policy.</p>
            </div>
          </form>
       </div>
    </div>
  );
};

export default RegistrationForm;
