import React from "react";
import { Sparkles, ArrowRight, Check } from "lucide-react";

export const Field = ({ label, required, children, icon, error }) => (
  <div className="space-y-2 text-left">
    <div className="flex items-center gap-2 text-gray-700 font-medium">
      {icon && <span className="w-4 h-4 text-purple-600">{icon}</span>}
      {label} {required ? <span className="text-red-500">*</span> : null}
    </div>
    {children}
    {error && <span className="text-xs text-red-500 mt-1 block">{error.message}</span>}
  </div>
);

export const Input = React.forwardRef(({ icon, hasError, ...props }, ref) => (
  <div className="relative">
    <input
      {...props}
      ref={ref}
      className={`w-full px-4 py-3 ${icon ? 'pl-12' : ''} bg-gray-50 border-2 ${hasError ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-purple-500'} rounded-xl text-gray-900 placeholder-gray-500 outline-none transition-all duration-200 focus:bg-white focus:shadow-lg ${props.className || ""}`}
    />
    {icon && (
      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
        {icon}
      </span>
    )}
  </div>
));

export const TextArea = React.forwardRef(({ hasError, ...props }, ref) => (
  <div className="relative">
    <textarea
      {...props}
      ref={ref}
      className={`w-full px-4 py-3 bg-gray-50 border-2 ${hasError ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-purple-500'} rounded-xl text-gray-900 placeholder-gray-500 outline-none transition-all duration-200 focus:bg-white focus:shadow-lg resize-none ${props.className || ""}`}
    />
  </div>
));

export const UploadBox = ({ value, onChange, acceptHint, previewSize = 64, emptyIcon, emptyText }) => (
  <label className="cursor-pointer block group">
    <div className="relative overflow-hidden">
      <div className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition-all duration-300 ${value
        ? 'border-green-400 bg-green-50'
        : 'border-gray-300 bg-gray-50 group-hover:border-purple-400 group-hover:bg-purple-50'
        }`}>
        {value ? (
          <div className="flex flex-col items-center">
            <div className="relative">
              <img
                src={value}
                alt="uploaded"
                className="rounded-lg shadow-lg object-cover"
                style={{ width: previewSize, height: previewSize }}
              />
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="text-green-600 font-semibold mt-2 text-center">Uploaded Successfully!</div>
            <div className="text-gray-500 text-sm">Click to change</div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors">
              {emptyIcon}
            </div>
            <div className="text-gray-700 font-medium mt-3 text-center">{emptyText}</div>
            <div className="text-gray-500 text-sm text-center">{acceptHint}</div>
          </div>
        )}
      </div>
      <input type="file" accept="image/*" className="hidden" onChange={onChange} />
    </div>
  </label>
);

export const Card = ({ icon, heading, subheading, children, stepNumber, isActive }) => (
  <div className={`bg-white rounded-2xl shadow-xl border-2 transition-all duration-500 ${isActive ? 'border-purple-500 shadow-purple-200' : 'border-gray-100'}`}>
    <div className="p-8">
      <div className="flex items-center gap-4 mb-6">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${isActive ? 'bg-gradient-to-br from-purple-600 to-purple-800 shadow-lg scale-110' : 'bg-purple-100'}`}>
          <span className={isActive ? 'text-white' : 'text-purple-600'}>{icon}</span>
        </div>
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-bold px-3 py-1 rounded-full ${isActive ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'}`}>Step {stepNumber}</span>
            {isActive && <Sparkles className="w-4 h-4 text-yellow-500 animate-pulse" />}
          </div>
          <div className="text-xl font-bold text-gray-900 mt-1">{heading}</div>
          <div className="text-gray-600 text-sm mt-1">{subheading}</div>
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  </div>
);

export const ProgressBar = ({ currentStep, totalSteps }) => (
  <div className="px-6 py-4">
    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
      <div 
        className="h-full bg-gradient-to-r from-purple-600 to-purple-800 rounded-full transition-all duration-500 shadow-lg"
        style={{ width: `${(currentStep / totalSteps) * 100}%` }}
      />
    </div>
  </div>
);

export const StepTitle = ({ title, subtitle, Icon }) => (
  <div className="px-6 py-6 text-center">
    <div className="inline-flex items-center gap-3 mb-3">
      <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-800 rounded-full flex items-center justify-center shadow-lg">
        {Icon && <Icon className="w-6 h-6 text-white" />}
      </div>
      <div className="text-left">
        <div className="text-2xl font-bold text-gray-900">{title}</div>
        <div className="text-gray-600">{subtitle}</div>
      </div>
    </div>
  </div>
);
