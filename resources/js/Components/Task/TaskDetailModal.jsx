import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import CreateTaskModal from "./CreateTaskModal";
import useTaskValidation from "@/hook/useTaskValidation";
import TaskComments from "../TaskComments/TaskComments";

export default function TaskDetailModal({
    task,
    handleModalClose,
    projectParticipants,
    onTaskCreate,
    edit,
    auth,
}) {
    console.log(task.id);
    const handleCreateTask = () => {
        setShowModal(true);
        // handleModalClose();
    };
    const { errors, validate } = useTaskValidation();
    const [priorityOptions, setPriorityOptions] = useState([]);
    const [dataComment, setDataComment] = useState([]);
    const fetchPriority = async () => {
        try {
            const { data } = await axios.get(route("Get_priority_option"));
            setPriorityOptions(data);
        } catch (error) {
            console.error("Error fetching priorities:", error);
        }
    };
    useEffect(() => {
        fetchPriority();
    }, []);
    const [statusOptions, setStatusOptions] = useState([]);
    const fetchStatuses = async () => {
        try {
            const { data } = await axios.get(route("Get_All_Status"));
            setStatusOptions(data);
        } catch (error) {
            console.error("Error fetching statuses:", error);
        }
    };
    //  lấy comment của task này
    const fetchDataComment = async () => {
        try {
            const { data } = await axios.get(
                route("get_all_task_comments", task.id)
            );
            setDataComment(data);
        } catch (error) {
            console.error("error fetching comment");
        }
    };
    useEffect(() => {
        fetchDataComment();
    }, []);

    useEffect(() => {
        fetchPriority();
        fetchStatuses();
    }, []);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: task.name,
        // participant: task.task_user[0].user_id,
        participant:
            edit && task.task_user ? task.task_user.user_id : auth.user.id,
        priority_id: task.priority_id,
        status: task.status_id,
        description: task?.description,
        start_date: task.start_date,
        due_date: task.due_date,
    });
    const handleParticipantChange = (selectedOption) => {
        if (edit) {
            setFormData((prev) => ({
                ...prev,
                participant: selectedOption ? selectedOption.value : null, // Store only the ID
            }));
        }
    };
    const handlePriorityChange = (selectedOption) => {
        if (edit) {
            setFormData((prev) => ({
                ...prev,
                priority_id: selectedOption ? selectedOption.value : null, // Store only the ID
            }));
        }
    };
    const handleStatusChange = (selectedOption) => {
        setFormData((prev) => ({
            ...prev,
            status: selectedOption ? selectedOption.value : null,
        }));
    };
    const handleUpdate = async () => {
        try {
            validate(formData);
            const response = await axios.put(
                route("Update_task", task.id),
                formData
            );
            alert(response.data.message);
            handleModalClose();
            onTaskCreate();
        } catch (error) {
            console.error();
            alert("failed to update task ");
        }
    };
    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this task?")) return;
        try {
            const response = await axios.delete(route("Delete_task", task.id));
            onTaskCreate();
            alert("Task deleted");
        } catch (error) {
            console.error();
            alert("Failed to delete task");
        }
    };
    return (
        <div className="fixed top-0 right-0 w-1/2 h-full bg-white shadow-lg p-6 overflow-auto z-20">
            <button
                className="text-red-500 mb-2 w-full font-extrabold text-end"
                onClick={handleModalClose}
            >
                Close
            </button>
            <h2 className="text-xl font-bold mb-2">Task Details</h2>
            <h2 className="text-blue-600">
                Created by: <span>{task.creator.name}</span>
            </h2>
            <div className="space-y-4">
                <div>
                    <label className="block font-bold">Name</label>
                    {edit ? (
                        <input
                            type="text"
                            className="border rounded w-full p-2"
                            value={formData.name}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    name: e.target.value,
                                })
                            }
                        />
                    ) : (
                        <input
                            readOnly
                            type="text"
                            className="border rounded w-full p-2 cursor-default"
                            value={formData.name}
                        />
                    )}
                </div>
                {errors.name && (
                    <p className="text-red-500 text-sm">{errors.name}</p>
                )}
                <div>
                    <label className="block font-bold">Description</label>
                    {edit ? (
                        <textarea
                            className="border rounded w-full p-2"
                            value={formData?.description}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    description: e.target.value,
                                })
                            }
                        />
                    ) : (
                        <textarea
                            readOnly
                            className="border rounded w-full p-2 cursor-default"
                            value={formData?.description}
                        />
                    )}
                </div>
                {projectParticipants && (
                    <div className="mb-2">
                        <label
                            htmlFor="participant"
                            className="block mb-2 font-medium"
                        >
                            Executor
                        </label>
                        {edit ? (
                            <Select
                                options={projectParticipants.map(
                                    (participant) => ({
                                        value: participant.id,
                                        label: participant.name,
                                    })
                                )}
                                value={
                                    projectParticipants.find(
                                        (p) => p.id === formData.participant
                                    )
                                        ? {
                                              value: formData.participant,
                                              label: projectParticipants.find(
                                                  (p) =>
                                                      p.id ===
                                                      formData.participant
                                              ).name,
                                          }
                                        : null
                                }
                                onChange={handleParticipantChange}
                                className="basic-select"
                                classNamePrefix="select"
                                placeholder="Select participant..."
                            />
                        ) : (
                            <input
                                onFocus={(e) => e.preventDefault()}
                                readOnly
                                type="text"
                                className="border rounded w-full p-2 cursor-default"
                                value={
                                    projectParticipants.find(
                                        (p) => p.id === formData.participant
                                    ).name
                                }
                            />
                        )}
                    </div>
                )}

                <div className="flex justify-between">
                    <div className="mb-2">
                        <label
                            htmlFor="priority"
                            className="block mb-2 font-medium"
                        >
                            Priority
                        </label>
                        {edit ? (
                            <Select
                                options={priorityOptions.map((option) => ({
                                    value: option.id,
                                    label: option.name,
                                }))}
                                value={
                                    priorityOptions.find(
                                        (p) => p.id === formData.priority_id
                                    )
                                        ? {
                                              value: formData.priority_id,
                                              label: priorityOptions.find(
                                                  (p) =>
                                                      p.id ===
                                                      formData.priority_id
                                              ).name,
                                          }
                                        : null
                                }
                                onChange={handlePriorityChange}
                            />
                        ) : (
                            <input
                                readOnly
                                type="text"
                                className="border rounded w-full p-2 cursor-default"
                                value={
                                    priorityOptions.find(
                                        (p) => p.id === formData.priority_id
                                    )?.name || "No priority selected"
                                    // formData.priority_id
                                }
                            />
                        )}
                    </div>
                    <div className="mb-2">
                        <label
                            htmlFor="priority"
                            className="block mb-2 font-medium"
                        >
                            Select status
                        </label>
                        <Select
                            options={statusOptions.map((option) => ({
                                value: option.id,
                                label: option.name,
                            }))}
                            value={
                                statusOptions.find(
                                    (p) => p.id === formData.status
                                )
                                    ? {
                                          value: formData.status,
                                          label: statusOptions.find(
                                              (p) => p.id === formData.status
                                          ).name,
                                      }
                                    : null
                            }
                            onChange={handleStatusChange}
                        />
                    </div>
                    <div className="mb-2">
                        <label className="block font-bold mb-2">
                            Start Date
                        </label>
                        <input
                            readOnly={!edit}
                            type="date"
                            className="border rounded w-full p-2"
                            value={formData.start_date}
                            onChange={(e) => {
                                setFormData({
                                    ...formData,
                                    start_date: e.target.value,
                                });
                            }}
                            min={new Date().toISOString().split("T")[0]}
                        />
                    </div>
                    <div className="mb-2">
                        <label className="block font-bold mb-2">End Date</label>
                        <input
                            readOnly={!edit}
                            type="date"
                            className="border rounded w-full p-2"
                            value={formData.due_date}
                            onChange={(e) => {
                                setFormData({
                                    ...formData,
                                    due_date: e.target.value,
                                });
                            }}
                            min={formData.start_date}
                        />
                    </div>
                </div>
            </div>
            <div className="mt-6 flex space-x-4">
                <button
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                    onClick={handleUpdate}
                    // disabled={isUpdating}
                >
                    {/* {isUpdating ? "Updating..." : "Update"} */}Update
                </button>
                {edit && (
                    <button
                        className="bg-red-500 text-white px-4 py-2 rounded"
                        onClick={handleDelete}
                    >
                        Delete
                    </button>
                )}
            </div>
            {edit && (
                <>
                    <button
                        onClick={handleCreateTask}
                        className="bg-green-500 text-white px-4 py-2 rounded my-4"
                    >
                        Create Sub Task
                    </button>
                    <CreateTaskModal
                        showModal={showModal}
                        participants={projectParticipants}
                        project={task.project_id}
                        handleCreateTaskClose={() => setShowModal(false)}
                        parent_id={task.id}
                        onTaskCreate={onTaskCreate}
                        handleModalClose={handleModalClose}
                        priorityOptions={priorityOptions}
                    />
                </>
            )}
            <TaskComments
                user={auth.user.id}
                comments={dataComment}
                taskId={task.id}
            />
        </div>
    );
}
