import React, { useState } from "react";
import { useFormContext, Controller, useFieldArray } from "react-hook-form";
import {
  ShieldCheck,
  ShieldAlert,
  Plus,
  X,
  PlusCircle,
  Sparkles,
  Info,
  Trash2,
  PackageCheck,
  PackageX
} from "lucide-react";

const InclusionsExclusions = () => {
  const { control } = useFormContext();
  const [newInclusion, setNewInclusion] = useState("");
  const [newExclusion, setNewExclusion] = useState("");

  const {
    fields: inclusionFields,
    append: appendInclusion,
    remove: removeInclusion,
  } = useFieldArray({
    control,
    name: "Inclusions",
  });

  const {
    fields: exclusionFields,
    append: appendExclusion,
    remove: removeExclusion,
  } = useFieldArray({
    control,
    name: "Exclusions",
  });

  const commonInclusions = [
    { label: "Accommodation", icon: "🏨" },
    { label: "Daily Breakfast", icon: "🍳" },
    { label: "Airport Transfers", icon: "✈️" },
    { label: "Sightseeing", icon: "📸" },
    { label: "Tour Guide", icon: "🗺️" },
    { label: "Entrance Fees", icon: "🎟️" },
    { label: "Travel Insurance", icon: "🛡️" },
    { label: "All GST & Taxes", icon: "💰" },
  ];

  const commonExclusions = [
    { label: "International Flights", icon: "✈️" },
    { label: "Visa Fees", icon: "📄" },
    { label: "Personal Expenses", icon: "🛍️" },
    { label: "Tips & Gratuities", icon: "💵" },
    { label: "Extra Meals", icon: "🍱" },
    { label: "Optional Tours", icon: "⛰️" },
    { label: "Early Check-in", icon: "🕙" },
    { label: "Emergency Costs", icon: "🚨" },
  ];

  const addInclusion = (item) => {
    if (item.trim()) {
      appendInclusion({ item: item.trim() });
      setNewInclusion("");
    }
  };

  const addExclusion = (item) => {
    if (item.trim()) {
      appendExclusion({ item: item.trim() });
      setNewExclusion("");
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 mb-8 space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between border-b border-gray-50 pb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-amber-50 rounded-2xl ring-1 ring-amber-100/50">
            <Sparkles className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Package Breakdown</h2>
            <p className="text-sm text-gray-500 font-medium">Define what's included and what's excluded in this package</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold">
          <Info className="w-4 h-4" />
          Standard T&C apply by default
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* ================= INCLUSIONS COLUMN ================= */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <PackageCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="text-[15px] font-bold text-gray-800 uppercase tracking-wider">Main Inclusions</h3>
          </div>

          <div className="p-6 bg-emerald-50/30 rounded-3xl border border-emerald-100/50 space-y-6">
            {/* Quick Add Inclusions */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-emerald-700/70 uppercase tracking-widest pl-1">Suggested Inclusions</span>
              <div className="flex flex-wrap gap-2">
                {commonInclusions.map((item, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => addInclusion(item.label)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-emerald-500 hover:text-white text-emerald-700 text-sm font-medium rounded-xl border border-emerald-100 shadow-sm transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <span>{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Inclusions Input */}
            <div className="relative group">
              <input
                className="w-full pl-4 pr-12 py-3.5 bg-white border border-emerald-100 rounded-2xl text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
                placeholder="Type custom inclusion..."
                value={newInclusion}
                onChange={(e) => setNewInclusion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addInclusion(newInclusion))}
              />
              <button
                type="button"
                onClick={() => addInclusion(newInclusion)}
                className="absolute right-2 top-1.5 p-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 shadow-md transition-all active:scale-95"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {/* Inclusions List */}
            <div className="space-y-3 max-h-100 overflow-y-auto pr-2 custom-scrollbar">
              {inclusionFields.length === 0 ? (
                <div className="py-10 text-center space-y-2 opacity-40">
                  <div className="text-3xl">🧩</div>
                  <p className="text-sm font-medium text-emerald-900/60">No inclusions added yet</p>
                </div>
              ) : (
                inclusionFields.map((field, index) => (
                  <div 
                    key={field.id} 
                    className="group bg-white flex items-center gap-3 p-3.5 rounded-2xl border border-emerald-100 shadow-sm hover:shadow-md transition-all animate-in fade-in slide-in-from-left-4 duration-200"
                  >
                    <div className="shrink-0 w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    </div>
                    
                    <Controller
                      control={control}
                      name={`Inclusions.${index}.item`}
                      render={({ field }) => (
                        <input
                          {...field}
                          className="flex-1 bg-transparent border-none text-[15px] font-medium text-gray-700 focus:ring-0 p-0"
                          placeholder="What's included?"
                        />
                      )}
                    />

                    <button
                      type="button"
                      onClick={() => removeInclusion(index)}
                      className="p-2 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ================= EXCLUSIONS COLUMN ================= */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <PackageX className="w-5 h-5 text-rose-600" />
            <h3 className="text-[15px] font-bold text-gray-800 uppercase tracking-wider">Main Exclusions</h3>
          </div>

          <div className="p-6 bg-rose-50/30 rounded-3xl border border-rose-100/50 space-y-6">
            {/* Quick Add Exclusions */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-rose-700/70 uppercase tracking-widest pl-1">Suggested Exclusions</span>
              <div className="flex flex-wrap gap-2">
                {commonExclusions.map((item, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => addExclusion(item.label)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-rose-500 hover:text-white text-rose-700 text-sm font-medium rounded-xl border border-rose-100 shadow-sm transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <span>{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Exclusions Input */}
            <div className="relative group">
              <input
                className="w-full pl-4 pr-12 py-3.5 bg-white border border-rose-100 rounded-2xl text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all shadow-sm"
                placeholder="Type custom exclusion..."
                value={newExclusion}
                onChange={(e) => setNewExclusion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addExclusion(newExclusion))}
              />
              <button
                type="button"
                onClick={() => addExclusion(newExclusion)}
                className="absolute right-2 top-1.5 p-2 bg-rose-600 text-white rounded-xl hover:bg-rose-700 shadow-md transition-all active:scale-95"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {/* Exclusions List */}
            <div className="space-y-3 max-h-100 overflow-y-auto pr-2 custom-scrollbar">
              {exclusionFields.length === 0 ? (
                <div className="py-10 text-center space-y-2 opacity-40">
                  <div className="text-3xl">🚫</div>
                  <p className="text-sm font-medium text-rose-900/60">No exclusions added yet</p>
                </div>
              ) : (
                exclusionFields.map((field, index) => (
                  <div 
                    key={field.id} 
                    className="group bg-white flex items-center gap-3 p-3.5 rounded-2xl border border-rose-100 shadow-sm hover:shadow-md transition-all animate-in fade-in slide-in-from-right-4 duration-200"
                  >
                    <div className="shrink-0 w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center">
                      <ShieldAlert className="w-5 h-5 text-rose-600" />
                    </div>
                    
                    <Controller
                      control={control}
                      name={`Exclusions.${index}.item`}
                      render={({ field }) => (
                        <input
                          {...field}
                          className="flex-1 bg-transparent border-none text-[15px] font-medium text-gray-700 focus:ring-0 p-0"
                          placeholder="What's not included?"
                        />
                      )}
                    />

                    <button
                      type="button"
                      onClick={() => removeExclusion(index)}
                      className="p-2 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-4 flex flex-wrap gap-6 border-t border-gray-50 text-[13px] text-gray-400">
        <div className="flex items-center gap-1.5 italic font-medium">
          Note: These items will appear as bullet points in the final PDF brochure.
        </div>
      </div>
    </div>
  );
};

export default InclusionsExclusions;
