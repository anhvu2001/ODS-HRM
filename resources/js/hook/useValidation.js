import { useState } from "react";

const useValidation = () => {
    const [errors, setErrors] = useState({});

    const validate = (formData) => {
        const newErrors = {};
        const today = new Date();
        const endDate = new Date(formData.end_date);

        // Convert to "YYYY-MM-DD" format for comparison (ignore time)
        const formatDate = (date) => {
            if (isNaN(date.getTime())) {
                return ""; // Trả về chuỗi rỗng nếu là ngày không hợp lệ
            }
            return date.toISOString().split("T")[0];
        };

        const todayFormatted = formatDate(today);
        // const startDateFormatted = formatDate(startDate);
        const endDateFormatted = formatDate(endDate);

        // Required fields
        if (!formData.name) newErrors.name = "Project name is required.";
        if (formData.project_departments.length === 0) {
            newErrors.project_departments = "Project departments is required";
        }

        if (!formData.end_date) newErrors.end_date = "End date is required.";

        // Date validations

        if (formData.end_date && endDateFormatted < todayFormatted) {
            newErrors.end_date = "End date cannot be earlier than today.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    return { errors, validate };
};

export default useValidation;
