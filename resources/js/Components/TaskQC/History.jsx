import React from "react";
import { useState, useEffect } from "react";
import { remainingDay } from "@/utils/calculateDay";
import TaskDetailModal from "../Task/TaskDetailModal";
import { getStatusColor } from "@/utils/statusColor";
export default function History({ auth }) {
    const [hasMore, setHasMore] = useState(false);
    const [page, setPage] = useState(0);
    const [tasks, setTasks] = useState([]);
    const [selectedTask, setSelectedTask] = useState(null);
    const fetchQCHistory = async () => {
        try {
            const response = await axios.get(route("get_qc_history", { page }));
            setTasks((prev) => [...prev, ...response.data.qc_task_history]);
            setPage(page + 1);
            setHasMore(response.data.has_more);
        } catch (error) {
            console.error("Error fetching projects:", error);
        }
    };

    useEffect(() => {
        fetchQCHistory();
    }, []);
    // console.log(tasks);

    return (
        <div className="flex flex-col gap-4">
            <div className="w-full flex gap-4 px-4 border h-12 bg-slate-200">
                <div className="font-bold content-center w-[50px] flex-shrink-0">
                    ID
                </div>
                <div className="w-2/12 font-bold content-center">
                    Tên Công Việc
                </div>
                <div className="w-2/12 font-bold content-center">
                    Phòng ban thực hiện
                </div>
                <div className="w-2/12 font-bold content-center">Tên Dự Án</div>
                <div className="w-1/12 text-center font-bold content-center">
                    Phân loại
                </div>
                <div className="w-1/12 text-center font-bold content-center">
                    Deadline
                </div>
                <div className="w-2/12 text-center font-bold content-center">
                    Ngày còn lại
                </div>

                <div className="w-2/12 text-center font-bold content-center">
                    Trạng thái
                </div>
            </div>
            <div>
                {tasks.map((item) => (
                    <div key={item.id}>
                        <div
                            className="flex w-full gap-4 px-4 cursor-pointer rounded duration-150 hover:bg-amber-200 h-[60px] py-1"
                            onClick={() => {
                                setSelectedTask(
                                    selectedTask == item.id ? null : item.id
                                );
                            }}
                        >
                            <div className="content-center w-[50px] flex-shrink-0">
                                {item.id}
                            </div>
                            <div className="w-2/12 line-clamp-2 content-center">
                                {item.name}
                            </div>
                            <div className="w-2/12 line-clamp-2 content-center">
                                {item.department.department_name}
                            </div>
                            <div className="w-2/12 line-clamp-2 content-center">
                                {item?.project?.name}
                            </div>
                            <div className="w-1/12  content-center text-center">
                                {item.category.name}
                            </div>
                            <div className="w-1/12 text-center text-red-600  content-center">
                                {item.due_date}
                            </div>
                            <div
                                className={`w-2/12 text-center content-center ${
                                    item.due_date == 0
                                        ? "text-red-600"
                                        : "text-black"
                                }`}
                            >
                                {remainingDay(item.due_date)} ngày
                            </div>
                            <div className="w-2/12 h-12 content-center">
                                <p
                                    className={`font-bold w-full text-sm p-2 rounded-2xl text-center self-center ${getStatusColor(
                                        item.status
                                    )}`}
                                >
                                    {item.status_details.name}
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
