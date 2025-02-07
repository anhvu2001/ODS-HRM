import React, { useState } from "react";
import ProjectDetailsSidebar from "./ProjectDetailsSidebar";
import { getStatusColor } from "@/utils/statusColor";

export default function ProjectsList({ projects, onProjectUpdated }) {
    const [selectedProject, setSelectedProject] = useState(null);
    return (
        <div className="relative">
            {/* Danh sách dự án */}
            <div>
                <div className="flex my-4">
                    <div className="w-3/6 border-y-2 h-12 flex items-center">
                        Tên dự án
                    </div>
                    <div className="w-1/6 border-2 h-12 flex items-center px-2 text-base text-green-600">
                        Ngày bắt đầu
                    </div>
                    <div className="w-1/6 border-2 h-12 flex items-center px-2 border-l-0 text-base text-[#c92f54]">
                        Ngày kết thúc
                    </div>
                    <div className="w-1/6 border-y-2 h-12 flex items-center px-2 text-base">
                        Trạng thái
                    </div>
                </div>
                {projects &&
                    projects.map((item) => (
                        <div
                            key={item.id}
                            className="flex my-4 cursor-pointer"
                            onClick={() => setSelectedProject(item)} // Chọn dự án
                        >
                            <div className="w-3/6 border-y-2 h-12 flex items-center">
                                {item?.name}
                            </div>
                            <div className="w-1/6 border-2 h-12 flex items-center px-2 text-base text-green-600">
                                {item?.start_date}
                            </div>
                            <div className="w-1/6 border-2 h-12 flex items-center px-2 border-l-0 text-base text-[#c92f54]">
                                {item?.end_date}
                            </div>
                            <div className="w-1/6 border-y-2 h-12 flex items-center px-2 text-base">
                                <p
                                    className={`font-bold text-sm p-2 rounded-2xl w-full text-center ${getStatusColor(
                                        item.status_id
                                    )}`}
                                >
                                    {item?.status_name}
                                </p>
                            </div>
                        </div>
                    ))}
            </div>
            {/* Sidebar hiển thị thông tin chi tiết */}
            {selectedProject && (
                <>
                    {/* Overlay */}
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 z-10"
                        onClick={() => setSelectedProject(null)}
                    ></div>
                    {/* Sidebar */}
                    <ProjectDetailsSidebar
                        project={selectedProject}
                        closeSidebar={() => setSelectedProject(null)}
                        onProjectUpdated={onProjectUpdated} // Truyền callback vào ProjectsList
                    />
                </>
            )}
        </div>
    );
}
