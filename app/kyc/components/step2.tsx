'use client';

interface Step2Props {
  formData: any;
  updateFormData: (data: any) => void;
}

export default function Step2({ formData, updateFormData }: Step2Props) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Full Business Address
        </label>
        <input
          type="text"
          placeholder="Enter street address"
          value={formData.fullAddress}
          onChange={(e) => updateFormData({ fullAddress: e.target.value })}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            City
          </label>
          <input
            type="text"
            placeholder="Enter city"
            value={formData.city}
            onChange={(e) => updateFormData({ city: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            State
          </label>
          <input
            type="text"
            placeholder="Enter state"
            value={formData.state}
            onChange={(e) => updateFormData({ state: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Postal Code
        </label>
        <input
          type="text"
          placeholder="Enter postal code"
          value={formData.postalCode}
          onChange={(e) => updateFormData({ postalCode: e.target.value })}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="text-sm text-gray-500 bg-blue-50 p-4 rounded-lg">
        Please provide your complete business address including street, city, state, and postal code.
      </div>
    </div>
  );
}