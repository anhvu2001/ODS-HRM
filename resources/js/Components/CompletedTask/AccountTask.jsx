import React, { useState, useEffect } from "react";
import MyTaskListSection from "../Task/MyTaskListSection";

export default function AccountTask({ auth }) {
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
                            Trạng thái
                        </div>
                    </div>
                    <MyTaskListSection
                        tasks={tasks}
                        updateTaskList={fetchTasks}
                        auth={auth}
                        edit={true}
                    ></MyTaskListSection>
                </div>
            </div>
        </>
    );
}
