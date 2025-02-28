import React, { useState, useEffect } from "react";
import axios from "axios";
import CreateProjectModal from "./CreateProjectModal"; // Import modal mới
import ProjectsList from "./ProjectsList";

export default function Projects({ auth }) {
    const [projects, setProjects] = useState([]);
    const [showModal, setShowModal] = useState(false);
    // Fetch danh sách dự án
    const fetchProjects = async () => {
        try {
            const { data } = await axios.get(route("List_Project_By_User"));
            setProjects(data);
        } catch (error) {
            console.error("Error fetching projects:", error);
        }
    };
    useEffect(() => {
        fetchProjects();
    }, []);

    return (
        <div>
            <button
                onClick={() => setShowModal(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded"
            >
                Create New Project
            </button>
            <CreateProjectModal
                showModal={showModal}
                handleClose={() => setShowModal(false)}
                onProjectCreated={fetchProjects}
            />
            <ProjectsList
                projects={projects}
                onProjectUpdated={fetchProjects} // Truyền callback vào ProjectsList
                auth={auth}
                edit={true}
            />
        </div>
    );
}
