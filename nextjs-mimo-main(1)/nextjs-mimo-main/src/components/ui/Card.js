import { useState } from 'react';

export default function Card({ 
  title, 
  children, 
  className = '', 
  headerAction = null,
  footer = null,
  bordered = false,
  ...props 
}) {
  const baseStyles = "bg-white rounded-lg shadow-md";
  const borderStyles = bordered ? "border-t-4 border-indigo-500" : "";
  const cardStyles = `${baseStyles} ${borderStyles} ${className}`;
  
  return (
    <div className={cardStyles} {...props}>
      {title && (
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h3 className="font-medium">{title}</h3>
          {headerAction}
        </div>
      )}
      <div className="p-4">
        {children}
      </div>
      {footer && (
        <div className="p-4 border-t border-gray-200">
          {footer}
        </div>
      )}
    </div>
  );
}
