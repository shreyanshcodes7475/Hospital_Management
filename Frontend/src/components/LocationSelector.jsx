import { useState, useRef, useEffect } from 'react';
import { INDIAN_CITIES } from '../constants/INDIAN_CITIES';

export default function LocationSelector({ 
  onLocationSelect, 
  currentLocation = '',
  placeholder = 'Select a location...',
  fullWidth = false 
}) {
  const [searchTerm, setSearchTerm] = useState(currentLocation);
  const [isOpen, setIsOpen] = useState(false);
  const [filteredCities, setFilteredCities] = useState(INDIAN_CITIES);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Handle search and filtering
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCities(INDIAN_CITIES);
    } else {
      const filtered = INDIAN_CITIES.filter(city =>
        city.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCities(filtered);
    }
  }, [searchTerm]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCitySelect = (city) => {
    setSearchTerm(city);
    setIsOpen(false);
    onLocationSelect(city);
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
  };

  const handleClear = () => {
    setSearchTerm('');
    setFilteredCities(INDIAN_CITIES);
    setIsOpen(true);
    inputRef.current?.focus();
  };

  return (
    <div 
      ref={dropdownRef} 
      className={`relative ${fullWidth ? 'w-full' : 'w-80'}`}
    >
      {/* Input Field */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 text-white rounded-lg 
                     focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30
                     transition-all placeholder-gray-400"
        />
        
        {/* Clear Button */}
        {searchTerm && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-3 text-gray-400 hover:text-white transition"
          >
            ✕
          </button>
        )}

        {/* Dropdown Icon */}
        <div className="absolute right-10 top-3 text-gray-400 pointer-events-none">
          {isOpen ? '▲' : '▼'}
        </div>
      </div>

      {/* Dropdown List */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border-2 border-teal-500 
                        rounded-lg shadow-2xl z-50 max-h-64 overflow-y-auto">
          {filteredCities.length === 0 ? (
            <div className="px-4 py-6 text-center text-gray-400">
              <p className="mb-2">😔 No cities found</p>
              <p className="text-xs">Try searching for a different location</p>
            </div>
          ) : (
            <ul className="py-2">
              {filteredCities.map((city, index) => (
                <li key={index}>
                  <button
                    onClick={() => handleCitySelect(city)}
                    className={`w-full text-left px-4 py-2 transition-colors hover:bg-teal-600/30 
                               ${searchTerm === city ? 'bg-teal-600/50 border-l-4 border-teal-500' : 'text-gray-100'}
                               hover:text-white`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-lg">📍</span>
                      {city}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Selected City Display */}
      {searchTerm && !isOpen && (
        <div className="mt-2 flex items-center gap-2 text-sm text-teal-300">
          <span>✓ Selected:</span>
          <span className="font-semibold">{searchTerm}</span>
        </div>
      )}
    </div>
  );
}
