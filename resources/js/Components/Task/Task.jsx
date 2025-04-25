import React, { useState } from "react";

import TaskDetailModal from "./TaskDetailModal";
import { getStatusColor } from "@/utils/statusColor";
export default function Task({
    task,
    projectParticipants,
    onTaskCreate,
    edit,
    auth,
}) {
    const [taskDetailModal, setTaskDetailModal] = useState(false);
    const showTaskDetailModal = () => {
        if (taskDetailModal) {
            setTaskDetailModal(false);
        } else {
            setTaskDetailModal(task.id);
        }
    };
    return (
        <div key={task.id}>
            <div
                className="flex cursor-pointer border-b py-1 gap-4"
                onClick={showTaskDetailModal}
            >
                <div className={`w-4/12 line-clamp-2 items-center px-3`}>
                    {task.name}
                </div>

                <div className="w-2/12 h-12 flex items-center">
                    {task?.department.department_name}
                </div>

                <div className="w-2/12 h-12 px-2 flex justify-center  items-center">
                    {task.category.name}
                </div>
                <div className="w-2/12 h-12 px-2 flex justify-center  items-center">
                    {task.due_date}
                </div>
                <div className="w-2/12 h-12 px-2 flex items-center">
                    <p
                        className={`font-bold text-sm p-2 rounded-2xl w-full text-center ${getStatusColor(
                            task.status_details?.id
                        )}`}
                    >
                        {task.status_details?.name}
                    </p>
                </div>
            </div>
            {taskDetailModal === task.id && (
                <>
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 z-10"
                        onClick={() => {
                            setTaskDetailModal(null);
                        }}
                    ></div>
                    <TaskDetailModal
                        task={task}
                        handleModalClose={() => setTaskDetailModal(false)}
                        projectParticipants={projectParticipants}
                        onTaskCreate={onTaskCreate}
                        edit={edit}
                        auth={auth}
                    />
                </>
            )}
        </div>
    );
}
