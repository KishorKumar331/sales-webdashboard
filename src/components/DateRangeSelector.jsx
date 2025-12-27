import React, { useState, useEffect, useMemo } from "react";

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
    <div style={{ ...styles.container, ...containerStyle }}>
      {showLabel && <div style={styles.label}>{label}</div>}

      <button
        type="button"
        style={styles.dateDisplay}
        onClick={() => setShowModal(true)}
      >
        <div style={styles.dateDisplayItem}>
          <div style={styles.dateLabel}>Check-in</div>
          <div style={styles.dateText}>
            {startDate ? formatDisplayDate(startDate) : "Select date"}
          </div>
        </div>

        <div style={styles.dateDisplayItem}>
          <div style={styles.dateLabel}>Check-out</div>
          <div style={styles.dateText}>
            {endDate ? formatDisplayDate(endDate) : "Select date"}
          </div>
        </div>
      </button>

      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalTitle}>Select Dates</div>

            <div style={styles.monthHeader}>
              <button
                type="button"
                style={styles.monthNavButton}
                onClick={() => navigateMonth(-1)}
              >
                ‹
              </button>

              <div style={styles.monthTitle}>{monthLabel}</div>

              <button
                type="button"
                style={styles.monthNavButton}
                onClick={() => navigateMonth(1)}
              >
                ›
              </button>
            </div>

            <div style={styles.weekDaysContainer}>
              {["Su","Mo","Tu","We","Th","Fr","Sa"].map((d) => (
                <div key={d} style={styles.weekDayText}>{d}</div>
              ))}
            </div>

            <div style={styles.daysContainer}>
              <div style={styles.daysGrid}>
                {days.map((date, i) =>
                  !date ? (
                    <div key={`e-${i}`} style={styles.dayCell} />
                  ) : (
                    <button
                      key={date.toISOString()}
                      type="button"
                      disabled={isDateDisabled(date)}
                      onClick={() => handleDayClick(date)}
                      style={{
                        ...styles.dayCell,
                        ...(isInRange(date) ? styles.dayInRange : {}),
                        ...(isSelected(date) ? styles.daySelected : {}),
                        ...(isDateDisabled(date) ? styles.dayDisabled : {}),
                      }}
                    >
                      <span
                        style={{
                          ...styles.dayText,
                          ...(isSelected(date)
                            ? styles.daySelectedText
                            : {}),
                          ...(isDateDisabled(date)
                            ? styles.dayDisabledText
                            : {}),
                        }}
                      >
                        {date.getDate()}
                      </span>
                    </button>
                  )
                )}
              </div>
            </div>

            <div style={styles.modalButtons}>
              <button
                type="button"
                style={{ ...styles.button, ...styles.cancelButton }}
                onClick={handleCancel}
              >
                <span style={{ ...styles.buttonText, ...styles.cancelButtonText }}>
                  Cancel
                </span>
              </button>

              <button
                type="button"
                disabled={!tempStartDate}
                style={{
                  ...styles.button,
                  ...styles.applyButton,
                  ...(tempStartDate ? {} : styles.buttonDisabled),
                }}
                onClick={handleApply}
              >
                <span style={styles.buttonText}>Apply</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangeSelector;

/* ===================== Styles ===================== */

const styles = {
  container: { marginBottom: 16 },

  label: {
    fontSize: 16,
    fontWeight: 500,
    marginBottom: 8,
    color: "#374151",
  },

  dateDisplay: {
    display: "flex",
    justifyContent: "space-between",
    border: "1px solid #d1d5db",
    borderRadius: 12,
    padding: 12,
    background: "#fff",
    width: "100%",
    cursor: "pointer",
  },

  dateDisplayItem: { flex: 1 },
  dateLabel: { fontSize: 12, color: "#6b7280", marginBottom: 4 },
  dateText: { fontSize: 16, color: "#111827" },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    padding: 20,
    zIndex: 1000,
  },

  modalContent: {
    background: "white",
    borderRadius: 16,
    padding: 16,
    maxHeight: "80%",
    width: "100%",
    maxWidth: 420,
    overflow: "auto",
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: 600,
    marginBottom: 16,
    textAlign: "center",
  },

  monthHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  monthNavButton: {
    fontSize: 20,
    background: "none",
    border: "none",
    color: "#3b82f6",
    cursor: "pointer",
  },

  monthTitle: { fontSize: 18, fontWeight: 600 },

  weekDaysContainer: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 4,
  },

  weekDayText: {
    width: "14.28%",
    textAlign: "center",
    color: "#6b7280",
    fontSize: 12,
    fontWeight: 500,
  },

  daysContainer: { maxHeight: 300 },
  daysGrid: { display: "flex", flexWrap: "wrap" },

  dayCell: {
    width: "14.28%",
    aspectRatio: "1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 4,
    background: "transparent",
    border: "none",
  },

  dayText: { fontSize: 14, color: "#111827" },
  daySelected: { background: "#3b82f6", borderRadius: 999 },
  daySelectedText: { color: "white", fontWeight: 600 },
  dayInRange: { background: "#dbeafe", borderRadius: 999 },
  dayDisabled: { opacity: 0.3 },
  dayDisabledText: { color: "#9ca3af" },

  modalButtons: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: 16,
    borderTop: "1px solid #e5e7eb",
    paddingTop: 12,
    gap: 8,
  },

  button: {
    padding: "10px 16px",
    borderRadius: 10,
    minWidth: 80,
    textAlign: "center",
    cursor: "pointer",
    border: "none",
  },

  cancelButton: { background: "#f3f4f6" },
  applyButton: { background: "#3b82f6" },
  buttonDisabled: { opacity: 0.5 },

  buttonText: { color: "white", fontWeight: 500 },
  cancelButtonText: { color: "#374151" },
};
