import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Mention, MentionsInput } from "react-mentions";
import TComment from "./TComment";
import { FaPaperclip } from "react-icons/fa";

const mentionsInputStyle = {
    control: {
        fontSize: 14,
        fontWeight: "normal",
        borderColor: "#d1d5db",
    },
    input: {
        borderRadius: 10,
    },
    "&singleLine": {
        display: "inline-block",
        width: 180,
        input: {
            padding: 1,
            border: "2px inset",
        },
    },
    suggestions: {
        list: {
            backgroundColor: "white",
            border: "1px solid rgba(0,0,0,0.15)",
            fontSize: 14,
            borderRadius: "8px",
        },
        item: {
            padding: "5px 15px",
            "&focused": {
                backgroundColor: "#cee4e5",
                borderRadius: "4px",
            },
        },
    },
};

export default function TaskComments({ user, taskId }) {
    const [dataComment, setDataComment] = useState([]);
    const [fileUploaded, setFileUploaded] = useState(null);
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fetchDataComment = useCallback(async () => {
        try {
            const { data } = await axios.get(
                route("get_all_task_comments", taskId)
            );
            setDataComment(data.comments);
        } catch (error) {
            console.error("Error fetching comments:", error);
        }
    }, []);
    useEffect(() => {
        fetchDataComment();
    }, [fetchDataComment]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content && !fileUploaded) {
            console.log("please add content or file");
            return;
        }
        setIsSubmitting(true);
        const formData = new FormData();
        formData.append("content", content);
        formData.append("user_id", user);
        formData.append("task_id", taskId);
        formData.append("file", fileUploaded);
        try {
            const response = await axios.post(
                route("create_task_comments"),
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data", // Important for file uploads
                    },
                }
            );
            fetchDataComment();
            setContent("");
            setFileUploaded(null);
            setIsSubmitting(false);
        } catch (error) {
            console.error("Error creating comment:", error);
            setIsSubmitting(false);
        }
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
    const handleFileChange = (event) => {
        const selectedFiles = event.target.files;
        if (selectedFiles.length > 0) {
            setFileUploaded(selectedFiles[0]); // Update the state with the uploaded file
        }
    };

    return (
        <div className="bg-gray-100 p-4 pb-24 max-w-6xl mt-4">
            <h2 className="text-xl font-bold mb-4 text-center">Comments</h2>
            <div className="space-y-4 relative flex flex-col justify-center ">
                <form
                    className="flex space-x-4 items-center justify-center"
                    onSubmit={handleSubmit}
                >
                    <div className="relative w-5/6 max-w-3xl">
                        <MentionsInput
                            value={content}
                            onChange={({ target: { value } }) =>
                                setContent(value)
                            }
                            style={mentionsInputStyle}
                            className="flex-grow border rounded-lg px-4 py-2 max-w-3xl"
                        >
                            <Mention
                                trigger="@"
                                markup="@{{__id__||__display__}}"
                                data={fetchUserSuggestions}
                                displayTransform={(id, display) =>
                                    `@${display}`
                                }
                                style={{ backgroundColor: "#daf4fa" }}
                                className="rounded"
                            />
                        </MentionsInput>
                        <input
                            type="file"
                            id={`comment-fileInput`}
                            className="hidden"
                            onChange={handleFileChange}
                        />

                        <label htmlFor={`comment-fileInput`}>
                            <FaPaperclip className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer hover:text-gray-700 transition " />
                        </label>
                    </div>

                    <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg h-fit w-1/6"
                        disabled={isSubmitting}
                    >
                        {`${isSubmitting ? `Submitting` : `Submit`}`}
                    </button>
                </form>
                {fileUploaded && (
                    <div className="flex">
                        <div className="text-sm text-green-600 truncate">
                            {fileUploaded.name}
                        </div>
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
            </div>
            <div className="flex flex-col items-center ">
                {dataComment.map((comment) => (
                    <TComment
                        key={comment.id}
                        user={user}
                        taskId={taskId}
                        comment={comment}
                        fetchDataComment={fetchDataComment}
                        mentionsInputStyle={mentionsInputStyle}
                    ></TComment>
                ))}
            </div>
        </div>
    );
}
