import React, { useState, useEffect } from "react";
import { ChevronDown, Search, X } from "lucide-react";

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

  /* ================= Initialize ================= */

  useEffect(() => {
    setFilteredActivities(activities);
  }, [activities]);

  /* ================= Filter ================= */

  useEffect(() => {
    console.log('Search effect triggered');
    console.log('Search query:', searchQuery);
    console.log('Activities length:', activities?.length);
    console.log('Activities sample:', activities?.slice(0, 3));
    
    let result = activities;
    
    if (!searchQuery.trim()) {
      console.log('Empty search, showing all activities');
      result = activities;
    } else {
      console.log('Filtering activities for:', searchQuery);
      const q = searchQuery.toLowerCase();
      result = activities.filter((a) => {
        const titleMatch = a.Title?.toString().toLowerCase().includes(q);
        const activityMatch = a.Activity?.toString().toLowerCase().includes(q);
        console.log(`Item: ${a.Title}, Title match: ${titleMatch}, Activity match: ${activityMatch}`);
        return titleMatch || activityMatch;
      });
      console.log('Filtered results count:', result.length);
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

  const handleSelectActivity = async (activity) => {
    setSelectedActivityLoading(activity.Title);

    try {
      const generatedActivity = await generateActivityDescription(activity);
      console.log('Generated activity:', generatedActivity);
      console.log('Original activity:', activity);

      const activityData = {
        Title: generatedActivity.title,
        Activity: activity.Activity || "",
        Description: generatedActivity.description,
        ImageUrl: activity.ImageUrl,
      };

      console.log('Activity data being passed:', activityData);
      onSelectActivity(activityData);

      setShowModal(false);
      setSearchQuery("");
    } finally {
      setSelectedActivityLoading(null);
    }
  };

  const handleAddNewActivity = () => {
    onSelectActivity({
      Title: newActivity.Title,
      Description: newActivity.Description,
      ImageUrl: newActivity.ImageUrl,
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
        onClick={() => setShowModal(true)}
      >
        <span style={styles.selectorText}>
          {selectedActivity?.Title.slice(0,24)+'...' || "Select an activity"}
        </span>
        <ChevronDown size={18} />
      </button>

      {/* Modal */}
      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            {/* Search Header */}
            <div style={styles.searchContainer}>
              <Search size={18} />
              <input
                autoFocus
                style={styles.searchInput}
                placeholder="Search activities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="button"
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
                      console.log('Rendering item:', item.Title);
                      return (
                        <div
                          key={`${item.Title}-${item.Destination}-${index}-${forceUpdate}`}
                          style={{
                            ...styles.gridItem,
                            opacity: selectedActivityLoading === item.Title ? 0.7 : 1,
                            pointerEvents: selectedActivityLoading === item.Title ? 'none' : 'auto',
                          }}
                          onClick={() => handleSelectActivity(item)}
                        >
                          {selectedActivityLoading === item.Title ? (
                            <div style={styles.loadingOverlay}>
                              <div style={styles.loadingSpinner}></div>
                              <div style={styles.loadingText}>Generating AI description...</div>
                            </div>
                          ) : (
                            <>
                              <div style={styles.activityIcon}>
                                🎯
                              </div>

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
                            </>
                          )}
                        </div>
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
    background: "rgba(0,0,0,0.5)",
    zIndex: 1000,
  },
  modal: {
    background: "#fff",
    maxWidth: 600,
    margin: "40px auto",
    borderRadius: 12,
    overflow: "hidden",
  },
  searchContainer: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: 12,
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
  list: {
    maxHeight: "70vh",
    overflowY: "auto",
  },
  activityItem: {
    display: "flex",
    gap: 12,
    width:'100%',
    padding: 12,
    borderBottom: "1px solid #eee",
    background: "white",
    cursor: "pointer",
    textAlign: "left",
  },
  activityImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    objectFit: "cover",
  },
  activityInfo: {
    flex: 1,
    width: "100%",
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
    lineHeight: 1.4,
  },
  activityDescription: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 1.4,
  },
  gridContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: 16,
    maxHeight: 400,
    overflowY: "auto",
    padding: 8,
  },
  gridItem: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    borderRadius: 16,
    padding: 20,
    cursor: "pointer",
    transition: "all 0.3s ease",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
    border: "2px solid transparent",
    position: "relative",
    overflow: "hidden",
    ":hover": {
      transform: "translateY(-4px)",
      boxShadow: "0 12px 30px rgba(0,0,0,0.2)",
      borderColor: "#ffffff",
    },
    "::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: "4px",
      background: "linear-gradient(90deg, #ff6b6b, #4ecdc4, #45b7d1)",
    },
  },
  activityIcon: {
    fontSize: 32,
    marginBottom: 12,
    filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))",
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
  loading: {
    gridColumn: "1 / -1",
    padding: 40,
    textAlign: "center",
    color: "#6b7280",
    fontSize: 16,
  },

  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0, 0, 0, 0.8)",
    borderRadius: 16,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },

  loadingSpinner: {
    width: 40,
    height: 40,
    border: "4px solid rgba(255, 255, 255, 0.3)",
    borderTop: "4px solid white",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },

  loadingText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
    marginTop: 12,
    textAlign: "center",
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
    ":hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 8px 25px rgba(102, 126, 234, 0.6)",
    },
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
};
