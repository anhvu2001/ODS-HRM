import Checkbox from "@/Components/Checkbox";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import { useEffect } from "react";
import { useState } from "react";
import Select from "react-select";

export default function createWorkflowForm({
    update,
    initialWorkflow,
    setModal,
    fetchWorkflow,
}) {
    // console.log(initialWorkflow);
    const [categories, setCategories] = useState([]);
    const [steps, setSteps] = useState();
    const [departments, setDepartments] = useState([]);
    const initialFormData = {
        category: initialWorkflow?.category_id || "",
        current_step_id: initialWorkflow?.current_step_id || "",
        next_step_id: initialWorkflow?.next_step_id || "",
        department_id: initialWorkflow?.department || "",
        is_final_step: initialWorkflow?.is_final_step || false,
    };
    const [formData, setFormData] = useState(initialFormData);

    const closeModal = () => {
        setModal(false);
    };

    const fetchCategories = async () => {
        try {
            const { data } = await axios.get(route("Get_all_task_categories"));
            setCategories(data);
        } catch (error) {
            console.error();
        }
    };
    const fetchStep = async () => {
        try {
            const { data } = await axios.get(route("get_task_step_detail"));
            setSteps(data);
        } catch (error) {
            console.error();
        }
    };
    const fetchDepartment = async () => {
        try {
            const { data } = await axios.get(route("Get_all_departments"));
            setDepartments(data.data);
        } catch (error) {
            console.error();
        }
    };

    useEffect(() => {
        fetchStep();
    }, []);

    useEffect(() => {
        fetchCategories();
    }, []);
    useEffect(() => {
        fetchDepartment();
    }, []);
    const handleCategoryChange = (selectedOptions) => {
        const selectedIds = selectedOptions.value;
        setFormData((prev) => ({
            ...prev,
            category: selectedIds,
        }));
    };
    const handleCurrentStepChange = (selectedOptions) => {
        const selectedIds = selectedOptions.value;
        setFormData((prev) => ({
            ...prev,
            current_step_id: selectedIds,
        }));
    };
    const handleNextStepChange = (selectedOptions) => {
        const selectedIds = selectedOptions.value;
        setFormData((prev) => ({
            ...prev,
            next_step_id: selectedIds,
        }));
    };
    const handleDepartmentChange = (selectedOptions) => {
        const selectedIds = selectedOptions.value;
        setFormData((prev) => ({
            ...prev,
            department_id: selectedIds,
        }));
    };
    const handleIsFinalStepChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            is_final_step: e.target.checked,
        }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (update) {
            updateWorkflow();
        } else {
            addNewWorkflow();
        }
    };
    const updateWorkflow = async (e) => {
        try {
            console.log(formData.category);
            const { data } = await axios.post(
                route("update_task_workflow", initialWorkflow.id),
                {
                    category_id: formData.category,
                    current_step_id: formData.current_step_id,
                    next_step_id: formData.next_step_id,
                    department_id: formData.department_id,
                    is_final_step: formData.is_final_step,
                    step_order: formData.step_order,
                }
                // formData
            );
            alert(data.message);
            fetchWorkflow();
            setModal(false);
        } catch (error) {
            console.error();
            console.log(error);
        }
    };
    const addNewWorkflow = async (e) => {
        try {
            const { data } = await axios.post(
                route("create_new_task_workflow"),
                {
                    category_id: formData.category,
                    current_step_id: formData.current_step_id,
                    next_step_id: formData.next_step_id,
                    department_id: formData.department_id,
                    is_final_step: formData.is_final_step,
                    step_order: formData.step_order,
                }
                // formData
            );
            alert(data.message);
            fetchWorkflow();
            setModal(false);
        } catch (error) {
            console.error();
            console.log(error);
        }
    };
    return (
        <form onSubmit={handleSubmit} className="p-6">
            <h2 className="text-lg font-medium text-gray-900">
                Thêm mới trạng thái
            </h2>
            <div className="mt-6">
                <label htmlFor="category" className="font-bold">
                    Category:
                </label>
                <Select
                    id="category"
                    value={
                        categories.find((c) => c.id === formData.category)
                            ? {
                                  value: formData.category,
                                  label: categories.find(
                                      (c) => c.id === formData.category
                                  ).name,
                              }
                            : null
                    }
                    options={categories?.map((category) => ({
                        value: category.id,
                        label: category.name,
                    }))}
                    onChange={handleCategoryChange}
                ></Select>
            </div>
            {formData.category && (
                <div className="mt-6">
                    <label htmlFor="current_step" className="font-bold">
                        Current Step:
                    </label>
                    <Select
                        id="current_step"
                        options={steps?.map((step) => ({
                            value: step.id,
                            label: step.name,
                        }))}
                        value={
                            steps?.find(
                                (c) => c.id === formData.current_step_id
                            )
                                ? {
                                      value: formData.current_step_id,
                                      label: steps.find(
                                          (c) =>
                                              c.id === formData.current_step_id
                                      ).name,
                                  }
                                : null
                        }
                        onChange={handleCurrentStepChange}
                        placeholder="Current step"
                    ></Select>
                </div>
            )}
            {formData.current_step_id && (
                <div className="mt-6">
                    <label htmlFor="next_step" className="font-bold">
                        Next Step:
                    </label>
                    <Select
                        id="next_step"
                        options={steps?.map((step) => ({
                            value: step.id,
                            label: step.name,
                        }))}
                        value={
                            steps?.find((c) => c.id === formData.next_step_id)
                                ? {
                                      value: formData.next_step_id,
                                      label: steps.find(
                                          (c) => c.id === formData.next_step_id
                                      ).name,
                                  }
                                : null
                        }
                        onChange={handleNextStepChange}
                        placeholder="Next step"
                    ></Select>
                </div>
            )}
            {formData.next_step_id && (
                <div className="mt-6">
                    <label htmlFor="department" className="font-bold">
                        Department:
                    </label>
                    <Select
                        id="department"
                        options={departments?.map((department) => ({
                            value: department.id,
                            label: department.department_name,
                        }))}
                        value={
                            departments?.find(
                                (c) => c.id === formData.department_id
                            )
                                ? {
                                      value: formData.department_id,
                                      label: departments.find(
                                          (c) => c.id === formData.department_id
                                      ).department_name,
                                  }
                                : null
                        }
                        onChange={handleDepartmentChange}
                        placeholder="Department"
                    ></Select>
                </div>
            )}
            {formData.department_id && (
                <div className="mt-6 flex items-center ">
                    <Checkbox
                        name="isFinalStep"
                        id="isFinalStep"
                        onChange={handleIsFinalStepChange}
                        checked={formData.is_final_step}
                    ></Checkbox>
                    <label htmlFor="isFinalStep" className="ml-2 font-semibold">
                        Is this the final step?
                    </label>
                </div>
            )}

            <div className="mt-6 flex justify-end">
                <SecondaryButton onClick={closeModal}>Cancel</SecondaryButton>
                <PrimaryButton className="ms-3">
                    {update ? "cập nhật" : "Thêm mới trạng thái"}
                </PrimaryButton>
            </div>
        </form>
    );
}
