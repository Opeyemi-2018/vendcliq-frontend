import React, { FC } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Shareholder) => void;
}

export interface Shareholder {
  firstname: string;
  lastname: string;
  gender: string;
  date_of_birth: string;
  phone: string;
  bank_verification_number: string;
}

const ShareholderModal: FC<ModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = React.useState<Shareholder>({
    firstname: "",
    lastname: "",
    gender: "",
    date_of_birth: "",
    phone: "",
    bank_verification_number: "",
  });

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onSubmit(formData);
    setFormData({
      firstname: "",
      lastname: "",
      gender: "",
      date_of_birth: "",
      phone: "",
      bank_verification_number: "",
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded shadow-md w-1/2">
        <h2 className="text-lg font-bold mb-4">Add Shareholder</h2>
        <div className="grid grid-cols-2 gap-4">
          <input
            name="firstname"
            placeholder="First Name"
            value={formData.firstname}
            onChange={handleChange}
            className="border p-2 rounded"
          />
          <input
            name="lastname"
            placeholder="Last Name"
            value={formData.lastname}
            onChange={handleChange}
            className="border p-2 rounded"
          />
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="border p-2 rounded"
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          <input
            type="date"
            name="date_of_birth"
            value={formData.date_of_birth}
            onChange={handleChange}
            className="border p-2 rounded"
          />
          <input
            name="phone"
            placeholder="Phone"
            value={formData.phone}
            onChange={handleChange}
            className="border p-2 rounded"
          />
          <input
            name="bank_verification_number"
            placeholder="BVN"
            value={formData.bank_verification_number}
            onChange={handleChange}
            className="border p-2 rounded"
          />
        </div>
        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded mr-2"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareholderModal;
