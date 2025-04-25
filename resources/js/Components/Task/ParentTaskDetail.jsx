import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import useTaskValidation from "@/hook/useTaskValidation";
import TaskComments from "../TaskComments/TaskComments";
import CkeditorComponent from "../CkeditorComponent";

export default function ParentTaskDetail({
    task,
    handleModalClose,
    onTaskCreate,
    edit,
    qcMode,
    auth,
}) {
    const [taskfiles, setTaskFiles] = useState();
    const [dataComment, setDataComment] = useState([]);
    const fetchDataComment = async () => {
        try {
            const { data } = await axios.get(
                route("get_all_task_comments", task.id)
            );
            setDataComment(data);
        } catch (error) {
            console.error("error fetching comment");
        }
    };
    const FilePathsToFile = async () => {
        try {
            const filePaths = JSON.parse(task.project_files[0].file_list);
            const files = await convertPathToFile(filePaths);
            setTaskFiles(files);
        } catch (error) {
            console.error("error converting file path to file");
        }
    };

    // console.log(JSON.parse(task.project_files[0].file_list));
    const convertPathToFile = async (filePaths) => {
        const fileObjects = await Promise.all(
            filePaths.map(({ file_name, file_path }) => {
                return filePathToBlob(`/storage/${file_path}`, file_name);
            })
        );
        return fileObjects;
    };
    const filePathToBlob = async (filePath, file_name = "downloadedFile") => {
        try {
            const response = await fetch(filePath); // Fetch the file from the path
            if (!response.ok) throw new Error("Failed to fetch file");
            const blob = await response.blob(); // Convert response to Blob
            // Convert Blob to File object
            const file = new File([blob], file_name, {
                type: blob.type,
            });
            return file;
        } catch (error) {
            console.error("Error fetching file:", error);
        }
    };
    useEffect(() => {
        FilePathsToFile();
    }, []);
    useEffect(() => {
        fetchDataComment();
    }, []);
    return (
        <div
            className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-10 "
            onClick={handleModalClose}
        >
            <div
                className="bg-white p-8 rounded-lg w-3/4 max-w-3xl flex-col overflow-y-scroll max-h-full"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    type="button"
                    className="text-red-500 mb-2 w-full font-extrabold text-end"
                    onClick={handleModalClose}
                >
                    Close
                </button>
                <h1 className="font-bold text-center text-2xl pb-4">
                    {task.status_id !== 3 && task.status_id !== 6
                        ? `Chi tiết công việc được giao`
                        : `Chi tiết công việc được nộp`}
                </h1>
                <h2 className="text-blue-600 font-bold">
                    {`Người tạo:`} <span>{task.assignee.name}</span>
                </h2>
                <div className="space-y-4">
                    <div>
                        <label className="block font-bold py-2">
                            Tên công việc
                        </label>
                        <input
                            readOnly
                            type="text"
                            className="border rounded w-full p-2"
                            value={task?.name}
                        />
                    </div>

                    <div>
                        <label className="block font-bold py-2">Mô tả:</label>
                        <CkeditorComponent
                            defaultDescription={task?.description}
                            readOnly={true}
                            editorId={`editor_${task?.id}`}
                        />
                    </div>

                    <div>
                        <div className="font-bold py-2">Files đính kèm:</div>
                        {task.project_files.length > 0 ? (
                            <div>
                                {JSON.parse(
                                    task.project_files[0].file_list
                                ).map((file, index) => (
                                    <div
                                        key={index}
                                        className="flex justify-between gap-4"
                                    >
                                        <div className="flex w-11/12 text-blue-600 line-clamp-1 text-xs whitespace-nowrap">
                                            <a
                                                className="content-center"
                                                href={`storage/${
                                                    file?.file_path || "#"
                                                }`}
                                                download
                                            >
                                                {file?.file_name}
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-sm">
                                Công việc không có file đính kèm
                            </div>
                        )}
                    </div>
                    <div className="flex gap-x-4 py-2">
                        <div className="mb-2">
                            <label className="block font-bold mb-2">
                                Phân loại
                            </label>
                            <input
                                className="rounded-md"
                                type="text"
                                readOnly
                                value={task.category.name}
                            />
                        </div>
                        <div className="mb-2">
                            <label className="block font-bold mb-2">
                                Deadline
                            </label>
                            <input
                                readOnly
                                type="date"
                                className="border rounded w-full p-2"
                                value={task.due_date}
                            />
                        </div>
                        {/* <div className="mb-2">
                            <label className="block font-bold mb-2">
                                Assignee
                            </label>
                            <input
                                readOnly
                                className="border rounded w-full p-2"
                                value={task.assignee.name}
                            />
                        </div> */}
                    </div>
                </div>
                <TaskComments
                    user={auth.user.id}
                    comments={dataComment}
                    taskId={task.id}
                />
            </div>
        </div>
    );
}
