import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import * as XLSX from "xlsx";

// Replace these imports with your web versions
import Navbar from "../components/Navbar";
import CalendarDatePicker from "../components/DatePicker";
import CustomPicker from "../components/CustomPicker";
import { getUserProfile } from "../utils/getUserProfile";
import { PersonStanding, MapPin, Calendar, Users, DollarSign, Mail, Phone, MessageSquare, Send, FileSpreadsheet, Upload, Download } from "lucide-react";
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

  // State for excel bulk import
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });

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


      // Keep EXACT payload logic
      const leadData = {
        company: salesPersonInfo.organization?.company,

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

  const handleDownloadSample = () => {
    // Define headers and sample rows of data
    const sampleData = [
      {
        "Client Name": "John Doe",
        "Contact Number": "9876543210",
        "Email Address": "john.doe@example.com",
        "Departure City": "Mumbai",
        "Destination": "Bali",
        "Duration (Days)": 5,
        "Travel Date": "2026-08-15",
        "Budget": 60000,
        "Adults": 2,
        "Children": 1,
        "Infants": 0,
        "Comments": "Vegetarian meals, pool villa requested.",
      },
      {
        "Client Name": "Jane Smith",
        "Contact Number": "9988776655",
        "Email Address": "jane.smith@example.com",
        "Departure City": "Delhi",
        "Destination": "Maldives",
        "Duration (Days)": 4,
        "Travel Date": "2026-09-01",
        "Budget": 120000,
        "Adults": 2,
        "Children": 0,
        "Infants": 0,
        "Comments": "Honeymoon couple, beachfront villa.",
      }
    ];

    // Create workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Leads Template");

    // Adjust column widths automatically
    const max_width = [
      { wch: 20 }, // Client Name
      { wch: 18 }, // Contact Number
      { wch: 25 }, // Email Address
      { wch: 18 }, // Departure City
      { wch: 15 }, // Destination
      { wch: 18 }, // Duration (Days)
      { wch: 15 }, // Travel Date
      { wch: 12 }, // Budget
      { wch: 8 },  // Adults
      { wch: 10 }, // Children
      { wch: 8 },  // Infants
      { wch: 40 }  // Comments
    ];
    worksheet["!cols"] = max_width;

    // Generate buffer and trigger download
    XLSX.writeFile(workbook, "lead_import_sample.xlsx");
  };

  const handleExcelUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset input value to allow uploading the same file again if needed
    event.target.value = "";

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array", cellDates: true });
        
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert sheet to json
        const rawRows = XLSX.utils.sheet_to_json(worksheet, { raw: false, defval: "" });
        
        if (rawRows.length === 0) {
          toast.error("The uploaded Excel file contains no data rows.");
          return;
        }

        const processedLeads = [];
        const errorsList = [];

        // Helper to format date cleanly as YYYY-MM-DD
        const formatDate = (dateVal) => {
          if (!dateVal) return "";
          if (dateVal instanceof Date) {
            if (!isNaN(dateVal.getTime())) {
              return dateVal.toISOString().split("T")[0];
            }
          }
          if (typeof dateVal === "string") {
            const cleanStr = dateVal.trim();
            if (/^\d{4}-\d{2}-\d{2}$/.test(cleanStr)) {
              return cleanStr;
            }
            const parsed = new Date(cleanStr);
            if (!isNaN(parsed.getTime())) {
              return parsed.toISOString().split("T")[0];
            }
            return cleanStr;
          }
          return String(dateVal);
        };

        rawRows.forEach((row, index) => {
          const rowNum = index + 2; // header is row 1
          
          const name = (row["Client Name"] || "").toString().trim();
          const contact = (row["Contact Number"] || "").toString().trim();
          const email = (row["Email Address"] || "").toString().trim();
          const departureCity = (row["Departure City"] || "").toString().trim();
          const destinationRaw = (row["Destination"] || "").toString().trim();
          const durationStr = (row["Duration (Days)"] || "").toString().trim();
          const travelDateRaw = row["Travel Date"];
          const budgetStr = (row["Budget"] || "").toString().trim();
          const adultsStr = (row["Adults"] || "").toString().trim();
          const childrenStr = (row["Children"] || "").toString().trim();
          const infantsStr = (row["Infants"] || "").toString().trim();
          const comments = (row["Comments"] || "").toString().trim();

          const validationErrors = [];

          if (!name) validationErrors.push("Client Name is required");
          if (!contact) {
            validationErrors.push("Contact Number is required");
          } else if (contact.length < 10) {
            validationErrors.push("Contact Number must be at least 10 digits");
          }
          if (!email) {
            validationErrors.push("Email Address is required");
          } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
            validationErrors.push("Invalid Email Address format");
          }
          if (!destinationRaw) {
            validationErrors.push("Destination is required");
          }
          if (!durationStr) {
            validationErrors.push("Duration (Days) is required");
          } else if (isNaN(parseInt(durationStr)) || parseInt(durationStr) <= 0) {
            validationErrors.push("Duration must be a positive number");
          }
          
          const formattedTravelDate = formatDate(travelDateRaw);
          if (!formattedTravelDate) {
            validationErrors.push("Travel Date is required");
          } else if (!/^\d{4}-\d{2}-\d{2}$/.test(formattedTravelDate)) {
            validationErrors.push("Travel Date must be in YYYY-MM-DD format");
          }
          
          if (!adultsStr) {
            validationErrors.push("Adults count is required");
          } else if (isNaN(parseInt(adultsStr)) || parseInt(adultsStr) <= 0) {
            validationErrors.push("Adults count must be a positive number");
          }

          let destination = destinationRaw;
          if (destinationRaw) {
            const matched = DestinationList.find(d => d.toLowerCase() === destinationRaw.toLowerCase());
            if (matched) {
              destination = matched;
            }
          }

          if (validationErrors.length > 0) {
            errorsList.push(`Row ${rowNum}: ${validationErrors.join(", ")}`);
          } else {
            processedLeads.push({
              rowNum,
              data: {
                name,
                contact,
                email,
                departureCity,
                destination,
                days: parseInt(durationStr),
                travelDate: formattedTravelDate,
                budget: parseInt(budgetStr) || 0,
                pax: parseInt(adultsStr),
                child: parseInt(childrenStr) || 0,
                infant: parseInt(infantsStr) || 0,
                comments: comments || "Imported via Excel upload"
              }
            });
          }
        });

        if (errorsList.length > 0) {
          const errorMsg = `Failed to parse Excel file due to validation errors:\n\n` + 
            errorsList.slice(0, 8).join("\n") + 
            (errorsList.length > 8 ? `\n...and ${errorsList.length - 8} more errors.` : "") +
            `\n\nPlease correct the file and try again.`;
          window.alert(errorMsg);
          return;
        }

        const confirmImport = window.confirm(`Found ${processedLeads.length} valid leads. Do you want to import them now?`);
        if (!confirmImport) return;

        setIsImporting(true);
        setImportProgress({ current: 0, total: processedLeads.length });

        let successCount = 0;
        let failCount = 0;
        const uploadFailures = [];

        const calculateEndDate = (startDate, days) => {
          const start = new Date(startDate);
          const end = new Date(start);
          end.setDate(start.getDate() + days - 1);
          return end.toISOString().split("T")[0];
        };

        for (let i = 0; i < processedLeads.length; i++) {
          const lead = processedLeads[i];
          setImportProgress({ current: i + 1, total: processedLeads.length });

          const leadData = {
            company: salesPersonInfo?.organization?.company,
            clientName: lead.data.name,
            clientEmail: lead.data.email,
            clientContact: lead.data.contact,
            departureCity: lead.data.departureCity,
            destination: lead.data.destination,
            otherDestinations: [lead.data.destination],
            isMultiDestination: false,
            pax: lead.data.pax,
            child: lead.data.child,
            infant: lead.data.infant,
            days: lead.data.days,
            budget: lead.data.budget,
            travelDate: lead.data.travelDate,
            travelEndDate: calculateEndDate(lead.data.travelDate, lead.data.days),
            leadSource: "ExcelUpload",
            leadRating: "Warm",
            latestStatus: "LeadCreate",
            salesPersonUid: salesPersonInfo?.user?.Email,
            quotations: [],
            comments: [
              {
                By: salesPersonInfo?.user?.Email,
                Role: "Sales",
                Message: lead.data.comments,
                At: new Date().toISOString(),
              },
            ],
          };

          try {
            const response = await fetch(
              "https://0rq0f90i05.execute-api.ap-south-1.amazonaws.com/salesapp/lead-managment/create-quote",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(leadData),
              }
            );

            if (response.ok) {
              successCount++;
            } else {
              const resJson = await response.json().catch(() => ({}));
              failCount++;
              uploadFailures.push(`Row ${lead.rowNum} (${lead.data.name}): ${resJson.message || 'Server error ' + response.status}`);
            }
          } catch (err) {
            failCount++;
            uploadFailures.push(`Row ${lead.rowNum} (${lead.data.name}): Network error`);
          }
        }

        setIsImporting(false);
        
        if (failCount === 0) {
          toast.success(`Successfully imported all ${successCount} leads!`);
          navigate("/");
        } else {
          const summary = `Import complete.\n` +
            `- Successful: ${successCount}\n` +
            `- Failed: ${failCount}\n\n` +
            `Errors:\n` + uploadFailures.join("\n");
          window.alert(summary);
          if (successCount > 0) {
            navigate("/");
          }
        }
      } catch (err) {
        console.error("Error reading file:", err);
        window.alert("Error reading Excel file. Please ensure it is a valid format.");
      }
    };
    reader.readAsArrayBuffer(file);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 relative">
      {/* Excel Upload Progress Modal Overlay */}
      {isImporting && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-center space-y-4 border border-gray-100">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-purple-600 border-t-transparent mx-auto flex items-center justify-center shadow-md" />
            <h3 className="text-xl font-bold text-gray-900">Importing Leads...</h3>
            <p className="text-sm text-gray-500">
              Processing lead <span className="font-semibold text-purple-600">{importProgress.current}</span> of{" "}
              <span className="font-semibold text-gray-950">{importProgress.total}</span>
            </p>
            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden shadow-inner">
              <div
                className="bg-gradient-to-r from-purple-600 to-indigo-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${(importProgress.current / importProgress.total) * 100}%` }}
              />
            </div>
            <p className="text-xs text-amber-600 font-semibold animate-pulse">Please keep this window open while processing.</p>
          </div>
        </div>
      )}

      <div className="mx-auto px-4 py-8 max-w-4xl">
        {/* Bulk Import leads from Excel */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6 bg-gradient-to-r from-purple-500/5 to-indigo-500/5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
            <div className="flex items-center gap-3.5">
              <div className="shrink-0 rounded-xl bg-purple-50 p-3 ring-1 ring-purple-100">
                <FileSpreadsheet className="h-6 w-6 text-purple-700" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Bulk Import Leads</h2>
                <p className="text-xs text-gray-500 font-medium">Create multiple leads instantly using an Excel template</p>
              </div>
            </div>
            
            <button
              onClick={handleDownloadSample}
              type="button"
              className="inline-flex items-center justify-center gap-2 px-4.5 py-2.5 border border-purple-200 hover:border-purple-300 rounded-xl text-purple-700 font-bold bg-white hover:bg-purple-50/50 active:scale-95 transition-all text-sm shadow-sm"
            >
              <Download className="h-4 w-4" />
              <span>Download Sample Template</span>
            </button>
          </div>

          <div className="mt-6">
            <label className="relative flex flex-col items-center justify-center border-2 border-dashed border-purple-200 hover:border-purple-400 bg-purple-50/10 hover:bg-purple-50/30 rounded-2xl p-8 cursor-pointer transition-all duration-300 group">
              <input
                type="file"
                accept=".xlsx, .xls"
                className="hidden"
                onChange={handleExcelUpload}
                disabled={isImporting}
              />
              <div className="flex flex-col items-center justify-center text-center space-y-2">
                <div className="p-3 bg-purple-50 rounded-full text-purple-600 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                  <Upload className="h-6 w-6" />
                </div>
                <p className="text-base font-bold text-gray-700">Click to upload or drag & drop</p>
                <p className="text-xs text-gray-400 font-medium">Supports Excel sheets (.xlsx, .xls) only</p>
              </div>
            </label>
          </div>
        </div>

        {/* Divider for manual creation */}
        <div className="relative flex items-center justify-center my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <span className="relative bg-gray-50 px-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Or create manually</span>
        </div>


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
