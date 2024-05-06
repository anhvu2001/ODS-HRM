import React, { useState } from 'react';

function SelectInput({ options, value, onChange,placeholder, ...props }) {
  const [selectedValue, setSelectedValue] = useState(value);

  const handleChange = (event) => {
    const value = event.target.value;
    setSelectedValue(value);
    onChange(value);
  };

  return (
    <select {...props} value={selectedValue} onChange={handleChange}>
      {placeholder && <option disabled value="">{placeholder}</option>}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export default SelectInput;
