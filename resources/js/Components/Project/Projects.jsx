import React, { useState, useEffect } from "react";
import axios from "axios";
import CreateProjectModal from "./CreateProjectModal"; // Import modal mới
import ProjectsList from "./ProjectsList";
import "../../../css/skeleton.css";
export default function Projects({ auth }) {
    const [projects, setProjects] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const [loading, setLoading] = useState(false);
    // Fetch danh sách dự án
    const fetchProjects = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(
                route("List_Project_By_User", { page })
            );
            setProjects((prev) => [...prev, ...data.projects]);
            setHasMore(data.hasMore);
            setLoading(false);
            setPage(page + 1);
        } catch (error) {
            console.error("Error fetching projects:", error);
        }
    };
    // fetch project after update, create, delete
    const handleProjectChange = async () => {
        const { data } = await axios.get(
            route("get_n_page_project", { page: page })
        );
        setProjects(data.projects);
        setHasMore(data.hasMore);
    };
    useEffect(() => {
        fetchProjects();
    }, []);
    return (
        <div className="flex flex-col">
            <button
                onClick={() => setShowModal(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded self-start"
            >
                Tạo dự án mới
            </button>
            <CreateProjectModal
                showModal={showModal}
                handleClose={() => setShowModal(false)}
                onProjectCreated={handleProjectChange}
            />
            <ProjectsList
                projects={projects}
                onProjectUpdated={handleProjectChange} // Truyền callback vào ProjectsList
                auth={auth}
                edit={true}
            />
            {loading && (
                <div className="flex flex-col gap-4 justify-center ">
                    <div className="flex cursor-pointer bg-amber-100 rounded-xl ">
                        <div className="w-3/6 h-12 flex items-center px-1 rounded-xl">
                            <div className="skeleton skeleton-text"></div>
                        </div>
                        <div className="w-1/6 border-2 border-y-0 h-12 flex items-center px-2">
                            <div className="skeleton skeleton-text"></div>
                        </div>
                        <div className="w-1/6 border-2 border-y-0 h-12 flex items-center px-2 border-l-0">
                            <div className="skeleton skeleton-text"></div>
                        </div>
                        <div className="w-1/6 border-y-0 h-12 flex items-center px-2">
                            <div className="skeleton skeleton-text"></div>
                        </div>
                    </div>
                    <div className="flex cursor-pointer bg-amber-100 rounded-xl ">
                        <div className="w-3/6 h-12 flex items-center px-1 rounded-xl">
                            <div className="skeleton skeleton-text"></div>
                        </div>
                        <div className="w-1/6 border-2 border-y-0 h-12 flex items-center px-2">
                            <div className="skeleton skeleton-text"></div>
                        </div>
                        <div className="w-1/6 border-2 border-y-0 h-12 flex items-center px-2 border-l-0">
                            <div className="skeleton skeleton-text"></div>
                        </div>
                        <div className="w-1/6 border-y-0 h-12 flex items-center px-2">
                            <div className="skeleton skeleton-text"></div>
                        </div>
                    </div>
                    <div className="flex cursor-pointer bg-amber-100 rounded-xl ">
                        <div className="w-3/6 h-12 flex items-center px-1 rounded-xl">
                            <div className="skeleton skeleton-text"></div>
                        </div>
                        <div className="w-1/6 border-2 border-y-0 h-12 flex items-center px-2">
                            <div className="skeleton skeleton-text"></div>
                        </div>
                        <div className="w-1/6 border-2 border-y-0 h-12 flex items-center px-2 border-l-0">
                            <div className="skeleton skeleton-text"></div>
                        </div>
                        <div className="w-1/6 border-y-0 h-12 flex items-center px-2">
                            <div className="skeleton skeleton-text"></div>
                        </div>
                    </div>
                </div>
            )}
            {hasMore && (
                <button
                    onClick={() => {
                        fetchProjects();
                    }}
                    className="bg-blue-600 text-white w-1/6 rounded-xl self-center p-2 my-4 "
                >
                    {`${loading ? `Loading...` : `Load more`}`}
                </button>
            )}
        </div>
    );
}
