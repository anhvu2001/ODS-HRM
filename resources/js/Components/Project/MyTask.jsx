import React from "react";
import { useState, useEffect } from "react";
import MyTaskList from "../Task/MyTaskList";
import UniqueStatusTask from "../Task/UniqueStatusTask";

export default function MyTask({ auth }) {
    const [tab, setTab] = useState("inProgress");
    const [statusOptions, setStatusOptions] = useState([]);
    // lấy status option cho task
    const fetchStatuses = async () => {
        try {
            const { data } = await axios.get(route("Get_All_Status"));
            setStatusOptions(data);
        } catch (error) {
            console.error("Error fetching statuses:", error);
        }
    };
    useEffect(() => {
        fetchStatuses();
    }, []);

    return (
        <>
            <div className="flex mb-8 border justify-between">
                <div
                    className={`w-1/4 text-center p-2 border-r-2 font-bold cursor-pointer duration-300 hover:bg-green-300 ${
                        tab === "inProgress" ? "bg-blue-500 text-white" : ""
                    } `}
                    onClick={() => {
                        setTab("inProgress");
                    }}
                >
                    In progress
                </div>
                <div
                    className={`w-1/4 text-center p-2 border-r-2 font-bold cursor-pointer duration-300 hover:bg-green-300 ${
                        tab === "Completed" ? "bg-blue-500 text-white" : ""
                    } `}
                    onClick={() => {
                        setTab("Completed");
                    }}
                >
                    Completed
                </div>
                <div
                    className={`w-1/4 text-center p-2 border-r-2 font-bold cursor-pointer duration-300 hover:bg-green-300 ${
                        tab === "Pending" ? "bg-blue-500 text-white" : ""
                    } `}
                    onClick={() => {
                        setTab("Pending");
                    }}
                >
                    Pending
                </div>
                <div
                    className={`w-1/4 text-center p-2 font-bold cursor-pointer duration-300 hover:bg-green-300 ${
                        tab === "Canceled" ? "bg-blue-500 text-white" : ""
                    } `}
                    onClick={() => {
                        setTab("Canceled");
                    }}
                >
                    Canceled
                </div>
            </div>

            {tab == "inProgress" && (
                <MyTaskList
                    auth={auth}
                    statusOptions={statusOptions}
                    edit={false}
                />
            )}
            {tab == "Completed" && (
                <UniqueStatusTask
                    projectsStatus={3}
                    auth={auth}
                    statusOptions={statusOptions}
                    edit={false}
                />
            )}
            {tab == "Pending" && (
                <UniqueStatusTask
                    projectsStatus={4}
                    auth={auth}
                    statusOptions={statusOptions}
                    edit={false}
                />
            )}
            {tab == "Canceled" && (
                <UniqueStatusTask
                    projectsStatus={5}
                    auth={auth}
                    statusOptions={statusOptions}
                    edit={false}
                />
            )}
        </>
    );
}
