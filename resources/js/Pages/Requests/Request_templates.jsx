
import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import DangerButton from '@/Components/DangerButton';
import Modal from '@/Components/Modal';
import { useForm, Link } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';

export default function Request_templates({ auth, templates }) {
  const [showModal, setShowModal] = useState(false);
  const [showAddNewModal, setShowAddNewModal] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState(null);

  const { data, setData, post, processing, errors, reset } = useForm({
    template_name: '',
  });
  const openAddNewModal = () => {
    setShowAddNewModal(true);
  };
  const closeAddNewModal = () => {
    setShowAddNewModal(false);
  };
  function handleSubmit(e) {
    e.preventDefault();
    post(route('Create_Request_template'),{
      preserveScroll: true,
      onSuccess: () => closeAddNewModal(),
      onError: () => alert('Something went wrong. Please try again.'),
      onFinish: () => reset(),
    });
  }

  function handleDelete(id) {
    post(route('Delete_request_template', templateToDelete));
    setShowModal(false);
  }
  const openDeleteModal = (id) => {
    setTemplateToDelete(id);
    setShowModal(true);
  };
  const closeDeleteModal = () => setShowModal(false);


  return (
    <AuthenticatedLayout
        user={auth.user}
        header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Request Templates</h2>}
    >
        <Head title="Dashboard" />

        <div className="py-12">
            <div className="max-w-8xl mx-auto sm:px-6 lg:px-8">
                <PrimaryButton onClick={openAddNewModal} > Thêm mới Template</PrimaryButton>
                <Modal show={showAddNewModal} onClose={closeAddNewModal}>
                    <form onSubmit={handleSubmit} className="p-6">
                        <h2 className="text-lg font-medium text-gray-900">
                            Thêm mới Template
                        </h2>
                        <div className="mt-6">
                            <InputLabel htmlFor="Name" value="Name" className="sr-only" />
                            <TextInput
                                id=""
                                type="Text"
                                name="template_name"
                                required
                                value={data.template_name}
                                onChange={(e) => setData('template_name', e.target.value)}
                                className="mt-1 block w-3/4"
                                placeholder="Gõ tên template"
                            />
                            <InputError message={errors.template_name} className="mt-2" />
                        </div>
                        <div className="mt-6 flex justify-end">
                            <SecondaryButton onClick={closeAddNewModal}>Cancel</SecondaryButton>

                            <PrimaryButton className="ms-3" disabled={processing}>
                                Thêm mới Request Template
                            </PrimaryButton>
                        </div>

                    </form>
                </Modal>
                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                    <div className="p-6 text-gray-900">

                      <table className=" w-full">
                        <thead>
                          <tr>
                            <th className="px-4 py-2">Template Name</th>
                            <th className="px-4 py-2">Created At</th>
                            <th className="px-4 py-2">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {templates.map(template => (
                            <tr key={template.id}>
                              <td className="border px-4 py-2">{template.template_name}</td>
                              <td className="border px-4 py-2">{template.created_at}</td>
                              <td className="">
                                <Link
                                href={route('Detail_request_template', template.id)}
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                                  Edit Template
                                </Link>
                                <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded ml-2" onClick={() => openDeleteModal(template.id)}>
                                  Delete Template
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                </div>
            </div>
        </div>

        <Modal
          title="Delete Template"
          show={showModal}
          handleClose={() => setShowModal(false)}
        >
          <div className="p-6">
            <div className="mt-6">
                Are you sure you want to delete this template?
            </div>
            <div className="mt-6 flex justify-end">
                <SecondaryButton onClick={closeDeleteModal}>Cancel</SecondaryButton>

                <DangerButton onClick={handleDelete} className="ms-3">
                    Xóa Template
                </DangerButton>
            </div>
          </div>

        </Modal>
    </AuthenticatedLayout>
  );
}
