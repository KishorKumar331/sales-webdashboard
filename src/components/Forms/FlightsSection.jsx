import React, { useEffect, useState } from "react";
import { useFormContext, Controller } from "react-hook-form";
import {
  Plane,
  Search,
  X,
  CheckCircle,
  ArrowRight,
  Clock,
  MapPin,
  Calendar,
  Users,
  Loader2,
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
  const [isAnimating, setIsAnimating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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
      showNotification("Please fill departure city, arrival city, date and number of adults.", "error");
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
      showNotification("Failed to search flights.", "error");
      setFlightResults([]);
    } finally {
      setLoading(false);
    }
  };

  /* ---------- Notification Helper ---------- */
  const showNotification = (message, type = "info") => {
    // Create a simple notification (you can replace this with a toast library)
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 16px 20px;
      background: ${type === 'error' ? '#ef4444' : '#10b981'};
      color: white;
      borderRadius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 9999;
      animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
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
    setIsAnimating(true);
    
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

    setTimeout(() => {
      setShowFlightModal(false);
      showNotification(
        `${selectedFlights.length} flight(s) selected. Total ₹${totalPrice.toFixed(2)}`,
        "success"
      );
      setIsAnimating(false);
    }, 300);
  };

  /* ---------- UI ---------- */
  return (
    <div style={styles.card}>
      {/* Header */}
      <div style={styles.sectionHeader}>
        <div style={styles.iconWrapper}>
          <Plane size={24} color="#3b82f6" />
        </div>
        <div>
          <div style={styles.sectionTitle}>Flight Information</div>
          <div style={styles.sectionSubtitle}>Search and select flights for your trip</div>
        </div>
      </div>

      {/* Outbound */}
      <div style={styles.sectionCard}>
        <div style={styles.sectionCardHeader}>
          <div style={styles.sectionCardTitle}>Outbound Flight</div>
          <div style={styles.sectionCardDescription}>Enter your departure and arrival details</div>
        </div>

        <div style={styles.formGrid}>
          <div style={styles.inputGroup}>
            <div style={styles.inputLabel}>
              <MapPin size={16} color="#6b7280" />
              <span>From</span>
            </div>
            <FormInput
              name="OutboundFlight.from"
              placeholder="Departure city"
              error={errors?.OutboundFlight?.from}
            />
          </div>
          <div style={styles.inputGroup}>
            <div style={styles.inputLabel}>
              <MapPin size={16} color="#6b7280" />
              <span>To</span>
            </div>
            <FormInput
              name="OutboundFlight.to"
              placeholder="Arrival city"
              error={errors?.OutboundFlight?.to}
            />
          </div>
        </div>

        <div style={styles.inputGroup}>
          <div style={styles.inputLabel}>
            <Calendar size={16} color="#6b7280" />
            <span>Departure Date</span>
          </div>
          <FormDate
            name="OutboundFlight.departureDate"
            error={errors?.OutboundFlight?.departureDate}
          />
        </div>

        <div style={styles.inputGroup}>
          <div style={styles.inputLabel}>
            <Users size={16} color="#6b7280" />
            <span>Number of Passengers</span>
          </div>
          <FormInput
            name="NoOfPax"
            placeholder="Number of adults"
            error={errors?.NoOfPax}
          />
        </div>

        <button 
          onClick={searchFlights} 
          style={styles.searchButton}
          className="flight-search-btn"
        >
          <Search size={20} />
          <span>Search Flights</span>
        </button>
      </div>

      {/* Selected Flights */}
      {selectedFlights.length > 0 && (
        <div style={styles.selectedFlightsSection}>
          <div style={styles.selectedFlightsHeader}>
            <div style={styles.selectedFlightsTitle}>
              <CheckCircle size={20} color="#10b981" />
              <span>Selected Flights ({selectedFlights.length})</span>
            </div>
            <div style={styles.totalPrice}>
              Total: ₹{selectedFlights.reduce((sum, f) => 
                sum + (parseFloat(f.customPrice) || parseFloat(f.price) || 0), 0
              ).toFixed(2)}
            </div>
          </div>

          <div style={styles.selectedFlightsGrid}>
            {selectedFlights.map((flight, index) => {
              const first = flight?.flights?.[0];
              const last = flight?.flights?.[flight.flights.length - 1];

              return (
                <div 
                  key={flight.booking_token || index} 
                  style={{
                    ...styles.selectedCard,
                    animation: `slideUp 0.3s ease ${index * 0.1}s both`
                  }}
                >
                  <div style={styles.selectedCardHeader}>
                    <div style={styles.airlineInfo}>
                      <div style={styles.airlineLogo}>
                        <Plane size={16} color="#3b82f6" />
                      </div>
                      <div>
                        <div style={styles.airline}>
                          {first?.airline || "Unknown Airline"}
                        </div>
                        <div style={styles.flightNumber}>
                          {first?.flight_number || "N/A"}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleFlightSelection(flight)}
                      style={styles.removeBtn}
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div style={styles.routeInfo}>
                    <div style={styles.routePoint}>
                      <div style={styles.routeCode}>{first?.departure_airport?.id}</div>
                      <div style={styles.routeCity}>{first?.departure_airport?.city_name || "Departure"}</div>
                      <div style={styles.routeTime}>{first?.departure_time || "--:--"}</div>
                    </div>
                    <div style={styles.routeArrow}>
                      <ArrowRight size={16} color="#6b7280" />
                    </div>
                    <div style={styles.routePoint}>
                      <div style={styles.routeCode}>{last?.arrival_airport?.id}</div>
                      <div style={styles.routeCity}>{last?.arrival_airport?.city_name || "Arrival"}</div>
                      <div style={styles.routeTime}>{last?.arrival_time || "--:--"}</div>
                    </div>
                  </div>

                  <div style={styles.priceSection}>
                    <div style={styles.priceRow}>
                      <span style={styles.priceLabel}>Original Price:</span>
                      <span style={styles.originalPrice}>₹{flight.price}</span>
                    </div>
                    <div style={styles.customPriceRow}>
                      <span style={styles.priceLabel}>Custom Price:</span>
                      <Controller
                        control={control}
                        name={`selectedFlights.${index}.customPrice`}
                        render={({ field }) => (
                          <input
                            {...field}
                            placeholder="Enter custom price"
                            style={styles.priceInput}
                          />
                        )}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal */}
      {showFlightModal && (
        <div style={styles.modalOverlay} onClick={() => setShowFlightModal(false)}>
          <div 
            style={{
              ...styles.modal,
              ...(isAnimating ? styles.modalAnimating : {})
            }} 
            onClick={(e) => e.stopPropagation()}
          >
            <div style={styles.modalHeader}>
              <div style={styles.modalTitle}>
                <Search size={20} color="#3b82f6" />
                <span>Flight Search Results</span>
              </div>
              <button 
                onClick={() => setShowFlightModal(false)}
                style={styles.modalCloseBtn}
              >
                <X size={20} />
              </button>
            </div>

            {/* Search Bar */}
            <div style={styles.searchBar}>
              <Search size={18} color="#9ca3af" style={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search flights by airline or route..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchInput}
              />
            </div>

            {loading ? (
              <div style={styles.loaderContainer}>
                <Loader2 size={32} color="#3b82f6" style={styles.spinner} />
                <div style={styles.loaderText}>Searching flights…</div>
              </div>
            ) : (
              <div style={styles.results}>
                {flightResults.length === 0 ? (
                  <div style={styles.noResults}>
                    <div style={styles.noResultsIcon}>✈️</div>
                    <div style={styles.noResultsText}>No flights found</div>
                    <div style={styles.noResultsSubtext}>Try adjusting your search criteria</div>
                  </div>
                ) : (
                  flightResults
                    .filter(flight => {
                      const first = flight?.flights?.[0];
                      const last = flight?.flights?.[flight.flights.length - 1];
                      const searchLower = searchQuery.toLowerCase();
                      return (
                        first?.airline?.toLowerCase().includes(searchLower) ||
                        first?.departure_airport?.id?.toLowerCase().includes(searchLower) ||
                        last?.arrival_airport?.id?.toLowerCase().includes(searchLower)
                      );
                    })
                    .map((flight, i) => {
                      const selected = selectedFlights.find(
                        (f) => f.booking_token === flight.booking_token
                      );

                      const first = flight?.flights?.[0];
                      const last = flight?.flights?.[flight.flights.length - 1];

                      return (
                        <div
                          key={flight.booking_token || i}
                          onClick={() => toggleFlightSelection(flight)}
                          style={{
                            ...styles.flightCard,
                            ...(selected ? styles.flightSelected : {}),
                            animation: `fadeIn 0.2s ease ${i * 0.05}s both`
                          }}
                        >
                          <div style={styles.flightCardHeader}>
                            <div style={styles.flightAirline}>
                              <div style={styles.flightAirlineLogo}>
                                <Plane size={16} color="#3b82f6" />
                              </div>
                              <div>
                                <div style={styles.flightAirlineName}>
                                  {first?.airline || "Unknown"}
                                </div>
                                <div style={styles.flightNumber}>
                                  {first?.flight_number || "N/A"}
                                </div>
                              </div>
                            </div>
                            <div style={styles.flightPrice}>
                              ₹{flight.price}
                            </div>
                          </div>

                          <div style={styles.flightRoute}>
                            <div style={styles.flightRoutePoint}>
                              <div style={styles.flightRouteCode}>{first?.departure_airport?.id}</div>
                              <div style={styles.flightRouteTime}>{first?.departure_time || "--:--"}</div>
                            </div>
                            <div style={styles.flightRouteArrow}>
                              <ArrowRight size={14} color="#6b7280" />
                            </div>
                            <div style={styles.flightRoutePoint}>
                              <div style={styles.flightRouteCode}>{last?.arrival_airport?.id}</div>
                              <div style={styles.flightRouteTime}>{last?.arrival_time || "--:--"}</div>
                            </div>
                          </div>

                          {selected && (
                            <div style={styles.selectedIndicator}>
                              <CheckCircle size={20} color="#10b981" />
                              <span>Selected</span>
                            </div>
                          )}
                        </div>
                      );
                    })
                )}
              </div>
            )}

            {selectedFlights.length > 0 && !loading && (
              <div style={styles.modalFooter}>
                <div style={styles.modalFooterInfo}>
                  <div style={styles.selectedCount}>
                    {selectedFlights.length} flight(s) selected
                  </div>
                  <div style={styles.totalAmount}>
                    Total: ₹{selectedFlights.reduce((sum, f) => 
                      sum + (parseFloat(f.customPrice) || parseFloat(f.price) || 0), 0
                    ).toFixed(2)}
                  </div>
                </div>
                <button
                  onClick={saveSelectedFlights}
                  style={{
                    ...styles.saveBtn,
                    ...(isAnimating ? styles.buttonAnimating : {})
                  }}
                >
                  <CheckCircle size={18} />
                  <span>Save Selected Flights</span>
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

const FormInput = ({ name, placeholder, error }) => {
  const { control } = useFormContext();
  return (
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
  );
};

const FormDate = ({ name, error }) => {
  const { control } = useFormContext();
  return (
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
  );
};

/* ================= STYLES ================= */

const styles = {
  card: {
    background: "white",
    padding: 24,
    borderRadius: 20,
    marginBottom: 20,
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)",
    border: "1px solid #f3f4f6",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
  },
  iconWrapper: {
    background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
    padding: 12,
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 4px rgba(59,130,246,0.1)",
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 700,
    color: "#111827",
    letterSpacing: "-0.025em",
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
    fontWeight: 500,
  },
  sectionCard: {
    background: "linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    border: "1px solid #e5e7eb",
  },
  sectionCardHeader: {
    marginBottom: 20,
  },
  sectionCardTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: "#374151",
    marginBottom: 4,
  },
  sectionCardDescription: {
    fontSize: 14,
    color: "#6b7280",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
    fontSize: 14,
    fontWeight: 600,
    color: "#374151",
  },
  input: {
    width: "100%",
    padding: "12px 16px",
    borderRadius: 12,
    border: "2px solid #e5e7eb",
    fontSize: 14,
    transition: "all 0.2s ease",
    backgroundColor: "white",
    boxSizing: "border-box",
  },

  errorInput: {
    borderColor: "#ef4444",
  },
  searchButton: {
    width: "100%",
    padding: "16px 24px",
    borderRadius: 12,
    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    border: "none",
    cursor: "pointer",
    fontSize: 16,
    fontWeight: 600,
    transition: "all 0.2s ease",
    boxShadow: "0 4px 6px rgba(59,130,246,0.25)",
  },

  selectedFlightsSection: {
    marginTop: 24,
  },
  selectedFlightsHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    padding: "16px 20px",
    background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
    borderRadius: 12,
    border: "1px solid #bbf7d0",
  },
  selectedFlightsTitle: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 16,
    fontWeight: 600,
    color: "#166534",
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: 700,
    color: "#166534",
  },
  selectedFlightsGrid: {
    display: "grid",
    gap: 16,
  },
  selectedCard: {
    background: "white",
    border: "2px solid #e5e7eb",
    borderRadius: 16,
    padding: 20,
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    transition: "all 0.2s ease",
  },

  selectedCardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  airlineInfo: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  airlineLogo: {
    width: 40,
    height: 40,
    borderRadius: 8,
    background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  airline: {
    fontSize: 16,
    fontWeight: 600,
    color: "#111827",
  },
  flightNumber: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  removeBtn: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: 8,
    borderRadius: 8,
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  routeInfo: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    marginBottom: 16,
    padding: "16px 0",
    borderTop: "1px solid #f3f4f6",
    borderBottom: "1px solid #f3f4f6",
  },
  routePoint: {
    textAlign: "center",
    flex: 1,
  },
  routeCode: {
    fontSize: 18,
    fontWeight: 700,
    color: "#111827",
  },
  routeCity: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  routeTime: {
    fontSize: 14,
    color: "#374151",
    marginTop: 4,
    fontWeight: 500,
  },
  routeArrow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  priceSection: {
    display: "grid",
    gap: 12,
  },
  priceRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceLabel: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: 500,
  },
  originalPrice: {
    fontSize: 14,
    color: "#374151",
    fontWeight: 600,
  },
  customPriceRow: {
    display: "flex",
    gap: 12,
    alignItems: "center",
  },
  priceInput: {
    flex: 1,
    padding: "8px 12px",
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    fontSize: 14,
    transition: "all 0.2s ease",
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backdropFilter: "blur(4px)",
  },
  modal: {
    background: "white",
    maxWidth: 900,
    width: "90%",
    maxHeight: "90vh",
    borderRadius: 20,
    padding: 24,
    boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
    border: "1px solid #f3f4f6",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  modalAnimating: {
    transform: "scale(0.95)",
    opacity: 0.8,
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 16,
    borderBottom: "1px solid #f3f4f6",
  },
  modalTitle: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 20,
    fontWeight: 700,
    color: "#111827",
  },
  modalCloseBtn: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: 8,
    borderRadius: 8,
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  searchBar: {
    position: "relative",
    marginBottom: 20,
  },
  searchIcon: {
    position: "absolute",
    left: 14,
    top: "50%",
    transform: "translateY(-50%)",
    pointerEvents: "none",
    zIndex: 1,
  },
  searchInput: {
    width: "100%",
    padding: "12px 16px 12px 44px",
    border: "2px solid #e5e7eb",
    borderRadius: 12,
    fontSize: 14,
    transition: "all 0.2s ease",
    backgroundColor: "#f9fafb",
    boxSizing: "border-box",
  },

  loaderContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 60,
  },
  spinner: {
    animation: "spin 1s linear infinite",
  },
  loaderText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6b7280",
    fontWeight: 500,
  },
  results: {
    flex: 1,
    overflowY: "auto",
    display: "grid",
    gap: 12,
  },
  noResults: {
    textAlign: "center",
    padding: 60,
    color: "#6b7280",
  },
  noResultsIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: 600,
    marginBottom: 8,
    color: "#374151",
  },
  noResultsSubtext: {
    fontSize: 14,
    color: "#9ca3af",
  },
  flightCard: {
    background: "white",
        height:'9rem',

    border: "2px solid #e5e7eb",
    borderRadius: 12,
    padding: 16,
    cursor: "pointer",
    transition: "all 0.2s ease",
    position: "relative",
    overflow: "hidden",
  },

  flightSelected: {
    borderColor: "#10b981",
    background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
    boxShadow: "0 2px 8px rgba(16,185,129,0.15)",
  },
  flightCardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  flightAirline: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  flightAirlineLogo: {
    width: 32,
    height: 32,
    borderRadius: 6,
    background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  flightAirlineName: {
    fontSize: 16,
    fontWeight: 600,
    color: "#111827",
  },
  flightPrice: {
    fontSize: 18,
    fontWeight: 700,
    color: "#059669",
  },
  flightRoute: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  flightRoutePoint: {
    textAlign: "center",
    flex: 1,
  },
  flightRouteCode: {
    fontSize: 16,
    fontWeight: 700,
    color: "#111827",
  },
  flightRouteTime: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  flightRouteArrow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  selectedIndicator: {
    position: "absolute",
    top: 12,
    right: 12,
    display: "flex",
    alignItems: "center",
    gap: 4,
    fontSize: 12,
    fontWeight: 600,
    color: "#10b981",
    animation: "checkBounce 0.3s ease",
  },
  modalFooter: {
    marginTop: 20,
    paddingTop: 16,
    borderTop: "1px solid #f3f4f6",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalFooterInfo: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  selectedCount: {
    fontSize: 14,
    color: "#6b7280",
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 700,
    color: "#059669",
  },
  saveBtn: {
    padding: "14px 24px",
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    color: "white",
    borderRadius: 12,
    border: "none",
    cursor: "pointer",
    fontSize: 16,
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: 8,
    transition: "all 0.2s ease",
    boxShadow: "0 4px 6px rgba(16,185,129,0.25)",
  },

  buttonAnimating: {
    transform: "scale(0.95)",
    opacity: 0.8,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 12,
    marginTop: 4,
  },
};

/* ================= CSS ANIMATIONS ================= */

const styleSheet = typeof document !== 'undefined' ? document.createElement('style') : null;

if (styleSheet) {
  styleSheet.textContent = `
    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateX(-10px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    @keyframes checkBounce {
      0% {
        transform: scale(0);
      }
      50% {
        transform: scale(1.2);
      }
      100% {
        transform: scale(1);
      }
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }

    .flight-search-btn:focus {
      outline: none;
      box-shadow: 0 0 0 3px rgba(59,130,246,0.2);
    }
  `;
  document.head.appendChild(styleSheet);
}

export default FlightSection;
