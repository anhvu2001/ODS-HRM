import React from "react";

export const FormatDate = ( createdAt ) => {
    if (!createdAt) return null; // Kiểm tra nếu không có createdAt, trả về null
    // Tạo một đối tượng Date từ chuỗi createdAt
    const dateObj = new Date(createdAt);

    // Định dạng ngày tháng sử dụng toLocaleDateString()
    const formattedDate = dateObj.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
    });

    return <span>{formattedDate}</span>;
};

