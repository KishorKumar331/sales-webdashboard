import React, { useState, useEffect } from "react";
import { ChevronDown, Search, X } from "lucide-react";

// Add shimmer and spin animation keyframes
const shimmerKeyframes = `
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  @keyframes modalAppear {
    0% { opacity: 0; transform: scale(0.95); }
    100% { opacity: 1; transform: scale(1); }
  }
`;

// Inject the keyframes into the document head
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = shimmerKeyframes;
  document.head.appendChild(style);
}

/**
 * Props:
 * - onSelectActivity(activity)
 * - selectedActivity
 * - activities (array of activities from parent)
 * - loading (boolean)
 * - style
 */
const ActivitySelector = ({
  onSelectActivity,
  selectedActivity,
  activities,
  loading = false,
  style,
}) => {
  // State declarations
  const [selectedActivityLoading, setSelectedActivityLoading] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);
  const [newActivity, setNewActivity] = useState({ Title: "", Description: "", ImageUrl: "" });
  const [tempSelectedActivities, setTempSelectedActivities] = useState([]);

  /* ================= Initialize ================= */

  useEffect(() => {
    setFilteredActivities(activities);
  }, [activities]);

  /* ================= Filter ================= */

  useEffect(() => {
    console.log('Search effect triggered');
    console.log('Search query:', searchQuery);
    console.log('Activities length:', activities?.length);
    
    let result = activities;
    
    if (!searchQuery.trim()) {
      result = activities;
    } else {
      const q = searchQuery.toLowerCase();
      result = activities.filter((a) => {
        const titleMatch = a.Title?.toString().toLowerCase().includes(q);
        const activityMatch = a.Activity?.toString().toLowerCase().includes(q);
        return titleMatch || activityMatch;
      });
    }
    
    setFilteredActivities(result);
    setForceUpdate(prev => prev + 1); // Force re-render
  }, [searchQuery, activities]);

  const generateActivityDescription = async (activity) => {
    try {
      const response = await fetch(
        "https://0rq0f90i05.execute-api.ap-south-1.amazonaws.com/salesapp/ai",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            activitykey: activity.ImageUrl || `${activity.Title?.toLowerCase().replace(/\s+/g, '_')}.jpg`,
            destination: activity.Destination || "bali",
            activityName: activity.Title || "Activity"
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      return {
        title: data.title || activity.Title,
        description: data.description || activity.Activity
      };
    } catch (error) {
      console.error("AI API error:", error);
      // Fallback to original data
      return {
        title: activity.Title,
        description: activity.Activity || "No description available"
      };
    }
  };

  /* ================= Handlers ================= */

  const handleToggleSelectActivity = (activity) => {
    setTempSelectedActivities((prev) => {
      const exists = prev.some((a) => a.Title === activity.Title);
      if (exists) {
        return prev.filter((a) => a.Title !== activity.Title);
      } else {
        return [...prev, activity];
      }
    });
  };

  const handleConfirmSelection = async () => {
    if (tempSelectedActivities.length === 0) return;

    try {
      const results = [];
      for (const activity of tempSelectedActivities) {
        setSelectedActivityLoading(activity.Title);
        const generated = await generateActivityDescription(activity);
        results.push({
          Title: generated.title,
          Description: generated.description,
          ImageUrl: activity.ImageUrl
        });
      }

      // Combine titles with a comma
      const combinedTitle = results.map(r => r.Title).join(", ");
      
      // Combine descriptions with double newline
      const combinedDescription = results.map(r => r.Description).join("\n\n");
      
      // Find the first non-empty ImageUrl
      const combinedImageUrl = results.find(r => r.ImageUrl)?.ImageUrl || "";

      // Gather all selected activity image URLs
      const imagesArray = results.map(r => r.ImageUrl).filter(Boolean);

      const activityData = {
        Title: combinedTitle,
        Activity: tempSelectedActivities.map(a => a.Activity || a.Title).join(", "),
        Description: combinedDescription,
        ImageUrl: combinedImageUrl,
        OtherActivityImages: imagesArray,
      };

      console.log('Combined activity data being passed:', activityData);
      onSelectActivity(activityData);

      setShowModal(false);
      setSearchQuery("");
      setTempSelectedActivities([]);
    } catch (error) {
      console.error("Error confirming selection:", error);
    } finally {
      setSelectedActivityLoading(null);
    }
  };

  const handleAddNewActivity = () => {
    onSelectActivity({
      Title: newActivity.Title,
      Description: newActivity.Description,
      ImageUrl: newActivity.ImageUrl,
      OtherActivityImages: newActivity.ImageUrl ? [newActivity.ImageUrl] : [],
      isCustom: true,
    });

    setNewActivity({ Title: "", Description: "", ImageUrl: "" });
    setShowAddForm(false);
    setShowModal(false);
  };

  /* ================= UI ================= */

  return (
    <div style={{ width: "28%", ...style }}>
      {/* Selector */}
      <button
        type="button"
        style={styles.selectorButton}
        onClick={() => {
          setTempSelectedActivities([]);
          setShowModal(true);
        }}
      >
        <span style={styles.selectorText}>
          {selectedActivity?.Title ? (selectedActivity.Title.length > 24 ? selectedActivity.Title.slice(0, 24) + '...' : selectedActivity.Title) : "Select activities"}
        </span>
        <ChevronDown size={18} />
      </button>

      {/* Modal */}
      {showModal && (
        <div style={styles.modalOverlay} onClick={() => { if (!selectedActivityLoading) setShowModal(false); }}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            {/* Search Header */}
            <div style={styles.searchContainer}>
              <Search size={18} />
              <input
                autoFocus
                disabled={selectedActivityLoading !== null}
                style={styles.searchInput}
                placeholder="Search activities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="button"
                disabled={selectedActivityLoading !== null}
                onClick={() => setShowModal(false)}
                style={styles.cancelText}
              >
                Cancel
              </button>
            </div>

            {/* LIST OR ADD FORM */}
            {!showAddForm ? (
              <>
                <div style={styles.gridContainer}>
                  {loading ? (
                    <div style={styles.loading}>Loading activities...</div>
                  ) : (
                    filteredActivities.map((item, index) => {
                      const isSelected = tempSelectedActivities.some((a) => a.Title === item.Title);
                      return (
                        <React.Fragment key={`${item.Title}-${item.Destination}-${index}-${forceUpdate}`}>
                          <div
                            style={{
                              ...styles.gridItem,
                              ...(isSelected ? styles.gridItemActive : {}),
                              opacity: selectedActivityLoading !== null ? 0.6 : 1,
                              pointerEvents: selectedActivityLoading !== null ? 'none' : 'auto',
                              borderBottom: (index === 5 && filteredActivities.length > 6) ? '3px solid rgba(255, 255, 255, 0.3)' : 'none',
                              marginBottom: (index === 5 && filteredActivities.length > 6) ? '20px' : '0',
                              paddingBottom: (index === 5 && filteredActivities.length > 6) ? '24px' : '20px',
                            }}
                            onClick={() => handleToggleSelectActivity(item)}
                          >
                            {isSelected && (
                              <div style={styles.checkmarkBadge}>
                                ✓ Selected
                              </div>
                            )}
                            
                            {/* Show image for first 6 activities, icon for others */}
                            {index < 6 && item.ImageUrl ? (
                              <div style={styles.imageContainer}>
                                <img
                                  src={item.ImageUrl}
                                  alt={item.Title}
                                  style={styles.activityImage}
                                />
                              </div>
                            ) : (
                              <div style={styles.activityIcon}>
                                🎯
                              </div>
                            )}

                            <div style={styles.activityInfo}>
                              <div style={styles.destinationTag}>
                                {item.Destination || "Unknown"}
                              </div>
                              <div style={styles.activityTitle}>
                                {item.Title}
                              </div>
                              <div style={styles.activityDescription}>
                                {item.Activity || "No description available"}
                              </div>
                            </div>
                          </div>
                          
                          {/* Show "Other Activities" label after 6th activity when there are more than 6 */}
                          {index === 5 && filteredActivities.length > 6 && (
                            <div style={styles.sectionLabel}>
                              ------Other Activities----
                            </div>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}

                  {!loading && filteredActivities.length === 0 && (
                    <div style={styles.noResults}>
                      <div>No activities found</div>
                      <button
                        type="button"
                        style={styles.addButton}
                        onClick={() => setShowAddForm(true)}
                      >
                        + Add New Activity
                      </button>
                    </div>
                  )}
                </div>

                {/* Confirm Multi-Selection Button */}
                {tempSelectedActivities.length > 0 && (
                  <div style={styles.confirmContainer}>
                    <button
                      type="button"
                      style={styles.confirmButton}
                      onClick={handleConfirmSelection}
                      disabled={selectedActivityLoading !== null}
                    >
                      {selectedActivityLoading ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={styles.smallSpinner}></span>
                          Generating AI ({selectedActivityLoading})...
                        </span>
                      ) : (
                        `Confirm & Generate AI Itinerary (${tempSelectedActivities.length} selected)`
                      )}
                    </button>
                  </div>
                )}
              </>
            ) : (
              /* ADD FORM */
              <div style={styles.form}>
                <h3 style={styles.formTitle}>Add New Activity</h3>

                <label style={styles.label}>Title*</label>
                <input
                  style={styles.input}
                  value={newActivity.Title}
                  onChange={(e) =>
                    setNewActivity({
                      ...newActivity,
                      Title: e.target.value,
                    })
                  }
                />

                <label style={styles.label}>Description</label>
                <textarea
                  style={{ ...styles.input, height: 100 }}
                  value={newActivity.Description}
                  onChange={(e) =>
                    setNewActivity({
                      ...newActivity,
                      Description: e.target.value,
                    })
                  }
                />

                <label style={styles.label}>Image URL</label>
                <input
                  style={styles.input}
                  value={newActivity.ImageUrl}
                  onChange={(e) =>
                    setNewActivity({
                      ...newActivity,
                      ImageUrl: e.target.value,
                    })
                  }
                />

                <div style={styles.formButtons}>
                  <button
                    type="button"
                    style={styles.cancelBtn}
                    onClick={() => setShowAddForm(false)}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    disabled={!newActivity.Title}
                    style={{
                      ...styles.saveBtn,
                      opacity: newActivity.Title ? 1 : 0.5,
                    }}
                    onClick={handleAddNewActivity}
                  >
                    Save Activity
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivitySelector;

/* ================= STYLES ================= */

const styles = {
  selectorButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    border: "1px solid #ddd",
    borderRadius: 8,
    background: "#fff",
    width: "100%",
    cursor: "pointer",
  },
  selectorText: {
    flex: 1,
    textAlign: "left",
    color: "#333",
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.2)",
    backdropFilter: "blur(4px)",
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modal: {
    background: "#fff",
    maxWidth: 900,
    width: "95%",
    maxHeight: "90vh",
    borderRadius: 24,
    overflow: "hidden",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    animation: "modalAppear 0.3s ease-out",
    display: "flex",
    flexDirection: "column",
  },
  searchContainer: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: 16,
    borderBottom: "1px solid #eee",
  },
  searchInput: {
    flex: 1,
    padding: 8,
    borderRadius: 8,
    border: "1px solid #ddd",
  },
  cancelText: {
    background: "none",
    border: "none",
    color: "#007AFF",
    fontWeight: 600,
    cursor: "pointer",
  },
  gridContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 16,
    maxHeight: "60vh",
    overflowY: "auto",
    padding: 16,
  },
  gridItem: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    borderRadius: 16,
    padding: 20,
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
    border: "2px solid transparent",
    position: "relative",
    overflow: "hidden",
  },
  gridItemActive: {
    background: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
    borderColor: "#fff",
    boxShadow: "0 10px 25px rgba(16, 185, 129, 0.4), 0 0 15px rgba(16, 185, 129, 0.2)",
    transform: "translateY(-4px)",
  },
  checkmarkBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    background: "white",
    color: "#059669",
    padding: "3px 8px",
    borderRadius: 12,
    fontSize: 10,
    fontWeight: "bold",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    zIndex: 5,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  confirmContainer: {
    padding: 16,
    borderTop: "1px solid #eee",
    display: "flex",
    justifyContent: "center",
    background: "#fff",
  },
  confirmButton: {
    width: "100%",
    maxWidth: 500,
    background: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
    color: "white",
    border: "none",
    padding: "14px 28px",
    borderRadius: 16,
    fontSize: 15,
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 4px 15px rgba(16, 185, 129, 0.3)",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  smallSpinner: {
    width: 16,
    height: 16,
    border: "2px solid rgba(255, 255, 255, 0.3)",
    borderTop: "2px solid white",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    display: "inline-block",
  },
  activityIcon: {
    fontSize: 32,
    marginBottom: 12,
    filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))",
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
    boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
  },
  activityImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    borderRadius: 12,
  },
  activityInfo: {
    flex: 1,
    width: "100%",
    color: "white",
  },
  destinationTag: {
    display: "inline-block",
    background: "rgba(255, 255, 255, 0.2)",
    color: "white",
    padding: "4px 12px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    backdropFilter: "blur(4px)",
  },
  activityTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    lineHeight: 1.3,
    textShadow: "0 1px 2px rgba(0,0,0,0.3)",
  },
  activityDescription: {
    fontSize: 14,
    opacity: 0.9,
    lineHeight: 1.4,
    textShadow: "0 1px 2px rgba(0,0,0,0.2)",
  },
  sectionLabel: {
    gridColumn: "1 / -1",
    textAlign: "center",
    color: "#6b7280",
    fontSize: 14,
    fontWeight: "600",
    margin: "16px 0 8px 0",
    textTransform: "uppercase",
    letterSpacing: "1px",
    opacity: 0.8,
  },
  noResults: {
    gridColumn: "1 / -1",
    padding: 40,
    textAlign: "center",
    color: "#6b7280",
    background: "white",
    borderRadius: 12,
    border: "2px dashed #d1d5db",
  },
  addButton: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
    padding: "12px 24px",
    borderRadius: 12,
    fontSize: 14,
    fontWeight: "600",
    cursor: "pointer",
    marginTop: 16,
    transition: "all 0.3s ease",
    boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
  },
  form: {
    padding: 20,
  },
  formTitle: {
    textAlign: "center",
    marginBottom: 20,
  },
  label: {
    fontWeight: 600,
    marginBottom: 6,
    display: "block",
  },
  input: {
    width: "100%",
    padding: 10,
    borderRadius: 8,
    border: "1px solid #ddd",
    marginBottom: 14,
  },
  formButtons: {
    display: "flex",
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    border: "none",
    background: "#f1f1f1",
    cursor: "pointer",
  },
  saveBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    border: "none",
    background: "#007AFF",
    color: "white",
    cursor: "pointer",
  },
  loading: {
    gridColumn: "1 / -1",
    textAlign: "center",
    color: "#6b7280",
    padding: 40,
  }
};
