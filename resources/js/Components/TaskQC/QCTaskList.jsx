import React from "react";
import { useState, useEffect } from "react";
import { remainingDay } from "@/utils/calculateDay";
import TaskDetailModal from "../Task/TaskDetailModal";
export default function QCTaskList({ auth }) {
    const [projects, setProjects] = useState([]);
    const [selectedTask, setSelectedTask] = useState(null);
    const fetchQCTasks = async () => {
        try {
            const response = await axios.get(route("get_task_need_qc"));
            setProjects(response.data.qc_task);
        } catch (error) {
            console.error("Error fetching projects:", error);
        }
    };

    useEffect(() => {
        fetchQCTasks();
    }, []);
    return (
        <>
            <div className="font-bold text-lg text-black-600">
                Công việc cần kiểm tra:
            </div>

            <div className="w-full flex gap-4 px-4 border h-12 bg-slate-200">
                <div className="font-bold content-center  w-[50px] flex-shrink-0">
                    ID
                </div>
                <div className="w-3/12 font-bold content-center">
                    Tên công việc
                </div>
                <div className="w-2/12 font-bold content-center">Tên Dự Án</div>
                <div className="w-1/12 text-center font-bold content-center">
                    Phân loại
                </div>
                <div className="w-2/12 font-bold content-center">
                    Người thực hiện
                </div>
                <div className="w-2/12 text-center font-bold content-center">
                    Ngày kết thúc
                </div>
                <div className="w-2/12 text-center font-bold content-center">
                    Ngày còn lại
                </div>
            </div>
            <div className="bg-amber-100">
                {projects &&
                    projects.map((task) => (
                        <>
                            <div
                                className="flex w-full gap-4 px-4 cursor-pointer rounded duration-150 hover:bg-amber-200 h-[60px] py-1"
                                onClick={() => {
                                    setSelectedTask(
                                        selectedTask == task.id ? null : task.id
                                    );
                                }}
                            >
                                <div className="content-center w-[50px] flex-shrink-0">
                                    {task.id}
                                </div>
                                <div className="w-3/12 line-clamp-2 content-center">
                                    {task.name}
                                </div>
                                <div className="w-2/12 line-clamp-2 content-center">
                                    {task?.project?.name}
                                </div>
                                <div className="w-1/12  content-center text-center">
                                    {task.category.name}
                                </div>
                                <div className="w-2/12 content-center">
                                    {task.assignee.name}
                                </div>
                                <div className="w-2/12 content-center text-red-600 text-center">
                                    {task.due_date}
                                </div>
                                <div className="w-2/12 content-center text-center">
                                    {remainingDay(task.due_date)} ngày
                                </div>
                            </div>
                            {selectedTask === task.id && (
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
                                        onTaskCreate={fetchQCTasks}
                                        auth={auth}
                                        edit={true}
                                        task={task}
                                        qcMode={true}
                                    />
                                </>
                            )}
                        </>
                    ))}
            </div>
        </>
    );
}
