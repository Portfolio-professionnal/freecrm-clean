'use client';

import { forwardRef } from 'react';
import { FiAlertCircle } from 'react-icons/fi';

const FormInput = forwardRef(
  (
    {
      type = 'text',
      label,
      id,
      name,
      value,
      placeholder,
      helperText,
      error,
      startIcon,
      endIcon,
      disabled = false,
      readOnly = false,
      required = false,
      className = '',
      onChange,
      onBlur,
      options,
      rows = 3,
      ...props
    },
    ref
  ) => {
    // Générer un ID unique si non fourni
    const inputId = id || `input-${name}-${Math.random().toString(36).substr(2, 9)}`;

    // Styles communs pour tous les types d'entrées
    const baseInputStyles =
      'block w-full rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm';
    const disabledStyles = disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : '';
    const errorStyles = error
      ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
      : 'border-gray-300';

    // Style pour les icônes
    const iconWrapperStyles = 'absolute inset-y-0 flex items-center pointer-events-none';

    // Rendu des différents types d'entrées
    const renderInput = () => {
      switch (type) {
        case 'textarea':
          return (
            <textarea
              id={inputId}
              name={name}
              ref={ref}
              value={value}
              rows={rows}
              onChange={onChange}
              onBlur={onBlur}
              disabled={disabled}
              readOnly={readOnly}
              required={required}
              className={`${baseInputStyles} ${errorStyles} ${disabledStyles} resize-none ${
                startIcon ? 'pl-10' : ''
              } ${endIcon ? 'pr-10' : ''} ${className}`}
              placeholder={placeholder}
              {...props}
            />
          );
        case 'select':
          return (
            <select
              id={inputId}
              name={name}
              ref={ref}
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              disabled={disabled}
              required={required}
              className={`${baseInputStyles} ${errorStyles} ${disabledStyles} ${
                startIcon ? 'pl-10' : ''
              } ${endIcon ? 'pr-10' : ''} ${className}`}
              {...props}
            >
              {placeholder && (
                <option value="" disabled>
                  {placeholder}
                </option>
              )}
              {options &&
                options.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                  >
                    {option.label}
                  </option>
                ))}
            </select>
          );
        case 'checkbox':
          return (
            <input
              id={inputId}
              type="checkbox"
              name={name}
              ref={ref}
              checked={value}
              onChange={onChange}
              onBlur={onBlur}
              disabled={disabled}
              required={required}
              className={`h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded ${disabledStyles} ${className}`}
              {...props}
            />
          );
        case 'radio':
          return (
            <input
              id={inputId}
              type="radio"
              name={name}
              ref={ref}
              checked={value}
              onChange={onChange}
              onBlur={onBlur}
              disabled={disabled}
              required={required}
              className={`h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 ${disabledStyles} ${className}`}
              {...props}
            />
          );
        default:
          return (
            <input
              id={inputId}
              type={type}
              name={name}
              ref={ref}
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              disabled={disabled}
              readOnly={readOnly}
              required={required}
              className={`${baseInputStyles} ${errorStyles} ${disabledStyles} h-10 ${
                startIcon ? 'pl-10' : ''
              } ${endIcon ? 'pr-10' : ''} ${className}`}
              placeholder={placeholder}
              {...props}
            />
          );
      }
    };

    return (
      <div className="relative">
        {label && (
          <label
            htmlFor={inputId}
            className={`block text-sm font-medium mb-1 ${
              error ? 'text-red-600' : 'text-gray-700'
            } ${required ? 'after:content-["*"] after:ml-0.5 after:text-red-500' : ''}`}
          >
            {label}
          </label>
        )}

        <div className="relative">
          {startIcon && (
            <div className={`${iconWrapperStyles} left-0 pl-3`}>{startIcon}</div>
          )}

          {renderInput()}

          {endIcon && (
            <div className={`${iconWrapperStyles} right-0 pr-3`}>{endIcon}</div>
          )}

          {error && type !== 'checkbox' && type !== 'radio' && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <FiAlertCircle className="h-5 w-5 text-red-500" aria-hidden="true" />
            </div>
          )}
        </div>

        {(helperText || error) && (
          <p
            className={`mt-1 text-sm ${
              error ? 'text-red-600' : 'text-gray-500'
            }`}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';

export default FormInput;