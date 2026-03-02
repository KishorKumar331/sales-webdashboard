


import React, { useEffect, useState } from "react";
import { useFormContext, Controller, useFieldArray } from "react-hook-form";
import { Calendar, Trash2, Info, PlusCircle, MapPin, Camera, Edit3 } from "lucide-react";

import ActivitySelector from "../ActivitySelector";
import CalendarDatePicker from "../DatePicker";

const ItinerarySection = () => {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    watch,
    formState: { errors },
    setValue,
    getValues,
  } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "Itinearies",
  });

  const days = watch("Days") || 1;
  const destinations = watch("Destinations");
  const travelDate = watch("TravelDate");

  /* ------------------ Helpers ------------------ */

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toISOString().split("T")[0];
  };

  const getItineraryDate = (index) => {
    if (!travelDate) return "";
    const d = new Date(travelDate);
    d.setDate(d.getDate() + index);
    return formatDate(d);
  };

  /* ------------------ Add Day ------------------ */

  const addDay = () => {
    const nextDay = fields.length + 1;
    const base = travelDate ? new Date(travelDate) : new Date();
    const date = new Date(base);
    date.setDate(base.getDate() + (nextDay - 1));

    const formattedDate = formatDate(date);
    const dateKey = Number(formattedDate.replace(/-/g, ""));

    append({
      day: nextDay,
      Date: formattedDate,
      DateKey: dateKey,
      Title: `Day ${nextDay} Itinerary`,
      Activity: "",
      ImageUrl: "",
      Description: "",
    });
  };

  /* ------------------ Remove Day ------------------ */

  const removeDay = (index) => {
    if (fields.length <= 1) return;

    remove(index);

    const updated = [...getValues("Itinearies")];
    updated.splice(index, 1);

    updated.forEach((item, idx) => {
      item.day = idx + 1;
      item.Title = `Day ${idx + 1} Itinerary`;
    });

    setValue("Itinearies", updated, { shouldDirty: true });
  };

  /* ------------------ Activity Select ------------------ */

  const handleActivitySelect = (activity, index) => {
    console.log('handleActivitySelect called with:', activity);
    console.log('Activity description:', activity.Description);
    console.log('Setting for index:', index);

    setValue(`Itinearies.${index}.Title`, activity.Title || `Day ${index + 1} Itinerary`);
    setValue(`Itinearies.${index}.Activity`, activity.Activity || "");
    setValue(`Itinearies.${index}.ImageUrl`, activity.ImageUrl || "");
    setValue(`Itinearies.${index}.Description`, activity.Description || "");

    console.log('Description set to:', activity.Description);

    // Verify the value was set
    const currentValues = getValues();
    console.log('Current form values for this itinerary:', currentValues.Itinearies?.[index]);
  };

  /* ------------------ Auto-generate Days ------------------ */

  useEffect(() => {
    const current = fields.length;
    const target = Number(days) || 1;
    const base = travelDate ? new Date(travelDate) : new Date();

    if (target > current) {
      for (let i = current; i < target; i++) {
        const date = new Date(base);
        date.setDate(base.getDate() + i);

        const formattedDate = formatDate(date);
        const dateKey = Number(formattedDate.replace(/-/g, ""));

        append({
          day: i + 1,
          Date: formattedDate,
          DateKey: dateKey,
          Title: `Day ${i + 1} Itinerary`,
          Activity: "",
          ImageUrl: "",
          Description: "",
        });
      }
    } else if (target < current) {
      for (let i = current - 1; i >= target; i--) {
        remove(i);
      }
    }
  }, [days, travelDate]);

  /* ------------------ Init ------------------ */

  useEffect(() => {
    if (fields.length === 0) addDay();
  }, []);

  /* ============================================================
     FETCH ACTIVITIES FROM CLOUDFRONT JSON
  ============================================================ */

  useEffect(() => {
    if (!Array.isArray(destinations) || destinations.length === 0) {
      setActivities([]);
      return;
    }

    let isMounted = true;

    const fetchActivities = async (destination) => {
      try {
        const response = await fetch(
          `https://cdn.infinitepackages.com/activity-storage/${destination.toLowerCase()}.json`
        );

        if (!response.ok) {
          throw new Error(`Failed fetching ${destination}`);
        }

        const data = await response.json();

        return data.map((item) => ({
          Title: item.activity,
          Activity: item.activity,
          Destination: item.destination,
          ImageUrl: `https://d38jn0rpth8ttn.cloudfront.net/${item.activitykey}`,
        }));
      } catch (error) {
        console.error("Activity fetch error:", error);
        return [];
      }
    };

    const fetchAllActivities = async () => {
      try {
        setIsLoading(true);

        const results = await Promise.all(
          destinations.map((dest) => fetchActivities(dest))
        );

        const merged = results.flat();

        if (isMounted) {
          setActivities(merged);
        }
      } catch (error) {
        console.error("Fetch all error:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchAllActivities();

    return () => {
      isMounted = false;
    };
  }, [destinations]);

  /* ====================== UI ====================== */

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
        <div className="shrink-0 rounded-xl bg-green-50 p-2.5 ring-1 ring-green-100">
          <Calendar className="h-5 w-5 text-green-700" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Day-wise Itinerary
          </h2>
          <p className="text-sm text-gray-500">
            Plan each day of the trip
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="bg-gray-50 rounded-xl border border-gray-200 p-5"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center rounded-full bg-gradient-to-r from-green-500 to-emerald-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm">
                  Day {index + 1}
                </div>
                <span className="text-sm text-gray-500">
                  {getItineraryDate(index) || "No date set"}
                </span>
              </div>

              {fields.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeDay(index)}
                  className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Image Preview */}
            <Controller
              control={control}
              name={`Itinearies.${index}.ImageUrl`}
              render={({ field: { value } }) =>
                value ? (
                  <div className="mb-5 rounded-xl overflow-hidden border">
                    <img
                      src={value}
                      alt="Itinerary"
                      className="w-full h-48 object-cover"
                    />
                  </div>
                ) : (
                  <div className="mb-5 flex h-32 items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50">
                    <Camera className="h-8 w-8 text-gray-400" />
                  </div>
                )
              }
            />

            {/* Activity Selector */}
            <ActivitySelector
              onSelectActivity={(a) =>
                handleActivitySelect(a, index)
              }
              selectedActivity={{
                Title: watch(`Itinearies.${index}.Title`) || "",
                ImageUrl: watch(`Itinearies.${index}.ImageUrl`) || "",
              }}
              activities={activities}
              loading={isLoading}
            />

            {/* Title */}
            <div className="mb-5">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                <Edit3 className="mr-2 inline h-4 w-4 text-gray-400" />
                Day Title
              </label>
              <Controller
                control={control}
                name={`Itinearies.${index}.Title`}
                render={({ field }) => (
                  <input
                    {...field}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-base placeholder:text-gray-400 transition-all focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter day title"
                  />
                )}
              />
            </div>

            {/* Activity */}
            <div className="mb-5">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                <MapPin className="mr-2 inline h-4 w-4 text-gray-400" />
                Activities
              </label>
              <Controller
                control={control}
                name={`Itinearies.${index}.Activity`}
                render={({ field }) => (
                  <textarea
                    {...field}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-base placeholder:text-gray-400 transition-all focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-vertical"
                    rows={2}
                    placeholder="List activities for this day"
                  />
                )}
              />
            </div>

            {/* Description */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                <Edit3 className="mr-2 inline h-4 w-4 text-gray-400" />
                Description
              </label>
              <Controller
                control={control}
                name={`Itinearies.${index}.Description`}
                render={({ field }) => (
                  <textarea
                    {...field}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-base placeholder:text-gray-400 transition-all focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-vertical"
                    rows={3}
                    placeholder="Detailed description of the day"
                  />
                )}
              />
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addDay}
        className="mt-6 w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-green-500 bg-green-50 px-4 py-3.5 text-base font-semibold text-green-700 hover:bg-green-100"
      >
        <PlusCircle className="h-5 w-5" />
        Add Another Day
      </button>
    </div>
  );
};

export default ItinerarySection;