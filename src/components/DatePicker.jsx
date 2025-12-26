import React, { useEffect, useState } from "react";
import { X, Calendar, ChevronLeft, ChevronRight } from "lucide-react";

export default function CalendarDatePicker({
  value,
  onDateChange,
  placeholder = "Select date",
  style = {},
}) {
  const [visible, setVisible] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selected, setSelected] = useState(value ? new Date(value) : null);

  /* keep selected in sync with external value */
  useEffect(() => {
    if (value) setSelected(new Date(value));
  }, [value]);

  const formatDisplay = (date) =>
    date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const generateCalendar = (monthDate) => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const startDay = firstDay.getDay(); // 0–6
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const calendar = [];

    for (let i = 0; i < startDay; i++) calendar.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      calendar.push(new Date(year, month, d));
    }

    return calendar;
  };

  const calendar = generateCalendar(currentMonth);

  const nextMonth = () => {
    const next = new Date(currentMonth);
    next.setMonth(next.getMonth() + 1);
    setCurrentMonth(next);
  };

  const prevMonth = () => {
    const prev = new Date(currentMonth);
    prev.setMonth(prev.getMonth() - 1);
    setCurrentMonth(prev);
  };

  const handleSelect = (day) => {
    setSelected(day);
    onDateChange(day.toISOString().split("T")[0]); // SAME OUTPUT
    setVisible(false);
  };

  return (
    <>
      {/* Input */}
      <button
        type="button"
        onClick={() => setVisible(true)}
        style={{ ...styles.input, ...style }}
      >
        <span style={selected ? styles.dateText : styles.placeholderText}>
          {selected ? formatDisplay(selected) : placeholder}
        </span>
        <Calendar size={20} color="#6b7280" />
      </button>

      {/* Modal */}
      {visible && (
        <div style={styles.overlay}>
          <div style={styles.modalContainer}>
            {/* Header */}
            <div style={styles.header}>
              <button onClick={() => setVisible(false)} style={styles.iconBtn}>
                <X size={22} />
              </button>

              <div style={styles.headerTitle}>
                {currentMonth.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                })}
              </div>

              <div style={{ width: 22 }} />
            </div>

            {/* Month Navigation */}
            <div style={styles.navRow}>
              <button onClick={prevMonth} style={styles.iconBtn}>
                <ChevronLeft size={26} />
              </button>
              <button onClick={nextMonth} style={styles.iconBtn}>
                <ChevronRight size={26} />
              </button>
            </div>

            {/* Week Row */}
            <div style={styles.weekRow}>
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d} style={styles.weekText}>
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div style={styles.grid}>
              {calendar.map((day, index) => {
                const isToday =
                  day &&
                  day.toDateString() === new Date().toDateString();

                const isSelected =
                  day &&
                  selected &&
                  day.toDateString() === selected.toDateString();

                return (
                  <button
                    key={index}
                    disabled={!day}
                    onClick={() => day && handleSelect(day)}
                    style={{
                      ...styles.cell,
                      ...(isToday ? styles.todayCell : {}),
                      ...(isSelected ? styles.selectedCell : {}),
                    }}
                  >
                    {day && (
                      <span
                        style={{
                          ...styles.cellText,
                          ...(isSelected ? styles.selectedCellText : {}),
                        }}
                      >
                        {day.getDate()}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ================= STYLES ================= */

const styles = {
  input: {
    width: "100%",
    border: "1px solid #e5e7eb",
    padding: 12,
    borderRadius: 12,
    backgroundColor: "white",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: "pointer",
  },

  dateText: {
    fontSize: 16,
    color: "#1f2937",
  },

  placeholderText: {
    fontSize: 16,
    color: "#9ca3af",
  },

  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: 20,
  },

  modalContainer: {
    backgroundColor: "white",
    borderRadius: 18,
    padding: 20,
    width: "100%",
    maxWidth: 380,
  },

  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: "#111827",
  },

  navRow: {
    margin: "16px 0",
    display: "flex",
    justifyContent: "space-between",
    padding: "0 30px",
  },

  weekRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  weekText: {
    width: "14.2%",
    textAlign: "center",
    color: "#6b7280",
    fontWeight: 600,
  },

  grid: {
    display: "flex",
    flexWrap: "wrap",
  },

  cell: {
    width: "14.2%",
    height: 45,
    margin: "4px 0",
    borderRadius: 8,
    border: "none",
    background: "transparent",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },

  cellText: {
    color: "#374151",
    fontSize: 16,
  },

  todayCell: {
    backgroundColor: "#f3f4f6",
  },

  selectedCell: {
    backgroundColor: "#7c3aed",
  },

  selectedCellText: {
    color: "white",
    fontWeight: 700,
  },

  iconBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
  },
};
