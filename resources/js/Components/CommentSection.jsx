import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import Comment from "./Comment";
import { Mention, MentionsInput } from "react-mentions";

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

export default function CommentSection({
    idRequest,
    auth,
    idFollower,
    ownerIdRequest,
}) {
    if (!idRequest || !auth) {
        return null;
    }

    let ownerIdRequestParse = Number(ownerIdRequest);
    const [dataComment, setDataComment] = useState([]);
    const { id } = auth.user;
    const [content, setContent] = useState("");

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content) return;

        try {
            const { data } = await axios.post(route("Create-New-Comment"), {
                content,
                user_id: id,
                request_id: idRequest,
                parent_comment_id: null,
                level: 1,
            });

            if (data.status) {
                // Update the UI immediately
                fetchDataComment();
                resetForm();
                // Send notifications asynchronously
                if (data.userId !== ownerIdRequestParse) {
                    sendNotification(data.id);
                }
            }
        } catch (error) {
            console.error("Error creating comment:", error);
        }
    };

    const sendNotification = async (commentId) => {
        try {
            await axios.post(route("Create-Notificaton-Comment", commentId), {
                idFollower: idFollower,
                type: "ower",
            });
        } catch (error) {
            console.error("Error sending notification:", error);
        }
    };

    const resetForm = useCallback(() => {
        setContent("");
    }, []);

    const handleAddMention = useCallback((mention) => {
        console.log("Mention added:", mention); // Log to see what data is available
        // Here you can access the ID of the mentioned user and use it as needed
        // For example, sendNotification(mention.id) if you want to notify the mentioned user
    }, []);

    return (
        <div className="bg-gray-100 p-4 pb-24">
            <h2 className="text-xl font-bold mb-4">Comments</h2>
            <div className="space-y-4 relative">
                {dataComment.map((comment) => (
                    <Comment
                        key={comment.id}
                        comment={comment}
                        auth={auth}
                        idRequest={idRequest}
                        idFollower={idFollower}
                        mentionsInputStyle={mentionsInputStyle}
                        fetchDataComment={fetchDataComment}
                    />
                ))}
                <form
                    className="flex space-x-4 items-center"
                    onSubmit={handleSubmit}
                >
                    <MentionsInput
                        value={content}
                        onChange={({ target: { value } }) => setContent(value)}
                        style={mentionsInputStyle}
                        className="flex-grow border rounded-lg px-4 py-2"
                    >
                        <Mention
                            trigger="@"
                            data={fetchUserSuggestions}
                            displayTransform={(id, display) => `@${display}`}
                            markup="@{{__id__||__display__}}"
                            style={{ backgroundColor: "#daf4fa" }}
                            onAdd={handleAddMention}
                        />
                    </MentionsInput>
                    <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg h-fit"
                    >
                        Submit
                    </button>
                </form>
            </div>
        </div>
    );
}
