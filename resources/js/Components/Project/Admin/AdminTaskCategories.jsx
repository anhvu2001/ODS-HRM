import { useEffect } from "react";
import { useState } from "react";
import dayjs from "dayjs";
import Modal from "@/Components/Modal";
import PrimaryButton from "../../PrimaryButton";
import SecondaryButton from "../../SecondaryButton";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import Select from "react-select";
export default function adminTaskStatus({}) {
    const [modal, setModal] = useState(false);
    const [categories, setCategories] = useState([]);
    const [categoryParent, setCategoryParent] = useState([]);
    const [newCategoryName, setNewCategoryName] = useState();
    const [selectedCategory, setSelectedCategory] = useState();
    const [showEditModal, setShowEditModal] = useState(false);
    const closeModal = () => {
        setModal(false);
        setCategoryParent([]);
    };
    const closeEditModal = () => {
        setShowEditModal(false);
        setCategoryParent([]);
        setNewCategoryName(null);
    };
    const handleSubmitEdit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post(
                route("edit_task_category", selectedCategory),
                {
                    name: newCategoryName,
                    parent: categoryParent,
                }
            );
            alert(data.message);
            setSelectedCategory(null);
            fetchCategories();
            setShowEditModal(false);
            setCategoryParent([]);
        } catch (error) {
            console.error();
        }
    };
    const addNewCategory = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post(
                route("create_new_task_categories"),
                {
                    name: newCategoryName,
                    parent: categoryParent,
                }
            );
            alert(data.message);
            fetchCategories();
            setModal(false);
            setCategoryParent([]);
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
                route("delete_task_category", id)
            );
            alert(data.message);
            fetchCategories();
        } catch (error) {
            console.error();
        }
    };
    const handleNameChange = (e) => {
        const value = e.target.value;
        setNewCategoryName(value);
    };
    const handleParentChange = (selectedOption) => {
        const selectedIds = selectedOption.map((option) => option.value);
        setCategoryParent(selectedIds);
        console.log(categoryParent);
    };
    const handleEdit = (item) => {
        if (item.parent_id) {
            const itemParents = JSON.parse(item.parent_id);
            itemParents.id.forEach((parent) => {
                setCategoryParent((prev) => [...prev, parent]);
            });
        }
        setSelectedCategory(item.id);
        setNewCategoryName(item.name);
        setShowEditModal(true);
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
    return (
        <>
            <div className="font-bold text-lg ">Task Categories</div>
            <div className="py-4">
                <PrimaryButton
                    onClick={() => {
                        setModal(modal ? false : true);
                    }}
                >
                    Add New Category
                </PrimaryButton>
                <Modal show={modal} onClose={closeModal}>
                    <form onSubmit={addNewCategory} className="p-6">
                        <h2 className="text-lg font-medium text-gray-900">
                            Thêm mới phân loại
                        </h2>
                        <div className="mt-6">
                            <InputLabel htmlFor="Name" value="Name" />
                            <TextInput
                                id="Name"
                                type="Text"
                                name="category_name"
                                required
                                onChange={handleNameChange}
                                className="mt-1 block w-3/4"
                                placeholder="Tên phân loại"
                            />
                        </div>
                        <div className="mt-6">
                            <InputLabel
                                htmlFor="parent_categories"
                                value="Parent categories"
                            />
                            <Select
                                id="parent_categories"
                                isMulti
                                onChange={handleParentChange}
                                options={categories.map((category) => ({
                                    value: category.id,
                                    label: category.name,
                                }))}
                                value={categoryParent.map((id) => {
                                    const Parent = categories.find(
                                        (d) => d.id === id
                                    );
                                    return Parent
                                        ? {
                                              value: Parent.id,
                                              label: Parent.name,
                                          }
                                        : null;
                                })}
                            ></Select>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <SecondaryButton onClick={closeModal}>
                                Cancel
                            </SecondaryButton>
                            <PrimaryButton className="ms-3">
                                Thêm mới phân loại
                            </PrimaryButton>
                        </div>
                    </form>
                </Modal>
            </div>
            <table className="w-full border min-w-full divide-y-2 divide-gray-200 bg-white text-sm">
                <thead className="ltr:text-left rtl:text-right">
                    <tr>
                        <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 w-2/6">
                            Tên phân loại
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
                    {categories.map((item) => {
                        // get the manager user
                        return (
                            <tr
                                className="divide-y divide-gray-200 "
                                key={item.id}
                            >
                                <td className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 w-2/6 ">
                                    {item.name}
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
                                    {selectedCategory === item.id && (
                                        <Modal
                                            show={showEditModal}
                                            onClose={closeEditModal}
                                        >
                                            <form
                                                onSubmit={handleSubmitEdit}
                                                className="p-6"
                                            >
                                                <h2 className="text-lg font-medium text-gray-900">
                                                    Sửa phân loại
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
                                                        value={newCategoryName}
                                                        className="mt-1 block w-3/4"
                                                        placeholder="Tên phân loại"
                                                    />
                                                </div>
                                                <div className="mt-6">
                                                    <InputLabel
                                                        htmlFor="parent_categories"
                                                        value="Parent categories"
                                                    />
                                                    <Select
                                                        id="parent_categories"
                                                        isMulti
                                                        onChange={
                                                            handleParentChange
                                                        }
                                                        options={categories.map(
                                                            (category) => ({
                                                                value: category.id,
                                                                label: category.name,
                                                            })
                                                        )}
                                                        value={categoryParent.map(
                                                            (id) => {
                                                                const Parent =
                                                                    categories.find(
                                                                        (d) =>
                                                                            d.id ===
                                                                            id
                                                                    );
                                                                return Parent
                                                                    ? {
                                                                          value: Parent.id,
                                                                          label: Parent.name,
                                                                      }
                                                                    : null;
                                                            }
                                                        )}
                                                    ></Select>
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
