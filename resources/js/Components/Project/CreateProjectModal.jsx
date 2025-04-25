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
        project_departments: [],
        description: "",
        end_date: "",
    };

    const [formData, setFormData] = useState(initialFormData);
    const { errors, validate } = useValidation();
    const [departments, setDepartments] = useState([]);

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const { data } = await axios.get(route("Get_all_departments"));
                if (data?.success) {
                    setDepartments(data?.data);
                }
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };
        fetchDepartments();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleDepartmentChange = (selectedOptions) => {
        const selectedIds = selectedOptions.map((option) => option.value);
        setFormData((prev) => ({
            ...prev,
            project_departments: selectedIds,
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
            console.log(response.data.message);
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
                            htmlFor="departments"
                            className="block mb-2 font-medium"
                        >
                            Add Departments
                        </label>
                        <Select
                            isMulti
                            options={departments.map((department) => ({
                                value: department.id,
                                label: department.department_name,
                            }))}
                            value={formData.project_departments.map((id) => {
                                const department = departments.find(
                                    (d) => d.id === id
                                );
                                return department
                                    ? {
                                          value: department.id,
                                          label: department.department_name,
                                      }
                                    : null;
                            })}
                            onChange={handleDepartmentChange}
                            className="basic-multi-select"
                            classNamePrefix="select"
                            placeholder="Select departments..."
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
                            htmlFor="end_date"
                            className="block mb-2 font-medium"
                        >
                            Deadline
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
