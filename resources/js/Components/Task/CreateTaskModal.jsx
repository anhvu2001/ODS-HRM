import React, { useState } from "react";
import axios from "axios";
import useTaskValidation from "@/hook/useTaskValidation";
import Select from "react-select";

export default function CreateTaskModal({
    showModal,
    handleCreateTaskClose,
    handleModalClose,
    onTaskCreate,
    participants,
    parent_id,
    project,
    priorityOptions,
}) {
    const initialFormData = {
        name: "",
        description: "",
        start_date: "",
        due_date: "",
        priority_id: "",
        participant: null,
        parent_id: parent_id,
        project_id: project,
    };
    const transformOptions = priorityOptions.map((option) => ({
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
    const handleParticipantChange = (selectedOption) => {
        setFormData((prev) => ({
            ...prev,
            participant: selectedOption ? selectedOption.value : null, // Store only the ID
        }));
    };
    const handlePriorityChange = (selectedOption) => {
        setFormData((prev) => ({
            ...prev,
            priority_id: selectedOption ? selectedOption.value : null, // Store only the ID
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
                setIsCreating(false);
            }
        } catch (error) {
            console.error();
            setIsCreating(false);

            alert("failed to create task ");
        }
    };
    if (!showModal) return;
    return (
        <div
            className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-10"
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
                    {/* Dropdown thêm người tham gia */}
                    <div className="mb-4">
                        <label
                            htmlFor="participant"
                            className="block mb-2 font-medium"
                        >
                            Add Executor
                        </label>
                        <Select
                            options={participants.map((participant) => ({
                                value: participant.id,
                                label: participant.name,
                            }))}
                            value={
                                participants.find(
                                    (p) => p.id === formData.participant
                                )
                                    ? {
                                          value: formData.participant,
                                          label: participants.find(
                                              (p) =>
                                                  p.id === formData.participant
                                          ).name,
                                      }
                                    : null
                            }
                            onChange={handleParticipantChange}
                            className="basic-select"
                            classNamePrefix="select"
                            placeholder="Select participants..."
                        />
                        {errors.name && (
                            <p className="text-red-500 text-sm">
                                {errors.participant}
                            </p>
                        )}
                    </div>
                    {/* dropdown chon priority */}
                    <div className="mb-4">
                        <label
                            htmlFor="priority"
                            className="block mb-2 font-medium"
                        >
                            {`Select ${parent_id ? `Sub` : ``} Task Priority`}
                        </label>
                        <Select
                            options={transformOptions}
                            value={
                                transformOptions.find(
                                    (p) => p.value === formData.priority_id
                                )
                                    ? {
                                          value: formData.priority_id,
                                          label: transformOptions.find(
                                              (p) =>
                                                  p.value ===
                                                  formData.priority_id
                                          ).label,
                                      }
                                    : null
                            }
                            onChange={handlePriorityChange}
                            className="basic-multi-select"
                            classNamePrefix="select"
                            placeholder="Select priority"
                        />
                        {errors.name && (
                            <p className="text-red-500 text-sm">
                                {errors.priority_id}
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
                            htmlFor="due_date"
                            className="block mb-2 font-medium"
                        >
                            End Date
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
                        >
                            {`${isCreating ? `Creating...` : `Create`}`}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
