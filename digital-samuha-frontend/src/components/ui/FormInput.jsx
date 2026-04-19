import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const FormInput = ({ 
  label, 
  id, 
  type = 'text', 
  placeholder, 
  error, 
  className = '', 
  icon: Icon,
  helperText, // Explicitly extract to prevent leakage
  value, // Explicitly extract to prevent uncontrolled -> controlled warning
  isDark, // Explicitly extract to prevent DOM attribute warning
  ...props 
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = type === 'password';
  const inputType = isPasswordField && showPassword ? 'text' : type;

  return (
    <div className={`space-y-1.5 w-full ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-sm font-bold text-gray-700 tracking-tight ml-1">
          {label}
        </label>
      )}
      <div className="relative group">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors pointer-events-none">
            <Icon size={20} />
          </div>
        )}
        {type === 'select' ? (
          <select
            id={id}
            value={value ?? ''}
            className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl text-gray-900 placeholder:text-gray-400 font-medium transition-all focus:outline-none focus:ring-4 focus:ring-indigo-100 appearance-none cursor-pointer ${Icon ? 'pl-11' : ''} ${error ? 'border-rose-100 focus:border-rose-200' : 'border-transparent focus:border-indigo-600/20'}`}
            {...props}
          >
            {placeholder && <option value="" disabled>{placeholder}</option>}
            {props.options?.map(opt => (
              <option key={opt.value || opt} value={opt.value || opt}>
                {opt.label || opt}
              </option>
            ))}
          </select>
        ) : (
          <input
            id={id}
            type={inputType}
            placeholder={placeholder}
            value={value ?? ''}
            className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl text-gray-900 placeholder:text-gray-400 font-medium transition-all focus:outline-none focus:ring-4 focus:ring-indigo-100 ${Icon ? 'pl-11' : ''} ${isPasswordField ? 'pr-12' : ''} ${error ? 'border-rose-100 focus:border-rose-200' : 'border-transparent focus:border-indigo-600/20'}`}
            {...props}
          />
        )}
        {isPasswordField && (
          <button
            type="button"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors p-1"
            onClick={() => setShowPassword(!showPassword)}
            title={showPassword ? "Hide password" : "Show password"}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && <p className="text-rose-600 text-xs font-bold pl-1 animate-in fade-in slide-in-from-top-1">{error}</p>}
    </div>
  );
};

export default FormInput;
