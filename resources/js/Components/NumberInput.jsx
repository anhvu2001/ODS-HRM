import React, { useState } from 'react';

function NumberInput({ name, valueInput }) {
    const [value, setValue] = useState(valueInput);

    const handleChange = (event) => {
        let value = event.target.value;
        value = value.replace(/\./g, "");

        if (!isNaN(value) && value.trim() !== "") {
            value = parseInt(value).toLocaleString("de-DE"); // convert to string with commas
        }
        setValue(value);
    };
    const handleBlur = (event) => {
        let value = event.target.value;
        let newValue = value.replace(/[,a-zA-Zàáảãạăắằẳẵặâấầẩẫậđèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵ]/g, "");
        newValue = newValue.replace(/\./g, "");
        newValue = parseFloat(newValue);
        newValue = newValue.toLocaleString('de-DE');
        setValue(newValue);
    };
    return (
        <input
            name={name}
            value={value}
            className="block w-full p-2 border border-gray-300 rounded-md"
            type="text"
            onChange={handleChange}
            onBlur={handleBlur}
        />
    );
}

export default NumberInput;

