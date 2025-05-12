import React, { useState, useEffect } from "react";
import MyTaskListSection from "./MyTaskListSection";

export default function MyTaskList({ auth, edit }) {
    const [tasks, setTasks] = useState([]);
    const [leaderTasks, setLeaderTasks] = useState([]);
    const fetchLeaderTasks = async () => {
        try {
            const { data } = await axios.get(route("get_leader_main_task"));
            console.log(data);
            setLeaderTasks(data.tasks);
        } catch (error) {
            console.error();
        }
    };
    const fetchTasks = async () => {
        try {
            const { data } = await axios.get(route("get_member_task"));
            setTasks(data.tasks);
            console.log(data);
        } catch (error) {
            console.error();
        }
    };
    const handleTaskChanged = async () => {
        if (auth.user.role) {
            await fetchLeaderTasks();
        }
        await fetchTasks();
    };
    if (auth.user.role) {
        useEffect(() => {
            fetchLeaderTasks();
        }, []);
    }
    useEffect(() => {
        fetchTasks();
    }, []);

    return (
        <>
            <div className="relative my-10">
                {leaderTasks?.length > 0 && (
                    <div className="flex flex-col gap-2">
                        <div className="font-bold text-lg text-black">
                            Công việc cần chọn người làm:
                        </div>
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
                            <div className="w-2/12 font-bold content-center">
                                Tên Dự Án
                            </div>
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
                        <MyTaskListSection
                            tasks={leaderTasks}
                            updateTaskList={handleTaskChanged}
                            auth={auth}
                            edit={edit}
                        ></MyTaskListSection>
                    </div>
                )}

                <div className="flex flex-col gap-2 my-4">
                    <div className="font-bold text-lg text-black-600">
                        Công việc cần làm:
                    </div>
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
                        <div className="w-1/12 text-center font-bold content-center">
                            Phân Loại
                        </div>
                        <div className="w-1/12 text-center font-bold content-center">
                            Deadline
                        </div>
                        <div className="w-2/12 text-center font-bold content-center">
                            Ngày Còn Lại
                        </div>

                        <div className="w-2/12 text-center font-bold content-center">
                            Trạng Thái
                        </div>
                    </div>
                    <MyTaskListSection
                        tasks={tasks}
                        updateTaskList={handleTaskChanged}
                        auth={auth}
                        edit={edit}
                    ></MyTaskListSection>
                </div>
            </div>
        </>
    );
}
