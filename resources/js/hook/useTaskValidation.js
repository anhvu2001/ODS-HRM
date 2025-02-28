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
        const startDateFormatted = formatDate(startDate);
        const endDateFormatted = formatDate(endDate);

        // Required fields
        // Task name
        if (!formData.name) newErrors.name = "Task name is required.";
        // task participant
        if (!formData.participant)
            newErrors.participant = "Participant is required";
        //task priority
        if (!formData.priority_id)
            newErrors.priority_id = "Priority is required";
        // task start_date
        if (!formData.start_date)
            newErrors.start_date = "Start date is required.";
        // task end date
        if (!formData.due_date) newErrors.due_date = "due date is required.";

        // Date validations
        if (formData.start_date && startDateFormatted < todayFormatted) {
            newErrors.start_date = "Start date cannot be earlier than today.";
        }
        if (formData.due_date && endDateFormatted < todayFormatted) {
            newErrors.due_date = "End date cannot be earlier than today.";
        }
        if (
            formData.start_date &&
            formData.due_date &&
            startDateFormatted > endDateFormatted
        ) {
            newErrors.due_date = "End date must be after start date.";
        }
        setErrors(newErrors);
        // return Object.keys(newErrors).length === 0;
        return Object.keys(newErrors).length;
    };

    return { errors, validate };
};

export default useValidation;
