import React, { useState, useEffect } from "react";
import MyTaskListSection from "./MyTaskListSection";

export default function UniqueStatusTask({ auth, edit }) {
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const [tasks, setTasks] = useState([]);
    const fetchTaskAfterChange = async () => {
        try {
            const { data } = await axios.get(
                route("get_task_after_change", { page })
            );
            setTasks(data.tasks);
            setHasMore(data.hasMore);
        } catch (error) {
            console.error("Error fetching projects:", error);
        }
    };
    const fetchProjectsWithStatus = async () => {
        try {
            const { data } = await axios.get(
                route("User_joined_tasks", { page })
            );
            setTasks((prev) => [...prev, ...data.tasks]);

            setHasMore(data.hasMore);
            setPage(page + 1);
        } catch (error) {
            console.error("Error fetching projects:", error);
        }
    };
    useEffect(() => {
        fetchProjectsWithStatus();
    }, []);
    return (
        <>
            <div className="relative my-10">
                {/* Danh sách dự án */}
                <div className="flex flex-col gap-2">
                    <div className="w-full flex gap-4 px-4 border h-12 bg-slate-200">
                        <div className="font-bold content-center  w-[50px] flex-shrink-0">
                            ID
                        </div>
                        <div className="w-2/12 font-bold content-center">
                            Tên Công Việc
                        </div>
                        <div className="w-2/12 font-bold content-center">
                            Phòng ban thực hiện
                        </div>
                        <div className="w-2/12 font-bold content-center">
                            Tên Dự Án
                        </div>
                        <div className="w-1/12 content-center text-center font-bold">
                            Phân loại
                        </div>
                        <div className="w-1/12 content-center text-center font-bold">
                            Deadline
                        </div>
                        <div className="w-2/12 content-center text-center font-bold">
                            Ngày còn lại
                        </div>
                        <div className="w-2/12 content-center text-center font-bold">
                            Trạng thái
                        </div>
                    </div>
                    <MyTaskListSection
                        tasks={tasks}
                        loadMore={fetchProjectsWithStatus}
                        hasMore
                        auth={auth}
                        edit={true}
                        updateTaskList={fetchTaskAfterChange}
                    ></MyTaskListSection>

                    {hasMore && (
                        <button
                            onClick={() => {
                                fetchProjectsWithStatus();
                            }}
                            className="bg-green-500 text-white w-2/6 rounded-xl self-center p-2 mt-3"
                        >
                            Load More
                        </button>
                    )}
                </div>
            </div>
        </>
    );
}
