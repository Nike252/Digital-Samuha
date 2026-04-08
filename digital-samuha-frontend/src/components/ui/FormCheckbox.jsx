import React from 'react';

const FormCheckbox = ({ 
  label, 
  id, 
  checked, 
  onChange, 
  error, 
  className = '', 
  ...props 
}) => {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <div className="flex items-center group cursor-pointer">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={onChange}
          className="w-5 h-5 bg-gray-50 border-2 border-transparent rounded-lg text-indigo-600 focus:ring-4 focus:ring-indigo-100 transition-all cursor-pointer accent-indigo-600 appearance-none border-gray-200 checked:bg-indigo-600 checked:border-indigo-600"
          {...props}
        />
        {label && (
          <label htmlFor={id} className="ml-3 text-sm font-bold text-gray-700 cursor-pointer select-none group-hover:text-gray-900 transition-colors">
            {label}
          </label>
        )}
      </div>
      {error && <p className="text-rose-600 text-[10px] font-bold pl-8">{error}</p>}
    </div>
  );
};

export default FormCheckbox;
