import React, { useState, useEffect } from "react";
import axios from "axios";
import useValidation from "@/hook/useValidation";
import Select from "react-select";

export default function CreateProjectModal({
    showModal,
    handleClose,
    onProjectCreated,
}) {
    const initialFormData = {
        name: "",
        description: "",
        start_date: "",
        end_date: "",
        participants: [],
    };

    const [formData, setFormData] = useState(initialFormData);
    const [users, setUsers] = useState([]);
    const {errors, validate } = useValidation();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const { data } = await axios.get(route("Get_all_users"));
                if (data?.success) {
                    setUsers(data?.data);
                }
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };
        fetchUsers();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleParticipantChange = (selectedOptions) => {
        const selectedIds = selectedOptions.map((option) => option.value);
        setFormData((prev) => ({
            ...prev,
            participants: selectedIds,
        }));
    };

    const resetForm = () => {
        setFormData(initialFormData);
    };

    const submitForm = async (e) => {
        e.preventDefault();

        if (!validate(formData)) return;
        try {
            const response = await axios.post(
                route("Create_Project"),
                formData
            );
            alert(response.data.message || "Project created successfully!");
            onProjectCreated();
            resetForm();
            handleClose();
        } catch (error) {
            console.error(
                "Error creating project:",
                error.response?.data || error
            );
            alert(
                "Failed to create project. Please check your input and try again."
            );
        }
    };

    const handleModalClose = () => {
        resetForm();
        handleClose();
    };
    if (!showModal) return null;
    return (
        <div
            className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-10"
            onClick={handleModalClose}
        >
            <div
                className="bg-white p-8 rounded-lg w-3/4 max-w-lg"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-2xl font-semibold mb-6 text-center">
                    Create New Project
                </h2>
                <form onSubmit={submitForm}>
                    <div className="mb-4">
                        <label
                            htmlFor="name"
                            className="block mb-2 font-medium"
                        >
                            Project Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
                        />
                        {errors.name && (
                            <p className="text-red-500 text-sm">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    {/* Dropdown thêm người tham gia */}
                    <div className="mb-4">
                        <label
                            htmlFor="participants"
                            className="block mb-2 font-medium"
                        >
                            Add Participants
                        </label>
                        <Select
                            isMulti
                            options={users.map((user) => ({
                                value: user.id,
                                label: user.name,
                            }))}
                            value={formData.participants.map((id) => {
                                const user = users.find((u) => u.id === id);
                                return user
                                    ? { value: user.id, label: user.name }
                                    : null;
                            })}
                            onChange={handleParticipantChange}
                            className="basic-multi-select"
                            classNamePrefix="select"
                            placeholder="Select participants..."
                        />
                    </div>

                    <div className="mb-4">
                        <label
                            htmlFor="description"
                            className="block mb-2 font-medium"
                        >
                            Description (Optional)
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
                        ></textarea>
                    </div>

                    <div className="mb-4">
                        <label
                            htmlFor="start_date"
                            className="block mb-2 font-medium"
                        >
                            Start Date
                        </label>
                        <input
                            type="date"
                            id="start_date"
                            name="start_date"
                            value={formData.start_date}
                            onChange={handleChange}
                            min={new Date().toISOString().split("T")[0]}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
                        />
                        {errors.start_date && (
                            <p className="text-red-500 text-sm">
                                {errors.start_date}
                            </p>
                        )}
                    </div>

                    <div className="mb-4">
                        <label
                            htmlFor="end_date"
                            className="block mb-2 font-medium"
                        >
                            End Date
                        </label>
                        <input
                            type="date"
                            id="end_date"
                            name="end_date"
                            value={formData.end_date}
                            onChange={handleChange}
                            min={
                                formData.start_date ||
                                new Date().toISOString().split("T")[0]
                            }
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
                        />
                        {errors.end_date && (
                            <p className="text-red-500 text-sm">
                                {errors.end_date}
                            </p>
                        )}
                    </div>

                    <div className="flex justify-between items-center">
                        <button
                            type="button"
                            onClick={handleModalClose}
                            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                        >
                            Close
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
                        >
                            Create
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
