import React from "react";
import Select from "react-select";

export default function ParticipantSelector({
    users,
    selectedParticipants,
    onChange,
    title = "Add Participants",
}) {
    const handleParticipantChange = (selectedOptions) => {
        const selectedIds = selectedOptions.map((option) => option.value);
        onChange(selectedIds);
    };

    return (
        <div className="mb-4">
            <label htmlFor="participants" className="block mb-2 font-medium">
                {title}
            </label>
            <Select
                isMulti
                options={users.map((user) => ({
                    value: user.id,
                    label: user.name,
                }))}
                value={selectedParticipants.map((id) => {
                    const user = users.find((u) => u.id === id);
                    return user ? { value: user.id, label: user.name } : null;
                })}
                onChange={handleParticipantChange}
                className="basic-multi-select"
                classNamePrefix="select"
                placeholder="Select participants..."
            />
        </div>
    );
}
