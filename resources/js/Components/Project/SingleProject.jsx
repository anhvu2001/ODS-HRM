import React, { useState, useEffect } from "react";
import CreateTaskModal from "../Task/CreateTaskModal";
import { getStatusColor } from "@/utils/statusColor";
import TaskListSection from "../Task/TaskListSection";

export default function ProjectsList({
    project,
    auth,
    edit,
    setSelectedProject,
    onProjectUpdated,
    // status,
}) {
    const [showTasks, setShowTasks] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedModal, setSelectedModal] = useState(null);
    const handleCreateTask = (id) => {
        setShowModal(true);
        setSelectedModal(id);
    };

    const [viewMore, setViewMore] = useState(false);
    const handleViewMore = () => {
        setViewMore(viewMore ? false : true);
    };
    const handleTaskCreate = () => {
        console.log("handle task create");
        onProjectUpdated();
        setShowTasks(true);
        setViewMore(true);
    };
    const [participants, setParticipants] = useState([]);
    // get participant
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

    useEffect(() => {
        fetchUsers();
    }, []);
    return (
        <div className="border rounded-xl" key={project.id}>
            <div
                className={`flex cursor-pointer bg-amber-100 rounded-xl ${
                    showTasks ? `rounded-b-none` : ``
                }`}
                onClick={() => setSelectedProject(project)} // Chọn dự án
            >
                <div className="w-3/6 h-12 flex items-center px-1 rounded-xl relative">
                    <div className="flex justify-between w-full overflow-hidden h-full items-center">
                        <div
                            className="flex w-3/4 h-full items-center border-r-2"
                            onClick={(event) => {
                                event.stopPropagation();
                                setShowTasks(showTasks ? false : true);
                            }}
                        >
                            <div className="h-full flex">
                                <svg
                                    className={`self-center h-7 w-7 duration-300 ${
                                        showTasks ? `-rotate-90` : ``
                                    }`}
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M11.1808 15.8297L6.54199 9.20285C5.89247 8.27496 6.55629 7 7.68892 7L16.3111 7C17.4437 7 18.1075 8.27496 17.458 9.20285L12.8192 15.8297C12.4211 16.3984 11.5789 16.3984 11.1808 15.8297Z"
                                        fill="#33363F"
                                    />
                                </svg>
                            </div>
                            <div className="w-full line-clamp-1">
                                {project?.name}
                            </div>
                        </div>

                        <div
                            onClick={(event) => {
                                event.stopPropagation();
                                handleCreateTask(project.id);
                            }}
                            className="cursor-pointer text-blue-600 pr-2"
                        >
                            + Thêm công việc
                        </div>
                    </div>
                </div>

                <div className="w-1/6 border-2 border-y-0 h-12 flex items-center px-2 text-base text-[#c92f54]">
                    {project?.end_date}
                </div>
                <div className="w-1/6 border-y-0 h-12 flex items-center px-2 text-base rounded-xl">
                    <p
                        className={`font-bold text-sm p-2 rounded-2xl w-full text-center ${getStatusColor(
                            project?.status?.id
                        )}`}
                    >
                        {project?.status?.name}
                    </p>
                </div>
                <div
                    className="w-1/6 border-2 border-y-0 h-12 flex underline items-center justify-center px-2 text-base text-center text-blue-700"
                    onClick={() => setSelectedProject(project)}
                >
                    Xem Chi tiết
                </div>
            </div>
            {/* Check if user is in the project's participants */}
            <>
                {edit && auth.user.role && (
                    <>
                        {selectedModal === project.id && (
                            <CreateTaskModal
                                handleCreateTaskClose={() =>
                                    setShowModal(false)
                                }
                                departmentOptions={project.departments}
                                showModal={showModal}
                                participants={participants}
                                handleModalClose={() => setShowModal(false)}
                                project={project.id}
                                onTaskCreate={handleTaskCreate}
                                deadline={project.end_date}
                            />
                        )}
                    </>
                )}

                {/* task list here */}
                {edit && (
                    <div
                        className={`transition-all duration-500 overflow-hidden ${
                            showTasks
                                ? `opacity-100 max-h-[2000px]`
                                : `opacity-0 max-h-0`
                        }`}
                    >
                        <TaskListSection
                            tasks={project.tasks}
                            projectParticipants={participants}
                            onTaskCreate={onProjectUpdated}
                            edit={edit}
                            auth={auth}
                            viewMore={viewMore}
                            handleViewMore={handleViewMore}
                            handleCreateTask={handleCreateTask}
                        />
                    </div>
                )}
            </>
        </div>
    );
}
