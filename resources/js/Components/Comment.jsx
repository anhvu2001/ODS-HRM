import React, { useState, useCallback } from "react";
import { Mention, MentionsInput } from "react-mentions";
import axios from "axios";
import FileUploader from "./FileUploader";
import { convertFilePathToFile } from "@/Helpers/fileHelpers";

export default function Comment({
    comment,
    auth,
    idRequest,
    idFollower,
    mentionsInputStyle,
    fetchDataComment,
}) {
    if (!comment || !auth) {
        return null;
    }

    const [editingCommentId, setEditingCommentId] = useState(null);
    const [replyCommentId, setReplyCommentId] = useState(null);
    const [levelComment, setLevelComment] = useState(1);
    const [replyContent, setReplyContent] = useState("");
    const [editContent, setEditContent] = useState("");
    const { id } = auth.user;
    const [selectedFile, setSelectedFile] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!replyContent && !selectedFile)
            return alert("Vui lòng nhập nội dung hoặc file vào ô comment");

        try {
            const formData = new FormData();
            formData.append("content", replyContent);
            formData.append("user_id", id);
            formData.append("request_id", idRequest);
            formData.append("parent_comment_id", replyCommentId || 0);
            formData.append("level", levelComment);
            if (selectedFile) {
                formData.append("file_input", selectedFile); // Gửi file vào
            }
            const { data } = await axios.post(
                route("Create-New-Comment"),
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            if (data.status) {
                // Update the UI immediately
                fetchDataComment();
                resetForm();
                // Send notifications asynchronously
                sendNotification(data.id);
            }
        } catch (error) {
            console.error("Error creating comment:", error);
        }
    };
    const sendNotification = async (commentId) => {
        try {
            await axios.post(route("Create-Notificaton-Comment", commentId), {
                idFollower: idFollower,
            });
        } catch (error) {
            console.error("Error sending notification:", error);
        }
    };
    const handleDeleteComment = async (commentId) => {
        const isConfirmed = window.confirm(
            "Bạn có chắc muốn xóa bình luận này?"
        );
        if (!isConfirmed) return;

        try {
            await axios.delete(route("Delete-Comment", commentId));
            fetchDataComment();
        } catch (error) {
            console.error("Error deleting comment:", error);
        }
    };

    const handleSubmitEdit = async (e, commentId) => {
        e.preventDefault();
        if (!editContent && !selectedFile)
            return alert("Vui lòng nhập nội dung hoặc file vào ô comment");
        console.log("aaa", editContent);
        try {
            const formData = new FormData();
            formData.append("content", editContent);
            if (selectedFile) {
                formData.append("file_input", selectedFile); // Gửi file nếu có
            } else {
                formData.append("no_file", "true");
            }
            // Gửi FormData
            await axios.post(
                route("Update-Comment", { id: commentId }),
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data", // Đảm bảo tiêu đề đúng khi gửi FormData
                    },
                }
            );
            // Reset form và làm mới dữ liệu
            resetEditForm();
            handleRemoveFile();
            fetchDataComment();
        } catch (error) {
            console.error("Error updating comment:", error);
        }
    };

    const resetForm = useCallback(() => {
        setReplyContent("");
        setReplyCommentId(null);
        setLevelComment(1);
    }, []);

    const resetEditForm = useCallback(() => {
        setEditContent("");
        setEditingCommentId(null);
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
    const handleEditClick = async (comment) => {
        setEditingCommentId(
            comment.id === editingCommentId ? null : comment.id
        );
        setReplyCommentId(null);
        setEditContent(comment.content || "");

        if (comment?.file_path) {
            try {
                const file = await convertFilePathToFile(comment.file_path);
                setSelectedFile(file);
            } catch (error) {
                console.error("Error converting file path to File:", error);
                setSelectedFile(null);
            }
        } else {
            setSelectedFile(null);
        }
    };
    const handleRemoveFile = () => {
        setSelectedFile(null);
    };
    console.log(selectedFile);
    return (
        <div className="mb-2">
            <h3 className="font-bold">{comment.name}</h3>
            <p>{comment?.content && parseMentions(comment.content)}</p>
            {comment?.file_path && (
                <a
                    className="text-green-500 font-normal decoration-solid"
                    href={comment.file_path}
                    download
                >
                    Dowload file
                </a>
            )}

            <p className="text-yellow-600 text-xs">{comment.updated_at}</p>
            <div className="flex gap-3.5">
                <button
                    className="text-blue-500 hover:text-blue-600"
                    onClick={() => {
                        setReplyCommentId(
                            comment.id === replyCommentId ? null : comment.id
                        );
                        setEditingCommentId(null);
                        setLevelComment(comment.level + 1);
                        setSelectedFile(null);
                    }}
                >
                    Reply
                </button>
                {id === comment.user_id && (
                    <>
                        <button
                            className="text-blue-500 hover:text-blue-600"
                            onClick={() => handleEditClick(comment)}
                        >
                            Edit
                        </button>
                        <button
                            className="text-blue-500 hover:text-blue-600"
                            onClick={() => handleDeleteComment(comment.id)}
                        >
                            Delete
                        </button>
                    </>
                )}
            </div>
            {editingCommentId === comment.id && (
                <form
                    className="flex gap-2 m-2 relative items-center"
                    onSubmit={(e) => handleSubmitEdit(e, comment.id)}
                >
                    <FileUploader
                        selectedFile={selectedFile}
                        onFileSelect={setSelectedFile}
                        onRemoveFile={handleRemoveFile}
                    />
                    <MentionsInput
                        value={editContent}
                        onChange={({ target: { value } }) =>
                            setEditContent(value)
                        }
                        style={mentionsInputStyle}
                        className="border rounded-lg p-2 w-6/12"
                    >
                        <Mention
                            trigger="@"
                            data={fetchUserSuggestions}
                            displayTransform={(id, display) => `@${display}`}
                            markup="@{{__id__||__display__}}"
                            style={{ backgroundColor: "#daf4fa" }}
                        />
                    </MentionsInput>
                    <button
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg h-fit"
                        type="submit"
                    >
                        Save
                    </button>
                    <button
                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg h-fit"
                        type="button"
                        onClick={resetEditForm}
                    >
                        Cancel
                    </button>
                </form>
            )}
            {replyCommentId === comment.id && (
                <form
                    className="flex gap-2 m-2 relative items-center"
                    onSubmit={handleSubmit}
                >
                    <FileUploader
                        selectedFile={selectedFile}
                        onFileSelect={setSelectedFile}
                        onRemoveFile={handleRemoveFile}
                    />
                    <MentionsInput
                        value={replyContent}
                        onChange={({ target: { value } }) =>
                            setReplyContent(value)
                        }
                        style={mentionsInputStyle}
                        className="border rounded-lg p-2 w-6/12"
                        autoFocus
                        placeholder={`Trả lời ${comment.name}`}
                    >
                        <Mention
                            trigger="@"
                            data={fetchUserSuggestions}
                            displayTransform={(id, display) => `@${display}`}
                            markup="@{{__id__||__display__}}"
                            style={{ backgroundColor: "#daf4fa" }}
                        />
                    </MentionsInput>
                    <button
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg h-fit"
                        type="submit"
                    >
                        Reply
                    </button>
                    <button
                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg h-fit"
                        type="button"
                        onClick={resetForm}
                    >
                        Cancel
                    </button>
                </form>
            )}
            {comment.children && comment.children.length > 0 && (
                <div className="ml-6 mt-2">
                    {comment.children.map((reply) => (
                        <Comment
                            key={reply.id}
                            comment={reply}
                            auth={auth}
                            idRequest={idRequest}
                            idFollower={idFollower}
                            mentionsInputStyle={mentionsInputStyle}
                            fetchDataComment={fetchDataComment}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
