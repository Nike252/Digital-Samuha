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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Filter Bar */}
      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-6 space-y-5">
        
        {/* Year Selector */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 text-gray-400">
            <CalendarDays size={18} />
            <span className="text-xs font-black uppercase tracking-widest">Filter (BS)</span>
          </div>
          <div className="flex items-center gap-1 bg-gray-50/50 p-1 rounded-2xl border border-gray-100">
            <button 
              onClick={() => { setSelectedYear(y => y - 1); setSelectedMonth(null); }}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-500 hover:bg-white hover:text-indigo-600 hover:shadow-sm transition-all active:scale-90"
              title="Previous Year"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex items-center px-4 min-w-[100px] justify-center">
              <span className="text-xl font-black text-gray-900 tracking-tighter">{selectedYear}</span>
              <span className="text-[10px] font-black text-indigo-500 ml-1 mt-1">BS</span>
            </div>
            <button 
              onClick={() => { setSelectedYear(y => y + 1); setSelectedMonth(null); }}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-500 hover:bg-white hover:text-indigo-600 hover:shadow-sm transition-all active:scale-90"
              title="Next Year"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Quick Year Shortcuts (Only show if they have data and aren't the selected one) */}
          <div className="flex gap-1.5 flex-wrap ml-2">
            {availableYears.filter(y => y !== selectedYear).slice(0, 3).map(year => (
              <button
                key={year}
                onClick={() => { setSelectedYear(year); setSelectedMonth(null); }}
                className="px-4 py-1.5 rounded-xl text-[10px] font-black bg-gray-50 text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all uppercase tracking-widest"
              >
                {year}
              </button>
            ))}
          </div>
        </div>

        {/* Month Pills (Nepali months) */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedMonth(null)}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all ${
              selectedMonth === null
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                : 'bg-gray-50 text-gray-400 hover:bg-indigo-50 hover:text-indigo-600'
            }`}
          >
            All
          </button>
          {MONTHS_BS.map((label, idx) => {
            const hasData = activeMonths.has(idx);
            return (
              <button
                key={label}
                onClick={() => setSelectedMonth(idx)}
                className={`px-4 py-2 rounded-2xl text-xs font-black transition-all relative ${
                  selectedMonth === idx
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                    : hasData
                      ? 'bg-gray-50 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
                      : 'bg-gray-50/50 text-gray-300 hover:text-gray-400'
                }`}
                // Always allow clicking to show "No meetings" feedback
              >
                {label}
                {hasData && selectedMonth !== idx && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-indigo-500 rounded-full" />
                )}
              </button>
            );
          })}
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

      {/* Meeting Cards Grid */}
      {filteredMeetings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMeetings.map((meeting) => (
            <div key={meeting.id} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                  <History size={24} />
                </div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-full">
                  {toBS(meeting.date, 'short')}
                </span>
              </div>
              <h4 className="text-xl font-black text-gray-900 mb-2 truncate">{meeting.title}</h4>
              <p className="text-sm text-gray-500 font-medium mb-6 line-clamp-2">
                {meeting.description || "Official records and minutes for this session."}
              </p>
              <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                <div className="flex items-center gap-2 text-sm font-bold text-gray-400">
                  <Users size={16} />
                  <span>Attendance Logged</span>
                </div>
                <button 
                  onClick={() => viewReport(meeting.id)}
                  className="flex items-center gap-2 text-indigo-600 font-black text-sm hover:gap-3 transition-all"
                >
                  View Report
                  <ChevronRight size={18} />
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
