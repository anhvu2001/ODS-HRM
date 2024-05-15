import React, { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";

export default function CommentSection({ idRequest, auth }) {
    if(!idRequest || !auth){
        return null;
    }
    const [dataComment, setDataComment] = useState([]);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [replyCommentId, setReplyCommentId] = useState(null);
    const [levelComment, setLevelComment] = useState(1);
    const contentRef = useRef(null);
    const replyContentRef = useRef(null);
    const editContentRef = useRef(null);

    const { id, name } = auth.user;

    const fetchDataComment = useCallback(async () => {
        try {
            const { data } = await axios.get(
                route("Get-All-Comment", idRequest)
            );
            setDataComment(data);
        } catch (error) {
            console.error("Error fetching comments:", error);
        }
    }, [idRequest]);

    useEffect(() => {
        fetchDataComment();
    }, [fetchDataComment]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const replyContentValue = replyContentRef.current?.value;
        const contentValue = contentRef.current?.value;
        const commentContent = contentValue || replyContentValue;
        if (!commentContent) return;

        try {
            await axios.post(route("Create-New-Comment"), {
                content: commentContent,
                user_id: id,
                request_id: idRequest,
                parent_comment_id: replyCommentId || null,
                level: levelComment,
            });
            resetForm();
            fetchDataComment();
        } catch (error) {
            console.error("Error creating comment:", error);
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
        const editContentValue = editContentRef.current?.value;
        if (!editContentValue) return;

        try {
            await axios.post(route("Update-Comment", { id: commentId }), {
                content: editContentValue,
            });
            resetEditForm();
            fetchDataComment();
        } catch (error) {
            console.error("Error updating comment:", error);
        }
    };

    const resetForm = () => {
        if (contentRef.current) contentRef.current.value = "";
        if (replyContentRef.current) replyContentRef.current.value = "";
        setReplyCommentId(null);
        setLevelComment(1);
    };

    const resetEditForm = () => {
        if (editContentRef.current) editContentRef.current.value = "";
        setEditingCommentId(null);
    };

    const Comment = ({ comment }) => (
        <div className="mb-2">
            <h3 className="font-bold">{comment.name}</h3>
            <p>{comment.content}</p>
            <p className="text-yellow-600 text-xs">{comment.created_at}</p>
            <div className="flex gap-3.5">
                <button
                    className="text-blue-500 hover:text-blue-600"
                    onClick={() => {
                        setReplyCommentId(
                            comment.id === replyCommentId ? null : comment.id
                        );
                        setEditingCommentId(null);
                        setLevelComment(comment.level + 1);
                    }}
                >
                    Reply
                </button>
                {id === comment.user_id && (
                    <>
                        <button
                            className="text-blue-500 hover:text-blue-600"
                            onClick={() => {
                                setEditingCommentId(
                                    comment.id === editingCommentId
                                        ? null
                                        : comment.id
                                );
                                setReplyCommentId(null);
                                if (editContentRef.current) {
                                    editContentRef.current.value =
                                        comment.content;
                                }
                            }}
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
                    className="flex gap-2 m-2"
                    onSubmit={(e) => handleSubmitEdit(e, comment.id)}
                >
                    <input
                        className="border rounded-lg"
                        ref={editContentRef}
                        defaultValue={comment.content}
                        autoFocus
                    />
                    <button
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg"
                        type="submit"
                    >
                        Save
                    </button>
                    <button
                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg"
                        type="button"
                        onClick={resetEditForm}
                    >
                        Cancel
                    </button>
                </form>
            )}
            {replyCommentId === comment.id && (
                <form className="flex gap-2 m-2" onSubmit={handleSubmit}>
                    <input
                        className="border rounded-lg"
                        ref={replyContentRef}
                        autoFocus
                    />
                    <button
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg"
                        type="submit"
                    >
                        Reply
                    </button>
                    <button
                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg"
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
                        <Comment key={reply.id} comment={reply} />
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <div className="bg-gray-100 p-4">
            <h2 className="text-xl font-bold mb-4">Comments</h2>
            <div className="space-y-4">
                {dataComment.map((comment) => (
                    <Comment key={comment.id} comment={comment} />
                ))}
                <form className="flex space-x-4" onSubmit={handleSubmit}>
                    <input
                        className="flex-grow border rounded-lg px-4 py-2"
                        type="text"
                        placeholder="Write a comment..."
                        ref={contentRef}
                    />
                    <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg"
                    >
                        Submit
                    </button>
                </form>
            </div>
        </div>
    );
}
