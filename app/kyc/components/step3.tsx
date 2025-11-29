'use client';

interface Step3Props {
  formData: any;
  updateFormData: (data: any) => void;
}

export default function Step3({ formData, updateFormData }: Step3Props) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Contact Person Name
        </label>
        <input
          type="text"
          placeholder="Enter contact person full name"
          value={formData.contactPersonName}
          onChange={(e) => updateFormData({ contactPersonName: e.target.value })}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Contact Email
        </label>
        <input
          type="email"
          placeholder="contact@business.com"
          value={formData.contactEmail}
          onChange={(e) => updateFormData({ contactEmail: e.target.value })}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Contact Phone Number
        </label>
        <input
          type="tel"
          placeholder="Enter phone number"
          value={formData.contactPhone}
          onChange={(e) => updateFormData({ contactPhone: e.target.value })}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="text-sm text-gray-500 bg-blue-50 p-4 rounded-lg">
        This person will be the primary point of contact for all business communications.
      </div>
    </div>
  );
}
