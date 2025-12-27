import React, { useState } from "react";
import { useFormContext, Controller, useFieldArray } from "react-hook-form";
import {
  List,
  CheckCircle,
  XCircle,
  Plus,
  X,
} from "lucide-react";

const InclusionsExclusions = () => {
  const { control } = useFormContext();
  const [newInclusion, setNewInclusion] = useState("");
  const [newExclusion, setNewExclusion] = useState("");

  const {
    fields: inclusionFields,
    append: appendInclusion,
    remove: removeInclusion,
  } = useFieldArray({
    control,
    name: "Inclusions",
  });

  const {
    fields: exclusionFields,
    append: appendExclusion,
    remove: removeExclusion,
  } = useFieldArray({
    control,
    name: "Exclusions",
  });

  const commonInclusions = [
    "Accommodation as per itinerary",
    "Daily breakfast",
    "Airport transfers",
    "Sightseeing as per itinerary",
    "All transportation",
    "Professional tour guide",
    "All entrance fees",
    "Travel insurance",
  ];

  const commonExclusions = [
    "International flights",
    "Visa fees",
    "Personal expenses",
    "Tips and gratuities",
    "Meals not mentioned",
    "Optional activities",
    "Travel insurance",
    "Emergency expenses",
  ];

  const addInclusion = (item) => {
    if (item.trim()) {
      appendInclusion({ item: item.trim() });
      setNewInclusion("");
    }
  };

  const addExclusion = (item) => {
    if (item.trim()) {
      appendExclusion({ item: item.trim() });
      setNewExclusion("");
    }
  };

  const QuickAddButton = ({ title, onClick, color }) => (
    <button
      type="button"
      onClick={onClick}
      style={{
        ...styles.quickAddButton,
        borderColor: color,
        color,
      }}
    >
      {title}
    </button>
  );

  return (
    <div style={styles.card}>
      {/* Section Header */}
      <div style={styles.sectionHeader}>
        <div style={styles.iconWrapper}>
          <List size={20} color="#f59e0b" />
        </div>
        <div style={styles.sectionTitle}>
          Inclusions & Exclusions
        </div>
      </div>

      {/* ================= INCLUSIONS ================= */}
      <div style={styles.subsection}>
        <div style={styles.subsectionHeader}>
          <CheckCircle size={20} color="#10b981" />
          <div style={{ ...styles.subsectionTitle, color: "#10b981" }}>
            Inclusions
          </div>
        </div>

        <div style={styles.quickAddLabel}>Quick Add:</div>
        <div style={styles.quickAddContainer}>
          {commonInclusions.map((item, i) => (
            <QuickAddButton
              key={i}
              title={item}
              onClick={() => addInclusion(item)}
              color="#10b981"
            />
          ))}
        </div>

        <div style={styles.addItemContainer}>
          <input
            style={{ ...styles.input, flex: 1 }}
            placeholder="Add custom inclusion"
            value={newInclusion}
            onChange={(e) => setNewInclusion(e.target.value)}
          />
          <button
            type="button"
            onClick={() => addInclusion(newInclusion)}
            style={{ ...styles.addButton, backgroundColor: "#10b981" }}
          >
            <Plus size={18} color="white" />
          </button>
        </div>

        {inclusionFields.map((field, index) => (
          <div key={field.id} style={styles.listItem}>
            <div style={styles.listItemContent}>
              <CheckCircle size={16} color="#10b981" />
              <Controller
                control={control}
                name={`Inclusions.${index}.item`}
                render={({ field }) => (
                  <input
                    {...field}
                    style={styles.listItemText}
                    placeholder="Inclusion item"
                  />
                )}
              />
            </div>
            <button
              type="button"
              onClick={() => removeInclusion(index)}
              style={styles.removeButton}
            >
              <X size={14} color="#ef4444" />
            </button>
          </div>
        ))}
      </div>

      {/* ================= EXCLUSIONS ================= */}
      <div style={styles.subsection}>
        <div style={styles.subsectionHeader}>
          <XCircle size={20} color="#ef4444" />
          <div style={{ ...styles.subsectionTitle, color: "#ef4444" }}>
            Exclusions
          </div>
        </div>

        <div style={styles.quickAddLabel}>Quick Add:</div>
        <div style={styles.quickAddContainer}>
          {commonExclusions.map((item, i) => (
            <QuickAddButton
              key={i}
              title={item}
              onClick={() => addExclusion(item)}
              color="#ef4444"
            />
          ))}
        </div>

        <div style={styles.addItemContainer}>
          <input
            style={{ ...styles.input, flex: 1 }}
            placeholder="Add custom exclusion"
            value={newExclusion}
            onChange={(e) => setNewExclusion(e.target.value)}
          />
          <button
            type="button"
            onClick={() => addExclusion(newExclusion)}
            style={{ ...styles.addButton, backgroundColor: "#ef4444" }}
          >
            <Plus size={18} color="white" />
          </button>
        </div>

        {exclusionFields.map((field, index) => (
          <div key={field.id} style={styles.listItem}>
            <div style={styles.listItemContent}>
              <X size={14} color="#ef4444" />
              <Controller
                control={control}
                name={`Exclusions.${index}.item`}
                render={({ field }) => (
                  <input
                    {...field}
                    style={styles.listItemText}
                    placeholder="Exclusion item"
                  />
                )}
              />
            </div>
            <button
              type="button"
              onClick={() => removeExclusion(index)}
              style={styles.removeButton}
            >
              <X size={14} color="#ef4444" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InclusionsExclusions;

/* ================= STYLES ================= */

const styles = {
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  iconWrapper: {
    backgroundColor: "#fef3c7",
    borderRadius: 50,
    padding: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: "#111827",
  },
  subsection: {
    marginBottom: 24,
  },
  subsectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: 600,
  },
  quickAddLabel: {
    fontSize: 14,
    fontWeight: 500,
    color: "#6b7280",
    marginBottom: 8,
  },
  quickAddContainer: {
    display: "flex",
    gap: 8,
    overflowX: "auto",
    marginBottom: 16,
  },
  quickAddButton: {
    padding: "6px 12px",
    borderRadius: 16,
    border: "1px solid",
    backgroundColor: "white",
    fontSize: 12,
    fontWeight: 500,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  addItemContainer: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  listItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  listItemContent: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  listItemText: {
    flex: 1,
    border: "none",
    background: "transparent",
    fontSize: 14,
    color: "#374151",
    outline: "none",
  },
  removeButton: {
    border: "none",
    background: "transparent",
    cursor: "pointer",
  },
  input: {
    border: "1px solid #e5e7eb",
    padding: 12,
    borderRadius: 12,
    backgroundColor: "white",
    fontSize: 16,
    color: "#1f2937",
    width: "100%",
  },
};
