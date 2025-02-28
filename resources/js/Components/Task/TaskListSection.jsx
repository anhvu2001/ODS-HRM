import React, { useState, useEffect } from "react";

import Task from "./Task";

export default function TaskListSection({
    tasks,
    projectParticipants,
    onTaskCreate,
    priorityOptions,
    edit,
    auth,
}) {
    const [viewMore, setViewMore] = useState(false);
    const handleViewMore = () => {
        setViewMore(viewMore ? false : true);
    };
    return (
        <div className="">
            {tasks.length > 0 && (
                <div className="flex my-1 cursor-pointer">
                    <div className="w-3/12 border-b-2 h-12 flex items-center">
                        Tên công việc
                    </div>
                    <div className="w-2/12 w- border-2 border-t-0 h-12 px-2 flex items-center">
                        Tên người tham gia
                    </div>
                    <div className="w-1/12 border-2 border-l-0 border-t-0 h-12 px-2 flex items-center">
                        Độ ưu tiên
                    </div>
                    <div className="w-2/12 border-b-2 h-12 px-2 flex items-center">
                        Ngày bắt đầu
                    </div>
                    <div className="w-2/12 border-2 border-t-0 border-r-0 px-2 h-12 flex items-center">
                        Ngày kết thúc
                    </div>
                    <div className="w-2/12 border-2 border-t-0 h-12 flex px-2 items-center">
                        Trạng thái
                    </div>
                </div>
            )}

            {/* render the first element */}
            {tasks.length > 0 && (
                <>
                    <div>
                        <Task
                            key={tasks[0].id}
                            task={tasks[0]}
                            projectParticipants={projectParticipants}
                            onTaskCreate={onTaskCreate}
                            priorityOptions={priorityOptions}
                            edit={edit}
                            auth={auth}
                        />
                    </div>
                    {/* remove the first element ? how */}
                    {/* or render the remaining element */}
                    {tasks.length > 1 && !viewMore && (
                        <div
                            className="cursor-pointer text-blue-600"
                            onClick={handleViewMore}
                        >
                            Xem thêm ...
                        </div>
                    )}
                    {viewMore && (
                        <div className="">
                            {tasks.slice(1).map((task) => (
                                <Task
                                    key={task.id}
                                    task={task}
                                    projectParticipants={projectParticipants}
                                    onTaskCreate={onTaskCreate}
                                    priorityOptions={priorityOptions}
                                    edit={edit}
                                    auth={auth}
                                />
                            ))}
                            <div
                                className="cursor-pointer text-blue-600 text-center"
                                onClick={handleViewMore}
                            >
                                Thu Nhỏ
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
