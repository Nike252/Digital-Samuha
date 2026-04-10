/**
 * Nepali Date Utility for Digital Samuha
 * Uses nepali-date-converter for accurate AD ↔ BS conversion
 */
import NepaliDateModule from 'nepali-date-converter';

// Handle both ESM default export patterns
const NepaliDate = NepaliDateModule.default || NepaliDateModule;

const MONTHS_BS = [
    "Baisakh", "Jestha", "Ashadh", "Shrawan", "Bhadra", "Ashwin",
    "Kartik", "Mangsir", "Poush", "Magh", "Falgun", "Chaitra"
];

/**
 * Convert an AD Date object to a BS date object
 */
export const adToBS = (adDate) => {
    try {
        const nepDate = NepaliDate.fromAD(adDate);
        const month0 = nepDate.getMonth(); // 0-indexed
        return {
            year: nepDate.getYear(),
            month: month0 + 1, // Convert to 1-indexed
            day: nepDate.getDate(),
            monthName: MONTHS_BS[month0]
        };
    } catch (e) {
        console.error("AD to BS conversion error:", e);
        return { year: 2082, month: 1, day: 1, monthName: "Baisakh" };
    }
};

/**
 * Get current Nepali Date info (live, not hardcoded)
 */
export const getCurrentBSDate = () => {
    return adToBS(new Date());
};

/**
 * Calculate the next meeting date based on Samuha rules
 */
export const getNextMeetingDate = (rules) => {
    if (!rules || !rules.meeting_schedule_type) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let nextADDate = null;

    if (rules.meeting_schedule_type === 'fixed_date') {
        // Fixed date of the BS month (e.g., 2nd of every month)
        const dayNumeric = parseInt(rules.meeting_day_numeric) || 1;
        const currentBS = getCurrentBSDate();
        
        let targetMonth = currentBS.month;
        let targetYear = currentBS.year;
        
        // If we're past the target day this month, go to next month
        if (currentBS.day > dayNumeric) {
            targetMonth += 1;
            if (targetMonth > 12) {
                targetMonth = 1;
                targetYear += 1;
            }
        }
        
        // Convert the BS target back to AD
        try {
            const targetNepDate = new NepaliDate(targetYear, targetMonth - 1, dayNumeric);
            nextADDate = targetNepDate.toJsDate();
        } catch (e) {
            nextADDate = new Date(today);
            nextADDate.setDate(today.getDate() + 7);
        }
        
        const bs = adToBS(nextADDate);
        return {
            bs: `${bs.monthName} ${bs.day}, ${bs.year}`,
            ad: nextADDate,
            weekday: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][nextADDate.getDay()]
        };

    } else if (rules.meeting_schedule_type === 'relative_weekday') {
        // e.g., 1st Saturday, 2nd Sunday, Last Saturday
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const targetDayIndex = days.indexOf(rules.meeting_day);
        const weekOffset = parseInt(rules.meeting_week_offset) || 1;
        
        const currentBS = getCurrentBSDate();
        let targetMonth = currentBS.month;
        let targetYear = currentBS.year;
        
        // Find the Nth occurrence of the target weekday in this BS month
        nextADDate = findNthWeekdayInBSMonth(targetYear, targetMonth, targetDayIndex, weekOffset);
        
        // If it's already past (but not today), try next month
        if (nextADDate < today) {
            targetMonth += 1;
            if (targetMonth > 12) {
                targetMonth = 1;
                targetYear += 1;
            }
            nextADDate = findNthWeekdayInBSMonth(targetYear, targetMonth, targetDayIndex, weekOffset);
        }
        
        const bs = adToBS(nextADDate);
        return {
            bs: `${bs.monthName} ${bs.day}, ${bs.year}`,
            ad: nextADDate,
            weekday: rules.meeting_day
        };

    } else {
        // Default: weekly logic — find next occurrence of the meeting_day
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const targetDay = days.indexOf(rules.meeting_day);
        const currentDay = today.getDay();
        let daysUntil = targetDay - currentDay;
        if (daysUntil < 0) daysUntil += 7; // If it's exactly 0 (today), keep it 0!

        nextADDate = new Date(today);
        nextADDate.setDate(today.getDate() + daysUntil);

        const bs = adToBS(nextADDate);
        return {
            bs: `${bs.monthName} ${bs.day}, ${bs.year}`,
            ad: nextADDate,
            weekday: rules.meeting_day
        };
    }
};

/**
 * Find the Nth weekday (e.g., 1st Saturday) in a given BS month
 * weekOffset=5 means "Last" occurrence
 */
function findNthWeekdayInBSMonth(bsYear, bsMonth, targetDayIndex, weekOffset) {
    try {
        // Get the first day of the BS month in AD
        const firstOfMonth = new NepaliDate(bsYear, bsMonth - 1, 1);
        const firstAD = firstOfMonth.toJsDate();
        
        // Find the first occurrence of the target weekday
        let firstOccurrence = new Date(firstAD);
        let diff = targetDayIndex - firstAD.getDay();
        if (diff < 0) diff += 7;
        firstOccurrence.setDate(firstAD.getDate() + diff);
        
        if (weekOffset === 5) {
            // "Last" occurrence: keep adding 7 days while still in the same BS month
            let last = new Date(firstOccurrence);
            let candidate = new Date(firstOccurrence);
            while (true) {
                candidate = new Date(candidate);
                candidate.setDate(candidate.getDate() + 7);
                const candidateBS = adToBS(candidate);
                if (candidateBS.month !== bsMonth || candidateBS.year !== bsYear) break;
                last = new Date(candidate);
            }
            return last;
        }
        
        // Nth occurrence: add (N-1) weeks
        const result = new Date(firstOccurrence);
        result.setDate(firstOccurrence.getDate() + (weekOffset - 1) * 7);
        return result;
    } catch (e) {
        const fallback = new Date();
        fallback.setDate(fallback.getDate() + 7);
        return fallback;
    }
}

export const formatBSDate = (bsDateObj) => {
    return `${MONTHS_BS[bsDateObj.month - 1]} ${bsDateObj.day}, ${bsDateObj.year}`;
};

/**
 * Universal helper: Convert any AD date input to a formatted BS string.
 * Usage: toBS('2026-04-09')  →  "Chaitra 27, 2082"
 *        toBS(new Date())    →  "Chaitra 27, 2082"
 *        toBS('2026-04-09', 'short')  →  "Chaitra 2082"
 *        toBS('2026-04-09', 'monthDay')  →  "Chaitra 27"
 */
export const toBS = (adDateInput, format = 'full') => {
    try {
        if (!adDateInput) return '..........';
        const adDate = adDateInput instanceof Date ? adDateInput : new Date(adDateInput);
        if (isNaN(adDate.getTime())) return '..........';
        const bs = adToBS(adDate);
        switch (format) {
            case 'short':
                return `${bs.monthName} ${bs.year}`;
            case 'monthDay':
                return `${bs.monthName} ${bs.day}`;
            case 'yearOnly':
                return `${bs.year}`;
            default:
                return `${bs.monthName} ${bs.day}, ${bs.year}`;
        }
    } catch (e) {
        console.error("toBS conversion error:", e);
        return adDateInput?.toString() || '..........';
    }
};

/**
 * Get BS month/year info from an AD date (for filter components)
 */
export const getBSMonthYear = (adDateInput) => {
    try {
        const adDate = adDateInput instanceof Date ? adDateInput : new Date(adDateInput);
        const bs = adToBS(adDate);
        return { year: bs.year, month: bs.month - 1, monthName: bs.monthName }; // month is 0-indexed for filter consistency
    } catch (e) {
        return { year: 2082, month: 0, monthName: 'Baisakh' };
    }
};

export { MONTHS_BS };
