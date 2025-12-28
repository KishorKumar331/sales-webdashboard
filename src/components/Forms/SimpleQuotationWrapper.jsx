import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

/**
 * @param sections [{ Component }]
 * @param header ReactNode
 * @param footer ReactNode
 * @param onSubmit () => void
 */
const SimpleQuotationWrapper = ({
  sections,
  header,
  footer,
  onSubmit,
}) => {
  const navigate = useNavigate();
  const [currentSection, setCurrentSection] = useState(0);

  const goToSection = useCallback(
    (index) => {
      const clamped = Math.max(0, Math.min(index, sections.length - 1));
      setCurrentSection(clamped);
    },
    [sections.length]
  );

  const { Component } = sections[currentSection];

  const handlePrimary = useCallback(() => {
    const isLast = currentSection === sections.length - 1;
    if (isLast) {
      onSubmit?.();
    } else {
      goToSection(currentSection + 1);
    }
  }, [currentSection, sections.length, goToSection, onSubmit]);

  return (
    <div style={styles.root}>
      {/* ================= HEADER ================= */}
  

      {/* ================= CONTENT ================= */}
      <div style={styles.content}>
        <div style={styles.scroll}>
          {header}
          <div style={{ flex: 1 }}>
            <Component />
          </div>
        </div>

        {/* ================= BOTTOM NAV ================= */}
        <div style={styles.bottomNav}>
          {/* Previous */}
          <button
            onClick={() => goToSection(currentSection - 1)}
            disabled={currentSection === 0}
            style={{
              ...styles.prevBtn,
              opacity: currentSection === 0 ? 0.5 : 1,
            }}
          >
            Previous
          </button>

          {/* Counter */}
          <div style={styles.counterWrapper}>
            <div style={styles.counter}>
              {currentSection + 1}/{sections.length}
            </div>
          </div>

          {/* Next / Submit */}
          <button
            onClick={handlePrimary}
            style={styles.nextBtn}
          >
            {currentSection === sections.length - 1 ? "Submit" : "Next"}
          </button>
        </div>

        {footer && <div style={styles.footer}>{footer}</div>}
      </div>
    </div>
  );
};

export default SimpleQuotationWrapper;

/* ================= STYLES ================= */

const styles = {
  root: {
    minHeight: "100vh",
    backgroundColor: "#7c3aed",
    display: "flex",
    flexDirection: "column",
  },

  headerGradient: {
    background: "linear-gradient(135deg, #7c3aed, #5b21b6)",
    padding: "12px 16px 16px",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },

  headerRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backBtn: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    padding: 8,
    border: "none",
    cursor: "pointer",
  },

  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: 700,
  },

  content: {
    flex: 1,
    backgroundColor: "white",
    display: "flex",
    flexDirection: "column",
  },

  scroll: {
    flex: 1,
    overflowY: "auto",
  },

  bottomNav: {
    position: "relative",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 6,
    backgroundColor: "white",
    borderTop: "1px solid #f3f4f6",
  },

  prevBtn: {
    backgroundColor: "#e5e7eb",
    padding: "14px 24px",
    borderRadius: 12,
    border: "none",
    minWidth: 100,
    fontWeight: 600,
    fontSize: 16,
    cursor: "pointer",
    color: "#374151",
  },

  nextBtn: {
    backgroundColor: "#7c3aed",
    padding: "14px 12px",
    borderRadius: 12,
    border: "none",
    minWidth: 100,
    fontWeight: 600,
    fontSize: 14,
    color: "white",
    cursor: "pointer",
    boxShadow: "0 2px 6px rgba(124,58,237,0.35)",
  },

  counterWrapper: {
    position: "absolute",
    left: "50%",
    transform: "translateX(-50%)",
  },

  counter: {
    backgroundColor: "rgba(124,58,237,0.1)",
    border: "1px solid #7c3aed",
    padding: "4px 8px",
    borderRadius: 12,
    fontSize: 10,
    color: "#7c3aed",
    fontWeight: 600,
  },

  footer: {
    padding: 16,
    paddingTop: 0,
  },
};
