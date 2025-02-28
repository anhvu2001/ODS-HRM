import React, { useState, useEffect } from "react";
import { getStatusColor } from "@/utils/statusColor";
import { getPriorityColor } from "@/utils/priorityColor";
import { remainingDay } from "@/utils/calculateDay";

import TaskDetailModal from "../Task/TaskDetailModal";

export default function ProjectsList({
    projects,
    onProjectUpdated,
    auth,
    edit,
    statusOptions,
}) {
    const [selectedTask, setselectedTask] = useState(false);
    const [priorityOptions, setPriorityOptions] = useState([]);
    const fetchPriority = async () => {
        try {
            const { data } = await axios.get(route("Get_priority_option"));
            setPriorityOptions(data);
        } catch (error) {
            console.error("Error fetching priorities:", error);
        }
    };
    // get participant
    useEffect(() => {
        fetchPriority();
    }, []);
    return (
        <div className="relative my-10">
            {/* Danh sách dự án */}
            <div>
                <div className="w-full flex gap-4 px-4">
                    <div className="w-2/6">Tên Công Việc</div>
                    <div className="w-1/6">Độ ưu tiên</div>
                    <div className="w-1/6">Ngày kết thúc</div>
                    <div className="w-1/6">Ngày còn lại</div>
                    <div className="w-1/6 text-center">Trạng thái</div>
                </div>
                {projects &&
                    projects.map((project) => (
                        <>
                            <div
                                key={project.id}
                                className="w-full flex my-4 "
                                // Chọn dự án
                            >
                                <div className="w-full border-y-2 h-12 flex items-center">
                                    <div>
                                        <span>Dự án: </span> {project[0]?.name}
                                    </div>
                                </div>
                            </div>
                            <div className="w-full flex flex-col gap-4 px-4">
                                {project.map((item) => (
                                    <>
                                        <div
                                            className="flex w-full gap-4 cursor-pointer duration-150 hover:bg-slate-200  rounded"
                                            onClick={() => {
                                                setselectedTask(item.task.id);
                                            }}
                                        >
                                            <div className="w-2/6 truncate">
                                                {item.task.name}
                                            </div>

                                            <div className="w-1/6">
                                                <p
                                                    className={`font-bold w-3/6 text-sm p-2 rounded-2xl text-center ${getPriorityColor(
                                                        item.task.priority_id
                                                    )}`}
                                                >
                                                    {
                                                        priorityOptions.find(
                                                            (p) =>
                                                                p.id ===
                                                                item.task
                                                                    .priority_id
                                                        )?.name
                                                    }
                                                </p>
                                            </div>

                                            <div className="w-1/6 text-red-600">
                                                {item.task.due_date}
                                            </div>
                                            <div className="w-1/6">
                                                {remainingDay(
                                                    item.task.due_date
                                                )}
                                                <span> ngày</span>
                                            </div>
                                            <div className="w-1/6">
                                                <p
                                                    className={`font-bold text-sm p-2 rounded-2xl w-full text-center ${getStatusColor(
                                                        item.task.status_id
                                                    )}`}
                                                >
                                                    {
                                                        statusOptions.find(
                                                            (p) =>
                                                                p.id ===
                                                                item.task
                                                                    .status_id
                                                        )?.name
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                        {selectedTask === item.task.id && (
                                            <>
                                                <div
                                                    className="fixed inset-0 bg-black bg-opacity-50 z-10"
                                                    onClick={() => {
                                                        setselectedTask(null);
                                                    }}
                                                ></div>
                                                <TaskDetailModal
                                                    task={item.task}
                                                    handleModalClose={() =>
                                                        setselectedTask(null)
                                                    }
                                                    onTaskCreate={
                                                        onProjectUpdated
                                                    }
                                                    priorityOptions={
                                                        priorityOptions
                                                    }
                                                    edit={edit}
                                                    auth={auth}
                                                />
                                            </>
                                        )}
                                    </>
                                ))}
                            </div>
                            {/* add tasks list here create task button maybe add a small drop down button */}
                            {/* check if the user is in the project  */}
                            {/* Check if user is in the project's participants */}
                        </>
                    ))}
            </div>
        </div>
    );
}
