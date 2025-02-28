import React, { useState, useEffect } from "react";

import { getStatusColor } from "@/utils/statusColor";
import TaskDetailModal from "./TaskDetailModal";

export default function Task({
    task,
    projectParticipants,
    onTaskCreate,
    priorityOptions,
    edit,
    auth,
}) {
    const [taskDetailModal, setTaskDetailModal] = useState(false);
    const showTaskDetailModal = () => {
        setTaskDetailModal(taskDetailModal ? false : true);
    };
    const depthPadding = (depth) => `ml-${3 * (depth + 1)}`;
    return (
        <>
            <div
                className="flex gap-4 my-4 cursor-pointer"
                onClick={showTaskDetailModal}
            >
                <div
                    className={`w-3/12 border-l-2 h-12 px-2 flex items-center ${depthPadding(
                        task.depth
                    )}`}
                >
                    {task.name}
                </div>
                <div className="w-2/12 h-12 px-4 flex items-center">
                    {task.task_user.user.name}
                </div>
                <div className="w-1/12 h-12 px-2 flex items-center">
                    {
                        priorityOptions.find(
                            (option) => option.id === task.priority_id
                        )?.name
                    }
                </div>
                <div className="w-2/12 h-12 px-2 flex items-center">
                    {task.start_date}
                </div>
                <div className="w-2/12 h-12 px-2 flex items-center">
                    {task.due_date}
                </div>
                <div className="w-2/12 h-12 px-2 flex items-center">
                    <p
                        className={`font-bold text-sm p-2 rounded-2xl w-full text-center ${getStatusColor(
                            task.status.id
                        )}`}
                    >
                        {task.status.name}
                    </p>
                </div>
            </div>
            {taskDetailModal && (
                <>
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 z-10"
                        onClick={() => {
                            setTaskDetailModal(null);
                            // setSelectedTask();
                        }}
                    ></div>
                    <TaskDetailModal
                        task={task}
                        handleModalClose={() => setTaskDetailModal(false)}
                        projectParticipants={projectParticipants}
                        onTaskCreate={onTaskCreate}
                        priorityOptions={priorityOptions}
                        edit={edit}
                        auth={auth}
                    />
                </>
            )}
        </>
    );
}
