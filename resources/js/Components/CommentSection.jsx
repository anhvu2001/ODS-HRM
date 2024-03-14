
import React, { useState } from 'react';

export default function CommentSection() {
    const [showReplyForm, setShowReplyForm] = useState(false);

    const toggleReplyForm = () => {
        setShowReplyForm(!showReplyForm);
    };

    return (
        <div className="bg-gray-100 p-4">
            <h2 className="text-xl font-bold mb-4">Comments</h2>
            <div className="space-y-4">
                {/* Another comment */}
                <div className="flex space-x-4">
                    <img className="w-10 h-10 rounded-full" src="avatar.jpg" alt="User Avatar" />
                    <div>
                        <h3 className="font-bold">Jane Smith</h3>
                        <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                        {/* Add reply button */}
                        <button className="text-blue-500 hover:text-blue-600" onClick={toggleReplyForm}>
                            {showReplyForm ? 'Cancel' : 'Reply'}
                        </button>
                    </div>

                </div>

                {/* Reply comment */}
                <div className="flex space-x-4 ml-8">
                    <img className="w-10 h-10 rounded-full" src="avatar.jpg" alt="User Avatar" />
                    <div>
                        <h3 className="font-bold">Reply User</h3>
                        <p>Reply comment content</p>
                    </div>
                </div>
                {/* Reply form */}
                {showReplyForm && (
                    <form className="flex space-x-4 ml-8">
                        <img className="w-10 h-10 rounded-full" src="avatar.jpg" alt="User Avatar" />
                        <input className="flex-grow border rounded-lg px-4 py-2" type="text" placeholder="Write a reply..." />
                        <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg">Submit</button>
                    </form>
                )}

                {/* Add comment form */}
                <form className="flex space-x-4">
                    <img className="w-10 h-10 rounded-full" src="avatar.jpg" alt="User Avatar" />
                    <input className="flex-grow border rounded-lg px-4 py-2" type="text" placeholder="Write a comment..." />
                    <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg">Submit</button>
                </form>
            </div>
        </div>
    );
}
