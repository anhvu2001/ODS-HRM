import { Head } from "@inertiajs/react";
import React, { lazy, Suspense, useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
const componentMap = {
    taskStatus: lazy(() =>
        import("../../Components/Project/Admin/AdminTaskSteps.jsx")
    ),
    taskCategories: lazy(() =>
        import("../../Components/Project/Admin/AdminTaskCategories.jsx")
    ),
    workflow: lazy(() =>
        import("../../Components/Project/Admin/AdminTaskWorkflow.jsx")
    ),
    // taskQC: lazy(() => import("../../Components/TaskQC/TaskQC.jsx")),
    // accountTask: lazy(() =>
    //     import("../../Components/CompletedTask/AccountTab.jsx")
    // ),
};
let filterSideBarItems = [
    { name: "taskStatus", label: "Task Status" },
    { name: "taskCategories", label: "Task Categories" },
    { name: "workflow", label: "Task Workflow" },
];
export default function Admin({ auth }) {
    const defaultComponent = "taskStatus";
    const [activeComponent, setActiveComponent] = useState(defaultComponent);

    const handleSidebarClick = (component) => {
        setActiveComponent(component);
    };
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
                        <aside className="w-1/5 bg-gray-200 p-6">
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
                        <main className="w-4/5 bg-white p-6">
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
