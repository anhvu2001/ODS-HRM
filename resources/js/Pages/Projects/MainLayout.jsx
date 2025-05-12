import { Head } from "@inertiajs/react";
import React, { lazy, Suspense, useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

const componentMap = {
    mytask: lazy(() => import("../../Components/Project/MyTask.jsx")),
    projects: lazy(() => import("../../Components/Project/Projects.jsx")),
    taskQC: lazy(() => import("../../Components/TaskQC/TaskQC.jsx")),
    accountTask: lazy(() =>
        import("../../Components/CompletedTask/AccountTab.jsx")
    ),
};
let sidebarItems = [
    { name: "projects", label: "Projects" },
    { name: "mytask", label: "My Task" },
    { name: "taskQC", label: "Task QC" },
    { name: "accountTask", label: "Completed Tasks" },
];

export default function MainLayout({ auth, authDepartments }) {
    // console.log(authDepartments.includes(3));

    // const [userDepartment, setUserDepartment] = useState();
    // const fetchUserDepartment
    const defaultComponent = authDepartments.includes(3)
        ? "projects"
        : "mytask";
    const [activeComponent, setActiveComponent] = useState(defaultComponent);

    const handleSidebarClick = (component) => {
        setActiveComponent(component);
    };
    let filterSideBarItems = [];
    // auth.user.role != 1 && auth.user.role != 99
    // kiểm tra user có thuộc phòng account
    if (!authDepartments.includes(3)) {
        filterSideBarItems = sidebarItems.filter(
            (item) => item.name !== "projects" && item.name !== "accountTask"
        );
    } else {
        filterSideBarItems = sidebarItems;
    }

    if (!auth.user.role) {
        filterSideBarItems = filterSideBarItems.filter(
            (item) => item.name !== "taskQC"
        );
    }

    const ActiveComponent = componentMap[activeComponent];
    return (
        <>
            <AuthenticatedLayout
                user={auth.user}
                header={
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Projects
                    </h2>
                }
            >
                <Head title="Projects" />
                <div className="flex justify-center pt-10">
                    <div className="w-full max-w-8xl flex">
                        {/* Sidebar bên trái */}
                        <aside className="w-[15%] bg-gray-200 p-6">
                            <ul className="space-y-4 h-[600px] overflow-hidden">
                                {filterSideBarItems.map((item) => (
                                    <li key={item.name}>
                                        <button
                                            onClick={() =>
                                                handleSidebarClick(item.name)
                                            }
                                            className={`${
                                                activeComponent === item.name
                                                    ? "bg-blue-500 text-white"
                                                    : "bg-transparent"
                                            } p-2 w-full text-left rounded`}
                                        >
                                            {item.label}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </aside>
                        {/* Nội dung bên phải */}
                        <main className="w-[85%] bg-white p-6">
                            <div className=" overflow-x-auto ">
                                <Suspense fallback={<p>Loading...</p>}>
                                    <ActiveComponent auth={auth} />
                                </Suspense>
                            </div>
                        </main>
                    </div>
                </div>
            </AuthenticatedLayout>
        </>
    );
}
