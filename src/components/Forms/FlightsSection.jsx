import React, { useEffect, useState } from "react";
import { useFormContext, Controller } from "react-hook-form";
import {
  Plane,
  Search,
  X,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import CalendarDatePicker from "../DatePicker";

/* ================= COMPONENT ================= */

const FlightSection = () => {
  const {
    control,
    formState: { errors },
    watch,
    setValue,
  } = useFormContext();

  /* ---------- State ---------- */
  const [showFlightModal, setShowFlightModal] = useState(false);
  const [flightResults, setFlightResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFlights, setSelectedFlights] = useState(
    watch("selectedFlights") || []
  );

  /* ---------- Sync selectedFlights ---------- */
  useEffect(() => {
    const sub = watch((value, { name }) => {
      if (name === "selectedFlights") {
        setSelectedFlights(value.selectedFlights || []);
      }
    });
    return () => sub.unsubscribe();
  }, [watch]);

  /* ---------- Flight Search ---------- */
  const searchFlights = async () => {
    const from = watch("OutboundFlight.from");
    const to = watch("OutboundFlight.to");
    const departureDate = watch("OutboundFlight.departureDate");
    const adults = watch("NoOfPax");

    if (!from || !to || !departureDate || !adults) {
      window.alert(
        "Please fill departure city, arrival city, date and number of adults."
      );
      return;
    }

    setLoading(true);
    setShowFlightModal(true);

    try {
      const qs = new URLSearchParams({
        departure_id: String(from),
        arrival_id: String(to),
        outbound_date: String(departureDate),
        type: "2",
        adults: String(adults),
        currency: "INR",
        deep_search: "False",
        sort_by: "2",
        isBase64Encoded: "false",
      });

      const res = await fetch(
        `https://zkfiphmsa5.execute-api.ap-south-1.amazonaws.com/salesapp/flights-search?${qs.toString()}`
      );

      const data = await res.json();

      let results = [];
      if (Array.isArray(data?.other_flights)) {
        results = data.other_flights;
      } else if (Array.isArray(data)) {
        results = data;
      } else if (data && typeof data === "object") {
        results = [data];
      }

      setFlightResults(results);
    } catch (err) {
      console.error("Flight search error:", err);
      window.alert("Failed to search flights.");
      setFlightResults([]);
    } finally {
      setLoading(false);
    }
  };

  /* ---------- Select / Unselect ---------- */
  const toggleFlightSelection = (flight) => {
    const exists = selectedFlights.find(
      (f) => f.booking_token === flight.booking_token
    );

    if (exists) {
      setSelectedFlights((prev) =>
        prev.filter((f) => f.booking_token !== flight.booking_token)
      );
    } else {
      setSelectedFlights((prev) => [...prev, flight]);
    }
  };

  /* ---------- Save Selected ---------- */
  const saveSelectedFlights = () => {
    const totalPrice = selectedFlights.reduce((sum, f) => {
      const price =
        parseFloat(f.customPrice) ||
        parseFloat(f.price) ||
        0;
      return sum + price;
    }, 0);

    setValue("selectedFlights", selectedFlights, {
      shouldDirty: true,
      shouldValidate: true,
    });

    setValue("Costs.FlightCost", totalPrice.toFixed(2), {
      shouldDirty: true,
      shouldValidate: true,
    });

    setShowFlightModal(false);
    window.alert(
      `${selectedFlights.length} flight(s) selected. Total ₹${totalPrice.toFixed(
        2
      )}`
    );
  };

  /* ---------- UI ---------- */
  return (
    <div style={styles.card}>
      {/* Header */}
      <div style={styles.sectionHeader}>
        <div style={styles.iconWrapper}>
          <Plane size={20} color="#3b82f6" />
        </div>
        <div style={styles.sectionTitle}>Flight Information</div>
      </div>

      {/* Outbound */}
      <div style={styles.sectionSubtitle}>Outbound Flight</div>

      <div style={styles.row}>
        <FormInput
          label="From"
          name="OutboundFlight.from"
          placeholder="Departure city"
          error={errors?.OutboundFlight?.from}
        />
        <FormInput
          label="To"
          name="OutboundFlight.to"
          placeholder="Arrival city"
          error={errors?.OutboundFlight?.to}
        />
      </div>

      <FormDate
        label="Departure Date"
        name="OutboundFlight.departureDate"
        error={errors?.OutboundFlight?.departureDate}
      />

      <button onClick={searchFlights} style={styles.searchButton}>
        <Search size={18} />
        <span>Search Flights</span>
      </button>

      {/* Selected Flights */}
      {selectedFlights.length > 0 && (
        <div style={styles.selectedFlights}>
          <div style={styles.selectedTitle}>
            Selected Flights ({selectedFlights.length})
          </div>

          {selectedFlights.map((flight, index) => {
            const first = flight?.flights?.[0];
            const last =
              flight?.flights?.[flight.flights.length - 1];

            return (
              <div key={flight.booking_token || index} style={styles.selectedCard}>
                <div>
                  <div style={styles.airline}>
                    {first?.airline || "Unknown Airline"}
                  </div>
                  <div style={styles.route}>
                    {first?.departure_airport?.id} →{" "}
                    {last?.arrival_airport?.id}
                  </div>
                </div>

                <button
                  onClick={() => toggleFlightSelection(flight)}
                  style={styles.removeBtn}
                >
                  <X size={18} />
                </button>

                <div style={styles.priceBox}>
                  <div>Original Price: ₹{flight.price}</div>

                  <Controller
                    control={control}
                    name={`selectedFlights.${index}.customPrice`}
                    render={({ field }) => (
                      <input
                        {...field}
                        placeholder="Custom price"
                        style={styles.priceInput}
                      />
                    )}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showFlightModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <div>Flight Search Results</div>
              <button onClick={() => setShowFlightModal(false)}>
                <X />
              </button>
            </div>

            {loading ? (
              <div style={styles.loader}>Searching flights…</div>
            ) : (
              <div style={styles.results}>
                {flightResults.length === 0 ? (
                  <div>No flights found</div>
                ) : (
                  flightResults.map((flight, i) => {
                    const selected = selectedFlights.find(
                      (f) =>
                        f.booking_token === flight.booking_token
                    );

                    const first = flight?.flights?.[0];
                    const last =
                      flight?.flights?.[flight.flights.length - 1];

                    return (
                      <div
                        key={flight.booking_token || i}
                        onClick={() =>
                          toggleFlightSelection(flight)
                        }
                        style={{
                          ...styles.flightCard,
                          ...(selected
                            ? styles.flightSelected
                            : {}),
                        }}
                      >
                        <div style={styles.flightRow}>
                          <strong>
                            {first?.airline || "Unknown"}
                          </strong>
                          <span>₹{flight.price}</span>
                        </div>

                        <div style={styles.flightRow}>
                          <span>
                            {first?.departure_airport?.id}
                          </span>
                          <ArrowRight size={14} />
                          <span>
                            {last?.arrival_airport?.id}
                          </span>
                        </div>

                        {selected && (
                          <CheckCircle
                            size={20}
                            color="#10b981"
                          />
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {selectedFlights.length > 0 && !loading && (
              <div style={styles.modalFooter}>
                <button
                  onClick={saveSelectedFlights}
                  style={styles.saveBtn}
                >
                  Save Selected Flights
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/* ================= SMALL FIELDS ================= */

const FormInput = ({ label, name, placeholder, error }) => {
  const { control } = useFormContext();
  return (
    <div style={{ flex: 1 }}>
      <label style={styles.label}>{label}</label>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <input
            {...field}
            placeholder={placeholder}
            style={{
              ...styles.input,
              ...(error ? styles.errorInput : {}),
            }}
          />
        )}
      />
    </div>
  );
};

const FormDate = ({ label, name, error }) => {
  const { control } = useFormContext();
  return (
    <div>
      <label style={styles.label}>{label}</label>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <CalendarDatePicker
            value={field.value}
            onDateChange={field.onChange}
          />
        )}
      />
      {error && <div style={styles.errorText}>{error.message}</div>}
    </div>
  );
};

/* ================= STYLES ================= */

const styles = {
  card: {
    background: "white",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  iconWrapper: {
    background: "#dbeafe",
    padding: 8,
    borderRadius: 50,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 700,
  },
  sectionSubtitle: {
    fontWeight: 600,
    marginBottom: 12,
  },
  row: {
    display: "flex",
    gap: 12,
  },
  label: {
    fontWeight: 600,
    marginBottom: 6,
    display: "block",
  },
  input: {
    width: "100%",
    padding: 12,
    borderRadius: 12,
    border: "1px solid #e5e7eb",
  },
  errorInput: {
    borderColor: "#ef4444",
  },
  searchButton: {
    marginTop: 16,
    padding: 14,
    borderRadius: 12,
    background: "#7c3aed",
    color: "white",
    display: "flex",
    alignItems: "center",
    gap: 8,
    justifyContent: "center",
    border: "none",
    cursor: "pointer",
  },
  selectedFlights: {
    marginTop: 16,
  },
  selectedTitle: {
    fontWeight: 600,
    marginBottom: 8,
  },
  selectedCard: {
    border: "1px solid #10b981",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  airline: {
    fontWeight: 600,
  },
  route: {
    fontSize: 14,
  },
  removeBtn: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
  },
  priceBox: {
    marginTop: 8,
  },
  priceInput: {
    marginTop: 6,
    padding: 8,
    width: "100%",
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    zIndex: 1000,
  },
  modal: {
    background: "white",
    maxWidth: 720,
    margin: "40px auto",
    borderRadius: 16,
    padding: 16,
    maxHeight: "85vh",
    overflow: "auto",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  results: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  flightCard: {
    border: "1px solid #e5e7eb",
    padding: 12,
    borderRadius: 12,
    cursor: "pointer",
  },
  flightSelected: {
    borderColor: "#10b981",
    background: "#f0fdf4",
  },
  flightRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalFooter: {
    marginTop: 12,
  },
  saveBtn: {
    width: "100%",
    padding: 14,
    background: "#10b981",
    color: "white",
    borderRadius: 12,
    border: "none",
    cursor: "pointer",
  },
  loader: {
    padding: 40,
    textAlign: "center",
  },
  errorText: {
    color: "#ef4444",
    fontSize: 12,
  },
};

export default FlightSection;
