import React, { useState, useEffect } from "react";
import { getStatusColor } from "@/utils/statusColor";
import { getPriorityColor } from "@/utils/priorityColor";
import { remainingDay } from "@/utils/calculateDay";

import TaskDetailModal from "../Task/TaskDetailModal";
import axios from "axios";

export default function MyTaskListSection({
    projectsStatus,
    project,
    priorityOptions,
    statusOptions,
    auth,
    edit,
}) {
    const [loadMoreProjects, setLoadMoreProjects] = useState([]);
    const [page, setPage] = useState(0);
    const [selectedTask, setselectedTask] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const handleLoadMore = async (projectId) => {
        try {
            const { data } = await axios.get(
                route("get_more_task", { id: projectId, page, projectsStatus })
            );
            setLoadMoreProjects((prev) => [...prev, ...data.userTasks]);
            setHasMore(data.hasMore);
            setPage(page + 1);
        } catch (error) {
            console.error(error);
        }
    };
    const fetchUpdatedTask = async (projectId) => {
        try {
            const { data } = await axios.get(
                route("get_update_my_task", {
                    id: projectId,
                    pages: loadMoreProjects.length,
                    projectsStatus,
                })
            );
            setHasMore(data.hasMore);
            setLoadMoreProjects(data.userTasks);
        } catch (error) {
            console.error(error);
        }
    };
    useEffect(() => {
        handleLoadMore(project[0].id);
    }, []);
    const handleUpdateTask = () => {
        fetchUpdatedTask(project[0].id);
    };
    return (
        <>
            {loadMoreProjects.length > 0 && (
                <div className="flex flex-col gap-2" key={project[0].id}>
                    <div
                        className="w-full flex my-4 "
                        // Chọn dự án
                    >
                        <div className="w-full border-y-2 p-2 font-bold h-12 flex items-center bg-amber-100 rounded-l">
                            <div>
                                <span>Dự án: </span> {project[0]?.name}
                            </div>
                        </div>
                    </div>
                    <div className="w-full flex flex-col gap-4 px-4 ">
                        <>
                            {loadMoreProjects.map((item) => (
                                <div key={item.task.id}>
                                    <div
                                        className="flex w-full gap-4 cursor-pointer rounded duration-150 hover:bg-slate-200 "
                                        onClick={() => {
                                            setselectedTask(item.task.id);
                                        }}
                                    >
                                        <div className="w-3/12 truncate h-12 content-center">
                                            {item.task.name}
                                        </div>

                                        <div className="w-1/12 h-12 content-center">
                                            <p
                                                className={`font-bold w-full text-sm p-2 rounded-2xl text-center ${getPriorityColor(
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

                                        <div className="w-2/12 text-center text-red-600 h-12 content-center">
                                            {item.task.due_date}
                                        </div>
                                        <div
                                            className={`w-2/12 text-center h-12 content-center ${
                                                item.task.due_date == 0
                                                    ? "text-red-600"
                                                    : "text-black"
                                            }`}
                                        >
                                            {remainingDay(item.task.due_date)}
                                            <span> ngày</span>
                                        </div>
                                        <div className="w-2/12 h-12 content-center">
                                            <p
                                                className={`font-bold text-sm p-2 rounded-2xl w-full text-center ${getStatusColor(
                                                    item.task.status_id
                                                )}`}
                                            >
                                                {
                                                    statusOptions.find(
                                                        (p) =>
                                                            p.id ===
                                                            item.task.status_id
                                                    )?.name
                                                }
                                            </p>
                                        </div>
                                        <div className="w-2/12 h-12 content-center">
                                            <p
                                                className={`font-bold w-full text-sm p-2 rounded-2xl text-center ${
                                                    item.task.qc_status === 1
                                                        ? "bg-green-300 text-green-800"
                                                        : item.task
                                                              .qc_status === 0
                                                        ? "bg-red-200 text-red-800"
                                                        : "bg-gray-200 text-gray-800"
                                                }`}
                                            >
                                                {item.task.qc_status === 1
                                                    ? "Approved"
                                                    : item.task.qc_status === 0
                                                    ? "Rejected"
                                                    : "Not Completed"}
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
                                                onTaskCreate={handleUpdateTask}
                                                priorityOptions={
                                                    priorityOptions
                                                }
                                                edit={edit}
                                                auth={auth}
                                            />
                                        </>
                                    )}
                                </div>
                            ))}
                        </>
                    </div>
                    {hasMore && (
                        <button
                            onClick={() => {
                                handleLoadMore(project[0].id);
                            }}
                            className="bg-blue-600 text-white w-1/6 rounded-xl self-center p-2"
                        >
                            Load More
                        </button>
                    )}
                </div>
            )}
        </>
    );
}
