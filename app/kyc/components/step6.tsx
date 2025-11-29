'use client';

interface Step6Props {
  formData: any;
  updateFormData: (data: any) => void;
}

export default function Step6({ formData, updateFormData }: Step6Props) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Company Registration Number (RC Number)
        </label>
        <input
          type="text"
          placeholder="Enter RC number"
          value={formData.registrationNumber}
          onChange={(e) => updateFormData({ registrationNumber: e.target.value })}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Date of Incorporation
        </label>
        <input
          type="date"
          value={formData.dateOfIncorporation}
          onChange={(e) => updateFormData({ dateOfIncorporation: e.target.value })}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Business Type
        </label>
        <select
          value={formData.businessType}
          onChange={(e) => updateFormData({ businessType: e.target.value })}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Select business type</option>
          <option value="limited">Limited Liability Company (LLC)</option>
          <option value="plc">Public Limited Company (PLC)</option>
          <option value="enterprise">Business Name/Enterprise</option>
          <option value="partnership">Partnership</option>
          <option value="sole">Sole Proprietorship</option>
        </select>
      </div>

      <div className="text-sm text-gray-500 bg-blue-50 p-4 rounded-lg">
        Ensure all company information matches your CAC registration documents.
      </div>
    </div>
  );
}
