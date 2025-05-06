import React, { useState, useEffect } from "react";
import { getStatusColor } from "@/utils/statusColor.js";
import { remainingDay } from "@/utils/calculateDay";

import TaskDetailModal from "../Task/TaskDetailModal";
import axios from "axios";

export default function MyTaskListSection({
    tasks,
    updateTaskList,
    auth,
    edit,
}) {
    const [selectedTask, setselectedTask] = useState(false);
    return (
        <>
            <div className="w-full flex flex-col gap-4 bg-amber-100">
                {tasks.map((item) => (
                    <div key={item.id}>
                        <div
                            className="flex w-full gap-4 px-4 cursor-pointer rounded duration-150 hover:bg-amber-200 h-[60px] py-1"
                            onClick={() => {
                                setselectedTask(item.id);
                            }}
                        >
                            <div className="content-center w-[50px] flex-shrink-0">
                                {item.id}
                            </div>
                            <div className="w-3/12 line-clamp-2 content-center">
                                {item.name}
                            </div>
                            <div className="w-2/12 line-clamp-2 content-center">
                                {item?.project?.name}
                            </div>

                            <div className="w-1/12  content-center text-center">
                                {item?.category?.name}
                            </div>

                            <div className="w-2/12 text-center text-red-600  content-center">
                                {item.due_date}
                            </div>
                            <div
                                className={`w-2/12 text-center content-center ${
                                    item.due_date == 0
                                        ? "text-red-600"
                                        : "text-black"
                                }`}
                            >
                                {remainingDay(item.due_date)}
                                <span> ngày</span>
                            </div>
                            <div className="w-2/12 h-12 content-center">
                                <p
                                    className={`font-bold w-full text-base p-2 rounded-2xl text-center 
                                            ${getStatusColor(item.status)}
                                        `}
                                >
                                    {item.status_details?.name}
                                </p>
                            </div>
                        </div>

                        {selectedTask === item.id && (
                            <>
                                <div
                                    className="fixed inset-0 bg-black bg-opacity-50 z-10"
                                    onClick={() => {
                                        setselectedTask(null);
                                    }}
                                ></div>
                                <TaskDetailModal
                                    task={item}
                                    handleModalClose={() =>
                                        setselectedTask(null)
                                    }
                                    onTaskCreate={updateTaskList}
                                    edit={edit}
                                    auth={auth}
                                />
                            </>
                        )}
                    </div>
                ))}
            </div>
        </>
    );
}
