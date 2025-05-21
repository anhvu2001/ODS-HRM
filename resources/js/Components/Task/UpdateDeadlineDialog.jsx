import { Dialog } from "@headlessui/react";
import axios from "axios";
import { useState } from "react";

export default function MyDialog({
    task,
    deadline,
    isDialogOpen,
    setIsDialogOpen,
    onTaskCreate,
}) {
    const handleAccepted = async () => {
        try {
            // console.log(deadline);
            // console.log(task);
            const { data } = await axios.post(
                route("update_deadline_all_task", task.id),
                { deadline: deadline }
            );
            console.log(task);
            alert(data.message);
            console.log(data.message);
            setIsDialogOpen(false);
            onTaskCreate();
        } catch (error) {
            console.log("update deadline các công việc thất bại");
            console.log(error);
        }
    };
    return (
        <Dialog
            open={isDialogOpen}
            onClose={() => setIsDialogOpen(false)}
            className="z-50 flex flex-col gap-3 bg-white absolute border-2 border-gray-500 rounded top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2"
        >
            <Dialog.Panel className="p-2 flex flex-col">
                <Dialog.Title className={"font-bold"}>
                    Xác nhận cập nhật deadline tất cả công việc
                </Dialog.Title>
                <Dialog.Description>
                    Sau khi bấm đồng ý tất cả công việc sẽ được cập nhật
                    deadline như đã chọn.
                </Dialog.Description>
                <div className="flex gap-3">
                    <button
                        className="border-2 border-gray-400 rounded-xl p-2 w-24"
                        onClick={handleAccepted}
                    >
                        Xác nhận
                    </button>
                    <button
                        className="border-2 border-gray-400 rounded-xl p-2 w-24"
                        onClick={() => setIsDialogOpen(false)}
                    >
                        Hủy
                    </button>
                </div>
            </Dialog.Panel>
        </Dialog>
    );
}
