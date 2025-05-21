import { useState } from "react";

const useValidation = () => {
    const [errors, setErrors] = useState({});

    const validate = (formData) => {
        const newErrors = {};
        const today = new Date();
        const startDate = new Date(formData.start_date);
        const endDate = new Date(formData.due_date);

        // Convert to "YYYY-MM-DD" format for comparison (ignore time)
        const formatDate = (date) => {
            if (isNaN(date.getTime())) {
                return ""; // Trả về chuỗi rỗng nếu là ngày không hợp lệ
            }
            return date.toISOString().split("T")[0];
        };
        const todayFormatted = formatDate(today);
        const endDateFormatted = formatDate(endDate);

        // Required fields
        // Task name
        if (!formData.name) newErrors.name = "Task name is required.";
        if (!formData.department)
            newErrors.department = "Department is required";

        if (!formData.category_id)
            newErrors.category_id = "Categories is required";
        // if (!formData.due_date  ) newErrors.due_date = "deadline is required.";
        if (!formData.due_date && !formData.member_due_date)
            newErrors.due_date = "deadline is required.";

        if (formData.due_date && endDateFormatted < todayFormatted) {
            newErrors.due_date = "Deadline cannot be earlier than today.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length;
    };

    return { errors, validate };
};

export default useValidation;
