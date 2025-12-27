import React, { useState } from "react";
import { ChevronDown, X, CheckCircle } from "lucide-react";

/**
 * Props:
 * - destinations: string[]
 * - selectedDestinations: string[]
 * - onSelectionChange: (selected: string[]) => void
 * - placeholder?: string
 * - disabled?: boolean
 * - type?: string
 */
export default function MultiSelectDestinations({
  destinations,
  selectedDestinations,
  onSelectionChange,
  placeholder = "Select destinations",
  style,
  disabled = false,
  type = "destination",
}) {
  const safeSelected = Array.isArray(selectedDestinations)
    ? selectedDestinations
    : [];

  const [showModal, setShowModal] = useState(false);
  const [tempSelected, setTempSelected] = useState([...safeSelected]);

  /* ---------- Toggle ---------- */
  const toggleDestination = (destination) => {
    setTempSelected((prev) =>
      prev.includes(destination)
        ? prev.filter((d) => d !== destination)
        : [...prev, destination]
    );
  };

  /* ---------- Confirm / Cancel ---------- */
  const handleConfirm = () => {
    onSelectionChange([...tempSelected]);
    setShowModal(false);
  };

  const handleCancel = () => {
    setTempSelected([...safeSelected]);
    setShowModal(false);
  };

  /* ---------- Display text ---------- */
  const getDisplayText = () => {
    if (safeSelected.length === 0) return placeholder;
    if (safeSelected.length === 1) return safeSelected[0];
    return `${safeSelected.length} ${type}${
      safeSelected.length > 1 ? "s" : ""
    } selected`;
  };

  return (
    <>
      {/* Selector */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setTempSelected([...safeSelected]);
            setShowModal(true);
          }
        }}
        style={{
          ...styles.selector,
          ...(disabled ? styles.disabled : {}),
          ...style,
        }}
      >
        <span
          style={
            safeSelected.length > 0
              ? styles.selectedText
              : styles.placeholderText
          }
        >
          {getDisplayText()}
        </span>
        <ChevronDown size={20} color="#6b7280" />
      </button>

      {/* Selected Chips */}
      {safeSelected.length > 0 && (
        <div style={styles.selectedContainer}>
          <div style={styles.chipRow}>
            {safeSelected.map((destination) => (
              <div key={destination} style={styles.selectedChip}>
                <span style={styles.selectedChipText}>{destination}</span>
                <button
                  type="button"
                  style={styles.removeButton}
                  onClick={() =>
                    onSelectionChange(
                      safeSelected.filter((d) => d !== destination)
                    )
                  }
                >
                  <X size={14} color="#6b7280" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContainer}>
            {/* Header */}
            <div style={styles.modalHeader}>
              <div style={styles.modalTitle}>Select {type}</div>
              <button
                type="button"
                onClick={handleCancel}
                style={styles.iconBtn}
              >
                <X size={22} />
              </button>
            </div>

            {/* Count */}
            <div style={styles.selectedCount}>
              {tempSelected.length} {type}
              {tempSelected.length !== 1 ? "s" : ""} selected
            </div>

            {/* List */}
            <div style={styles.destinationList}>
              {destinations.map((item) => {
                const isSelected = tempSelected.includes(item);

                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleDestination(item)}
                    style={{
                      ...styles.destinationItem,
                      ...(isSelected
                        ? styles.selectedDestinationItem
                        : {}),
                    }}
                  >
                    <span
                      style={{
                        ...styles.destinationText,
                        ...(isSelected
                          ? styles.selectedDestinationText
                          : {}),
                      }}
                    >
                      {item}
                    </span>

                    {isSelected && (
                      <CheckCircle size={18} color="#7c3aed" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Buttons */}
            <div style={styles.modalButtons}>
              <button
                type="button"
                onClick={handleCancel}
                style={styles.cancelButton}
              >
                <span style={styles.cancelButtonText}>Cancel</span>
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                style={styles.confirmButton}
              >
                <span style={styles.confirmButtonText}>
                  Confirm ({tempSelected.length})
                </span>
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
    cursor: "pointer",
    width: "100%",
  },

  disabled: {
    opacity: 0.6,
    cursor: "not-allowed",
  },

  selectedText: {
    fontSize: 16,
    color: "#1f2937",
  },

  placeholderText: {
    fontSize: 16,
    color: "#9ca3af",
  },

  selectedContainer: {
    marginTop: 8,
  },

  chipRow: {
    display: "flex",
    gap: 8,
    overflowX: "auto",
  },

  selectedChip: {
    backgroundColor: "#ede9fe",
    borderRadius: 20,
    padding: "6px 10px",
    display: "flex",
    alignItems: "center",
    gap: 4,
  },

  selectedChipText: {
    color: "#7c3aed",
    fontSize: 12,
    fontWeight: 500,
  },

  removeButton: {
    border: "none",
    background: "transparent",
    cursor: "pointer",
    padding: 2,
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },

  modalContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    width: "90%",
    maxWidth: 420,
    maxHeight: "80vh",
    display: "flex",
    flexDirection: "column",
  },

  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: "#111827",
  },

  iconBtn: {
    border: "none",
    background: "transparent",
    cursor: "pointer",
  },

  selectedCount: {
    backgroundColor: "#f3f4f6",
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
    textAlign: "center",
    fontSize: 14,
    color: "#6b7280",
  },

  destinationList: {
    overflowY: "auto",
    flex: 1,
    marginBottom: 16,
  },

  destinationItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    marginBottom: 6,
    backgroundColor: "#f9fafb",
    cursor: "pointer",
    border: "1px solid transparent",
  },

  selectedDestinationItem: {
    backgroundColor: "#ede9fe",
    borderColor: "#7c3aed",
  },

  destinationText: {
    fontSize: 16,
    color: "#374151",
  },

  selectedDestinationText: {
    color: "#7c3aed",
    fontWeight: 500,
  },

  modalButtons: {
    display: "flex",
    gap: 12,
  },

  cancelButton: {
    backgroundColor: "#f3f4f6",
    padding: 12,
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
  },

  cancelButtonText: {
    color: "#6b7280",
    fontWeight: 600,
  },

  confirmButton: {
    backgroundColor: "#7c3aed",
    padding: 12,
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
  },

  confirmButtonText: {
    color: "white",
    fontWeight: 600,
  },
};
