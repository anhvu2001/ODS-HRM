import React, { useCallback, useEffect, useState } from "react";
import { FaPaperclip } from "react-icons/fa";
import axios from "axios";
import { Mention, MentionsInput } from "react-mentions";
import { FormatDate } from "@/Components/FormatDate";

export default function TComment({
    user,
    comment,
    taskId,
    fetchDataComment,
    mentionsInputStyle,
}) {
    const [replyCommentId, setReplyCommentId] = useState(null);
    const [content, setContent] = useState("");
    const [editCommentId, setEditCommentId] = useState(null);
    const [editContent, setEditContent] = useState("");
    const [fileUploaded, setFileUploaded] = useState(null);
    const [fileDownloaded, setFileDownloaded] = useState([]);
    const [deletedFile, setDeletedFile] = useState();

    const handleFileChange = (event) => {
        const selectedFiles = event.target.files;
        if (selectedFiles.length > 0) {
            setFileUploaded(selectedFiles[0]); // Update the state with the uploaded file
        }
    };
    const handleSubmitReply = async (e) => {
        e.preventDefault();
        if (!content && !fileUploaded) {
            console.log("please add content or file");
            return;
        }
        const formData = new FormData();
        formData.append("content", content);
        formData.append("user_id", user);
        formData.append("task_id", taskId);
        formData.append("parent_id", comment.id);
        formData.append("file", fileUploaded);
        try {
            const { data } = await axios.post(
                route("create_task_comments"),
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data", // Important for file uploads
                    },
                }
            );
            fetchDataComment();
            setReplyCommentId(null);
            setContent("");
            setFileUploaded(null);
        } catch (error) {
            console.error("Error creating comment:", error);
        }
    };
    const handleClickEdit = async () => {
        setEditCommentId(editCommentId === comment.id ? null : comment.id);
        setFileUploaded(null);
        setReplyCommentId(null);
        if (comment.content) {
            setEditContent(comment.content);
        }
        if (comment.file_paths) {
            const files = await convertPathToFile(
                JSON.parse(comment.file_paths)
            );
            setFileDownloaded(files);
        }
    };
    const handleSubmitEdit = async (e) => {
        e.preventDefault();
        if (!editContent && !fileUploaded && !fileDownloaded) {
            alert("vui lòng nhập file hoặc nội dung");
            return;
        }
        const formData = new FormData();
        formData.append("content", editContent);
        formData.append("user_id", user);
        formData.append("task_id", 2);
        formData.append("id", comment.id);
        formData.append("parent_id", comment.id);
        if (fileUploaded) {
            formData.append("file", fileUploaded);
        }
        if (deletedFile) {
            formData.append("deleted_file", deletedFile);
        }
        try {
            const { data } = await axios.post(
                route("update_task_comment"),
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data", // Important for file uploads
                    },
                }
            );
            alert(data.message);
            fetchDataComment();
            setEditCommentId(null);
            setEditContent("");
            setDeletedFile(null);
        } catch (error) {
            console.error("error editting comment:", error);
        }
    };
    const handleDelete = async (commentId) => {
        const isConfirmed = window.confirm("bạn có chắc muốn xóa");
        if (!isConfirmed) return;
        try {
            const response = await axios.delete(
                route("delete_task_comments", commentId)
            );
        } catch (error) {
            console.error("Error deleting comment:", error);
        }
        fetchDataComment();
    };
    const fetchUserSuggestions = useCallback((query, callback) => {
        axios
            .get(`/api/search-users?name=${query}`)
            .then((response) => {
                const suggestions = response.data.map((user) => ({
                    id: user.id,
                    display: user.name,
                }));
                callback(suggestions);
            })
            .catch((error) => {
                console.error("Error fetching user suggestions:", error);
            });
    }, []);
    const parseMentions = (text) => {
        const mentionPattern = /@\{\{(\d+)\|\|(.+?)\}\}/g;
        const parts = [];
        let lastIndex = 0;
        text.replace(mentionPattern, (match, id, display, offset) => {
            parts.push(text.substring(lastIndex, offset));
            parts.push(
                <span key={offset} className="text-red-500 font-medium">
                    @{display}
                </span>
            );
            lastIndex = offset + match.length;
        });
        parts.push(text.substring(lastIndex));
        return parts;
    };
    const filePathToBlob = async (
        filePath,
        originalName = "downloadedFile"
    ) => {
        try {
            const response = await fetch(filePath); // Fetch the file from the path
            if (!response.ok) throw new Error("Failed to fetch file");
            const blob = await response.blob(); // Convert response to Blob
            // Convert Blob to File object
            const file = new File([blob], originalName, { type: blob.type });
            return file;
        } catch (error) {
            console.error("Error fetching file:", error);
        }
    };
    const convertPathToFile = async (filePaths) => {
        const fileObjects = await Promise.all(
            filePaths.map(
                ({ store_path, original_name }) =>
                    filePathToBlob(`/storage/${store_path}`, original_name) // ✅ Properly call the function
            )
        );

        return fileObjects; // ✅ Returns an array of File objects
    };
    const handleDeleteFile = async (file) => {
        setFileDownloaded(null);
        setFileUploaded(null);
        setDeletedFile(file);
        // xóa file và update db nếu có delete file
        // giữ nguyên db nếu không có
        setFilePath(null);
        console.log(deletedFile);
    };

    return (
        <div key={comment.id} className="mb-2 flex flex-col my-3 w-full ">
            <div className="flex flex-col gap-1 w-full">
                <h2 className="w-full font-bold">{comment.user.name}</h2>
                <p className=" overflow-hidden w-full h-auto">
                    {comment?.content && parseMentions(comment.content)}
                </p>
                {JSON.parse(comment.file_paths) && (
                    <div>
                        <div>File đính kèm:</div>
                        {JSON.parse(comment.file_paths).map((file, index) => (
                            <a
                                href={`/storage/${file["store_path"]}`}
                                download
                                className="text-green-600 text-xs block"
                                key={index}
                            >
                                {file["original_name"]}
                            </a>
                        ))}
                    </div>
                )}
                <p className="text-yellow-600 text-xs">
                    {FormatDate(comment.created_at)}
                </p>
            </div>

            <div className="flex gap-4">
                <button
                    onClick={() => {
                        setReplyCommentId(
                            replyCommentId === comment.id ? null : comment.id
                        );
                        setEditCommentId(null);
                        setFileUploaded(null);
                    }}
                    className="text-blue-500"
                >
                    Reply
                </button>
                {user === comment.user_id && (
                    <button onClick={handleClickEdit} className="text-blue-500">
                        Edit
                    </button>
                )}
                {user === comment.user_id && (
                    <button
                        onClick={() => handleDelete(comment.id)}
                        className="text-blue-500"
                    >
                        Delete
                    </button>
                )}
            </div>

            {replyCommentId === comment.id && (
                <>
                    <form
                        className="flex gap-2 m-2 relative items-center"
                        onSubmit={(e) => handleSubmitReply(e, comment.id)}
                    >
                        <div className="relative w-full max-w-3xl">
                            <MentionsInput
                                value={content}
                                onChange={({ target: { value } }) =>
                                    setContent(value)
                                }
                                className="flex-grow border rounded-lg px-4 py-2 max-w-3xl"
                                style={mentionsInputStyle}
                                autoFocus
                                placeholder={`Trả lời ${comment.user.name}`}
                            >
                                <Mention
                                    trigger="@"
                                    markup="@{{__id__||__display__}}"
                                    data={fetchUserSuggestions}
                                    displayTransform={(id, display) =>
                                        `@${display}`
                                    }
                                    style={{ backgroundColor: "#daf4fa" }}
                                />
                            </MentionsInput>
                            <input
                                type="file"
                                id={`fileInput-${comment.id}`}
                                className="hidden"
                                onChange={handleFileChange}
                            />
                            <label htmlFor={`fileInput-${comment.id}`}>
                                <FaPaperclip className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer hover:text-gray-700 transition" />
                            </label>
                        </div>
                        <button
                            type="submit"
                            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg h-fit"
                        >
                            Submit
                        </button>
                        <button
                            onClick={() => setReplyCommentId(null)}
                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg h-fit"
                        >
                            Cancel
                        </button>
                    </form>
                    {fileUploaded && (
                        <div className="text-sm text-green-600 px-3">
                            <span>Upload file: </span> {fileUploaded.name}
                            <button
                                className="text-red-700 pl-3"
                                onClick={() => {
                                    setFileUploaded(null);
                                }}
                            >
                                Remove
                            </button>
                        </div>
                    )}
                </>
            )}
            {editCommentId === comment.id && (
                <>
                    <form
                        className="flex gap-2 m-2 relative items-center"
                        onSubmit={(e) => handleSubmitEdit(e)}
                    >
                        <div className="relative w-full max-w-3xl">
                            <MentionsInput
                                value={editContent}
                                onChange={({ target: { value } }) =>
                                    setEditContent(value)
                                }
                                autoFocus
                                style={mentionsInputStyle}
                                className="flex-grow border rounded-lg px-4 py-2 max-w-3xl"
                            >
                                <Mention></Mention>
                            </MentionsInput>
                            <input
                                type="file"
                                id={`edit-fileInput-${comment.id}`}
                                className="hidden"
                                onChange={handleFileChange}
                            />
                            <label htmlFor={`edit-fileInput-${comment.id}`}>
                                <FaPaperclip className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer hover:text-gray-700 transition" />
                            </label>
                        </div>

                        <button
                            type="submit"
                            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg h-fit"
                        >
                            Submit
                        </button>
                        <button
                            onClick={() => setEditCommentId(null)}
                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg h-fit"
                        >
                            Cancel
                        </button>
                    </form>
                    {fileUploaded && (
                        <div>
                            <span className="text-sm text-green-600">
                                new file: {fileUploaded.name}
                            </span>
                            <button
                                className="text-red-700 pl-3"
                                onClick={() => {
                                    setFileUploaded(null);
                                }}
                            >
                                Remove
                            </button>
                        </div>
                    )}
                    <div className="text-blue-400">
                        {fileDownloaded
                            ? fileDownloaded.map((file, index) => (
                                  <div key={index} className="flex gap-4 px-3">
                                      <span className="block text-blue-600">
                                          {file?.name || "File không tồn tại"}
                                      </span>
                                      <button
                                          className="text-red-700"
                                          onClick={() => {
                                              handleDeleteFile(file);
                                          }}
                                      >
                                          Delete
                                      </button>
                                  </div>
                              ))
                            : "No file selected"}
                    </div>
                </>
            )}
            {comment.children.map((children) => (
                <div className="mx-5">
                    <TComment
                        key={children.id}
                        user={user}
                        taskId={taskId}
                        comment={children}
                        fetchDataComment={fetchDataComment}
                        mentionsInputStyle={mentionsInputStyle}
                    ></TComment>
                </div>
            ))}
        </div>
    );
}
