import React, { useState, useEffect } from "react";
import ProjectDetailsSidebar from "./ProjectDetailsSidebar";
import { getStatusColor } from "@/utils/statusColor";
import CreateTaskModal from "../Task/CreateTaskModal";
import TaskListSection from "../Task/TaskListSection";

export default function ProjectsList({
    projects,
    onProjectUpdated,
    auth,
    edit,
}) {
    const [selectedProject, setSelectedProject] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedModal, setSelectedModal] = useState(null);
    const handleCreateTask = (id) => {
        setShowModal(true);
        setSelectedModal(id);
    };
    const [priorityOptions, setPriorityOptions] = useState([]);
    const fetchPriority = async () => {
        try {
            const { data } = await axios.get(route("Get_priority_option"));
            setPriorityOptions(data);
        } catch (error) {
            console.error("Error fetching priorities:", error);
        }
    };
    const [participants, setParticipants] = useState([]);
    // get participant
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const { data } = await axios.get(route("Get_all_users"));
                if (data?.success) {
                    setParticipants(data?.data);
                }
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };
        fetchUsers();
        fetchPriority();
    }, []);
    return (
        <div className="relative">
            {/* Danh sách dự án */}
            <div>
                <div className="flex my-4">
                    <div className="w-3/6 border-y-2 h-12 flex items-center">
                        Tên dự án
                    </div>
                    <div className="w-1/6 border-2 h-12 flex items-center px-2 text-base text-green-600">
                        Ngày bắt đầu
                    </div>
                    <div className="w-1/6 border-2 h-12 flex items-center px-2 border-l-0 text-base text-[#c92f54]">
                        Ngày kết thúc
                    </div>
                    <div className="w-1/6 border-y-2 h-12 flex items-center px-2 text-base">
                        Trạng thái
                    </div>
                </div>
                {projects &&
                    projects.map((item) => (
                        <>
                            <div
                                key={item.id}
                                className="flex my-4 cursor-pointer"
                                onClick={() => setSelectedProject(item)} // Chọn dự án
                            >
                                <div className="w-3/6 border-y-2 h-12 flex items-center justify-between">
                                    <div>{item?.name}</div>
                                </div>
                                <div className="w-1/6 border-2 h-12 flex items-center px-2 text-base text-green-600">
                                    {item?.start_date}
                                </div>
                                <div className="w-1/6 border-2 h-12 flex items-center px-2 border-l-0 text-base text-[#c92f54]">
                                    {item?.end_date}
                                </div>
                                <div className="w-1/6 border-y-2 h-12 flex items-center px-2 text-base">
                                    <p
                                        className={`font-bold text-sm p-2 rounded-2xl w-full text-center ${getStatusColor(
                                            item.status_id
                                        )}`}
                                    >
                                        {item?.status_name}
                                    </p>
                                </div>
                            </div>
                            {/* Check if user is in the project's participants */}
                            {item.participants.some((participant) => {
                                return participant.id === auth.user.id;
                            }) && (
                                <>
                                    {edit && auth.user.role && (
                                        <>
                                            <div
                                                onClick={() => {
                                                    handleCreateTask(item.id);
                                                }}
                                                className="cursor-pointer text-blue-600"
                                            >
                                                Add New Task...
                                            </div>
                                            {selectedModal === item.id && (
                                                <CreateTaskModal
                                                    handleCreateTaskClose={() =>
                                                        setShowModal(false)
                                                    }
                                                    showModal={showModal}
                                                    participants={participants}
                                                    handleModalClose={() =>
                                                        setShowModal(false)
                                                    }
                                                    project={item.id}
                                                    onTaskCreate={
                                                        onProjectUpdated
                                                    }
                                                    priorityOptions={
                                                        priorityOptions
                                                    }
                                                />
                                            )}
                                        </>
                                    )}

                                    {/* task list here */}
                                    {edit && (
                                        <TaskListSection
                                            tasks={item.tasks}
                                            projectParticipants={participants}
                                            onTaskCreate={onProjectUpdated}
                                            priorityOptions={priorityOptions}
                                            edit={edit}
                                            auth={auth}
                                        />
                                    )}

                                    {/* item is project */}
                                    {/* taskDetailModal */}
                                </>
                            )}
                        </>
                    ))}
            </div>
            {/* Sidebar hiển thị thông tin chi tiết */}
            {selectedProject && (
                <>
                    {/* Overlay */}
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 z-10"
                        onClick={() => setSelectedProject(null)}
                    ></div>
                    {/* Sidebar */}
                    <ProjectDetailsSidebar
                        project={selectedProject}
                        closeSidebar={() => setSelectedProject(null)}
                        onProjectUpdated={onProjectUpdated} // Truyền callback vào ProjectsList
                    />
                </>
            )}
        </div>
    );
}
