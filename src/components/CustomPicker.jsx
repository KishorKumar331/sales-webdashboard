import React, { useEffect, useRef, useState } from "react";
import { ChevronDown, X } from "lucide-react";

export default function CustomPicker({
  items,
  selectedValue,
  onValueChange,
  placeholder = "Select option",
  style = {},
  disabled = false,
  title = "Select Option",
}) {
  const [showPicker, setShowPicker] = useState(false);
  const scrollRef = useRef(null);

  const itemHeight = 50;
  const containerHeight = 300;

  /* ================= AUTO SCROLL TO SELECTED ================= */
  useEffect(() => {
    if (!showPicker) return;
    if (!scrollRef.current || !selectedValue) return;

    const index = items.findIndex((item) =>
      typeof item === "object"
        ? item.value === selectedValue
        : item === selectedValue
    );

    if (index >= 0) {
      scrollRef.current.scrollTop = index * itemHeight;
    }
  }, [showPicker, selectedValue, items]);

  /* ================= SCROLL HANDLER ================= */
  const handleScrollEnd = () => {
    if (!scrollRef.current) return;

    const index = Math.round(scrollRef.current.scrollTop / itemHeight);
    if (index >= 0 && index < items.length) {
      const item = items[index];
      const value = typeof item === "object" ? item.value : item;
      if (value !== selectedValue) onValueChange(value);
    }
  };

  /* ================= SELECT ================= */
  const handleSelect = (item, index) => {
    const value = typeof item === "object" ? item.value : item;
    onValueChange(value);

    scrollRef.current?.scrollTo({
      top: index * itemHeight,
      behavior: "smooth",
    });

    setShowPicker(false);
  };

  /* ================= DISPLAY ================= */
  const getDisplayText = () => {
    if (!selectedValue) return placeholder;

    const item = items.find((i) =>
      typeof i === "object" ? i.value === selectedValue : i === selectedValue
    );

    return typeof item === "object" ? item.label : item ?? selectedValue;
  };

  return (
    <>
      {/* Selector */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setShowPicker(true)}
        style={{
          ...styles.selector,
          ...(disabled ? styles.disabled : {}),
          ...style,
        }}
      >
        <span
          style={selectedValue ? styles.selectedText : styles.placeholderText}
        >
          {getDisplayText()}
        </span>
        <ChevronDown size={20} color={disabled ? "#d1d5db" : "#6b7280"} />
      </button>

      {/* Modal */}
      {showPicker && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            {/* Header */}
            <div style={styles.header}>
              <div style={styles.title}>{title}</div>
              <button
                onClick={() => setShowPicker(false)}
                style={styles.iconBtn}
              >
                <X size={22} />
              </button>
            </div>

            {/* Picker */}
            <div style={styles.pickerContainer}>
              <div style={styles.highlight} />

              <div
                ref={scrollRef}
                style={{
                  ...styles.scroll,
                  height: containerHeight,
                }}
                onScrollEndCapture={handleScrollEnd}
              >
                <div
                  style={{
                    paddingTop: (containerHeight - itemHeight) / 2,
                    paddingBottom: (containerHeight - itemHeight) / 2,
                  }}
                >
                  {items.map((item, index) => {
                    const value =
                      typeof item === "object" ? item.value : item;
                    const label =
                      typeof item === "object" ? item.label : item;
                    const isSelected = value === selectedValue;

                    return (
                      <button
                        key={index}
                        onClick={() => handleSelect(item, index)}
                        style={{
                          ...styles.item,
                          height: itemHeight,
                          ...(isSelected ? styles.selectedItem : {}),
                        }}
                      >
                        <span
                          style={{
                            ...styles.itemText,
                            ...(isSelected
                              ? styles.selectedItemText
                              : {}),
                          }}
                        >
                          {label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={styles.footer}>
              <button
                style={styles.cancelBtn}
                onClick={() => setShowPicker(false)}
              >
                Cancel
              </button>
              <button
                style={styles.confirmBtn}
                onClick={() => setShowPicker(false)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ================= STYLES ================= */

const styles = {
  selector: {
    border: "1px solid #e5e7eb",
    padding: 12,
    borderRadius: 12,
    backgroundColor: "white",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 50,
    cursor: "pointer",
    width: "100%",
  },

  disabled: {
    backgroundColor: "#f9fafb",
    opacity: 0.6,
    cursor: "not-allowed",
  },

  selectedText: {
    fontSize: 16,
    color: "#1f2937",
    flex: 1,
    textAlign: "left",
  },

  placeholderText: {
    fontSize: 16,
    color: "#9ca3af",
    flex: 1,
    textAlign: "left",
  },

  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },

  modal: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    width: "90%",
    maxWidth: 400,
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  title: {
    fontSize: 18,
    fontWeight: 700,
    color: "#111827",
  },

  iconBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
  },

  pickerContainer: {
    position: "relative",
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    overflow: "hidden",
    height: 300,
    marginBottom: 16,
  },

  highlight: {
    position: "absolute",
    top: "40%",
    left: 0,
    right: 0,
    height: 50,
    backgroundColor: "rgba(124, 58, 237, 0.1)",
    borderTop: "1px solid #7c3aed",
    borderBottom: "1px solid #7c3aed",
    pointerEvents: "none",
    zIndex: 1,
  },

  scroll: {
    overflowY: "auto",
    scrollbarWidth: "none",
  },

  item: {
    width: "100%",
    background: "transparent",
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },

  itemText: {
    fontSize: 16,
    color: "#1f2937",
    fontWeight: 500,
  },

  selectedItem: {},

  selectedItemText: {
    color: "#7c3aed",
    fontWeight: 600,
  },

  footer: {
    display: "flex",
    gap: 12,
  },

  cancelBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
    border: "none",
    fontWeight: 600,
    cursor: "pointer",
  },

  confirmBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#7c3aed",
    color: "white",
    border: "none",
    fontWeight: 600,
    cursor: "pointer",
  },
};
