// src/Components/Chat/SearchBar.js
import React, { useState } from 'react';

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleChange = (e) => {
    setQuery(e.target.value);
    onSearch(e.target.value); // Call parent callback when user types
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Search for a user..."
        value={query}
        onChange={handleChange}
      />
    </div>
  );
};

export default SearchBar;
