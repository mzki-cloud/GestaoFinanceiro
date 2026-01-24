// src/components/ui/Select.jsx
import React from 'react';

const Select = ({ label, id, className = '', children, ...props }) => {
  return (
    <div className="relative">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <select
        id={id}
        className={`block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md ${className}`}
        {...props}
      >
        {children}
      </select>
    </div>
  );
};

export default Select;
