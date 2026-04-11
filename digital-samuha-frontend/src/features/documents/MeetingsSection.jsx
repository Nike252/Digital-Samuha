import React, { useState, useMemo } from 'react';
import { History, Users, ChevronRight, CalendarDays, ChevronLeft } from 'lucide-react';
import { toBS, getBSMonthYear, MONTHS_BS, getCurrentBSDate } from '../../utils/nepaliDateUtils';

const MeetingsSection = ({ meetings, viewReport }) => {
  const currentBS = getCurrentBSDate();
  const [selectedYear, setSelectedYear] = useState(currentBS.year);
  const [selectedMonth, setSelectedMonth] = useState(null); // null = show all months

  // Get unique BS years from meetings data
  const availableYears = useMemo(() => {
    const years = [...new Set(meetings.map(m => getBSMonthYear(m.date).year))];
    years.sort((a, b) => b - a);
    if (years.length === 0) years.push(currentBS.year);
    return years;
  }, [meetings]);

  // Filter meetings by selected BS year + month
  const filteredMeetings = useMemo(() => {
    return meetings.filter(m => {
      const bs = getBSMonthYear(m.date);
      if (bs.year !== selectedYear) return false;
      if (selectedMonth !== null && bs.month !== selectedMonth) return false;
      return true;
    });
  }, [meetings, selectedYear, selectedMonth]);

  // Get BS months that have meetings in the selected year (for highlighting)
  const activeMonths = useMemo(() => {
    const set = new Set();
    meetings.forEach(m => {
      const bs = getBSMonthYear(m.date);
      if (bs.year === selectedYear) set.add(bs.month);
    });
    return set;
  }, [meetings, selectedYear]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Premium Filter Section with Background Mesh */}
      <div className="relative overflow-hidden rounded-[40px] border border-white/40 shadow-2xl p-8 group">
        {/* Background Mesh Gradients */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-400/10 blur-[100px] rounded-full group-hover:bg-indigo-400/20 transition-colors duration-1000" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-amber-400/10 blur-[100px] rounded-full group-hover:bg-amber-400/20 transition-colors duration-1000" />
        
        <div className="relative z-10 space-y-8">
          {/* Header & Year Selector Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/80 backdrop-blur-xl rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm border border-white">
                <CalendarDays size={24} />
              </div>
              <div>
                <h3 className="text-sm font-black text-gray-500 uppercase tracking-[0.2em]">Filter Archive</h3>
                <p className="text-xs font-bold text-gray-400 mt-0.5">Explore by Year & Month (BS)</p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white/60 backdrop-blur-md p-1.5 rounded-[22px] border border-white/80 shadow-inner">
              <button 
                onClick={() => { setSelectedYear(y => y - 1); setSelectedMonth(null); }}
                className="w-11 h-11 rounded-[18px] flex items-center justify-center text-gray-400 hover:bg-white hover:text-indigo-600 hover:shadow-md hover:-translate-x-0.5 transition-all active:scale-95 border border-transparent hover:border-gray-50"
                title="Previous Year"
              >
                <ChevronLeft size={22} />
              </button>
              <div className="flex flex-col items-center px-6 min-w-[120px]">
                <span className="text-2xl font-black text-gray-900 tracking-tighter leading-none">{selectedYear}</span>
                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-1">Nepali Era</span>
              </div>
              <button 
                onClick={() => { setSelectedYear(y => y + 1); setSelectedMonth(null); }}
                className="w-11 h-11 rounded-[18px] flex items-center justify-center text-gray-400 hover:bg-white hover:text-indigo-600 hover:shadow-md hover:translate-x-0.5 transition-all active:scale-95 border border-transparent hover:border-gray-50"
                title="Next Year"
              >
                <ChevronRight size={22} />
              </button>
            </div>
          </div>

          {/* Month Grid Overhaul */}
          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-3">
            <button
              onClick={() => setSelectedMonth(null)}
              className={`py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border ${
                selectedMonth === null
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105'
                  : 'bg-white/50 border-white/80 text-gray-400 hover:bg-white hover:text-indigo-600 hover:border-indigo-100 hover:shadow-sm'
              }`}
            >
              All
            </button>
            {MONTHS_BS.map((label, idx) => {
              const hasData = activeMonths.has(idx);
              const isSelected = selectedMonth === idx;
              return (
                <button
                  key={label}
                  onClick={() => setSelectedMonth(idx)}
                  className={`py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all relative border group/btn ${
                    isSelected
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105 z-20'
                      : hasData
                        ? 'bg-white border-indigo-50 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 shadow-sm'
                        : 'bg-white/30 border-transparent text-gray-300 hover:bg-white/50 hover:text-gray-400'
                  }`}
                >
                  {label}
                  {hasData && !isSelected && (
                    <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
                  )}
                  {isSelected && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-white/40 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between px-2">
        <p className="text-sm font-bold text-gray-400">
          Showing <span className="text-gray-900">{filteredMeetings.length}</span> meeting{filteredMeetings.length !== 1 ? 's' : ''} 
          {selectedMonth !== null ? ` in ${MONTHS_BS[selectedMonth]} ${selectedYear}` : ` in ${selectedYear} BS`}
        </p>
        {selectedMonth !== null && (
          <button 
            onClick={() => setSelectedMonth(null)} 
            className="text-xs font-black text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            Clear month filter
          </button>
        )}
      </div>

      {/* Meeting Cards Grid Overhaul */}
      {filteredMeetings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredMeetings.map((meeting) => (
            <div 
              key={meeting.id} 
              className="group relative bg-white rounded-[36px] border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-2 transition-all duration-500 overflow-hidden"
            >
              {/* Card Surface Mesh */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              
              <div className="p-8 pb-32"> {/* Increased bottom padding for the glass footer */}
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white group-hover:rotate-6 transition-all duration-500 shadow-sm">
                    <History size={28} />
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100">
                      Archive Record
                    </span>
                    <span className="text-[10px] font-bold text-gray-400">
                      {toBS(meeting.date, 'short')}
                    </span>
                  </div>
                </div>

                <h4 className="text-2xl font-black text-gray-900 mb-3 tracking-tight group-hover:text-indigo-600 transition-colors">
                  {meeting.title}
                </h4>
                <p className="text-sm text-gray-500 font-medium leading-relaxed mb-6 line-clamp-2">
                  {meeting.description || "Official session minutes, attendance logs, and financial records for the community Samuha."}
                </p>
              </div>

              {/* Glassmorphic Action Footer */}
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gray-50/50 backdrop-blur-md border-t border-white/50 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                    <Users size={14} className="text-gray-400" />
                  </div>
                  <span className="text-xs font-black text-gray-400 uppercase tracking-wider">Attendance OK</span>
                </div>
                <button 
                  onClick={() => viewReport(meeting.id)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-2xl font-black text-xs shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-xl hover:-translate-y-0.5 transition-all group/btn"
                >
                  View Details
                  <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-gray-50/50 rounded-[32px] border-2 border-dashed border-gray-100">
          <CalendarDays size={48} className="text-gray-200 mb-4" />
          <p className="text-lg font-black text-gray-300">No meetings found</p>
          <p className="text-sm font-medium text-gray-300 mt-1">
            {selectedMonth !== null 
              ? `No meetings recorded in ${MONTHS_BS[selectedMonth]} ${selectedYear}`
              : `No meetings recorded in ${selectedYear} BS`
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default MeetingsSection;
