import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import { User } from "lucide-react";

import CalendarDatePicker from "../DatePicker";
import CustomPicker from "../CustomPicker";
import MultiSelectDestinations from "../MultiSelectDestinations";

/* ================= CONSTANTS ================= */

const DestinationList = [
  "Bali",
  "Maldives",
  "Dubai",
  "Thailand",
  "Singapore",
  "Japan",
  "Europe",
  "Switzerland",
  "Paris",
  "London",
  "Vietnam",
  "Malaysia",
  "Indonesia",
  "Philippines",
  "South Korea",
  "Nepal",
  "Bhutan",
  "Sri Lanka",
];

const DepartureCityList = [
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Chennai",
  "Kolkata",
  "Hyderabad",
  "Pune",
  "Ahmedabad",
  "Kochi",
  "Goa",
];

/* ================= COMPONENT ================= */

const BasicDetails = () => {
  const {
    control,
    formState: { errors },
    watch,
    setValue,
  } = useFormContext();

  const isMultiDestination = watch("IsMultiDestination", false);
  const destinations = watch("Destinations", []);

  /* ---------- FormField ---------- */
  const FormField = ({ label, children, required = false, error }) => (
    <div style={{ marginBottom: 24 }}>
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

  return (
    <div style={styles.card}>
      {/* ===== Section Header ===== */}
      <div style={styles.sectionHeader}>
        <div style={styles.iconWrapper}>
          <User size={18} color="#7c3aed" />
        </div>
        <div style={styles.sectionTitle}>Basic Details</div>
      </div>

      {/* ===== Client Name ===== */}
      <FormField
        label="Client Full Name"
        required
        error={errors["Client-Name"]}
      >
        <Controller
          control={control}
          name="Client-Name"
          rules={{ required: "Full name is required" }}
          render={({ field }) => (
            <input
              {...field}
              style={{
                ...styles.input,
                ...(errors["Client-Name"] ? styles.errorInput : {}),
              }}
              placeholder="Enter customer full name"
            />
          )}
        />
      </FormField>

      {/* ===== Contact + Email ===== */}
      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <FormField
            label="Contact Number"
            required
            error={errors["Client-Contact"]}
          >
            <Controller
              control={control}
              name="Client-Contact"
              rules={{
                required: "Contact is required",
                minLength: { value: 10, message: "Enter 10 digits" },
              }}
              render={({ field }) => (
                <input
                  {...field}
                  inputMode="numeric"
                  maxLength={10}
                  style={{
                    ...styles.input,
                    ...(errors["Client-Contact"] ? styles.errorInput : {}),
                  }}
                  placeholder="Enter 10-digit number"
                />
              )}
            />
          </FormField>
        </div>

        <div style={{ flex: 1 }}>
          <FormField label="Email Address" error={errors["Client-Email"]}>
            <Controller
              control={control}
              name="Client-Email"
              rules={{
                pattern: {
                  value:
                    /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Enter a valid email address",
                },
              }}
              render={({ field }) => (
                <input
                  {...field}
                  type="email"
                  style={{
                    ...styles.input,
                    ...(errors["Client-Email"] ? styles.errorInput : {}),
                  }}
                  placeholder="Enter email address"
                />
              )}
            />
          </FormField>
        </div>
      </div>

      {/* ===== Travel Date ===== */}
      <FormField label="Travel Date" required error={errors.TravelDate}>
        <Controller
          control={control}
          name="TravelDate"
          rules={{ required: "Travel date is required" }}
          render={({ field }) => (
            <CalendarDatePicker
              value={field.value}
              onDateChange={field.onChange}
              placeholder="Select travel date"
            />
          )}
        />
      </FormField>

      {/* ===== Pax ===== */}
      <div style={{ display: "flex", gap: 12 }}>
        {[
          ["NoOfPax", "Adults"],
          ["Child", "Children"],
          ["Infant", "Infants"],
        ].map(([name, label]) => (
          <div key={name} style={{ flex: 1 }}>
            <FormField label={label} error={errors[name]}>
              <Controller
                control={control}
                name={name}
                render={({ field }) => (
                  <input
                    {...field}
                    inputMode="numeric"
                    style={{
                      ...styles.input,
                      ...(errors[name] ? styles.errorInput : {}),
                    }}
                    placeholder="0"
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value
                          ? parseInt(e.target.value) || 0
                          : 0
                      )
                    }
                  />
                )}
              />
            </FormField>
          </div>
        ))}
      </div>

      {/* ===== Days + Budget ===== */}
      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <FormField label="Days" error={errors.Days}>
            <Controller
              control={control}
              name="Days"
              render={({ field }) => (
                <input
                  {...field}
                  inputMode="numeric"
                  style={{
                    ...styles.input,
                    ...(errors.Days ? styles.errorInput : {}),
                  }}
                  placeholder="Enter days"
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value
                        ? parseInt(e.target.value) || 0
                        : 0
                    )
                  }
                />
              )}
            />
          </FormField>
        </div>

        <div style={{ flex: 1 }}>
          <FormField label="Budget (₹)" error={errors.Budget}>
            <Controller
              control={control}
              name="Budget"
              render={({ field }) => (
                <input
                  {...field}
                  inputMode="numeric"
                  style={{
                    ...styles.input,
                    ...(errors.Budget ? styles.errorInput : {}),
                  }}
                  placeholder="Enter budget"
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value
                        ? parseFloat(e.target.value) || 0
                        : 0
                    )
                  }
                />
              )}
            />
          </FormField>
        </div>
      </div>

      {/* ===== Multi Destination Toggle ===== */}
      <FormField label="Multi-Destination Trip">
        <Controller
          control={control}
          name="IsMultiDestination"
          render={({ field }) => (
            <div style={styles.switchRow}>
              <span style={{ color: "#374151", fontSize: 16 }}>
                Enable multiple destinations
              </span>
              <input
                type="checkbox"
                checked={!!field.value}
                onChange={(e) => field.onChange(e.target.checked)}
              />
            </div>
          )}
        />
      </FormField>

      {/* ===== Departure City ===== */}
      <FormField
        label="Departure City"
        required
        error={errors.DepartureCity}
      >
        <Controller
          control={control}
          name="DepartureCity"
          rules={{ required: "Departure city is required" }}
          render={({ field }) => (
            <input
              {...field}
              style={{
                ...styles.input,
                ...(errors.DepartureCity ? styles.errorInput : {}),
              }}
              placeholder="Enter departure city"
            />
          )}
        />
      </FormField>

      {/* ===== Destination(s) ===== */}
      {!isMultiDestination ? (
        <FormField
          label="Destination"
          required
          error={errors.DestinationName}
        >
          <Controller
            control={control}
            name="DestinationName"
            rules={{ required: "Destination is required" }}
            render={({ field }) => (
              <CustomPicker
                items={DestinationList}
                selectedValue={field.value}
                onValueChange={(val) => {
                  field.onChange(val);
                  setValue("Destinations", [val]);
                }}
                placeholder="Select destination"
                title="Select Destination"
              />
            )}
          />
        </FormField>
      ) : (
        <FormField
          label="Destinations"
          required
          error={
            destinations.length === 0
              ? { message: "At least one destination is required" }
              : undefined
          }
        >
          <MultiSelectDestinations
            destinations={DestinationList}
            selectedDestinations={destinations}
            onSelectionChange={(vals) =>
              setValue("Destinations", vals)
            }
            placeholder="Select multiple destinations"
          />
        </FormField>
      )}
    </div>
  );
};

export default BasicDetails;

/* ================= STYLES ================= */

const styles = {
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
  },

  sectionHeader: {
    display: "flex",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },

  iconWrapper: {
    backgroundColor: "#ede9fe",
    borderRadius: 50,
    padding: 8,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: "#111827",
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

  switchRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 0",
  },
};
