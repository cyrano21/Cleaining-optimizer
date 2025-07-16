import { useState } from 'react';

export default function Input({ 
  label, 
  type = 'text', 
  placeholder = '', 
  value, 
  onChange, 
  error = null,
  className = '',
  ...props 
}) {
  const baseStyles = "w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent";
  const errorStyles = error ? "border-red-500 focus:ring-red-500" : "";
  const inputStyles = `${baseStyles} ${errorStyles} ${className}`;
  
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-gray-700 text-sm font-medium mb-1">
          {label}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={inputStyles}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
