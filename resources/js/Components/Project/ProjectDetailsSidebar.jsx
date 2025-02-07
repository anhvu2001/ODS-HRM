import React, { useState, useEffect } from "react";
import axios from "axios";
import ParticipantSelector from "./ParticipantSelector";

export default function ProjectDetailsSidebar({
    project,
    closeSidebar,
    onProjectUpdated,
}) {
    const [isUpdating, setIsUpdating] = useState(false);
    const [statues, setStatues] = useState([]);
    const [users, setUsers] = useState([]);
    const { name, description, start_date, end_date, status_id, participants } =
        project;
    const ListIdParticipants = participants.map((item) => item.id);
    const [updatedProject, setUpdatedProject] = useState({
        name: name,
        description: description,
        start_date: start_date,
        end_date: end_date,
        status: status_id,
        participants: ListIdParticipants || [],
    });

    const handleUpdate = async () => {
        setIsUpdating(true);
        try {
            await axios.put(
                route("Update_Project", project.id),
                updatedProject
            );
            alert("Project updated successfully!");
            closeSidebar();
            onProjectUpdated(); // Gọi callback sau khi cập nhật thành công
        } catch (error) {
            const errorMessage =
                error.response?.data?.message || "Failed to update project.";
            console.error(errorMessage, error);
            alert(errorMessage);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this project?")) return;

        try {
            await axios.delete(route("Delete_Project", project.id));
            alert("Project deleted successfully!");
            closeSidebar();
            onProjectUpdated(); // Gọi callback sau khi xóa thành công
        } catch (error) {
            console.error("Failed to delete project:", error);
            alert("Failed to delete project.");
        }
    };

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

    const fetchStatus = async () => {
        try {
            const { data } = await axios.get(route("Get_All_Status"));
            if (data) {
                setStatues(data);
            }
        } catch (error) {
            console.error("Error fetching statuses:", error);
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchStatus();
    }, [project.id]);

    const handleStartDateChange = (e) => {
        const newStartDate = e.target.value;
        const today = new Date().toISOString().split("T")[0]; // Lấy ngày hiện tại theo định dạng YYYY-MM-DD

        // Kiểm tra nếu ngày bắt đầu nhỏ hơn ngày hiện tại
        if (newStartDate < today) {
            alert("Start date cannot be in the past.");
            return; // Không cập nhật nếu ngày bắt đầu không hợp lệ
        }

        setUpdatedProject((prev) => ({
            ...prev,
            start_date: newStartDate,
            // Nếu ngày bắt đầu thay đổi và ngày kết thúc cũ nhỏ hơn ngày bắt đầu mới, cập nhật lại ngày kết thúc
            end_date:
                newStartDate > prev.end_date ? newStartDate : prev.end_date,
        }));
    };

    const handleEndDateChange = (e) => {
        const newEndDate = e.target.value;
        const today = new Date().toISOString().split("T")[0]; // Lấy ngày hiện tại theo định dạng YYYY-MM-DD

        // Kiểm tra nếu ngày kết thúc nhỏ hơn ngày bắt đầu hoặc ngày kết thúc nhỏ hơn ngày hiện tại
        if (newEndDate < updatedProject.start_date) {
            alert("End date cannot be earlier than start date.");
            return; // Không cập nhật nếu ngày kết thúc không hợp lệ
        }

        if (newEndDate < today) {
            alert("End date cannot be in the past.");
            return; // Không cập nhật nếu ngày kết thúc không hợp lệ
        }

        setUpdatedProject((prev) => ({
            ...prev,
            end_date: newEndDate,
        }));
    };

    return (
        <div className="fixed top-0 right-0 w-1/2 h-full bg-white shadow-lg p-6 z-20 overflow-auto">
            <button
                className="text-red-500 mb-4 w-full font-extrabold text-end"
                onClick={closeSidebar}
            >
                Close
            </button>
            <h2 className="text-xl font-bold mb-4">Project Details</h2>
            <div className="space-y-4">
                <div>
                    <label className="block font-bold">Name</label>
                    <input
                        type="text"
                        className="border rounded w-full p-2"
                        value={updatedProject.name}
                        onChange={(e) =>
                            setUpdatedProject({
                                ...updatedProject,
                                name: e.target.value,
                            })
                        }
                    />
                </div>
                <div>
                    <label className="block font-bold">Description</label>
                    <textarea
                        className="border rounded w-full p-2"
                        value={updatedProject?.description}
                        onChange={(e) =>
                            setUpdatedProject({
                                ...updatedProject,
                                description: e.target.value,
                            })
                        }
                    ></textarea>
                </div>
                <ParticipantSelector
                    users={users}
                    selectedParticipants={updatedProject.participants}
                    title="Add Participants"
                    onChange={(selectedIds) =>
                        setUpdatedProject((prev) => ({
                            ...prev,
                            participants: selectedIds,
                        }))
                    }
                />
                <div>
                    <label className="block font-bold">Start Date</label>
                    <input
                        type="date"
                        className="border rounded w-full p-2"
                        value={updatedProject.start_date}
                        onChange={handleStartDateChange}
                        min={new Date().toISOString().split("T")[0]}
                    />
                </div>
                <div>
                    <label className="block font-bold">End Date</label>
                    <input
                        type="date"
                        className="border rounded w-full p-2"
                        value={updatedProject.end_date}
                        onChange={handleEndDateChange}
                        min={updatedProject.start_date}
                    />
                </div>
                <div>
                    <label className="block font-bold">Status</label>
                    <select
                        className="border rounded w-full p-2"
                        value={updatedProject.status}
                        onChange={(e) =>
                            setUpdatedProject({
                                ...updatedProject,
                                status: Number(e.target.value),
                            })
                        }
                    >
                        {statues &&
                            statues.map((item) => (
                                <option key={item?.id} value={item?.id}>
                                    {item?.name}
                                </option>
                            ))}
                    </select>
                </div>
            </div>
            <div className="mt-6 flex space-x-4">
                <button
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                    onClick={handleUpdate}
                    disabled={isUpdating}
                >
                    {isUpdating ? "Updating..." : "Update"}
                </button>
                <button
                    className="bg-red-500 text-white px-4 py-2 rounded"
                    onClick={handleDelete}
                >
                    Delete
                </button>
            </div>
        </div>
    );
}
