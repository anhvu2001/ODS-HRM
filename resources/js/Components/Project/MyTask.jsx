import React from "react";
import { useState, useEffect } from "react";
import MyTaskList from "../Task/MyTaskList";
import UniqueStatusTask from "../Task/UniqueStatusTask";

export default function MyTask({ auth }) {
    const [tab, setTab] = useState("inProgress");
    return (
        <>
            <div className="flex mb-8 border justify-between">
                <div
                    className={`w-1/2 text-center p-2 border-r-2 font-bold cursor-pointer duration-300 hover:bg-green-300 ${
                        tab === "inProgress" ? "bg-blue-500 text-white" : ""
                    } `}
                    onClick={() => {
                        setTab("inProgress");
                    }}
                >
                    In progress
                </div>
                <div
                    className={`w-1/2 text-center p-2 border-r-2 font-bold cursor-pointer duration-300 hover:bg-green-300 ${
                        tab === "Completed" ? "bg-blue-500 text-white" : ""
                    } `}
                    onClick={() => {
                        setTab("Completed");
                    }}
                >
                    Completed
                </div>
            </div>

            {tab == "inProgress" && <MyTaskList auth={auth} edit={true} />}
            {tab == "Completed" && (
                <UniqueStatusTask auth={auth} edit={false} />
            )}
        </>
    );
}
