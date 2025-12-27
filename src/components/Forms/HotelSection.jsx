import React, { useEffect } from "react";
import {
  useFormContext,
  Controller,
  useFieldArray,
} from "react-hook-form";
import { Bed, Trash2, PlusCircle } from "lucide-react";

import DateRangeSelector from "../DateRangeSelector";
import MultiSelectDestinations from "../MultiSelectDestinations";

const HotelsSection = () => {
  const {
    control,
    formState: { errors },
    setValue,
    watch,
  } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "Hotels",
  });

  const mealOptions = ["Breakfast", "Lunch", "Dinner"];

  const addHotel = () => {
    append({
      Nights: 0,
      Name: "",
      City: "",
      RoomType: "",
      Category: "",
      Meals: [],
      CheckInDate: null,
      CheckOutDate: null,
      Comments: "",
    });
  };

  const removeHotel = (index) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const FormField = ({ label, children, required = false, error }) => (
    <div style={{ marginBottom: 14 }}>
      <div style={{ color: "#374151", fontWeight: 600, marginBottom: 8 }}>
        {label} {required && <span style={{ color: "red" }}>*</span>}
      </div>
      {children}
      {error && (
        <div style={{ color: "red", fontSize: 12, marginTop: 4 }}>
          {error.message}
        </div>
      )}
    </div>
  );

  /* Ensure at least one hotel exists */
  useEffect(() => {
    if (!fields || fields.length === 0) {
      addHotel();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={styles.card}>
      {/* Section Header */}
      <div style={styles.sectionHeader}>
        <div style={{ ...styles.iconWrapper, backgroundColor: "#fef3c7" }}>
          <Bed size={20} color="#f59e0b" />
        </div>
        <div style={styles.sectionTitle}>Hotels & Accommodation</div>
      </div>

      {fields.map((field, index) => (
        <div key={field.id} style={styles.hotelCard}>
          {/* Hotel Name + Remove */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <FormField
                label="Hotel Name"
                required
                error={errors?.Hotels?.[index]?.Name}
              >
                <Controller
                  control={control}
                  name={`Hotels.${index}.Name`}
                  rules={{ required: "Hotel name is required" }}
                  render={({ field }) => (
                    <input
                      {...field}
                      style={{
                        ...styles.input,
                        ...(errors?.Hotels?.[index]?.Name
                          ? styles.errorInput
                          : {}),
                      }}
                      placeholder="Enter hotel name"
                    />
                  )}
                />
              </FormField>
            </div>

            {fields.length > 1 && (
              <button
                type="button"
                onClick={() => removeHotel(index)}
                style={styles.removeButton}
              >
                <Trash2 size={18} color="#ef4444" />
              </button>
            )}
          </div>

          {/* Date Range */}
          <DateRangeSelector
            startDate={watch(`Hotels.${index}.CheckInDate`)}
            endDate={watch(`Hotels.${index}.CheckOutDate`)}
            onStartDateChange={(date) => {
              const normalized = new Date(date);
              normalized.setHours(0, 0, 0, 0);

              setValue(`Hotels.${index}.CheckInDate`, normalized, {
                shouldValidate: true,
              });
              setValue(`Hotels.${index}.CheckOutDate`, null, {
                shouldValidate: true,
              });
            }}
            onEndDateChange={(date) => {
              const normalized = new Date(date);
              normalized.setHours(23, 59, 59, 999);

              setValue(`Hotels.${index}.CheckOutDate`, normalized, {
                shouldValidate: true,
              });

              const startDate = watch(
                `Hotels.${index}.CheckInDate`
              );
              if (startDate && date) {
                const start = new Date(startDate);
                const end = new Date(date);
                start.setHours(0, 0, 0, 0);
                end.setHours(0, 0, 0, 0);

                const diffTime = end - start;
                const nights = Math.max(
                  0,
                  Math.round(diffTime / (1000 * 60 * 60 * 24))
                );

                setValue(`Hotels.${index}.Nights`, nights, {
                  shouldValidate: true,
                });
              }
            }}
            minDate={(() => {
              const t = new Date();
              t.setHours(0, 0, 0, 0);
              return t;
            })()}
          />

          {/* City + Nights */}
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <FormField
                label="City"
                required
                error={errors?.Hotels?.[index]?.City}
              >
                <Controller
                  control={control}
                  name={`Hotels.${index}.City`}
                  rules={{ required: "City is required" }}
                  render={({ field }) => (
                    <input
                      {...field}
                      style={{
                        ...styles.input,
                        ...(errors?.Hotels?.[index]?.City
                          ? styles.errorInput
                          : {}),
                      }}
                      placeholder="Enter city"
                    />
                  )}
                />
              </FormField>
            </div>

            <div style={{ flex: 1 }}>
              <FormField
                label="Nights"
                required
                error={errors?.Hotels?.[index]?.Nights}
              >
                <Controller
                  control={control}
                  name={`Hotels.${index}.Nights`}
                  rules={{
                    required: "Number of nights is required",
                    min: { value: 1, message: "Nights must be at least 1" },
                  }}
                  render={({ field }) => (
                    <input
                      type="number"
                      {...field}
                      style={{
                        ...styles.input,
                        ...(errors?.Hotels?.[index]?.Nights
                          ? styles.errorInput
                          : {}),
                      }}
                      placeholder="Enter nights"
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          parseInt(e.target.value, 10) || 0
                        )
                      }
                    />
                  )}
                />
              </FormField>
            </div>
          </div>

          {/* Room Type + Category */}
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <FormField label="Room Type">
                <Controller
                  control={control}
                  name={`Hotels.${index}.RoomType`}
                  render={({ field }) => (
                    <input
                      {...field}
                      style={styles.input}
                      placeholder="e.g., Deluxe, Suite"
                    />
                  )}
                />
              </FormField>
            </div>

            <div style={{ flex: 1 }}>
              <FormField label="Category">
                <Controller
                  control={control}
                  name={`Hotels.${index}.Category`}
                  render={({ field }) => (
                    <input
                      {...field}
                      style={styles.input}
                      placeholder="e.g., 3 Star, 4 Star"
                    />
                  )}
                />
              </FormField>
            </div>
          </div>

          {/* Meals */}
          <FormField label="Meals">
            <Controller
              control={control}
              name={`Hotels.${index}.Meals`}
              render={({ field }) => (
                <MultiSelectDestinations
                  destinations={mealOptions}
                  selectedDestinations={
                    Array.isArray(field.value) ? field.value : []
                  }
                  onSelectionChange={(vals) => field.onChange(vals)}
                  type="meals"
                  placeholder="Select meals"
                />
              )}
            />
          </FormField>
        </div>
      ))}

      {/* Add Hotel */}
      <button
        type="button"
        onClick={addHotel}
        style={styles.addButton}
      >
        <PlusCircle size={22} color="#7c3aed" />
        <span style={styles.addButtonText}>Add Another Hotel</span>
      </button>
    </div>
  );
};

export default HotelsSection;

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
    borderRadius: 50,
    padding: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: "#111827",
  },
  hotelCard: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    border: "1px solid #e5e7eb",
  },
  removeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#fef2f2",
    border: "none",
    cursor: "pointer",
    height: 40,
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
  errorInput: {
    borderColor: "#ef4444",
    borderWidth: 2,
  },
  addButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    borderRadius: 12,
    border: "2px dashed #7c3aed",
    backgroundColor: "#faf5ff",
    cursor: "pointer",
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: 600,
    color: "#7c3aed",
  },
};
