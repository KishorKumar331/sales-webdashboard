import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";

// Replace these imports with your web versions
import Navbar from "../components/Navbar";
import CalendarDatePicker from "../components/DatePicker";
import CustomPicker from "../components/CustomPicker";
import { getUserProfile } from "../utils/getUserProfile";
import { HdIcon, Icon, PersonStanding, PlaySquareIcon } from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

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

export default function NewLeadForm() {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    // setValue, // (kept in comments like your native file)
  } = useForm();

  const navigate = useNavigate();
  // State for multi-select destinations
  const [selectedDestinations, setSelectedDestinations] = useState([]);
  const [isMultiDestination, setIsMultiDestination] = useState(false);

  // Loading state for API call
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      // Calculate end date (same logic)
      const calculateEndDate = (startDate, days) => {
        const start = new Date(startDate);
        const end = new Date(start);
        end.setDate(start.getDate() + days - 1);
        return end.toISOString().split("T")[0];
      };

      // Get sales person info (same logic)
      const salesPersonInfo = await getUserProfile();
      console.log(salesPersonInfo);

      // Keep EXACT payload logic
      const leadData = {
        CompanyId: salesPersonInfo.companyId,
        CompanyName: salesPersonInfo.companyName,

        "Client-Name": data["Client-Name"],
        "Client-Email": data["Client-Email"],
        "Client-Contact": data["Client-Contact"],
        "Client-DepartureCity": data["Client-DepartureCity"],
        "Client-Destination": isMultiDestination
          ? selectedDestinations.length > 0
            ? selectedDestinations[0]
            : data["Client-Destination"]
          : data["Client-Destination"],
        "Client-Destinations": isMultiDestination
          ? selectedDestinations
          : [data["Client-Destination"]],
        IsMultiDestination: isMultiDestination,
        "Client-Pax": parseInt(data["Client-Pax"]) || 0,
        "Client-Child": parseInt(data["Client-Child"]) || 0,
        "Client-Infant": parseInt(data["Client-Infant"]) || 0,
        "Client-Days": parseInt(data["Client-Days"]) || 0,
        "Client-Budget": parseInt(data["Client-Budget"]) || 0,
        "Client-TravelDate": data["Client-TravelDate"]?.date
          ? data["Client-TravelDate"]?.date
          : data["Client-TravelDate"],
        "Client-TravelEndDate": data["Client-TravelDate"]?.date
          ? calculateEndDate(
              data["Client-TravelDate"].date,
              parseInt(data["Client-Days"]) || 0
            )
          : calculateEndDate(
              data["Client-TravelDate"],
              parseInt(data["Client-Days"]) || 0
            ),

        LeadSource: data.LeadSource || "WebApp",
        LeadPotential: data.LeadPotential || "Medium",
        LeadRating: data.LeadRating || "Warm",

        SalesStatus: "LeadCreate",
        LatestStatus: "LeadCreate",
        SalesPersonUid: salesPersonInfo.FullName,
        SalesPersonName: salesPersonInfo.FullName,
        SalesPersonEmail: salesPersonInfo.Email,

        Quotations: [],

        Comments: [
          {
            By: salesPersonInfo.salesPersonEmail,
            Role: "Sales",
            Message: data.Comments || "Initial lead created",
            At: new Date().toISOString(),
          },
        ],
      };

      console.log("Lead Data:", JSON.stringify(leadData, null, 2));

      const response = await fetch(
        "https://0rq0f90i05.execute-api.ap-south-1.amazonaws.com/salesapp/lead-managment/create-quote",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(leadData),
        }
      );

      const responseData = await response.json();

      if (response.ok) {
        toast.success("Success: Lead created successfully!");
        reset();
        setSelectedDestinations([]);
        setIsMultiDestination(false);
        navigate('/')
      } else {
        window.alert(
          responseData.message || "Failed to create lead. Please try again."
        );
      }
    } catch (error) {
      console.error("Error creating lead:", error);
      window.alert("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const FormField = ({ label, children, required = false, error }) => (
    <div style={{ marginBottom: 24 }}>
      <div style={{ color: "#374151", fontWeight: 600, marginBottom: 8 }}>
        {label} {required && <span style={{ color: "red" }}>*</span>}
      </div>
      {children}
      {error?.message && (
        <div style={{ color: "red", fontSize: 12, marginTop: 4 }}>
          {error.message}
        </div>
      )}
    </div>
  );

  return (
    <div style={styles.mainContainer}>
      <Navbar
        title="Add New Lead"
        subtitle="Create a new customer lead"
        showSearch={false}
        showNotifications={false}
      />

      <div style={styles.scrollContainer}>
        <div style={styles.container}>
          {/* Personal Information Section */}
          <div style={styles.card}>
            <div style={styles.sectionHeader}>
              <div style={styles.iconWrapper}><PersonStanding/></div>
              <div style={styles.sectionTitle}>Personal Information</div>
            </div>

            <FormField
              label="Client Name"
              required
              error={errors["Client-Name"]}
            >
              <Controller
                control={control}
                name="Client-Name"
                rules={{ required: "Client name is required" }}
                render={({ field: { onChange, value } }) => (
                  <input
                    style={{
                      ...styles.input,
                      ...(errors["Client-Name"] ? styles.errorInput : {}),
                    }}
                    placeholder="Enter client full name"
                    value={value || ""}
                    onChange={(e) => onChange(e.target.value)}
                  />
                )}
              />
            </FormField>

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
                render={({ field: { onChange, value } }) => (
                  <input
                    style={{
                      ...styles.input,
                      ...(errors["Client-Contact"] ? styles.errorInput : {}),
                    }}
                    placeholder="Enter 10-digit number"
                    inputMode="numeric"
                    type="number"
                    maxLength={10}
                    value={value || ""}
                    onChange={(e) => onChange(e.target.value)}
                  />
                )}
              />
            </FormField>

            <FormField
              label="Email Address"
              required
              error={errors["Client-Email"]}
            >
              <Controller
                control={control}
                name="Client-Email"
                rules={{
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Enter a valid email address",
                  },
                }}
                render={({ field: { onChange, value } }) => (
                  <input
                    style={{
                      ...styles.input,
                      ...(errors["Client-Email"] ? styles.errorInput : {}),
                    }}
                    placeholder="Enter email address"
                    type="email"
                    autoCapitalize="none"
                    value={value || ""}
                    onChange={(e) => onChange(e.target.value)}
                  />
                )}
              />
            </FormField>
          </div>

          {/* Travel Information Section */}
          <div style={styles.card}>
            <div style={styles.sectionHeader}>
              <div style={{ ...styles.iconWrapper, backgroundColor: "#dbeafe" }}>
               <PlaySquareIcon/>
              </div>
              <div style={styles.sectionTitle}>Travel Information</div>
            </div>

            <FormField label="Departure City">
              <Controller
                control={control}
                name="Client-DepartureCity"
                render={({ field: { onChange, value } }) => (
                  <input
                    style={styles.input}
                    placeholder="Enter Departure"
                    value={value || ""}
                    onChange={(e) => onChange(e.target.value)}
                  />
                )}
              />
            </FormField>

            {/* Destination */}
            <FormField
              label="Destination"
              required
              error={errors["Client-Destination"]}
            >
              <Controller
                control={control}
                name="Client-Destination"
                rules={{ required: "Destination is required" }}
                render={({ field: { onChange, value } }) => (
                  <CustomPicker
                    items={DestinationList}
                    selectedValue={value}
                    onValueChange={onChange}
                    placeholder="Select destination"
                    title="Select Destination"
                  />
                )}
              />
            </FormField>

            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <FormField
                  label="Duration (Days)"
                  required
                  error={errors["Client-Days"]}
                >
                  <Controller
                    control={control}
                    name="Client-Days"
                    rules={{ required: "Duration is required" }}
                    render={({ field: { onChange, value } }) => (
                      <input
                      type="number"
                        style={styles.input}
                        placeholder="Enter number of days"
                        inputMode="numeric"
                        maxLength={3}
                        value={value || ""}
                        onChange={(e) => onChange(e.target.value)}
                      />
                    )}
                  />
                </FormField>
              </div>

              <div style={{ flex: 1 }}>
                <FormField
                  label="Travel Date"
                  required
                  error={errors["Client-TravelDate"]}
                >
                  <Controller
                    control={control}
                    name="Client-TravelDate"
                    rules={{ required: "Travel date is required" }}
                    render={({ field: { onChange, value } }) => (
                      <CalendarDatePicker
                        value={value}
                        onDateChange={onChange}
                        placeholder="Select travel date"
                      />
                    )}
                  />
                </FormField>
              </div>
            </div>

            <FormField label="Budget (₹)" error={errors["Client-Budget"]}>
              <Controller
                control={control}
                name="Client-Budget"
                render={({ field: { onChange, value } }) => (
                  <input
                    style={styles.input}
                    placeholder="Enter approximate budget"
                    inputMode="numeric"
                    maxLength={10}
                    value={value || ""}
                    onChange={(e) => onChange(e.target.value)}
                  />
                )}
              />
            </FormField>

            {/* Passenger Information */}
            <div style={styles.sectionSubtitle}>Passenger Information</div>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <FormField label="Adults" required error={errors["Client-Pax"]}>
                  <Controller
                    control={control}
                    name="Client-Pax"
                    rules={{ required: "Number of adults is required" }}
                    render={({ field: { onChange, value } }) => (
                      <input
                        style={styles.input}
                        placeholder="Adults"
                        type="number"
                        inputMode="numeric"
                        value={value || ""}
                        onChange={(e) => onChange(e.target.value)}
                      />
                    )}
                  />
                </FormField>
              </div>

              <div style={{ flex: 1 }}>
                <FormField label="Children" error={errors["Client-Child"]}>
                  <Controller
                    control={control}
                    name="Client-Child"
                    render={({ field: { onChange, value } }) => (
                      <input
                      type="number"
                        style={styles.input}
                        placeholder="Children"
                        inputMode="numeric"
                        value={value || ""}
                        onChange={(e) => onChange(e.target.value)}
                      />
                    )}
                  />
                </FormField>
              </div>

              <div style={{ flex: 1 }}>
                <FormField label="Infants" error={errors["Client-Infant"]}>
                  <Controller
                    control={control}
                    name="Client-Infant"
                    render={({ field: { onChange, value } }) => (
                      <input
                        style={styles.input}
                        placeholder="Infants"
                        inputMode="numeric"
                        value={value || ""}
                        type="number"
                        onChange={(e) => onChange(e.target.value)}
                      />
                    )}
                  />
                </FormField>
              </div>
            </div>
          </div>

          {/* Additional Details Section */}
          <div style={styles.card}>
            <div style={styles.sectionHeader}>
              <div style={{ ...styles.iconWrapper, backgroundColor: "#dcfce7" }}>
                <HdIcon/>
              </div>
              <div style={styles.sectionTitle}>Additional Details</div>
            </div>

            <FormField label="Additional Comments" error={errors.Comments}>
              <Controller
                control={control}
                name="Comments"
                render={({ field: { onChange, value } }) => (
                  <textarea
                    style={{ ...styles.input, ...styles.textArea }}
                    placeholder="Enter any additional details, special requirements, or comments..."
                    value={value || ""}
                    onChange={(e) => onChange(e.target.value)}
                    rows={4}
                  />
                )}
              />
            </FormField>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit(onSubmit)}
            style={{
              ...styles.submitBtn,
              ...(isSubmitting ? styles.submitBtnDisabled : {}),
            }}
            disabled={isSubmitting}
            type="button"
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              {isSubmitting ? (
                <>
                  <div style={styles.loadingSpinner} />
                  <span style={styles.submitBtnText}>Creating Lead...</span>
                </>
              ) : (
                <>
                  <span style={{ fontSize: 18, color: "white" }}>➕</span>
                  <span style={styles.submitBtnText}>Create Lead</span>
                </>
              )}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================= STYLES (WEB EQUIVALENT) ================= */
const styles = {
  mainContainer: {
    minHeight: "100vh",
    backgroundColor: "#f3f4f6",
  },
  scrollContainer: {
    width: "100%",
  },
  container: {
    padding: 16,
    paddingBottom: 100,
    maxWidth: 900,
    margin: "0 auto",
  },
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
    marginBottom: 12,
    gap: 8,
  },
  iconWrapper: {
    backgroundColor: "#ede9fe",
    borderRadius: 999,
    padding: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: "#111827",
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: 600,
    color: "#374151",
    marginBottom: 12,
    marginTop: 16,
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
    borderColor: "#ef4444",
    borderWidth: 2,
  },
  submitBtn: {
    width: "100%",
    backgroundColor: "#7c3aed",
    borderRadius: 16,
    padding: "16px 20px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
    border: "none",
    cursor: "pointer",
    display: "flex",
    justifyContent: "center",
  },
  submitBtnText: {
    color: "white",
    fontWeight: 700,
    fontSize: 16,
    marginLeft: 8,
  },
  textArea: {
    height: 100,
    paddingTop: 12,
    resize: "vertical",
  },
  submitBtnDisabled: {
    backgroundColor: "#9ca3af",
    opacity: 0.7,
    cursor: "not-allowed",
  },
  loadingSpinner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    border: "2px solid white",
    borderTopColor: "transparent",
    marginRight: 8,
    display: "inline-block",
  },
};
