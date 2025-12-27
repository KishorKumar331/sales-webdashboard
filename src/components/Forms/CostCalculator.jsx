import React, { useEffect, useRef, memo } from "react";
import { useFormContext, Controller, useWatch } from "react-hook-form";
import { Calculator } from "lucide-react";
import { NumberParser } from "../../utils/NumberParser";

/** ---------- Memo building blocks ---------- */

const FormField = memo(function FormField({
  label,
  children,
  required = false,
  error,
}) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ color: "#374151", fontWeight: 600, marginBottom: 8 }}>
        {label} {required && <span style={{ color: "red" }}>*</span>}
      </div>
      {children}
      {!!error?.message && (
        <div style={{ color: "red", fontSize: 12, marginTop: 4 }}>
          {error.message}
        </div>
      )}
    </div>
  );
});

/** A memoized RHF numeric input that stores numbers (not strings) */
const RHFNumberInput = memo(function RHFNumberInput({
  name,
  control,
  error,
  placeholder,
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value, onBlur } }) => (
        <input
          type="text"
          inputMode="decimal"
          style={{
            ...styles.input,
            ...(error ? styles.errorInput : {}),
          }}
          placeholder={placeholder}
          value={value == null ? "" : String(value)}
          onChange={(e) => onChange(NumberParser(e.target.value))}
          onBlur={onBlur}
          autoComplete="off"
          autoCorrect="off"
        />
      )}
    />
  );
});

/** ---------- Main component ---------- */

const CostCalculator = () => {
  const {
    control,
    setValue,
    getValues,
    formState: { errors },
  } = useFormContext();

  // Watch the CORRECT nested paths under "Costs"
  const [
    flightCost,
    visaCost,
    landPackageCost,
    totalTax,
    gst,
    tcs,
    gstWaivedOff,
    tcsWaivedOff,
    packageWithGST,
    packageWithTCS,
  ] = useWatch({
    control,
    name: [
      "Costs.FlightCost",
      "Costs.VisaCost",
      "Costs.LandPackageCost",
      "Costs.TotalTax",
      "Costs.GST",
      "Costs.TCS",
      "Costs.GstWaivedOffAmt",
      "Costs.TcsWaivedOffAmt",
      "Costs.PackageWithGST",
      "Costs.PackageWithTCS",
    ],
  });

  const rafId = useRef(null);

  useEffect(() => {
    // Coerce to numbers with safe defaults
    const flight = NumberParser(flightCost);
    const visa = NumberParser(visaCost);
    const land = NumberParser(landPackageCost);
    const tax = NumberParser(totalTax);
    const gstAmt = NumberParser(gst);
    const tcsAmt = NumberParser(tcs);
    const gstW = NumberParser(gstWaivedOff);
    const tcsW = NumberParser(tcsWaivedOff);

    let total = flight + visa + land + tax;
    if (packageWithGST) total += gstAmt - gstW;
    if (packageWithTCS) total += tcsAmt - tcsW;

    const current = NumberParser(getValues("Costs.TotalCost"));

    if (current !== total) {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(() => {
        setValue("Costs.TotalCost", total, {
          shouldDirty: true,
          shouldTouch: false,
          shouldValidate: false,
        });
      });
    }

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [
    flightCost,
    visaCost,
    landPackageCost,
    totalTax,
    gst,
    tcs,
    gstWaivedOff,
    tcsWaivedOff,
    packageWithGST,
    packageWithTCS,
    getValues,
    setValue,
  ]);

  return (
    <div style={styles.card}>
      {/* Section Header */}
      <div style={styles.sectionHeader}>
        <div style={{ ...styles.iconWrapper, backgroundColor: "#dbeafe" }}>
          <Calculator size={20} color="#3b82f6" />
        </div>
        <div style={styles.sectionTitle}>Quotation Price</div>
      </div>

      {/* Basic Costs */}
      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <FormField label="Flight" error={errors?.Costs?.FlightCost}>
            <RHFNumberInput
              name="Costs.FlightCost"
              control={control}
              error={errors?.Costs?.FlightCost}
              placeholder="Enter flight cost"
            />
          </FormField>
        </div>

        <div style={{ flex: 1 }}>
          <FormField label="Visa" error={errors?.Costs?.VisaCost}>
            <RHFNumberInput
              name="Costs.VisaCost"
              control={control}
              error={errors?.Costs?.VisaCost}
              placeholder="Enter visa cost"
            />
          </FormField>
        </div>

        <div style={{ flex: 1 }}>
          <FormField
            label="Land"
            error={errors?.Costs?.LandPackageCost}
          >
            <RHFNumberInput
              name="Costs.LandPackageCost"
              control={control}
              error={errors?.Costs?.LandPackageCost}
              placeholder="Enter land package cost"
            />
          </FormField>
        </div>
      </div>

      {/* Total Cost Display */}
      <div style={styles.totalContainer}>
        <div style={styles.totalLabel}>Total Package Cost</div>
        <Controller
          control={control}
          name="Costs.TotalCost"
          render={({ field: { value } }) => {
            const numVal = NumberParser(value);
            const display = Number.isFinite(numVal)
              ? numVal.toLocaleString("en-IN")
              : "0";
            return (
              <div style={styles.totalAmount}>₹{display}</div>
            );
          }}
        />
      </div>
    </div>
  );
};

export default CostCalculator;

/* ================= STYLES ================= */

const styles = {
  card: {
    backgroundColor: "white",
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    marginBottom: 22,
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
  totalContainer: {
    backgroundColor: "#f9fafb",
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 600,
    color: "#374151",
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 700,
    color: "#7c3aed",
  },
};
