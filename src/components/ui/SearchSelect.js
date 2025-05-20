"use client";

import { useState, useEffect, useRef } from "react";

export default function SearchSelect({ options, value, onChange, placeholder = "Sélectionner...", label, disabled = false, required = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOptions, setFilteredOptions] = useState(options);
  const dropdownRef = useRef(null);
  
  useEffect(() => {
    setFilteredOptions(options);
  }, [options]);
  
  useEffect(() => {
    // Fermer le dropdown si on clique ailleurs
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    if (!term.trim()) {
      setFilteredOptions(options);
      return;
    }
    
    const filtered = options.filter(option => 
      option.label.toLowerCase().includes(term.toLowerCase())
    );
    
    setFilteredOptions(filtered);
  };
  
  const handleSelect = (option) => {
    onChange(option.value);
    setIsOpen(false);
    setSearchTerm("");
    setFilteredOptions(options);
  };
  
  const selectedOption = options.find(option => option.value === value);
  
  return (
    <div className="relative" ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <button
        type="button"
        className={`relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${disabled ? 'bg-gray-100 text-gray-500' : 'text-gray-900'}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <span className="block truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </span>
      </button>
      
      {isOpen && (
        <div className="absolute mt-1 w-full rounded-md bg-white shadow-lg z-10">
          <div className="p-2">
            <input
              type="text"
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={handleSearch}
              autoFocus
            />
          </div>
          <ul className="max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
            {filteredOptions.length === 0 ? (
              <li className="text-gray-500 select-none relative py-2 pl-3 pr-9">
                Aucun résultat trouvé
              </li>
            ) : (
              filteredOptions.map(option => (
                <li
                  key={option.value}
                  className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-blue-50 ${option.value === value ? 'bg-blue-100' : ''}`}
                  onClick={() => handleSelect(option)}
                >
                  <span className={`block truncate ${option.value === value ? 'font-medium' : 'font-normal'}`}>
                    {option.label}
                  </span>
                  {option.value === value && (
                    <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600">
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                  )}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
