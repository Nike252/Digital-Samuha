import React from 'react';
import { Clock, Percent } from 'lucide-react';
import Button from '../../components/ui/Button';
import FormInput from '../../components/ui/FormInput';

const RulesTab = ({ 
  samuhaSettings, 
  handleSettingsChange, 
  handleSettingsUpdate, 
  setSamuhaSettings, 
  settingsLoading, 
  loading 
}) => {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="p-8 border-b border-gray-50 bg-gradient-to-r from-purple-50/50 to-transparent">
        <h3 className="text-xl font-bold text-gray-900">Samuha Governance</h3>
        <p className="text-sm text-gray-500 mt-1">Define the fundamental rules and financial policies for your organization.</p>
      </div>
      {settingsLoading ? (
        <div className="p-20 text-center text-gray-400">Loading regulations...</div>
      ) : (
        <form onSubmit={handleSettingsUpdate} className="p-8 space-y-8">
          <div className="space-y-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Clock size={16} className="text-purple-500" /> Meeting Schedule Type
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { id: 'weekly', label: 'Weekly', desc: 'Every week' },
                  { id: 'fixed_date', label: 'Fixed Date', desc: 'Specific day of month' },
                  { id: 'relative_weekday', label: 'Relative Day', desc: 'e.g. 1st Saturday' }
                ].map(type => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setSamuhaSettings(prev => ({ ...prev, meeting_schedule_type: type.id }))}
                    className={`p-4 text-left rounded-2xl border transition-all ${
                      samuhaSettings.meeting_schedule_type === type.id
                        ? 'bg-purple-50 border-purple-200 ring-2 ring-purple-100'
                        : 'bg-white border-gray-100 hover:border-purple-100'
                    }`}
                  >
                    <div className={`text-sm font-bold ${samuhaSettings.meeting_schedule_type === type.id ? 'text-purple-700' : 'text-gray-900'}`}>{type.label}</div>
                    <div className="text-[10px] text-gray-500 font-medium">{type.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {samuhaSettings.meeting_schedule_type === 'weekly' && (
              <div className="p-6 bg-gray-50/50 rounded-2xl border border-gray-100 space-y-4 animate-in zoom-in-95">
                <label className="text-sm font-bold text-gray-700">Select Weekday</label>
                <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                  {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setSamuhaSettings(prev => ({ ...prev, meeting_day: day }))}
                      className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                        samuhaSettings.meeting_day === day
                          ? 'bg-purple-600 border-purple-600 text-white shadow-md'
                          : 'bg-white border-gray-100 text-gray-500 hover:border-purple-200'
                      }`}
                    >
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {samuhaSettings.meeting_schedule_type === 'fixed_date' && (
              <div className="p-6 bg-gray-50/50 rounded-2xl border border-gray-100 flex flex-col md:flex-row items-center gap-6 animate-in zoom-in-95">
                <div className="flex-1">
                  <label className="text-sm font-bold text-gray-700 block mb-2">Nepali Month Date (1-32)</label>
                  <input
                    type="number"
                    min="1"
                    max="32"
                    value={samuhaSettings.meeting_day_numeric || ''}
                    onChange={(e) => setSamuhaSettings(prev => ({ ...prev, meeting_day_numeric: e.target.value }))}
                    placeholder="1"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-200 outline-none font-bold text-purple-600"
                  />
                </div>
                <div className="text-sm text-gray-500 font-medium bg-white p-4 rounded-xl border border-gray-100 shadow-sm italic">
                  The meeting will be held on the <span className="text-purple-600 font-bold">{samuhaSettings.meeting_day_numeric || 1}st/nd/th</span> of every month.
                </div>
              </div>
            )}

            {samuhaSettings.meeting_schedule_type === 'relative_weekday' && (
              <div className="p-6 bg-gray-50/50 rounded-2xl border border-gray-100 space-y-6 animate-in zoom-in-95">
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-3">Which occurrence?</label>
                  <div className="flex gap-2">
                    {['1st', '2nd', '3rd', '4th', 'Last'].map((opt, i) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setSamuhaSettings(prev => ({ ...prev, meeting_week_offset: i + 1 }))}
                        className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
                          (samuhaSettings.meeting_week_offset || 1) === (i + 1)
                            ? 'bg-purple-600 border-purple-600 text-white shadow-md'
                            : 'bg-white border-gray-100 text-gray-500 hover:border-purple-200'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-3">Which Weekday?</label>
                  <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                    {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => setSamuhaSettings(prev => ({ ...prev, meeting_day: day }))}
                        className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                          samuhaSettings.meeting_day === day
                            ? 'bg-purple-600 border-purple-600 text-white shadow-md'
                            : 'bg-white border-gray-100 text-gray-500 hover:border-purple-200'
                        }`}
                      >
                        {day.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
             <FormInput
              label="Meeting Frequency"
              name="meeting_frequency"
              value={samuhaSettings.meeting_frequency}
              onChange={handleSettingsChange}
              placeholder="e.g. Monthly"
            />
             <FormInput
               label="Default Meeting Time"
               name="default_meeting_time"
               type="time"
               value={samuhaSettings.default_meeting_time}
               onChange={handleSettingsChange}
               placeholder="10:00 AM"
             />
          </div>

          <div className="pt-6 border-t border-gray-50">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Fines & Penalties</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <FormInput
                  label="Absent Fine"
                  name="absent_fine"
                  type="number"
                  value={samuhaSettings.absent_fine}
                  onChange={handleSettingsChange}
                  placeholder="100.00"
                />
                <span className="absolute right-4 bottom-3 text-xs font-bold text-gray-400">NPR</span>
              </div>
              <div className="relative">
                <FormInput
                  label="Late Fine"
                  name="late_fine"
                  type="number"
                  value={samuhaSettings.late_fine}
                  onChange={handleSettingsChange}
                  placeholder="50.00"
                />
                <span className="absolute right-4 bottom-3 text-xs font-bold text-gray-400">NPR</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-50">
             <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Financial Policy</h4>
             <div className="space-y-4">
               {/* Loan Interest Rate */}
               <div className="p-6 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded-xl shadow-sm">
                      <Percent size={24} className="text-indigo-600" />
                    </div>
                    <div>
                       <p className="text-sm font-bold text-gray-900">Loan Interest Rate</p>
                       <p className="text-xs text-gray-500">Monthly interest on member loans</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                     <input 
                      type="number"
                      step="0.01"
                      name="loan_interest_rate"
                      value={samuhaSettings.loan_interest_rate || 0}
                      onChange={handleSettingsChange}
                      className="w-20 px-3 py-2 text-center font-bold text-indigo-600 bg-white border border-indigo-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                     />
                     <span className="font-bold text-indigo-400 text-sm">%</span>
                  </div>
               </div>

               {/* Standard Monthly Saving */}
               <div className="p-6 bg-emerald-50/50 rounded-2xl border border-emerald-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded-xl shadow-sm">
                      <div className="w-6 h-6 rounded-full border-2 border-emerald-600 flex items-center justify-center font-black text-xs text-emerald-600">Rs</div>
                    </div>
                    <div>
                       <p className="text-sm font-bold text-gray-900">Standard Monthly Saving</p>
                       <p className="text-xs text-gray-500">The fixed amount every member must contribute monthy</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                     <input 
                      type="number"
                      name="saving_amount"
                      value={samuhaSettings.saving_amount || 0}
                      onChange={handleSettingsChange}
                      className="w-24 px-3 py-2 text-center font-bold text-emerald-600 bg-white border border-emerald-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                     />
                     <span className="font-bold text-emerald-400 text-sm">NPR</span>
                  </div>
               </div>
             </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button type="submit" variant="primary" disabled={loading} className="px-8 shadow-lg shadow-purple-100 bg-purple-600 hover:bg-purple-700">
              {loading ? 'Saving...' : 'Apply Regulations'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default RulesTab;
