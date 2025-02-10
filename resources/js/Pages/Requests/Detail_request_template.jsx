import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm, Link } from "@inertiajs/react";
import { useState } from "react";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import Modal from "@/Components/Modal";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import SelectInput from "@/Components/SelectInput";

export default function Detail_template_request({
    auth,
    template,
    inputDetails,
    allLeaderAdmin,
}) {
    const [showModalAddInput, setShowModalAddInput] = useState(false);
    const openAddInputModal = () => setShowModalAddInput(true);
    const closeAddInputModal = () => setShowModalAddInput(false);

    const [showModalAddApproverse, setModalAddApproverse] = useState(false);
    const openAddApproverseInputModal = () => {
        setModalAddApproverse(true);
    };
    const closeAddApproverseInputModal = () => setModalAddApproverse(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        input_name: "",
        input_type: "",
        default_value: "",
        input_description: "",
        required: "",
        id_request_templates: template.id,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("Create_input_detail", { id: template.id }), {
            preserveScroll: true,
            onSuccess: () => {
                closeAddInputModal();
                reset();
            },
            onError: () => alert("Something went wrong. Please try again."),
            onFinish: () => reset(),
        });
    };
    const flow_of_approvers =
        template.flow_of_approvers == [] || template.flow_of_approvers == null
            ? []
            : JSON.parse(template.flow_of_approvers);
    const [approvers, setApprovers] = useState(flow_of_approvers);

    const handleAddApprover = (event) => {
        event.preventDefault();
        const valueApprover = event.target.elements.leader_admin.value;
        const approver_id = valueApprover.split("_")[0];
        const approver_name = valueApprover.split("_")[1];

        // Lấy thứ tự order dựa trên số lượng người duyệt đã có
        const order = approvers.length + 1;

        const newApprover = {
            user_id: approver_id,
            name: approver_name,
            order: order, // Thêm order vào object newApprovers
            status: 0,
        };

        // Kiểm tra nếu người duyệt đã tồn tại
        if (approvers.some((approver) => approver.user_id === approver_id)) {
            alert("Approver already exists!");
            return;
        }

        const newApprovers = [...approvers, newApprover];

        // Cập nhật mảng người duyệt
        setApprovers(newApprovers);

        // Gửi yêu cầu cập nhật
        post(
            route("Update_field_request_template", {
                id: template.id,
                field: "flow_of_approvers",
                value: JSON.stringify(newApprovers),
            }),
            {
                preserveScroll: true,
                onSuccess: () => {
                    closeAddApproverseInputModal();
                    reset();
                },
                onError: () => alert("Something went wrong. Please try again."),
                onFinish: () => reset(),
            }
        );

        event.target.reset();
    };

    const handleDeleteApprover = (index) => {
        // Tạo mảng mới và xóa người duyệt tại index
        const newApprovers = [...approvers];
        newApprovers.splice(index, 1);

        // Cập nhật lại order cho từng người duyệt
        const updatedApprovers = newApprovers.map((approver, i) => ({
            ...approver,
            order: i + 1, // Order mới là vị trí trong mảng + 1
        }));

        // Cập nhật lại state và gửi yêu cầu POST để cập nhật dữ liệu
        setApprovers(updatedApprovers);

        post(
            route("Update_field_request_template", {
                id: template.id,
                field: "flow_of_approvers",
                value: JSON.stringify(updatedApprovers),
            }),
            {
                preserveScroll: true,
                onSuccess: () => {
                    closeAddApproverseInputModal();
                    reset();
                },
                onError: () => alert("Something went wrong. Please try again."),
                onFinish: () => reset(),
            }
        );
    };

    /**
     * Handle event select input type
     */
    const [inputType, setInputType] = useState(null);

    const handleSelectChange = (value) => {
        setInputType(value);
        setData("input_type", value); // Uncomment this if you still need to call setData
    };
    /**
     * Handle edit input
     */
    const [showModalEditInputDetail, setShowModalEditInputDetail] =
        useState(false);
    const [inputData, setInputData] = useState(null);
    const openModalEditInputDetail = (input) => {
        setInputData(input); // Set the data you want to pass to the modal
        setShowModalEditInputDetail(true); // Show the modal
    };
    const closeModalEditInputDetail = () => setShowModalEditInputDetail(false);
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Detail {template.template_name}
                </h2>
            }
        >
            <Head title="Detail Template" />

            <div className="pt-12">
                <div className="max-w-8xl mx-auto sm:px-6 lg:px-8">
                    <div className="mx-6 bg-white overflow-hidden shadow-sm sm:rounded-lg divide-y">
                        <div className="p-6 flex place-content-around">
                            <h2>
                                Danh sách các input trong form{" "}
                                <b>{template.template_name}</b>
                            </h2>
                            <PrimaryButton
                                onClick={openAddInputModal}
                                className="float-right space-around"
                            >
                                + Add
                            </PrimaryButton>
                            <Modal show={showModalAddInput} onClose={false}>
                                <form onSubmit={handleSubmit} className="p-6">
                                    <h2 className="text-lg font-medium text-gray-900">
                                        Thêm mới Input
                                    </h2>
                                    <hr />
                                    <div className="mt-6">
                                        <InputLabel
                                            htmlFor="type_input"
                                            value="Chọn loại input ?"
                                        />

                                        <SelectInput
                                            id="input_type"
                                            name="input_type"
                                            placeholder="Chọn loại input"
                                            value={data.input_type}
                                            onChange={handleSelectChange}
                                            options={[
                                                {
                                                    value: "title",
                                                    label: "Title",
                                                },
                                                {
                                                    value: "email",
                                                    label: "Email",
                                                },
                                                {
                                                    value: "number",
                                                    label: "Số",
                                                },
                                                {
                                                    value: "text",
                                                    label: "Text một dòng",
                                                },
                                                {
                                                    value: "textarea",
                                                    label: "Text nhiều dòng",
                                                },
                                                {
                                                    value: "datetime-local",
                                                    label: "Ngày tháng",
                                                },
                                                { value: "time", label: "Giờ" },
                                                {
                                                    value: "file",
                                                    label: "File",
                                                },
                                                {
                                                    value: "select",
                                                    label: "Select",
                                                },
                                                //   { value: 'follower', label: 'Người theo dõi' },
                                                {
                                                    value: "approver",
                                                    label: "Người duyệt trực tiếp",
                                                },
                                            ]}
                                        />
                                    </div>
                                    {inputType === "select" && (
                                        <div className="mt-6">
                                            <InputError
                                                message={
                                                    "Mỗi giá trị cách nhau bằng 1 dấu phẩy"
                                                }
                                                className="mt-2"
                                            />
                                            <textarea
                                                onChange={(e) => {
                                                    setData(
                                                        "default_value",
                                                        e.target.value
                                                    );
                                                }}
                                                name="default_value"
                                                id=""
                                                cols="30"
                                                rows="10"
                                                placeholder="Ví dụ: giatri1,giatri2"
                                                className="block w-3/4"
                                            >
                                                {data.default_value}
                                            </textarea>
                                        </div>
                                    )}
                                    <div className="mt-6">
                                        <InputLabel
                                            htmlFor="input_description"
                                            value="Input Description"
                                        />
                                        <TextInput
                                            id="Name"
                                            type="Text"
                                            name="input_description"
                                            value={data.input_description}
                                            onChange={(e) =>
                                                setData(
                                                    "input_description",
                                                    e.target.value
                                                )
                                            }
                                            className="mt-1 block w-3/4"
                                            placeholder="Input Description"
                                        />
                                        <InputError
                                            message={errors.input_name}
                                            className="mt-2"
                                        />
                                    </div>
                                    <div className="mt-6">
                                        <InputLabel
                                            htmlFor="name_of_input"
                                            value="Tên tham chiếu (gõ không dấu, không dấu các ví dụ nem_cha)"
                                        />
                                        <TextInput
                                            id="name_of_input"
                                            type="Text"
                                            name="input_name"
                                            required
                                            value={data.input_name}
                                            onChange={(e) =>
                                                setData(
                                                    "input_name",
                                                    e.target.value
                                                )
                                            }
                                            className="mt-1 block w-3/4"
                                            placeholder="Tên Tham chiếu *"
                                        />
                                        <InputError
                                            message={errors.input_name}
                                            className="mt-2"
                                        />
                                    </div>
                                    <div className="mt-6">
                                        <InputLabel
                                            htmlFor="required_input"
                                            value="Required ?"
                                        />

                                        <SelectInput
                                            id="required_input"
                                            name="required"
                                            required
                                            value={data.required}
                                            placeholder="Có bắt buộc không? *"
                                            onChange={(value_of_select) =>
                                                setData(
                                                    "required",
                                                    value_of_select
                                                )
                                            }
                                            options={[
                                                {
                                                    value: "1",
                                                    label: "Bắt buộc",
                                                },
                                                {
                                                    value: "0",
                                                    label: "Không bắt buộc",
                                                },
                                            ]}
                                        />
                                    </div>
                                    <div className="mt-6 flex justify-end">
                                        <SecondaryButton
                                            onClick={closeAddInputModal}
                                        >
                                            Cancel
                                        </SecondaryButton>
                                        <PrimaryButton
                                            className="ms-3"
                                            disabled={processing}
                                        >
                                            Thêm mới Input
                                        </PrimaryButton>
                                    </div>
                                </form>
                            </Modal>
                            <hr />
                        </div>
                        <div className="p-6">
                            <h3>Danh sách Input</h3>
                            <table className="w-full">
                                <thead>
                                    <tr>
                                        <th className="px-4 py-2">Name</th>
                                        <th className="px-4 py-2">Type</th>
                                        <th className="px-4 py-2">
                                            Description
                                        </th>
                                        <th className="px-4 py-2">Required</th>
                                        <th className="px-4 py-2">Priority</th>
                                        <th className="px-4 py-2">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {inputDetails.map((input) => (
                                        <tr key={input.id}>
                                            <td className="border px-4 py-2">
                                                {input.input_name}
                                            </td>
                                            <td className="border px-4 py-2">
                                                {input.input_type}
                                            </td>
                                            <td className="border px-4 py-2">
                                                {input.input_description}
                                            </td>
                                            <td className="border px-4 py-2">
                                                {input.required
                                                    ? "Bắt buộc"
                                                    : "Không bắt buộc"}
                                            </td>
                                            <td className="border px-4 py-2">
                                                {" "}
                                                {input.priority}
                                            </td>
                                            <td className="border px-4 py-2">
                                                <button
                                                    onClick={() =>
                                                        openModalEditInputDetail(
                                                            input
                                                        )
                                                    }
                                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                                >
                                                    Edit
                                                </button>
                                                <Link
                                                    as="button"
                                                    method="POST"
                                                    href={route(
                                                        "Delete_input_detail",
                                                        {
                                                            id: template.id,
                                                            input_id: input.id,
                                                        }
                                                    )}
                                                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded ml-2"
                                                >
                                                    Delete
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <Modal
                                show={showModalEditInputDetail}
                                onClose={closeModalEditInputDetail}
                            >
                                <form className="p-6">
                                    <h2 className="text-lg font-medium text-gray-900">
                                        Edit Input
                                    </h2>
                                    <hr />
                                    {inputData && inputData.input_type}
                                </form>
                            </Modal>
                        </div>
                    </div>
                </div>
            </div>
            <div className="pt-2">
                <div className="max-w-8xl mx-auto sm:px-6 lg:px-8">
                    <div className="mx-6 bg-white overflow-hidden shadow-sm sm:rounded-lg divide-y">
                        <div className="p-6 flex place-content-around">
                            <h2>Các bước duyệt</h2>
                            <PrimaryButton
                                onClick={openAddApproverseInputModal}
                                className="float-right space-around"
                            >
                                + Thêm người duyệt
                            </PrimaryButton>
                            <Modal
                                show={showModalAddApproverse}
                                onClose={closeAddApproverseInputModal}
                            >
                                <form
                                    className="p-6"
                                    onSubmit={handleAddApprover}
                                >
                                    <div className="mt-6">
                                        <InputLabel
                                            htmlFor="leader_id"
                                            value="Chọn người duyệt"
                                        />
                                        <InputError
                                            message={errors.leader_id}
                                            className="mt-2"
                                        />
                                        <select name="leader_admin">
                                            <option value="qltt">
                                                Quản lý trực tiếp
                                            </option>
                                            <option value="hr">Nhân sự</option>
                                            <option value="ceo">CEO</option>
                                            {allLeaderAdmin.map((leader) => (
                                                <option
                                                    key={leader.id}
                                                    value={
                                                        leader.id +
                                                        "_" +
                                                        leader.name
                                                    }
                                                >
                                                    {leader.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* <div className="mt-6">
                              <InputLabel htmlFor="date_submit" value="Date Submit" />
                              <TextInput
                                required
                                id="date_submit"
                                type="date"
                                name="date_submit"
                                className="mt-1 block w-3/4"
                                placeholder="Date Submit"
                              />
                            </div> */}
                                    <div className="mt-6 flex justify-end">
                                        <SecondaryButton
                                            onClick={
                                                closeAddApproverseInputModal
                                            }
                                        >
                                            Cancel
                                        </SecondaryButton>
                                        <PrimaryButton
                                            className="ms-3"
                                            disabled={processing}
                                        >
                                            Thêm mới người duyệt
                                        </PrimaryButton>
                                    </div>
                                </form>
                            </Modal>
                        </div>
                        <hr />
                        <div className="p-6">
                            <h3>Danh sách người duyệt </h3>

                            <table className="w-full">
                                <thead>
                                    <tr>
                                        <th className="px-4 py-2">
                                            Thứ tự Duyệt
                                        </th>
                                        <th className="px-4 py-2">User ID</th>
                                        <th className="px-4 py-2">Name</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {approvers.map((approver, index) => (
                                        <tr key={index}>
                                            <td className="border px-4 py-2">
                                                {index + 1}
                                            </td>
                                            <td className="border px-4 py-2">
                                                {approver.user_id}
                                            </td>
                                            <td className="border px-4 py-2">
                                                {approver.name}
                                            </td>
                                            <td>
                                                <button
                                                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                                                    onClick={() =>
                                                        handleDeleteApprover(
                                                            index
                                                        )
                                                    }
                                                >
                                                    X
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <hr />
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
