import React from "react";
import { useState, useEffect } from "react";
import { remainingDay } from "@/utils/calculateDay";
import TaskDetailModal from "../Task/TaskDetailModal";
export default function History({ auth }) {
    const [hasMore, setHasMore] = useState(false);
    const [page, setPage] = useState(0);
    const [projects, setProjects] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [selectedTask, setSelectedTask] = useState(null);

    const fetchQCHistory = async () => {
        try {
            const response = await axios.get(route("get_qc_history", { page }));
            console.log(response.data.qc_task_history);
            setTasks(response.data.qc_task_history);
            setPage(page + 1);
            setHasMore(response.data.has_more);
        } catch (error) {
            console.error("Error fetching projects:", error);
        }
    };
    useEffect(() => {
        fetchQCHistory();
    }, []);
    return (
        <div className="flex flex-col gap-4">
            <div className="flex mt-4 border h-12 items-center gap-2 bg-slate-200 px-2">
                <div className="w-1/6 font-bold line-clamp-2">
                    Tên công việc
                </div>
                <div className="w-1/6 font-bold line-clamp-2">Phân loại</div>
                <div className="w-1/6 font-bold">Người thực hiện</div>
                <div className="w-1/6 font-bold text-center">Deadline</div>
                <div className="w-1/6 font-bold text-center">Ngày còn lại</div>
                <div className="w-1/6 text-center font-bold">Trạng thái</div>
            </div>
            <div>
                {tasks.map((item) => (
                    <div key={item.id}>
                        <div
                            className="flex gap-2 cursor-pointer bg-amber-100 hover:bg-amber-200 h-[50px] py-1 px-2"
                            onClick={() => {
                                setSelectedTask(
                                    selectedTask == item.id ? null : item.id
                                );
                            }}
                        >
                            <div className="w-1/6 truncate content-center">
                                {item.name}
                            </div>
                            <div className="w-1/6 truncate content-center">
                                {item.category.name}
                            </div>
                            <div className="w-1/6 content-center">
                                {item?.assignee.name}
                            </div>

                            <div className="w-1/6 text-red-600 text-center content-center">
                                {item.due_date}
                            </div>
                            <div className="w-1/6 text-center content-center">
                                {remainingDay(item.due_date)} ngày
                            </div>
                            <div className="w-1/6 flex justify-center content-center">
                                <p
                                    className={`font-bold w-full text-sm p-2 rounded-2xl text-center self-center ${
                                        item.qc_status === 1
                                            ? "bg-green-300 text-green-800"
                                            : item.qc_status === 0
                                            ? "bg-red-200 text-red-800"
                                            : "bg-gray-200 text-gray-800"
                                    }`}
                                >
                                    {item.qc_status === 1
                                        ? "Approved"
                                        : item.qc_status === 0
                                        ? "Rejected"
                                        : "Not Completed"}
                                </p>
                            </div>
                        </div>

                        {selectedTask === item.id && (
                            <>
                                <div
                                    className="fixed inset-0 bg-black bg-opacity-50 z-10"
                                    onClick={() => {
                                        setSelectedTask(null);
                                    }}
                                ></div>
                                <TaskDetailModal
                                    handleModalClose={() =>
                                        setSelectedTask(null)
                                    }
                                    onTaskCreate={fetchQCHistory}
                                    auth={auth}
                                    edit={false}
                                    task={item}
                                    qcMode={true}
                                />
                            </>
                        )}
                    </div>
                ))}
            </div>
            {/* </div>
                ))} */}
            {hasMore && (
                <button
                    onClick={() => {
                        fetchQCHistory();
                    }}
                    className="bg-blue-600 text-white w-1/6 rounded-xl p-2 self-center"
                >
                    Load More
                </button>
            )}
        </div>
    );
}
