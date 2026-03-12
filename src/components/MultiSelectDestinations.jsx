import React, { useState, useEffect } from "react";
import { ChevronDown, X, CheckCircle, Search } from "lucide-react";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);

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
    setIsAnimating(true);
    setTimeout(() => {
      onSelectionChange([...tempSelected]);
      setShowModal(false);
      setSearchQuery("");
      setIsAnimating(false);
    }, 200);
  };

  const handleCancel = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setTempSelected([...safeSelected]);
      setShowModal(false);
      setSearchQuery("");
      setIsAnimating(false);
    }, 150);
  };

  const handleClearAll = () => {
    setTempSelected([]);
  };

  const handleSelectAll = () => {
    setTempSelected([...destinations]);
  };

  /* ---------- Display text ---------- */
  const getDisplayText = () => {
    if (safeSelected.length === 0) return placeholder;
    if (safeSelected.length === 1) return safeSelected[0];
    return `${safeSelected.length} ${type}${
      safeSelected.length > 1 ? "s" : ""
    } selected`;
  };

  const filteredDestinations = destinations.filter(item =>
    item.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        className="multi-select-selector"
      >
        <span
          style={{
            ...styles.selectedText,
            ...(safeSelected.length > 0
              ? styles.selectedTextActive
              : styles.placeholderText),
          }}
        >
          {getDisplayText()}
        </span>
        <ChevronDown 
          size={20} 
          color={safeSelected.length > 0 ? "#7c3aed" : "#6b7280"}
          style={{
            transition: 'transform 0.2s ease',
            transform: showModal ? 'rotate(180deg)' : 'rotate(0deg)'
          }}
        />
      </button>

      {/* Selected Chips */}
      {safeSelected.length > 0 && (
        <div style={styles.selectedContainer}>
          <div style={styles.chipRow}>
            {safeSelected.map((destination, index) => (
              <div 
                key={destination} 
                style={{
                  ...styles.selectedChip,
                  animation: `chipSlideIn 0.3s ease ${index * 0.05}s both`
                }}
              >
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
        <div style={styles.modalOverlay} onClick={handleCancel}>
          <div 
            style={{
              ...styles.modalContainer,
              ...(isAnimating ? styles.modalContainerAnimating : {})
            }} 
            onClick={(e) => e.stopPropagation()}
          >
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

            {/* Search Bar */}
            <div style={styles.searchContainer}>
              <Search size={18} color="#9ca3af" style={styles.searchIcon} />
              <input
                type="text"
                placeholder={`Search ${type}s...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchInput}
              />
            </div>

            {/* Action Buttons */}
            <div style={styles.actionButtons}>
              <button
                type="button"
                onClick={handleSelectAll}
                style={styles.actionButton}
                disabled={tempSelected.length === destinations.length}
              >
                Select All
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                style={styles.actionButton}
                disabled={tempSelected.length === 0}
              >
                Clear All
              </button>
            </div>

            {/* List */}
            <div style={styles.destinationList}>
              {filteredDestinations.map((item, index) => {
                const isSelected = tempSelected.includes(item);

                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleDestination(item)}
                    style={{
                      width:'100%',
                      ...styles.destinationItem,
                      ...(isSelected
                        ? styles.selectedDestinationItem
                        : {}),
                      animation: `itemSlideIn 0.2s ease ${index * 0.03}s both`
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
                      <div style={styles.checkCircleContainer}>
                        <CheckCircle size={18} color="#7c3aed" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* No Results */}
            {filteredDestinations.length === 0 && (
              <div style={styles.noResults}>
                <div style={styles.noResultsText}>
                  No {type}s found matching "{searchQuery}"
                </div>
              </div>
            )}

            {/* Buttons */}
            <div style={styles.modalButtons}>
              <button
                type="button"
                onClick={handleCancel}
                style={{
                  ...styles.cancelButton,
                  ...(isAnimating ? styles.buttonAnimating : {})
                }}
              >
                <span style={styles.cancelButtonText}>Cancel</span>
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                style={{
                  ...styles.confirmButton,
                  ...(isAnimating ? styles.buttonAnimating : {}),
                  ...(tempSelected.length === 0 ? styles.confirmButtonDisabled : {})
                }}
                disabled={tempSelected.length === 0}
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
    border: "2px solid #e5e7eb",
    padding: "14px 16px",
    borderRadius: 12,
    backgroundColor: "white",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: "pointer",
    width: "100%",
    minWidth: "100%",
    boxSizing: "border-box",
    transition: "all 0.2s ease",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },



  disabled: {
    opacity: 0.5,
    cursor: "not-allowed",
    backgroundColor: "#f9fafb",
  },

  selectedText: {
    fontSize: 16,
    color: "#1f2937",
    transition: "color 0.2s ease",
  },

  selectedTextActive: {
    color: "#7c3aed",
    fontWeight: 500,
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
    background: "linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)",
    borderRadius: 20,
    padding: "8px 12px",
    display: "flex",
    alignItems: "center",
    gap: 6,
    border: "1px solid #c4b5fd",
    boxShadow: "0 2px 4px rgba(124,58,237,0.1)",
    transition: "all 0.2s ease",
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
    borderRadius: "50%",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },



  modalOverlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    backdropFilter: "blur(4px)",
  },

  modalContainer: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    width: "90%",
    maxWidth: 460,
    maxHeight: "85vh",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
    border: "1px solid #f3f4f6",
  },

  modalContainerAnimating: {
    transform: "scale(0.95)",
    opacity: 0.8,
  },

  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: "#111827",
    letterSpacing: "-0.025em",
  },

  iconBtn: {
    border: "none",
    background: "transparent",
    cursor: "pointer",
  },

  selectedCount: {
    background: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",
    padding: "12px 16px",
    borderRadius: 12,
    marginBottom: 16,
    textAlign: "center",
    fontSize: 14,
    color: "#6b7280",
    fontWeight: 500,
    border: "1px solid #e5e7eb",
  },

  searchContainer: {
    position: "relative",
    marginBottom: 16,
  },

  searchIcon: {
    position: "absolute",
    left: 12,
    top: "50%",
    transform: "translateY(-50%)",
    pointerEvents: "none",
  },

  searchInput: {
    width: "100%",
    padding: "12px 16px 12px 40px",
    border: "2px solid #e5e7eb",
    borderRadius: 12,
    fontSize: 14,
    outline: "none",
    transition: "all 0.2s ease",
    backgroundColor: "#f9fafb",
  },



  actionButtons: {
    display: "flex",
    gap: 8,
    marginBottom: 16,
  },

  actionButton: {
    flex: 1,
    padding: "10px 16px",
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    backgroundColor: "white",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.2s ease",
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
    padding: "14px 16px",
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: "#f9fafb",
    cursor: "pointer",
    border: "2px solid transparent",
    transition: "all 0.2s ease",
    position: "relative",
    overflow: "hidden",
  },



  selectedDestinationItem: {
    background: "linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)",
    borderColor: "#7c3aed",
    boxShadow: "0 2px 8px rgba(124,58,237,0.15)",
  },

  checkCircleContainer: {
    animation: "checkBounce 0.3s ease",
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
    padding: "14px 20px",
    borderRadius: 12,
    border: "2px solid transparent",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontWeight: 600,
    fontSize: 15,
  },



  cancelButtonText: {
    color: "#6b7280",
    fontWeight: 600,
  },

  confirmButton: {
    background: "linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)",
    padding: "14px 20px",
    borderRadius: 12,
    border: "2px solid transparent",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontWeight: 600,
    fontSize: 15,
    boxShadow: "0 4px 6px rgba(124,58,237,0.25)",
  },

  confirmButtonDisabled: {
    background: "linear-gradient(135deg, #d1d5db 0%, #9ca3af 100%)",
    cursor: "not-allowed",
    boxShadow: "none",
  },



  buttonAnimating: {
    transform: "scale(0.95)",
    opacity: 0.8,
  },

  noResults: {
    textAlign: "center",
    padding: "40px 20px",
    color: "#9ca3af",
  },

  noResultsText: {
    fontSize: 16,
    fontWeight: 500,
  },

  confirmButtonText: {
    color: "white",
    fontWeight: 600,
  },
};

/* ================= CSS ANIMATIONS ================= */

const styleSheet = typeof document !== 'undefined' ? document.createElement('style') : null;

if (styleSheet) {
  styleSheet.textContent = `
    @keyframes chipSlideIn {
      from {
        opacity: 0;
        transform: translateY(-10px) scale(0.8);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    @keyframes itemSlideIn {
      from {
        opacity: 0;
        transform: translateX(-10px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    @keyframes checkBounce {
      0% {
        transform: scale(0);
      }
      50% {
        transform: scale(1.2);
      }
      100% {
        transform: scale(1);
      }
    }

    .multi-select-selector:focus {
      outline: none;
      border-color: #7c3aed;
      box-shadow: 0 0 0 3px rgba(124,58,237,0.1);
    }
  `;
  document.head.appendChild(styleSheet);
}
