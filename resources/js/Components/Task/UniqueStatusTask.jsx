import React, { useState, useEffect } from "react";
import MyTaskListSection from "./MyTaskListSection";

export default function UniqueStatusTask({
    projectsStatus,
    auth,
    edit,
    statusOptions,
}) {
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const [projects, setProjects] = useState([]);
    const [priorityOptions, setPriorityOptions] = useState([]);
    const fetchPriority = async () => {
        try {
            const { data } = await axios.get(route("Get_priority_option"));
            setPriorityOptions(data);
        } catch (error) {
            console.error("Error fetching priorities:", error);
        }
    };
    // get participant
    useEffect(() => {
        fetchPriority();
    }, []);
    const fetchProjectsWithStatus = async () => {
        try {
            const { data } = await axios.get(
                route("User_joined_tasks", { projectsStatus, page })
            );
            setHasMore(data.hasMore);
            setPage(page + 1);
            setProjects((prev) => [...prev, ...data.groupedTasks]);
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
                        <div className="w-3/12 content-center font-bold">
                            Tên Công Việc
                        </div>
                        <div className="w-1/12 content-center font-bold">
                            Độ ưu tiên
                        </div>
                        <div className="w-2/12 content-center text-center font-bold">
                            Ngày kết thúc
                        </div>
                        <div className="w-2/12 content-center text-center font-bold">
                            Ngày còn lại
                        </div>
                        <div className="w-2/12 content-center text-center font-bold">
                            Trạng thái
                        </div>
                        <div className="w-2/12 content-center text-center font-bold">
                            Trạng thái QC
                        </div>
                    </div>
                    {projects &&
                        projects.map((project) => (
                            <MyTaskListSection
                                project={project}
                                projectsStatus={projectsStatus}
                                setProjects={setProjects}
                                priorityOptions={priorityOptions}
                                statusOptions={statusOptions}
                                onProjectUpdated={fetchProjectsWithStatus}
                                edit={edit}
                                auth={auth}
                            />
                        ))}
                    {hasMore && (
                        <button
                            onClick={() => {
                                fetchProjectsWithStatus();
                            }}
                            className="bg-green-400 text-white w-2/6 rounded-xl self-center p-2 mt-3"
                        >
                            Load More Projects
                        </button>
                    )}
                </div>
            </div>
        </>
    );
}
