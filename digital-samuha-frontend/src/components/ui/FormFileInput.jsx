import React, { useState, useRef } from 'react';
import { Upload, File, X } from 'lucide-react';

const FormFileInput = ({ 
  label, 
  id, 
  onChange, 
  error, 
  accept = "image/*", 
  className = '', 
  helperText, // Explicitly extract to prevent leakage
  value, // Filter out value to prevent crash on file input
  defaultValue, // Filter out defaultValue
  ...props 
}) => {
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      onChange(e);
    }
  };

  const clearFile = () => {
    setFileName('');
    const input = document.getElementById(id);
    if (input) input.value = '';
    onChange({ target: { files: [] } });
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-sm font-bold text-gray-700 tracking-tight ml-1">
          {label}
        </label>
      )}
      <div className={`relative flex items-center gap-3 p-3 bg-gray-50 border-2 rounded-xl border-dashed transition-all cursor-pointer hover:border-indigo-600/30 ${error ? 'border-rose-100 hover:border-rose-200' : 'border-transparent'}`} onClick={() => fileInputRef.current?.click()}>
        <input
          id={id}
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
          {...props}
        />
        <div className="p-2 bg-white rounded-lg shadow-sm text-indigo-600">
          <Upload size={18} />
        </div>
        <div className="flex-1 overflow-hidden">
          <p className="text-xs font-bold text-gray-900 truncate">
            {fileName || "Choose file or drag and drop..."}
          </p>
          <p className="text-[10px] text-gray-400 font-medium">PNG, JPG up to 5MB</p>
        </div>
        {fileName && (
          <button type="button" onClick={(e) => { e.stopPropagation(); clearFile(); }} className="text-gray-400 hover:text-rose-600 transition-colors">
            <X size={16} />
          </button>
        )}
      </div>
      {error && <p className="text-rose-600 text-xs font-bold pl-1">{error}</p>}
    </div>
  );
};

export default FormFileInput;
