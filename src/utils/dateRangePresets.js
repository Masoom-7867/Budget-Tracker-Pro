const pad = (n) => String(n).padStart(2, '0');
const toISODate = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const PERIOD_OPTIONS = [
  { value: 'thisMonth', label: 'This Month' },
  { value: 'lastMonth', label: 'Last Month' },
  { value: 'thisQuarter', label: 'This Quarter' },
  { value: 'lastQuarter', label: 'Last Quarter' },
  { value: 'thisYear', label: 'This Year' },
  { value: 'yearToDate', label: 'Year To Date' },
  { value: 'lastYear', label: 'Last Year' },
  { value: 'allTime', label: 'All Time' }
];

/**
 * Returns { dateFrom, dateTo } (YYYY-MM-DD strings, '' meaning unbounded)
 * for a named period preset, relative to today.
 */
export const getPeriodDateRange = (period) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed
  const quarter = Math.floor(month / 3); // 0-3

  switch (period) {
    case 'thisMonth':
      return {
        dateFrom: toISODate(new Date(year, month, 1)),
        dateTo: toISODate(new Date(year, month + 1, 0))
      };
    case 'lastMonth':
      return {
        dateFrom: toISODate(new Date(year, month - 1, 1)),
        dateTo: toISODate(new Date(year, month, 0))
      };
    case 'thisQuarter':
      return {
        dateFrom: toISODate(new Date(year, quarter * 3, 1)),
        dateTo: toISODate(new Date(year, quarter * 3 + 3, 0))
      };
    case 'lastQuarter': {
      const lastQuarterMonth = quarter * 3 - 3;
      return {
        dateFrom: toISODate(new Date(year, lastQuarterMonth, 1)),
        dateTo: toISODate(new Date(year, lastQuarterMonth + 3, 0))
      };
    }
    case 'thisYear':
      return {
        dateFrom: toISODate(new Date(year, 0, 1)),
        dateTo: toISODate(new Date(year, 11, 31))
      };
    case 'yearToDate':
      return {
        dateFrom: toISODate(new Date(year, 0, 1)),
        dateTo: toISODate(now)
      };
    case 'lastYear':
      return {
        dateFrom: toISODate(new Date(year - 1, 0, 1)),
        dateTo: toISODate(new Date(year - 1, 11, 31))
      };
    case 'allTime':
    default:
      return { dateFrom: '', dateTo: '' };
  }
};

// The page's default view - month to date (1st of this month through today),
// not the full month, so it never shows more than "up to now" out of the box.
export const getMonthToDateRange = () => {
  const now = new Date();
  return {
    dateFrom: toISODate(new Date(now.getFullYear(), now.getMonth(), 1)),
    dateTo: toISODate(now)
  };
};
