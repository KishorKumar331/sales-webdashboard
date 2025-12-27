import React, { useState, useEffect } from "react";
import { ChevronDown, Search, X } from "lucide-react";

/**
 * Props:
 * - onSelectActivity(activity)
 * - selectedActivity
 * - destination
 * - style
 */
const ActivitySelector = ({
  onSelectActivity,
  selectedActivity,
  destination,
  style,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const [newActivity, setNewActivity] = useState({
    Title: "",
    Description: "",
    ImageUrl: "",
  });

  /* ================= Fetch activities ================= */

  useEffect(() => {
    if (!destination) return;

    const fetchActivities = async () => {
      try {
        const res = await fetch(
          `https://2rltmjilx9.execute-api.ap-south-1.amazonaws.com/DataTransaction/activitysightseen?DestinationName=${destination}`
        );
        const data = await res.json();
        setActivities(data?.Items || []);
      } catch (err) {
        console.error("Error fetching activities:", err);
      }
    };

    fetchActivities();
  }, [destination]);

  /* ================= Filter ================= */

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredActivities(activities);
    } else {
      const q = searchQuery.toLowerCase();
      setFilteredActivities(
        activities.filter(
          (a) =>
            a.Title?.toLowerCase().includes(q) ||
            a.Description?.toLowerCase().includes(q) ||
            a.DetailDescription?.toLowerCase().includes(q)
        )
      );
    }
  }, [searchQuery, activities]);

  /* ================= Handlers ================= */

  const handleSelectActivity = (activity) => {
    onSelectActivity({
      Title: activity.Title,
      Description:
        activity.Description || activity.DetailDescription || "",
      ImageUrl: activity.Url || activity.ImageUrl || "",
      ActivityId: activity.ActivityId,
    });

    setShowModal(false);
    setSearchQuery("");
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
    <div style={{ width: "100%", ...style }}>
      {/* Selector */}
      <button
        type="button"
        style={styles.selectorButton}
        onClick={() => setShowModal(true)}
      >
        <span style={styles.selectorText}>
          {selectedActivity?.Title || "Select an activity"}
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
                <div style={styles.list}>
                  {filteredActivities.map((item) => (
                    <button
                      key={item.ActivityId || item.Title}
                      type="button"
                      style={styles.activityItem}
                      onClick={() => handleSelectActivity(item)}
                    >
                      {item.Url && (
                        <img
                          src={item.Url}
                          alt={item.Title}
                          style={styles.activityImage}
                        />
                      )}

                      <div style={styles.activityInfo}>
                        <div style={styles.activityTitle}>
                          {item.Title}
                        </div>
                        <div style={styles.activityDescription}>
                          {item.Description ||
                            item.DetailDescription ||
                            "No description available"}
                        </div>
                      </div>
                    </button>
                  ))}

                  {filteredActivities.length === 0 && (
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
  },
  activityTitle: {
    fontWeight: 600,
    marginBottom: 4,
  },
  activityDescription: {
    fontSize: 14,
    color: "#666",
  },
  noResults: {
    padding: 20,
    textAlign: "center",
  },
  addButton: {
    marginTop: 12,
    padding: 10,
    borderRadius: 8,
    background: "#007AFF",
    color: "white",
    border: "none",
    cursor: "pointer",
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
