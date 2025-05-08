import React, { useState } from "react";
import axios from "axios";
import useTaskValidation from "@/hook/useTaskValidation";
import Select from "react-select";
import { useEffect } from "react";

export default function CreateTaskModal({
    showModal,
    handleCreateTaskClose,
    handleModalClose,
    onTaskCreate,
    parent_id,
    project,
    departmentOptions,
    deadline,
}) {
    const [taskCategoriesOption, setTaskCategoriesOption] = useState([]);

    const initialFormData = {
        name: "",
        department: null,
        category_id: null,
        description: "",
        due_date: "",
        parent_id: parent_id,
        project_id: project,
    };

    const fetchTaskCategories = async () => {
        try {
            const { data } = await axios.get(
                route("Get_task_categories_option")
            );
            setTaskCategoriesOption(data?.data);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };
    useEffect(() => {
        fetchTaskCategories();
    }, []);
    const transformOptions = taskCategoriesOption.map((option) => ({
        value: option.id,
        label: option.name,
    }));
    const [isCreating, setIsCreating] = useState(false);
    const resetForm = () => {
        setFormData(initialFormData);
    };
    const [formData, setFormData] = useState(initialFormData);
    const { errors, validate } = useTaskValidation();
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };
    const handleDepartmentChange = (selectedOption) => {
        setFormData((prev) => ({
            ...prev,
            department: selectedOption ? selectedOption.value : null, // Store only the ID
        }));
    };
    const handleTaskCategoryChange = (selectedOption) => {
        setFormData((prev) => ({
            ...prev,
            category_id: selectedOption ? selectedOption.value : null, // Store only the ID
        }));
    };

    const submitForm = async (e) => {
        e.preventDefault();
        setIsCreating(true);
        try {
            validate(formData);
            if (!formData.parent_id) {
                const response = await axios.post(
                    route("Create_task"),
                    formData
                );
                alert(response.data.message || "Task created successfully!");
                resetForm();
                handleCreateTaskClose();
                handleModalClose();
                onTaskCreate();
            } else if (formData.parent_id) {
                const response = await axios.post(
                    route("Create_sub_task"),
                    formData
                );
                alert(
                    response.data.message || "Sub task created successfully!"
                );
                resetForm();
                handleCreateTaskClose();
                handleModalClose();
                onTaskCreate();
            }
            setIsCreating(false);
        } catch (error) {
            console.error();
            setIsCreating(false);

            alert("failed to create task ");
        }
    };
    if (!showModal) return;
    return (
        <div
            className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-10 overflow-y-scroll"
            onClick={handleCreateTaskClose}
        >
            <div
                className="bg-white p-8 rounded-lg w-3/4 max-w-lg"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-2xl font-semibold mb-6 text-center">
                    {`Create New ${parent_id ? `Sub` : ``} Task`}
                </h2>
                <form onSubmit={submitForm}>
                    <div className="mb-4">
                        <label
                            htmlFor="name"
                            className="block mb-2 font-medium"
                        >
                            {`${parent_id ? `Sub` : ``} Task Name`}
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
                    <div className="mb-4">
                        <label
                            htmlFor="department"
                            className="block mb-2 font-medium"
                        >
                            Select Department
                        </label>
                        <Select
                            options={departmentOptions?.map((item) => ({
                                value: item.department_id,
                                label: item.department.department_name,
                            }))}
                            value={
                                departmentOptions.find(
                                    (p) =>
                                        p.department_id === formData.department
                                )
                                    ? {
                                          value: formData.department,
                                          label: departmentOptions.find(
                                              (p) =>
                                                  p.department_id ===
                                                  formData.department
                                          ).department.department_name,
                                      }
                                    : null
                            }
                            onChange={handleDepartmentChange}
                            className="basic-select"
                            classNamePrefix="select"
                            placeholder="Select departments..."
                        />
                        {errors.name && (
                            <p className="text-red-500 text-sm">
                                {errors.department}
                            </p>
                        )}
                    </div>
                    <div className="mb-4">
                        <label
                            htmlFor="task_category"
                            className="block mb-2 font-medium"
                        >
                            {`Select ${parent_id ? `Sub` : ``} Task Category`}
                        </label>
                        <Select
                            options={transformOptions}
                            value={
                                transformOptions.find(
                                    (p) => p.value === formData.category_id
                                )
                                    ? {
                                          value: formData.category_id,
                                          label: transformOptions.find(
                                              (p) =>
                                                  p.value ===
                                                  formData.category_id
                                          ).label,
                                      }
                                    : null
                            }
                            onChange={handleTaskCategoryChange}
                            className="basic-multi-select"
                            classNamePrefix="select"
                            placeholder="Select task categories"
                        />
                        {errors.name && (
                            <p className="text-red-500 text-sm">
                                {errors.category_id}
                            </p>
                        )}
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
                            htmlFor="due_date"
                            className="block mb-2 font-medium"
                        >
                            Deadline
                        </label>
                        <input
                            type="date"
                            id="due_date"
                            name="due_date"
                            value={formData.due_date}
                            onChange={handleChange}
                            min={
                                formData.start_date ||
                                new Date().toISOString().split("T")[0]
                            }
                            max={deadline}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
                        />
                        {errors.due_date && (
                            <p className="text-red-500 text-sm">
                                {errors.due_date}
                            </p>
                        )}
                    </div>

                    <div className="flex justify-between items-center">
                        <button
                            type="button"
                            onClick={handleCreateTaskClose}
                            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                        >
                            Close
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
                            disabled={isCreating}
                        >
                            {`${isCreating ? `Creating...` : `Create`}`}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
