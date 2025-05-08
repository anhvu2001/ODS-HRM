import { useEffect } from "react";
import { useState } from "react";
import dayjs from "dayjs";
import Modal from "@/Components/Modal";
import PrimaryButton from "../../PrimaryButton";
import SecondaryButton from "../../SecondaryButton";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import { Link } from "@inertiajs/react";
import CreateWorkflowForm from "./CreateWorkflowForm";
import Select from "react-select";
export default function adminTaskWorkflow({}) {
    const [modal, setModal] = useState(false);
    const [editModal, setEditModal] = useState(false);

    const [workflow, setWorkflow] = useState([]);
    const [newWorkflowName, setNewWorkflowName] = useState();
    const [selectedWorkflow, setSelectedWorkflow] = useState();
    const [categories, setCategories] = useState([]);

    const closeModal = () => {
        setModal(false);
    };
    const closeEditModal = () => {
        setEditModal(false);
    };

    const handleSubmitEdit = async () => {
        try {
            const { data } = await axios.post(
                route("edit_task_detail", selectedWorkflow),
                {
                    name: newWorkflowName,
                }
            );
            alert(data.message);
            setSelectedWorkflow(null);
            fetchWorkflow();
        } catch (error) {
            console.error();
        }
    };
    const addNewWorkflow = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post(
                route("create_new_task_workflow"),
                {
                    name: newWorkflowName,
                }
            );
            alert(data.message);
            fetchWorkflow();
            setModal(false);
        } catch (error) {
            console.error();
        }
    };
    const confirmDelete = async (id) => {
        const isConfirmed = window.confirm("Bạn có chắc muốn xóa?");
        if (!isConfirmed) {
            return;
        }
        try {
            const { data } = await axios.delete(
                route("delete_task_workflow", id)
            );
            alert(data.message);
            fetchWorkflow();
        } catch (error) {
            console.error();
        }
    };
    const handleNameChange = (e) => {
        const value = e.target.value;
        setNewWorkflowName(value);
    };
    const handleEdit = (item) => {
        setSelectedWorkflow(item.id);
        setEditModal(true);
    };
    const fetchWorkflow = async () => {
        try {
            const { data } = await axios.get(route("get_task_work_flow"));
            setWorkflow(data);
        } catch (error) {
            console.error();
        }
    };
    const fetchCategories = async () => {
        try {
            const { data } = await axios.get(route("Get_all_task_categories"));
            setCategories(data);
        } catch (error) {
            console.error();
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);
    useEffect(() => {
        fetchWorkflow();
    }, []);
    return (
        <>
            <div className="font-bold text-lg ">Task workflow</div>
            <div className="py-4">
                <PrimaryButton
                    onClick={() => {
                        setModal(true);
                    }}
                >
                    Add New workflow
                </PrimaryButton>
                <Modal show={modal} onClose={closeModal}>
                    <CreateWorkflowForm
                        fetchWorkflow={fetchWorkflow}
                        setModal={setModal}
                    ></CreateWorkflowForm>
                </Modal>
            </div>
            <table className="w-full border min-w-full divide-y-2 divide-gray-200 bg-white text-sm">
                <thead className="ltr:text-left rtl:text-right">
                    <tr>
                        <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 w-3/12">
                            Category
                        </th>
                        <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 w-1/12 ">
                            Step order
                        </th>
                        <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 w-1/12">
                            Current step id
                        </th>
                        <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 w-1/12">
                            Next step id
                        </th>
                        <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900w-1/12">
                            Department
                        </th>
                        <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 w-1/12">
                            Final step
                        </th>
                        <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 w-4/12">
                            Tool
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {workflow.map((item) => {
                        // get the manager user
                        return (
                            <tr
                                className="divide-y divide-gray-200"
                                key={item.id}
                            >
                                <td className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 w-2/6 ">
                                    {item.category.name}
                                </td>

                                <td className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 ">
                                    {item.step_order}
                                </td>
                                <td className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                                    {item.current_step.name}
                                </td>
                                <td className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                                    {item.next_step.name}
                                </td>
                                <td className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                                    {item.current_department.department_name}
                                </td>
                                <td className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                                    {item.is_final_step ? "Yes" : "No"}
                                </td>
                                <td className="p-4 space-x-2 whitespace-nowrap lg:p-5">
                                    <button
                                        onClick={() => {
                                            handleEdit(item);
                                        }}
                                        as="button"
                                        className="w-1/2 inline-flex items-center justify-center py-2 px-3 text-sm font-medium text-center text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 hover:text-gray-900 hover:scale-[1.02] transition-all"
                                    >
                                        Sửa
                                    </button>
                                    {selectedWorkflow === item.id && (
                                        <Modal
                                            show={editModal}
                                            onClose={closeEditModal}
                                        >
                                            <CreateWorkflowForm
                                                update
                                                fetchWorkflow={fetchWorkflow}
                                                setModal={setEditModal}
                                                initialWorkflow={item}
                                            ></CreateWorkflowForm>
                                        </Modal>
                                    )}
                                    <button
                                        onClick={() => {
                                            confirmDelete(item.id);
                                        }}
                                        type="button"
                                        className=" w-1/2 inline-flex items-center justify-center py-2 px-3 text-sm font-medium text-center text-white bg-gradient-to-br from-red-400 to-red-600 rounded-lg shadow-md shadow-gray-300 hover:scale-[1.02] transition-transform"
                                    >
                                        Xóa
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </>
    );
}
