import React, { useState, useEffect } from "react";
import MyTaskListSection from "../Task/MyTaskListSection";

export default function AccountTask({ auth, edit, statusOptions }) {
    // const [projects, setProjects] = useState([]);
    // const [priorityOptions, setPriorityOptions] = useState([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const [tasks, setTasks] = useState([]);
    const fetchTasks = async () => {
        try {
            const { data } = await axios.get(route("get_account_task"));
            setTasks(data.tasks);
        } catch (error) {
            console.error();
        }
    };
    useEffect(() => {
        fetchTasks();
    }, []);
    // const fetchPriority = async () => {
    //     try {
    //         const { data } = await axios.get(route("Get_priority_option"));
    //         setPriorityOptions(data);
    //     } catch (error) {
    //         console.error("Error fetching priorities:", error);
    //     }
    // };
    // lấy task phân theo project
    // const fetchProjects = async () => {
    //     // add page to fetch project
    //     try {
    //         const { data } = await axios.get(
    //             route("User_joined_tasks", { page })
    //         );
    //         console.log(data);
    //         setProjects((prev) => [...prev, ...data.groupedTasks]);
    //         setPage(page + 1);
    //         setHasMore(data.hasMore);
    //     } catch (error) {
    //         console.error("Error fetching projects:", error);
    //     }
    // };

    // useEffect(() => {
    //     fetchProjects();
    // }, []);
    // get participant
    // useEffect(() => {
    //     fetchPriority();
    // }, []);
    return (
        <>
            <div className="relative my-10">
                <div className="flex flex-col gap-2">
                    <div className="font-bold text-lg text-black-600">
                        Công việc đã hoàn thành:
                    </div>
                    <div className="w-full flex gap-4 px-4 border h-12 bg-slate-200">
                        <div className="font-bold content-center  w-[50px] flex-shrink-0">
                            ID
                        </div>
                        <div className="w-3/12 font-bold content-center">
                            Tên Công Việc
                        </div>
                        <div className="w-2/12 font-bold content-center">
                            Tên Dự Án
                        </div>
                        <div className="w-2/12 text-center font-bold content-center">
                            Phân loại
                        </div>
                        <div className="w-2/12 text-center font-bold content-center">
                            Ngày kết thúc
                        </div>
                        <div className="w-2/12 text-center font-bold content-center">
                            Ngày còn lại
                        </div>

                        <div className="w-2/12 text-center font-bold content-center">
                            Trạng thái QC
                        </div>
                    </div>
                    <MyTaskListSection
                        tasks={tasks}
                        updateTaskList={fetchTasks}
                        auth={auth}
                        edit={true}
                    ></MyTaskListSection>
                    {/* {projects.length > 0 &&
                        projects.map((project) => (
                            <MyTaskListSection
                                project={project}
                                setProjects={setProjects}
                                priorityOptions={priorityOptions}
                                statusOptions={statusOptions}
                                onProjectUpdated={fetchProjects}
                                edit={edit}
                                auth={auth}
                            />
                        ))}
                    {hasMore && (
                        <button
                            onClick={() => {
                                fetchProjects();
                            }}
                            className="bg-green-400 text-white w-2/6 rounded-xl self-center p-2 mt-3"
                        >
                            Load More Projects
                        </button>
                    )} */}
                </div>
            </div>
        </>
    );
}
