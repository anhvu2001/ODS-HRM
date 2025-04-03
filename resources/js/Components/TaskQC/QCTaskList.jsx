import React from "react";
import { useState, useEffect } from "react";
import { remainingDay } from "@/utils/calculateDay";
import TaskDetailModal from "../Task/TaskDetailModal";
import { getPriorityColor } from "@/utils/priorityColor";
export default function QCTaskList({ auth }) {
    const [projects, setProjects] = useState([]);
    const [selectedTask, setSelectedTask] = useState(null);
    const fetchStatuses = async () => {
        try {
            const { data } = await axios.get(route("Get_All_Status"));
        } catch (error) {
            console.error("Error fetching statuses:", error);
        }
    };
    useEffect(() => {
        fetchStatuses();
    }, []);
    const fetchQCTasks = async () => {
        try {
            const response = await axios.get(route("get_task_need_qc"));
            setProjects(response.data);
        } catch (error) {
            console.error("Error fetching projects:", error);
        }
    };
    useEffect(() => {
        fetchQCTasks();
    }, []);
    return (
        <>
            <div>Công việc cần kiểm tra:</div>

            <div className="flex mt-4 border h-12 items-center bg-slate-200">
                <div className="w-2/6 font-bold px-2 content-center">
                    Tên công việc
                </div>
                <div className="w-1/6 font-bold content-center">
                    Người thực hiện
                </div>
                <div className="w-1/6 font-bold content-center">Độ ưu tiên</div>
                <div className="w-1/6 font-bold content-center">
                    Ngày kết thúc
                </div>
                <div className="w-1/6 font-bold content-center">
                    Ngày còn lại
                </div>
            </div>
            {projects &&
                projects.map((project) => (
                    <div key={project[0].project.id}>
                        <div className="border-t-2 border-amber-50  font-semibold p-2 mt-4 bg-amber-100 rounded-l">
                            Dự án: {project[0].project.name}
                        </div>
                        {project.map((task) => (
                            <div key={task.id}>
                                <div
                                    className="flex gap-2 cursor-pointer pt-3 content-center "
                                    onClick={() => {
                                        setSelectedTask(
                                            selectedTask == task.id
                                                ? null
                                                : task.id
                                        );
                                    }}
                                >
                                    <div className="w-2/6 pl-6 h-12 content-center ">
                                        {task.name}
                                    </div>
                                    <div className="w-1/6 h-12 content-center">
                                        {task.task_user.user.name}
                                    </div>
                                    <div className="w-1/6 h-12 content-center">
                                        <p
                                            className={`font-bold w-3/6 text-sm p-2 rounded-2xl text-center ${getPriorityColor(
                                                task.priority_id
                                            )}`}
                                        >
                                            {task.priority.name}
                                        </p>
                                    </div>
                                    <div className="w-1/6 text-red-600 h-12 content-center">
                                        {task.due_date}
                                    </div>
                                    <div className="w-1/6 h-12 content-center">
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
                                            edit={false}
                                            task={task}
                                            qcMode={true}
                                        />
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                ))}
        </>
    );
}
