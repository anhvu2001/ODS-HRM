import React from "react";
import { useState, useEffect } from "react";
import { remainingDay } from "@/utils/calculateDay";
import TaskDetailModal from "../Task/TaskDetailModal";
import { getPriorityColor } from "@/utils/priorityColor";
export default function History({ auth }) {
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(0);
    const [projects, setProjects] = useState([]);
    const [selectedTask, setSelectedTask] = useState(null);

    const fetchQCHistory = async () => {
        try {
            const response = await axios.get(route("get_qc_history", { page }));
            setPage(page + 1);
            // kiểm tra và update danh sách mới khi bấm load more
            setProjects((prev) => {
                const updatedProject = prev;
                response.data.projects.forEach((newProject) => {
                    // tìm project đang có cho task vừa lấy
                    const existingProjectIndex = prev.findIndex(
                        (p) => p[0].project_id === newProject[0].project_id
                    );
                    // thêm task vừa lấy đúng vào project của nó
                    if (existingProjectIndex !== -1) {
                        updatedProject[existingProjectIndex] = [
                            ...updatedProject[existingProjectIndex],
                            ...newProject,
                        ];
                    } else {
                        // nếu không thuộc project nào thì thêm project mới
                        updatedProject.push(newProject);
                    }
                });
                return updatedProject;
            });
            setHasMore(response.data.hasMore);
        } catch (error) {
            console.error("Error fetching projects:", error);
        }
    };
    useEffect(() => {
        fetchQCHistory();
    }, []);

    return (
        <div className="flex flex-col gap-4">
            <div className="flex mt-4 border h-12 items-center gap-2 bg-slate-200">
                <div className="w-1/6 font-bold px-2">Tên công việc</div>
                <div className="w-1/6 font-bold">Người thực hiện</div>
                <div className="w-1/6 font-bold text-center">Độ ưu tiên</div>
                <div className="w-1/6 font-bold text-center">Ngày kết thúc</div>
                <div className="w-1/6 font-bold text-center">Ngày còn lại</div>
                <div className="w-1/6 text-center font-bold">Trạng thái QC</div>
            </div>
            {projects &&
                projects.map((project, index) => (
                    <div key={index}>
                        <div className="border-t-2 border-amber-50  font-semibold p-2 mt-4 bg-amber-100 rounded-l">
                            {project[0].project.name}
                        </div>
                        <div>
                            {project.map((item) => (
                                <div key={item.id}>
                                    <div
                                        className="flex gap-2 cursor-pointer"
                                        onClick={() => {
                                            setSelectedTask(
                                                selectedTask == item.id
                                                    ? null
                                                    : item.id
                                            );
                                        }}
                                    >
                                        <div className="w-1/6 h-12 pl-6 truncate content-center">
                                            {item.name}
                                        </div>
                                        <div className="w-1/6 h-12 content-center">
                                            {item.task_user?.user.name}
                                        </div>
                                        <div className="w-1/6 h-12 content-center flex justify-center ">
                                            <p
                                                className={`font-bold w-3/6 text-sm p-2 rounded-2xl self-center text-center ${getPriorityColor(
                                                    item.priority_id
                                                )}`}
                                            >
                                                {item.priority.name}
                                            </p>
                                        </div>
                                        <div className="w-1/6 h-12 text-red-600 text-center content-center">
                                            {item.due_date}
                                        </div>
                                        <div className="w-1/6 h-12 text-center content-center">
                                            {remainingDay(item.due_date)} ngày
                                        </div>
                                        <div className="w-1/6 h-12 flex justify-center content-center">
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
                    </div>
                ))}
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
