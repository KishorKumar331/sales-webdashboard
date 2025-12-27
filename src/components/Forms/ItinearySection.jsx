import React, { useEffect, useState, useReducer } from "react";
import { useFormContext, Controller, useFieldArray } from "react-hook-form";
import { Calendar, Trash2, Info, PlusCircle } from "lucide-react";

import ActivitySelector from "../ActivitySelector";
import CalendarDatePicker from "../DatePicker";

/* ================= COMPONENT ================= */

const ItinerarySection = () => {
  const [activity, setActivity] = useState([]);

  const {
    control,
    watch,
    formState: { errors },
    setValue,
    getValues,
  } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "Itinearies",
  });

  const days = watch("Days") || 1;
  const destinations = watch("Destinations");
  const travelDate = watch("TravelDate");

  /* ---------- Helpers ---------- */

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toISOString().split("T")[0];
  };

  const getItineraryDate = (index) => {
    if (!travelDate) return "";
    const d = new Date(travelDate);
    d.setDate(d.getDate() + index);
    return formatDate(d);
  };

  /* ---------- Force update (used by original code) ---------- */
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  /* ---------- Add Day ---------- */
  const addDay = () => {
    const nextDay = fields.length + 1;
    const base = travelDate ? new Date(travelDate) : new Date();
    const date = new Date(base);
    date.setDate(base.getDate() + (nextDay - 1));

    const formattedDate = formatDate(date);
    const dateKey = Number(formattedDate.replace(/-/g, ""));

    append({
      day: nextDay,
      Date: formattedDate,
      DateKey: dateKey,
      Title: `Day ${nextDay} Itinerary`,
      Activity: "",
      ImageUrl: "",
      Description: "",
    });
  };

  /* ---------- Remove Day ---------- */
  const removeDay = (index) => {
    if (fields.length <= 1) return;

    remove(index);

    const updated = [...getValues("Itinearies")];
    updated.splice(index, 1);

    updated.forEach((item, idx) => {
      item.day = idx + 1;
      item.Title = `Day ${idx + 1} Itinerary`;
    });

    setValue("Itinearies", updated, { shouldDirty: true });
    forceUpdate();
  };

  /* ---------- Activity Select ---------- */
  const handleActivitySelect = (activity, index) => {
    setValue(`Itinearies.${index}.Title`, activity.Title || `Day ${index + 1} Itinerary`);
    setValue(`Itinearies.${index}.Description`, activity.Description || "");
    setValue(`Itinearies.${index}.ImageUrl`, activity.ImageUrl || "");
    setValue(`Itinearies.${index}.Activity`, activity.Title || "");
    forceUpdate();
  };

  /* ---------- Auto-generate days ---------- */
  useEffect(() => {
    const current = fields.length;
    const target = Number(days) || 1;
    const base = travelDate ? new Date(travelDate) : new Date();

    if (target > current) {
      for (let i = current; i < target; i++) {
        const date = new Date(base);
        date.setDate(base.getDate() + i);

        const formattedDate = formatDate(date);
        const dateKey = Number(formattedDate.replace(/-/g, ""));

        append({
          day: i + 1,
          Date: formattedDate,
          DateKey: dateKey,
          Title: `Day ${i + 1} Itinerary`,
          Activity: "",
          ImageUrl: "",
          Description: "",
        });
      }
    } else if (target < current) {
      for (let i = current - 1; i >= target; i--) {
        remove(i);
      }
    }
  }, [days, travelDate]);

  /* ---------- Init ---------- */
  useEffect(() => {
    if (fields.length === 0) addDay();
  }, []);

  /* ---------- Fetch Activities ---------- */
  useEffect(() => {
    const fetchActivities = async (destination) => {
      try {
        const res = await fetch(
          `https://2rltmjilx9.execute-api.ap-south-1.amazonaws.com/DataTransaction/activitysightseen?DestinationName=${destination}`
        );
        const data = await res.json();
        return data?.Items || [];
      } catch (err) {
        console.error("Activity fetch error:", err);
        return [];
      }
    };

    const fetchAll = async () => {
      let all = [];
      if (destinations?.length) {
        const arr = await Promise.all(destinations.map(fetchActivities));
        arr.forEach((items) => (all = [...all, ...items]));
      }
      setActivity(all);
    };

    fetchAll();
  }, [destinations]);

  /* ================= UI ================= */

  return (
    <div style={styles.card}>
      {/* Header */}
      <div style={styles.sectionHeader}>
        <div style={{ ...styles.iconWrapper, backgroundColor: "#ecfdf5" }}>
          <Calendar size={20} color="#10b981" />
        </div>
        <div style={styles.sectionTitle}>Day-wise Itinerary</div>
      </div>

      {/* Info */}
      <div style={styles.infoBox}>
        <Info size={20} color="#3b82f6" />
        <div style={styles.infoText}>
          Itinerary auto-generates based on trip duration ({days} days)
        </div>
      </div>

      {fields.map((field, index) => (
        <div key={field.id} style={styles.dayCard}>
          {/* Day Header */}
          <div style={styles.dayHeader}>
            <div style={styles.dayBadge}>Day {index + 1}</div>

            {fields.length > 1 && (
              <button
                type="button"
                onClick={() => removeDay(index)}
                style={styles.removeButton}
              >
                <Trash2 size={18} color="#ef4444" />
              </button>
            )}
          </div>

          {/* Image Preview */}
          <Controller
            control={control}
            name={`Itinearies.${index}.ImageUrl`}
            render={({ field: { value } }) =>
              value ? (
                <img
                  src={value}
                  alt="itinerary"
                  style={{
                    width: "100%",
                    maxWidth: 290,
                    height: 180,
                    marginBottom: 18,
                    borderRadius: 8,
                    objectFit: "cover",
                  }}
                />
              ) : null
            }
          />

          {/* Date */}
          <Controller
            control={control}
            name={`Itinearies.${index}.Date`}
            render={({ field }) => (
              <CalendarDatePicker
                value={field.value || getItineraryDate(index)}
                onDateChange={(date) => {
                  field.onChange(date);
                  const key = Number(date.replace(/-/g, ""));
                  setValue(`Itinearies.${index}.DateKey`, key);
                }}
              />
            )}
          />

          {/* Activity Selector */}
          <ActivitySelector
            onSelectActivity={(a) => handleActivitySelect(a, index)}
            selectedActivity={{
              Title: watch(`Itinearies.${index}.Title`) || "",
              Description: watch(`Itinearies.${index}.Description`) || "",
              ImageUrl: watch(`Itinearies.${index}.ImageUrl`) || "",
            }}
            destination={destinations?.[0]}
            activities={activity}
          />

          {/* Title */}
          <Controller
            control={control}
            name={`Itinearies.${index}.Title`}
            render={({ field }) => (
              <input
                {...field}
                style={styles.input}
                placeholder="Enter day title"
              />
            )}
          />

          {/* Activity */}
          <Controller
            control={control}
            name={`Itinearies.${index}.Activity`}
            render={({ field }) => (
              <textarea
                {...field}
                style={{ ...styles.input, ...styles.textArea }}
                rows={2}
                placeholder="Activities"
              />
            )}
          />

          {/* Description */}
          <Controller
            control={control}
            name={`Itinearies.${index}.Description`}
            render={({ field }) => (
              <textarea
                {...field}
                style={{ ...styles.input, ...styles.textArea }}
                rows={3}
                placeholder="Description"
              />
            )}
          />
        </div>
      ))}

      {/* Add Day */}
      <button type="button" onClick={addDay} style={styles.addButton}>
        <PlusCircle size={22} color="#10b981" />
        <span style={styles.addButtonText}>Add Another Day</span>
      </button>
    </div>
  );
};

export default ItinerarySection;


export const styles = {
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
  },

  sectionHeader: {
    display: "flex",
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 12,
  },

  iconWrapper: {
    backgroundColor: "#ecfdf5",
    borderRadius: "50%",
    padding: 8,
    marginRight: 8,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: "#111827",
  },

  infoBox: {
    display: "flex",
    alignItems: "center",
    flexDirection: "row",
    backgroundColor: "#eff6ff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },

  infoText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#3b82f6",
    flex: 1,
  },

  dayCard: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    border: "1px solid #e5e7eb",
  },

  dayHeader: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  dayBadge: {
    backgroundColor: "#10b981",
    padding: "6px 12px",
    borderRadius: 20,
  },

  dayNumber: {
    color: "white",
    fontSize: 14,
    fontWeight: 600,
  },

  removeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#fef2f2",
    border: "none",
    cursor: "pointer",
  },

  subsectionTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: "#374151",
    marginBottom: 8,
    marginTop: 8,
  },

  input: {
    width: "100%",
    border: "1px solid #e5e7eb",
    padding: 12,
    borderRadius: 12,
    backgroundColor: "white",
    fontSize: 16,
    color: "#1f2937",
    outline: "none",
  },

  errorInput: {
    border: "2px solid #ef4444",
  },

  textArea: {
    height: 100,
    paddingTop: 12,
    resize: "vertical",
  },

  addButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    border: "2px dashed #10b981",
    backgroundColor: "#f0fdf4",
    cursor: "pointer",
  },

  addButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 600,
    color: "#10b981",
  },
};
