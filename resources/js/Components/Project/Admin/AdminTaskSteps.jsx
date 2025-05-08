import { useEffect } from "react";
import { useState } from "react";
import dayjs from "dayjs";
import Modal from "@/Components/Modal";
import PrimaryButton from "../../PrimaryButton";
import SecondaryButton from "../../SecondaryButton";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import { Link } from "@inertiajs/react";
export default function adminTaskStep({}) {
    const [selectedStep, setSelectedStep] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [modal, setModal] = useState(false);
    const [newStepName, setNewStepName] = useState();
    const [step, setStep] = useState();
    const [newStepDescription, setNewStepDescription] = useState();
    const closeModal = () => {
        setModal(false);
        setNewStepDescription(null);
        setNewStepName(null);
    };
    const closeEditModal = () => {
        setShowEditModal(true);
        setSelectedStep(null);
        setNewStepDescription(null);
    };
    const handleSubmitEdit = async () => {
        try {
            const { data } = await axios.post(
                route("edit_step_detail", selectedStep),
                {
                    name: newStepName,
                    description: newStepDescription,
                }
            );
            alert(data.message);
            setSelectedStep(null);
            fetchStep();
        } catch (error) {
            console.error();
        }
    };
    const addNewStep = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post(route("create_new_task_Step"), {
                name: newStepName,
                description: newStepDescription,
            });
            alert(data.message);
            fetchStep();
            setModal(false);
        } catch (error) {
            console.error();
            console.log(error);
        }
    };
    const confirmDelete = async (id) => {
        const isConfirmed = window.confirm("Bạn có chắc muốn xóa?");
        if (!isConfirmed) {
            return;
        }
        try {
            const { data } = await axios.delete(route("delete_task_step", id));
            alert(data.message);
            fetchStep();
        } catch (error) {
            console.error();
        }
    };
    const handleNameChange = (e) => {
        const value = e.target.value;
        setNewStepName(value);
    };
    const handleDescriptionChange = (e) => {
        const value = e.target.value;
        setNewStepDescription(value);
    };
    const handleEdit = (item) => {
        setSelectedStep(item.id);
        setShowEditModal(true);
        setNewStepName(item.name);
        setNewStepDescription(item.description);
    };
    const fetchStep = async () => {
        try {
            const { data } = await axios.get(route("get_task_step_detail"));
            setStep(data);
        } catch (error) {
            console.error();
        }
    };
    useEffect(() => {
        fetchStep();
    }, []);

    return (
        <>
            <div className="font-bold text-lg ">Task Step</div>
            <div className="py-4">
                <PrimaryButton
                    onClick={() => {
                        setModal(modal ? false : true);
                    }}
                >
                    Add New Step
                </PrimaryButton>
                <Modal show={modal} onClose={closeModal}>
                    <form onSubmit={addNewStep} className="p-6">
                        <h2 className="text-lg font-medium text-gray-900">
                            Thêm mới trạng thái
                        </h2>
                        <div className="mt-6">
                            <InputLabel htmlFor="Name" value="Name" />
                            <TextInput
                                id="Name"
                                type="Text"
                                name="Step_name"
                                required
                                onChange={handleNameChange}
                                className="mt-1 block w-3/4"
                                placeholder="Tên trạng thái"
                            />
                        </div>
                        <div className="mt-6">
                            <InputLabel
                                htmlFor="Description"
                                value="Description"
                            />
                            <textarea
                                id="Description"
                                type="Text"
                                name="step_description"
                                required
                                onChange={handleDescriptionChange}
                                value={newStepDescription}
                                className="mt-1 block w-3/4 rounded"
                                placeholder="Mô tả"
                            />
                        </div>
                        <div className="mt-6 flex justify-end">
                            <SecondaryButton onClick={closeModal}>
                                Cancel
                            </SecondaryButton>
                            <PrimaryButton className="ms-3">
                                Thêm mới trạng thái
                            </PrimaryButton>
                        </div>
                    </form>
                </Modal>
            </div>
            <table className="w-full border min-w-full divide-y-2 divide-gray-200 bg-white text-sm">
                <thead className="ltr:text-left rtl:text-right">
                    <tr>
                        <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 w-1/6">
                            Tên trạng thái
                        </th>
                        <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 w-1/6">
                            Mô tả
                        </th>
                        <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 w-1/6">
                            Ngày tạo
                        </th>
                        <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 w-1/6">
                            Ngày cập nhật
                        </th>
                        <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 w-1/6">
                            Tool
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {step?.map((item) => {
                        // get the manager user
                        return (
                            <tr
                                className="divide-y divide-gray-200"
                                key={item.id}
                            >
                                <td className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 w-1/6 ">
                                    {item.name}
                                </td>
                                <td className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 w-1/6">
                                    <p className="truncate line-clamp-2">
                                        {item.description}
                                    </p>
                                </td>
                                <td className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 w-1/6">
                                    {item.created_at
                                        ? dayjs(item.created_at).format(
                                              "dddd, MMM D, YYYY"
                                          )
                                        : "Không tồn tại"}
                                </td>
                                <td className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 w-1/6">
                                    {item.updated_at
                                        ? dayjs(item.updated_at).format(
                                              "dddd, MMM D, YYYY"
                                          )
                                        : "Chưa cập nhật"}
                                </td>
                                <td className="p-4 space-x-2 whitespace-nowrap lg:p-5 w-1/6">
                                    <button
                                        onClick={() => {
                                            handleEdit(item);
                                        }}
                                        as="button"
                                        className="w-1/2 inline-flex items-center justify-center py-2 px-3 text-sm font-medium text-center text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 hover:text-gray-900 hover:scale-[1.02] transition-all"
                                    >
                                        Sửa
                                    </button>
                                    {selectedStep === item.id && (
                                        <Modal
                                            show={showEditModal}
                                            onClose={closeEditModal}
                                        >
                                            <form
                                                onSubmit={handleSubmitEdit}
                                                className="p-6"
                                            >
                                                <h2 className="text-lg font-medium text-gray-900">
                                                    Sửa trạng thái
                                                </h2>
                                                <div className="mt-6">
                                                    <InputLabel
                                                        htmlFor="Name"
                                                        value="Name"
                                                    />
                                                    <TextInput
                                                        id="Name"
                                                        type="Text"
                                                        name="category_name"
                                                        required
                                                        onChange={
                                                            handleNameChange
                                                        }
                                                        value={newStepName}
                                                        className="mt-1 block w-3/4"
                                                        placeholder="Tên phân loại"
                                                    />
                                                </div>
                                                <div className="mt-6">
                                                    <InputLabel
                                                        htmlFor="Name"
                                                        value="Description"
                                                    />
                                                    <textarea
                                                        id="Name"
                                                        type="Text"
                                                        name="category_name"
                                                        required
                                                        onChange={
                                                            handleDescriptionChange
                                                        }
                                                        value={
                                                            newStepDescription
                                                        }
                                                        className="mt-1 block w-3/4 rounded"
                                                        placeholder="Tên phân loại"
                                                    />
                                                </div>

                                                <div className="mt-6 flex justify-end">
                                                    <SecondaryButton
                                                        onClick={closeEditModal}
                                                    >
                                                        Cancel
                                                    </SecondaryButton>
                                                    <PrimaryButton className="ms-3">
                                                        Sửa
                                                    </PrimaryButton>
                                                </div>
                                            </form>
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
