import React, { useState } from "react";

import { getStatusColor } from "@/utils/statusColor";
import TaskDetailModal from "./TaskDetailModal";
import { getPriorityColor } from "@/utils/priorityColor";

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
        if (taskDetailModal) {
            setTaskDetailModal(false);
        } else {
            setTaskDetailModal(task.id);
        }
    };
    const depthPadding = (depth) => `pl-${3 * (depth + 1)}`;
    return (
        <div key={task.id}>
            <div
                className="flex cursor-pointer border-b py-1 gap-4"
                onClick={showTaskDetailModal}
            >
                <div
                    className={`w-3/12 line-clamp-2 items-center ${depthPadding(
                        task.depth
                    )}`}
                >
                    {task.name}
                </div>
                <div className="w-2/12 h-12 flex items-center">
                    {task.task_user.user.name}
                </div>
                <div className="w-1/12 h-12 px-2 flex items-center">
                    <p
                        className={`font-bold w-full text-sm p-2 rounded-2xl  text-center ${getPriorityColor(
                            task.priority_id
                        )}`}
                    >
                        {
                            priorityOptions.find(
                                (option) => option.id === task.priority_id
                            )?.name
                        }
                    </p>
                </div>
                <div className="w-2/12 h-12 px-2 flex justify-center  items-center">
                    {task.start_date}
                </div>
                <div className="w-2/12 h-12 px-2 flex justify-center  items-center">
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
                        priorityOptions={priorityOptions}
                        edit={edit}
                        auth={auth}
                    />
                </>
            )}
        </div>
    );
}
