'use client';

import { Upload, ChevronDown } from 'lucide-react';

interface Step1Props {
  formData: any;
  updateFormData: (data: any) => void;
}

export default function Step1({ formData, updateFormData }: Step1Props) {
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateFormData({ proofOfAddress: file });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Name
          </label>
          <input
            type="text"
            placeholder="Business name"
            value={formData.businessName}
            onChange={(e) => updateFormData({ businessName: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Email
          </label>
          <input
            type="email"
            placeholder="name@gmail.com"
            value={formData.businessEmail}
            onChange={(e) => updateFormData({ businessEmail: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Phone Number
          </label>
          <div className="flex gap-2">
            <div className="relative w-24">
              <div className="flex items-center gap-2 px-3 py-3 border border-gray-200 rounded-lg bg-white cursor-pointer">
                <span className="text-2xl">🇳🇬</span>
                <ChevronDown size={16} className="text-gray-400" />
              </div>
            </div>
            <input
              type="tel"
              placeholder="Enter phone number"
              value={formData.businessPhone}
              onChange={(e) => updateFormData({ businessPhone: e.target.value })}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Address
          </label>
          <input
            type="text"
            placeholder="Address"
            value={formData.businessAddress}
            onChange={(e) => updateFormData({ businessAddress: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Attach Proof Of Address
        </label>
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-12 text-center hover:border-blue-300 transition-colors cursor-pointer">
          <input
            type="file"
            id="proofOfAddress"
            className="hidden"
            onChange={handleFileUpload}
            accept=".svg,.png,.jpg,.gif"
          />
          <label htmlFor="proofOfAddress" className="cursor-pointer">
            <Upload className="mx-auto mb-4 text-gray-400" size={32} />
            <p className="text-blue-600 font-medium mb-1">Click to upload</p>
            <p className="text-sm text-gray-400">
              SVG, PNG, JPG or GIF (max. 800×400px)
            </p>
            {formData.proofOfAddress && (
              <p className="text-sm text-green-600 mt-2">
                ✓ {formData.proofOfAddress.name}
              </p>
            )}
          </label>
        </div>
      </div>
    </div>
  );
}
