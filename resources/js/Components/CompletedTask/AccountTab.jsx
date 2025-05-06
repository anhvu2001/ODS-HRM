import React from "react";
import { lazy, useState } from "react";
import AccountTask from "./AccountTask.jsx";
import AccountTaskHistory from "./AccountTaskHistory.jsx";
export default function AccountTab({ auth }) {
    const [selectedTab, setSelectedTab] = useState("CompletedTask");

    const handleFirstTabClick = function () {
        setSelectedTab("CompletedTask");
    };
    const handleSecondTabClick = function () {
        setSelectedTab("history");
    };
    return (
        <>
            <div className="flex border rounded-xl mb-6">
                <div
                    className={`w-1/2 text-center border-r-inherit border-r-2 p-2 cursor-pointer text-lg font-bold duration-300 hover:bg-green-300 ${
                        selectedTab === "CompletedTask"
                            ? "bg-blue-500 text-white"
                            : ""
                    }`}
                    onClick={handleFirstTabClick}
                >
                    Công việc cần khách feedback
                </div>
                <div
                    className={`w-1/2 text-center p-2 cursor-pointer font-bold text-lg duration-300  hover:bg-green-300 ${
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
                <AccountTaskHistory auth={auth} />
            ) : (
                <AccountTask auth={auth} />
            )}
        </>
    );
}
