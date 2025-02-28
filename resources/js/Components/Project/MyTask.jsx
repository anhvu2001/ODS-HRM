import React from "react";
import { useState, useEffect } from "react";
import MyTaskList from "../Task/MyTaskList";

export default function MyTask({ auth }) {
    const [projects, setProjects] = useState([]);
    const [statusOptions, setStatusOptions] = useState([]);
    const fetchStatuses = async () => {
        try {
            const { data } = await axios.get(route("Get_All_Status"));
            setStatusOptions(data);
        } catch (error) {
            console.error("Error fetching statuses:", error);
        }
    };
    useEffect(() => {
        fetchStatuses();
    }, []);
    const fetchProjects = async () => {
        try {
            const { data } = await axios.get(route("User_joined_tasks"));
            setProjects(data);
        } catch (error) {
            console.error("Error fetching projects:", error);
        }
    };
    useEffect(() => {
        fetchProjects();
    }, []);
    return (
        <>
            <div>Công việc hiện tại:</div>
            <MyTaskList
                projects={projects}
                onProjectUpdated={fetchProjects} // Truyền callback vào ProjectsList
                auth={auth}
                statusOptions={statusOptions}
                edit={false}
            />
        </>
    );
}
