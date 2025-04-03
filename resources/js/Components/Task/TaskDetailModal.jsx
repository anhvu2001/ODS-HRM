import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import CreateTaskModal from "./CreateTaskModal";
import useTaskValidation from "@/hook/useTaskValidation";
import TaskComments from "../TaskComments/TaskComments";
import CkeditorComponent from "../CkeditorComponent";

export default function TaskDetailModal({
    task,
    handleModalClose,
    projectParticipants,
    onTaskCreate,
    edit,
    qcMode,
    auth,
}) {
    const handleCreateTask = () => {
        setShowModal(true);
    };
    const { errors, validate } = useTaskValidation();
    const [creatorFiles, setCreatorFiles] = useState([]);
    const [addedFiles, setAddedFiles] = useState([]);
    const [executorFiles, setExecutorFiles] = useState([]);
    const [creatorFilePaths, setCreatorFilePaths] = useState([]);
    const [executorFilePaths, setExecutorFilePaths] = useState([]);
    const [priorityOptions, setPriorityOptions] = useState([]);
    const [dataComment, setDataComment] = useState([]);
    const [deletedFiles, setDeletedFiles] = useState([]);
    const [updating, setUpdating] = useState(false);
    const fetchPriority = async () => {
        try {
            const { data } = await axios.get(route("Get_priority_option"));
            setPriorityOptions(data);
        } catch (error) {
            console.error("Error fetching priorities:", error);
        }
    };
    const fetchTaskFilePaths = async () => {
        try {
            const { data } = await axios.get(
                route("get_all_task_file", task.id)
            );
            data.files.forEach((file) => {
                if (file.uploaded_by === task.created_by) {
                    setCreatorFilePaths(JSON.parse(file.file_list));
                } else {
                    setExecutorFilePaths(JSON.parse(file.file_list));
                }
            });
        } catch (error) {
            console.error("Error fetching priorities:", error);
        }
    };
    const creatorFilePathsToFile = async () => {
        try {
            const files = await convertPathToFile(creatorFilePaths);
            setCreatorFiles(files);
        } catch (error) {
            console.error("error converting file path to file");
        }
    };
    const executorFilePathsToFile = async () => {
        try {
            const files = await convertPathToFile(executorFilePaths);
            setExecutorFiles(files);
        } catch (error) {
            console.error("error converting file path to file");
        }
    };

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

    const [statusOptions, setStatusOptions] = useState([]);
    const fetchStatuses = async () => {
        try {
            const { data } = await axios.get(route("Get_All_Status"));
            setStatusOptions(data);
        } catch (error) {
            console.error("Error fetching statuses:", error);
        }
    };
    //  lấy comment của task này
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
    useEffect(() => {
        if (task.id) {
            fetchTaskFilePaths();
        }
    }, [task.id]);
    useEffect(() => {
        executorFilePathsToFile();
    }, [executorFilePaths]);
    useEffect(() => {
        creatorFilePathsToFile();
    }, [creatorFilePaths]);

    useEffect(() => {
        fetchPriority();
        fetchDataComment();
        fetchStatuses();
    }, []);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: task.name,
        participant:
            edit && task.task_user ? task.task_user.user_id : auth.user.id,
        priority_id: task.priority_id,
        status: task.status_id,
        description: task?.description,
        start_date: task.start_date,
        due_date: task.due_date,
    });
    const handleParticipantChange = (selectedOption) => {
        if (edit) {
            setFormData((prev) => ({
                ...prev,
                participant: selectedOption ? selectedOption.value : null, // Store only the ID
            }));
        }
    };
    const handlePriorityChange = (selectedOption) => {
        if (edit) {
            setFormData((prev) => ({
                ...prev,
                priority_id: selectedOption ? selectedOption.value : null, // Store only the ID
            }));
        }
    };
    const handleStatusChange = (selectedOption) => {
        setFormData((prev) => ({
            ...prev,
            status: selectedOption ? selectedOption.value : null,
        }));
    };
    const removeNull = () => {
        if (auth.user.id === task.created_by) {
            setCreatorFilePaths((prev) => prev.filter(Boolean));
            setCreatorFiles((prev) => prev.filter(Boolean));
        } else {
            setExecutorFilePaths((prev) => prev.filter(Boolean));
            setExecutorFiles((prev) => prev.filter(Boolean));
        }
    };
    const handleUpdate = async () => {
        try {
            setUpdating(true);
            validate(formData);
            const formDataObject = new FormData();
            formDataObject.append("name", formData.name);
            formDataObject.append("participant", formData.participant);
            formDataObject.append("priority_id", formData.priority_id);
            formDataObject.append("status", formData.status);
            formDataObject.append("description", formData.description);
            formDataObject.append("start_date", formData.start_date);
            formDataObject.append("due_date", formData.due_date);
            // file cần xóa
            if (deletedFiles.length > 0) {
                deletedFiles.forEach((fileIndex) => {
                    formDataObject.append("delete_files[]", fileIndex);
                });
            }
            // file mới thêm
            if (addedFiles.length > 0) {
                Array.from(addedFiles).forEach((file) => {
                    formDataObject.append("files[]", file);
                });
            }
            const response = await axios.post(
                route("Update_task", task.id),
                formDataObject
            );
            alert(response.data.message);
            onTaskCreate();
            setAddedFiles([]);
            setDeletedFiles([]);
            fetchTaskFilePaths();
            removeNull();
            setUpdating(false);
        } catch (error) {
            console.error();
            setUpdating(false);
            alert("failed to update load more task ");
        }
    };
    const handleQC = async (isApproved) => {
        try {
            const response = await axios.put(route("task_qc", task.id), {
                approve: isApproved,
            });
            alert(response.data.message);
            handleModalClose();
            onTaskCreate();
        } catch (error) {
            console.error();
            alert("failed to qc task ");
        }
    };
    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this task?")) return;
        try {
            const response = await axios.delete(route("Delete_task", task.id));
            onTaskCreate();
            alert("Task deleted");
        } catch (error) {
            console.error();
            alert("Failed to delete task");
        }
    };
    const renderQCstatus = () => {
        if (task.qc_status === 1) {
            return (
                <div className="text-green-600 font-bold text-xl">
                    Task Completed
                </div>
            );
        } else if (task.qc_status === 0) {
            return (
                <div className="text-red-600 font-bold text-xl">
                    Task Rejected
                </div>
            );
        } else {
            return <></>;
        }
    };
    // input file callback
    const handleFileChange = (event) => {
        const selectedFiles = Array.from(event.target.files);
        // check if selected files in default files list
        if (selectedFiles.length > 0) {
            setAddedFiles((prev) => [...prev, ...selectedFiles]);
        }
    };

    const handleRemoveFile = (index) => {
        setDeletedFiles((prev) => [...prev, index]);
        if (auth.user.id === task.created_by) {
            setCreatorFiles(
                (prev) => prev.map((file, i) => (i === index ? null : file)) // Replace with null
            );
            // file path
            setCreatorFilePaths((prev) =>
                prev.map((path, i) => (i === index ? null : path))
            );
        } else {
            setExecutorFiles((prev) =>
                prev.map((file, i) => (i === index ? null : file))
            );
            setExecutorFilePaths((prev) =>
                prev.map((path, i) => (i === index ? null : path))
            );
        }
    };
    const removeSelectedFile = (index) => {
        setAddedFiles((prev) => prev.filter((_, i) => i !== index));
    };
    return (
        <div className="fixed top-0 right-0 w-1/2 h-full bg-white shadow-lg p-6 overflow-auto z-20">
            <button
                type="button"
                className="text-red-500 mb-2 w-full font-extrabold text-end"
                onClick={handleModalClose}
            >
                Close
            </button>
            <h2 className="text-xl font-bold mb-2">Task Details</h2>
            <h2 className="text-blue-600">
                Created by: <span>{task.creator.name}</span>
            </h2>
            {/* hiển thị trạng thái qc */}
            {renderQCstatus()}
            <div className="space-y-4 ">
                <div>
                    <label className="block font-bold">Name</label>
                    {edit && task.qc_status !== 1 ? (
                        <input
                            readOnly={auth.user.id !== task.created_by}
                            type="text"
                            className="border rounded w-full p-2"
                            value={formData.name}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    name: e.target.value,
                                })
                            }
                        />
                    ) : (
                        <input
                            readOnly
                            type="text"
                            className="border rounded w-full p-2 cursor-default"
                            value={formData.name}
                        />
                    )}
                </div>
                {errors.name && (
                    <p className="text-red-500 text-sm">{errors.name}</p>
                )}
                <div>
                    <label className="block font-bold">Description</label>
                    {edit && task.qc_status !== 1 ? (
                        <CkeditorComponent
                            setFormData={setFormData}
                            formData={formData}
                            defaultDescription={formData?.description}
                            readOnly={auth.user.id !== task.created_by}
                        />
                    ) : (
                        <CkeditorComponent
                            setFormData={setFormData}
                            formData={formData}
                            defaultDescription={formData?.description}
                            readOnly={true}
                        />
                    )}
                </div>
                {qcMode && (
                    <div>
                        <label className="block font-bold">Executor</label>
                        <input
                            type="text"
                            className="border rounded w-full p-2"
                            value={task.task_user.user.name}
                            readOnly
                        />
                    </div>
                )}
                <div className="flex flex-col gap-4">
                    {task.qc_status !== 1 &&
                        (auth.user.id === task.created_by ||
                            auth.user.id === task.task_user.user_id) && (
                            <>
                                <label className="block font-bold">
                                    File upload
                                </label>
                                <input
                                    type="file"
                                    id={`taskfileinput`}
                                    className="self-center"
                                    onChange={handleFileChange}
                                    multiple
                                />
                            </>
                        )}

                    <div className="flex py-2">
                        <div className="w-1/2 border-r-2 border-gray-600">
                            <div className="text-center mb-2">
                                Files của người tạo task
                            </div>
                            <div className="flex flex-col gap-1 h-[100px] overflow-y-scroll">
                                {creatorFiles?.map((file, index) => (
                                    <div
                                        key={index}
                                        className="flex justify-between gap-4"
                                    >
                                        <div className="flex w-11/12 text-blue-600 line-clamp-1 text-xs whitespace-nowrap">
                                            <a
                                                className="content-center"
                                                href={`storage/${
                                                    creatorFilePaths[index]
                                                        ?.file_path || "#"
                                                }`}
                                                download
                                            >
                                                {file?.name}
                                            </a>
                                        </div>
                                        {task.created_by === auth.user.id &&
                                            !task.qc_status &&
                                            file && (
                                                <button
                                                    type="button"
                                                    className="w-1/12 text-red-600"
                                                    onClick={() => {
                                                        handleRemoveFile(index);
                                                    }}
                                                >
                                                    X
                                                </button>
                                            )}
                                    </div>
                                ))}
                                {task.created_by === auth.user.id &&
                                    addedFiles?.map((file, index) => (
                                        <div
                                            key={index}
                                            className="flex justify-between gap-4 h-6"
                                        >
                                            <div className="flex w-11/12 text-blue-600 line-clamp-1 text-xs whitespace-nowrap">
                                                <a
                                                    className="content-center"
                                                    download
                                                >
                                                    {file?.name}
                                                </a>
                                            </div>
                                            {task.created_by == auth.user.id &&
                                                !task.qc_status &&
                                                file && (
                                                    <button
                                                        type="button"
                                                        className="w-1/12 text-red-600"
                                                        onClick={() => {
                                                            removeSelectedFile(
                                                                index
                                                            );
                                                        }}
                                                    >
                                                        X
                                                    </button>
                                                )}
                                        </div>
                                    ))}
                            </div>
                        </div>
                        <div className="w-1/2 pl-2">
                            <div className="text-center mb-2">
                                Files của người làm
                            </div>
                            {task.created_by !== task.task_user?.user_id && (
                                <div className="flex flex-col gap-1 h-[100px] overflow-y-scroll">
                                    {executorFiles?.map((file, index) => (
                                        <div
                                            key={index}
                                            className="flex justify-between gap-4"
                                        >
                                            <div className="flex w-11/12 text-blue-600 line-clamp-1 text-xs whitespace-nowrap">
                                                <a
                                                    className="content-center"
                                                    href={`storage/${
                                                        executorFilePaths[index]
                                                            ?.file_path || "#"
                                                    }`}
                                                    download
                                                >
                                                    {file?.name}
                                                </a>
                                            </div>
                                            {task.task_user?.user_id ===
                                                auth.user.id &&
                                                file &&
                                                !task.qc_status && (
                                                    <button
                                                        type="button"
                                                        className="w-1/12 text-red-600"
                                                        onClick={() => {
                                                            handleRemoveFile(
                                                                index
                                                            );
                                                        }}
                                                    >
                                                        X
                                                    </button>
                                                )}
                                        </div>
                                    ))}
                                    {task.task_user?.user_id === auth.user.id &&
                                        addedFiles?.map((file, index) => (
                                            <div
                                                key={index}
                                                className="flex justify-between gap-4"
                                            >
                                                <div className="flex w-11/12 text-blue-600 line-clamp-1 text-xs whitespace-nowrap">
                                                    <a
                                                        className="content-center"
                                                        download
                                                    >
                                                        {file?.name}
                                                    </a>
                                                </div>
                                                {task.task_user?.user_id ===
                                                    auth.user.id &&
                                                    !task.qc_status &&
                                                    file && (
                                                        <button
                                                            type="button"
                                                            className="w-1/12 text-red-600"
                                                            onClick={() => {
                                                                removeSelectedFile(
                                                                    index
                                                                );
                                                            }}
                                                        >
                                                            X
                                                        </button>
                                                    )}
                                            </div>
                                        ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                {projectParticipants && (
                    <div className="mb-2">
                        <label
                            htmlFor="participant"
                            className="block mb-2 font-medium"
                        >
                            Executor
                        </label>
                        {edit && task.qc_status !== 1 ? (
                            <Select
                                options={projectParticipants.map(
                                    (participant) => ({
                                        value: participant.id,
                                        label: participant.name,
                                    })
                                )}
                                isDisabled={auth.user.id !== task.created_by}
                                value={
                                    projectParticipants.find(
                                        (p) => p.id === formData.participant
                                    )
                                        ? {
                                              value: formData.participant,
                                              label: projectParticipants.find(
                                                  (p) =>
                                                      p.id ===
                                                      formData.participant
                                              ).name,
                                          }
                                        : null
                                }
                                onChange={handleParticipantChange}
                                className="basic-select"
                                classNamePrefix="select"
                                placeholder="Select participant..."
                            />
                        ) : (
                            <input
                                onFocus={(e) => e.preventDefault()}
                                readOnly
                                type="text"
                                className="border rounded w-full p-2 cursor-default"
                                value={
                                    projectParticipants.find(
                                        (p) => p.id === formData.participant
                                    ).name
                                }
                            />
                        )}
                    </div>
                )}

                <div className="flex justify-between gap-x-2">
                    <div className="mb-2">
                        <label
                            htmlFor="priority"
                            className="block mb-2 font-medium"
                        >
                            Priority
                        </label>
                        {edit && task.qc_status !== 1 ? (
                            <Select
                                isDisabled={auth.user.id !== task.created_by}
                                options={priorityOptions.map((option) => ({
                                    value: option.id,
                                    label: option.name,
                                }))}
                                value={
                                    priorityOptions.find(
                                        (p) => p.id === formData.priority_id
                                    )
                                        ? {
                                              value: formData.priority_id,
                                              label: priorityOptions.find(
                                                  (p) =>
                                                      p.id ===
                                                      formData.priority_id
                                              ).name,
                                          }
                                        : null
                                }
                                onChange={handlePriorityChange}
                            />
                        ) : (
                            <input
                                readOnly
                                type="text"
                                className="border rounded w-full p-2 cursor-default"
                                value={
                                    priorityOptions.find(
                                        (p) => p.id === formData.priority_id
                                    )?.name || "No priority selected"
                                }
                            />
                        )}
                    </div>
                    {qcMode || task.qc_status == 1 ? (
                        <div className="mb-2">
                            <label
                                htmlFor="priority"
                                className="block mb-2 font-medium"
                            >
                                Select status
                            </label>
                            <input
                                className="border rounded w-full p-2 cursor-default"
                                type="text"
                                readOnly
                                value={
                                    statusOptions.find(
                                        (p) => p.id === formData.status
                                    )?.name
                                }
                            />
                        </div>
                    ) : (
                        <div className="mb-2">
                            <label
                                htmlFor="priority"
                                className="block mb-2 font-medium"
                            >
                                Select status
                            </label>
                            <Select
                                isDisabled={
                                    auth.user.id !== task.created_by &&
                                    auth.user.id !== task.task_user?.user_id
                                }
                                options={statusOptions.map((option) => ({
                                    value: option.id,
                                    label: option.name,
                                }))}
                                value={
                                    statusOptions.find(
                                        (p) => p.id === formData.status
                                    )
                                        ? {
                                              value: formData.status,
                                              label: statusOptions.find(
                                                  (p) =>
                                                      p.id === formData.status
                                              ).name,
                                          }
                                        : null
                                }
                                onChange={handleStatusChange}
                            />
                        </div>
                    )}

                    <div className="mb-2">
                        <label className="block font-bold mb-2">
                            Start Date
                        </label>
                        <input
                            readOnly={
                                !edit ||
                                task.qc_status == 1 ||
                                auth.user.id !== task.created_by
                            }
                            type="date"
                            className="border rounded w-full p-2"
                            value={formData.start_date}
                            onChange={(e) => {
                                setFormData({
                                    ...formData,
                                    start_date: e.target.value,
                                });
                            }}
                            min={new Date().toISOString().split("T")[0]}
                        />
                    </div>
                    <div className="mb-2">
                        <label className="block font-bold mb-2">End Date</label>
                        <input
                            readOnly={
                                !edit ||
                                task.qc_status == 1 ||
                                auth.user.id !== task.created_by
                            }
                            type="date"
                            className="border rounded w-full p-2"
                            value={formData.due_date}
                            onChange={(e) => {
                                setFormData({
                                    ...formData,
                                    due_date: e.target.value,
                                });
                            }}
                            min={formData.start_date}
                        />
                    </div>
                </div>
            </div>
            {task.qc_status !== 1 &&
                (auth.user.id === task.created_by ||
                    auth.user.id == task.task_user.user_id) && (
                    <>
                        {!qcMode ? (
                            <>
                                <div className="mt-6 flex space-x-4">
                                    <button
                                        type="button"
                                        className="bg-blue-500 text-white px-4 py-2 rounded"
                                        onClick={handleUpdate}
                                    >
                                        {updating ? "Updating..." : "Update"}
                                    </button>
                                    {edit &&
                                        auth.user.id === task.created_by && (
                                            <button
                                                type="button"
                                                className="bg-red-500 text-white px-4 py-2 rounded"
                                                onClick={handleDelete}
                                            >
                                                Delete
                                            </button>
                                        )}
                                </div>
                                {edit && auth.user.id === task.created_by && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={handleCreateTask}
                                            className="bg-green-500 text-white px-4 py-2 rounded my-4"
                                        >
                                            Create Sub Task
                                        </button>
                                        <CreateTaskModal
                                            showModal={showModal}
                                            participants={projectParticipants}
                                            project={task.project_id}
                                            handleCreateTaskClose={() =>
                                                setShowModal(false)
                                            }
                                            parent_id={task.id}
                                            onTaskCreate={onTaskCreate}
                                            handleModalClose={handleModalClose}
                                            priorityOptions={priorityOptions}
                                        />
                                    </>
                                )}
                            </>
                        ) : (
                            <div className="flex gap-x-2">
                                <button
                                    type="button"
                                    className="bg-blue-500 text-white px-4 py-2 rounded"
                                    onClick={() => handleQC(true)}
                                >
                                    Approve
                                </button>
                                <button
                                    type="button"
                                    className="bg-red-500 text-white px-4 py-2 rounded"
                                    onClick={() => handleQC(false)}
                                >
                                    Reject
                                </button>
                            </div>
                        )}
                    </>
                )}

            <TaskComments
                user={auth.user.id}
                comments={dataComment}
                taskId={task.id}
            />
        </div>
    );
}
