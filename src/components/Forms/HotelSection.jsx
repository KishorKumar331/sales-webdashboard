import React, { useEffect, useState } from "react";
import {
  useFormContext,
  Controller,
  useFieldArray,
} from "react-hook-form";
import { Bed, Trash2, PlusCircle } from "lucide-react";

import DateRangeSelector from "../DateRangeSelector";
import MultiSelectDestinations from "../MultiSelectDestinations";
import CustomPicker from "../CustomPicker";

const RoomCategorySection = ({ control, hotelIndex, roomList, watch, setValue }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `Hotels.${hotelIndex}.roomCategory`,
  });

  useEffect(() => {
    if (fields.length === 0) {
      append({ roomtype: "", nights: [""], checkInDate: null, checkOutDate: null });
    }
  }, [fields.length, append]);

  return (
    <div style={{ marginTop: 16, padding: 12, backgroundColor: "#f3f4f6", borderRadius: 8 }}>
      <div style={{ fontWeight: 600, marginBottom: 12, color: "#4b5563" }}>Rooms</div>
      {fields.map((field, rIndex) => (
        <div key={field.id} style={{ display: "flex", gap: 12, marginBottom: 12, alignItems: 'center' }}>
          <div style={{ flex: 1.5 }}>
            <Controller
              control={control}
              name={`Hotels.${hotelIndex}.roomCategory.${rIndex}.roomtype`}
              render={({ field }) => (
                <CustomPicker
                  items={roomList.map((r) => ({ label: r.name, value: r.room_id || r.name }))}
                  selectedValue={field.value}
                  onValueChange={(val) => {
                    field.onChange(val);
                    const matchedRoom = roomList.find((r) => (r.room_id || r.name) === val);
                    if (matchedRoom) {
                       setValue(`Hotels.${hotelIndex}.roomCategory.${rIndex}.RoomImage`, matchedRoom.image_urls?.[0] || "");
                       setValue(`Hotels.${hotelIndex}.roomCategory.${rIndex}.RoomId`, matchedRoom.room_id || "");
                    }
                  }}
                  placeholder="Room Type"
                  title="Select Room Type"
                />
              )}
            />
          </div>
          <div style={{ width: 80 }}>
             <Controller
               control={control}
               name={`Hotels.${hotelIndex}.roomCategory.${rIndex}.nights`}
               render={({ field }) => (
                  <input type="text" value={field.value?.[0] || ""} onChange={(e) => field.onChange([e.target.value])} placeholder="e.g. 1N" style={{ padding: "12px", borderRadius: "12px", border: "1px solid #e5e7eb", width: "100%", height: "50px", boxSizing: "border-box" }} />
               )}
             />
          </div>
          <div style={{ flex: 2 }}>
             <DateRangeSelector
                startDate={watch(`Hotels.${hotelIndex}.roomCategory.${rIndex}.checkInDate`)}
                endDate={watch(`Hotels.${hotelIndex}.roomCategory.${rIndex}.checkOutDate`)}
                onStartDateChange={(date) => {
                  const d = new Date(date);
                  const formatted = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
                  setValue(`Hotels.${hotelIndex}.roomCategory.${rIndex}.checkInDate`, formatted);
                  setValue(`Hotels.${hotelIndex}.roomCategory.${rIndex}.checkOutDate`, null);
                }}
                onEndDateChange={(date) => {
                  const d = new Date(date);
                  const formatted = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
                  setValue(`Hotels.${hotelIndex}.roomCategory.${rIndex}.checkOutDate`, formatted);
                  
                  const startDateStr = watch(`Hotels.${hotelIndex}.roomCategory.${rIndex}.checkInDate`);
                  if (startDateStr && date) {
                     const startD = new Date(startDateStr);
                     const diff = Math.max(0, Math.round((d - startD) / (1000 * 60 * 60 * 24)));
                     setValue(`Hotels.${hotelIndex}.roomCategory.${rIndex}.nights`, [`${diff}N`]);
                  }
                }}
             />
          </div>
          {fields.length > 1 && (
            <button type="button" onClick={() => remove(rIndex)} style={{ padding: 8, borderRadius: 8, backgroundColor: "#fef2f2", border: "none", cursor: "pointer", height: 50 }}>
              <Trash2 size={18} color="#ef4444" />
            </button>
          )}
        </div>
      ))}
      <button type="button" onClick={() => append({ roomtype: "", nights: [""], checkInDate: null, checkOutDate: null })} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: 8, marginTop: 8, borderRadius: 12, border: "2px dashed #7c3aed", backgroundColor: "#faf5ff", cursor: "pointer" }}>
        <PlusCircle size={18} color="#7c3aed" />
        <span style={{ fontSize: 14, color: "#7c3aed", fontWeight: 600 }}>Add Room</span>
      </button>
    </div>
  );
};

const FormField = ({ label, children, required = false, error }) => (
  <div style={{ marginBottom: 14 }}>
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

const HotelsSection = () => {
  const {
    control,
    formState: { errors },
    setValue,
    watch,
  } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "Hotels",
  });

  const [properties, setProperties] = useState([]);
  const [roomsCache, setRoomsCache] = useState({});

  const dests = watch("Destinations");
  const destinations = Array.isArray(dests) ? dests : [];
  const singleDest = watch("DestinationName");
  const isMaldives = destinations.includes("Maldives") || singleDest === "Maldives";

  useEffect(() => {
    if (isMaldives && properties.length === 0) {
      fetch("https://uusxwsw865.execute-api.ap-south-1.amazonaws.com/dev/properties")
        .then((res) => res.json())
        .then((data) => {
          setProperties(data || []);
        })
        .catch((err) => console.error("Error fetching properties:", err));
    }
  }, [isMaldives, properties.length]);

  const mealOptions = ["Breakfast", "Lunch", "Dinner"];

  const addHotel = () => {
    append({
      Nights: 0,
      Name: "",
      City: "",
      RoomType: "",
      Category: "",
      Meals: [],
      CheckInDate: null,
      CheckOutDate: null,
      Comments: "",
      HotelImage: "",
      PropertyId: "",
      RoomImage: "",
      RoomId: "",
      propertyName: "",
      transferType: "",
      mealPlan: "",
      noOfRoom: "01",
      roomCategory: [{ roomtype: "", nights: [""], checkInDate: null, checkOutDate: null }]
    }, { shouldFocus: false });
  };

  const removeHotel = (index) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  useEffect(() => {
    if (!fields || fields.length === 0) {
      addHotel();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={styles.card}>
      <div style={styles.sectionHeader}>
        <div style={{ ...styles.iconWrapper, backgroundColor: "#fef3c7" }}>
          <Bed size={20} color="#f59e0b" />
        </div>
        <div style={styles.sectionTitle}>Hotels & Accommodation</div>
      </div>

      {fields.map((field, index) => {
        const hotelName = watch(`Hotels.${index}.propertyName`);
        const matchedProp = properties.find((p) => (p.property_id || p.name) === hotelName);
        const roomList = matchedProp && roomsCache[matchedProp.property_id] ? roomsCache[matchedProp.property_id] : [];

        return (
          <div key={field.id} style={styles.hotelCard}>
            {isMaldives ? (
              <>
                <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                  <div style={{ flex: 2 }}>
                     <FormField label="Property Name" required>
                       <Controller
                         control={control}
                         name={`Hotels.${index}.propertyName`}
                         rules={{ required: "Property name is required" }}
                         render={({ field }) => (
                            <CustomPicker
                              items={properties.map((p) => ({ label: p.name, value: p.property_id || p.name }))}
                              selectedValue={field.value}
                              onValueChange={(val) => {
                                field.onChange(val);
                                const prop = properties.find((p) => (p.property_id || p.name) === val);
                                if (prop) {
                                  setValue(`Hotels.${index}.HotelImage`, prop.image_url || "");
                                  setValue(`Hotels.${index}.PropertyId`, prop.property_id || "");
                                  if (!roomsCache[prop.property_id]) {
                                    fetch(`https://uusxwsw865.execute-api.ap-south-1.amazonaws.com/dev/properties/${prop.property_id}/rooms`)
                                      .then((res) => res.json())
                                      .then((data) => setRoomsCache((prev) => ({ ...prev, [prop.property_id]: data.rooms || [] })));
                                  }
                                }
                              }}
                              placeholder="Select property"
                              title="Select Property"
                            />
                         )}
                       />
                     </FormField>
                  </div>
                  <div style={{ flex: 1 }}>
                     <FormField label="Transfer Type">
                       <Controller control={control} name={`Hotels.${index}.transferType`} render={({ field }) => (
                             <CustomPicker items={[{label: "SpeedBoat", value: "SpeedBoat"}, {label: "Seaplane", value: "Seaplane"}, {label: "Domestic Flight", value: "DomesticFlight"}]} selectedValue={field.value} onValueChange={field.onChange} placeholder="Select transfer" title="Transfer Type" />
                       )} />
                     </FormField>
                  </div>
                  {fields.length > 1 && (
                    <button type="button" onClick={() => removeHotel(index)} style={{ ...styles.removeButton, marginTop: 28 }}>
                       <Trash2 size={18} color="#ef4444" />
                    </button>
                  )}
                </div>
                <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                  <div style={{ flex: 1 }}>
                     <FormField label="Meal Plan">
                        <Controller control={control} name={`Hotels.${index}.mealPlan`} render={({ field }) => (
                               <CustomPicker items={[{label: "Breakfast", value: "BreakFast"}, {label: "Half Board", value: "HalfBoard"}, {label: "Full Board", value: "FullBoard"}, {label: "All Inclusive", value: "AllInclusive"}]} selectedValue={field.value} onValueChange={field.onChange} placeholder="Meal Plan" title="Select Meal Plan" />
                        )} />
                     </FormField>
                  </div>
                  <div style={{ flex: 1 }}>
                     <FormField label="No. of Rooms">
                        <Controller control={control} name={`Hotels.${index}.noOfRoom`} render={({ field }) => (
                               <input {...field} style={{ ...styles.input, height: 50 }} placeholder="e.g. 01" />
                        )} />
                     </FormField>
                  </div>
                </div>
                <RoomCategorySection control={control} hotelIndex={index} roomList={roomList} watch={watch} setValue={setValue} />
              </>
            ) : (
              <>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div style={{ flex: 1, display: "flex", gap: 12 }}>
                    <div style={{ flex: 1 }}>
                    <FormField label="Hotel Name" required error={errors?.Hotels?.[index]?.Name}>
                      <Controller
                        control={control}
                        name={`Hotels.${index}.Name`}
                        rules={{ required: "Hotel name is required" }}
                        render={({ field }) => (
                          <input
                            {...field}
                            style={{ ...styles.input, ...(errors?.Hotels?.[index]?.Name ? styles.errorInput : {}) }}
                            placeholder="Enter hotel name"
                          />
                        )}
                      />
                    </FormField>
                    </div>
                    <div style={{ flex: 1 }}>
                    <FormField label="City" required error={errors?.Hotels?.[index]?.City}>
                      <Controller
                        control={control}
                        name={`Hotels.${index}.City`}
                        rules={{ required: "City is required" }}
                        render={({ field }) => (
                          <input
                            {...field}
                            style={{ ...styles.input, ...(errors?.Hotels?.[index]?.City ? styles.errorInput : {}) }}
                            placeholder="Enter city"
                          />
                        )}
                      />
                    </FormField>
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <DateRangeSelector
                      startDate={watch(`Hotels.${index}.CheckInDate`)}
                      endDate={watch(`Hotels.${index}.CheckOutDate`)}
                      onStartDateChange={(date) => {
                        const d = new Date(date);
                        const formatted = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
                        setValue(`Hotels.${index}.CheckInDate`, formatted, { shouldValidate: true });
                        setValue(`Hotels.${index}.CheckOutDate`, null, { shouldValidate: true });
                      }}
                      onEndDateChange={(date) => {
                        const d = new Date(date);
                        const formatted = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
                        setValue(`Hotels.${index}.CheckOutDate`, formatted, { shouldValidate: true });
                        const startDate = watch(`Hotels.${index}.CheckInDate`);
                        if (startDate && date) {
                          const diff = Math.max(0, Math.round((d - new Date(startDate)) / (1000 * 60 * 60 * 24)));
                          setValue(`Hotels.${index}.Nights`, diff, { shouldValidate: true });
                        }
                      }}
                    />
                  </div>
                  {fields.length > 1 && (
                    <button type="button" onClick={() => removeHotel(index)} style={styles.removeButton}>
                      <Trash2 size={18} color="#ef4444" />
                    </button>
                  )}
                </div>

                <div style={{ display: "flex", gap: 12 }}>
                  <div>
                    <FormField label="Nights" required error={errors?.Hotels?.[index]?.Nights}>
                      <Controller
                        control={control}
                        name={`Hotels.${index}.Nights`}
                        rules={{ required: "Nights required", min: { value: 1, message: "Min 1" } }}
                        render={({ field }) => (
                          <input
                            type="number"
                            {...field}
                            style={{ ...styles.input, ...(errors?.Hotels?.[index]?.Nights ? styles.errorInput : {}) }}
                            placeholder="Enter nights"
                            value={field.value ?? ""}
                            onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                          />
                        )}
                      />
                    </FormField>
                  </div>
                  <div style={{ flex: 1 }}>
                    <FormField label="Room Type">
                      <Controller
                        control={control}
                        name={`Hotels.${index}.RoomType`}
                        render={({ field }) => (
                          <input {...field} style={styles.input} placeholder="e.g., Deluxe, Suite" />
                        )}
                      />
                    </FormField>
                  </div>
                  <div style={{ flex: 1 }}>
                    <FormField label="Category">
                      <Controller
                        control={control}
                        name={`Hotels.${index}.Category`}
                        render={({ field }) => (
                          <input {...field} style={styles.input} placeholder="e.g., 3 Star" />
                        )}
                      />
                    </FormField>
                  </div>
                </div>

                <FormField label="Meals">
                  <Controller
                    control={control}
                    name={`Hotels.${index}.Meals`}
                    render={({ field }) => (
                      <MultiSelectDestinations
                        destinations={mealOptions}
                        selectedDestinations={Array.isArray(field.value) ? field.value : []}
                        onSelectionChange={(vals) => field.onChange(vals)}
                        type="meals"
                        placeholder="Select meals"
                      />
                    )}
                  />
                </FormField>
              </>
            )}
          </div>
        );
      })}

      <button type="button" onClick={addHotel} style={styles.addButton}>
        <PlusCircle size={22} color="#7c3aed" />
        <span style={styles.addButtonText}>Add Another Hotel</span>
      </button>
    </div>
  );
};

export default HotelsSection;

const styles = {
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    marginBottom: 12,
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
  hotelCard: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    border: "1px solid #e5e7eb",
  },
  removeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#fef2f2",
    border: "none",
    cursor: "pointer",
    height: 40,
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
  addButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    borderRadius: 12,
    border: "2px dashed #7c3aed",
    backgroundColor: "#faf5ff",
    cursor: "pointer",
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: 600,
    color: "#7c3aed",
  },
};
