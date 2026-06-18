import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";

// Replace these imports with your web versions
import Navbar from "../components/Navbar";
import CalendarDatePicker from "../components/DatePicker";
import CustomPicker from "../components/CustomPicker";
import { getUserProfile } from "../utils/getUserProfile";
import { PersonStanding, MapPin, Calendar, Users, DollarSign, Mail, Phone, MessageSquare, Send } from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

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
  "Kashmir",
  "Kerala",
  "Himachal",
  "Andaman",
  "Ladakh"
];

export default function NewLeadForm() {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    // setValue, // (kept in comments like your native file)
  } = useForm();
  const { user: salesPersonInfo } = useAuth();
  console.log(salesPersonInfo)


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
        const year = end.getFullYear();
        const month = String(end.getMonth() + 1).padStart(2, "0");
        const day = String(end.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      // Get sales person info (same logic)


      // Keep EXACT payload logic
      const leadData = {
        company: salesPersonInfo.organization?.company,
        adminemailid: salesPersonInfo.user?.adminemailid,
        "clientName": data["Client-Name"],
        "clientEmail": data["Client-Email"],
        "clientContact": data["Client-Contact"],
        "departureCity": data["Client-DepartureCity"],
        "destination": isMultiDestination
          ? selectedDestinations.length > 0
            ? selectedDestinations[0]
            : data["Client-Destination"]
          : data["Client-Destination"],
        "otherDestinations": isMultiDestination
          ? selectedDestinations
          : [data["Client-Destination"]],
        isMultiDestination: isMultiDestination,
        "pax": parseInt(data["Client-Pax"]) || 0,
        "child": parseInt(data["Client-Child"]) || 0,
        "infant": parseInt(data["Client-Infant"]) || 0,
        "days": parseInt(data["Client-Days"]) || 0,
        "budget": parseInt(data["Client-Budget"]) || 0,
        "travelDate": data["Client-TravelDate"]?.date
          ? data["Client-TravelDate"]?.date
          : data["Client-TravelDate"],
        "travelEndDate": data["Client-TravelDate"]?.date
          ? calculateEndDate(
            data["Client-TravelDate"].date,
            parseInt(data["Client-Days"]) || 0
          )
          : calculateEndDate(
            data["Client-TravelDate"],
            parseInt(data["Client-Days"]) || 0
          ),

        leadSource: data.LeadSource || "WebApp",
        leadRating: data.LeadRating || "Warm",
        latestStatus: "LeadCreate",
        salesPersonUid: salesPersonInfo.user?.Email,

        quotations: [],

        comments: [
          {
            By: salesPersonInfo.user?.Email,
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

  const FormField = ({ label, children, required = false, error, icon: Icon }) => (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
        {Icon && <Icon className="h-4 w-4 text-gray-400" />}
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error?.message && (
        <p className="text-xs text-red-600 flex items-center gap-1">
          <span className="text-red-500">•</span>
          {error.message}
        </p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="mx-auto px-4 py-8">
        {/* Header */}


        {/* Personal Information Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="shrink-0 rounded-xl bg-purple-50 p-2.5 ring-1 ring-purple-100">
              <PersonStanding className="h-5 w-5 text-purple-700" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
              <p className="text-sm text-gray-500">Basic client details</p>
            </div>
          </div>

          <div className="space-y-5">
            <FormField
              label="Client Name"
              required
              error={errors["Client-Name"]}
              icon={PersonStanding}
            >
              <Controller
                control={control}
                name="Client-Name"
                rules={{ required: "Client name is required" }}
                render={({ field: { onChange, value } }) => (
                  <input
                    className={`w-full px-4 py-3 rounded-xl border text-base placeholder:text-gray-400 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${errors["Client-Name"] ? "border-red-500 bg-red-50" : "border-gray-200 bg-gray-50"
                      }`}
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
              icon={Phone}
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
                    className={`w-full px-4 py-3 rounded-xl border text-base placeholder:text-gray-400 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${errors["Client-Contact"] ? "border-red-500 bg-red-50" : "border-gray-200 bg-gray-50"
                      }`}
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
              icon={Mail}
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
                    className={`w-full px-4 py-3 rounded-xl border text-base placeholder:text-gray-400 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${errors["Client-Email"] ? "border-red-500 bg-red-50" : "border-gray-200 bg-gray-50"
                      }`}
                    placeholder="client@example.com"
                    value={value || ""}
                    onChange={(e) => onChange(e.target.value)}
                  />
                )}
              />
            </FormField>
          </div>
        </div>

        {/* Travel Information Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="shrink-0 rounded-xl bg-blue-50 p-2.5 ring-1 ring-blue-100">
              <MapPin className="h-5 w-5 text-blue-700" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Travel Information</h2>
              <p className="text-sm text-gray-500">Destination and travel details</p>
            </div>
          </div>

          <div className="space-y-5">
            <FormField label="Departure City" icon={MapPin}>
              <Controller
                control={control}
                name="Client-DepartureCity"
                render={({ field: { onChange, value } }) => (
                  <input
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base placeholder:text-gray-400 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Enter departure city"
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
              icon={MapPin}
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FormField
                label="Duration (Days)"
                required
                error={errors["Client-Days"]}
                icon={Calendar}
              >
                <Controller
                  control={control}
                  name="Client-Days"
                  rules={{ required: "Duration is required" }}
                  render={({ field: { onChange, value } }) => (
                    <input
                      type="number"
                      className={`w-full px-4 py-3 rounded-xl border text-base placeholder:text-gray-400 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${errors["Client-Days"] ? "border-red-500 bg-red-50" : "border-gray-200 bg-gray-50"
                        }`}
                      placeholder="Number of days"
                      inputMode="numeric"
                      maxLength={3}
                      value={value || ""}
                      onChange={(e) => onChange(e.target.value)}
                    />
                  )}
                />
              </FormField>

              <FormField
                label="Travel Date"
                required
                error={errors["Client-TravelDate"]}
                icon={Calendar}
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

            <FormField label="Budget (₹)" error={errors["Client-Budget"]} icon={DollarSign}>
              <Controller
                control={control}
                name="Client-Budget"
                render={({ field: { onChange, value } }) => (
                  <input
                    type="number"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base placeholder:text-gray-400 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Enter budget amount"
                    inputMode="numeric"
                    value={value || ""}
                    onChange={(e) => onChange(e.target.value)}
                  />
                )}
              />
            </FormField>
          </div>
        </div>

        {/* Passenger Information Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="shrink-0 rounded-xl bg-green-50 p-2.5 ring-1 ring-green-100">
              <Users className="h-5 w-5 text-green-700" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Passenger Information</h2>
              <p className="text-sm text-gray-500">Number of travelers</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <FormField
              label="Adults"
              required
              error={errors["Client-Pax"]}
              icon={Users}
            >
              <Controller
                control={control}
                name="Client-Pax"
                rules={{ required: "Number of adults is required" }}
                render={({ field: { onChange, value } }) => (
                  <input
                    type="number"
                    className={`w-full px-4 py-3 rounded-xl border text-base placeholder:text-gray-400 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${errors["Client-Pax"] ? "border-red-500 bg-red-50" : "border-gray-200 bg-gray-50"
                      }`}
                    placeholder="Adults"
                    inputMode="numeric"
                    value={value || ""}
                    onChange={(e) => onChange(e.target.value)}
                  />
                )}
              />
            </FormField>

            <FormField
              label="Children"
              error={errors["Client-Child"]}
              icon={Users}
            >
              <Controller
                control={control}
                name="Client-Child"
                render={({ field: { onChange, value } }) => (
                  <input
                    type="number"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base placeholder:text-gray-400 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Children"
                    inputMode="numeric"
                    value={value || ""}
                    onChange={(e) => onChange(e.target.value)}
                  />
                )}
              />
            </FormField>

            <FormField
              label="Infants"
              error={errors["Client-Infant"]}
              icon={Users}
            >
              <Controller
                control={control}
                name="Client-Infant"
                render={({ field: { onChange, value } }) => (
                  <input
                    type="number"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base placeholder:text-gray-400 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Infants"
                    inputMode="numeric"
                    value={value || ""}
                    onChange={(e) => onChange(e.target.value)}
                  />
                )}
              />
            </FormField>
          </div>
        </div>

        {/* Additional Details Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="shrink-0 rounded-xl bg-amber-50 p-2.5 ring-1 ring-amber-100">
              <MessageSquare className="h-5 w-5 text-amber-700" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Additional Details</h2>
              <p className="text-sm text-gray-500">Comments and special requirements</p>
            </div>
          </div>

          <FormField label="Additional Comments" error={errors.Comments} icon={MessageSquare}>
            <Controller
              control={control}
              name="Comments"
              render={({ field: { onChange, value } }) => (
                <textarea
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base placeholder:text-gray-400 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-vertical"
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
        <div className="flex justify-center pt-4">
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            type="button"
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-8 py-3.5 text-base font-semibold text-white shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${isSubmitting
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 active:translate-y-px"
              }`}
          >
            {isSubmitting ? (
              <>
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Creating Lead...</span>
              </>
            ) : (
              <>
                <Send className="h-5 w-5" />
                <span>Create Lead</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
