import React, { useState, useEffect, useMemo } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

/* ===================== Helpers ===================== */

const normalizeDate = (value) => {
  if (!value) return null;
  const d = value instanceof Date ? new Date(value.getTime()) : new Date(value);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

/* ===================== Component ===================== */

const DateRangeSelector = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  minDate = new Date(),
  maxDate = null,
  containerStyle,
  label = "Select Date Range",
  showLabel = true,
}) => {
  const [showModal, setShowModal] = useState(false);

  const [tempStartDate, setTempStartDate] = useState(
    startDate ? normalizeDate(startDate) : null
  );
  const [tempEndDate, setTempEndDate] = useState(
    endDate ? normalizeDate(endDate) : null
  );

  const [currentMonth, setCurrentMonth] = useState(
    startDate ? normalizeDate(startDate) : normalizeDate(new Date())
  );

  /* ---------- Sync with parent ---------- */
  useEffect(() => {
    setTempStartDate(startDate ? normalizeDate(startDate) : null);
  }, [startDate]);

  useEffect(() => {
    setTempEndDate(endDate ? normalizeDate(endDate) : null);
  }, [endDate]);

  useEffect(() => {
    if (startDate) setCurrentMonth(normalizeDate(startDate));
  }, [startDate]);

  /* ---------- Month label ---------- */
  const monthLabel = useMemo(
    () =>
      currentMonth.toLocaleString("default", {
        month: "long",
        year: "numeric",
      }),
    [currentMonth]
  );

  /* ---------- Calendar grid ---------- */
  const days = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const firstWeekDay = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const arr = [];
    for (let i = 0; i < firstWeekDay; i++) arr.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      arr.push(new Date(year, month, d));
    }
    return arr;
  }, [currentMonth]);

  /* ---------- Utils ---------- */
  const formatDisplayDate = (value) => {
    if (!value) return "Select date";
    const d = value instanceof Date ? value : new Date(value);
    const m = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return `${m[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  };

  const isSameDay = (a, b) =>
    a && b && normalizeDate(a).getTime() === normalizeDate(b).getTime();

  const isDateDisabled = (date) => {
    if (!date) return false;
    const d = normalizeDate(date);
    const min = minDate ? normalizeDate(minDate) : null;
    const max = maxDate ? normalizeDate(maxDate) : null;
    if (min && d < min) return true;
    if (max && d > max) return true;
    return false;
  };

  const isInRange = (date) => {
    if (!tempStartDate || !tempEndDate || !date) return false;
    const d = normalizeDate(date);
    return d > normalizeDate(tempStartDate) && d < normalizeDate(tempEndDate);
  };

  /* ---------- Handlers ---------- */
  const handleDayClick = (date) => {
    if (!date || isDateDisabled(date)) return;
    const d = normalizeDate(date);

    if (!tempStartDate || (tempStartDate && tempEndDate)) {
      setTempStartDate(d);
      setTempEndDate(null);
      return;
    }

    if (d < tempStartDate) {
      setTempEndDate(tempStartDate);
      setTempStartDate(d);
    } else if (isSameDay(d, tempStartDate)) {
      setTempEndDate(null);
    } else {
      setTempEndDate(d);
    }
  };

  const navigateMonth = (step) => {
    setCurrentMonth((prev) => {
      const next = new Date(prev.getTime());
      next.setMonth(prev.getMonth() + step);
      return next;
    });
  };

  const handleApply = () => {
    if (!tempStartDate) return;
    const start = normalizeDate(tempStartDate);
    const end = tempEndDate
      ? normalizeDate(tempEndDate)
      : normalizeDate(tempStartDate);

    onStartDateChange?.(start);
    onEndDateChange?.(end);
    setShowModal(false);
  };

  const handleCancel = () => {
    setTempStartDate(startDate ? normalizeDate(startDate) : null);
    setTempEndDate(endDate ? normalizeDate(endDate) : null);
    setShowModal(false);
  };

  const isSelected = (date) =>
    (tempStartDate && isSameDay(date, tempStartDate)) ||
    (tempEndDate && isSameDay(date, tempEndDate));

  /* ===================== UI ===================== */

  return (
    <div className="mb-4" style={containerStyle}>
      {showLabel && <div className="text-base font-medium mb-2 text-gray-700">{label}</div>}

      <button
        type="button"
        className="flex items-center justify-between gap-4 w-full p-4 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 shadow-sm transition-colors cursor-pointer"
        onClick={() => setShowModal(true)}
      >
        <div className="flex-1">
          <div className="text-xs text-gray-500 mb-1">Check-in</div>
          <div className="text-base font-medium text-gray-900">
            {startDate ? formatDisplayDate(startDate) : "Select date"}
          </div>
        </div>

        <div className="flex-1">
          <div className="text-xs text-gray-500 mb-1">Check-out</div>
          <div className="text-base font-medium text-gray-900">
            {endDate ? formatDisplayDate(endDate) : "Select date"}
          </div>
        </div>

        <Calendar className="h-5 w-5 text-gray-400" />
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="text-lg font-semibold text-center mb-4">Select Dates</div>

            <div className="flex justify-between items-center mb-3">
              <button
                type="button"
                className="bg-transparent border-none text-blue-600 hover:text-blue-800 cursor-pointer p-1"
                onClick={() => navigateMonth(-1)}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <div className="text-lg font-semibold">{monthLabel}</div>

              <button
                type="button"
                className="bg-transparent border-none text-blue-600 hover:text-blue-800 cursor-pointer p-1"
                onClick={() => navigateMonth(1)}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Su","Mo","Tu","We","Th","Fr","Sa"].map((d) => (
                <div key={d} className="text-center text-xs font-medium text-gray-500">{d}</div>
              ))}
            </div>

            <div className="overflow-auto max-h-80">
              <div className="grid grid-cols-7 gap-1">
                {days.map((date, i) =>
                  !date ? (
                    <div key={`e-${i}`} className="aspect-square" />
                  ) : (
                    <button
                      key={date.toISOString()}
                      type="button"
                      disabled={isDateDisabled(date)}
                      onClick={() => handleDayClick(date)}
                      className={`aspect-square flex items-center justify-center p-1  border-none cursor-pointer hover:bg-gray-100 rounded-full transition-colors text-sm ${
                        isInRange(date) ? 'bg-blue-50' : ''
                      } ${
                        isSelected(date) ? 'bg-blue-600 text-white font-semibold' : ''
                      } ${
                        isDateDisabled(date) ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {date.getDate()}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
              <button
                type="button"
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                onClick={handleCancel}
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={!tempStartDate}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  tempStartDate
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                onClick={handleApply}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangeSelector;
