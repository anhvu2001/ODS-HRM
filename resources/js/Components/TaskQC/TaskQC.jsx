import React from "react";
import { lazy, useState } from "react";
import History from "./History.jsx";
import QCTaskList from "./QCTaskList.jsx";

export default function MyTask({ auth }) {
    const [selectedTab, setSelectedTab] = useState("qcTaskList");

    const handleFirstTabClick = function () {
        setSelectedTab("qcTaskList");
    };
    const handleSecondTabClick = function () {
        setSelectedTab("history");
    };
    return (
        <>
            <div className="flex border rounded-xl mb-6">
                <div
                    className={`w-1/2 text-center border-r-inherit border-r-2 p-2 cursor-pointer text-lg font-bold ${
                        selectedTab === "qcTaskList"
                            ? "bg-blue-500 text-white"
                            : ""
                    }`}
                    onClick={handleFirstTabClick}
                >
                    Công việc cần kiểm tra
                </div>
                <div
                    className={`w-1/2 text-center p-2 cursor-pointer font-bold text-lg ${
                        selectedTab === "history"
                            ? "bg-blue-500 text-white"
                            : ""
                    }`}
                    onClick={handleSecondTabClick}
                >
                    Lịch sử
                </div>
            </div>
            {selectedTab === "history" ? (
                <History auth={auth} />
            ) : (
                <QCTaskList auth={auth} />
            )}
        </>
    );
}
